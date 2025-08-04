// src/providers/SupportProvider/index.js
import React, { createContext, useContext, useEffect, useReducer, useCallback, useMemo } from 'react';
import { serviceEventHub, serviceLocator } from '../../core/services/BaseService';
import { SUPPORT_EVENTS } from '../../core/constants/events';

// Estado inicial
const initialState = {
  // Tickets
  pendingTickets: [],
  myTickets: [],
  userTickets: [],
  allTickets: [],
  ticketConversations: {},
  
  // Status de escalonamento por conversa
  conversationStatuses: {},
  escalationSuggestions: {},
  
  // Estados de carregamento
  isLoading: false,
  isEscalating: false,
  isFetchingTickets: false,
  
  // Filtros e busca
  filters: {
    status: 'all',
    priority: 'all',
    assignedTo: 'all'
  },
  searchQuery: '',
  
  // Métricas
  metrics: {
    totalTickets: 0,
    pendingTickets: 0,
    resolvedTickets: 0,
    averageResponseTime: 0
  },
  
  // Erros
  error: null,
  lastError: null,
  
  // Meta informações
  lastFetch: null,
  hasPermissions: false
};

// Reducer
const supportReducer = (state, action) => {
  switch (action.type) {
    // Ações de escalonamento
    case 'ESCALATION_START':
      return {
        ...state,
        isEscalating: true,
        conversationStatuses: {
          ...state.conversationStatuses,
          [action.payload.conversationId]: {
            status: 'escalating',
            timestamp: new Date().toISOString()
          }
        },
        error: null
      };
      
    case 'ESCALATION_SUCCESS':
      return {
        ...state,
        isEscalating: false,
        conversationStatuses: {
          ...state.conversationStatuses,
          [action.payload.conversationId]: {
            status: action.payload.status || 'pending',
            ticketId: action.payload.ticketId,
            timestamp: new Date().toISOString()
          }
        }
      };
      
    case 'ESCALATION_FAILED':
      return {
        ...state,
        isEscalating: false,
        conversationStatuses: {
          ...state.conversationStatuses,
          [action.payload.conversationId]: {
            status: 'failed',
            error: action.payload.error,
            timestamp: new Date().toISOString()
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

    // Ações de sugestão de escalonamento (IA)
    case 'AI_ESCALATION_SUGGESTION':
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

    // Ações de tickets
    case 'FETCH_TICKETS_START':
      return {
        ...state,
        isFetchingTickets: true,
        error: null
      };
      
    case 'FETCH_PENDING_TICKETS_SUCCESS':
      return {
        ...state,
        isFetchingTickets: false,
        pendingTickets: action.payload.tickets || [],
        lastFetch: new Date().toISOString()
      };
      
    case 'FETCH_MY_TICKETS_SUCCESS':
      return {
        ...state,
        isFetchingTickets: false,
        myTickets: action.payload.tickets,
        lastFetch: new Date().toISOString()
      };
      
    case 'FETCH_USER_TICKETS_SUCCESS':
      return {
        ...state,
        isFetchingTickets: false,
        userTickets: action.payload.tickets,
        lastFetch: new Date().toISOString()
      };
      
    case 'FETCH_ALL_TICKETS_SUCCESS':
      return {
        ...state,
        isFetchingTickets: false,
        allTickets: action.payload.tickets,
        lastFetch: new Date().toISOString()
      };
      
    case 'FETCH_USER_TICKETS_FAILURE':
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
      
    case 'FETCH_TICKETS_FAILURE':
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

    // Ações de atribuição de tickets
    case 'ASSIGN_TICKET_SUCCESS':
      return {
        ...state,
        myTickets: state.myTickets.map(ticket => 
          ticket.id === action.payload.ticket.id ? action.payload.ticket : ticket
        ),
        pendingTickets: state.pendingTickets.filter(ticket => 
          ticket.id !== action.payload.ticket.id
        )
      };

    // Ações de resolução de tickets
    case 'RESOLVE_TICKET_SUCCESS':
      return {
        ...state,
        myTickets: state.myTickets.map(ticket => 
          ticket.id === action.payload.ticket.id ? action.payload.ticket : ticket
        ),
        pendingTickets: state.pendingTickets.filter(ticket => 
          ticket.id !== action.payload.ticket.id
        )
      };

    // Ações de atualização de tickets
    case 'UPDATE_TICKET':
      return {
        ...state,
        pendingTickets: state.pendingTickets.map(ticket => 
          ticket.id === action.payload.ticket.id ? action.payload.ticket : ticket
        ),
        myTickets: state.myTickets.map(ticket => 
          ticket.id === action.payload.ticket.id ? action.payload.ticket : ticket
        )
      };
      
    case 'ADD_TICKET':
      return {
        ...state,
        pendingTickets: [action.payload.ticket, ...state.pendingTickets]
      };

    // Ações de conversa de tickets
    case 'LOAD_TICKET_CONVERSATION':
      return {
        ...state,
        ticketConversations: {
          ...state.ticketConversations,
          [action.payload.ticketId]: action.payload.messages
        }
      };
      
    case 'ADD_TICKET_NOTE':
      const ticketId = action.payload.ticketId;
      return {
        ...state,
        pendingTickets: state.pendingTickets.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, notes: [...(ticket.notes || []), action.payload.note] }
            : ticket
        ),
        myTickets: state.myTickets.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, notes: [...(ticket.notes || []), action.payload.note] }
            : ticket
        )
      };

    // Ações de status de conversa
    case 'SET_CONVERSATION_STATUS':
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
      
    case 'UPDATE_CONVERSATION_HANDLER':
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

    // Ações de filtros e busca
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload.filters }
      };
      
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload.query
      };

    // Ações de métricas
    case 'UPDATE_METRICS':
      return {
        ...state,
        metrics: { ...state.metrics, ...action.payload.metrics }
      };

    // Ações de estado
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload.loading
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload.error,
        lastError: {
          type: action.payload.type || 'general',
          message: action.payload.error,
          conversationId: action.payload.conversationId,
          timestamp: new Date().toISOString()
        }
      };
      
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
      
    case 'CLEAR_STATE':
      return {
        ...initialState,
        hasPermissions: state.hasPermissions
      };

    // Ações de permissões
    case 'SET_PERMISSIONS':
      return {
        ...state,
        hasPermissions: action.payload.hasPermissions
      };

    default:
      return state;
  }
};

