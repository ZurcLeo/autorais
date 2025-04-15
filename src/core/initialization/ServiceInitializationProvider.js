//src/core/initialization/ServiceInitializationProvider.js
import React, { useEffect, useState, useCallback, createContext, useContext, useReducer } from 'react';
import { LOG_LEVELS } from '../constants/config';
import { InitializationState, initialState } from '../constants/initialState';
import { INIT_ACTIONS } from '../constants/actions';
import { initializationReducer } from '../../reducers/initialization/initializationReducer';
import { coreLogger } from '../logging/CoreLogger';
import { serviceInitializer } from './ServiceInitializer';
import { registerAllServices, registerCoreServices } from './registerServices';
import { hasCriticalFailure, isInitializationComplete } from './initializationUtils';

const MODULE_NAME = 'ServiceInitializationProvider';
export const ServiceInitializationContext = createContext(null);

/**
 * Provider que gerencia o estado de inicialização de serviços
 * e coordena o processo de inicialização da aplicação
 */
export const ServiceInitializationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(initializationReducer, initialState);
  const [initialized, setInitialized] = useState(false);
  
  // Handler para atualizações de status dos serviços
  const handleServiceStatusChange = useCallback((serviceName, status, error) => {
    dispatch({
      type: INIT_ACTIONS.UPDATE_SERVICE_STATUS,
      payload: {
        serviceName,
        status,
        error
      }
    });
  }, [dispatch]);
  
  // Inicialização do bootstrap (executada apenas uma vez)
  useEffect(() => {
    if (initialized) return;
    
    const initializeApp = async () => {
      const startTime = performance.now();
      
      try {
        // 1. Iniciar bootstrap
        dispatch({ type: INIT_ACTIONS.START_BOOTSTRAP });
        
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INITIALIZATION, 'Iniciando bootstrap da aplicação', {
          timestamp: new Date().toISOString()
        });
        
        // 2. Registrar serviços core primeiro
        const coreServices = registerCoreServices();
        
        // 3. Configurar handler de mudança de status
        serviceInitializer.setStateChangeHandler(handleServiceStatusChange);
        
        // 4. Inicializar serviços core de forma síncrona
        for (const [serviceName, serviceInstance] of Object.entries(coreServices)) {
          try {
            coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INITIALIZATION, `Inicializando serviço core: ${serviceName}`);
            
            // Inicializar cada serviço core individualmente
            await serviceInitializer.getService(serviceName);
            
            coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INITIALIZATION, `Serviço core inicializado: ${serviceName}`);
          } catch (error) {
            coreLogger.logServiceError(MODULE_NAME, error, {
              serviceName,
              phase: 'bootstrap-core'
            });
            
            throw new Error(`Falha na inicialização do serviço core ${serviceName}: ${error.message}`);
          }
        }
        
        // 5. Registrar serviços restantes
        registerAllServices();
        
        // 6. Bootstrap concluído com sucesso
        const bootstrapDuration = performance.now() - startTime;
        
        dispatch({ 
          type: INIT_ACTIONS.BOOTSTRAP_SUCCESS,
          payload: {
            bootstrapDuration
          }
        });
        
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INITIALIZATION, 'Bootstrap concluído com sucesso', {
          duration: `${Math.round(bootstrapDuration)}ms`,
          timestamp: new Date().toISOString()
        });
        
        // 7. Iniciar inicialização de serviços não-core em background
        setTimeout(() => {
          serviceInitializer.initializeAllServices()
            .then(() => {
              coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INITIALIZATION, 'Todos os serviços inicializados');
              
              dispatch({ type: INIT_ACTIONS.FORCE_INITIALIZATION_COMPLETE });
            })
            .catch(error => {
              coreLogger.logServiceError(MODULE_NAME, error, {
                phase: 'background-initialization'
              });
              
              // Mesmo com erro, não bloqueamos a aplicação se não for crítico
              if (hasCriticalFailure(state.services)) {
                dispatch({ 
                  type: INIT_ACTIONS.SERVICE_INIT_ERROR,
                  payload: {
                    error: error.message
                  }
                });
              }
            });
        }, 100); // Breve delay para permitir renderização da UI
        
        setInitialized(true);
      } catch (error) {
        // Bootstrap falhou
        coreLogger.logServiceError(MODULE_NAME, error, {
          phase: 'bootstrap',
          duration: `${Math.round(performance.now() - startTime)}ms`
        });
        
        dispatch({ 
          type: INIT_ACTIONS.BOOTSTRAP_ERROR, 
          payload: error
        });
      }
    };
    
    initializeApp();
  }, [initialized, handleServiceStatusChange, state.services]);
  
  // Verificar se serviços críticos estão prontos
  const criticalServicesReady = isInitializationComplete(state.services);
  
  // Verificar se o bootstrap está concluído
  const isBootstrapReady = state.bootstrap.status === 'ready';
  
  // Verificar se há falha crítica
  const hasCriticalServiceFailure = hasCriticalFailure(state.services);
  
  // Função para reiniciar a inicialização em caso de falha
  const retryInitialization = useCallback(() => {
    if (state.bootstrap.status === 'failed') {
      dispatch({ type: INIT_ACTIONS.RESET_INITIALIZATION });
      setInitialized(false);
    }
  }, [state.bootstrap.status]);
  
  // Função para verificar se um serviço específico está pronto
  const isServiceReady = useCallback((serviceName) => {
    return state.services[serviceName]?.status === InitializationState.READY;
  }, [state.services]);
  
  // Função para obter erro de um serviço
  const getServiceError = useCallback((serviceName) => {
    return state.services[serviceName]?.error || null;
  }, [state.services]);
  
  // Valor do contexto
  const contextValue = {
    // Estado completo
    state,
    // Propriedades derivadas para facilitar uso
    isBootstrapReady,
    isAuthReady: state.services.auth?.status === InitializationState.READY,
    bootstrapError: state.bootstrap.error,
    bootstrapDuration: state.bootstrap.initializationTime,
    criticalServicesReady,
    hasCriticalFailure: hasCriticalServiceFailure,
    isInitComplete: state.bootstrap.status === 'ready' ? true : false,
    // Funções
    dispatch,
    retryInitialization,
    isServiceReady,
    getServiceError
  };
  
  // Registramos o estado atual para diagnóstico
  useEffect(() => {
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.DEBUG, 'Estado atual', {
      bootstrapStatus: state.bootstrap.status,
      initComplete: state.bootstrap.status === 'ready' ? true : false,
      serviceCount: Object.keys(state.services).length,
      readyServiceCount: Object.values(state.services).filter(s => s.status === InitializationState.READY).length,
      timestamp: new Date().toISOString()
    });
  }, [state]);
  
  return (
    <ServiceInitializationContext.Provider value={contextValue}>
      {children}
    </ServiceInitializationContext.Provider>
  );
};

/**
 * Hook para acessar o contexto de inicialização de serviços
 * @returns {Object} Contexto de inicialização
 */
export function useServiceInitialization() {
  const context = useContext(ServiceInitializationContext);
  
  if (!context) {
    throw new Error('useServiceInitialization deve ser usado dentro de um ServiceInitializationProvider');
  }
  
  return context;
}