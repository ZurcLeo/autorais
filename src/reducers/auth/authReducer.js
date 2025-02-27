// src/reducers/authReducer.js
import { loggerSystem } from '../../core/logging/loggerSystem';

const MODULE_NAME = 'AuthReducer';

/**
 * Action types for authentication state management
 * These constants define all possible actions that can modify the auth state
 */
export const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  SET_ERROR: 'SET_ERROR',
  SET_LOADING: 'SET_LOADING',
  CLEAR_STATE: 'CLEAR_STATE'
};

/**
 * Initial state for the auth context
 * This represents the starting point for our authentication management system
 */
export const initialState = {
  currentUser: null,         // Current authenticated user
  isLoading: true,          // Loading state indicator
  isLoggingIn: false,       // Login process indicator
  isAuthenticated: false,    // Authentication status
  error: null,              // Error state
  lastUpdated: null,        // Timestamp of last state update
  provider: null,           // Authentication provider used
  sessionExpiry: null       // Session expiration timestamp
};

/**
 * Auth reducer function
 * Handles all state transitions for the authentication context
 * 
 * @param {Object} state - Current state
 * @param {Object} action - Action object containing type and payload
 * @returns {Object} New state
 */
export const authReducer = (state, action) => {
  const startTime = performance.now();
  let newState;

  try {
    newState = processAuthAction(state, action);
    
    loggerSystem.logStateChange(MODULE_NAME, state, newState, action.type, {
      duration: performance.now() - startTime
    });

    return newState;
  } catch (error) {
    loggerSystem.logError(MODULE_NAME, error, {
      actionType: action.type,
      previousState: state,
      duration: performance.now() - startTime
    });
    
    return {
      ...state,
      error: error.message,
      lastUpdated: Date.now()
    };
  }
};

/**
 * Helper function to process auth reducer actions
 * Separates the core state transition logic for better error handling
 */
function processAuthAction(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoggingIn: true,
        error: null,
        lastUpdated: Date.now()
      };
      
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        currentUser: action.payload,
        isLoading: false,
        isLoggingIn: false,
        isAuthenticated: true,
        error: null,
        lastUpdated: Date.now(),
        provider: action.payload.provider,
        sessionExpiry: action.payload.sessionExpiry
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        isLoggingIn: false,
        isAuthenticated: false,
        error: action.payload,
        lastUpdated: Date.now()
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
        lastUpdated: Date.now()
      };

    case AUTH_ACTIONS.FETCH_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        currentUser: action.payload,
        isLoading: false,
        isAuthenticated: true,
        error: null,
        lastUpdated: Date.now()
      };

    case AUTH_ACTIONS.FETCH_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload,
        lastUpdated: Date.now()
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          ...action.payload
        },
        lastUpdated: Date.now()
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        lastUpdated: Date.now()
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case AUTH_ACTIONS.CLEAR_STATE:
      return {
        ...initialState,
        isLoading: false,
        lastUpdated: Date.now()
      };

    default:
      loggerSystem.logWarning(MODULE_NAME, `Unknown action type: ${action.type}`);
      return state;
  }
}

/**
 * Validates the shape of the auth state
 * Used for debugging and ensuring state integrity
 */
export function validateAuthState(state) {
  const requiredKeys = [
    'currentUser',
    'isLoading',
    'isLoggingIn',
    'isAuthenticated',
    'error',
    'lastUpdated',
    'provider',
    'sessionExpiry'
  ];

  const missingKeys = requiredKeys.filter(key => !(key in state));
  
  if (missingKeys.length > 0) {
    const error = new Error(`Invalid auth state: missing keys ${missingKeys.join(', ')}`);
    loggerSystem.logError(MODULE_NAME, error, { state });
    throw error;
  }

  // Additional validation for authenticated state consistency
  if (state.isAuthenticated && !state.currentUser) {
    const error = new Error('Invalid auth state: authenticated but no current user');
    loggerSystem.logError(MODULE_NAME, error, { state });
    throw error;
  }

  // Validate session expiry if authenticated
  if (state.isAuthenticated && state.sessionExpiry) {
    const now = Date.now();
    if (now > state.sessionExpiry) {
      const error = new Error('Invalid auth state: session expired');
      loggerSystem.logError(MODULE_NAME, error, { state });
      throw error;
    }
  }

  return true;
}