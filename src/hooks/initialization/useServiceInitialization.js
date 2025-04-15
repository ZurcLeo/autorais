// // useServiceInitialization.js (refatorado)
// import { useContext, useCallback, useMemo } from 'react';
// import { LOG_LEVELS } from '../../core/constants/config';
// import { SERVICE_METADATA } from '../../reducers/metadata/metadataReducer';
// import { ServiceInitializationContext } from '../../core/initialization/ServiceInitializationProvider';
// import { coreLogger } from '../../core/logging';
// import { 
//   isInitializationComplete, 
//   hasCriticalFailure as checkCriticalFailure,
//   areDependenciesReady as checkDependenciesReady
// } from '../../core/initialization/initializationUtils';

// const MODULE_NAME = 'useServiceInitialization';

// export function useServiceInitialization() {
//   const context = useContext(ServiceInitializationContext);

//   if (!context) {
//     const error = new Error('useServiceInitialization must be used within ServiceInitializationProvider');
//     coreLogger.log(MODULE_NAME, LOG_LEVELS.ERROR, 'Ocorreu um erro.', {
//       error
//     });
//     throw error;
//   }

//   const { state, dispatch, isBootstrapReady, bootstrapError, retryInitialization } = context;

//   // Helpers para verificar estado dos serviços
//   const isServiceReady = useCallback((serviceName) => {
//     return state?.services?.[serviceName]?.status === 'ready';
//   }, [state?.services]);

//   const isServiceInitializing = useCallback((serviceName) => {
//     return state?.services?.[serviceName]?.status === 'initializing';
//   }, [state?.services]);

//   const getServiceError = useCallback((serviceName) => {
//     return state?.services?.[serviceName]?.error || null;
//   }, [state?.services]);

//   // Utiliza helpers centralizados com memoização
//   const areDependenciesReady = useCallback((serviceName) => {
//     return checkDependenciesReady(serviceName, state?.services, SERVICE_METADATA);
//   }, [state?.services]);

//   // Verifica se houve falha crítica em algum serviço
//   const hasCriticalFailure = useCallback(() => {
//     if (bootstrapError) return true;
//     return checkCriticalFailure(state?.services, SERVICE_METADATA);
//   }, [state?.services, bootstrapError]);

//   // Verificação memoizada de inicialização completa
//   const isInitComplete = useMemo(() => {
//     if (!isBootstrapReady) return false;
//     return isInitializationComplete(state?.services);
//   }, [isBootstrapReady, state?.services]);

//   const criticalFailureDetected = useMemo(() => {
//     coreLogger.log(MODULE_NAME, LOG_LEVELS.DEBUG, 'Verificando falhas críticas:',
//       bootstrapError,
//       state?.services,
//       SERVICE_METADATA
//     );
    
//     if (bootstrapError) {
//       coreLogger.log(MODULE_NAME, LOG_LEVELS.DEBUG, 'Bootstrap error detectado');
//       return true;
//     }
    
//     // Verificação explícita de serviços críticos com falha
//     const criticalServicesWithFailure = Object.entries(state?.services || {})
//       .filter(([serviceName, serviceState]) => {
//         const isCritical = SERVICE_METADATA[serviceName]?.criticalPath === true;
//         const hasFailed = serviceState?.status === 'failed' || serviceState?.status === 'blocked';
//         return isCritical && hasFailed;
//       });
    
//     coreLogger.log(MODULE_NAME, LOG_LEVELS.DEBUG, 'Serviços críticos com falha:', criticalServicesWithFailure);
//     return criticalServicesWithFailure.length > 0;
//   }, [state?.services, bootstrapError]);

//   // Log do estado atual
//   const logInitializationState = useCallback(() => {
//     coreLogger.log(MODULE_NAME, LOG_LEVELS.DEBUG, 'Current initialization state', {
//       bootstrap: state?.bootstrap,
//       services: state?.services,
//       metadata: SERVICE_METADATA,
//       timestamp: new Date().toISOString()
//     });
//   }, [state]);

//   return {
//     // Estado
//     state,
    
//     // Dispatch (caso necessário para componentes que precisem atualizar o estado)
//     dispatch,
    
//     // Bootstrap status
//     isBootstrapReady,
//     bootstrapError,
//     retryInitialization,
    
//     // Status helpers
//     isServiceReady,
//     isServiceInitializing,
//     getServiceError,
//     areDependenciesReady,
//     hasCriticalFailure,
//     // isInitializationComplete: isInitComplete,
//     isInitComplete,
    
//     // Logging
//     logInitializationState,
    
//     // Computed properties
//     hasErrors: criticalFailureDetected,
    
//     // Metadata
//     metadata: SERVICE_METADATA,
    
//     // Service states
//     services: state?.services || {},
//   };
// }