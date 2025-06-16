// src/services/SupportService/index.js
import { BaseService, serviceLocator } from '../../core/services/BaseService';
import { LOG_LEVELS } from '../../core/constants/config';
import { SUPPORT_EVENTS } from '../../core/constants/events';
import { SERVICE_ACTIONS } from '../../core/constants/actions';

const MODULE_NAME = 'support';

class SupportService extends BaseService {
    constructor() {
        super(MODULE_NAME);
        this.instanceId = Math.random().toString(36).substring(2, 10);

        this._isInitialized = false;
        this._ticketsCache = new Map();
        this._myTicketsCache = new Map();
        this._socketInitialized = false;

        this._metadata = {
            name: MODULE_NAME,
            phase: 'COMMUNICATION',
            criticalPath: true,
            dependencies: ['auth', 'apiService'],
            category: 'support',
            description: 'Gerencia sistema de suporte e tickets'
        };

        this._log(`📊 Nova instância de SupportService criada, instanceId: ${this.instanceId}`);
        this.apiService = serviceLocator.get('apiService');
        this.authService = serviceLocator.get('auth');
        this.socketService = serviceLocator.get('socketService');
    }

    async initialize() {
        if (this.isInitialized) return this;
        
        try {
            this._log(MODULE_NAME, LOG_LEVELS.INITIALIZATION, 'SupportService initialized', { 
                timestamp: Date.now() 
            });

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

            return { status: healthResponse.data.status, timestamp: Date.now() };
        } catch (error) {
            this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Health check endpoint unavailable', {
                error: error.message
            });

