// src/services/EventActionBridgeService/inviteMappings.js
import { serviceLocator } from '../../core/services/BaseService';
import { INVITATION_EVENTS } from '../../core/constants/events';
import { INVITATION_ACTIONS } from '../../core/constants/actions';

export const setupInviteMappings = (eventBridgeService) => {
  const eventActionBridgeService = eventBridgeService || 
    serviceLocator.get('eventActionBridge');

  eventActionBridgeService.registerMappings([
    // Mapeamento para eventos de busca
    {
      serviceName: 'invites',
      eventType: INVITATION_EVENTS.FETCH_START,
      actionType: INVITATION_ACTIONS.FETCH_START,
      transformer: () => ({})
    },
    {
      serviceName: 'invites',
      eventType: INVITATION_EVENTS.INVITATIONS_FETCHED,
      actionType: INVITATION_ACTIONS.FETCH_SUCCESS,
      transformer: (eventData) => ({
        invitations: eventData.invitations || {}
      })
    },
    {
      serviceName: 'invites',
      eventType: INVITATION_EVENTS.FETCH_FAILURE,
      actionType: INVITATION_ACTIONS.FETCH_FAILURE,
      transformer: (eventData) => ({
        error: eventData.error || 'Erro desconhecido ao buscar convites'
      })
    },
    
    // Mapeamento para eventos de envio
    {
      serviceName: 'invites',
      eventType: INVITATION_EVENTS.SEND_START,
      actionType: INVITATION_ACTIONS.SEND_START,
      transformer: () => ({})
    },
    {
      serviceName: 'invites',
      eventType: INVITATION_EVENTS.INVITATION_SENT,
      actionType: INVITATION_ACTIONS.SEND_SUCCESS,
      transformer: (eventData) => ({
        invitation: eventData.invitation
      })
    },
    {
      serviceName: 'invites',
      eventType: INVITATION_EVENTS.SEND_FAILURE,
      actionType: INVITATION_ACTIONS.SEND_FAILURE,
      transformer: (eventData) => ({
        error: eventData.error || 'Erro desconhecido ao enviar convite'
      })
    },
    
    // Mapeamento para atualizações de status
    {
      serviceName: 'invites',
      eventType: INVITATION_EVENTS.INVITATION_CANCELED,
      actionType: INVITATION_ACTIONS.UPDATE_INVITATION,
      transformer: (eventData) => ({
        inviteId: eventData.inviteId,
        updates: { 
          status: 'canceled',
          canceledAt: new Date().toISOString()
        }
      })
    },
    {
      serviceName: 'invites',
      eventType: INVITATION_EVENTS.INVITATION_INVALIDATED,
      actionType: INVITATION_ACTIONS.UPDATE_INVITATION,
      transformer: (eventData) => ({
        inviteId: eventData.inviteId,
        updates: { 
          status: 'invalid',
          invalidatedAt: new Date().toISOString()
        }
      })
    },
    {
      serviceName: 'invites',
      eventType: INVITATION_EVENTS.INVITATION_RESENT,
      actionType: INVITATION_ACTIONS.UPDATE_INVITATION,
      transformer: (eventData) => ({
        inviteId: eventData.inviteId,
        updates: { 
          resent: true,
          resentAt: new Date().toISOString()
        }
      })
    },
    {
      serviceName: 'invites',
      eventType: INVITATION_EVENTS.INVITATION_VALIDATED,
      actionType: INVITATION_ACTIONS.UPDATE_INVITATION,
      transformer: (eventData) => ({
        inviteId: eventData.inviteId,
        updates: { 
          validated: true,
          validatedAt: new Date().toISOString()
        }
      })
    },
    
    // Mapeamento para limpeza de estado
    {
      serviceName: 'invites',
      eventType: INVITATION_EVENTS.INVITATIONS_CLEARED,
      actionType: INVITATION_ACTIONS.CLEAR_STATE,
      transformer: () => ({})
    }
  ]);
};