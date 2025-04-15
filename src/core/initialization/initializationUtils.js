// src/core/initialization/utils/initializationUtils.js
import { coreLogger } from './../logging/CoreLogger';
import { SERVICE_METADATA } from '../../reducers/metadata/metadataReducer';
import { InitializationState } from '../../core/constants/initialState';

/**
 * Verifica se a inicialização está completa (todos os serviços obrigatórios estão prontos)
 * @param {Object} servicesState Estado atual dos serviços
 * @param {Array} requiredServices Lista opcional de serviços que devem estar prontos
 * @returns {Boolean} True se a inicialização estiver completa
 */
export const isInitializationComplete = (servicesState, requiredServices = null) => {
  if (!servicesState) return false;
  
  // Se não fornecido, use apenas serviços marcados como críticos no metadata
  const servicesToCheck = requiredServices || 
    Object.entries(SERVICE_METADATA)
      .filter(([_, metadata]) => metadata?.criticalPath)
      .map(([name]) => name);
  
  return servicesToCheck.every(
    serviceName => servicesState[serviceName]?.status === InitializationState.READY
  );
};

/**
 * Verifica se ocorreu alguma falha crítica na inicialização
 * @param {Object} servicesState Estado atual dos serviços
 * @returns {Boolean} True se houver falha crítica
 */
export const hasCriticalFailure = (servicesState) => {
  if (!servicesState) return false;
  
  return Object.entries(servicesState).some(([serviceName, serviceState]) => 
    serviceState.status === InitializationState.FAILED && 
    SERVICE_METADATA[serviceName]?.criticalPath
  );
};

/**
 * Verifica se as dependências de um serviço estão prontas
 * @param {String} serviceName Nome do serviço
 * @param {Object} servicesState Estado atual dos serviços
 * @returns {Boolean} True se as dependências estiverem prontas
 */
export const areDependenciesReady = (serviceName, servicesState) => {
  if (!servicesState || !SERVICE_METADATA[serviceName]) return true;
  
  const dependencies = SERVICE_METADATA[serviceName].dependencies || [];
  return dependencies.every(dep => 
    servicesState[dep]?.status === InitializationState.READY
  );
};

/**
 * Obtém serviços agrupados por fase
 * @param {String} phase Nome da fase (opcional)
 * @returns {Object|Array} Serviços agrupados por fase ou lista de serviços da fase especificada
 */
export const getServicesByPhase = (phase = null) => {
  const result = {};
  
  Object.entries(SERVICE_METADATA).forEach(([serviceName, metadata]) => {
    const servicePhase = metadata.phase || 'unknown';
    
    if (phase && servicePhase !== phase) return;
    
    if (!result[servicePhase]) {
      result[servicePhase] = [];
    }
    
    result[servicePhase].push(serviceName);
  });
  
  return phase ? result[phase] || [] : result;
};

/**
 * Verifica se há ciclos de dependência nos serviços e tenta resolvê-los
 * @returns {Object} Resultado da verificação e resolução
 */
