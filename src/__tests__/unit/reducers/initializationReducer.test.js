import { initializationReducer } from '../../../reducers/initialization/initializationReducer';
import { initialState } from '../../../core/constants/initialState';
import { INIT_ACTIONS } from '../../../core/constants/actions';

beforeAll(() => { jest.spyOn(console, 'log').mockImplementation(() => {}); });
afterAll(() => { jest.restoreAllMocks(); });

describe('initializationReducer', () => {
  it('retorna estado inicial quando chamado sem ação', () => {
    const state = initializationReducer(undefined, { type: '@@INIT' });
    expect(state).toEqual(initialState);
  });

  it('ação desconhecida retorna o estado atual sem mutação', () => {
    const state = { ...initialState };
    expect(initializationReducer(state, { type: 'X' })).toBe(state);
  });

  it('START_BOOTSTRAP seta bootstrap.status: initializing e limpa error', () => {
    const state = { ...initialState, bootstrap: { ...initialState.bootstrap, error: 'err' } };
    const result = initializationReducer(state, { type: INIT_ACTIONS.START_BOOTSTRAP });
    expect(result.bootstrap.status).toBe('initializing');
    expect(result.bootstrap.error).toBeNull();
    expect(result.bootstrap.startTime).toBeDefined();
  });

  it('BOOTSTRAP_SUCCESS seta bootstrap.status: ready', () => {
    const state = {
      ...initialState,
      bootstrap: { ...initialState.bootstrap, status: 'initializing', startTime: Date.now() - 100 },
    };
    const result = initializationReducer(state, { type: INIT_ACTIONS.BOOTSTRAP_SUCCESS });
    expect(result.bootstrap.status).toBe('ready');
    expect(result.bootstrap.error).toBeNull();
    expect(result.bootstrap.initializationTime).toBeGreaterThanOrEqual(0);
  });

  it('BOOTSTRAP_ERROR seta bootstrap.status: failed com payload de erro', () => {
    const state = {
      ...initialState,
      bootstrap: { ...initialState.bootstrap, status: 'initializing', startTime: Date.now() - 50 },
    };
    const result = initializationReducer(state, {
      type: INIT_ACTIONS.BOOTSTRAP_ERROR,
      payload: 'falha crítica',
    });
    expect(result.bootstrap.status).toBe('failed');
    expect(result.bootstrap.error).toBe('falha crítica');
  });

  it('UPDATE_SERVICE_STATUS adiciona status de serviço', () => {
    const result = initializationReducer(initialState, {
      type: INIT_ACTIONS.UPDATE_SERVICE_STATUS,
      payload: { serviceName: 'auth', status: 'ready', error: null },
    });
    expect(result.services.auth.status).toBe('ready');
    expect(result.services.auth.error).toBeNull();
    expect(result.services.auth.timestamp).toBeDefined();
  });

  it('UPDATE_SERVICE_STATUS com error registra o erro no serviço', () => {
    const result = initializationReducer(initialState, {
      type: INIT_ACTIONS.UPDATE_SERVICE_STATUS,
      payload: { serviceName: 'store', status: 'failed', error: 'timeout' },
    });
    expect(result.services.store.status).toBe('failed');
    expect(result.services.store.error).toBe('timeout');
  });

  it('RESET_INITIALIZATION retorna ao estado inicial', () => {
    const dirty = {
      ...initialState,
      bootstrap: { status: 'ready', error: null, startTime: 123, initializationTime: 456 },
      services: { auth: { status: 'ready' } },
    };
    const result = initializationReducer(dirty, { type: INIT_ACTIONS.RESET_INITIALIZATION });
    expect(result).toEqual(initialState);
  });
});
