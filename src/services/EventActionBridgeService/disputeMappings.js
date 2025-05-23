// src/services/EventActionBridgeService/disputeMappings.js
import { serviceLocator } from '../../core/services/BaseService';
import { DISPUTE_EVENTS } from '../../core/constants/events';
import { DISPUTE_ACTIONS } from '../../core/constants/actions';

export const setupDisputeMappings = (eventBridgeService) => {
  const eventActionBridgeService = eventBridgeService || 
  serviceLocator.get('eventActionBridge');

  eventActionBridgeService.registerMappings([
    // Mapeamento para quando as disputas são carregadas
    {
      serviceName: 'disputes',
      eventType: DISPUTE_EVENTS.DISPUTES_FETCHED,
      actionType: DISPUTE_ACTIONS.FETCH_SUCCESS,
      transformer: (eventData) => ({
        disputes: eventData.disputes || [],
        caixinhaId: eventData.caixinhaId,
        count: eventData.count,
        status: eventData.status,
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para quando detalhes de uma disputa são carregados
    {
      serviceName: 'disputes',
      eventType: DISPUTE_EVENTS.DISPUTE_DETAILS_FETCHED,
      actionType: DISPUTE_ACTIONS.UPDATE_DISPUTE_DETAILS,
      transformer: (eventData) => ({
        dispute: eventData.dispute,
        caixinhaId: eventData.caixinhaId,
        disputeId: eventData.disputeId,
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para quando uma disputa é criada
    {
      serviceName: 'disputes',
      eventType: DISPUTE_EVENTS.DISPUTE_CREATED,
      actionType: DISPUTE_ACTIONS.UPDATE_DISPUTES,
      transformer: (eventData) => ({
        dispute: eventData.dispute,
        caixinhaId: eventData.caixinhaId,
        type: eventData.type,
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para quando um voto é registrado
    {
      serviceName: 'disputes',
      eventType: DISPUTE_EVENTS.DISPUTE_VOTED,
      actionType: DISPUTE_ACTIONS.UPDATE_DISPUTE_DETAILS,
      transformer: (eventData) => ({
        dispute: eventData.result,
        caixinhaId: eventData.caixinhaId,
        disputeId: eventData.disputeId,
        vote: eventData.vote,
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para quando uma disputa é resolvida
    {
      serviceName: 'disputes',
      eventType: DISPUTE_EVENTS.DISPUTE_RESOLVED,
      actionType: DISPUTE_ACTIONS.UPDATE_DISPUTE_DETAILS,
      transformer: (eventData) => ({
        dispute: eventData.dispute,
        caixinhaId: eventData.caixinhaId,
        disputeId: eventData.disputeId,
        result: eventData.result,
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para quando uma disputa é cancelada
    {
      serviceName: 'disputes',
      eventType: DISPUTE_EVENTS.DISPUTE_CANCELED,
      actionType: DISPUTE_ACTIONS.UPDATE_DISPUTE_DETAILS,
      transformer: (eventData) => ({
        dispute: eventData.dispute,
        caixinhaId: eventData.caixinhaId,
        disputeId: eventData.disputeId,
        reason: eventData.reason,
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Estado de loading para ações que iniciam
    {
      serviceName: 'disputes',
      eventType: DISPUTE_EVENTS.FETCH_START,
      actionType: DISPUTE_ACTIONS.FETCH_START,
      transformer: (eventData) => ({
        loading: true,
        error: null,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para erros
    {
      serviceName: 'disputes',
      eventType: DISPUTE_EVENTS.FETCH_FAILURE,
      actionType: DISPUTE_ACTIONS.FETCH_FAILURE,
      transformer: (eventData) => ({
        error: eventData.error,
        errorDetails: eventData.errorDetails,
        loading: false,
        timestamp: eventData.timestamp || Date.now()
      })
    }
  ]);
  
  console.log('[DisputeMappings] Dispute mappings registered successfully');
};