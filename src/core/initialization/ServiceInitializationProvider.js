import React, { useRef, useMemo, createContext, useContext, useReducer, useState, useCallback, useEffect } from 'react';
import metadataReducer, { LOG_LEVELS, initialState, SERVICE_METADATA } from '../../reducers/metadata/metadataReducer';
import { coreLogger } from '../logging/CoreLogger'; // Importa o coreLogger para registro de logs
import { serviceInitializer } from './ServiceInitializer'; 

const MODULE_NAME = 'ServiceInitializationProvider';
export const ServiceInitializationContext = createContext(null); // Cria um Contexto React chamado ServiceInitializationContext. Ele será usado para fornecer e consumir o estado de inicialização dos serviços.

export const ServiceInitializationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(metadataReducer, initialState);
  const [status, setStatus] = useState('pending');
  const initializationRef = useRef(null);

  useEffect(() => {
    // Registrar handler de mudança de estado
    serviceInitializer.setStateChangeHandler((serviceName, status) => {
      dispatch({
        type: 'UPDATE_SERVICE_STATUS',
        payload: {
          serviceName,
          status
        }
      });
    });

    return () => {
      serviceInitializer.setStateChangeHandler(null);
    };
  }, []);

  useEffect(() => {
    // Previne múltiplas inicializações
    if (status !== 'pending') return;

    // Armazena a Promise de inicialização
    if (!initializationRef.current) {
      const initializeServices = async () => {
        try {
          setStatus('initializing');
          
          const serviceInitializers = Object.entries(SERVICE_METADATA)
            .reduce((acc, [serviceName, metadata]) => {
              if (metadata.initFn) {
                acc[serviceName] = metadata.initFn;
              }
              return acc;
            }, {});

          await serviceInitializer.initializeServices(serviceInitializers);
          setStatus('completed');
        } catch (error) {
          setStatus('failed');
          coreLogger.logServiceError('ServiceInitializationProvider', error);
        }
      };

      initializationRef.current = initializeServices();
    }

    // Await a Promise existente
    initializationRef.current.catch(() => {
      initializationRef.current = null;
    });

    return () => {
      if (status === 'initializing') {
        coreLogger.logEvent('ServiceInitializationProvider', LOG_LEVELS.WARNING,
          'Initialization interrupted by unmount');
      }
    };
  }, [status]);

  return (
    <ServiceInitializationContext.Provider value={{ state, dispatch, status }}>
      {children}
    </ServiceInitializationContext.Provider>
  );
};