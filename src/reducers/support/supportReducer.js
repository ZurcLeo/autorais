// src/reducers/support/supportReducer.js
import { SUPPORT_ACTIONS } from '../../core/constants/actions';
import { MESSAGE_ACTIONS } from '../../core/constants/actions';

// Estado inicial do suporte
const initialState = {
  // Tickets
  pendingTickets: [],
  myTickets: [],
  userTickets: [],
  allTickets: [],
  ticketDetails: {},
  
  // Conversas de tickets
  ticketConversations: {},
  
  // Status de escalonamento por conversa
  conversationStatuses: {},
  escalationSuggestions: {},
  
  // Estados de carregamento
  isLoading: false,
  isEscalating: false,
  isFetchingTickets: false,
  isAssigningTicket: false,
  isResolvingTicket: false,
  
  // Filtros e busca
  filters: {
    status: 'all',       // all, pending, assigned, resolved, closed
    priority: 'all',     // all, low, medium, high
    assignedTo: 'all',   // all, me, unassigned, specific_agent_id
    dateRange: 'all'     // all, today, week, month
  },
  searchQuery: '',
  sortBy: 'requestedAt',  // requestedAt, priority, status, assignedAt
  sortOrder: 'desc',      // asc, desc
  
  // Paginação
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0
  },
  
  // Métricas
  metrics: {
    totalTickets: 0,
    pendingTickets: 0,
    assignedTickets: 0,
    resolvedTickets: 0,
    averageResponseTime: 0,
    averageResolutionTime: 0,
    currentQueueSize: 0,
    agentWorkload: {}
  },
  
  // Configurações
  settings: {
    autoRefresh: true,
    refreshInterval: 30000, // 30 segundos
    notifications: {
      newTickets: true,
      assignments: true,
      resolutions: true
    }
  },
  
  // Erros e notificações
  error: null,
  lastError: null,
  notifications: [],
  
  // Meta informações
  lastFetch: null,
  lastUpdate: null,
  hasPermissions: false,
  agentInfo: null
};

