// src/hooks/initialization/useServiceInitialization.js
import { useContext, useEffect } from 'react';
import { LOG_LEVELS, SERVICE_METADATA } from '../../reducers/metadata/metadataReducer';
import { ServiceInitializationContext } from '../../core/initialization/ServiceInitializationProvider';
import { coreLogger } from '../../core/logging/CoreLogger';

const MODULE_NAME = 'useServiceInitialization';

export function useServiceInitialization() {


  const context = useContext(ServiceInitializationContext);

  if (!context) {
    const error = new Error('useServiceInitialization must be used within ServiceInitializationProvider');
    coreLogger.logServiceError(MODULE_NAME, error);
    throw error;
  }

  const { state, dispatch } = context;
console.log('context: ', context)
  // Helpers para verificar estado dos serviços
  const isServiceReady = (serviceName) => {
    console.log('serviceName: ', serviceName)
    return state?.services?.[serviceName]?.status === 'ready';
  };

  const isServiceInitializing = (serviceName) => {
    console.log('serviceName: ', serviceName)
    return state?.services?.[serviceName]?.status === 'initializing';
  };

  const getServiceError = (serviceName) => {
    console.log('serviceName: ', serviceName)
    return state?.services?.[serviceName]?.error || null;
  };

//   useEffect(() => {
//     console.log('[ServiceInitialization] Current state:', {
//         servicesState,
//         criticalServicesReady: coreReady
//     });
// }, [servicesState, coreReady]);

  // Verifica se todas as dependências de um serviço estão prontas
  const areDependenciesReady = (serviceName) => {
    console.log('serviceName: ', serviceName)
    const serviceMetadata = SERVICE_METADATA[serviceName];
    console.log('serviceMetadata: ', serviceMetadata)
    return serviceMetadata?.dependencies?.every(dep => 
      state.services[dep]?.status === 'ready'
    ) ?? true;
  }

  // Verifica se houve falha crítica em algum serviço
  const hasCriticalFailure = () => {
    return Object.entries(state?.services || {}).some(
      ([serviceName, status]) => {
        const metadata = state?.metadata?.[serviceName];
        return metadata?.criticalPath && status?.status === 'failed';
      }
    );
  };
  console.log('hasCriticalFailure: ', hasCriticalFailure())

  // Verifica se a inicialização está completa
  const isInitializationComplete = () => {
    const criticalServices = Object.entries(state?.services || {})
      .filter(([serviceName]) => state?.metadata?.[serviceName]?.criticalPath);

    return criticalServices.every(([_, status]) => status?.status === 'ready');
  };
  console.log('isInitializationComplete: ', isInitializationComplete())


  // Log do estado atual
  const logInitializationState = () => {
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Current initialization state', {
      services: state?.services,
      dependencies: state?.dependencies,
      metadata: state?.metadata,
      timestamp: new Date().toISOString()
    });
  };

  console.log('logInitializationState: ', logInitializationState())

  console.log('return: ', 
    // 'serviceName: ', serviceName,
    'state: ', state, 
    'dispatch:', dispatch, 
    'isServiceReady: ', isServiceReady, 
    'isServiceInitializing: ', isServiceInitializing,
    'getServiceError: ', getServiceError,
    'areDependenciesReady: ', areDependenciesReady,
    'hasCriticalFailure: ', hasCriticalFailure,
    'isInitializationComplete: ', isInitializationComplete,
    'logInitializationState: ', logInitializationState
  )

  return {
    // Estado
    state,
    
    // Dispatch (caso necessário para componentes que precisem atualizar o estado)
    dispatch,
    
    // Status helpers
    isServiceReady,
    isServiceInitializing,
    getServiceError,
    areDependenciesReady,
    hasCriticalFailure,
    isInitializationComplete,
    
    // Logging
    logInitializationState,
    
    // Computed properties
    criticalServicesReady: isInitializationComplete(),
    hasErrors: hasCriticalFailure(),
    
    // Metadata
    metadata: state?.metadata || {},
    
    // Service states
    services: state?.services || {},
    
    // Dependencies
    dependencies: state?.dependencies || {}
  };
}

// Exemplo de uso:
/*
function MyComponent() {
  const {
    isServiceReady,
    hasCriticalFailure,
    services,
    criticalServicesReady
  } = useServiceInitialization();

  if (hasCriticalFailure()) {
    return <ErrorDisplay />;
  }

  if (!criticalServicesReady) {
    return <LoadingIndicator />;
  }

  if (!isServiceReady('auth')) {
    return <AuthenticationLoading />;
  }

  return <div>My Component Content</div>;
}
*/