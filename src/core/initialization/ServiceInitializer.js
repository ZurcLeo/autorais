// src/core/initialization/ServiceInitializer.js
import { SERVICE_METADATA } from '../../reducers/metadata/metadataReducer';
import { serviceEventHub, serviceLocator } from '../services/BaseService';
import { InitializationState } from '../constants/initialState';
import { SERVICE_ACTIONS } from '../constants/actions';
import { LOG_LEVELS } from '../constants/config';
import { coreLogger } from '../logging/CoreLogger';
import { retryManager } from '../resilience/RetryManager';
import { 
  getInitializationOrder, 
  resolveCircularDependencies, 
  areDependenciesReady 
} from './initializationUtils';

/**
 * Classe responsável pela inicialização coordenada de serviços
 * com suporte para dependências, fases e resiliência.
 */
class ServiceInitializer {
  constructor() {
    // Estruturas de dados para rastreamento do estado
    this.initializationStatus = new Map();
    this.registeredServices = new Map();
    this.initPromises = new Map();
    
    // Handler de mudança de estado
    this.stateChangeHandler = null;
    
    // Estado de execução
    this.isInitializing = false;
    this.initializationPromise = null;
    
    coreLogger.logEvent('ServiceInitializer', LOG_LEVELS.INITIALIZATION, 'ServiceInitializer criado');
  }

  /**
   * Define um handler para mudanças de estado dos serviços
   * @param {Function} handler Função que recebe (serviceName, status, error)
   */
  setStateChangeHandler(handler) {
    this.stateChangeHandler = handler;
  }

