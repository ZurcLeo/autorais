jest.mock('../../../core/logging', () => ({
  coreLogger: { logEvent: jest.fn() },
}));

import { caixinhaInviteReducer } from '../../../reducers/caixinhaInvite/caixinhaInviteReducer';
import { initialCaixinhaInviteState } from '../../../core/constants/initialState';
import { CAIXINHA_INVITE_ACTIONS } from '../../../core/constants/actions';

describe('caixinhaInviteReducer', () => {
  it('retorna estado inicial quando chamado sem ação', () => {
    const state = caixinhaInviteReducer(undefined, { type: '@@INIT' });
    expect(state).toEqual(initialCaixinhaInviteState);
  });

  it('ação desconhecida retorna estado atual sem mutação', () => {
    const state = { ...initialCaixinhaInviteState };
    expect(caixinhaInviteReducer(state, { type: 'X' })).toBe(state);
  });

  it.each([
    CAIXINHA_INVITE_ACTIONS.CAIXINHA_FETCH_START,
    CAIXINHA_INVITE_ACTIONS.CAIXINHA_INVITE_START,
    CAIXINHA_INVITE_ACTIONS.CAIXINHA_ACCEPT_START,
    CAIXINHA_INVITE_ACTIONS.CAIXINHA_REJECT_START,
    CAIXINHA_INVITE_ACTIONS.CAIXINHA_CANCEL_START,
  ])('%s seta loading: true e limpa error', (type) => {
    const state = { ...initialCaixinhaInviteState, error: 'err' };
    const result = caixinhaInviteReducer(state, { type });
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it.each([
    CAIXINHA_INVITE_ACTIONS.CAIXINHA_FETCH_FAILURE,
    CAIXINHA_INVITE_ACTIONS.CAIXINHA_INVITE_FAILURE,
    CAIXINHA_INVITE_ACTIONS.CAIXINHA_ACCEPT_FAILURE,
    CAIXINHA_INVITE_ACTIONS.CAIXINHA_REJECT_FAILURE,
    CAIXINHA_INVITE_ACTIONS.CAIXINHA_CANCEL_FAILURE,
  ])('%s seta loading: false e registra error', (type) => {
    const result = caixinhaInviteReducer(
      { ...initialCaixinhaInviteState, loading: true },
      { type, payload: 'erro' }
    );
    expect(result.loading).toBe(false);
    expect(result.error).toBe('erro');
  });

  it('CAIXINHA_UPDATE_PENDING_INVITES popula pendingInvites e atualiza paginação', () => {
    const invites = [{ id: 'i1' }, { id: 'i2' }];
    const result = caixinhaInviteReducer(initialCaixinhaInviteState, {
      type: CAIXINHA_INVITE_ACTIONS.CAIXINHA_UPDATE_PENDING_INVITES,
      payload: { invites, totalCount: 2 },
    });
    expect(result.pendingInvites).toEqual(invites);
    expect(result.loading).toBe(false);
    expect(result.pagination.totalItems).toBe(2);
  });

  it('CAIXINHA_UPDATE_PENDING_INVITES sem invites usa array vazio', () => {
    const result = caixinhaInviteReducer(initialCaixinhaInviteState, {
      type: CAIXINHA_INVITE_ACTIONS.CAIXINHA_UPDATE_PENDING_INVITES,
      payload: {},
    });
    expect(result.pendingInvites).toEqual([]);
  });

  it('CAIXINHA_UPDATE_SENT_INVITES popula sentInvites', () => {
    const invites = [{ id: 's1' }];
    const result = caixinhaInviteReducer(initialCaixinhaInviteState, {
      type: CAIXINHA_INVITE_ACTIONS.CAIXINHA_UPDATE_SENT_INVITES,
      payload: { invites },
    });
    expect(result.sentInvites).toEqual(invites);
  });

  it('CAIXINHA_INVITE_SUCCESS adiciona novo convite ao início de sentInvites', () => {
    const existing = { id: 'old' };
    const newInvite = { id: 'new' };
    const state = { ...initialCaixinhaInviteState, sentInvites: [existing] };
    const result = caixinhaInviteReducer(state, {
      type: CAIXINHA_INVITE_ACTIONS.CAIXINHA_INVITE_SUCCESS,
      payload: { newInvite },
    });
    expect(result.sentInvites[0]).toEqual(newInvite);
    expect(result.sentInvites[1]).toEqual(existing);
  });

  it('CAIXINHA_ACCEPT_SUCCESS remove o convite de pendingInvites', () => {
    const state = {
      ...initialCaixinhaInviteState,
      pendingInvites: [{ id: 'i1' }, { id: 'i2' }],
    };
    const result = caixinhaInviteReducer(state, {
      type: CAIXINHA_INVITE_ACTIONS.CAIXINHA_ACCEPT_SUCCESS,
      payload: { caxinhaInviteId: 'i1' },
    });
    expect(result.pendingInvites).toHaveLength(1);
    expect(result.pendingInvites[0].id).toBe('i2');
  });

  it('CAIXINHA_REJECT_SUCCESS remove o convite de pendingInvites', () => {
    const state = {
      ...initialCaixinhaInviteState,
      pendingInvites: [{ id: 'i1' }, { id: 'i2' }],
    };
    const result = caixinhaInviteReducer(state, {
      type: CAIXINHA_INVITE_ACTIONS.CAIXINHA_REJECT_SUCCESS,
      payload: { caxinhaInviteId: 'i2' },
    });
    expect(result.pendingInvites).toHaveLength(1);
    expect(result.pendingInvites[0].id).toBe('i1');
  });

  it('CAIXINHA_CANCEL_SUCCESS remove o convite de sentInvites', () => {
    const state = {
      ...initialCaixinhaInviteState,
      sentInvites: [{ id: 's1' }, { id: 's2' }],
    };
    const result = caixinhaInviteReducer(state, {
      type: CAIXINHA_INVITE_ACTIONS.CAIXINHA_CANCEL_SUCCESS,
      payload: { caxinhaInviteId: 's1' },
    });
    expect(result.sentInvites).toHaveLength(1);
    expect(result.sentInvites[0].id).toBe('s2');
  });

  it('CAIXINHA_CLEAR_ERROR seta error: null', () => {
    const state = { ...initialCaixinhaInviteState, error: 'err' };
    const result = caixinhaInviteReducer(state, {
      type: CAIXINHA_INVITE_ACTIONS.CAIXINHA_CLEAR_ERROR,
    });
    expect(result.error).toBeNull();
  });

  it('CAIXINHA_CLEAR_STATE retorna ao estado inicial', () => {
    const dirty = { ...initialCaixinhaInviteState, loading: true, error: 'x', pendingInvites: [{}] };
    const result = caixinhaInviteReducer(dirty, {
      type: CAIXINHA_INVITE_ACTIONS.CAIXINHA_CLEAR_STATE,
    });
    expect(result.pendingInvites).toEqual(initialCaixinhaInviteState.pendingInvites);
    expect(result.error).toBeNull();
  });

  it('SET_FILTERS mescla filtros no estado', () => {
    const result = caixinhaInviteReducer(initialCaixinhaInviteState, {
      type: 'caixinhaInvites/SET_FILTERS',
      payload: { status: 'pending' },
    });
    expect(result.filters.status).toBe('pending');
  });

  it('SET_PAGINATION mescla paginação no estado', () => {
    const result = caixinhaInviteReducer(initialCaixinhaInviteState, {
      type: 'caixinhaInvites/SET_PAGINATION',
      payload: { currentPage: 2 },
    });
    expect(result.pagination.currentPage).toBe(2);
  });
});
