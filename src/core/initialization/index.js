// src/core/initialization/index.js
import { serviceInitializer } from './ServiceInitializer';
import { coreLogger } from '../logging/CoreLogger';
import { InitializationState } from '../constants/initialState';
import { LOG_LEVELS, InitializationPhase } from '../constants/config';
import { SERVICE_METADATA } from '../../reducers/metadata/metadataReducer';
import { retryManager } from './../resilience/RetryManager';
import { 
    isInitComplete, 
    hasCriticalFailure, 
    areDependenciesReady,
    checkForCircularDependencies
} from './initializationUtils';

// Helper para obter serviços por fase
export const getServicesByPhase = (phase) => {
    return InitializationPhase[phase]?.services || [];
};

// **Função otimizada para logging de inicialização**
export const logInitializationEvent = (serviceName, level, message, metadata = {}) => {
    coreLogger.logEvent('Initialization', level, message, { service: serviceName }, metadata);
};

// Exporta funções auxiliares
export { 
    isInitComplete, 
    hasCriticalFailure, 
    areDependenciesReady,
    checkForCircularDependencies,
    serviceInitializer 
};

// **Função otimizada para iniciar serviços com retry**
export const initializeServiceWithRetry = async (serviceName, initFn, options = {}) => {
    const startTime = Date.now();

    try {
        coreLogger.logServiceInitStart(serviceName);
        
        const result = await retryManager.retryWithBackoff(
            serviceName,
            async () => {
                await initFn();
                coreLogger.logServiceInitComplete(serviceName, Date.now() - startTime);
                return true;
            },
            options
        );

        return result;
    } catch (error) {
        coreLogger.logServiceInitError(serviceName, error);
        throw error;
    }
};

// **Verifica se a inicialização excedeu o tempo limite**
export const hasInitializationTimedOut = (startTime, timeout = 30000) => {
    return (Date.now() - startTime) > timeout;
};

// **Gera a ordem de inicialização otimizada**
export const getInitializationOrder = () => {
    return Object.values(InitializationPhase)
        .sort((a, b) => a.order - b.order)
        .map(phase => phase.services)
        .flat();
};

// **Valida o estado de inicialização com log estruturado**
export const validateInitializationState = (state) => {
    const invalidStates = Object.entries(state).filter(([serviceName, serviceState]) => {
        return !Object.values(InitializationState).includes(serviceState.status);
    });

    if (invalidStates.length > 0) {
        coreLogger.logEvent('Initialization', LOG_LEVELS.STATE, 'Estados inválidos detectados', { invalidStates });
        return false;
    }

    return true;
};

// **Verifica dependências circulares e loga corretamente**
const circularResult = checkForCircularDependencies(SERVICE_METADATA);
if (circularResult.hasCircularDependencies) {
    coreLogger.logEvent(
        'Initialization', 
        LOG_LEVELS.WARNING, 
        'Dependências circulares detectadas no SERVICE_METADATA', 
        { circularDependencies: circularResult.circularDependencies.map(cycle => cycle.cycle) }
    );
}
