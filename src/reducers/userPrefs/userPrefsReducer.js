import { USER_PREFS_ACTIONS } from "../../core/constants/actions";
import {PREFERENCE_CATEGORIES} from "../../core/constants/config"
import { initialUserPrefsReducerState } from "../../core/constants/initialState";
/**
 * Reducer para gerenciar o estado de preferências do usuário
 */
export const userPrefsReducer = (state = initialUserPrefsReducerState, action) => {
    // Para depuração
    if (process.env.NODE_ENV !== 'production') {
      console.log('UserPrefs action:', action.type, action.payload);
    }
  
    switch (action.type) {
      case USER_PREFS_ACTIONS.INITIALIZE_SUCCESS:
        return {
          ...state,
          initialized: true,
          loading: false,
          preferences: action.payload.preferences || state.preferences
        };
        
      case USER_PREFS_ACTIONS.LOAD_SUCCESS:
        return {
          ...state,
          loading: false,
          preferences: action.payload.preferences || state.preferences
        };
        
        case USER_PREFS_ACTIONS.UPDATE_SUCCESS:
          return {
            ...state, // Preservar todo o estado
            preferences: {
              ...state.preferences, // Preservar preferências existentes
              [action.payload.category]: action.payload.values
            }
          };
        
      case USER_PREFS_ACTIONS.RESET_SUCCESS:
        return {
          ...state,
          loading: false,
          preferences: action.payload.preferences || initialUserPrefsReducerState.preferences
        };
        
      case USER_PREFS_ACTIONS.IMPORT_SUCCESS:
        return {
          ...state,
          loading: false,
          preferences: action.payload.preferences || state.preferences
        };
        
      case USER_PREFS_ACTIONS.OPERATION_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload.error
        };
        
      case USER_PREFS_ACTIONS.COOKIE_CONSENT_SET:
        return {
          ...state,
          cookieConsent: {
            given: true,
            timestamp: action.payload.consentTimestamp,
            preferences: action.payload.cookiePreferences
          },
          preferences: {
            ...state.preferences,
            [PREFERENCE_CATEGORIES.COOKIES]: action.payload.cookiePreferences
          }
        };
        
      case USER_PREFS_ACTIONS.THEME_CHANGED:
        return {
          ...state,
          preferences: {
            ...state.preferences,
            [PREFERENCE_CATEGORIES.THEME]: action.payload.themePreferences
          }
        };
        
      case USER_PREFS_ACTIONS.LANGUAGE_CHANGED:
        return {
          ...state,
          preferences: {
            ...state.preferences,
            [PREFERENCE_CATEGORIES.LANGUAGE]: action.payload.languagePreferences
          }
        };
        
      case USER_PREFS_ACTIONS.ACCESSIBILITY_CHANGED:
        return {
          ...state,
          preferences: {
            ...state.preferences,
            [PREFERENCE_CATEGORIES.ACCESSIBILITY]: action.payload.accessibilityPreferences
          }
        };
        
      default:
        return state;
    }
  };
  
  export default userPrefsReducer;