// Context
const SupportContext = createContext();

// Provider Component
export const SupportProvider = ({ children }) => {
  const [state, dispatch] = useReducer(supportReducer, initialState);
  
  // Services
  const supportService = useMemo(() => serviceLocator.get('support'), []);
  const authService = useMemo(() => serviceLocator.get('auth'), []);

  // Verificar permissões do usuário
  useEffect(() => {
    const checkPermissions = () => {
      const currentUser = authService?.getCurrentUser();
      
      if (currentUser) {
        // Verificar múltiplas formas de permissões
        const hasPermissions = currentUser.roles?.includes('support') || 
                             currentUser.roles?.includes('admin') ||
                             currentUser.roles?.includes('agent') ||
                             currentUser.permissions?.includes('support:read') ||
                             currentUser.isAdmin ||
                             currentUser.role === 'admin' ||
                             currentUser.role === 'support';
        
        dispatch({ 
          type: 'SET_PERMISSIONS', 
          payload: { hasPermissions } 
        });
      }
    };

    checkPermissions();
  }, [authService]);

  // Setup event listeners
  useEffect(() => {
    if (!supportService) return;

    const eventHandlers = {
      [SUPPORT_EVENTS.ESCALATION_SUCCESS]: (data) => {
        dispatch({ type: 'ESCALATION_SUCCESS', payload: data });
      },
      
      [SUPPORT_EVENTS.ESCALATION_FAILED]: (data) => {
        dispatch({ type: 'ESCALATION_FAILED', payload: data });
      },
      
      [SUPPORT_EVENTS.FETCH_PENDING_TICKETS_SUCCESS]: (data) => {
        dispatch({ type: 'FETCH_PENDING_TICKETS_SUCCESS', payload: data });
      },
      
      [SUPPORT_EVENTS.FETCH_MY_TICKETS_SUCCESS]: (data) => {
        dispatch({ type: 'FETCH_MY_TICKETS_SUCCESS', payload: data });
      },
      
      [SUPPORT_EVENTS.FETCH_TICKETS_FAILURE]: (data) => {
        dispatch({ type: 'FETCH_TICKETS_FAILURE', payload: data });
      },
      
      [SUPPORT_EVENTS.TICKET_ASSIGNED_SUCCESS]: (data) => {
        dispatch({ type: 'ASSIGN_TICKET_SUCCESS', payload: data });
      },
      
      [SUPPORT_EVENTS.TICKET_RESOLVED_SUCCESS]: (data) => {
        dispatch({ type: 'RESOLVE_TICKET_SUCCESS', payload: data });
      },
      
      [SUPPORT_EVENTS.TICKET_UPDATED]: (data) => {
        dispatch({ type: 'UPDATE_TICKET', payload: data });
      },
      
      [SUPPORT_EVENTS.NEW_TICKET_CREATED]: (data) => {
        dispatch({ type: 'ADD_TICKET', payload: data });
      },
      
      [SUPPORT_EVENTS.TICKET_CONVERSATION_LOADED]: (data) => {
        dispatch({ type: 'LOAD_TICKET_CONVERSATION', payload: data });
      },
      
      [SUPPORT_EVENTS.TICKET_NOTE_ADDED]: (data) => {
        dispatch({ type: 'ADD_TICKET_NOTE', payload: data });
      }
    };

    // Register event listeners
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      serviceEventHub.on('support', event, handler);
    });

    // Cleanup
    return () => {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        serviceEventHub.off('support', event, handler);
      });
    };
  }, [supportService]);

  // Actions
  const createTicket = useCallback(async (ticketData) => {
    if (!supportService) return;

    try {
      const ticket = await supportService.createTicket(ticketData);
      return ticket;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { error: error.message, type: 'creation' } 
      });
      throw error;
    }
  }, [supportService]);

  const fetchUserTickets = useCallback(async (options = {}) => {
    if (!supportService) return;

    try {
      const tickets = await supportService.fetchUserTickets(options);
      dispatch({ 
        type: 'FETCH_USER_TICKETS_SUCCESS', 
        payload: { tickets } 
      });
      return tickets;
    } catch (error) {
      dispatch({ 
        type: 'FETCH_USER_TICKETS_FAILURE', 
        payload: { error: error.message } 
      });
      throw error;
    }
  }, [supportService]);

  const fetchTicketDetails = useCallback(async (ticketId) => {
    if (!supportService) return;

    try {
      const ticket = await supportService.fetchTicketDetails(ticketId);
      return ticket;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { error: error.message, type: 'details' } 
      });
      throw error;
    }
  }, [supportService]);

  const updateTicketStatus = useCallback(async (ticketId, status, notes = '') => {
    if (!supportService) return;

    try {
      const ticket = await supportService.updateTicketStatus(ticketId, status, notes);
      return ticket;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { error: error.message, type: 'status_update' } 
      });
      throw error;
    }
  }, [supportService]);

  const fetchTicketsByCategory = useCallback(async (category, options = {}) => {
    if (!supportService) return;

    try {
      const tickets = await supportService.fetchTicketsByCategory(category, options);
      return tickets;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { error: error.message, type: 'category_fetch' } 
      });
      throw error;
    }
  }, [supportService]);

  const fetchSupportAnalytics = useCallback(async () => {
    if (!supportService || !state.hasPermissions) return;

    try {
      const analytics = await supportService.fetchSupportAnalytics();
      dispatch({ 
        type: 'UPDATE_METRICS', 
        payload: { metrics: analytics } 
      });
      return analytics;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { error: error.message, type: 'analytics' } 
      });
      throw error;
    }
  }, [supportService, state.hasPermissions]);

  const escalateConversation = useCallback(async (conversationId) => {
    if (!serviceEventHub || !conversationId) return;

    dispatch({ type: 'ESCALATION_START', payload: { conversationId } });
    
    try {
      const result = await supportService.escalateConversation(conversationId);
      return result;
    } catch (error) {
      dispatch({ 
        type: 'ESCALATION_FAILED', 
        payload: { conversationId, error: error.message } 
      });
      throw error;
    }
  }, [supportService]);

  const fetchPendingTickets = useCallback(async (limit = 10) => {
    if (!supportService || !state.hasPermissions) return;

    dispatch({ type: 'FETCH_TICKETS_START' });
    
    try {
      const tickets = await supportService.fetchPendingTickets(limit);
      return tickets;
    } catch (error) {
      dispatch({ 
        type: 'FETCH_TICKETS_FAILURE', 
        payload: { error: error.message } 
      });
      throw error;
    }
  }, [supportService, state.hasPermissions]);

  const fetchMyTickets = useCallback(async (status = 'assigned', limit = 10) => {
    if (!supportService || !state.hasPermissions) return;

    dispatch({ type: 'FETCH_TICKETS_START' });
    
    try {
      const tickets = await supportService.fetchMyTickets(status, limit);
      return tickets;
    } catch (error) {
      dispatch({ 
        type: 'FETCH_TICKETS_FAILURE', 
        payload: { error: error.message } 
      });
      throw error;
    }
  }, [supportService, state.hasPermissions]);

  const fetchAllTickets = useCallback(async (options = {}) => {
    if (!supportService || !state.hasPermissions) return;

    dispatch({ type: 'FETCH_TICKETS_START' });
    
    try {
      const tickets = await supportService.fetchAllTickets(options);
      return tickets;
    } catch (error) {
      dispatch({ 
        type: 'FETCH_TICKETS_FAILURE', 
        payload: { error: error.message } 
      });
      throw error;
    }
  }, [supportService, state.hasPermissions]);

  const assignTicket = useCallback(async (ticketId, agentId = null) => {
    if (!supportService || !state.hasPermissions) return;

    try {
      const ticket = await supportService.assignTicket(ticketId, agentId);
      return ticket;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { error: error.message, type: 'assignment' } 
      });
      throw error;
    }
  }, [supportService, state.hasPermissions]);

  const resolveTicket = useCallback(async (ticketId, resolutionNotes = '') => {
    if (!supportService || !state.hasPermissions) return;

    try {
      const ticket = await supportService.resolveTicket(ticketId, resolutionNotes);
      return ticket;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { error: error.message, type: 'resolution' } 
      });
      throw error;
    }
  }, [supportService, state.hasPermissions]);

  const loadTicketConversation = useCallback(async (ticketId, limit = 50) => {
    if (!supportService || !state.hasPermissions) return;

    try {
      const messages = await supportService.fetchTicketConversation(ticketId, limit);
      return messages;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { error: error.message, type: 'conversation' } 
      });
      throw error;
    }
  }, [supportService, state.hasPermissions]);

  const addTicketNote = useCallback(async (ticketId, note) => {
    if (!supportService || !state.hasPermissions) return;

    try {
      const result = await supportService.addTicketNote(ticketId, note);
      return result;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { error: error.message, type: 'note' } 
      });
      throw error;
    }
  }, [supportService, state.hasPermissions]);

  const dismissEscalationSuggestion = useCallback((conversationId) => {
    dispatch({ 
      type: 'DISMISS_ESCALATION_SUGGESTION', 
      payload: { conversationId } 
    });
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: { filters } });
  }, []);

  const setSearchQuery = useCallback((query) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: { query } });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const clearState = useCallback(() => {
    dispatch({ type: 'CLEAR_STATE' });
  }, []);

  // Utility function for filtering tickets - can be used by components
  const filterTickets = useCallback((tickets, filters = {}) => {
    let filtered = tickets;
    
    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === filters.status);
    }
    
    // Apply priority filter
    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === filters.priority);
    }
    
    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(ticket => ticket.category === filters.category);
    }
    
    // Apply assignedTo filter
    if (filters.assignedTo && filters.assignedTo !== 'all') {
      filtered = filtered.filter(ticket => ticket.assignedTo === filters.assignedTo);
    }
    
    // Apply search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.userName?.toLowerCase().includes(query) ||
        ticket.lastMessageSnippet?.toLowerCase().includes(query) ||
        ticket.title?.toLowerCase().includes(query) ||
        ticket.id.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, []);

  // Provide basic filtered lists for backward compatibility
  const filteredPendingTickets = useMemo(() => {
    return filterTickets(state.pendingTickets, {
      priority: state.filters.priority,
      searchQuery: state.searchQuery
    });
  }, [state.pendingTickets, state.filters.priority, state.searchQuery, filterTickets]);

  const filteredMyTickets = useMemo(() => {
    return filterTickets(state.myTickets, {
      status: state.filters.status,
      priority: state.filters.priority,
      searchQuery: state.searchQuery
    });
  }, [state.myTickets, state.filters.status, state.filters.priority, state.searchQuery, filterTickets]);

  // Value object
  const value = useMemo(() => ({
    // State
    ...state,
    filteredPendingTickets,
    filteredMyTickets,
    
    // Utility functions
    filterTickets,
    
    // Actions
    createTicket,
    fetchUserTickets,
    fetchTicketDetails,
    fetchTicketById: fetchTicketDetails, // Alias para compatibilidade
    updateTicketStatus,
    fetchTicketsByCategory,
    fetchSupportAnalytics,
    escalateConversation,
    fetchPendingTickets,
    fetchMyTickets,
    fetchAllTickets,
    assignTicket,
    resolveTicket,
    loadTicketConversation,
    addTicketNote,
    dismissEscalationSuggestion,
    setFilters,
    setSearchQuery,
    clearError,
    clearState
  }), [
    state,
    filteredPendingTickets,
    filteredMyTickets,
    filterTickets,
    createTicket,
    fetchUserTickets,
    fetchTicketDetails,
    updateTicketStatus,
    fetchTicketsByCategory,
    fetchSupportAnalytics,
    escalateConversation,
    fetchPendingTickets,
    fetchMyTickets,
    fetchAllTickets,
    assignTicket,
    resolveTicket,
    loadTicketConversation,
    addTicketNote,
    dismissEscalationSuggestion,
    setFilters,
    setSearchQuery,
    clearError,
    clearState
  ]);

  return (
    <SupportContext.Provider value={value}>
      {children}
    </SupportContext.Provider>
  );
};

// Hook
export const useSupport = () => {
  const context = useContext(SupportContext);
  if (!context) {
    throw new Error('useSupport must be used within a SupportProvider');
  }
  return context;
};

// Export context for advanced usage
export { SupportContext };