// src/reducers/auth/authReducer.js
import { AUTH_ACTIONS } from "../../core/constants/actions";
import { initialAuthState } from "../../core/constants/initialState";

export const authReducer = (state = initialAuthState, action) => {
  // Para fins de debug - pode ser removido em produção
  console.log(`[AuthReducer] Recebendo ação: ${action.type}`, {
    payload: action.payload,
    currentState: {...state}
  });
  
  switch (action.type) {
    case AUTH_ACTIONS.SET_FIRST_ACCESS:
      return {
        ...state,
        isFirstAccess: action.payload.isFirstAccess,
        lastUpdated: action.payload.timestamp
      };
    
    case AUTH_ACTIONS.SET_PROFILE_UPDATE_NEEDED:
      return {
        ...state,
        needsProfileUpdate: action.payload.needsProfileUpdate,
        profileUpdateReason: action.payload.reason,
        lastUpdated: action.payload.timestamp
      };

      case AUTH_ACTIONS.PROFILE_UPDATED:
        return {
          ...state,
          needsProfileUpdate: false,
          isFirstAccess: false,
          lastUpdated: action.payload.timestamp
        };

        case AUTH_ACTIONS.REGISTER_START:
          return {
            ...state,
            authLoading: true,
            error: null
          };
        
        case AUTH_ACTIONS.REGISTER_SUCCESS:
          return {
            ...state,
            isAuthenticated: true,
            currentUser: action.payload.user,
            user: action.payload.user,
            authLoading: false,
            isFirstAccess: true, // Novo usuário, então é primeiro acesso
            needsProfileUpdate: true,
            error: null
          };
        
        case AUTH_ACTIONS.REGISTER_FAILURE:
          return {
            ...state,
            authLoading: false,
            error: action.payload.error
          };

    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        authLoading: true,
        error: null,
        lastUpdated: Date.now()
      };
      
      case AUTH_ACTIONS.LOGIN_SUCCESS:
        const userData = action.payload;
        console.log('LOGIN_SUCCESS action.payload:', userData);
        
        return {
          ...state,
         
          authLoading: false,
          isAuthenticated: true,
          userId: userData.userId,
          currentUser: userData.user,
          error: null,
          lastUpdated: Date.now()
        };;
      
    case AUTH_ACTIONS.LOGIN_FAILURE:
      const errorMessage = typeof action.payload === 'string'
        ? action.payload
        : action.payload?.error || 'Unknown authentication error';
        
      return {
        ...state,
        isAuthenticated: false,
        currentUser: null,
        authLoading: false,
        error: errorMessage,
        lastUpdated: Date.now()
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialAuthState,
        authLoading: false,
        lastUpdated: Date.now()
      };
      
    case AUTH_ACTIONS.LOGIN_EXPIRED:
      return {
        ...initialAuthState,
        authLoading: false,
        error: 'Session expired or invalid',
        lastUpdated: Date.now()
      };
      
    case AUTH_ACTIONS.SET_AUTH_LOADING:
      return {
        ...state,
        authLoading: action.payload === true || action.payload === false 
          ? action.payload 
          : false
      };
      
    default:
      return state;
  }
};