export const resolveCircularDependencies = () => {
  const visited = new Set();
  const recursionStack = new Set();
  const circularDependencies = [];
  const metadata = {...SERVICE_METADATA};
  let modified = false;
  
  // Função para detectar ciclos
  function detectCircular(serviceName, path = []) {
    if (recursionStack.has(serviceName)) {
      const cycle = [...path, serviceName];
      circularDependencies.push({
        cycle: cycle.join(' -> '),
        services: [...cycle]
      });
      return true;
    }
    
    if (visited.has(serviceName)) return false;
    
    visited.add(serviceName);
    recursionStack.add(serviceName);
    
    const dependencies = metadata[serviceName]?.dependencies || [];
    
    for (const dep of dependencies) {
      if (detectCircular(dep, [...path, serviceName])) {
        // Continuar checando outras dependências
        continue;
      }
    }
    
    recursionStack.delete(serviceName);
    return false;
  }
  
  // Checar todos os serviços
  for (const serviceName of Object.keys(metadata)) {
    visited.clear();
    recursionStack.clear();
    detectCircular(serviceName);
  }
  
  // Se encontrou ciclos, tentar resolver
  if (circularDependencies.length > 0) {
    circularDependencies.forEach(cycle => {
      // Identificar o elo mais fraco baseado na criticidade
      const services = cycle.services;
      let weakestLink = { name: services[0], priority: Infinity };
      
      for (const serviceName of services) {
        const isCritical = metadata[serviceName]?.criticalPath || false;
        const priority = isCritical ? 10 : 1;
        
        if (priority < weakestLink.priority) {
          weakestLink.name = serviceName;
          weakestLink.priority = priority;
        }
      }
      
      // Quebrar o ciclo removendo uma dependência do elo mais fraco
      const weakestServiceIndex = services.indexOf(weakestLink.name);
      if (weakestServiceIndex >= 0) {
        const nextService = services[(weakestServiceIndex + 1) % services.length];
        
        // Remover a dependência
        if (metadata[weakestLink.name]?.dependencies?.includes(nextService)) {
          metadata[weakestLink.name].dependencies = 
            metadata[weakestLink.name].dependencies.filter(d => d !== nextService);
          
          modified = true;
          
          coreLogger.logEvent('Initialization', 'WARNING', 
            `Dependência circular resolvida: removida dependência ${nextService} de ${weakestLink.name}`, 
            { cycle: cycle.cycle });
        }
      }
    });
  }
  
  return {
    hasCircularDependencies: circularDependencies.length > 0,
    circularDependencies: circularDependencies,
    resolvedMetadata: modified ? metadata : null
  };
};

/**
 * Obtém a ordem de inicialização otimizada para os serviços
 * @returns {Array} Lista ordenada de nomes de serviços
 */
export const getInitializationOrder = () => {
  const visited = new Set();
  const result = [];
  
  // Primeiro, resolver quaisquer dependências circulares
  const { resolvedMetadata } = resolveCircularDependencies();
  const metadata = resolvedMetadata || SERVICE_METADATA;
  
  // Ordenar serviços pela fase e prioridade
  const servicesByPhase = {};
  
  Object.entries(metadata).forEach(([serviceName, service]) => {
    const phase = service.phase || 'unknown';
    
    if (!servicesByPhase[phase]) {
      servicesByPhase[phase] = [];
    }
    
    servicesByPhase[phase].push({
      name: serviceName,
      order: service.order || 0,
      dependencies: service.dependencies || []
    });
  });
  
  // Função para adicionar serviço à ordem respeitando dependências
  const addServiceWithDependencies = (serviceName) => {
    if (visited.has(serviceName)) return;
    visited.add(serviceName);
    
    // Adicionar dependências primeiro
    const dependencies = metadata[serviceName]?.dependencies || [];
    for (const dep of dependencies) {
      addServiceWithDependencies(dep);
    }
    
    // Adicionar o serviço
    result.push(serviceName);
  };
  
  // Processar serviços fase por fase, na ordem correta
  ['CORE', 'ESSENTIAL', 'COMMUNICATION', 'FEATURES', 'PRESENTATION'].forEach(phase => {
    const services = servicesByPhase[phase] || [];
    
    // Ordenar por prioridade dentro da fase
    services.sort((a, b) => a.order - b.order);
    
    // Adicionar serviços respeitando dependências
    services.forEach(service => {
      addServiceWithDependencies(service.name);
    });
  });
  
  return result;
};

/**
 * Obtém a descrição textual de um status de inicialização
 * @param {String} status Status da inicialização
 * @returns {String} Descrição textual
 */
export const getStatusDescription = (status) => {
  switch(status) {
    case InitializationState.READY: return 'Pronto';
    case InitializationState.INITIALIZING: return 'Inicializando...';
    case InitializationState.PENDING: return 'Aguardando...';
    case InitializationState.FAILED: return 'Falhou';
    case InitializationState.BLOCKED: return 'Bloqueado';
    case InitializationState.RETRYING: return 'Tentando novamente...';
    case InitializationState.TIMEOUT: return 'Tempo esgotado';
    default: return 'Desconhecido';
  }
};

/**
 * Verifica se a inicialização atingiu timeout
 * @param {Number} startTime Timestamp de início
 * @param {Number} timeout Timeout em milissegundos (padrão: 30000)
 * @returns {Boolean} True se o timeout foi atingido
 */
export const hasInitializationTimedOut = (startTime, timeout = 30000) => {
  return (Date.now() - startTime) > timeout;
};