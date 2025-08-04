// src/services/EventActionBridgeService/supportMappings.js
import { serviceLocator } from '../../core/services/BaseService';
import { SUPPORT_EVENTS, MESSAGE_EVENTS } from '../../core/constants/events';
import { SUPPORT_ACTIONS, MESSAGE_ACTIONS } from '../../core/constants/actions';

export const setupSupportMappings = (eventBridgeService) => {
  const eventActionBridgeService = eventBridgeService || 
    serviceLocator.get('eventActionBridge');

  eventActionBridgeService.registerMappings([
    // ============= MAPEAMENTOS DE ESCALONAMENTO =============
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.ESCALATION_INITIATED,
      actionType: SUPPORT_ACTIONS.ESCALATION_START,
      transformer: (eventData) => ({
        conversationId: eventData.conversationId,
        userId: eventData.userId,
        timestamp: eventData.timestamp || new Date().toISOString()
      })
    },
    
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.ESCALATION_SUCCESS,
      actionType: SUPPORT_ACTIONS.ESCALATION_SUCCESS,
      transformer: (eventData) => ({
        conversationId: eventData.conversationId,
        ticketId: eventData.ticketId,
        status: eventData.status || 'pending',
        timestamp: eventData.timestamp || new Date().toISOString()
      })
    },
    
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.ESCALATION_FAILED,
      actionType: SUPPORT_ACTIONS.ESCALATION_FAILED,
      transformer: (eventData) => ({
        conversationId: eventData.conversationId,
        error: eventData.error || 'Falha no escalonamento',
        timestamp: eventData.timestamp || new Date().toISOString()
      })
    },

    // ============= MAPEAMENTOS DE CRIAÇÃO DE TICKETS =============
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.TICKET_CREATION_START,
      actionType: SUPPORT_ACTIONS.TICKET_CREATION_START,
      transformer: (eventData) => ({
        title: eventData.title,
        category: eventData.category,
        timestamp: new Date().toISOString()
      })
    },
    
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.TICKET_CREATED_SUCCESS,
      actionType: SUPPORT_ACTIONS.TICKET_CREATED_SUCCESS,
      transformer: (eventData) => ({
        ticket: eventData.ticket,
        timestamp: new Date().toISOString()
      })
    },
    
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.TICKET_CREATION_FAILED,
      actionType: SUPPORT_ACTIONS.TICKET_CREATION_FAILED,
      transformer: (eventData) => ({
        error: eventData.error || 'Erro ao criar ticket',
        ticketData: eventData.ticketData,
        timestamp: new Date().toISOString()
      })
    },

    // ============= MAPEAMENTOS DE BUSCA DE TICKETS =============
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.FETCH_TICKETS_START,
      actionType: SUPPORT_ACTIONS.FETCH_TICKETS_START,
      transformer: (eventData) => ({
        type: eventData.type || 'general', // pending, my, all
        filters: eventData.filters || {},
        timestamp: new Date().toISOString()
      })
    },
    
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.FETCH_USER_TICKETS_START,
      actionType: SUPPORT_ACTIONS.FETCH_USER_TICKETS_START,
      transformer: (eventData) => ({
        options: eventData.options || {},
        timestamp: new Date().toISOString()
      })
    },
    
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.FETCH_USER_TICKETS_SUCCESS,
      actionType: SUPPORT_ACTIONS.FETCH_USER_TICKETS_SUCCESS,
      transformer: (eventData) => ({
        tickets: eventData.tickets || [],
        totalCount: eventData.totalCount || eventData.tickets?.length || 0,
        timestamp: new Date().toISOString()
      })
    },
    
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.FETCH_USER_TICKETS_FAILURE,
      actionType: SUPPORT_ACTIONS.FETCH_USER_TICKETS_FAILURE,
      transformer: (eventData) => ({
        error: eventData.error || 'Erro ao buscar tickets do usuário',
        timestamp: new Date().toISOString()
      })
    },
    
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.FETCH_PENDING_TICKETS_SUCCESS,
      actionType: SUPPORT_ACTIONS.FETCH_PENDING_TICKETS_SUCCESS,
      transformer: (eventData) => ({
        tickets: eventData.tickets || [],
        totalCount: eventData.totalCount || eventData.tickets?.length || 0,
        timestamp: new Date().toISOString()
      })
    },
    
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.FETCH_MY_TICKETS_SUCCESS,
      actionType: SUPPORT_ACTIONS.FETCH_MY_TICKETS_SUCCESS,
      transformer: (eventData) => ({
        tickets: eventData.tickets || [],
        status: eventData.status || 'assigned',
        totalCount: eventData.totalCount || eventData.tickets?.length || 0,
        timestamp: new Date().toISOString()
      })
    },
    
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.FETCH_TICKETS_FAILURE,
      actionType: SUPPORT_ACTIONS.FETCH_TICKETS_FAILURE,
      transformer: (eventData) => ({
        error: eventData.error || 'Erro ao buscar tickets',
        type: eventData.type || 'general',
        timestamp: new Date().toISOString()
      })
    },

    // ============= MAPEAMENTOS DE ATRIBUIÇÃO DE TICKETS =============
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.TICKET_ASSIGNMENT_START,
      actionType: SUPPORT_ACTIONS.ASSIGN_TICKET_START,
      transformer: (eventData) => ({
        ticketId: eventData.ticketId,
        agentId: eventData.agentId,
        timestamp: new Date().toISOString()
      })
    },
    
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.TICKET_ASSIGNED_SUCCESS,
      actionType: SUPPORT_ACTIONS.ASSIGN_TICKET_SUCCESS,
      transformer: (eventData) => ({
        ticket: eventData.ticket,
        timestamp: new Date().toISOString()
      })
    },
    
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.TICKET_ASSIGNMENT_FAILED,
      actionType: SUPPORT_ACTIONS.ASSIGN_TICKET_FAILURE,
      transformer: (eventData) => ({
        ticketId: eventData.ticketId,
        agentId: eventData.agentId,
        error: eventData.error || 'Erro ao atribuir ticket',
        timestamp: new Date().toISOString()
      })
    },

    // ============= MAPEAMENTOS DE RESOLUÇÃO DE TICKETS =============
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.TICKET_RESOLUTION_START,
      actionType: SUPPORT_ACTIONS.RESOLVE_TICKET_START,
      transformer: (eventData) => ({
        ticketId: eventData.ticketId,
        resolutionNotes: eventData.resolutionNotes,
        timestamp: new Date().toISOString()
      })
    },
    
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.TICKET_RESOLVED_SUCCESS,
      actionType: SUPPORT_ACTIONS.RESOLVE_TICKET_SUCCESS,
      transformer: (eventData) => ({
        ticket: eventData.ticket,
        timestamp: new Date().toISOString()
      })
    },
    
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.TICKET_RESOLUTION_FAILED,
      actionType: SUPPORT_ACTIONS.RESOLVE_TICKET_FAILURE,
      transformer: (eventData) => ({
        ticketId: eventData.ticketId,
        error: eventData.error || 'Erro ao resolver ticket',
        timestamp: new Date().toISOString()
      })
    },

    // ============= MAPEAMENTOS DE ATUALIZAÇÃO DE TICKETS =============
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.TICKET_UPDATED,
      actionType: SUPPORT_ACTIONS.UPDATE_TICKET,
      transformer: (eventData) => ({
        ticket: eventData.ticket,
        changes: eventData.changes || {},
        updatedBy: eventData.updatedBy,
        timestamp: new Date().toISOString()
      })
    },
    
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.NEW_TICKET_CREATED,
      actionType: SUPPORT_ACTIONS.ADD_TICKET,
      transformer: (eventData) => ({
        ticket: eventData.ticket,
        timestamp: new Date().toISOString()
      })
    },

    // ============= MAPEAMENTOS DE STATUS DE TICKETS =============
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.TICKET_STATUS_UPDATE_START,
      actionType: SUPPORT_ACTIONS.TICKET_STATUS_UPDATE_START,
      transformer: (eventData) => ({
        ticketId: eventData.ticketId,
        status: eventData.status,
        timestamp: new Date().toISOString()
      })
    },
    
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.TICKET_STATUS_UPDATED,
      actionType: SUPPORT_ACTIONS.TICKET_STATUS_UPDATED,
      transformer: (eventData) => ({
        ticket: eventData.ticket,
        timestamp: new Date().toISOString()
      })
    },
    
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.TICKET_STATUS_UPDATE_FAILED,
      actionType: SUPPORT_ACTIONS.TICKET_STATUS_UPDATE_FAILED,
      transformer: (eventData) => ({
        ticketId: eventData.ticketId,
        status: eventData.status,
        error: eventData.error || 'Erro ao atualizar status do ticket',
        timestamp: new Date().toISOString()
      })
    },

    // ============= MAPEAMENTOS DE DETALHES E CATEGORIAS =============
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.TICKET_DETAILS_LOADED,
      actionType: SUPPORT_ACTIONS.TICKET_DETAILS_LOADED,
      transformer: (eventData) => ({
        ticket: eventData.ticket,
        timestamp: new Date().toISOString()
      })
    },
    
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.TICKETS_BY_CATEGORY_LOADED,
      actionType: SUPPORT_ACTIONS.TICKETS_BY_CATEGORY_LOADED,
      transformer: (eventData) => ({
        category: eventData.category,
        tickets: eventData.tickets || [],
        totalCount: eventData.totalCount || eventData.tickets?.length || 0,
        timestamp: new Date().toISOString()
      })
    },

    // ============= MAPEAMENTOS DE ANALYTICS =============
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.ANALYTICS_LOADED,
      actionType: SUPPORT_ACTIONS.LOAD_METRICS,
      transformer: (eventData) => ({
        metrics: eventData.analytics,
        timestamp: new Date().toISOString()
      })
    },

    // ============= MAPEAMENTOS DE CONVERSA DE TICKETS =============
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.TICKET_CONVERSATION_LOADED,
      actionType: SUPPORT_ACTIONS.LOAD_TICKET_CONVERSATION,
      transformer: (eventData) => ({
        ticketId: eventData.ticketId,
        messages: eventData.messages || [],
        totalCount: eventData.totalCount || eventData.messages?.length || 0,
        timestamp: new Date().toISOString()
      })
    },
    
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.TICKET_NOTE_ADDED,
      actionType: SUPPORT_ACTIONS.ADD_TICKET_NOTE,
      transformer: (eventData) => ({
        ticketId: eventData.ticketId,
        note: eventData.note,
        timestamp: new Date().toISOString()
      })
    },

    // ============= MAPEAMENTOS DE EVENTOS DE MENSAGENS (SUPORTE) =============
    // Estes eventos vêm do MessageService mas afetam o estado de suporte
    {
      serviceName: 'messages',
      eventType: MESSAGE_EVENTS.ESCALATION_INITIATED,
      actionType: MESSAGE_ACTIONS.SET_CONVERSATION_STATUS,
      transformer: (eventData) => ({
        conversationId: eventData.conversationId,
        status: 'escalation_initiated',
        isLoading: true,
        timestamp: new Date().toISOString()
      })
    },
    
    {
      serviceName: 'messages',
      eventType: MESSAGE_EVENTS.AI_SUGGESTS_ESCALATION,
      actionType: MESSAGE_ACTIONS.NOTIFY_ESCALATION_SUGGESTION,
      transformer: (eventData) => ({
        conversationId: eventData.conversationId,
        reason: eventData.reason,
        message: eventData.suggestedMessage || `O assistente virtual sugere transferir para um atendente. Motivo: ${eventData.reason || 'Não especificado'}.`,
        timestamp: new Date().toISOString()
      })
    },
    
    {
      serviceName: 'messages',
      eventType: MESSAGE_EVENTS.ESCALATION_PENDING,
      actionType: MESSAGE_ACTIONS.SET_CONVERSATION_STATUS,
      transformer: (eventData) => ({
        conversationId: eventData.conversationId,
        status: 'escalation_pending',
        queuePosition: eventData.queuePosition,
        estimatedWaitTime: eventData.estimatedWaitTime,
        isLoading: true,
        timestamp: new Date().toISOString()
      })
    },
    
    {
      serviceName: 'messages',
      eventType: MESSAGE_EVENTS.CONVERSATION_ASSIGNED,
      actionType: MESSAGE_ACTIONS.UPDATE_CONVERSATION_HANDLER,
      transformer: (eventData) => ({
        conversationId: eventData.conversationId,
        newHandler: eventData.humanAgent, // { id, name, avatar }
        previousHandlerId: eventData.previousAgentId,
        status: 'active_human',
        isLoading: false,
        timestamp: new Date().toISOString()
      })
    },
    
    {
      serviceName: 'messages',
      eventType: MESSAGE_EVENTS.ESCALATION_FAILED,
      actionType: SUPPORT_ACTIONS.SET_ERROR,
      transformer: (eventData) => ({
        conversationId: eventData.conversationId,
        error: `Falha no escalonamento: ${eventData.reason || 'Não foi possível conectar com um atendente. Tente novamente.'}`,
        type: 'escalation',
        timestamp: new Date().toISOString()
      })
    },

    // ============= MAPEAMENTOS DE ERROS GERAIS =============
    {
      serviceName: 'support',
      eventType: SUPPORT_EVENTS.SUPPORT_ERROR,
      actionType: SUPPORT_ACTIONS.SET_ERROR,
      transformer: (eventData) => ({
        error: eventData.error || 'Erro no sistema de suporte',
        type: eventData.type || 'general',
        context: eventData.context || {},
        timestamp: new Date().toISOString()
      })
    }
  ]);
};