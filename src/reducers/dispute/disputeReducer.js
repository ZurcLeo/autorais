// src/reducers/dispute/disputeReducer.js
import { DISPUTE_ACTIONS } from "../../core/constants/actions";
import { initialDisputeState } from "../../core/constants/initialState";

export const disputeReducer = (state = initialDisputeState, action) => {
  console.log(`[disputeReducer] Recebendo ação: ${action.type}`, {
    payload: action.payload,
    currentState: {...state}
  });

  switch (action.type) {
    case DISPUTE_ACTIONS.FETCH_START:
      return {
        ...state,
        loading: true,
        error: null
      };
        
    case DISPUTE_ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        disputes: action.payload.disputes || [],
        activeDisputes: (action.payload.disputes || []).filter(dispute => 
          dispute.status === 'OPEN'
        ),
        resolvedDisputes: (action.payload.disputes || []).filter(dispute => 
          ['APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED'].includes(dispute.status)
        ),
        loanDisputes: (action.payload.disputes || []).filter(dispute => 
          dispute.type === 'LOAN_APPROVAL'
        ),
        loading: false,
        error: null,
        lastUpdated: Date.now()
      };
      
    case DISPUTE_ACTIONS.FETCH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        lastUpdated: Date.now()
      };

    case DISPUTE_ACTIONS.UPDATE_DISPUTES:
      const updatedDisputes = action.payload.dispute 
        ? [...state.disputes.filter(d => d.id !== action.payload.dispute.id), action.payload.dispute]
        : state.disputes;
        
      return {
        ...state,
        disputes: updatedDisputes,
        activeDisputes: updatedDisputes.filter(dispute => 
          dispute.status === 'OPEN'
        ),
        resolvedDisputes: updatedDisputes.filter(dispute => 
          ['APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED'].includes(dispute.status)
        ),
        loanDisputes: updatedDisputes.filter(dispute => 
          dispute.type === 'LOAN_APPROVAL'
        ),
        lastUpdated: Date.now()
      };

    case DISPUTE_ACTIONS.UPDATE_DISPUTE_DETAILS:
      // Atualiza uma disputa específica na lista
      const updatedDisputesList = state.disputes.map(dispute => 
        dispute.id === action.payload.disputeId ? action.payload.dispute : dispute
      );
      
      // Se a disputa não existe na lista, adiciona
      const disputeExists = state.disputes.some(dispute => dispute.id === action.payload.disputeId);
      if (!disputeExists && action.payload.dispute) {
        updatedDisputesList.push(action.payload.dispute);
      }
      
      return {
        ...state,
        disputes: updatedDisputesList,
        currentDispute: action.payload.dispute,
        activeDisputes: updatedDisputesList.filter(dispute => 
          dispute.status === 'OPEN'
        ),
        resolvedDisputes: updatedDisputesList.filter(dispute => 
          ['APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED'].includes(dispute.status)
        ),
        loanDisputes: updatedDisputesList.filter(dispute => 
          dispute.type === 'LOAN_APPROVAL'
        ),
        lastUpdated: Date.now()
      };

    case DISPUTE_ACTIONS.UPDATE_DISPUTE_STATS:
      return {
        ...state,
        disputeStats: {
          ...state.disputeStats,
          ...action.payload.stats
        },
        lastUpdated: Date.now()
      };

    case DISPUTE_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        lastUpdated: Date.now()
      };

    case DISPUTE_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case DISPUTE_ACTIONS.CLEAR_STATE:
      return {
        ...initialDisputeState,
        lastUpdated: Date.now()
      };

    default:
      return state;
  }
};