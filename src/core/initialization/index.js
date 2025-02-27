// src/core/initialization/index.js
import { serviceInitializer } from './ServiceInitializer';
import { coreLogger } from '../logging';
import { SERVICE_METADATA } from '../../reducers/metadata/metadataReducer';

// Estados de inicialização
export const InitializationState = {
    PENDING: 'pending',        // Aguardando início
    INITIALIZING: 'initializing', // Em processo
    READY: 'ready',           // Pronto para uso
    FAILED: 'failed',         // Falhou na inicialização
    BLOCKED: 'blocked',       // Bloqueado por dependência
    RETRYING: 'retrying',     // Em retry após falha
    TIMEOUT: 'timeout'        // Timeout na inicialização
};

// Fases de inicialização
export const InitializationPhase = {
    CORE: {
        order: 1,
        name: 'CORE',
        services: ['auth'],
        required: true
    },
    ESSENTIAL: {
        order: 2,
        name: 'ESSENTIAL',
        services: ['user'],
        required: true
    },
    COMMUNICATION: {
        order: 3,
        name: 'COMMUNICATION',
        services: ['notifications', 'connections', 'messages'],
        required: false
    },
    FEATURES: {
        order: 4,
        name: 'FEATURES',
        services: ['interests', 'caixinhas'],
        required: false
    },
    PRESENTATION: {
        order: 5,
        name: 'PRESENTATION',
        services: ['dashboard'],
        required: false
    }
};

// Helper para verificar se a inicialização está completa
export const isInitializationComplete = (state) => {
    // Verifica apenas serviços obrigatórios
    const requiredServices = Object.values(InitializationPhase)
        .filter(phase => phase.required)
        .flatMap(phase => phase.services);

    return requiredServices.every(
        serviceName => state[serviceName]?.status === InitializationState.READY
    );
};

// Helper para verificar se houve falha crítica
export const hasCriticalFailure = (state, metadata = SERVICE_METADATA) => {
    return Object.entries(state).some(([serviceName, serviceState]) => 
        serviceState.status === InitializationState.FAILED && 
        metadata[serviceName]?.criticalPath
    );
};

// Helper para verificar dependências prontas
export const areDependenciesReady = (serviceName, state, metadata = SERVICE_METADATA) => {
    const dependencies = metadata[serviceName]?.dependencies || [];
    return dependencies.every(dep => 
        state[dep]?.status === InitializationState.READY
    );
};

// Helper para obter serviços por fase
export const getServicesByPhase = (phase) => {
    return InitializationPhase[phase]?.services || [];
};

// Helper para logging de inicialização
export const logInitializationEvent = (serviceName, status, metadata = {}) => {
    coreLogger.logEvent('Initialization', status, `Service ${serviceName} ${status}`, metadata);
};

// Exporta o serviceInitializer como default
export { serviceInitializer };

// Função para iniciar um serviço com retry
export const initializeServiceWithRetry = async (serviceName, initFn, options = {}) => {
    const retryManager = retryManager.getInstance();
    
    try {
        const result = await retryManager.retryWithBackoff(
            serviceName,
            async () => {
                logInitializationEvent(serviceName, InitializationState.INITIALIZING);
                await initFn();
                logInitializationEvent(serviceName, InitializationState.READY);
                return true;
            },
            options
        );

        return result;
    } catch (error) {
        logInitializationEvent(serviceName, InitializationState.FAILED, {
            error: error.message
        });
        throw error;
    }
};

// Helper para verificar timeout de inicialização
export const hasInitializationTimedOut = (startTime, timeout = 30000) => {
    return (Date.now() - startTime) > timeout;
};

// Helper para obter ordem de inicialização
export const getInitializationOrder = () => {
    return Object.values(InitializationPhase)
        .sort((a, b) => a.order - b.order)
        .map(phase => phase.services)
        .flat();
};

// Helper para validar estado de inicialização
export const validateInitializationState = (state) => {
    const invalidStates = Object.entries(state).filter(([serviceName, serviceState]) => {
        return !Object.values(InitializationState).includes(serviceState.status);
    });

    if (invalidStates.length > 0) {
        coreLogger.logServiceError('Initialization', new Error('Invalid initialization states detected'), {
            invalidStates
        });
        return false;
    }

    return true;
};

export function checkForCircularDependencies(metadata) {
  const visited = new Set();
  const recursionStack = new Set();
  
  function detectCircular(serviceName, path = []) {
    if (recursionStack.has(serviceName)) {
      console.error(`Circular dependency detected: ${path.join(' -> ')} -> ${serviceName}`);
      return true;
    }
    
    if (visited.has(serviceName)) return false;
    
    visited.add(serviceName);
    recursionStack.add(serviceName);
    
    const dependencies = metadata[serviceName]?.dependencies || [];
    
    for (const dep of dependencies) {
      if (detectCircular(dep, [...path, serviceName])) {
        return {
            'local:': path,
            'serviceName:': serviceName
        };
      }
    }
    
    recursionStack.delete(serviceName);
    return false;
  }
  
  for (const serviceName of Object.keys(metadata)) {
    if (detectCircular(serviceName)) {
      return true;
    }
  }
  
  return false;
}

if (checkForCircularDependencies(SERVICE_METADATA)) {
  console.error('Circular dependencies detected in SERVICE_METADATA');
}

