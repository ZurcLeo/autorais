// src/reducers/user/userReducer.js
import { is } from "date-fns/locale";
import { USER_ACTIONS } from "../../core/constants/actions";
import { initialUserState } from "../../core/constants/initialState";
import { coreLogger } from "../../core/logging/CoreLogger";

export const userReducer = (state = initialUserState, action) => {
  // Para fins de debug - pode ser removido em produção
  coreLogger.logEvent('UserReducer', 'DEBUG', `Processando ação: ${action.type}`, {
    payload: action.payload ? { ...action.payload } : null
  });
  
  switch (action.type) {
    case USER_ACTIONS.FETCH_START:
      return {
        ...state,
        userLoading: true,
        userId: action.userId,
        error: null,
        lastUpdated: Date.now()
      };
      
      case USER_ACTIONS.FETCH_USER_SUCCESS:
        // Construir o cache atualizado de usuários
        const updatedUsersById = {
          ...state.usersById,
          ...(action.usersById || {})
        };
        
        return {
          ...state,
          user: state.user,  // Não sobrescrever o usuário atual!
          usersById: updatedUsersById,  // Atualizar o cache
          userLoading: false,
          error: null,
          lastUpdated: Date.now()
        };
    
    case USER_ACTIONS.FETCH_FAILURE:
      const errorMessage = typeof action.user === 'string'
        ? action.user
        : action.error || 'Unknown error fetching user data';
        
      return {
        ...state,
        userLoading: false,
        error: errorMessage,
        lastUpdated: Date.now()
      };

    case USER_ACTIONS.UPDATE_SUCCESS:
      // Se não tivermos perfil, não tentar atualizar
      if (!state.user) {
        return state;
      }
      
      // Dados a serem mesclados ao perfil existente
      const updates = action.user;
      const updatedProfile = { ...state.user, ...updates };
      
      // Se tivermos ID do usuário, atualizar também o cache
      const userId2 = updatedProfile?.uid || updatedProfile?.id;
      const updatedUsersById2 = userId2 ? {
        ...state.usersById,
        [userId2]: updatedProfile
      } : state.usersById;
      
      return {
        ...state,
        user: updatedProfile,
        usersById: updatedUsersById2,
        // userLoading: false,
        lastUpdated: Date.now()
      };
      
    case USER_ACTIONS.USER_PROFILE_COMPLETE:
      return {
        ...state,
        user: action.user,
        authLoading: false,
        userLoading: false,
        currentUser: action.user,
        isAuthenticated: true,
        isFirstAccess: false,
        needsProfileUpdate: false,
        isProfileComplete: true,
        error: null,
        lastUpdated: Date.now()
      };
      
    case USER_ACTIONS.USER_PROFILE_INCOMPLETE:
      return {
        ...state,
        user: action.user,
        // userLoading: false,
        isProfileComplete: false,
        needsProfileCompletion: true,
        error: null,
        lastUpdated: Date.now()
      };

      case USER_ACTIONS.SET_PROFILE_UPDATE_NEEDED:
        return {
          ...state,
          // user: action.user,
          // // userLoading: false,
          // isProfileComplete: false,
          // needsProfileCompletion: true,
          // error: null,
          lastUpdated: Date.now()
        };
      
    case USER_ACTIONS.DELETE_SUCCESS:
      const deleteId = action.userId;
      
      // Se não tivermos ID, não há o que excluir
      if (!deleteId) {
        return state;
      }
      
      // Remover do cache de usuários
      const { [deleteId]: deletedUser, ...remainingUsers } = state.usersById;
      
      // Se for o perfil atual, limpar
      const newUserProfile = state.user && 
        (state.user.uid === deleteId || state.user.id === deleteId)
        ? null
        : state.user;
        
      return {
        ...state,
        user: newUserProfile,
        usersById: remainingUsers,
        // userLoading: false,
        lastUpdated: Date.now()
      };

    case USER_ACTIONS.CLEAR_USER:
      return {
        ...initialUserState,
        lastUpdated: Date.now()
      };
  
    default:
      return state;
  }
};