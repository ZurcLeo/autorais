import { CAIXINHA_ACTIONS } from "../../core/constants/actions";
import { initialCaixinhaState } from "../../core/constants/initialState";

// Reducer for handling caixinha state changes
export const caixinhaReducer = (state = initialCaixinhaState, action) => {
  console.log(`[caixinhaReducer] Recebendo ação: ${action.type}`, {
    payload: action.payload,
    currentState: {...state}
  });
    switch (action.type) {
      case CAIXINHA_ACTIONS.FETCH_START:
        return {
          ...state,
          loading: true,
          error: null
        };
        
      case CAIXINHA_ACTIONS.FETCH_SUCCESS:
        return {
          ...state,
          caixinhas: action.payload || [],
          loading: false,
          error: null,
          lastUpdated: Date.now()
        };
      
      case CAIXINHA_ACTIONS.FETCH_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload,
          lastUpdated: Date.now()
        };
  
      case CAIXINHA_ACTIONS.UPDATE_CAIXINHAS:
        return {
          ...state,
          caixinhas: action.payload,
          lastUpdated: Date.now()
        };
  
      case CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA:
        return {
          ...state,
          currentCaixinha: action.payload,
          lastUpdated: Date.now()
        };
  
      case CAIXINHA_ACTIONS.UPDATE_CONTRIBUTIONS:
        return {
          ...state,
          contributions: action.payload,
          lastUpdated: Date.now()
        };
  
      case CAIXINHA_ACTIONS.SET_ERROR:
        return {
          ...state,
          error: action.payload,
          lastUpdated: Date.now()
        };
  
      case CAIXINHA_ACTIONS.SET_LOADING:
        return {
          ...state,
          loading: action.payload
        };
  
        case CAIXINHA_ACTIONS.UPDATE_MEMBERS:
          return {
            ...state,
            members: action.payload.members || [],
            loading: false,
            lastUpdated: Date.now()
          };

      case CAIXINHA_ACTIONS.CLEAR_STATE:
        return {
          ...initialCaixinhaState,
          loading: false,
          lastUpdated: Date.now()
        };
  
      default:
        return state;
    }
  };