            return {
                status: 'degraded', 
                details: 'Operating in offline mode', 
                timestamp: Date.now(), 
                error: error.message
            };
        }
    }

    /**
     * Cria um novo ticket de suporte
     * @param {Object} ticketData - Dados do ticket
     * @returns {Promise<Object>} Ticket criado
     */
    async createTicket(ticketData) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuário não autenticado');
        }

        const { category, module, issueType, title, description, context, deviceInfo } = ticketData;

        if (!category || !title || !description) {
            throw new Error('Categoria, título e descrição são obrigatórios');
        }

        this._log(MODULE_NAME, LOG_LEVELS.INFO, `Criando ticket: ${title}`);
        
        this._emitEvent(SUPPORT_EVENTS.TICKET_CREATION_START, { title, category });

        try {
            const response = await this._executeWithRetry(async () => {
                return await this.apiService.post('/api/support/tickets', {
                    category,
                    module,
                    issueType,
                    title,
                    description,
                    context,
                    deviceInfo
                });
            }, 'createTicket');

            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao criar ticket');
            }

            const ticket = response.data.data;
            
            this._emitEvent(SUPPORT_EVENTS.TICKET_CREATED_SUCCESS, { ticket });

            return ticket;
        } catch (error) {
            this._logError(error, 'createTicket');
            this._emitEvent(SUPPORT_EVENTS.TICKET_CREATION_FAILED, { 
                error: error.message,
                ticketData
            });
            throw error;
        }
    }

    /**
     * Busca tickets do usuário atual
     * @param {Object} options - Opções de busca
     * @returns {Promise<Array>} Lista de tickets do usuário
     */
    async fetchUserTickets(options = {}) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuário não autenticado');
        }

        const { category, status, limit = 20 } = options;

        this._emitEvent(SUPPORT_EVENTS.FETCH_USER_TICKETS_START);

        try {
            let url = '/api/support/tickets/my';
            const params = new URLSearchParams();
            
            if (category) params.append('category', category);
            if (status) params.append('status', status);
            if (limit) params.append('limit', limit.toString());
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await this._executeWithRetry(async () => {
                return await this.apiService.get(url);
            }, 'fetchUserTickets');

            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao buscar tickets do usuário');
            }

            const tickets = response.data.data || [];
            
            this._emitEvent(SUPPORT_EVENTS.FETCH_USER_TICKETS_SUCCESS, { tickets });
            
            return tickets;
        } catch (error) {
            this._logError(error, 'fetchUserTickets');
            this._emitEvent(SUPPORT_EVENTS.FETCH_USER_TICKETS_FAILURE, { error: error.message });
            throw error;
        }
    }

    /**
     * Busca detalhes de um ticket específico
     * @param {string} ticketId - ID do ticket
     * @returns {Promise<Object>} Detalhes do ticket
     */
    async fetchTicketDetails(ticketId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuário não autenticado');
        }

        if (!ticketId) {
            throw new Error('ID do ticket é obrigatório');
        }

        try {
            const response = await this._executeWithRetry(async () => {
                return await this.apiService.get(`/api/support/tickets/${ticketId}`);
            }, 'fetchTicketDetails');

            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao buscar detalhes do ticket');
            }

            const ticket = response.data.data;
            
            this._emitEvent(SUPPORT_EVENTS.TICKET_DETAILS_LOADED, { ticket });
            
            return ticket;
        } catch (error) {
            this._logError(error, 'fetchTicketDetails');
            throw error;
        }
    }

    /**
     * Atualiza status de um ticket
     * @param {string} ticketId - ID do ticket
     * @param {string} status - Novo status
     * @param {string} notes - Notas da atualização (opcional)
     * @returns {Promise<Object>} Ticket atualizado
     */
    async updateTicketStatus(ticketId, status, notes = '') {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuário não autenticado');
        }

        if (!ticketId || !status) {
            throw new Error('ID do ticket e status são obrigatórios');
        }

        this._emitEvent(SUPPORT_EVENTS.TICKET_STATUS_UPDATE_START, { ticketId, status });

        try {
            const response = await this._executeWithRetry(async () => {
                return await this.apiService.put(`/api/support/tickets/${ticketId}/status`, {
                    status,
                    notes
                });
            }, 'updateTicketStatus');

            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao atualizar status do ticket');
            }

            const ticket = response.data.data;
            
            // Atualizar caches
            this._ticketsCache.set(ticket.id, ticket);
            if (ticket.assignedTo === this.getCurrentUser()?.uid) {
                this._myTicketsCache.set(ticket.id, ticket);
            }
            
            this._emitEvent(SUPPORT_EVENTS.TICKET_STATUS_UPDATED, { ticket });
            
            return ticket;
        } catch (error) {
            this._logError(error, 'updateTicketStatus');
            this._emitEvent(SUPPORT_EVENTS.TICKET_STATUS_UPDATE_FAILED, { 
                ticketId, 
                status,
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Busca tickets por categoria
     * @param {string} category - Categoria dos tickets
     * @param {Object} options - Opções adicionais
     * @returns {Promise<Array>} Lista de tickets da categoria
     */
    async fetchTicketsByCategory(category, options = {}) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuário não autenticado');
        }

        if (!category) {
            throw new Error('Categoria é obrigatória');
        }

        const { limit = 20, status } = options;

        try {
            let url = `/api/support/tickets/category/${category}`;
            const params = new URLSearchParams();
            
            if (status) params.append('status', status);
            if (limit) params.append('limit', limit.toString());
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await this._executeWithRetry(async () => {
                return await this.apiService.get(url);
            }, 'fetchTicketsByCategory');

            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao buscar tickets da categoria');
            }

            const tickets = response.data.data || [];
            
            this._emitEvent(SUPPORT_EVENTS.TICKETS_BY_CATEGORY_LOADED, { category, tickets });
            
            return tickets;
        } catch (error) {
            this._logError(error, 'fetchTicketsByCategory');
            throw error;
        }
    }

    /**
     * Busca analytics do suporte
     * @returns {Promise<Object>} Analytics do suporte
     */
    async fetchSupportAnalytics() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuário não autenticado');
        }

        try {
            const response = await this._executeWithRetry(async () => {
                return await this.apiService.get('/api/support/tickets/analytics');
            }, 'fetchSupportAnalytics');

            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao buscar analytics');
            }

            const analytics = response.data.data;
            
            this._emitEvent(SUPPORT_EVENTS.ANALYTICS_LOADED, { analytics });
            
            return analytics;
        } catch (error) {
            this._logError(error, 'fetchSupportAnalytics');
            throw error;
        }
    }

    /**
     * Solicita escalonamento de uma conversa para atendimento humano (Legacy)
     * @param {string} conversationId - ID da conversa a ser escalonada
     * @returns {Promise<Object>} Resultado da operação
     */
    async escalateConversation(conversationId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuário não autenticado');
        }

        if (!conversationId) {
            throw new Error('ID da conversa é obrigatório');
        }

        this._log(MODULE_NAME, LOG_LEVELS.INFO, `Solicitando escalonamento para conversa: ${conversationId}`);
        
        this._emitEvent(SUPPORT_EVENTS.ESCALATION_INITIATED, { 
            conversationId,
            userId: currentUser.uid 
        });

        try {
            const response = await this._executeWithRetry(async () => {
                return await this.apiService.post('/api/support/escalate', {
                    conversationId
                });
            }, 'escalateConversation');

            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao solicitar escalonamento');
            }

            const result = response.data;
            
            this._emitEvent(SUPPORT_EVENTS.ESCALATION_SUCCESS, {
                conversationId,
                ticketId: result.ticketId,
                status: result.status || 'pending'
            });

            return result;
        } catch (error) {
            this._logError(error, 'escalateConversation');
            this._emitEvent(SUPPORT_EVENTS.ESCALATION_FAILED, { 
                conversationId, 
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Busca tickets pendentes (para agentes)
     * @param {number} limit - Limite de tickets a retornar
     * @returns {Promise<Array>} Lista de tickets pendentes
     */
    async fetchPendingTickets(limit = 10) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuário não autenticado');
        }

        this._emitEvent(SUPPORT_EVENTS.FETCH_TICKETS_START);

        try {
            const response = await this._executeWithRetry(async () => {
                return await this.apiService.get(`/api/support/tickets/pending?limit=${limit}`);
            }, 'fetchPendingTickets');

            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao buscar tickets pendentes');
            }

            const tickets = response.data.data || [];
            
            // Atualizar cache
            tickets.forEach(ticket => {
                this._ticketsCache.set(ticket.id, ticket);
            });

            this._emitEvent(SUPPORT_EVENTS.FETCH_PENDING_TICKETS_SUCCESS, { tickets });
            
            return tickets;
        } catch (error) {
            this._logError(error, 'fetchPendingTickets');
            this._emitEvent(SUPPORT_EVENTS.FETCH_TICKETS_FAILURE, { error: error.message });
            throw error;
        }
    }

    /**
     * Busca tickets atribuídos ao agente atual
     * @param {string} status - Status dos tickets (opcional)
     * @param {number} limit - Limite de tickets a retornar
     * @returns {Promise<Array>} Lista de tickets do agente
     */
    async fetchMyTickets(status = 'assigned', limit = 10) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuário não autenticado');
        }

        this._emitEvent(SUPPORT_EVENTS.FETCH_MY_TICKETS_START);

        try {
            const response = await this._executeWithRetry(async () => {
                return await this.apiService.get(`/api/support/tickets/assigned?status=${status}&limit=${limit}`);
            }, 'fetchMyTickets');

            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao buscar meus tickets');
            }

            const tickets = response.data.data || [];
            
            // Atualizar cache
            tickets.forEach(ticket => {
                this._myTicketsCache.set(ticket.id, ticket);
            });

            this._emitEvent(SUPPORT_EVENTS.FETCH_MY_TICKETS_SUCCESS, { tickets, status });
            
            return tickets;
        } catch (error) {
            this._logError(error, 'fetchMyTickets');
            this._emitEvent(SUPPORT_EVENTS.FETCH_TICKETS_FAILURE, { error: error.message });
            throw error;
        }
    }

    /**
     * Atribui um ticket a um agente
     * @param {string} ticketId - ID do ticket
     * @param {string} agentId - ID do agente (opcional, usa o atual se não fornecido)
     * @returns {Promise<Object>} Ticket atualizado
     */
    async assignTicket(ticketId, agentId = null) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuário não autenticado');
        }

        if (!ticketId) {
            throw new Error('ID do ticket é obrigatório');
        }

        this._emitEvent(SUPPORT_EVENTS.TICKET_ASSIGNMENT_START, { ticketId, agentId });

        try {
            const response = await this._executeWithRetry(async () => {
                const payload = agentId ? { agentIdToAssign: agentId } : {};
                return await this.apiService.post(`/api/support/tickets/${ticketId}/assign`, payload);
            }, 'assignTicket');

            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao atribuir ticket');
            }

            const ticket = response.data.data;
            
            // Atualizar caches
            this._ticketsCache.set(ticket.id, ticket);
            this._myTicketsCache.set(ticket.id, ticket);

            this._emitEvent(SUPPORT_EVENTS.TICKET_ASSIGNED_SUCCESS, { ticket });
            
            return ticket;
        } catch (error) {
            this._logError(error, 'assignTicket');
            this._emitEvent(SUPPORT_EVENTS.TICKET_ASSIGNMENT_FAILED, { 
                ticketId, 
                agentId, 
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Resolve um ticket
     * @param {string} ticketId - ID do ticket
     * @param {string} resolutionNotes - Notas de resolução (opcional)
     * @returns {Promise<Object>} Ticket resolvido
     */
    async resolveTicket(ticketId, resolutionNotes = '') {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuário não autenticado');
        }

        if (!ticketId) {
            throw new Error('ID do ticket é obrigatório');
        }

        this._emitEvent(SUPPORT_EVENTS.TICKET_RESOLUTION_START, { ticketId });

        try {
            const response = await this._executeWithRetry(async () => {
                return await this.apiService.post(`/api/support/tickets/${ticketId}/resolve`, {
                    resolutionNotes
                });
            }, 'resolveTicket');

            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao resolver ticket');
            }

            const ticket = response.data.data;
            
            // Atualizar caches
            this._ticketsCache.set(ticket.id, ticket);
            this._myTicketsCache.set(ticket.id, ticket);

            this._emitEvent(SUPPORT_EVENTS.TICKET_RESOLVED_SUCCESS, { ticket });
            
            return ticket;
        } catch (error) {
            this._logError(error, 'resolveTicket');
            this._emitEvent(SUPPORT_EVENTS.TICKET_RESOLUTION_FAILED, { 
                ticketId, 
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Busca histórico de conversa de um ticket
     * @param {string} ticketId - ID do ticket
     * @param {number} limit - Limite de mensagens
     * @returns {Promise<Array>} Histórico de mensagens
     */
    async fetchTicketConversation(ticketId, limit = 50) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuário não autenticado');
        }

        if (!ticketId) {
            throw new Error('ID do ticket é obrigatório');
        }

        try {
            const response = await this._executeWithRetry(async () => {
                return await this.apiService.get(`/api/support/tickets/${ticketId}/conversation?limit=${limit}`);
            }, 'fetchTicketConversation');

            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao buscar histórico da conversa');
            }

            const messages = response.data.data || [];
            
            this._emitEvent(SUPPORT_EVENTS.TICKET_CONVERSATION_LOADED, { 
                ticketId, 
                messages 
            });
            
            return messages;
        } catch (error) {
            this._logError(error, 'fetchTicketConversation');
            throw error;
        }
    }

    /**
     * Adiciona nota a um ticket
     * @param {string} ticketId - ID do ticket
     * @param {string} note - Conteúdo da nota
     * @returns {Promise<Object>} Resultado da operação
     */
    async addTicketNote(ticketId, note) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuário não autenticado');
        }

        if (!ticketId || !note) {
            throw new Error('ID do ticket e nota são obrigatórios');
        }

        try {
            const response = await this._executeWithRetry(async () => {
                return await this.apiService.put(`/api/support/tickets/${ticketId}`, {
                    note: note.trim()
                });
            }, 'addTicketNote');

            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao adicionar nota');
            }

            const result = response.data.data;
            
            this._emitEvent(SUPPORT_EVENTS.TICKET_NOTE_ADDED, { 
                ticketId, 
                note: result 
            });
            
            return result;
        } catch (error) {
            this._logError(error, 'addTicketNote');
            throw error;
        }
    }

    /**
     * Inicializa handlers de socket para suporte
     */
    _initializeSocket() {
        if (this._socketInitialized) return;
        
        try {
            this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Inicializando socket para suporte');
            
            const socket = this.socketService?.socket;
            if (!socket) {
                this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Socket não disponível');
                return;
            }
            
            if (!socket.connected) {
                socket.on('connect', () => {
                    this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Socket conectado, registrando handlers de suporte');
                    this._registerSocketHandlers();
                });
            } else {
                this._registerSocketHandlers();
            }
            
            this._socketInitialized = true;
        } catch (error) {
            this._logError(error, '_initializeSocket');
        }
    }

    /**
     * Registra handlers específicos de socket para suporte
     */
    _registerSocketHandlers() {
        const socket = this.socketService?.socket;
        if (!socket) return;

        // Limpar handlers anteriores
        socket.off('ticket_assigned');
        socket.off('ticket_resolved');
        socket.off('ticket_updated');
        socket.off('new_ticket_created');
        
        // Ticket atribuído
        socket.on('ticket_assigned', (data) => {
            this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Ticket atribuído via socket', data);
            
            if (data.ticket) {
                this._ticketsCache.set(data.ticket.id, data.ticket);
                this._myTicketsCache.set(data.ticket.id, data.ticket);
            }
            
            this._emitEvent(SUPPORT_EVENTS.TICKET_ASSIGNED_SUCCESS, { ticket: data.ticket });
        });

        // Ticket resolvido
        socket.on('ticket_resolved', (data) => {
            this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Ticket resolvido via socket', data);
            
            if (data.ticket) {
                this._ticketsCache.set(data.ticket.id, data.ticket);
                this._myTicketsCache.set(data.ticket.id, data.ticket);
            }
            
            this._emitEvent(SUPPORT_EVENTS.TICKET_RESOLVED_SUCCESS, { ticket: data.ticket });
        });

        // Ticket atualizado
        socket.on('ticket_updated', (data) => {
            this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Ticket atualizado via socket', data);
            
            if (data.ticket) {
                this._ticketsCache.set(data.ticket.id, data.ticket);
                if (data.ticket.assignedTo === this.getCurrentUser()?.uid) {
                    this._myTicketsCache.set(data.ticket.id, data.ticket);
                }
            }
            
            this._emitEvent(SUPPORT_EVENTS.TICKET_UPDATED, { ticket: data.ticket });
        });

        // Novo ticket criado
        socket.on('new_ticket_created', (data) => {
            this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Novo ticket criado via socket', data);
            
            if (data.ticket) {
                this._ticketsCache.set(data.ticket.id, data.ticket);
            }
            
            this._emitEvent(SUPPORT_EVENTS.NEW_TICKET_CREATED, { ticket: data.ticket });
        });
        
        this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Handlers de socket de suporte registrados');
    }

    /**
     * Limpa caches e para o serviço
     */
    stop() {
        if (this._socketInitialized) {
            const socket = this.socketService?.socket;
            if (socket) {
                socket.off('ticket_assigned');
                socket.off('ticket_resolved');
                socket.off('ticket_updated');
                socket.off('new_ticket_created');
            }
            this._socketInitialized = false;
        }
        
        this._ticketsCache.clear();
        this._myTicketsCache.clear();
        this._log('Serviço de suporte interrompido');
    }
}

export { SupportService };