  /**
   * Notifica sobre mudança de estado de um serviço
   * @private
   */
  _notifyStatusChange(serviceName, status, error = null) {
    // Notificar o handler, se existir
    if (this.stateChangeHandler) {
      this.stateChangeHandler(serviceName, status, error?.message);
    }
    
    // Emitir evento para o sistema
    serviceEventHub.emit('initialization', SERVICE_ACTIONS.UPDATE_INITIALIZATION_STATE, {
      serviceName,
      status,
      error: error ? error.message : null,
      timestamp: new Date().toISOString()
    });
    
    // Emitir eventos específicos por status
    if (status === InitializationState.READY) {
      serviceEventHub.emit('initialization', SERVICE_ACTIONS.SERVICE_READY, {
        serviceName,
        timestamp: new Date().toISOString()
      });
    } else if (status === InitializationState.FAILED) {
      serviceEventHub.emit('initialization', SERVICE_ACTIONS.SERVICE_ERROR, {
        serviceName,
        error: error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Registra um serviço para inicialização
   * @param {string} serviceName Nome do serviço
   * @param {Object} serviceInstance Instância do serviço
   * @param {Object} options Opções de configuração
   * @returns {ServiceInitializer} this para encadeamento
   */
  registerService(serviceName, serviceInstance, options = {}) {
    // Verificar se já está registrado
    if (this.registeredServices.has(serviceName)) {
      coreLogger.logEvent(
        'ServiceInitializer', 
        LOG_LEVELS.WARNING, 
        `Serviço ${serviceName} já registrado, atualizando configuração`,
        { serviceName }
      );
      
      // Atualizar opções do serviço existente
      const existingService = this.registeredServices.get(serviceName);
      existingService.options = { ...existingService.options, ...options };
      return this;
    }
    
    // Mesclar com metadados existentes
    const serviceMetadata = SERVICE_METADATA[serviceName] || {};
    const mergedOptions = {
      dependencies: options.dependencies || serviceMetadata.dependencies || [],
      criticalPath: options.criticalPath || serviceMetadata.criticalPath || false,
      phase: options.phase || serviceMetadata.phase || 'FEATURES',
      order: options.order || serviceMetadata.order || 0,
      ...serviceMetadata,
      ...options
    };
    
    // Registrar o serviço
    this.registeredServices.set(serviceName, {
      instance: serviceInstance,
      status: InitializationState.PENDING,
      options: mergedOptions,
      error: null
    });
    
    // Atualizar status de inicialização
    this.initializationStatus.set(serviceName, {
      status: InitializationState.PENDING,
      timestamp: new Date().toISOString()
    });
    
    coreLogger.logEvent('ServiceInitializer', LOG_LEVELS.INFO, `Serviço ${serviceName} registrado`, {
      dependencies: mergedOptions.dependencies,
      criticalPath: mergedOptions.criticalPath,
      phase: mergedOptions.phase
    });
    
    return this;
  }

  /**
   * Verifica se um serviço está pronto
   * @param {string} serviceName Nome do serviço
   * @returns {boolean} True se o serviço estiver pronto
   */
  isServiceReady(serviceName) {
    const serviceData = this.registeredServices.get(serviceName);
    
    if (!serviceData) {
      return false;
    }
    
    return serviceData.status === InitializationState.READY;
  }

  /**
   * Obtém o erro de inicialização de um serviço
   * @param {string} serviceName Nome do serviço
   * @returns {string|null} Mensagem de erro ou null
   */
  getServiceError(serviceName) {
    const serviceData = this.registeredServices.get(serviceName);
    
    if (!serviceData) {
      return null;
    }
    
    return serviceData.error;
  }

  /**
   * Obtém a instância de um serviço, inicializando-o se necessário
   * @param {string} serviceName Nome do serviço
   * @returns {Promise<Object>} Instância do serviço inicializada
   */
  async getService(serviceName) {
    // Verificar se o serviço está registrado
    if (!this.registeredServices.has(serviceName)) {
      throw new Error(`Serviço ${serviceName} não está registrado`);
    }
    
    // Se já temos uma promessa em andamento, retornar ela
    if (this.initPromises.has(serviceName)) {
      return this.initPromises.get(serviceName);
    }
    
    const serviceData = this.registeredServices.get(serviceName);
    
    // Se o serviço já está pronto, retornar imediatamente
    if (serviceData.status === InitializationState.READY) {
      return Promise.resolve(serviceData.instance);
    }
    
    // Criar uma promessa para inicialização
    const initPromise = this._initializeServiceWithDependencies(serviceName);
    
    // Armazenar a promessa para evitar múltiplas inicializações
    this.initPromises.set(serviceName, initPromise);
    
    return initPromise;
  }

  /**
   * Inicializa um serviço e suas dependências
   * @private
   * @param {string} serviceName Nome do serviço
   * @returns {Promise<Object>} Instância do serviço inicializada
   */
  async _initializeServiceWithDependencies(serviceName) {
    const serviceData = this.registeredServices.get(serviceName);
    
    if (!serviceData) {
      throw new Error(`Serviço ${serviceName} não está registrado`);
    }
    
    try {
      // Atualizar status
      serviceData.status = InitializationState.INITIALIZING;
      this._notifyStatusChange(serviceName, InitializationState.INITIALIZING);
      
      // Inicializar dependências primeiro
      const dependencies = serviceData.options.dependencies || [];
      const dependencyPromises = dependencies.map(dep => this.getService(dep));
      
      await Promise.all(dependencyPromises);
      
      // Agora inicializar o próprio serviço
      await this._initializeService(serviceName);
      
      // Limpar a promessa de inicialização
      this.initPromises.delete(serviceName);
      
      return serviceData.instance;
    } catch (error) {
      // Em caso de erro, atualizar status e propagar o erro
      serviceData.status = InitializationState.FAILED;
      serviceData.error = error.message;
      
      this._notifyStatusChange(serviceName, InitializationState.FAILED, error);
      
      // Limpar a promessa de inicialização
      this.initPromises.delete(serviceName);
      
      // Para serviços críticos, propagar o erro
      if (serviceData.options.criticalPath) {
        throw error;
      }
      
      // Para serviços não-críticos, retornar a instância mesmo com erro
      return serviceData.instance;
    }
  }

  /**
   * Inicializa um único serviço usando o RetryManager
   * @private
   * @param {string} serviceName Nome do serviço
   * @returns {Promise<boolean>} True se inicializado com sucesso
   */
  async _initializeService(serviceName) {
    const serviceData = this.registeredServices.get(serviceName);
    
    if (!serviceData) {
      throw new Error(`Serviço ${serviceName} não está registrado`);
    }
    
    const startTime = performance.now();
    const { instance, options } = serviceData;
    
    // coreLogger.logEvent('ServiceInitializer', LOG_LEVELS.INFO, `Iniciando inicialização do serviço ${serviceName}`);
    
    try {
      // Usar RetryManager para resiliência
      await retryManager.retryWithBackoff(
        serviceName,
        async () => {
          if (typeof instance.initialize === 'function') {
            await instance.initialize();
          } else {
            throw new Error(`Serviço ${serviceName} não implementa o método initialize()`);
          }
          return true;
        },
        {
          maxRetries: options.criticalPath ? 5 : 3,
          baseDelay: 1000,
          maxDelay: 15000,
          servicePriority: options.criticalPath ? 'critical' : 'normal'
        }
      );
      
      const duration = performance.now() - startTime;
      
      // Atualizar status
      serviceData.status = InitializationState.READY;
      
      coreLogger.logEvent('ServiceInitializer', LOG_LEVELS.INFO, 
        `Serviço ${serviceName} inicializado com sucesso em ${duration.toFixed(2)}ms`);
      
      this._notifyStatusChange(serviceName, InitializationState.READY);
      
      return true;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      coreLogger.logServiceError('ServiceInitializer', error, {
        serviceName,
        duration: duration.toFixed(2),
        phase: 'initialization'
      });
      
      // Atualizar status
      serviceData.status = InitializationState.FAILED;
      serviceData.error = error.message;
      
      this._notifyStatusChange(serviceName, InitializationState.FAILED, error);
      
      throw error;
    }
  }

  /**
   * Inicializa todos os serviços registrados em ordem apropriada
   * @returns {Promise<boolean>} True se todos os serviços críticos foram inicializados
   */
  async initializeAllServices() {
    // Evitar inicialização concorrente
    if (this.isInitializing) {
      return this.initializationPromise;
    }
    
    this.isInitializing = true;
    
    this.initializationPromise = (async () => {
      const startTime = performance.now();
      
      coreLogger.logEvent('ServiceInitializer', LOG_LEVELS.INFO, 'Iniciando inicialização de todos os serviços');
      
      try {
        // Resolver quaisquer dependências circulares
        const { resolvedMetadata } = resolveCircularDependencies();
        
        if (resolvedMetadata) {
          // Atualizar dependências dos serviços registrados
          for (const [serviceName, metadata] of Object.entries(resolvedMetadata)) {
            if (this.registeredServices.has(serviceName)) {
              const serviceData = this.registeredServices.get(serviceName);
              serviceData.options.dependencies = metadata.dependencies || [];
            }
          }
        }
        
        // Obter ordem de inicialização
        const initOrder = getInitializationOrder();
        
        // Iniciar serviços em ordem
        for (const serviceName of initOrder) {
          // Verificar se o serviço está registrado
          if (!this.registeredServices.has(serviceName)) {
            continue;
          }
          
          // Verificar se já está pronto
          const serviceData = this.registeredServices.get(serviceName);
          if (serviceData.status === InitializationState.READY) {
            continue;
          }
          
          // Verificar se as dependências estão prontas
          if (!areDependenciesReady(serviceName, 
              Object.fromEntries(
                Array.from(this.registeredServices.entries())
                  .map(([name, data]) => [name, { status: data.status }])
              )
          )) {
            // Dependências não estão prontas, tentar inicializar mais tarde
            coreLogger.logEvent('ServiceInitializer', LOG_LEVELS.WARNING,
              `Pulando inicialização de ${serviceName}: dependências não estão prontas`);
            continue;
          }
          
          try {
            // Inicializar serviço
            await this._initializeServiceWithDependencies(serviceName);
          } catch (error) {
            // Se for um serviço crítico, propagar o erro
            if (serviceData.options.criticalPath) {
              throw error;
            }
            
            // Para serviços não-críticos, continuar com os próximos
            coreLogger.logEvent('ServiceInitializer', LOG_LEVELS.ERROR,
              `Falha ao inicializar serviço não-crítico ${serviceName}: ${error.message}`);
          }
        }
        
        // Verificar serviços críticos
        const criticalServices = Array.from(this.registeredServices.entries())
          .filter(([_, data]) => data.options.criticalPath)
          .map(([name, _]) => name);
        
        const failedCritical = criticalServices.filter(name => {
          const data = this.registeredServices.get(name);
          return data && data.status === InitializationState.FAILED;
        });
        
        if (failedCritical.length > 0) {
          throw new Error(`Falha em serviços críticos: ${failedCritical.join(', ')}`);
        }
        
        const duration = performance.now() - startTime;
        
        coreLogger.logEvent('ServiceInitializer', LOG_LEVELS.INFO,
          `Inicialização completa em ${duration.toFixed(2)}ms`);
        
        return true;
      } catch (error) {
        const duration = performance.now() - startTime;
        
        coreLogger.logServiceError('ServiceInitializer', error, {
          phase: 'initializeAllServices',
          duration: duration.toFixed(2)
        });
        
        // Emitir evento de falha crítica
        serviceEventHub.emit('initialization', SERVICE_ACTIONS.CRITICAL_FAILURE, {
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        throw error;
      } finally {
        this.isInitializing = false;
      }
    })();
    
    return this.initializationPromise;
  }

  /**
   * Reset the initializer to its initial state
   */
  reset() {
    this.initializationStatus.clear();
    this.initPromises.clear();
    
    // Reset service states to pending
    for (const [serviceName, serviceData] of this.registeredServices.entries()) {
      serviceData.status = InitializationState.PENDING;
      serviceData.error = null;
      
      this._notifyStatusChange(serviceName, InitializationState.PENDING);
    }
    
    this.isInitializing = false;
    this.initializationPromise = null;
    
    coreLogger.logEvent('ServiceInitializer', LOG_LEVELS.INFO, 'ServiceInitializer resetado');
  }
}

// Exporta uma instância singleton do ServiceInitializer
export const serviceInitializer = new ServiceInitializer();