  import { VALIDATION_ACTIONS } from "../../core/constants/actions";
  import { initialValidationState } from "../../core/constants/initialState";

  export const validationReducer = (state = initialValidationState, action) => {
    switch (action.type) {
      case VALIDATION_ACTIONS.SET_ERRORS: {
        const newErrors = new Map(action.payload);
        if (newErrors.size === state.errors.size && [...newErrors.keys()].every(k => state.errors.has(k))) {
          return state; // 🚀 Evita re-render desnecessário se os erros não mudaram
        }
        return { ...state, errors: newErrors };
      }
  
      case VALIDATION_ACTIONS.SET_DIRTY_FIELDS: {
        const newDirtyFields = new Set([...state.dirtyFields, ...action.payload]);
        if (newDirtyFields.size === state.dirtyFields.size) {
          return state; // 🚀 Evita re-render se não houver mudança
        }
        return { ...state, dirtyFields: newDirtyFields };
      }
  
      case VALIDATION_ACTIONS.SET_IS_VALIDATING:
        return state.isValidating === action.payload ? state : { ...state, isValidating: action.payload };
  
      case VALIDATION_ACTIONS.RESET_VALIDATION:
        return initialValidationState; // 🚀 Retorna um novo objeto inicial para evitar mutação
  
      default:
        return state;
    }
  };
  