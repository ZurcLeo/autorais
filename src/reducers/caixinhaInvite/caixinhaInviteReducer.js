// src/reducers/caixinhaInvite/caixinhaInviteReducer.js
import { CAIXINHA_INVITE_ACTIONS } from "../../core/constants/actions";
import { initialCaixinhaInviteState } from "../../core/constants/initialState";
import { coreLogger } from "../../core/logging";
import { LOG_LEVELS } from "../../core/constants/config";

const MODULE_NAME = 'caixinhaInviteReducer';

/**
 * Reducer para gerenciar o estado de convites de caixinha
 * @param {Object} state - Estado atual
 * @param {Object} action - Ação com type e payload
 * @returns {Object} Novo estado
 */
export const caixinhaInviteReducer = (state = initialCaixinhaInviteState, action) => {
  // Log para debugging
  coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, `Recebendo ação: ${action.type}`, {
    payload: action.payload,
    currentState: {...state}
  });

  switch (action.type) {
    // Ações de carregamento
    case CAIXINHA_INVITE_ACTIONS.CAIXINHA_FETCH_START:
    case CAIXINHA_INVITE_ACTIONS.CAIXINHA_INVITE_START:
    case CAIXINHA_INVITE_ACTIONS.CAIXINHA_ACCEPT_START:
    case CAIXINHA_INVITE_ACTIONS.CAIXINHA_REJECT_START:
    case CAIXINHA_INVITE_ACTIONS.CAIXINHA_CANCEL_START:
      return {
        ...state,
        loading: true,
        error: null
      };
      
    // Ações de falha
    case CAIXINHA_INVITE_ACTIONS.CAIXINHA_FETCH_FAILURE:
    case CAIXINHA_INVITE_ACTIONS.CAIXINHA_INVITE_FAILURE:
    case CAIXINHA_INVITE_ACTIONS.CAIXINHA_ACCEPT_FAILURE:
    case CAIXINHA_INVITE_ACTIONS.CAIXINHA_REJECT_FAILURE:
    case CAIXINHA_INVITE_ACTIONS.CAIXINHA_CANCEL_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        lastUpdated: Date.now()
      };
      
    // Atualização de convites pendentes (recebidos)
    case CAIXINHA_INVITE_ACTIONS.CAIXINHA_UPDATE_PENDING_INVITES:
      // Log para debugging
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Atualizando convites pendentes', {
        count: action.payload.invites?.length || 0
      });
      
      return {
        ...state,
        pendingInvites: action.payload.invites || [],
        loading: false,
        error: null,
        lastUpdated: action.payload.lastUpdated || Date.now(),
        pagination: {
          ...state.pagination,
          totalItems: action.payload.totalCount || action.payload.invites?.length || 0
        }
      };
      
    // Atualização de convites enviados
    case CAIXINHA_INVITE_ACTIONS.CAIXINHA_UPDATE_SENT_INVITES:
      // Log para debugging
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Atualizando convites enviados', {
        count: action.payload.invites?.length || 0
      });
      
      return {
        ...state,
        sentInvites: action.payload.invites || [],
        loading: false,
        error: null,
        lastUpdated: action.payload.lastUpdated || Date.now()
      };
      
    // Sucesso ao enviar convite
    case CAIXINHA_INVITE_ACTIONS.CAIXINHA_INVITE_SUCCESS:
      // Log para debugging
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Processando novo convite enviado', {
        newInvite: !!action.payload.newInvite
      });
      
      // Adicionar o novo convite à lista de enviados
      return {
        ...state,
        sentInvites: action.payload.newInvite 
          ? [action.payload.newInvite, ...state.sentInvites] 
          : state.sentInvites,
        loading: false,
        error: null,
        lastUpdated: action.payload.lastUpdated || Date.now()
      };
      
    // Sucesso ao aceitar convite
    case CAIXINHA_INVITE_ACTIONS.CAIXINHA_ACCEPT_SUCCESS:
      // Log para debugging
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Processando aceitação de convite', {
        caxinhaInviteId: action.payload.caxinhaInviteId
      });
      
      return {
        ...state,
        pendingInvites: state.pendingInvites.filter(
          invite => invite.id !== action.payload.caxinhaInviteId
        ),
        loading: false,
        error: null,
        lastUpdated: action.payload.lastUpdated || Date.now()
      };
      
    // Sucesso ao rejeitar convite
    case CAIXINHA_INVITE_ACTIONS.CAIXINHA_REJECT_SUCCESS:
      // Log para debugging
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Processando rejeição de convite', {
        caxinhaInviteId: action.payload.caxinhaInviteId
      });
      
      return {
        ...state,
        pendingInvites: state.pendingInvites.filter(
          invite => invite.id !== action.payload.caxinhaInviteId
        ),
        loading: false,
        error: null,
        lastUpdated: action.payload.lastUpdated || Date.now()
      };
      
    // Sucesso ao cancelar convite
    case CAIXINHA_INVITE_ACTIONS.CAIXINHA_CANCEL_SUCCESS:
      // Log para debugging
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Processando cancelamento de convite', {
        caxinhaInviteId: action.payload.caxinhaInviteId
      });
      
      return {
        ...state,
        sentInvites: state.sentInvites.filter(
          invite => invite.id !== action.payload.caxinhaInviteId
        ),
        loading: false,
        error: null,
        lastUpdated: action.payload.lastUpdated || Date.now()
      };
      
    // Definir erro
    case CAIXINHA_INVITE_ACTIONS.CAIXINHA_SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        lastUpdated: action.payload.timestamp || Date.now()
      };
      
    // Limpar erro
    case CAIXINHA_INVITE_ACTIONS.CAIXINHA_CLEAR_ERROR:
      return {
        ...state,
        error: null,
        lastUpdated: Date.now()
      };
      
    // Limpar estado
    case CAIXINHA_INVITE_ACTIONS.CAIXINHA_CLEAR_STATE:
      return {
        ...initialCaixinhaInviteState,
        lastUpdated: Date.now()
      };
      
    // Filtrar convites
    case 'caixinhaInvites/SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        },
        lastUpdated: Date.now()
      };
      
    // Atualizar paginação
    case 'caixinhaInvites/SET_PAGINATION':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...action.payload
        },
        lastUpdated: Date.now()
      };
      
    default:
      return state;
  }
};