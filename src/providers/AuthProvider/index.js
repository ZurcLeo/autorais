// src/providers/AuthProvider/index.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useServiceInitialization } from '../../hooks/initialization/useServiceInitialization';
import { authService } from '../../services/AuthService/index';
import { coreLogger } from '../../core/logging/CoreLogger';
import { LOG_LEVELS } from '../../reducers/metadata/metadataReducer';
import initializationQueue from '../../core/initialization/InitializationQueue.tsx';

const MODULE_NAME = 'AuthProvider';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Estado local para o provider
  const [state, setState] = useState({
    isAuthenticated: false,
    isLoading: true,
    currentUser: null,
    error: null,
    hasLoginWithProvider: true,
    hasSignInWithEmail: true
  });

  // Controle de operações pendentes
  const pendingOperations = React.useRef([]);

  // Acesso ao sistema de inicialização de serviços
  const { state: servicesState, criticalServicesReady: coreReady } = useServiceInitialization();
  const isAuthReady = servicesState?.services?.auth?.status === 'ready';

  console.log('[AuthProvider] Initializing with state:', {
    servicesState,
    coreReady,
    isAuthReady
  });

  // Processa operações pendentes quando auth estiver pronto
  useEffect(() => {
    if (isAuthReady && pendingOperations.current.length > 0) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 
        `Auth service ready, processing ${pendingOperations.current.length} pending operations`);
      
      const operations = [...pendingOperations.current];
      pendingOperations.current = [];
      
      operations.forEach(operation => {
        try {
          operation();
        } catch (error) {
          coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 
            'Error executing pending operation', { error });
        }
      });
    }
  }, [isAuthReady]);

  // Sincroniza estado quando auth estiver pronto
  useEffect(() => {
    if (!coreReady || !isAuthReady) return;

    const syncAuthState = async () => {
      try {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Syncing auth state');
        
        const session = await authService.getSession();
        setState({
          isAuthenticated: !!session,
          isLoading: false,
          currentUser: session,
          error: null,
          hasLoginWithProvider: true,
          hasSignInWithEmail: true
        });
      } catch (error) {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 
          'Error syncing auth state', { error });
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          error
        }));
      }
    };

    syncAuthState();
  }, [coreReady, isAuthReady]);

  // Função para executar operações quando auth estiver pronto
  const executeWhenReady = useCallback(async (callback) => {
    console.log('[AuthProvider] executeWhenReady called with status:', {
      coreReady,
      isAuthReady
    });
    
    if (!coreReady) {
      console.warn('[AuthProvider] Core services not initialized');
      throw new Error('Core services not initialized');
    }
    
    return new Promise((resolve, reject) => {
      // Usa o sistema de fila para respeitar dependências
      if (isAuthReady) {
        try {
          resolve(callback());
        } catch (error) {
          reject(error);
        }
      } else {
        // Adiciona à fila de pendências local do AuthProvider
        pendingOperations.current.push(() => {
          callback().then(resolve).catch(reject);
        });
      }
    });
  }, [coreReady, isAuthReady]);

  // Implementação da função login
  const login = useCallback(async (credentials) => {
    return executeWhenReady(async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const user = await authService.login(credentials);
        setState({
          isAuthenticated: true,
          isLoading: false,
          currentUser: user,
          error: null,
          hasLoginWithProvider: true,
          hasSignInWithEmail: true
        });
        return user;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error
        }));
        throw error;
      }
    });
  }, [executeWhenReady]);

  // Implementação da função loginWithProvider
  const loginWithProvider = useCallback(async (provider) => {
    return executeWhenReady(async () => {
      try {
        console.log('[AuthProvider] Executing loginWithProvider with provider:', provider);
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const user = await authService.loginWithProvider(provider);
        setState({
          isAuthenticated: true,
          isLoading: false,
          currentUser: user,
          error: null,
          hasLoginWithProvider: true,
          hasSignInWithEmail: true
        });
        return user;
      } catch (error) {
        console.error('[AuthProvider] Error in loginWithProvider:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error
        }));
        throw error;
      }
    });
  }, [executeWhenReady]);

  // Implementação da função signInWithEmail
  const signInWithEmail = useCallback(async (email, password) => {
    return executeWhenReady(async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const user = await authService.signInWithEmail(email, password);
        setState({
          isAuthenticated: true,
          isLoading: false,
          currentUser: user,
          error: null,
          hasLoginWithProvider: true,
          hasSignInWithEmail: true
        });
        return user;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error
        }));
        throw error;
      }
    });
  }, [executeWhenReady]);

  // Implementação da função logout
  const logout = useCallback(async () => {
    return executeWhenReady(async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        await authService.logout();
        setState({
          isAuthenticated: false,
          isLoading: false,
          currentUser: null,
          error: null,
          hasLoginWithProvider: true,
          hasSignInWithEmail: true
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error
        }));
        throw error;
      }
    });
  }, [executeWhenReady]);

  // Valor do contexto
  const value = {
    ...state,
    login,
    logout,
    loginWithProvider,
    signInWithEmail
  };

  console.log('[AuthProvider] Providing context value:', {
    isAuthenticated: state.isAuthenticated,
    hasLoginWithProvider: state.hasLoginWithProvider, 
    hasSignInWithEmail: state.hasSignInWithEmail
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para acessar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    const error = new Error('useAuth must be used within AuthProvider');
    coreLogger.logServiceError(MODULE_NAME, error);
    throw error;
  }
  
  return context;
};