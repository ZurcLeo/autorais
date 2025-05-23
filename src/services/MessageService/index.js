// src/services/MessageService/index.js - Adaptado para o novo sistema
import { BaseService, serviceLocator } from '../../core/services/BaseService';
import { LOG_LEVELS } from '../../core/constants/config';
import { coreLogger } from '../../core/logging';
import { MESSAGE_EVENTS } from '../../core/constants/events';
import { adaptMessage } from '../../utils/messageAdapter';
import socket from '../socketService';
import { SERVICE_ACTIONS } from '../../core/constants/actions';

const MODULE_NAME = 'messages';

class MessageService extends BaseService {
    constructor() {
        super(MODULE_NAME);
        this.instanceId = Math.random().toString(36).substring(2, 10);

        this._currentUser = null;
        this._conversationsCache = new Map();
        this._socketInitialized = false;
        this._activeRooms = new Set();
        this._currentlyMarkingAsRead = new Set();
        this._isInitialized = false;

        this._metadata = {
            name: MODULE_NAME,
            phase: 'COMMUNICATION',
            criticalPath: true,
            dependencies: ['auth', 'users'],
            category: 'communications',
            description: 'Gerencia Chats e Mensagens.'
        };

        this._log(`📊 Nova instância de MessageService criada, instanceId: ${this.instanceId}`);
        this.apiService = serviceLocator.get('apiService');
        this.authService = serviceLocator.get('auth');
        this.socketService = serviceLocator.get('socketService');

    }

    async initialize() {
        if (this.isInitialized) 
            return this;
        
        try {
            this._log(MODULE_NAME, 
              LOG_LEVELS.INITIALIZATION, 
              'MessageService initialized', 
              { timestamp: Date.now() });

              this._initializeSocket();

            this._isInitialized = true;

            this._emitEvent(SERVICE_ACTIONS.SERVICE_READY, {
                serviceName: MODULE_NAME,
                timestamp: new Date().toISOString()
            });

            return this;
        } catch (error) {
            this._logError(error, 'initialize');
            throw error;
        }
    }

    getCurrentUser() {
        return this.authService.getCurrentUser();
    }

    /**
     * Verifica a saúde do serviço
     * @returns {Promise<Object>} Estado de saúde do serviço
     */
    async healthCheck() {
        try {
            const healthResponse = await this._executeWithRetry(async () => {
                return await this.apiService.get(`/api/health/service/${this.serviceName}`);
            }, 'healthCheck');

            return {status: healthResponse.data.status, timestamp: Date.now()};
        } catch (error) {
            this._log(
                MODULE_NAME,
                LOG_LEVELS.WARNING,
                'Health check endpoint unavailable, proceeding with degraded mode',
                {error: error.message}
            );

            return {
                status: 'degraded', 
                details: 'Operating in offline mode', 
                timestamp: Date.now(), 
                error: error.message
            };
        }
    }

