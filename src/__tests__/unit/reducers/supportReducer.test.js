import { supportReducer } from '../../../reducers/support/supportReducer';
import { SUPPORT_ACTIONS } from '../../../core/constants/actions';
import { MESSAGE_ACTIONS } from '../../../core/constants/actions';

const initialState = supportReducer(undefined, { type: '@@INIT' });

describe('supportReducer', () => {
  it('retorna estado inicial quando chamado sem ação', () => {
    expect(initialState.isLoading).toBe(false);
    expect(initialState.pendingTickets).toEqual([]);
    expect(initialState.myTickets).toEqual([]);
    expect(initialState.hasPermissions).toBe(false);
  });

  it('ação desconhecida retorna o estado atual sem mutação', () => {
    const state = { ...initialState };
    expect(supportReducer(state, { type: 'X' })).toBe(state);
  });

  it('SERVICE_INITIALIZED seta hasPermissions e agentInfo', () => {
    const result = supportReducer(initialState, {
      type: SUPPORT_ACTIONS.SERVICE_INITIALIZED,
      payload: { hasPermissions: true, agentInfo: { id: 'agent1' } },
    });
    expect(result.hasPermissions).toBe(true);
    expect(result.agentInfo).toEqual({ id: 'agent1' });
  });

  it('TICKET_CREATION_START seta isLoading: true', () => {
    const result = supportReducer(initialState, {
      type: SUPPORT_ACTIONS.TICKET_CREATION_START,
    });
    expect(result.isLoading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('TICKET_CREATED_SUCCESS adiciona ticket ao início de userTickets', () => {
    const ticket = { id: 't1', title: 'Problema X' };
    const state = { ...initialState, userTickets: [{ id: 't0' }] };
    const result = supportReducer(state, {
      type: SUPPORT_ACTIONS.TICKET_CREATED_SUCCESS,
      payload: { ticket },
    });
    expect(result.userTickets[0]).toEqual(ticket);
    expect(result.userTickets).toHaveLength(2);
    expect(result.isLoading).toBe(false);
    expect(result.notifications).toHaveLength(1);
  });

  it('TICKET_CREATION_FAILED seta isLoading: false e error', () => {
    const result = supportReducer({ ...initialState, isLoading: true }, {
      type: SUPPORT_ACTIONS.TICKET_CREATION_FAILED,
      payload: { error: 'falha ao criar' },
    });
    expect(result.isLoading).toBe(false);
    expect(result.error).toBe('falha ao criar');
    expect(result.lastError.type).toBe('creation');
  });

  it('ESCALATION_START seta isEscalating: true e status da conversa', () => {
    const result = supportReducer(initialState, {
      type: SUPPORT_ACTIONS.ESCALATION_START,
      payload: { conversationId: 'c1' },
    });
    expect(result.isEscalating).toBe(true);
    expect(result.conversationStatuses['c1'].status).toBe('escalating');
  });

  it('ESCALATION_SUCCESS seta isEscalating: false e status da conversa', () => {
    const result = supportReducer(
      { ...initialState, isEscalating: true },
      {
        type: SUPPORT_ACTIONS.ESCALATION_SUCCESS,
        payload: { conversationId: 'c1', ticketId: 't1', status: 'pending' },
      }
    );
    expect(result.isEscalating).toBe(false);
    expect(result.conversationStatuses['c1'].ticketId).toBe('t1');
    expect(result.notifications).toHaveLength(1);
  });

  it('ESCALATION_FAILED seta isEscalating: false e registra error', () => {
    const result = supportReducer(initialState, {
      type: SUPPORT_ACTIONS.ESCALATION_FAILED,
      payload: { conversationId: 'c1', error: 'timeout' },
    });
    expect(result.isEscalating).toBe(false);
    expect(result.conversationStatuses['c1'].status).toBe('failed');
    expect(result.error).toBe('timeout');
  });

  it('FETCH_TICKETS_START seta isFetchingTickets: true', () => {
    const result = supportReducer(initialState, { type: SUPPORT_ACTIONS.FETCH_TICKETS_START });
    expect(result.isFetchingTickets).toBe(true);
  });

  it('FETCH_PENDING_TICKETS_SUCCESS popula pendingTickets e métricas', () => {
    const tickets = [{ id: 't1' }, { id: 't2' }];
    const result = supportReducer(initialState, {
      type: SUPPORT_ACTIONS.FETCH_PENDING_TICKETS_SUCCESS,
      payload: { tickets },
    });
    expect(result.pendingTickets).toEqual(tickets);
    expect(result.isFetchingTickets).toBe(false);
    expect(result.metrics.pendingTickets).toBe(2);
  });

  it('FETCH_MY_TICKETS_SUCCESS popula myTickets', () => {
    const tickets = [{ id: 't1', status: 'assigned' }];
    const result = supportReducer(initialState, {
      type: SUPPORT_ACTIONS.FETCH_MY_TICKETS_SUCCESS,
      payload: { tickets },
    });
    expect(result.myTickets).toEqual(tickets);
    expect(result.metrics.assignedTickets).toBe(1);
  });

  it('FETCH_ALL_TICKETS_SUCCESS popula allTickets e métricas', () => {
    const tickets = [{ id: 't1', status: 'resolved' }, { id: 't2', status: 'pending' }];
    const result = supportReducer(initialState, {
      type: SUPPORT_ACTIONS.FETCH_ALL_TICKETS_SUCCESS,
      payload: { tickets },
    });
    expect(result.allTickets).toHaveLength(2);
    expect(result.metrics.resolvedTickets).toBe(1);
    expect(result.metrics.totalTickets).toBe(2);
  });

  it('FETCH_USER_TICKETS_SUCCESS popula userTickets', () => {
    const tickets = [{ id: 'u1' }];
    const result = supportReducer(initialState, {
      type: SUPPORT_ACTIONS.FETCH_USER_TICKETS_SUCCESS,
      payload: { tickets },
    });
    expect(result.userTickets).toEqual(tickets);
    expect(result.isFetchingTickets).toBe(false);
  });

  it('FETCH_TICKETS_FAILURE seta error e isFetchingTickets: false', () => {
    const result = supportReducer({ ...initialState, isFetchingTickets: true }, {
      type: SUPPORT_ACTIONS.FETCH_TICKETS_FAILURE,
      payload: { error: 'falha' },
    });
    expect(result.isFetchingTickets).toBe(false);
    expect(result.error).toBe('falha');
  });

  it('ASSIGN_TICKET_SUCCESS move ticket de pendingTickets para myTickets', () => {
    const ticket = { id: 't1', status: 'assigned' };
    const state = { ...initialState, pendingTickets: [ticket], myTickets: [] };
    const result = supportReducer(state, {
      type: SUPPORT_ACTIONS.ASSIGN_TICKET_SUCCESS,
      payload: { ticket },
    });
    expect(result.pendingTickets).toHaveLength(0);
    expect(result.myTickets).toContainEqual(ticket);
    expect(result.isAssigningTicket).toBe(false);
  });

  it('RESOLVE_TICKET_SUCCESS move ticket para resolved e atualiza métricas', () => {
    const ticket = { id: 't1', status: 'resolved' };
    const state = {
      ...initialState,
      myTickets: [ticket],
      pendingTickets: [ticket],
      metrics: { ...initialState.metrics, resolvedTickets: 0, assignedTickets: 1 },
    };
    const result = supportReducer(state, {
      type: SUPPORT_ACTIONS.RESOLVE_TICKET_SUCCESS,
      payload: { ticket },
    });
    expect(result.metrics.resolvedTickets).toBe(1);
    expect(result.metrics.assignedTickets).toBe(0);
    expect(result.isResolvingTicket).toBe(false);
  });

  it('UPDATE_TICKET atualiza ticket em pendingTickets e myTickets', () => {
    const ticket = { id: 't1', status: 'pending' };
    const updated = { id: 't1', status: 'assigned' };
    const state = { ...initialState, pendingTickets: [ticket], myTickets: [ticket] };
    const result = supportReducer(state, {
      type: SUPPORT_ACTIONS.UPDATE_TICKET,
      payload: { ticket: updated },
    });
    expect(result.pendingTickets[0].status).toBe('assigned');
    expect(result.myTickets[0].status).toBe('assigned');
  });

  it('ADD_TICKET adiciona ticket ao início de pendingTickets e incrementa métricas', () => {
    const ticket = { id: 'tNew' };
    const result = supportReducer(initialState, {
      type: SUPPORT_ACTIONS.ADD_TICKET,
      payload: { ticket },
    });
    expect(result.pendingTickets[0]).toEqual(ticket);
    expect(result.metrics.totalTickets).toBe(1);
    expect(result.metrics.currentQueueSize).toBe(1);
  });

  it('REMOVE_TICKET remove ticket de todas as listas', () => {
    const ticket = { id: 'tDel' };
    const state = {
      ...initialState,
      pendingTickets: [ticket],
      myTickets: [ticket],
      ticketDetails: { tDel: ticket },
    };
    const result = supportReducer(state, {
      type: SUPPORT_ACTIONS.REMOVE_TICKET,
      payload: { ticketId: 'tDel' },
    });
    expect(result.pendingTickets).toHaveLength(0);
    expect(result.myTickets).toHaveLength(0);
    expect(result.ticketDetails['tDel']).toBeUndefined();
  });

  it('LOAD_TICKET_CONVERSATION armazena mensagens por ticketId', () => {
    const messages = [{ id: 'm1' }];
    const result = supportReducer(initialState, {
      type: SUPPORT_ACTIONS.LOAD_TICKET_CONVERSATION,
      payload: { ticketId: 't1', messages },
    });
    expect(result.ticketConversations['t1']).toEqual(messages);
  });

  it('SET_FILTERS mescla filtros e reseta paginação', () => {
    const result = supportReducer(initialState, {
      type: SUPPORT_ACTIONS.SET_FILTERS,
      payload: { filters: { status: 'pending' } },
    });
    expect(result.filters.status).toBe('pending');
    expect(result.pagination.currentPage).toBe(1);
  });

  it('SET_SEARCH_QUERY atualiza searchQuery e reseta paginação', () => {
    const result = supportReducer(
      { ...initialState, pagination: { ...initialState.pagination, currentPage: 3 } },
      { type: SUPPORT_ACTIONS.SET_SEARCH_QUERY, payload: { query: 'bug' } }
    );
    expect(result.searchQuery).toBe('bug');
    expect(result.pagination.currentPage).toBe(1);
  });

  it('UPDATE_METRICS mescla métricas', () => {
    const result = supportReducer(initialState, {
      type: SUPPORT_ACTIONS.UPDATE_METRICS,
      payload: { metrics: { totalTickets: 50, currentQueueSize: 10 } },
    });
    expect(result.metrics.totalTickets).toBe(50);
    expect(result.metrics.currentQueueSize).toBe(10);
  });

  it('SET_ERROR seta error e lastError', () => {
    const result = supportReducer(initialState, {
      type: SUPPORT_ACTIONS.SET_ERROR,
      payload: { error: 'erro geral', type: 'fetch' },
    });
    expect(result.error).toBe('erro geral');
    expect(result.lastError.type).toBe('fetch');
  });

  it('CLEAR_ERROR seta error: null', () => {
    const state = { ...initialState, error: 'algum erro' };
    const result = supportReducer(state, { type: SUPPORT_ACTIONS.CLEAR_ERROR });
    expect(result.error).toBeNull();
  });

  it('CLEAR_STATE preserva hasPermissions e agentInfo', () => {
    const state = {
      ...initialState,
      pendingTickets: [{ id: 't1' }],
      hasPermissions: true,
      agentInfo: { id: 'a1' },
    };
    const result = supportReducer(state, { type: SUPPORT_ACTIONS.CLEAR_STATE });
    expect(result.pendingTickets).toEqual([]);
    expect(result.hasPermissions).toBe(true);
    expect(result.agentInfo).toEqual({ id: 'a1' });
  });

  it('MESSAGE_ACTIONS.SET_CONVERSATION_STATUS atualiza conversationStatuses', () => {
    const result = supportReducer(initialState, {
      type: MESSAGE_ACTIONS.SET_CONVERSATION_STATUS,
      payload: { conversationId: 'c1', status: 'waiting', queuePosition: 2, estimatedWaitTime: 5 },
    });
    expect(result.conversationStatuses['c1'].status).toBe('waiting');
    expect(result.conversationStatuses['c1'].queuePosition).toBe(2);
  });

  it('MESSAGE_ACTIONS.NOTIFY_ESCALATION_SUGGESTION adiciona sugestão de escalonamento', () => {
    const result = supportReducer(initialState, {
      type: MESSAGE_ACTIONS.NOTIFY_ESCALATION_SUGGESTION,
      payload: { conversationId: 'c1', reason: 'longa espera', message: 'Escalar?' },
    });
    expect(result.escalationSuggestions['c1'].reason).toBe('longa espera');
    expect(result.escalationSuggestions['c1'].dismissed).toBe(false);
  });

  it('DISMISS_ESCALATION_SUGGESTION marca sugestão como dismissed', () => {
    const state = {
      ...initialState,
      escalationSuggestions: { c1: { reason: 'longa espera', dismissed: false } },
    };
    const result = supportReducer(state, {
      type: 'DISMISS_ESCALATION_SUGGESTION',
      payload: { conversationId: 'c1' },
    });
    expect(result.escalationSuggestions['c1'].dismissed).toBe(true);
  });

  it('DISMISS_NOTIFICATION remove notificação da lista', () => {
    const state = {
      ...initialState,
      notifications: [{ id: 1 }, { id: 2 }],
    };
    const result = supportReducer(state, {
      type: 'DISMISS_NOTIFICATION',
      payload: { notificationId: 1 },
    });
    expect(result.notifications).toHaveLength(1);
    expect(result.notifications[0].id).toBe(2);
  });
});
