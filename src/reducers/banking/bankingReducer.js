// src/reducers/banking/bankingReducer.js
import { BANKING_ACTIONS } from '../../core/constants/actions';
import { initialBankingState } from '../../core/constants/initialState';

export const bankingReducer = (state = initialBankingState, action) => {
  console.log(`[bankingReducer] Recebendo ação: ${action.type}`, {
    payload: action.payload,
    currentState: {...state}
  });
  
  switch (action.type) {
    case BANKING_ACTIONS.FETCH_START:
      return {
        ...state,
        loading: true,
        error: null
      };
      
    case BANKING_ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        bankingInfo: action.payload.bankingInfo || null,
        loading: false,
        error: null,
        lastUpdated: Date.now()
      };
      
    case BANKING_ACTIONS.FETCH_FAILURE:
      return {
        ...state,
        error: action.payload.error,
        loading: false
      };
      
    case BANKING_ACTIONS.UPDATE_BANKING_INFO:
      return {
        ...state,
        bankingInfo: action.payload.bankingInfo,
        lastUpdated: Date.now()
      };
      
    case BANKING_ACTIONS.UPDATE_BANKING_HISTORY:
      return {
        ...state,
        bankingHistory: action.payload.history || [],
        lastUpdated: Date.now()
      };
      
    case BANKING_ACTIONS.REGISTER_START:
    case BANKING_ACTIONS.VALIDATE_START:
    case BANKING_ACTIONS.TRANSFER_START:
    case BANKING_ACTIONS.CANCEL_START:
      return {
        ...state,
        loading: true,
        error: null
      };
      
    case BANKING_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        bankingInfo: action.payload.accountData || state.bankingInfo,
        lastUpdated: Date.now()
      };
      
    case BANKING_ACTIONS.VALIDATE_SUCCESS:
    case BANKING_ACTIONS.TRANSFER_SUCCESS:
    case BANKING_ACTIONS.CANCEL_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        lastUpdated: Date.now()
      };
      
    case BANKING_ACTIONS.REGISTER_FAILURE:
    case BANKING_ACTIONS.VALIDATE_FAILURE:
    case BANKING_ACTIONS.TRANSFER_FAILURE:
    case BANKING_ACTIONS.CANCEL_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

      case BANKING_ACTIONS.TRANSACTION_DETAILS_FETCHED:
      return {
        ...state,
        transactionDetails: action.payload.transactionDetails,
        lastUpdated: Date.now()
      };
      
    case BANKING_ACTIONS.TRANSACTION_STATUS_UPDATED:
      return {
        ...state,
        transactionStatuses: {
          ...state.transactionStatuses,
          [action.payload.transactionId]: {
            status: action.payload.status,
            updatedAt: action.payload.updatedAt
          }
        },
        lastUpdated: Date.now()
      };
      
    case BANKING_ACTIONS.BALANCE_UPDATED:
      return {
        ...state,
        balances: {
          ...state.balances,
          [action.payload.accountId]: {
            previous: action.payload.previousBalance,
            current: action.payload.currentBalance,
            updatedAt: action.payload.updatedAt
          }
        },
        lastUpdated: Date.now()
      };
      
    case BANKING_ACTIONS.TRANSACTION_ERROR:
      return {
        ...state,
        transactionErrors: [
          ...(state.transactionErrors || []),
          {
            type: action.payload.errorType,
            message: action.payload.message,
            transactionId: action.payload.transactionId,
            timestamp: Date.now()
          }
        ],
        error: action.payload.message,
        loading: false
      };
      
    case BANKING_ACTIONS.NOTIFICATION_RECEIVED:
      return {
        ...state,
        notifications: [
          ...(state.notifications || []),
          {
            type: action.payload.notificationType,
            message: action.payload.message,
            priority: action.payload.priority,
            timestamp: action.payload.timestamp,
            read: false
          }
        ],
        lastUpdated: Date.now()
      };
      
    case BANKING_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload.error
      };
      
    case BANKING_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    case BANKING_ACTIONS.CLEAR_STATE:
      return initialBankingState;
      
    default:
      return state;
  }
};