// InitializationManager.js (refatorado)
import React, {useEffect, useMemo} from 'react';
import {InitializationActions} from '../../reducers/initialization/initializationReducer';
import { useServiceInitialization } from './ServiceInitializationProvider';
import { LoadingScreen } from './LoadingScreen';
import { LOG_LEVELS } from '../constants/config';
import { isInitializationComplete } from './initializationUtils';
import {hasCriticalFailure} from './initializationUtils';
import { coreLogger } from '../logging/CoreLogger';

export const InitializationManager = ({ children }) => {
  const { 
    isBootstrapReady, 
    bootstrapError, 
    services,
    dispatch,
    isInitComplete,
    } = useServiceInitialization();
  const hasFailure = hasCriticalFailure();

  // Registra o estado atual da inicialização
  useEffect(() => {
    coreLogger.logEvent(
      'InitializationManager',
      LOG_LEVELS.DEBUG,
      'Estado atual da inicialização',
      {
        isBootstrapReady,
        bootstrapError,
        hasFailure,
        isInitComplete,
        servicesStatus: Object.fromEntries(
          Object.entries(services).map(([key, value]) => [key, value?.status])
        ),
      },
      { timestamp: new Date().toISOString() }
    );
  }, [isBootstrapReady, isInitComplete, bootstrapError, hasFailure, services]);

  // Verificação de inicialização completa memoizada
  const allServicesReady = useMemo(() => {
    return Object.values(services).length > 0 &&
           Object.values(services).every(s => s && s.status === 'ready');
  }, [services]);

  // Verificação de inicialização completa dos serviços críticos memoizada
  const criticalServicesReady = useMemo(() => {
    return isInitializationComplete(services);
  }, [services]);
  
  useEffect(() => {
    if (criticalServicesReady && allServicesReady) {
      coreLogger.logEvent('InitializationManager', LOG_LEVELS.LIFECYCLE, 'Todos os serviços prontos, forçando conclusão', {
        timestamp: new Date().toISOString(),
      });

      dispatch({ type: InitializationActions.FORCE_INITIALIZATION_COMPLETE });
    }
  }, [criticalServicesReady, allServicesReady, dispatch]);

  // Se bootstrap falhou
  if (bootstrapError) {
    coreLogger.logEvent('InitializationManager', LOG_LEVELS.ERROR, 'Erro no Bootstrap', { 
      error: bootstrapError,
      services,
      timestamp: new Date().toISOString(),
    });    return (
      <LoadingScreen 
        phase="bootstrap-error" 
        error={bootstrapError}
      />
    );
  }

// Se algum serviço crítico falhou
if (hasFailure) {
  coreLogger.logEvent('InitializationManager', LOG_LEVELS.ERROR, 'Falha Crítica Detectada', {
    services,
    timestamp: new Date().toISOString(),
  });
  return <LoadingScreen phase="error" />;
}

// Tudo ok, renderiza a aplicação
coreLogger.logEvent('InitializationManager', LOG_LEVELS.INFO, 'Rendering application');
return children;
}
