import { connectionReducer } from '../../../reducers/connection/connectionReducer';
import { initialConnectionState } from '../../../core/constants/initialState';
import { CONNECTION_ACTIONS } from '../../../core/constants/actions';

beforeAll(() => { jest.spyOn(console, 'log').mockImplementation(() => {}); });
afterAll(() => { jest.restoreAllMocks(); });

describe('connectionReducer', () => {
  it('retorna estado inicial quando chamado sem ação', () => {
    const state = connectionReducer(undefined, { type: '@@INIT' });
    expect(state).toEqual(initialConnectionState);
  });

  it('ação desconhecida retorna o estado atual sem mutação', () => {
    const state = { ...initialConnectionState };
    expect(connectionReducer(state, { type: 'X' })).toBe(state);
  });

  it('FETCH_START seta loading: true e limpa error', () => {
    const state = { ...initialConnectionState, error: 'err' };
    const result = connectionReducer(state, { type: CONNECTION_ACTIONS.FETCH_START });
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('FETCH_CONNECTION_SUCCESS popula friends e bestFriends', () => {
    const result = connectionReducer(
      { ...initialConnectionState, loading: true },
      {
        type: CONNECTION_ACTIONS.FETCH_CONNECTION_SUCCESS,
        payload: { friends: [{ id: 'f1' }], bestFriends: [{ id: 'bf1' }] },
      }
    );
    expect(result.friends).toEqual([{ id: 'f1' }]);
    expect(result.bestFriends).toEqual([{ id: 'bf1' }]);
    expect(result.loading).toBe(false);
    expect(result.error).toBeNull();
  });

  it('FETCH_FAILURE seta error e loading: false', () => {
    const result = connectionReducer(
      { ...initialConnectionState, loading: true },
      { type: CONNECTION_ACTIONS.FETCH_FAILURE, payload: 'erro de rede' }
    );
    expect(result.loading).toBe(false);
    expect(result.error).toBe('erro de rede');
  });

  it('UPDATE_FRIENDS substitui lista de amigos', () => {
    const friends = [{ id: 'f1' }, { id: 'f2' }];
    const result = connectionReducer(initialConnectionState, {
      type: CONNECTION_ACTIONS.UPDATE_FRIENDS,
      payload: friends,
    });
    expect(result.friends).toEqual(friends);
  });

  it('UPDATE_BEST_FRIENDS substitui lista de melhores amigos', () => {
    const bf = [{ id: 'bf1' }];
    const result = connectionReducer(initialConnectionState, {
      type: CONNECTION_ACTIONS.UPDATE_BEST_FRIENDS,
      payload: bf,
    });
    expect(result.bestFriends).toEqual(bf);
  });

  it('UPDATE_CONNECTIONS com type requestedConnections atualiza requestedConnections', () => {
    const result = connectionReducer(initialConnectionState, {
      type: CONNECTION_ACTIONS.UPDATE_CONNECTIONS,
      payload: { type: 'requestedConnections', requestedConnections: [{ id: 'r1' }] },
    });
    expect(result.requestedConnections).toEqual([{ id: 'r1' }]);
  });

  it('UPDATE_CONNECTIONS com type sentRequests e action add adiciona à lista', () => {
    const existing = { id: 's0' };
    const newReq = { id: 's1' };
    const state = { ...initialConnectionState, sentRequests: [existing] };
    const result = connectionReducer(state, {
      type: CONNECTION_ACTIONS.UPDATE_CONNECTIONS,
      payload: { type: 'sentRequests', action: 'add', request: newReq },
    });
    expect(result.sentRequests).toHaveLength(2);
    expect(result.sentRequests).toContainEqual(newReq);
  });

  it('UPDATE_CONNECTIONS com type sentRequests sem action substitui lista', () => {
    const result = connectionReducer(
      { ...initialConnectionState, sentRequests: [{ id: 'old' }] },
      {
        type: CONNECTION_ACTIONS.UPDATE_CONNECTIONS,
        payload: { type: 'sentRequests', sentRequests: [{ id: 'new' }] },
      }
    );
    expect(result.sentRequests).toEqual([{ id: 'new' }]);
  });

  it('SEARCH_START seta search.status: loading', () => {
    const result = connectionReducer(initialConnectionState, {
      type: CONNECTION_ACTIONS.SEARCH_START,
      payload: { query: 'João' },
    });
    expect(result.search.status).toBe('loading');
    expect(result.search.query).toBe('João');
  });

  it('SET_SEARCH_RESULTS popula search.searchResults', () => {
    const results = [{ id: 'u1' }];
    const result = connectionReducer(initialConnectionState, {
      type: CONNECTION_ACTIONS.SET_SEARCH_RESULTS,
      payload: results,
    });
    expect(result.search.searchResults).toEqual(results);
    expect(result.search.status).toBe('success');
  });

  it('SEARCH_ERROR seta search.status: error', () => {
    const result = connectionReducer(initialConnectionState, {
      type: CONNECTION_ACTIONS.SEARCH_ERROR,
      payload: 'não encontrado',
    });
    expect(result.search.status).toBe('error');
    expect(result.search.error).toBe('não encontrado');
  });

  it('SET_ERROR seta error e loading: false', () => {
    const result = connectionReducer(
      { ...initialConnectionState, loading: true },
      { type: CONNECTION_ACTIONS.SET_ERROR, payload: 'erro' }
    );
    expect(result.error).toBe('erro');
    expect(result.loading).toBe(false);
  });

  it('CLEAR_STATE retorna ao estado inicial com loading: false', () => {
    const dirty = { ...initialConnectionState, loading: true, friends: [{ id: 'f1' }] };
    const result = connectionReducer(dirty, { type: CONNECTION_ACTIONS.CLEAR_STATE });
    expect(result.friends).toEqual(initialConnectionState.friends);
    expect(result.loading).toBe(false);
  });
});