export const supportReducer = (state = initialState, action) => {
  switch (action.type) {
    // ============= AÇÕES DE INICIALIZAÇÃO =============
    case SUPPORT_ACTIONS.SERVICE_INITIALIZED:
      return {
        ...state,
        hasPermissions: action.payload?.hasPermissions || false,
        agentInfo: action.payload?.agentInfo || null,
        lastUpdate: new Date().toISOString()
      };

    // ============= AÇÕES DE CRIAÇÃO DE TICKETS =============
    case SUPPORT_ACTIONS.TICKET_CREATION_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
      
    case SUPPORT_ACTIONS.TICKET_CREATED_SUCCESS:
      const createdTicket = action.payload.ticket;
      return {
        ...state,
        isLoading: false,
        userTickets: [createdTicket, ...state.userTickets],
        notifications: [
          ...state.notifications,
          {
            id: Date.now(),
            type: 'success',
            message: `Ticket criado com sucesso: ${createdTicket.title}`,
            timestamp: new Date().toISOString()
          }
        ]
      };
      
    case SUPPORT_ACTIONS.TICKET_CREATION_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
        lastError: {
          type: 'creation',
          message: action.payload.error,
          timestamp: new Date().toISOString()
        }
      };

    // ============= AÇÕES DE ESCALONAMENTO =============
    case SUPPORT_ACTIONS.ESCALATION_START:
      return {
        ...state,
        isEscalating: true,
        conversationStatuses: {
          ...state.conversationStatuses,
          [action.payload.conversationId]: {
            status: 'escalating',
            timestamp: new Date().toISOString(),
            isLoading: true
          }
        },
        error: null
      };
      
    case SUPPORT_ACTIONS.ESCALATION_SUCCESS:
      return {
        ...state,
        isEscalating: false,
        conversationStatuses: {
          ...state.conversationStatuses,
          [action.payload.conversationId]: {
            status: action.payload.status || 'pending',
            ticketId: action.payload.ticketId,
            timestamp: new Date().toISOString(),
            isLoading: false
          }
        },
        notifications: [
          ...state.notifications,
          {
            id: Date.now(),
            type: 'success',
            message: `Conversa escalada com sucesso. Ticket: ${action.payload.ticketId}`,
            timestamp: new Date().toISOString()
          }
        ]
      };
      
    case SUPPORT_ACTIONS.ESCALATION_FAILED:
      return {
        ...state,
        isEscalating: false,
        conversationStatuses: {
          ...state.conversationStatuses,
          [action.payload.conversationId]: {
            status: 'failed',
            error: action.payload.error,
            timestamp: new Date().toISOString(),
            isLoading: false
          }
        },
        error: action.payload.error,
        lastError: {
          type: 'escalation',
          message: action.payload.error,
          conversationId: action.payload.conversationId,
          timestamp: new Date().toISOString()
        }
      };

    // ============= AÇÕES DE BUSCA DE TICKETS =============
    case SUPPORT_ACTIONS.FETCH_TICKETS_START:
      return {
        ...state,
        isFetchingTickets: true,
        error: null
      };
      
    case SUPPORT_ACTIONS.FETCH_PENDING_TICKETS_SUCCESS:
      return {
        ...state,
        isFetchingTickets: false,
        pendingTickets: action.payload.tickets || [],
        lastFetch: new Date().toISOString(),
        metrics: {
          ...state.metrics,
          pendingTickets: action.payload.tickets?.length || 0,
          currentQueueSize: action.payload.tickets?.length || 0
        }
      };
      
    case SUPPORT_ACTIONS.FETCH_MY_TICKETS_SUCCESS:
      return {
        ...state,
        isFetchingTickets: false,
        myTickets: action.payload.tickets || [],
        lastFetch: new Date().toISOString(),
        metrics: {
          ...state.metrics,
          assignedTickets: action.payload.tickets?.filter(t => t.status === 'assigned').length || 0
        }
      };
      
    case SUPPORT_ACTIONS.FETCH_ALL_TICKETS_SUCCESS:
      return {
        ...state,
        isFetchingTickets: false,
        allTickets: action.payload.tickets || [],
        lastFetch: new Date().toISOString(),
        metrics: {
          ...state.metrics,
          totalTickets: action.payload.tickets?.length || 0,
          resolvedTickets: action.payload.tickets?.filter(t => t.status === 'resolved').length || 0
        }
      };
      
    case SUPPORT_ACTIONS.FETCH_USER_TICKETS_START:
      return {
        ...state,
        isFetchingTickets: true,
        error: null
      };
      
    case SUPPORT_ACTIONS.FETCH_USER_TICKETS_SUCCESS:
      return {
        ...state,
        isFetchingTickets: false,
        userTickets: action.payload.tickets || [],
        lastFetch: new Date().toISOString()
      };
      
    case SUPPORT_ACTIONS.FETCH_USER_TICKETS_FAILURE:
      return {
        ...state,
        isFetchingTickets: false,
        error: action.payload.error,
        lastError: {
          type: 'user_tickets_fetch',
          message: action.payload.error,
          timestamp: new Date().toISOString()
        }
      };
      
    case SUPPORT_ACTIONS.FETCH_TICKETS_FAILURE:
      return {
        ...state,
        isFetchingTickets: false,
        error: action.payload.error,
        lastError: {
          type: 'fetch',
          message: action.payload.error,
          timestamp: new Date().toISOString()
        }
      };

    // ============= AÇÕES DE ATRIBUIÇÃO DE TICKETS =============
    case SUPPORT_ACTIONS.ASSIGN_TICKET_START:
      return {
        ...state,
        isAssigningTicket: true,
        error: null
      };
      
    case SUPPORT_ACTIONS.ASSIGN_TICKET_SUCCESS:
      const assignedTicket = action.payload.ticket;
      return {
        ...state,
        isAssigningTicket: false,
        myTickets: [
          ...state.myTickets.filter(t => t.id !== assignedTicket.id),
          assignedTicket
        ],
        pendingTickets: state.pendingTickets.filter(t => t.id !== assignedTicket.id),
        ticketDetails: {
          ...state.ticketDetails,
          [assignedTicket.id]: assignedTicket
        },
        notifications: [
          ...state.notifications,
          {
            id: Date.now(),
            type: 'success',
            message: `Ticket ${assignedTicket.id} atribuído com sucesso`,
            timestamp: new Date().toISOString()
          }
        ]
      };
      
    case SUPPORT_ACTIONS.ASSIGN_TICKET_FAILURE:
      return {
        ...state,
        isAssigningTicket: false,
        error: action.payload.error,
        lastError: {
          type: 'assignment',
          message: action.payload.error,
          ticketId: action.payload.ticketId,
          timestamp: new Date().toISOString()
        }
      };

    // ============= AÇÕES DE RESOLUÇÃO DE TICKETS =============
    case SUPPORT_ACTIONS.RESOLVE_TICKET_START:
      return {
        ...state,
        isResolvingTicket: true,
        error: null
      };
      
    case SUPPORT_ACTIONS.RESOLVE_TICKET_SUCCESS:
      const resolvedTicket = action.payload.ticket;
      return {
        ...state,
        isResolvingTicket: false,
        myTickets: state.myTickets.map(t => 
          t.id === resolvedTicket.id ? resolvedTicket : t
        ),
        pendingTickets: state.pendingTickets.filter(t => t.id !== resolvedTicket.id),
        ticketDetails: {
          ...state.ticketDetails,
          [resolvedTicket.id]: resolvedTicket
        },
        metrics: {
          ...state.metrics,
          resolvedTickets: state.metrics.resolvedTickets + 1,
          assignedTickets: Math.max(0, state.metrics.assignedTickets - 1)
        },
        notifications: [
          ...state.notifications,
          {
            id: Date.now(),
            type: 'success',
            message: `Ticket ${resolvedTicket.id} resolvido com sucesso`,
            timestamp: new Date().toISOString()
          }
        ]
      };
      
    case SUPPORT_ACTIONS.RESOLVE_TICKET_FAILURE:
      return {
        ...state,
        isResolvingTicket: false,
        error: action.payload.error,
        lastError: {
          type: 'resolution',
          message: action.payload.error,
          ticketId: action.payload.ticketId,
          timestamp: new Date().toISOString()
        }
      };

    // ============= AÇÕES DE ATUALIZAÇÃO DE TICKETS =============
    case SUPPORT_ACTIONS.UPDATE_TICKET:
      const updatedTicket = action.payload.ticket;
      return {
        ...state,
        pendingTickets: state.pendingTickets.map(t => 
          t.id === updatedTicket.id ? updatedTicket : t
        ),
        myTickets: state.myTickets.map(t => 
          t.id === updatedTicket.id ? updatedTicket : t
        ),
        ticketDetails: {
          ...state.ticketDetails,
          [updatedTicket.id]: updatedTicket
        },
        lastUpdate: new Date().toISOString()
      };
      
    case SUPPORT_ACTIONS.ADD_TICKET:
      const newTicket = action.payload.ticket;
      return {
        ...state,
        pendingTickets: [newTicket, ...state.pendingTickets],
        metrics: {
          ...state.metrics,
          totalTickets: state.metrics.totalTickets + 1,
          pendingTickets: state.metrics.pendingTickets + 1,
          currentQueueSize: state.metrics.currentQueueSize + 1
        },
        notifications: [
          ...state.notifications,
          {
            id: Date.now(),
            type: 'info',
            message: `Novo ticket criado: ${newTicket.id}`,
            timestamp: new Date().toISOString()
          }
        ]
      };
      
    case SUPPORT_ACTIONS.REMOVE_TICKET:
      const ticketIdToRemove = action.payload.ticketId;
      return {
        ...state,
        pendingTickets: state.pendingTickets.filter(t => t.id !== ticketIdToRemove),
        myTickets: state.myTickets.filter(t => t.id !== ticketIdToRemove),
        ticketDetails: Object.fromEntries(
          Object.entries(state.ticketDetails).filter(([id]) => id !== ticketIdToRemove)
        ),
        ticketConversations: Object.fromEntries(
          Object.entries(state.ticketConversations).filter(([id]) => id !== ticketIdToRemove)
        )
      };

    // ============= AÇÕES DE CONVERSA DE TICKETS =============
    case SUPPORT_ACTIONS.LOAD_TICKET_CONVERSATION:
      return {
        ...state,
        ticketConversations: {
          ...state.ticketConversations,
          [action.payload.ticketId]: action.payload.messages || []
        }
      };
      
    case SUPPORT_ACTIONS.ADD_TICKET_NOTE:
      const { ticketId, note } = action.payload;
      return {
        ...state,
        pendingTickets: state.pendingTickets.map(t => 
          t.id === ticketId 
            ? { ...t, notes: [...(t.notes || []), note] }
            : t
        ),
        myTickets: state.myTickets.map(t => 
          t.id === ticketId 
            ? { ...t, notes: [...(t.notes || []), note] }
            : t
        ),
        ticketDetails: {
          ...state.ticketDetails,
          [ticketId]: state.ticketDetails[ticketId] 
            ? { ...state.ticketDetails[ticketId], notes: [...(state.ticketDetails[ticketId].notes || []), note] }
            : undefined
        }
      };

    // ============= AÇÕES DE STATUS DE CONVERSA (MESSAGES) =============
    case MESSAGE_ACTIONS.SET_CONVERSATION_STATUS:
      return {
        ...state,
        conversationStatuses: {
          ...state.conversationStatuses,
          [action.payload.conversationId]: {
            status: action.payload.status,
            queuePosition: action.payload.queuePosition,
            estimatedWaitTime: action.payload.estimatedWaitTime,
            isLoading: action.payload.isLoading || false,
            timestamp: new Date().toISOString()
          }
        }
      };
      
    case MESSAGE_ACTIONS.NOTIFY_ESCALATION_SUGGESTION:
      return {
        ...state,
        escalationSuggestions: {
          ...state.escalationSuggestions,
          [action.payload.conversationId]: {
            reason: action.payload.reason,
            message: action.payload.message,
            timestamp: new Date().toISOString(),
            dismissed: false
          }
        }
      };
      
    case MESSAGE_ACTIONS.UPDATE_CONVERSATION_HANDLER:
      return {
        ...state,
        conversationStatuses: {
          ...state.conversationStatuses,
          [action.payload.conversationId]: {
            ...state.conversationStatuses[action.payload.conversationId],
            status: action.payload.status,
            handledBy: action.payload.newHandler,
            previousHandler: action.payload.previousHandlerId,
            isLoading: action.payload.isLoading || false,
            timestamp: new Date().toISOString()
          }
        }
      };

    // ============= AÇÕES DE FILTROS E BUSCA =============
    case SUPPORT_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload.filters },
        pagination: { ...state.pagination, currentPage: 1 } // Reset to first page
      };
      
    case SUPPORT_ACTIONS.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload.query,
        pagination: { ...state.pagination, currentPage: 1 } // Reset to first page
      };

    // ============= AÇÕES DE MÉTRICAS =============
    case SUPPORT_ACTIONS.UPDATE_METRICS:
      return {
        ...state,
        metrics: { ...state.metrics, ...action.payload.metrics }
      };
      
    case SUPPORT_ACTIONS.LOAD_METRICS:
      return {
        ...state,
        metrics: action.payload.metrics || initialState.metrics
      };

    // ============= AÇÕES DE ESTADO =============
    case SUPPORT_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.loading
      };
      
    case SUPPORT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload.error,
        lastError: {
          type: action.payload.type || 'general',
          message: action.payload.error,
          conversationId: action.payload.conversationId,
          ticketId: action.payload.ticketId,
          timestamp: new Date().toISOString()
        }
      };
      
    case SUPPORT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    case SUPPORT_ACTIONS.CLEAR_STATE:
      return {
        ...initialState,
        hasPermissions: state.hasPermissions,
        agentInfo: state.agentInfo,
        settings: state.settings
      };

    // ============= AÇÕES ESPECÍFICAS =============
    case 'DISMISS_ESCALATION_SUGGESTION':
      return {
        ...state,
        escalationSuggestions: {
          ...state.escalationSuggestions,
          [action.payload.conversationId]: {
            ...state.escalationSuggestions[action.payload.conversationId],
            dismissed: true
          }
        }
      };
      
    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload.notificationId)
      };
      
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload.settings }
      };

    default:
      return state;
  }
};

// Selectors
export const selectPendingTickets = (state) => state.support?.pendingTickets || [];
export const selectMyTickets = (state) => state.support?.myTickets || [];
export const selectTicketById = (state, ticketId) => 
  state.support?.ticketDetails?.[ticketId] || 
  state.support?.pendingTickets?.find(t => t.id === ticketId) ||
  state.support?.myTickets?.find(t => t.id === ticketId);
export const selectConversationStatus = (state, conversationId) => 
  state.support?.conversationStatuses?.[conversationId];
export const selectEscalationSuggestion = (state, conversationId) => 
  state.support?.escalationSuggestions?.[conversationId];
export const selectSupportMetrics = (state) => state.support?.metrics || {};
export const selectSupportFilters = (state) => state.support?.filters || {};
export const selectIsEscalating = (state) => state.support?.isEscalating || false;
export const selectIsFetchingTickets = (state) => state.support?.isFetchingTickets || false;
export const selectSupportError = (state) => state.support?.error;
export const selectHasSupportPermissions = (state) => state.support?.hasPermissions || false;