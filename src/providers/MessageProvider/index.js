// src/providers/MessageProvider/index.js - Versão Aprimorada
import React, { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';
import { messageReducer } from '../../reducers/messages/messageReducer';
import { useAuth } from '../AuthProvider';
import { MESSAGE_ACTIONS } from '../../core/constants/actions';
import { serviceEventHub, serviceLocator } from '../../core/services/BaseService';
import socket from '../../services/socketService';
import { initialMessageState } from '../../core/constants/initialState';
import { MESSAGE_EVENTS } from '../../core/constants/events';

const MessageContext = createContext(null);
const MODULE_NAME = 'messages';

export const MessageProvider = ({ children }) => {
  const [state, dispatch] = useReducer(messageReducer, initialMessageState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [messagesError, setMessagesError] = useState(null);
  
  // Referências para rastrear estado e evitar chamadas duplas
  const activeSocketRooms = useRef(new Set());
  const messagesBeingMarkedAsRead = useRef(new Set());
  const lastMessageFetch = useRef({});
  const activeChatRef = useRef(null);
  
  // Inicializar serviços
  let messageService;
  let serviceStore;
  
  try {
    messageService = serviceLocator.get('messages');
    serviceStore = serviceLocator.get('store').getState()?.auth;
  } catch (err) {
    console.error('Error accessing services:', err);
    setMessagesError(err);
  }
  
  const { isAuthenticated, authLoading, currentUser } = serviceStore || {};
  
  // ---- Efeito de inicialização única ----
  useEffect(() => {
    if (authLoading || !isAuthenticated || !currentUser || isInitialized) return;

    const initializeMessageSystem = async () => {
      try {
        console.log('[MessageProvider] Inicializando sistema de mensagens');
        
        // Definir estado de carregamento
        dispatch({ type: MESSAGE_ACTIONS.FETCH_START });
        
        // 1. Buscar conversas
        const conversations = await messageService.fetchAllConversations();
        
        // Verificar formato e validar
        if (!conversations || !Array.isArray(conversations)) {
          console.warn('[MessageProvider] Formato inválido de conversas:', conversations);
          dispatch({ 
            type: MESSAGE_ACTIONS.FETCH_MESSAGE_SUCCESS, 
            payload: { messages: [] } 
          });
          dispatch({ 
            type: MESSAGE_ACTIONS.UPDATE_ACTIVE_CHATS, 
            payload: { conversations: [] } 
          });
          setIsInitialized(true);
          return;
        }
        
        // 2. Adaptar e atualizar conversas no estado
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
        
        dispatch({ 
          type: MESSAGE_ACTIONS.UPDATE_ACTIVE_CHATS, 
          payload: { conversations: adaptedConversations } 
        });
        
        // 3. Buscar mensagens recentes (apenas preview)
        const messages = await messageService.fetchAllMessages();
        
        if (Array.isArray(messages)) {
          dispatch({ 
            type: MESSAGE_ACTIONS.FETCH_MESSAGE_SUCCESS, 
            payload: { messages } 
          });
        }
        
        // 4. Configurar socket global e armazenar subscriptions
        const eventSubscriptions = setupSocketListeners();
        
        setIsInitialized(true);
        console.log('[MessageProvider] Sistema de mensagens inicializado com sucesso');
        
        // Retornar função para limpar listeners e subscriptions
        return () => {
          if (isInitialized) {
            cleanupSocketListeners(eventSubscriptions);
            setIsInitialized(false);
          }
        };
      } catch (error) {
        console.error('[MessageProvider] Falha ao inicializar:', error);
        
        dispatch({ 
          type: MESSAGE_ACTIONS.FETCH_FAILURE, 
          payload: { error: error.message || 'Erro desconhecido' } 
        });
        
        // Inicializar com arrays vazios mesmo em caso de erro
        dispatch({ 
          type: MESSAGE_ACTIONS.FETCH_MESSAGE_SUCCESS, 
          payload: { messages: [] } 
        });
        
        dispatch({ 
          type: MESSAGE_ACTIONS.UPDATE_ACTIVE_CHATS, 
          payload: { conversations: [] } 
        });
        
        setIsInitialized(true);
      }
    };
    
    initializeMessageSystem();
    // A função de cleanup já é retornada pelo bloco try/catch acima
  }, [isAuthenticated, currentUser, authLoading, isInitialized]);
  
  // ---- Escuta de eventos de mensagens ----
  const setupSocketListeners = () => {
    if (!currentUser) return;
    
    // Handler para novas mensagens
    const handleNewMessage = (data) => {
      if (!data) return;
      
      console.log('[MessageProvider] Nova mensagem recebida:', data);
      
      // Adaptar para o formato esperado pelo sistema
      const adaptedMessage = {
        id: data.id,
        conversationId: data.conversationId,
        uidRemetente: data.sender,
        uidDestinatario: data.recipient || currentUser?.uid,
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
      
      // Verificar se é um chat ativo para marcação automática como lida
      if (
        adaptedMessage.uidDestinatario === currentUser?.uid && 
        !adaptedMessage.lido &&
        adaptedMessage.conversationId === activeChatRef.current
      ) {
        // Marcar como lida automaticamente se estiver visualizando o chat
        markMessagesAsRead(adaptedMessage.conversationId);
      } else if (adaptedMessage.uidDestinatario === currentUser?.uid && !adaptedMessage.lido) {
        // Caso contrário, atualizar contador
        dispatch({ 
          type: MESSAGE_ACTIONS.UPDATE_UNREAD_COUNT, 
          payload: { 
            userId: adaptedMessage.uidRemetente,
            increment: 1 
          } 
        });
      }
    };
    
    // Registrar no socket
    socket.on('new_message', handleNewMessage);
    
    // Eventos de status de mensagem
    socket.on('message_status_update', (data) => {
      if (!data || !data.messageId || !data.status) return;
      
      dispatch({ 
        type: MESSAGE_ACTIONS.UPDATE_MESSAGE_STATUS, 
        payload: { 
          conversationId: data.conversationId, 
          messageId: data.messageId, 
          status: data.status, 
          value: true 
        } 
      });
    });
    
    // Eventos de exclusão de mensagem
    socket.on('message_deleted', (data) => {
      if (!data || !data.messageId) return;
      
      dispatch({ 
        type: MESSAGE_ACTIONS.UPDATE_MESSAGES, 
        payload: { 
          conversationId: data.conversationId, 
          messageId: data.messageId, 
          deleted: true 
        } 
      });
    });
    
    // Eventos de digitação
    socket.on('typing_status', (data) => {
      if (!data || !data.conversationId || !data.senderId) return;
      
      // Apenas processar eventos de outros usuários
      if (data.senderId !== currentUser?.uid) {
        dispatch({
          type: MESSAGE_ACTIONS.UPDATE_TYPING_STATUS,
          payload: {
            conversationId: data.conversationId,
            userId: data.senderId,
            isTyping: data.isTyping
          }
        });
      }
    });
    
    // --- Registrar handlers para eventos do serviceEventHub ---
    const subscriptions = [
      // Eventos de mensagens
      serviceEventHub.on(
        'messages', 
        MESSAGE_EVENTS.FETCH_MESSAGE_SUCCESS, 
        (data) => {
          dispatch({ 
            type: MESSAGE_ACTIONS.FETCH_MESSAGE_SUCCESS, 
            payload: { messages: data.messages || [] } 
          });
          console.log('[MessageProvider] Evento FETCH_MESSAGE_SUCCESS recebido');
        }
      ),
      
      serviceEventHub.on(
        'messages', 
        MESSAGE_EVENTS.FETCH_FAILURE, 
        (data) => {
          dispatch({ 
            type: MESSAGE_ACTIONS.FETCH_FAILURE, 
            payload: data 
          });
          console.log('[MessageProvider] Evento FETCH_FAILURE recebido');
        }
      ),
      
      serviceEventHub.on(
        'messages', 
        MESSAGE_EVENTS.UPDATE_MESSAGES, 
        (data) => {
          if (data.message) {
            dispatch({ 
              type: MESSAGE_ACTIONS.UPDATE_MESSAGES, 
              payload: { message: data.message } 
            });
          } else if (data.messageId && data.deleted) {
            dispatch({ 
              type: MESSAGE_ACTIONS.UPDATE_MESSAGES, 
              payload: { 
                conversationId: data.conversationId, 
                messageId: data.messageId, 
                deleted: true 
              } 
            });
          }
          console.log('[MessageProvider] Evento UPDATE_MESSAGES recebido');
        }
      ),
      
      serviceEventHub.on(
        'messages', 
        MESSAGE_EVENTS.RECONCILE_MESSAGE, 
        (data) => {
          dispatch({ 
            type: MESSAGE_ACTIONS.RECONCILE_MESSAGE, 
            payload: data 
          });
          console.log('[MessageProvider] Evento RECONCILE_MESSAGE recebido');
        }
      ),
      
      serviceEventHub.on(
        'messages', 
        MESSAGE_EVENTS.UPDATE_UNREAD_COUNT, 
        (data) => {
          dispatch({ 
            type: MESSAGE_ACTIONS.UPDATE_UNREAD_COUNT, 
            payload: data 
          });
          console.log('[MessageProvider] Evento UPDATE_UNREAD_COUNT recebido');
        }
      ),
      
      serviceEventHub.on(
        'messages', 
        MESSAGE_EVENTS.UPDATE_LATEST_MESSAGE, 
        (data) => {
          dispatch({ 
            type: MESSAGE_ACTIONS.UPDATE_LATEST_MESSAGE, 
            payload: data 
          });
          console.log('[MessageProvider] Evento UPDATE_LATEST_MESSAGE recebido');
        }
      ),
      
      serviceEventHub.on(
        'messages', 
        MESSAGE_EVENTS.SET_ERROR, 
        (data) => {
          dispatch({ 
            type: MESSAGE_ACTIONS.FETCH_FAILURE, 
            payload: data 
          });
          console.log('[MessageProvider] Evento SET_ERROR recebido');
        }
      ),
      
      serviceEventHub.on(
        'messages', 
        MESSAGE_EVENTS.MESSAGES_CLEARED, 
        () => {
          dispatch({ type: MESSAGE_ACTIONS.CLEAR_STATE });
          console.log('[MessageProvider] Evento MESSAGES_CLEARED recebido');
        }
      )
    ];
    
    // Armazenar as assinaturas para limpeza
    return subscriptions;
  };
  
  const cleanupSocketListeners = (subscriptions = []) => {
    // Limpar listeners de socket
    socket.off('new_message');
    socket.off('message_status_update');
    socket.off('message_deleted');
    socket.off('typing_status');
    
    // Sair de todas as salas
    activeSocketRooms.current.forEach(roomId => {
      socket.emit('leave_chat', roomId);
    });
    
    activeSocketRooms.current.clear();
    
    // Cancelar todas as inscrições de eventos
    if (Array.isArray(subscriptions)) {
      subscriptions.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    }
    
    console.log('[MessageProvider] Limpeza de listeners realizada');
  };
  
  // ---- Métodos de API expostos para componentes ----
  
  /**
   * Busca mensagens para uma conversa específica
   * @param {string} otherUserId - ID do outro usuário na conversa
   * @returns {Promise<Array>} - Lista de mensagens
   */
  const fetchMessages = async (otherUserId) => {
    if (!isAuthenticated || !currentUser || !otherUserId) {
      return Promise.reject(new Error('Parâmetros inválidos'));
    }
    
    // Criar ID da conversa
    const conversationId = _getConversationId(currentUser.uid, otherUserId);
    
    // Verificar se já buscou recentemente (evitar múltiplas chamadas)
    const now = Date.now();
    const lastFetch = lastMessageFetch.current[conversationId] || 0;
    
    // Se já buscou nos últimos 2 segundos, não buscar novamente
    if (now - lastFetch < 2000) {
      console.log('[MessageProvider] Ignorando busca duplicada para:', conversationId);
      return state.messages.filter(msg => 
        msg.conversationId === conversationId ||
        (msg.uidRemetente === currentUser.uid && msg.uidDestinatario === otherUserId) ||
        (msg.uidRemetente === otherUserId && msg.uidDestinatario === currentUser.uid)
      );
    }
    
    try {
      // Registrar timestamp da busca
      lastMessageFetch.current[conversationId] = now;
      
      console.log('[MessageProvider] Buscando mensagens para conversa:', conversationId);
      
      const messages = await messageService.fetchMessagesByConversation(otherUserId);
      
      // Juntar mensagens com o ID da conversa para garantir consistência
      const messagesWithConversationId = Array.isArray(messages) ? messages.map(msg => ({
        ...msg,
        conversationId
      })) : [];
      
      dispatch({ 
        type: MESSAGE_ACTIONS.UPDATE_CONVERSATION_MESSAGES, 
        payload: { 
          conversationId,
          messages: messagesWithConversationId,
          userIds: [currentUser.uid, otherUserId]
        } 
      });
      
      // Entrar na sala de socket se ainda não estiver
      joinChatRoom(conversationId);
      
      return messagesWithConversationId;
    } catch (error) {
      console.error('[MessageProvider] Erro ao buscar mensagens:', error);
      
      dispatch({ 
        type: MESSAGE_ACTIONS.SET_ERROR, 
        payload: { error: error.message } 
      });
      
      return [];
    }
  };
  
  /**
   * Entra em uma sala de chat via socket
   * @param {string} conversationId - ID da conversa
   */
  const joinChatRoom = (conversationId) => {
    if (!conversationId || !socket || !socket.connected) return;
    
    // Verificar se já está na sala
    if (activeSocketRooms.current.has(conversationId)) {
      return;
    }
    
    socket.emit('join_chat', conversationId);
    activeSocketRooms.current.add(conversationId);
    
    console.log('[MessageProvider] Entrou na sala:', conversationId);
  };
  
  /**
   * Sai de uma sala de chat via socket
   * @param {string} conversationId - ID da conversa
   */
  const leaveChatRoom = (conversationId) => {
    if (!conversationId || !socket || !socket.connected) return;
    
    socket.emit('leave_chat', conversationId);
    activeSocketRooms.current.delete(conversationId);
    
    console.log('[MessageProvider] Saiu da sala:', conversationId);
  };
  
  /**
   * Cria uma nova mensagem
   * @param {Object} messageData - Dados da mensagem
   * @returns {Promise<Object>} - Mensagem criada
   */
  const createMessage = async (messageData) => {
    if (!isAuthenticated || !currentUser) {
      return Promise.reject(new Error('Usuário não autenticado'));
    }
    
    try {
      // Enviar via service (que já cuida do socket/API)
      const newMessage = await messageService.createMessage({
        uidDestinatario: messageData.uidDestinatario,
        conteudo: messageData.conteudo,
        tipo: messageData.tipo || 'text'
      });
      
      return newMessage;
    } catch (error) {
      console.error('[MessageProvider] Erro ao enviar mensagem:', error);
      
      dispatch({ 
        type: MESSAGE_ACTIONS.SET_ERROR, 
        payload: { error: error.message } 
      });
      
      throw error;
    }
  };
  
  /**
   * Marca mensagens de uma conversa como lidas
   * @param {string} conversationId - ID da conversa
   * @returns {Promise<Object>} - Resultado da operação
   */
  const markMessagesAsRead = async (conversationId) => {
    if (!isAuthenticated || !currentUser || !conversationId) {
      return Promise.resolve({ count: 0 });
    }
    
    // Verificar se já está marcando como lido para evitar chamadas duplicadas
    if (messagesBeingMarkedAsRead.current.has(conversationId)) {
      console.log('[MessageProvider] Já está marcando mensagens como lidas para:', conversationId);
      return Promise.resolve({ count: 0 });
    }
    
    try {
      messagesBeingMarkedAsRead.current.add(conversationId);
      
      console.log('[MessageProvider] Marcando mensagens como lidas para:', conversationId);
      
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
      
      messagesBeingMarkedAsRead.current.delete(conversationId);
      
      return result;
    } catch (error) {
      console.error('[MessageProvider] Erro ao marcar mensagens como lidas:', error);
      
      messagesBeingMarkedAsRead.current.delete(conversationId);
      
      dispatch({ 
        type: MESSAGE_ACTIONS.SET_ERROR, 
        payload: { error: error.message } 
      });
      
      return { count: 0 };
    }
  };
  
  /**
   * Atualiza o status de uma mensagem
   * @param {string} conversationId - ID da conversa
   * @param {string} messageId - ID da mensagem
   * @param {string} status - Status (delivered, read)
   */
  const updateMessageStatus = (conversationId, messageId, status) => {
    if (!conversationId || !messageId || !status) return;
    
    messageService.updateMessageStatus(conversationId, messageId, { [status]: true })
      .catch(error => {
        console.error('[MessageProvider] Erro ao atualizar status da mensagem:', error);
      });
    
    // Atualizar localmente sem esperar pela resposta da API
    dispatch({ 
      type: MESSAGE_ACTIONS.UPDATE_MESSAGE_STATUS, 
      payload: { conversationId, messageId, status, value: true } 
    });
  };
  
  /**
   * Exclui uma mensagem
   * @param {string} conversationId - ID da conversa
   * @param {string} messageId - ID da mensagem
   * @returns {Promise<Object>} - Resultado da operação
   */
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
      console.error('[MessageProvider] Erro ao excluir mensagem:', error);
      
      dispatch({ 
        type: MESSAGE_ACTIONS.SET_ERROR, 
        payload: { error: error.message } 
      });
      
      throw error;
    }
  };
  
  /**
   * Define o chat ativo e executa operações necessárias
   * @param {string} conversationId - ID da conversa
   */
  const setActiveChat = (conversationId) => {
    // Evitar redefinir se for o mesmo
    if (state.activeChat === conversationId) {
      return;
    }
    
    const previousChat = activeChatRef.current;
    
    // Atualizar referência e estado
    activeChatRef.current = conversationId;
    
    dispatch({ 
      type: MESSAGE_ACTIONS.SET_ACTIVE_CHAT, 
      payload: { conversationId } 
    });
    
    // Se estiver mudando de chat, sair do anterior
    if (previousChat && previousChat !== conversationId) {
      leaveChatRoom(previousChat);
    }
    
    // Se temos um novo chat ativo, entrar na sala e marcar como lido
    if (conversationId) {
      joinChatRoom(conversationId);
      
      // Marcar mensagens como lidas com um pequeno atraso
      // para garantir que o estado já tenha sido atualizado
      setTimeout(() => {
        markMessagesAsRead(conversationId).catch(error => {
          console.warn("[MessageProvider] Falha não crítica ao marcar mensagens como lidas:", error);
        });
      }, 300);
    }
  };
  
  /**
   * Atualiza o status de digitação
   * @param {string} conversationId - ID da conversa
   * @param {boolean} isTyping - Status de digitação
   */
  const updateTypingStatus = (conversationId, isTyping) => {
    if (!conversationId || !socket || !socket.connected) return;
    
    socket.emit('typing_status', {
      conversationId,
      isTyping
    });
  };
  
  /**
   * Helper para construir IDs de conversa consistentes
   * @private
   */
  const _getConversationId = (userIdA, userIdB) => {
    return [userIdA, userIdB].sort().join('_');
  };
  
  // Expor estado e métodos para componentes
  const value = {
    ...state,
    isInitialized,
    error: messagesError,
    fetchMessages,
    createMessage,
    sendMessage: createMessage, // Alias para compatibilidade
    markMessagesAsRead,
    updateMessageStatus,
    deleteMessage,
    setActiveChat,
    updateTypingStatus,
    joinChatRoom,
    leaveChatRoom
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