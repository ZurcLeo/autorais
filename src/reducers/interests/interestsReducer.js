// src/reducers/interests/interestsReducer.js
import { coreLogger } from "../../core/logging";
import { INTERESTS_ACTIONS } from "../../core/constants/actions";
import { initialInterestsState } from "../../core/constants/initialState";

/**
 * Reducer para gerenciar o estado relacionado a interesses
 * @param {Object} state - Estado atual
 * @param {Object} action - Ação despachada
 * @returns {Object} Novo estado
 */
export const interestsReducer = (state = initialInterestsState, action) => {
    // Para fins de debug - pode ser removido em produção
  coreLogger.logEvent('INTERESTSREDUCER', 'DEBUG', `Processando ação: ${action.type}`, {
    payload: action.payload ? { ...action.payload } : null
  });
  switch (action.type) {
    // Ações relacionadas a buscar interesses do usuário
    case INTERESTS_ACTIONS.FETCH_USER_INTERESTS_START:
      return {
        ...state,
        loading: {
          ...state.loading,
          userInterests: true
        },
        errors: {
          ...state.errors,
          userInterests: null
        }
      };
    
    case INTERESTS_ACTIONS.FETCH_USER_INTERESTS_SUCCESS:
      return {
        ...state,
        userInterests: action.payload.interests,
        loading: {
          ...state.loading,
          userInterests: false
        },
        errors: {
          ...state.errors,
          userInterests: null
        },
        lastUpdated: new Date().toISOString()
      };
    
    case INTERESTS_ACTIONS.FETCH_USER_INTERESTS_FAILURE:
      return {
        ...state,
        loading: {
          ...state.loading,
          userInterests: false
        },
        errors: {
          ...state.errors,
          userInterests: action.payload
        }
      };
    
    // // Ações relacionadas a buscar categorias e interesses disponíveis
    // case INTERESTS_ACTIONS.FETCH_CATEGORIES_START:
    //   return {
    //     ...state,
    //     loading: {
    //       ...state.loading,
    //       availableInterests: true
    //     },
    //     errors: {
    //       ...state.errors,
    //       availableInterests: null
    //     }
    //   };
    
    case INTERESTS_ACTIONS.FETCH_CATEGORIES_SUCCESS:
      return {
        ...state,
        availableInterests: action.payload.availableInterests,
        loading: {
          ...state.loading,
          availableInterests: false
        },
        errors: {
          ...state.errors,
          availableInterests: null
        },
        lastUpdated: new Date().toISOString()
      };
    
    case INTERESTS_ACTIONS.FETCH_CATEGORIES_FAILURE:
      return {
        ...state,
        loading: {
          ...state.loading,
          availableInterests: false
        },
        errors: {
          ...state.errors,
          availableInterests: action.payload
        }
      };
    
    // Ação para definir interesses disponíveis (usada pelo listener de eventos)
    case INTERESTS_ACTIONS.SET_AVAILABLE_INTERESTS:
      // Verifica se são dados diferentes antes de atualizar o estado
      const currentData = JSON.stringify(state.availableInterests);
      const newData = JSON.stringify(action.payload);
      
      if (currentData === newData) {
        return state; // Nenhuma mudança necessária
      }
      
      return {
        ...state,
        availableInterests: action.payload,
        loading: {
          ...state.loading,
          availableInterests: false
        },
        errors: {
          ...state.errors,
          availableInterests: null
        }
      };
    
    // Ações relacionadas a atualizar interesses do usuário
    case INTERESTS_ACTIONS.UPDATE_INTERESTS_START:
      return {
        ...state,
        loading: {
          ...state.loading,
          updateInterests: true
        },
        errors: {
          ...state.errors,
          updateInterests: null
        }
      };
    
    case INTERESTS_ACTIONS.UPDATE_INTERESTS_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          updateInterests: false
        },
        errors: {
          ...state.errors,
          updateInterests: null
        }
      };
    
    case INTERESTS_ACTIONS.UPDATE_INTERESTS_FAILURE:
      return {
        ...state,
        loading: {
          ...state.loading,
          updateInterests: false
        },
        errors: {
          ...state.errors,
          updateInterests: action.payload
        }
      };
    
    // Ação para atualizar interesses selecionados localmente (sem persistir no backend)
    case INTERESTS_ACTIONS.UPDATE_SELECTED_INTERESTS:
      return {
        ...state,
        selectedInterests: action.payload
      };
    
    default:
      return state;
  }
};