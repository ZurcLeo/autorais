// src/services/EventActionBridgeService/messageMappings.js
import { serviceLocator } from '../../core/services/BaseService';
import { MESSAGE_EVENTS } from '../../core/constants/events';
import { MESSAGE_ACTIONS } from '../../core/constants/actions';

export const setupMessageMappings = (eventBridgeService) => {

  const eventActionBridgeService = eventBridgeService || 
  serviceLocator.get('eventActionBridge');

  eventActionBridgeService.registerMappings([
    {
      serviceName: 'messages',
      eventType: MESSAGE_EVENTS.FETCH_MESSAGE_SUCCESS,
      actionType: MESSAGE_ACTIONS.FETCH_MESSAGE_SUCCESS,
      transformer: (eventData) => {
        console.log('FETCH_MESSAGE_SUCCESS eventData:', eventData);
        return ({
          messages: eventData?.messages || [],
          conversationId: eventData?.conversationId
        });
      }
    },
    // Atualização de mensagens
    {
      serviceName: 'messages',
      eventType: MESSAGE_EVENTS.UPDATE_MESSAGES,
      actionType: MESSAGE_ACTIONS.UPDATE_MESSAGES,
      transformer: (eventData) => ({
        message: eventData.message,
        conversationId: eventData.conversationId,
        messageId: eventData.messageId,
        deleted: eventData.deleted || false
      })
    },
    
    // Definição de chat ativo
    {
      serviceName: 'messages',
      eventType: MESSAGE_EVENTS.ACTIVE_CHAT_CHANGED,
      actionType: MESSAGE_ACTIONS.SET_ACTIVE_CHAT,
      transformer: (eventData) => ({
        conversationId: eventData.conversationId
      })
    },
    {
      serviceName: 'messages',
      eventType: MESSAGE_EVENTS.RECONCILE_MESSAGE,
      actionType: MESSAGE_ACTIONS.RECONCILE_MESSAGE,
      transformer: (eventData) => ({
        temporaryId: eventData.temporaryId,
        permanentMessage: eventData.permanentMessage
      })
    },
    {
      serviceName: 'messages',
      eventType: MESSAGE_EVENTS.NEW_MESSAGE_RECEIVED,
      actionType: MESSAGE_ACTIONS.UPDATE_MESSAGES,
      transformer: (eventData) => ({
        message: eventData.message,
        conversationId: eventData.conversationId,
        messageId: eventData.messageId,
        deleted: eventData.deleted || false
      })
    },
    // Atualização de última mensagem
    {
      serviceName: 'messages',
      eventType: MESSAGE_EVENTS.UPDATE_LATEST_MESSAGE,
      actionType: MESSAGE_ACTIONS.UPDATE_LATEST_MESSAGE,
      transformer: (eventData) => ({
        conversationId: eventData.conversationId,
        message: eventData.message
      })
    },
    
    // Contagem de não lidos
    {
      serviceName: 'messages',
      eventType: MESSAGE_EVENTS.UPDATE_UNREAD_COUNT,
      actionType: MESSAGE_ACTIONS.UPDATE_UNREAD_COUNT,
      transformer: (eventData) => ({
        conversationId: eventData.conversationId,
        count: eventData.count,
        increment: eventData.increment
      })
    },
    
    // Atualização de status
    {
      serviceName: 'messages',
      eventType: MESSAGE_EVENTS.UPDATE_MESSAGE_STATUS,
      actionType: MESSAGE_ACTIONS.UPDATE_MESSAGE_STATUS,
      transformer: (eventData) => ({
        messageId: eventData.messageId,
        status: eventData.status,
        value: eventData.value
      })
    },
    
    // Status de digitação
    {
      serviceName: 'messages',
      eventType: MESSAGE_EVENTS.UPDATE_TYPING_STATUS,
      actionType: MESSAGE_ACTIONS.UPDATE_TYPING_STATUS,
      transformer: (eventData) => ({
        conversationId: eventData.conversationId,
        isTyping: eventData.isTyping,
        userId: eventData.userId
      })
    },
    
    // Erros
    {
      serviceName: 'messages',
      eventType: MESSAGE_EVENTS.SET_ERROR,
      actionType: MESSAGE_ACTIONS.SET_ERROR,
      transformer: (eventData) => ({
        error: eventData.error
      })
    },
    
    // Limpeza de estado
    {
      serviceName: 'messages',
      eventType: MESSAGE_EVENTS.MESSAGES_CLEARED,
      actionType: MESSAGE_ACTIONS.CLEAR_STATE
    },

    // Mapeamentos para fluxo de escalonamento IA -> Humano
    {
      serviceName: 'messages',
      eventType: MESSAGE_EVENTS.ESCALATION_INITIATED,
      actionType: MESSAGE_ACTIONS.SET_CONVERSATION_STATUS, // Requer nova action ou reutilizar
      transformer: (eventData) => ({
        conversationId: eventData.conversationId,
        status: 'escalation_initiated', // Ex: 'connecting_to_human', 'escalation_requested'
        isLoading: true,
      }),
    },
    {
      serviceName: 'messages',
      eventType: MESSAGE_EVENTS.AI_SUGGESTS_ESCALATION,
      actionType: MESSAGE_ACTIONS.NOTIFY_ESCALATION_SUGGESTION, // Requer nova action
      transformer: (eventData) => ({
        conversationId: eventData.conversationId,
        reason: eventData.reason,
        message: eventData.suggestedMessage || `O assistente virtual sugere transferir para um atendente. Motivo: ${eventData.reason || 'Não especificado'}.`,
      }),
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
      }),
    },
    {
      serviceName: 'messages',
      eventType: MESSAGE_EVENTS.CONVERSATION_ASSIGNED, // Usando CONVERSATION_ASSIGNED
      actionType: MESSAGE_ACTIONS.UPDATE_CONVERSATION_HANDLER, // Requer nova action
      transformer: (eventData) => ({
        conversationId: eventData.conversationId,
        newHandler: eventData.humanAgent, // { id, name, avatar }
        previousHandlerId: eventData.previousAgentId, // e.g., AI_AGENT_USER_ID
        status: 'active_human', // Atualiza o status da conversa
        isLoading: false,
      }),
    },
    {
      serviceName: 'messages',
      eventType: MESSAGE_EVENTS.ESCALATION_FAILED,
      actionType: MESSAGE_ACTIONS.SET_ERROR, // Pode ser um erro específico de conversa
      transformer: (eventData) => ({
        conversationId: eventData.conversationId, // Para erro contextualizado
        error: `Falha no escalonamento: ${eventData.reason || 'Não foi possível conectar com um atendente. Tente novamente.'}`,
        isLoading: false,
      }),
    },
  ]);
};