import { LOG_LEVELS } from '../../reducers/metadata/metadataReducer';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/AuthService/';
import { coreLogger as CoreLogger } from '../../core/logging/CoreLogger';

const MODULE_NAME = 'useAuthActions';

export const useAuthActions = (state) => {
  const navigate = useNavigate();

  const login = useCallback(async (credentials) => {
    const startTime = performance.now();
    CoreLogger(MODULE_NAME, LOG_LEVELS.STATE, 'Login attempt started', {
      timestamp: new Date().toISOString()
    });

    try {
      const result = await authService.login(credentials);
      const duration = performance.now() - startTime;
      
      CoreLogger(MODULE_NAME, LOG_LEVELS.STATE, 'Login successful', {
        duration,
        userId: result.userId
      });
      
      return result;
    } catch (error) {
      CoreLogger(MODULE_NAME, LOG_LEVELS.ERROR, 'Login failed', {
        error: error.message,
        stack: error.stack,
        duration: performance.now() - startTime
      });
      
      throw new Error(error.message);
    }
  }, []);

  const loginWithProvider = useCallback(async (provider) => {
    const startTime = performance.now();
    CoreLogger(MODULE_NAME, LOG_LEVELS.STATE, 'Provider login attempt started', {
      provider: provider.providerId,
      timestamp: new Date().toISOString()
    });

    try {
      const result = await authService.loginWithProvider(provider);
      const duration = performance.now() - startTime;
      
      CoreLogger(MODULE_NAME, LOG_LEVELS.STATE, 'Provider login successful', {
        provider: provider.providerId,
        duration,
        userId: result.userId
      });
      
      return result;
    } catch (error) {
      CoreLogger(MODULE_NAME, LOG_LEVELS.ERROR, 'Provider login failed', {
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
    CoreLogger(MODULE_NAME, LOG_LEVELS.STATE, 'Logout attempt started');

    try {
      await authService.logout();
      const duration = performance.now() - startTime;
      
      CoreLogger(MODULE_NAME, LOG_LEVELS.STATE, 'Logout successful', {
        duration
      });
      
      navigate('/login');
    } catch (error) {
      CoreLogger(MODULE_NAME, LOG_LEVELS.ERROR, 'Logout error', {
        error: error.message,
        stack: error.stack,
        duration: performance.now() - startTime
      });
      
      navigate('/login');
    }
  }, [navigate]);

  const refreshSession = useCallback(async () => {
    if (!state.isAuthenticated) {
      CoreLogger(MODULE_NAME, LOG_LEVELS.STATE, 'Session refresh skipped - not authenticated');
      return false;
    }

    const startTime = performance.now();
    CoreLogger(MODULE_NAME, LOG_LEVELS.STATE, 'Session refresh attempt started');

    try {
      const result = await authService.refreshSession();
      const duration = performance.now() - startTime;
      
      CoreLogger(MODULE_NAME, LOG_LEVELS.STATE, 'Session refresh completed', {
        success: result,
        duration
      });
      
      return result;
    } catch (error) {
      CoreLogger(MODULE_NAME, LOG_LEVELS.ERROR, 'Session refresh failed', {
        error: error.message,
        stack: error.stack,
        duration: performance.now() - startTime
      });
      
      return false;
    }
  }, [state.isAuthenticated]);

  return {
    login,
    logout,
    loginWithProvider,
    refreshSession
  };
};