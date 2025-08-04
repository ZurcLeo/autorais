import { useState, useEffect, useCallback } from 'react';
import { serviceLocator, serviceEventHub } from '../core/services/BaseService';

/**
 * Hook simplificado de autenticação que usa apenas o AuthService como fonte única de verdade
 * Remove a complexidade de múltiplas fontes de estado de autenticação
 */
export const useSimpleAuth = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    currentUser: null,
    loading: true,
    error: null
  });

  // Função para verificar estado de autenticação
  const checkAuthState = useCallback(async () => {
    try {
      const authService = serviceLocator.get('auth');
      
      if (!authService || !authService.isInitialized) {
        // Serviço ainda não está pronto
        setAuthState(prev => ({ ...prev, loading: true }));
        return;
      }

      // Usar checkSession que é o método mais confiável do AuthService
      const user = await authService.checkSession();
      
      setAuthState({
        isAuthenticated: !!user,
        currentUser: user,
        loading: false,
        error: null
      });

      console.log('🔐 [useSimpleAuth] Estado atualizado:', {
        isAuthenticated: !!user,
        userId: user?.uid,
        loading: false
      });

    } catch (error) {
      console.error('🔐 [useSimpleAuth] Erro ao verificar autenticação:', error);
      setAuthState({
        isAuthenticated: false,
        currentUser: null,
        loading: false,
        error: error.message
      });
    }
  }, []);

  // Verificar estado inicial e configurar listener
  useEffect(() => {
    checkAuthState();

    // Configurar listener para mudanças de autenticação via eventos
    if (serviceEventHub) {
      const unsubscribeValid = serviceEventHub.on(
        'auth',
        'AUTH_SESSION_VALID',
        (data) => {
          console.log('🔐 [useSimpleAuth] AUTH_SESSION_VALID recebido:', data);
          setAuthState({
            isAuthenticated: true,
            currentUser: data.user,
            loading: false,
            error: null
          });
        }
      );

      const unsubscribeSignOut = serviceEventHub.on(
        'auth',
        'USER_SIGNED_OUT',
        () => {
          console.log('🔐 [useSimpleAuth] USER_SIGNED_OUT recebido');
          setAuthState({
            isAuthenticated: false,
            currentUser: null,
            loading: false,
            error: null
          });
        }
      );

      const unsubscribeError = serviceEventHub.on(
        'auth',
        'AUTH_ERROR',
        (data) => {
          console.log('🔐 [useSimpleAuth] AUTH_ERROR recebido:', data);
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: data.error
          }));
        }
      );

      // Cleanup function
      return () => {
        if (typeof unsubscribeValid === 'function') unsubscribeValid();
        if (typeof unsubscribeSignOut === 'function') unsubscribeSignOut();
        if (typeof unsubscribeError === 'function') unsubscribeError();
      };
    }
  }, [checkAuthState]);

  // Função de login simplificada
  const login = useCallback(async (email, password) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const authService = serviceLocator.get('auth');
      const result = await authService.signInWithEmail(email, password);
      
      // O estado será atualizado via evento AUTH_SESSION_VALID
      return result;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      throw error;
    }
  }, []);

  // Função de logout simplificada  
  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const authService = serviceLocator.get('auth');
      await authService.logoutAndClearSession();
      
      // O estado será atualizado via evento USER_SIGNED_OUT
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      throw error;
    }
  }, []);

  return {
    isAuthenticated: authState.isAuthenticated,
    currentUser: authState.currentUser,
    authLoading: authState.loading,
    error: authState.error,
    login,
    logout,
    refreshAuth: checkAuthState
  };
};