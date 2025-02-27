// core/initialization/queue/InitializationQueue.js
import { coreLogger } from '../../core/logging/CoreLogger';
import { LOG_LEVELS } from '../../reducers/metadata/metadataReducer';

/**
 * Classe responsável por gerenciar a inicialização sequencial de serviços
 * respeitando as dependências entre eles
 */
class InitializationQueue {
  constructor() {
    this.queue = new Map();
    this.processing = new Set();
    this.completed = new Set();
    
    // Registrar para telemetria e depuração
    coreLogger.logEvent('InitializationQueue', LOG_LEVELS.INITIALIZATION, 'Queue created');
  }

  /**
   * Enfileira uma operação de inicialização, respeitando dependências
   * @param {string} serviceName - Nome do serviço
   * @param {Function} operation - Função de inicialização
   * @param {Array<string>} dependencies - Serviços dos quais este depende
   */
  async enqueue(serviceName, operation, dependencies = []) {
    // Se já está processando, retorna a promise existente
    if (this.processing.has(serviceName)) {
      coreLogger.logEvent('InitializationQueue', LOG_LEVELS.INFO, 
        `Service ${serviceName} already processing, reusing promise`);
      return this.queue.get(serviceName);
    }
    
    // Se já completou, retorna imediatamente
    if (this.completed.has(serviceName)) {
      coreLogger.logEvent('InitializationQueue', LOG_LEVELS.INFO, 
        `Service ${serviceName} already completed`);
      return Promise.resolve();
    }
    
    // Cria uma promise para esta operação
    const promise = this.executeWithDependencies(serviceName, operation, dependencies);
    this.queue.set(serviceName, promise);
    
    coreLogger.logEvent('InitializationQueue', LOG_LEVELS.INFO, 
      `Service ${serviceName} enqueued with ${dependencies.length} dependencies`);
    
    return promise;
  }

  /**
   * Executa uma operação após suas dependências serem satisfeitas
   * @private
   */
  async executeWithDependencies(serviceName, operation, dependencies) {
    coreLogger.logEvent('InitializationQueue', LOG_LEVELS.INFO, 
      `Preparing to execute ${serviceName} with dependencies: ${dependencies.join(', ')}`);
    
    try {
      // Marca como em processamento
      this.processing.add(serviceName);
      
      // Aguarda todas as dependências serem completadas
      if (dependencies.length > 0) {
        coreLogger.logEvent('InitializationQueue', LOG_LEVELS.INFO, 
          `Waiting for dependencies of ${serviceName}`);
        
        // Para cada dependência, espera que ela seja completada
        await Promise.all(
          dependencies.map(dep => {
            // Se a dependência já foi completada, não precisa esperar
            if (this.completed.has(dep)) {
              return Promise.resolve();
            }
            // Se a dependência está na fila, espera por ela
            if (this.queue.has(dep)) {
              return this.queue.get(dep);
            }
            // Se a dependência não está na fila, registra erro
            coreLogger.logEvent('InitializationQueue', LOG_LEVELS.ERROR, 
              `Dependency ${dep} for service ${serviceName} is not in queue or completed`);
            return Promise.reject(new Error(`Missing dependency: ${dep}`));
          })
        );
      }
      
      // Todas as dependências estão completas, executa a operação
      coreLogger.logEvent('InitializationQueue', LOG_LEVELS.INFO, 
        `Executing ${serviceName}`);
      const result = await operation();
      
      // Marca como completo
      this.completed.add(serviceName);
      this.processing.delete(serviceName);
      
      coreLogger.logEvent('InitializationQueue', LOG_LEVELS.INITIALIZATION, 
        `Service ${serviceName} initialized successfully`);
      return result;
    } catch (error) {
      // Em caso de erro, remove do processamento
      this.processing.delete(serviceName);
      
      coreLogger.logEvent('InitializationQueue', LOG_LEVELS.ERROR, 
        `Service ${serviceName} failed to initialize: ${error.message}`, { error });
      throw error;
    } finally {
      // Remove da fila após processamento
      this.queue.delete(serviceName);
    }
  }

  /**
   * Verifica se um serviço foi concluído
   * @param {string} serviceName - Nome do serviço
   * @returns {boolean} - True se o serviço foi concluído com sucesso
   */
  isCompleted(serviceName) {
    return this.completed.has(serviceName);
  }

  /**
   * Marca um serviço como concluído externamente
   * @param {string} serviceName - Nome do serviço
   */
  markAsCompleted(serviceName) {
    if (!this.completed.has(serviceName)) {
      this.completed.add(serviceName);
      coreLogger.logEvent('InitializationQueue', LOG_LEVELS.INFO, 
        `Service ${serviceName} marked as completed externally`);
    }
  }

  /**
   * Registra um erro de inicialização para um serviço
   * @param {string} serviceName - Nome do serviço
   * @param {Error} error - Erro que ocorreu
   */
  registerError(serviceName, error) {
    this.processing.delete(serviceName);
    this.queue.delete(serviceName);
    
    coreLogger.logEvent('InitializationQueue', LOG_LEVELS.ERROR, 
      `Service ${serviceName} initialization error registered: ${error.message}`, { error });
  }

  /**
   * Limpa a fila e reinicia
   */
  reset() {
    this.queue.clear();
    this.processing.clear();
    this.completed.clear();
    
    coreLogger.logEvent('InitializationQueue', LOG_LEVELS.INFO, 
      'Initialization queue reset');
  }

  /**
   * Verifica se há dependências circulares no grafo de serviços
   * @param {Object} services - Mapa de serviços e suas dependências
   * @returns {boolean} - True se o grafo não tem ciclos
   * @throws {Error} - Se um ciclo for detectado
   */
  static validateDependencyGraph(services) {
    const visited = new Set();
    const recStack = new Set();
    
    function checkCycle(node, adjacencyList) {
      if (!visited.has(node)) {
        visited.add(node);
        recStack.add(node);
        
        const neighbors = adjacencyList[node] || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor) && checkCycle(neighbor, adjacencyList)) {
            return true;
          } else if (recStack.has(neighbor)) {
            return true;
          }
        }
      }
      recStack.delete(node);
      return false;
    }
    
    // Constrói lista de adjacência
    const adjacencyList = {};
    Object.entries(services).forEach(([service, config]) => {
      adjacencyList[service] = config.dependencies || [];
    });
    
    // Verifica ciclos para cada nó
    for (const service in services) {
      if (checkCycle(service, adjacencyList)) {
        throw new Error(`Circular dependency detected involving service: ${service}`);
      }
    }
    
    return true;
  }

  /**
   * Calcula uma ordem de inicialização válida para os serviços
   * @param {Object} services - Mapa de serviços e suas dependências
   * @returns {Array<string>} - Array de nomes de serviços na ordem em que devem ser inicializados
   */
  static calculateInitializationOrder(services) {
    // Primeiro, valida o grafo
    InitializationQueue.validateDependencyGraph(services);
    
    // Implementa ordenação topológica
    const result = [];
    const visited = new Set();
    const adjacencyList = {};
    
    // Constrói lista de adjacência
    Object.entries(services).forEach(([service, config]) => {
      adjacencyList[service] = config.dependencies || [];
    });
    
    function dfs(node) {
      visited.add(node);
      
      const neighbors = adjacencyList[node] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        }
      }
      
      result.push(node);
    }
    
    // Executa DFS para cada nó não visitado
    for (const service in services) {
      if (!visited.has(service)) {
        dfs(service);
      }
    }
    
    // Inverte o resultado para obter a ordem correta
    return result.reverse();
  }
}

// Exporta uma instância singleton
export default new InitializationQueue();