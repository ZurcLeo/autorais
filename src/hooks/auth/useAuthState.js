// src/providers/core/AuthProvider/useAuthState.js
import { useReducer, useCallback, useEffect } from 'react';
import { authReducer, initialState, AUTH_ACTIONS } from '../../reducers/auth/authReducer';
import { authService } from '../../services/AuthService/';
import { loggerSystem } from '../../core/logging/loggerSystem'
import { LOG_LEVELS } from '../../reducers/metadata/metadataReducer';

const MODULE_NAME = 'useAuthState';

export const useAuthState = () => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const dispatchWithLogging = useCallback((action) => {
    const startTime = performance.now();

    loggerSystem(MODULE_NAME, LOG_LEVELS.STATE, 'Dispatching auth action', {
      type: action.type,
      timestamp: new Date().toISOString()
    });

    dispatch(action);

    const duration = performance.now() - startTime;
    loggerSystem(MODULE_NAME, LOG_LEVELS.PERFORMANCE, 'Auth action processed', {
      type: action.type,
      duration,
      newState: {
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        hasError: !!state.error
      }
    });
  }, [state]);

  // Inicialização automática
  useEffect(() => {
    const initializeAuth = async () => {
      dispatchWithLogging({ type: AUTH_ACTIONS.LOGIN_START });
      
      try {
        const userData = await authService.getCurrentUser();
        
        if (userData) {
          dispatchWithLogging({ 
            type: AUTH_ACTIONS.LOGIN_SUCCESS, 
            payload: userData 
          });
        } else {
          dispatchWithLogging({ type: AUTH_ACTIONS.LOGIN_FAILURE });
        }
      } catch (error) {
        dispatchWithLogging({ 
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: error.message 
        });
      }
    };

    initializeAuth();
  }, [dispatchWithLogging]);

  return { state, dispatch: dispatchWithLogging };
};