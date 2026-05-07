import { dashboardReducer } from '../../../reducers/_features/dashboardReducer';
import { initialDashboardState } from '../../../core/constants/initialState';
import { DASHBOARD_ACTIONS } from '../../../core/constants/actions';

// dashboardReducer não tem estado padrão — sempre requer estado inicial explícito
describe('dashboardReducer', () => {
  it('ação desconhecida retorna o estado atual sem mutação', () => {
    const result = dashboardReducer(initialDashboardState, { type: 'X' });
    expect(result).toBe(initialDashboardState);
  });

  it('FETCH_START seta loading: true e limpa error', () => {
    const state = { ...initialDashboardState, error: 'err' };
    const result = dashboardReducer(state, { type: DASHBOARD_ACTIONS.FETCH_START });
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('FETCH_SUCCESS mescla payload no estado e seta loading: false', () => {
    const payload = { messages: [{ id: 'm1' }], notifications: [] };
    const result = dashboardReducer(
      { ...initialDashboardState, loading: true },
      { type: DASHBOARD_ACTIONS.FETCH_SUCCESS, payload }
    );
    expect(result.loading).toBe(false);
    expect(result.error).toBeNull();
    expect(result.messages).toEqual([{ id: 'm1' }]);
  });

  it('FETCH_FAILURE seta loading: false e error', () => {
    const result = dashboardReducer(
      { ...initialDashboardState, loading: true },
      { type: DASHBOARD_ACTIONS.FETCH_FAILURE, payload: 'falha de rede' }
    );
    expect(result.loading).toBe(false);
    expect(result.error).toBe('falha de rede');
  });

  it('UPDATE_MESSAGES substitui messages', () => {
    const messages = [{ id: 'm1' }, { id: 'm2' }];
    const result = dashboardReducer(initialDashboardState, {
      type: DASHBOARD_ACTIONS.UPDATE_MESSAGES,
      payload: messages,
    });
    expect(result.messages).toEqual(messages);
  });

  it('UPDATE_NOTIFICATIONS substitui notifications', () => {
    const notifications = [{ id: 'n1' }];
    const result = dashboardReducer(initialDashboardState, {
      type: DASHBOARD_ACTIONS.UPDATE_NOTIFICATIONS,
      payload: notifications,
    });
    expect(result.notifications).toEqual(notifications);
  });

  it('UPDATE_CONNECTIONS substitui connections', () => {
    const connections = { friends: [{ id: 'f1' }], bestFriends: [] };
    const result = dashboardReducer(initialDashboardState, {
      type: DASHBOARD_ACTIONS.UPDATE_CONNECTIONS,
      payload: connections,
    });
    expect(result.connections).toEqual(connections);
  });

  it('UPDATE_CAIXINHAS substitui caixinhas', () => {
    const caixinhas = [{ id: 'cx1' }];
    const result = dashboardReducer(initialDashboardState, {
      type: DASHBOARD_ACTIONS.UPDATE_CAIXINHAS,
      payload: caixinhas,
    });
    expect(result.caixinhas).toEqual(caixinhas);
  });

  it('CLEAR_STATE retorna ao estado inicial', () => {
    const dirty = {
      ...initialDashboardState,
      messages: [{ id: 'm1' }],
      loading: true,
      error: 'x',
    };
    const result = dashboardReducer(dirty, { type: DASHBOARD_ACTIONS.CLEAR_STATE });
    expect(result).toEqual(initialDashboardState);
  });
});
