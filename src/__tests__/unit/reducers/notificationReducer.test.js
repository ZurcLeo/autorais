import { notificationReducer } from '../../../reducers/notification/notificationReducer';
import { initialNotificationState } from '../../../core/constants/initialState';
import { NOTIFICATION_ACTIONS } from '../../../core/constants/actions';

describe('notificationReducer', () => {
  it('retorna estado inicial quando chamado sem ação', () => {
    expect(notificationReducer(undefined, { type: '@@INIT' })).toEqual(initialNotificationState);
  });

  it('ação desconhecida retorna o estado atual sem mutação', () => {
    const state = { ...initialNotificationState };
    expect(notificationReducer(state, { type: 'X' })).toBe(state);
  });

  it('FETCH_START limpa error sem setar notifLoading', () => {
    const state = { ...initialNotificationState, error: 'err anterior' };
    const result = notificationReducer(state, { type: NOTIFICATION_ACTIONS.FETCH_START });
    expect(result.error).toBeNull();
    // notifLoading NÃO é setado em FETCH_START (design intencional)
  });

  it('FETCH_NOTIFICATION_SUCCESS popula notifications e calcula unreadCount', () => {
    const notifs = [
      { id: 'n1', read: false },
      { id: 'n2', read: true },
      { id: 'n3', lida: false },
    ];
    const result = notificationReducer(
      { ...initialNotificationState, notifLoading: true },
      { type: NOTIFICATION_ACTIONS.FETCH_NOTIFICATION_SUCCESS, payload: notifs }
    );
    expect(result.notifications).toHaveLength(3);
    expect(result.notifLoading).toBe(false);
    expect(result.error).toBeNull();
    // n1 (read:false) e n3 (lida:false) não são lidos
    expect(result.unreadCount).toBe(2);
  });

  it('FETCH_NOTIFICATION_SUCCESS com unreadCount explícito usa o valor fornecido', () => {
    const result = notificationReducer(initialNotificationState, {
      type: NOTIFICATION_ACTIONS.FETCH_NOTIFICATION_SUCCESS,
      payload: [{ id: 'n1', read: false }],
      unreadCount: 99,
    });
    expect(result.unreadCount).toBe(99);
  });

  it('FETCH_NOTIFICATION_SUCCESS com payload não-array usa array vazio', () => {
    const result = notificationReducer(initialNotificationState, {
      type: NOTIFICATION_ACTIONS.FETCH_NOTIFICATION_SUCCESS,
      payload: null,
    });
    expect(result.notifications).toEqual([]);
    expect(result.unreadCount).toBe(0);
  });

  it('FETCH_FAILURE seta notifLoading: false e error', () => {
    const result = notificationReducer(
      { ...initialNotificationState, notifLoading: true },
      { type: NOTIFICATION_ACTIONS.FETCH_FAILURE, payload: 'falha de rede' }
    );
    expect(result.notifLoading).toBe(false);
    expect(result.error).toBe('falha de rede');
  });

  it('UPDATE_NOTIFICATIONS substitui lista de notifications', () => {
    const notifs = [{ id: 'n1' }];
    const result = notificationReducer(initialNotificationState, {
      type: NOTIFICATION_ACTIONS.UPDATE_NOTIFICATIONS,
      payload: notifs,
    });
    expect(result.notifications).toEqual(notifs);
  });

  it('UPDATE_UNREAD_COUNT atualiza unreadCount com valor fornecido', () => {
    const result = notificationReducer(initialNotificationState, {
      type: NOTIFICATION_ACTIONS.UPDATE_UNREAD_COUNT,
      payload: 7,
    });
    expect(result.unreadCount).toBe(7);
  });

  it('UPDATE_UNREAD_COUNT sem payload calcula a partir das notifications', () => {
    const state = {
      ...initialNotificationState,
      notifications: [{ read: false }, { read: true }, { read: false }],
    };
    const result = notificationReducer(state, {
      type: NOTIFICATION_ACTIONS.UPDATE_UNREAD_COUNT,
      payload: undefined,
    });
    expect(result.unreadCount).toBe(2);
  });

  it('SET_ERROR seta error', () => {
    const result = notificationReducer(initialNotificationState, {
      type: NOTIFICATION_ACTIONS.SET_ERROR,
      payload: 'erro customizado',
    });
    expect(result.error).toBe('erro customizado');
  });

  it('SET_LOADING atualiza notifLoading', () => {
    const result = notificationReducer(initialNotificationState, {
      type: NOTIFICATION_ACTIONS.SET_LOADING,
      payload: true,
    });
    expect(result.notifLoading).toBe(true);
  });

  it('CLEAR_STATE retorna ao estado inicial com notifLoading: false', () => {
    const dirty = {
      ...initialNotificationState,
      notifications: [{ id: 'n1' }],
      notifLoading: true,
      error: 'x',
    };
    const result = notificationReducer(dirty, { type: NOTIFICATION_ACTIONS.CLEAR_STATE });
    expect(result.notifications).toEqual(initialNotificationState.notifications);
    expect(result.notifLoading).toBe(false);
  });
});
