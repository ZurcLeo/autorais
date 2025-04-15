//src/hooks/auth/useAuthActions.js
import { LOG_LEVELS } from '../../core/constants';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/AuthService/';
import { coreLogger } from '../../core/logging';
import { useAuth } from '../../providers/AuthProvider';

const MODULE_NAME = 'useAuthActions';

export const useAuthActions = (state) => {
  const { dispatch } = useAuth();
  const navigate = useNavigate();

  const login = useCallback(async (credentials) => {
    const startTime = performance.now();
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Login attempt started', {
      timestamp: new Date().toISOString()
    });

    try {
      const result = await authService.signInWithEmail(credentials);
      const duration = performance.now() - startTime;
      
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Login successful', {
        duration,
        userId: result.userId
      });
      
      return result;
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Login failed', {
        error: error.message,
        stack: error.stack,
        duration: performance.now() - startTime
      });
      
      throw new Error(error.message);
    }
  }, []);

  const loginWithProvider = useCallback(async (provider) => {
    const startTime = performance.now();
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Provider login attempt started', {
      provider: provider.providerId,
      timestamp: new Date().toISOString()
    });

    try {
      const result = await authService.loginWithProvider(provider);
      const duration = performance.now() - startTime;
      
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Provider login successful', {
        provider: provider.providerId,
        duration,
        userId: result.userId
      });
      
      return result;
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Provider login failed', {
        provider: provider.providerId,
        error: error.message,
        stack: error.stack,
        duration: performance.now() - startTime
      });
      
      throw new Error(error.message);
    }
  }, []);

  const logout = useCallback(async () => {
    const startTime = performance.now();
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Logout attempt started');
  
    try {
      await authService.logout();
      const duration = performance.now() - startTime;
  
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Logout successful', {
        duration
      });
      dispatch({ type: 'AUTH_LOGOUT_COMPLETED' }); // Chama o dispatch AQUI
      navigate('/login');
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Logout error', {
        error: error.message,
        stack: error.stack,
        duration: performance.now() - startTime
      });
  
      navigate('/login');
    }
  }, [navigate, dispatch]);

  const refreshSession = useCallback(async () => {
    // Remove a verificação de isAuthenticated
    const startTime = performance.now();
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Session refresh attempt started');

    try {
      const result = await authService.refreshSession();
      const duration = performance.now() - startTime;

      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Session refresh completed', {
        success: result,
        duration
      });

        if (result) { //Se tiver resultado, faz o dispatch
            dispatch({ type: 'FETCH_SUCCESS', payload: result });
        }

      return result;
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Session refresh failed', {
        error: error.message,
        stack: error.stack,
        duration: performance.now() - startTime
      });

      return false;
    }
}, [dispatch]);

  return {
    login,
    logout,
    loginWithProvider,
    refreshSession
  };
};