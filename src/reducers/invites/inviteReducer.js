// src/reducers/invites/inviteReducer.js
import { INVITATION_ACTIONS } from '../../core/constants/actions';
import { initialInviteState } from '../../core/constants/initialState';

export const inviteReducer = (state = initialInviteState, action) => {
  console.log(`[inviteReducer] Recebendo ação: ${action.type}`, {
    payload: action.payload,
    currentState: {...state}
  });
  switch (action.type) {
    case INVITATION_ACTIONS.FETCH_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
      
    case INVITATION_ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        sentInvitations: Array.isArray(action.payload) ? action.payload : [],
        invitations: action.payload.invitations || [],
        isLoading: false,
        error: null,
        lastUpdated: Date.now()
      };
      
    case INVITATION_ACTIONS.FETCH_FAILURE:
      return {
        ...state,
        error: action.payload.error,
        isLoading: false
      };
      
    case INVITATION_ACTIONS.SEND_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
      
    case INVITATION_ACTIONS.SEND_SUCCESS:
      return {
        ...state,
        sentInvitations: [...state.sentInvitations, action.payload.invitation],
        isLoading: false,
        error: null
      };
      
    case INVITATION_ACTIONS.SEND_FAILURE:
      return {
        ...state,
        error: action.payload.error,
        isLoading: false
      };
      
    case INVITATION_ACTIONS.UPDATE_INVITATION:
      return {
        ...state,
        sentInvitations: state.sentInvitations.map(invite => 
          invite.id === action.payload.inviteId 
            ? { ...invite, ...action.payload.updates }
            : invite
        )
      };
      
    case INVITATION_ACTIONS.REMOVE_INVITATION:
      return {
        ...state,
        sentInvitations: state.sentInvitations.filter(
          invite => invite.id !== action.payload.inviteId
        )
      };
      
    case INVITATION_ACTIONS.CLEAR_STATE:
      return initialInviteState;
      
    default:
      return state;
  }
};