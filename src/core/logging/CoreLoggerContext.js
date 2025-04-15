// src/core/logging/CoreLoggerContext.js
import React, { createContext, useContext, useEffect } from 'react';
import { coreLogger } from './CoreLogger';
import { LOG_LEVELS } from '../../core/constants/config';

// Criação do contexto com valor inicial null
const CoreLoggerContext = createContext(null);

/**
 * Provider que disponibiliza o logger para a árvore de componentes React
 */
export function CoreLoggerProvider({ children }) {
  // Inicialização e limpeza do logger
  useEffect(() => {
    // Inicializar o logger quando o provider for montado
    coreLogger.initialize().catch(err => {
      console.error('Error initializing logger:', err);
    });
    
    // Log do ciclo de vida do provider
    coreLogger.logProviderMount('CoreLoggerProvider');
    
    // Cleanup quando o provider for desmontado
    return () => {
      coreLogger.logProviderUnmount('CoreLoggerProvider');
    };
  }, []);
  
  return (
    <CoreLoggerContext.Provider value={coreLogger}>
      {children}
    </CoreLoggerContext.Provider>
  );
}

/**
 * Hook para usar o logger em componentes React
 * @returns {Object} - Instância do CoreLogger
 * @throws {Error} - Se usado fora de um CoreLoggerProvider
 */
export function useCoreLogger() {
  const context = useContext(CoreLoggerContext);
  
  // Validação para garantir que o hook está sendo usado dentro do Provider
  if (!context) {
    const error = new Error('useCoreLogger must be used within a CoreLoggerProvider');
    console.error(error);
    throw error;
  }
  
  return context;
}

/**
 * HOC (Higher Order Component) para injetar o logger em componentes que não usam hooks
 * @param {React.Component} Component - Componente a ser wrapped
 * @returns {React.Component} - Componente com logger injetado via props
 */
export function withCoreLogger(Component) {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const WrappedComponent = (props) => {
    const logger = useCoreLogger();
    
    // Injeta o logger como prop
    return <Component {...props} logger={logger} />;
  };
  
  WrappedComponent.displayName = `withCoreLogger(${displayName})`;
  
  return WrappedComponent;
}

/**
 * Hook para log de ciclo de vida do componente
 * @param {String} componentName - Nome do componente para identificação nos logs
 */
export function useComponentLifecycleLogger(componentName) {
  const logger = useCoreLogger();
  
  useEffect(() => {
    logger.logEvent(componentName, LOG_LEVELS.LIFECYCLE, `Component mounted: ${componentName}`);
    
    return () => {
      logger.logEvent(componentName, LOG_LEVELS.LIFECYCLE, `Component unmounted: ${componentName}`);
    };
  }, [componentName, logger]);
}