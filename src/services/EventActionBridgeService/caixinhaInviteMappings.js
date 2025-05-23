// src/services/EventActionBridgeService/caixinhaInviteMappings.js
import { serviceLocator } from '../../core/services/BaseService';
import { CAIXINHA_INVITE_EVENTS } from '../../core/constants/events';
import { CAIXINHA_INVITE_ACTIONS } from '../../core/constants/actions';
import { coreLogger } from '../../core/logging';
import { LOG_LEVELS } from '../../core/constants/config';

const MODULE_NAME = 'caixinhaInviteMappings';

/**
 * Configura os mapeamentos entre eventos do serviço de convites de caixinha e ações do Redux
 * @param {Object} eventBridgeService - Instância do serviço de ponte de eventos
 */
export const setupCaixinhaInviteMappings = (eventBridgeService) => {
  const eventActionBridgeService = eventBridgeService || 
    serviceLocator.get('eventActionBridge');

  // Log da inicialização do mapeamento para depuração
  coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INITIALIZATION, 'Setting up caixinha invite mappings');

  eventActionBridgeService.registerMappings([
    // Mapeamento para quando os convites são carregados - diferenciando por direção
    {
      serviceName: 'caixinhaInvites',
      eventType: CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITES_FETCHED,
      actionType: (eventData) => {
        // Determinar a action correta com base se são convites recebidos ou enviados
        return eventData.isReceivedInvites 
          ? CAIXINHA_INVITE_ACTIONS.CAIXINHA_UPDATE_PENDING_INVITES
          : CAIXINHA_INVITE_ACTIONS.CAIXINHA_UPDATE_SENT_INVITES;
      },
      transformer: (eventData) => {
        // Log para depuração da transformação
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Transforming invites data', {
          isReceivedInvites: eventData.isReceivedInvites,
          count: eventData.invites?.length || 0
        });
        
        return {
          invites: eventData.invites || [],
          totalCount: eventData.count || eventData.invites?.length || 0,
          lastUpdated: Date.now()
        };
      }
    },
    
    // Mapeamento para quando um convite é enviado
    {
      serviceName: 'caixinhaInvites',
      eventType: CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_SENT,
      actionType: CAIXINHA_INVITE_ACTIONS.CAIXINHA_INVITE_SUCCESS,
      transformer: (eventData) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Processing sent invite', {
          caixinhaId: eventData.caixinhaId,
          inviteId: eventData.invite?.id
        });
        
        return {
          newInvite: eventData.invite,
          caixinhaId: eventData.caixinhaId,
          targetId: eventData.targetId || eventData.invite?.targetId,
          loading: false,
          error: null,
          lastUpdated: eventData.timestamp || Date.now()
        };
      }
    },
    
    // Mapeamento para quando um convite é aceito
    {
      serviceName: 'caixinhaInvites',
      eventType: CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_ACCEPTED,
      actionType: CAIXINHA_INVITE_ACTIONS.CAIXINHA_ACCEPT_SUCCESS,
      transformer: (eventData) => ({
        caxinhaInviteId: eventData.caxinhaInviteId,
        caixinhaId: eventData.caixinhaId,
        userId: eventData.userId,
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para quando um convite é rejeitado
    {
      serviceName: 'caixinhaInvites',
      eventType: CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_REJECTED,
      actionType: CAIXINHA_INVITE_ACTIONS.CAIXINHA_REJECT_SUCCESS,
      transformer: (eventData) => ({
        caxinhaInviteId: eventData.caxinhaInviteId,
        caixinhaId: eventData.caixinhaId,
        userId: eventData.userId,
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para quando um convite é cancelado
    {
      serviceName: 'caixinhaInvites',
      eventType: CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_CANCELED,
      actionType: CAIXINHA_INVITE_ACTIONS.CAIXINHA_CANCEL_SUCCESS,
      transformer: (eventData) => ({
        caxinhaInviteId: eventData.caxinhaInviteId,
        caixinhaId: eventData.caixinhaId,
        senderId: eventData.senderId,
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para erros do serviço de convites
    {
      serviceName: 'caixinhaInvites',
      eventType: CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_ERROR,
      actionType: CAIXINHA_INVITE_ACTIONS.CAIXINHA_SET_ERROR,
      transformer: (eventData) => ({
        error: eventData.error,
        errorDetails: eventData.errorDetails,
        context: eventData.context,
        loading: false,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    
    // Estado de loading para ações que iniciam
    {
      serviceName: 'caixinhaInvites',
      eventType: CAIXINHA_INVITE_EVENTS.CAIXINHA_FETCH_START,
      actionType: CAIXINHA_INVITE_ACTIONS.CAIXINHA_FETCH_START,
      transformer: (eventData) => ({
        loading: true,
        error: null,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para erros de busca
    {
      serviceName: 'caixinhaInvites',
      eventType: CAIXINHA_INVITE_EVENTS.CAIXINHA_FETCH_FAILURE,
      actionType: CAIXINHA_INVITE_ACTIONS.CAIXINHA_FETCH_FAILURE,
      transformer: (eventData) => ({
        error: eventData.error,
        errorDetails: eventData.errorDetails,
        context: eventData.context,
        loading: false,
        timestamp: eventData.timestamp || Date.now()
      })
    }
  ]);
  
  coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Caixinha invite mappings registered successfully');
};