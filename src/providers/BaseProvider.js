// core/common/BaseProvider.jsx
import React, { useState, useEffect } from 'react';
import { ErrorAlert, LoadingScreen } from '../components/ui';

export const BaseProviderContext = React.createContext(null);

/**
 * Provider base para padronizar a interface e comportamento dos providers
 */
export function createProvider(name, useManager) {
  return function Provider({ children, config }) {
    const [state, setState] = useState({
      status: 'pending',
      error: null,
      metadata: {}
    });
    
    const manager = useManager();
    
    useEffect(() => {
      const initialize = async () => {
        try {
          setState({ ...state, status: 'initializing' });
          await manager.initialize(config);
          setState({ ...state, status: 'ready' });
        } catch (error) {
          setState({ ...state, status: 'error', error });
        }
      };
      
      initialize();
      
      return () => {
        // Cleanup ao desmontar
        if (manager.dispose) {
          manager.dispose();
        }
      };
    }, []);
    
    // Renderizações condicionais baseadas no estado
    if (state.status === 'error') {
      return (
        <ErrorAlert 
          title={`${name} initialization error`}
          message={state.error?.message || 'Unknown error'}
          onRetry={() => setState({ ...state, status: 'pending' })}
        />
      );
    }
    
    if (state.status !== 'ready') {
      return <LoadingScreen message={`Initializing ${name.toLowerCase()}...`} />;
    }
    
    // Contexto pronto, renderiza filhos
    return (
      <BaseProviderContext.Provider value={{ ...state, manager }}>
        {children}
      </BaseProviderContext.Provider>
    );
  };
}