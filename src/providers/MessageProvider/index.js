// src/providers/MessageProvider/index.js - Adaptado para o novo sistema
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { messageReducer } from '../../reducers/messages/messageReducer';
import { useAuth } from '../AuthProvider';
import { MESSAGE_ACTIONS } from '../../core/constants/actions';
import { serviceEventHub, serviceLocator } from '../../core/services/BaseService';
import socket from '../../services/socketService';
import { adaptMessage } from '../../utils/messageAdapter';
import { initialMessageState } from '../../core/constants/initialState';
import { MESSAGE_EVENTS } from '../../core/constants/events';

const MessageContext = createContext(null);
const MODULE_NAME = 'messages';

export const MessageProvider = ({ children }) => {
  const [state, dispatch] = useReducer(messageReducer, initialMessageState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [messagesError, setMessagesError] = useState(null);

  // Inicializar serviços
  let messageService;
  let serviceStore;
  let serviceMes;
  
  try {
    messageService = serviceLocator.get('messages');
    serviceStore = serviceLocator.get('store').getState()?.auth;
    serviceMes = serviceLocator.get('store').getState()?.messages;
  } catch (err) {
    console.messagesError('Error accessing services:', err);
    setMessagesError(err);
  }
 
  const { isAuthenticated, authLoading, currentUser } = serviceStore || {};
  
  // Inicialização do sistema de mensagens
  useEffect(() => {

    async function initMessages() {
      if (!authLoading && isAuthenticated && currentUser) {
        try {
          // Set loading state before fetching
          dispatch({ 
            type: MESSAGE_ACTIONS.FETCH_START
          });
          
          // Primeiro buscamos as conversas do usuário
          const conversations = await messageService.fetchAllConversations();
          
          // Verificar se temos conversas válidas
          if (!conversations || !Array.isArray(conversations)) {
            console.warn('Backend returned invalid conversations format:', conversations);
            dispatch({ 
              type: MESSAGE_ACTIONS.FETCH_SUCCESS, 
              payload: { messages: [] } 
            });
            
            dispatch({ 
              type: MESSAGE_ACTIONS.UPDATE_ACTIVE_CHATS, 
              payload: { conversations: [] } 
            });
            
            setIsInitialized(true);
            return;
          }
          
          // Adaptar conversas para o formato esperado pelo sistema atual
          const adaptedConversations = conversations.map(conv => ({
            id: conv.id,
            conversationId: conv.id,
            otherUserId: conv.with,
            otherUserName: conv.withName || '',
            otherUserPhoto: conv.withPhoto || '',
            lastMessage: {
              text: conv.lastMessage?.text || '',
              sender: conv.lastMessage?.sender || '',
              timestamp: conv.lastMessage?.timestamp || new Date().toISOString()
            },
            unreadCount: conv.unreadCount || 0
          }));
          
          // Atualizar estado com as conversas
          dispatch({ 
            type: MESSAGE_ACTIONS.UPDATE_ACTIVE_CHATS, 
            payload: { conversations: adaptedConversations } 
          });
          
          // Buscar as mensagens mais recentes para preview
          const messages = await messageService.fetchAllMessages();
          
          // Validar formato da resposta
          if (!messages || !Array.isArray(messages)) {
            console.warn('Backend returned invalid messages format:', messages);
            dispatch({ 
              type: MESSAGE_ACTIONS.FETCH_SUCCESS, 
              payload: { messages: [] } 
            });
            setIsInitialized(true);
            return;
          }
          
          // Atualizar estado com as mensagens
          dispatch({ 
            type: MESSAGE_ACTIONS.FETCH_SUCCESS, 
            payload: { messages } 
          });
          
          setIsInitialized(true);
          
        } catch (error) {
          console.error('Falha ao inicializar serviço de mensagens:', error);
          dispatch({ 
            type: MESSAGE_ACTIONS.FETCH_FAILURE, 
            payload: { error: error.message || 'Erro desconhecido ao buscar mensagens' } 
          });
          
          // Inicializar com arrays vazios em caso de erro
          dispatch({ 
            type: MESSAGE_ACTIONS.FETCH_SUCCESS, 
            payload: { messages: [] } 
          });
          
          dispatch({ 
            type: MESSAGE_ACTIONS.UPDATE_ACTIVE_CHATS, 
            payload: { conversations: [] } 
          });
          
          setIsInitialized(true);
        }
      }
    }
    
    if (isAuthenticated && currentUser && !isInitialized) {
      initMessages();
    }
    
    return () => {
      if (isInitialized) {
        messageService.stop();
        setIsInitialized(false);
      }
    };
  }, [isAuthenticated, currentUser, authLoading, isInitialized, dispatch]);

  // Escutar eventos de mensagens
  useEffect(() => {
    if (!isInitialized) return;
    
    const handleNewMessage = (data) => {
      console.log('Nova mensagem recebida:', data);
      
      // Adaptar para o formato esperado pelo sistema
      const adaptedMessage = {
        id: data.id,
        conversationId: data.conversationId,
        uidRemetente: data.sender,
        uidDestinatario: data.uidDestinatario || currentUser?.uid,
        conteudo: data.content || data.conteudo,
        tipo: data.type || data.tipo || 'texto',
        timestamp: data.timestamp || new Date().toISOString(),
        entregue: data.status?.delivered || data.entregue || false,
        lido: data.status?.read || data.lido || false,
        visto: data.status?.read || data.visto || false
      };
      
      // Atualizar mensagens
      dispatch({ 
        type: MESSAGE_ACTIONS.UPDATE_MESSAGES, 
        payload: { message: adaptedMessage } 
      });
      
      // Atualizar última mensagem da conversa
      dispatch({ 
        type: MESSAGE_ACTIONS.UPDATE_LATEST_MESSAGE, 
        payload: { 
          conversationId: adaptedMessage.conversationId,
          message: adaptedMessage 
        } 
      });
      
      // Atualizar contagem de não lidos se for uma mensagem recebida
      if (adaptedMessage.uidDestinatario === currentUser?.uid && !adaptedMessage.lido) {
        dispatch({ 
          type: MESSAGE_ACTIONS.UPDATE_UNREAD_COUNT, 
          payload: { 
            userId: adaptedMessage.uidRemetente,
            increment: 1 
          } 
        });
      }
    };
    
    // Configurar escutas para eventos
    const subscriptions = [
      serviceEventHub.on(
        'messages', 
        MESSAGE_EVENTS.FETCH_SUCCESS, 
        (data) => {
          console.log('verificando', data);
        dispatch({ 
          type: MESSAGE_ACTIONS.FETCH_SUCCESS, 
          payload: { messages: data.messages || [] } 
        });
      }),
      
      serviceEventHub.on(
        'messages', 
        MESSAGE_EVENTS.FETCH_FAILURE, 
        (data) => {
        dispatch({ 
          type: MESSAGE_ACTIONS.FETCH_FAILURE, 
          payload: data 
        });
      }),
      
      serviceEventHub.on(
        'messages', 
        MESSAGE_EVENTS.UPDATE_MESSAGES, 
        handleNewMessage),
      
      serviceEventHub.on(
        'messages', 
        MESSAGE_EVENTS.RECONCILE_MESSAGE, 
        (data) => {
        dispatch({ 
          type: MESSAGE_ACTIONS.RECONCILE_MESSAGE, 
          payload: data 
        });
      }),
      
      serviceEventHub.on(
        'messages', 
        MESSAGE_EVENTS.UPDATE_UNREAD_COUNT, 
        (data) => {
        dispatch({ 
          type: MESSAGE_ACTIONS.UPDATE_UNREAD_COUNT, 
          payload: data 
        });
      }),
      
      serviceEventHub.on(
        'messages', 
        MESSAGE_EVENTS.UPDATE_LATEST_MESSAGE, 
        (data) => {
        dispatch({ 
          type: MESSAGE_ACTIONS.UPDATE_LATEST_MESSAGE, 
          payload: data 
        });
      }),
      
      serviceEventHub.on(
        'messages', 
        MESSAGE_EVENTS.SET_ERROR, 
        (data) => {
        dispatch({ 
          type: MESSAGE_ACTIONS.FETCH_FAILURE, 
          payload: data 
        });
      }),
      
      serviceEventHub.on(
        'messages', 
        MESSAGE_EVENTS.MESSAGES_CLEARED, 
        () => {
        dispatch({ type: MESSAGE_ACTIONS.CLEAR_STATE });
      })
    ];
    
    // Ouvir eventos de socket
    socket.on('new_message', handleNewMessage);
    
    return () => {
      // Limpar todas as inscrições
      subscriptions.forEach(unsubscribe => unsubscribe());
      socket.off('new_message', handleNewMessage);
    };
  }, [isInitialized, currentUser]);
  
  // Métodos de API expostos para componentes
  const fetchMessages = async (otherUserId) => {
    if (!isAuthenticated || !currentUser) {
      return Promise.reject(new Error('Usuário não autenticado'));
    }
    
    try {

      const conversationId = [currentUser.uid, otherUserId].sort().join('_');

      const messages = await messageService.fetchMessagesByConversation(otherUserId);
      
      // Construir ID da conversa
      // const conversationId = messageService._getConversationId(currentUser.uid, otherUserId);
      
      dispatch({ 
        type: MESSAGE_ACTIONS.UPDATE_CONVERSATION_MESSAGES, 
        payload: { 
          conversationId,
          messages,
          userIds: [currentUser.uid, otherUserId]
        } 
      });
      
      return messages;
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      
      dispatch({ 
        type: MESSAGE_ACTIONS.SET_ERROR, 
        payload: { error: error.message } 
      });
      return [];
    }
  };
  
  const createMessage = async (messageData) => {
    if (!isAuthenticated || !currentUser) {
      return Promise.reject(new Error('Usuário não autenticado'));
    }
    
    try {
      // Adaptar dados para compatibilidade com o novo serviço
      const newMessage = await messageService.createMessage({
        uidDestinatario: messageData.uidDestinatario,
        conteudo: messageData.conteudo,
        tipo: messageData.tipo || 'text'
      });
      
      return newMessage;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      dispatch({ 
        type: MESSAGE_ACTIONS.SET_ERROR, 
        payload: { error: error.message } 
      });
      throw error;
    }
  };
  
  const markMessagesAsRead = async (conversationId) => {
    if (!isAuthenticated || !currentUser || !conversationId) {
      return Promise.resolve({ count: 0 });
    }
    
    try {
      // Não precisamos verificar a existência localmente já que o backend cuida disso
      // A verificação de existência e criação da conversa é responsabilidade do modelo
      const result = await messageService.markMessagesAsRead(conversationId);
      
      // Atualizar o estado local
      if (result.count > 0) {
        dispatch({ 
          type: MESSAGE_ACTIONS.UPDATE_UNREAD_COUNT, 
          payload: { 
            conversationId,
            count: 0
          } 
        });
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
      
      dispatch({ 
        type: MESSAGE_ACTIONS.SET_ERROR, 
        payload: { error: error.message } 
      });
      
      // Retornar objeto com contagem zero em caso de erro
      return { count: 0 };
    }
  };
  
  const updateMessageStatus = (conversationId, messageId, status) => {
    if (!conversationId || !messageId || !status) return;
    
    messageService.updateMessageStatus(conversationId, messageId, { [status]: true })
      .catch(error => {
        console.error('Erro ao atualizar status da mensagem:', error);
      });
    
    // Atualizar localmente sem esperar pela resposta da API
    dispatch({ 
      type: MESSAGE_ACTIONS.UPDATE_MESSAGE_STATUS, 
      payload: { conversationId, messageId, status, value: true } 
    });
  };
  
  const deleteMessage = async (conversationId, messageId) => {
    if (!isAuthenticated || !conversationId || !messageId) {
      return Promise.reject(new Error('Parâmetros inválidos'));
    }
    
    try {
      const result = await messageService.deleteMessage(conversationId, messageId);
      
      // Atualizar o estado local
      dispatch({ 
        type: MESSAGE_ACTIONS.UPDATE_MESSAGES, 
        payload: { 
          conversationId, 
          messageId, 
          deleted: true 
        } 
      });
      
      return result;
    } catch (error) {
      console.error('Erro ao excluir mensagem:', error);
      dispatch({ 
        type: MESSAGE_ACTIONS.SET_ERROR, 
        payload: { error: error.message } 
      });
      throw error;
    }
  };
  
  const setActiveChat = (conversationId) => {
    // Evitar disparar se o chat já estiver ativo
    if (state.activeChat === conversationId) {
      return;
    }
    
    // Atualizar o estado
    dispatch({ 
      type: MESSAGE_ACTIONS.SET_ACTIVE_CHAT, 
      payload: { conversationId } 
    });
    
    // Se temos um ID de conversa, marcar mensagens como lidas
    // mas com um pequeno atraso para evitar problemas com mudanças rápidas
    if (conversationId && currentUser?.uid) {
      setTimeout(() => {
        markMessagesAsRead(conversationId, currentUser.uid).catch(error => {
          console.warn("Falha não crítica ao marcar mensagens como lidas:", error);
        });
      }, 300);
    }
  };
  
  // Expor estado e métodos para componentes
  const value = {
    ...state,
    isInitialized,
    fetchMessages,
    createMessage,
    sendMessage: createMessage, // Alias para compatibilidade
    markMessagesAsRead,
    updateMessageStatus,
    deleteMessage,
    setActiveChat
  };
  
  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages deve ser usado dentro de um MessageProvider');
  }
  return context;
};