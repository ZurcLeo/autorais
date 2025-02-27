// src/reducers/messageReducer.js
import { coreLogger as CoreLogger} from "../../core/logging";
const MODULE_NAME = 'MessageReducer';

/**
 * Action types for message state management
 * These constants define all possible actions that can modify the message state
 */
export const MESSAGE_ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  UPDATE_MESSAGES: 'UPDATE_MESSAGES',
  UPDATE_UNREAD_COUNT: 'UPDATE_UNREAD_COUNT',
  UPDATE_LATEST_MESSAGE: 'UPDATE_LATEST_MESSAGE',
  UPDATE_ACTIVE_CHATS: 'UPDATE_ACTIVE_CHATS',
  SET_ERROR: 'SET_ERROR',
  SET_LOADING: 'SET_LOADING',
  CLEAR_STATE: 'CLEAR_STATE'
};

/**
 * Initial state for the message context
 * This represents the starting point for our message management system
 */
export const initialMessageState = {
  messages: [],               // Array of all messages
  unreadCount: 0,            // Number of unread messages
  latestMessage: null,       // Most recent message
  activeChats: new Set(),    // Set of active chat user IDs
  loading: true,             // Loading state indicator
  error: null,               // Error state
  lastUpdated: null          // Timestamp of last state update
};

/**
 * Message reducer function
 * Handles all state transitions for the message context
 * 
 * @param {Object} state - Current state
 * @param {Object} action - Action object containing type and payload
 * @returns {Object} New state
 */
export const messageReducer = (state, action) => {
  const startTime = performance.now();
  let newState;

  try {
    newState = processReducerAction(state, action);
    
    CoreLogger.logStateChange(MODULE_NAME, state, newState, action.type, {
      duration: performance.now() - startTime
    });

    return newState;
  } catch (error) {
    CoreLogger.logError(MODULE_NAME, error, {
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
 * Helper function to process reducer actions
 * Separates the core state transition logic for better error handling
 */
function processReducerAction(state, action) {
  switch (action.type) {
    case MESSAGE_ACTIONS.FETCH_START:
      return {
        ...state,
        loading: true,
        error: null
      };
      
    case MESSAGE_ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        ...action.payload,
        loading: false,
        error: null,
        lastUpdated: Date.now()
      };
    
    case MESSAGE_ACTIONS.FETCH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        lastUpdated: Date.now()
      };

    case MESSAGE_ACTIONS.UPDATE_MESSAGES:
      return {
        ...state,
        messages: action.payload,
        lastUpdated: Date.now()
      };

    case MESSAGE_ACTIONS.UPDATE_UNREAD_COUNT:
      // Ensure unread count never goes below 0
      return {
        ...state,
        unreadCount: Math.max(0, action.payload),
        lastUpdated: Date.now()
      };

    case MESSAGE_ACTIONS.UPDATE_LATEST_MESSAGE:
      return {
        ...state,
        latestMessage: action.payload,
        lastUpdated: Date.now()
      };

    case MESSAGE_ACTIONS.UPDATE_ACTIVE_CHATS:
      return {
        ...state,
        activeChats: action.payload,
        lastUpdated: Date.now()
      };

    case MESSAGE_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        lastUpdated: Date.now()
      };

    case MESSAGE_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case MESSAGE_ACTIONS.CLEAR_STATE:
      return {
        ...initialMessageState,
        loading: false,
        lastUpdated: Date.now()
      };

    default:
      CoreLogger.logWarning(MODULE_NAME, `Unknown action type: ${action.type}`);
      return state;
  }
}

/**
 * Validates the shape of the message state
 * Used for debugging and ensuring state integrity
 */
export function validateMessageState(state) {
  const requiredKeys = [
    'messages',
    'unreadCount',
    'latestMessage',
    'activeChats',
    'loading',
    'error',
    'lastUpdated'
  ];

  const missingKeys = requiredKeys.filter(key => !(key in state));
  
  if (missingKeys.length > 0) {
    const error = new Error(`Invalid message state: missing keys ${missingKeys.join(', ')}`);
    CoreLogger.logError(MODULE_NAME, error, { state });
    throw error;
  }

  if (state.unreadCount < 0) {
    const error = new Error('Invalid message state: unreadCount cannot be negative');
    CoreLogger.logError(MODULE_NAME, error, { state });
    throw error;
  }

  return true;
}