    /**
     * Busca todas as conversas do usuário
     * @returns {Promise<Array>} Lista de conversas
     */
    async fetchAllConversations() {
        this._currentUser = this.authService.getCurrentUser();

        if (!this._currentUser) {
            throw new Error('Usuário não autenticado');
        }

        this._emitEvent(MESSAGE_EVENTS.FETCH_START);

        try {
            const response = await this._executeWithRetry(async () => {
                return await this.apiService.get(`/api/messages/conversations`);
            }, 'fetchAllConversations');

            // Verificar resposta
            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao buscar conversas');
            }

            const conversations = response.data.data || [];
            
            // Atualizar cache
            conversations.forEach(conversation => {
                this._conversationsCache.set(conversation.id, conversation);
            });
            this._emitEvent(
                
                MESSAGE_EVENTS.FETCH_MESSAGE_SUCCESS,
                { conversations }
            );
            
            return conversations;
        } catch (error) {
            this._logError(error, 'fetchAllConversations');
            this._emitEvent(
                
                MESSAGE_EVENTS.FETCH_FAILURE,
                { error: error.message }
            );
            throw error;
        }
    }

    /**
     * Busca todas as mensagens para mostrar no dashboard
     * @returns {Promise<Array>} Lista de todas as mensagens
     */
    async fetchAllMessages() {
        this._currentUser = this.authService.getCurrentUser();

        if (!this._currentUser) {
            throw new Error('Usuário não autenticado');
        }

        this._emitEvent(MESSAGE_EVENTS.FETCH_START);

        try {
            // Primeiro buscar conversas
            const conversations = await this.fetchAllConversations();
            
            // Extrair apenas as mensagens mais recentes de cada conversa
            const latestMessages = conversations.map(conversation => ({
                id: conversation.id,
                conversationId: conversation.id,
                uidRemetente: conversation.lastMessage?.sender,
                uidDestinatario: this._currentUser.uid,
                conteudo: conversation.lastMessage?.text,
                timestamp: conversation.lastMessage?.timestamp,
                lido: conversation.unreadCount === 0,
                visto: conversation.unreadCount === 0,
                withName: conversation.withName,
                withPhoto: conversation.withPhoto
            }));

            this._emitEvent(
                
                MESSAGE_EVENTS.FETCH_MESSAGE_SUCCESS,
                { messages: latestMessages }
            );
            
            return latestMessages;
        } catch (error) {
            this._logError(error, 'fetchAllMessages');
            this._emitEvent(
                
                MESSAGE_EVENTS.FETCH_FAILURE,
                { error: error.message }
            );
            throw error;
        }
    }

    /**
     * Busca mensagens de uma conversa específica
     * @param {string} otherUserId - ID do outro usuário na conversa
     * @param {number} limit - Limite de mensagens a retornar
     * @param {string} before - Timestamp para paginação
     * @returns {Promise<Array>} Lista de mensagens
     */
    async fetchMessagesByConversation(otherUserId, limit = 50, before = null) {
        this._currentUser = this.authService.getCurrentUser();

        if (!this._currentUser) {
            throw new Error('Usuário não autenticado');
        }

        this._emitEvent(MESSAGE_EVENTS.FETCH_START);

        try {
            const currentUserId = this._currentUser.uid;
            
            const conversationId = this._getConversationId(currentUserId, otherUserId);
        
            const response = await this._executeWithRetry(async () => {
                let url = `/api/messages/user/${otherUserId}?limit=${limit}&conversationId=${conversationId}`;
                if (before) {
                    url += `&before=${before}`;
                }
                return await this.apiService.get(url);
            }, 'fetchMessagesByConversation');

            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao buscar mensagens');
            }

            const messages = response.data.data || [];
            
            // Adaptar para formato que o frontend espera
            const adaptedMessages = messages.map(msg => ({
                id: msg.id,
                conversationId: conversationId,
                uidRemetente: msg.sender,
                uidDestinatario: msg.sender === currentUserId ? otherUserId : currentUserId,
                conteudo: msg.content,
                tipo: msg.type,
                timestamp: msg.timestamp,
                entregue: msg.status?.delivered || false,
                lido: msg.status?.read || false,
                visto: msg.status?.read || false,
                dataLeitura: msg.status?.readAt
            }));

            // Criar ou obter ID da conversa 
            // const conversationId = this._getConversationId(currentUserId, otherUserId);
            
            // Atualizar cache de mensagens
            this._conversationsCache.set(conversationId, {
                id: conversationId,
                messages: adaptedMessages
            });

            // Importante: marcar mensagens como lidas assim que visualizadas
            this.markMessagesAsRead(conversationId);

            this._emitEvent(
                
                MESSAGE_EVENTS.FETCH_MESSAGE_SUCCESS,
                { conversationId, messages: adaptedMessages }
            );
            
            return adaptedMessages;
        } catch (error) {
            this._logError(error, 'fetchMessagesByConversation');
            this._emitEvent(
                
                MESSAGE_EVENTS.FETCH_FAILURE,
                { error: error.message }
            );
            return [];
        }
    }

    /**
     * Cria uma nova mensagem
     * @param {Object} messageData - Dados da mensagem
     * @returns {Promise<Object>} Mensagem criada
     */
    async createMessage(messageData) {
        this._currentUser = this.authService.getCurrentUser();
    
        if (!this._currentUser) {
            throw new Error('Usuário não autenticado');
        }
    
        try {
            const { uidDestinatario, conteudo, tipo = 'text' } = messageData;
            
            if (!conteudo || !uidDestinatario) {
                throw new Error('Dados de mensagem incompletos');
            }
    
            // Criar um ID temporário para rastreamento local
            const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const conversationId = this._getConversationId(this._currentUser.uid, uidDestinatario);
            
            // Criar representação local temporária para atualização imediata da UI
            const tempMessage = {
                id: tempId,
                conversationId,
                uidRemetente: this._currentUser.uid,
                uidDestinatario,
                conteudo: conteudo.trim(),
                tipo,
                timestamp: new Date().toISOString(),
                entregue: false,
                lido: false,
                visto: false,
                sending: true,
                tempId: true
            };
    
            // Emitir evento para atualização da UI antes da resposta da API
            this._emitEvent(MESSAGE_EVENTS.UPDATE_MESSAGES, { 
                conversationId: tempMessage.conversationId, 
                message: tempMessage 
            });
            
            // Preparar dados para socket de acordo com a estrutura esperada no socketEvents.js
            const socketMessageData = {
                temporaryId: tempId,
                recipient: uidDestinatario, 
                content: conteudo.trim(),
                type: tipo
            };
    
            // Primeiro, tentar enviar via socket - formatando como o backend espera
            if (socket && socket.connected) {
                this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Tentando enviar mensagem via socket', {
                    to: uidDestinatario,
                    tempId
                });
                
                // Entrar na sala primeiro
                socket.emit('join_chat', conversationId);
                
                // Enviar a mensagem via socket conforme especificado no backend
                socket.emit('send_message', socketMessageData);
                
                // Aguardar confirmação ou timeout para fallback
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Socket timeout')), 3000);
                });
                
                try {
                    // Esperar por resposta do socket ou timeout
                    await Promise.race([
                        new Promise((resolve) => {
                            // Listener temporário para reconciliação de mensagem
                            const reconcileHandler = (data) => {
                                if (data.temporaryId === tempId) {
                                    socket.off('reconcile_message', reconcileHandler);
                                    socket.off('message_send_failed', failedHandler);
                                    resolve(data.permanentMessage);
                                }
                            };
                            
                            // Listener temporário para falha de mensagem
                            const failedHandler = (data) => {
                                if (data.temporaryId === tempId) {
                                    socket.off('reconcile_message', reconcileHandler);
                                    socket.off('message_send_failed', failedHandler);
                                    throw new Error(data.error || 'Falha ao enviar mensagem via socket');
                                }
                            };
                            
                            socket.on('reconcile_message', reconcileHandler);
                            socket.on('message_send_failed', failedHandler);
                        }),
                        timeoutPromise
                    ]);
                    
                    this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Mensagem enviada com sucesso via socket');
                    
                    // Se chegou aqui, sucesso via socket
                    return tempMessage;
                } catch (socketError) {
                    this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Falha no socket, usando REST como fallback', {
                        error: socketError.message
                    });
                    // Continuar para fallback REST se socket falhar
                }
            }
            
            // Fallback: Enviar para API REST
            const response = await this._executeWithRetry(async () => {
                return await this.apiService.post('/api/messages', {
                    recipient: uidDestinatario,
                    content: conteudo.trim(),
                    type: tipo
                });
            }, 'createMessage');
    
            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao enviar mensagem');
            }
    
            // Obter a mensagem permanente da resposta
            const permanentMessage = response.data.data;
            
            // Adaptar para formato esperado pelo frontend
            const adaptedMessage = {
                id: permanentMessage.id,
                conversationId: permanentMessage.conversationId,
                uidRemetente: permanentMessage.sender,
                uidDestinatario: permanentMessage.sender === this._currentUser.uid ? uidDestinatario : this._currentUser.uid,
                conteudo: permanentMessage.content,
                tipo: permanentMessage.type || 'texto',
                timestamp: permanentMessage.timestamp,
                entregue: permanentMessage.status?.delivered || false,
                lido: permanentMessage.status?.read || false,
                visto: permanentMessage.status?.read || false,
                dataLeitura: permanentMessage.status?.readAt,
                sending: false
            };
    
            // Reconciliação - substitui a mensagem temporária pela permanente na UI
            this._emitEvent(MESSAGE_EVENTS.RECONCILE_MESSAGE, { 
                temporaryId: tempId, 
                permanentMessage: adaptedMessage 
            });
    
            return adaptedMessage;
        } catch (error) {
            this._logError(error, 'createMessage');
            
            // Notificar falha na mensagem
            this._emitEvent(MESSAGE_EVENTS.MESSAGE_SEND_FAILED, { 
                messageId: messageData.tempId, 
                error: error.message 
            });
            
            throw error;
        }
    }

    _getConversationId(userIdA, userIdB) {
        return [userIdA, userIdB].sort().join('_');
    }

    /**
     * Marca mensagens de uma conversa como lidas
     * @param {string} conversationId - ID da conversa
     * @returns {Promise<Object>} Resultado da operação
     */
    async markMessagesAsRead(conversationId) {
        this._currentUser = this.authService.getCurrentUser();

        if (!this._currentUser) {
            throw new Error('Usuário não autenticado');
        }

        let formattedConversationId = conversationId;
    
        // Se não contiver "_", assumimos que é um ID de usuário único
        if (conversationId && !conversationId.includes('_')) {
            // Construir o ID da conversa a partir do ID do usuário atual e do outro usuário
            const currentUserId = this._currentUser.uid;
            const otherUserId = conversationId;
            formattedConversationId = this._getConversationId(currentUserId, otherUserId);
            
            this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Construído conversationId a partir de userId', {
                originalId: conversationId,
                newId: formattedConversationId
            });
        }

        try {
            // Chamar a nova API para marcar mensagens como lidas
            const response = await this._executeWithRetry(async () => {
                return await this.apiService.post(`/api/messages/conversations/${conversationId}/read`);
            }, 'markMessagesAsRead');

            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao marcar mensagens como lidas');
            }

            const result = response.data.data;
            
            // Atualizar contador de não lidos
            this._emitEvent(
                MESSAGE_EVENTS.UPDATE_UNREAD_COUNT,
                { 
                    conversationId, 
                    count: 0 // Resetar para zero após marcar como lido
                }
            );

            // Notificar via socket (se integrado)
            if (this._socketInitialized) {
                // Obter o outro participante
                const otherParticipant = conversationId
                    .split('_')
                    .find(id => id !== this._currentUser.uid);
                
                if (otherParticipant) {
                    socket.emit('message_status_update', {
                        conversationId,
                        status: 'read',
                        recipientId: otherParticipant
                    });
                }
            }

            return result;
        } catch (error) {
            this._logError(error, 'markMessagesAsRead');
            throw error;
        }
    }

    /**
     * Atualiza o status de uma mensagem específica
     * @param {string} conversationId - ID da conversa
     * @param {string} messageId - ID da mensagem
     * @param {Object} statusUpdate - Dados de atualização
     * @returns {Promise<Object>} Resultado da operação
     */
    async updateMessageStatus(conversationId, messageId, statusUpdate) {
        try {
            // Chamar a nova API para atualizar status
            const response = await this._executeWithRetry(async () => {
                return await this.apiService.patch(
                    `/api/messages/conversations/${conversationId}/messages/${messageId}/status`,
                    statusUpdate
                );
            }, 'updateMessageStatus');

            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao atualizar status da mensagem');
            }

            const result = response.data.data;

            // Emitir evento para atualizar UI
            this._emitEvent(
                
                MESSAGE_EVENTS.UPDATE_MESSAGE_STATUS,
                {
                    conversationId,
                    messageId,
                    status: result.status
                }
            );

            return result;
        } catch (error) {
            this._logError(error, 'updateMessageStatus');
            throw error;
        }
    }

    /**
     * Exclui uma mensagem
     * @param {string} conversationId - ID da conversa
     * @param {string} messageId - ID da mensagem
     * @returns {Promise<Object>} Resultado da operação
     */
    async deleteMessage(conversationId, messageId) {
        this._currentUser = this.authService.getCurrentUser();

        if (!this._currentUser) {
            throw new Error('Usuário não autenticado');
        }

        try {
            // Chamar a nova API para excluir mensagem
            const response = await this._executeWithRetry(async () => {
                return await this.apiService.delete(
                    `/api/messages/conversations/${conversationId}/messages/${messageId}`
                );
            }, 'deleteMessage');

            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao excluir mensagem');
            }

            const result = response.data.data;

            // Notificar UI
            this._emitEvent(
                
                MESSAGE_EVENTS.UPDATE_MESSAGES,
                {
                    conversationId,
                    messageId,
                    deleted: true
                }
            );

            // Notificar via socket se necessário
            if (this._socketInitialized) {
                const otherParticipant = conversationId
                    .split('_')
                    .find(id => id !== this._currentUser.uid);
                
                if (otherParticipant) {
                    socket.emit('message_deleted', {
                        conversationId,
                        messageId,
                        deletedBy: this._currentUser.uid
                    });
                }
            }

            return result;
        } catch (error) {
            this._logError(error, 'deleteMessage');
            throw error;
        }
    }

    /**
     * Obtém estatísticas das mensagens do usuário
     * @returns {Promise<Object>} Estatísticas
     */
    async getMessageStats() {
        this._currentUser = this.authService.getCurrentUser();

        if (!this._currentUser) {
            throw new Error('Usuário não autenticado');
        }

        try {
            const response = await this._executeWithRetry(async () => {
                return await this.apiService.get('/api/messages/stats');
            }, 'getMessageStats');

            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao obter estatísticas de mensagens');
            }

            return response.data.data;
        } catch (error) {
            this._logError(error, 'getMessageStats');
            throw error;
        }
    }

    _initializeSocket() {
        if (this._socketInitialized) return;
        
        try {
            this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Inicializando socket para mensagens');
            
            if (!socket) {
                this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Socket não disponível');
                return;
            }
            
            // Se socket não conectado, ouvir evento connect
            if (!socket.connected) {
                socket.on('connect', () => {
                    this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Socket conectado, registrando handlers');
                    this._registerSocketHandlers();
                });
            } else {
                // Se já conectado, registrar imediatamente
                this._registerSocketHandlers();
            }
            
            this._socketInitialized = true;
        } catch (error) {
            this._logError(error, '_initializeSocket');
        }
    }
    
    _registerSocketHandlers() {
        // Limpar handlers anteriores para evitar duplicatas
        socket.off('new_message');
        socket.off('message_status_update');
        socket.off('message_deleted');
        socket.off('reconcile_message');
        socket.off('message_send_failed');
        
        // Configurar handlers para mensagens
        socket.on('new_message', (message) => {
            this._handleNewMessage(message);
        });
    
        socket.on('message_status_update', (update) => {
            if (update && update.messageId && update.status) {
                this.updateMessageStatus(
                    update.conversationId,
                    update.messageId,
                    { [update.status]: true }
                );
            }
        });
    
        socket.on('message_deleted', (data) => {
            if (data && data.conversationId && data.messageId) {
                this._emitEvent(MESSAGE_EVENTS.UPDATE_MESSAGES, {
                    conversationId: data.conversationId,
                    messageId: data.messageId,
                    deleted: true
                });
            }
        });
        
        this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Handlers de socket registrados com sucesso');
    }

    _handleNewMessage(message) {
        // Adaptar mensagem recebida via socket para o formato esperado
        const adaptedMessage = {
            id: message.id,
            conversationId: message.conversationId,
            uidRemetente: message.sender,
            uidDestinatario: message.sender === this._currentUser?.uid 
                ? message.recipient 
                : this._currentUser?.uid,
            conteudo: message.content,
            tipo: message.type,
            timestamp: message.timestamp,
            entregue: true,
            lido: false,
            visto: false
        };

        // Emitir evento para atualizar UI
        this._emitEvent(
            
            MESSAGE_EVENTS.UPDATE_MESSAGES,
            {
                conversationId: adaptedMessage.conversationId,
                message: adaptedMessage
            }
        );

        // Atualizar contagem de não lidos se for recebida
        if (adaptedMessage.uidDestinatario === this._currentUser?.uid) {
            this._emitEvent(
                
                MESSAGE_EVENTS.UPDATE_UNREAD_COUNT,
                {
                    conversationId: adaptedMessage.conversationId,
                    increment: 1
                }
            );
        }
    }

    stop() {
        if (this._socketInitialized) {
            socket.off('new_message');
            socket.off('message_status_update');
            socket.off('message_deleted');
        }
        
        this._conversationsCache.clear();
        this._log('Serviço de mensagens interrompido');
    }
}

export { MessageService };