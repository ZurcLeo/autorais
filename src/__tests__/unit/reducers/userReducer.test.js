jest.mock('../../../core/logging/CoreLogger', () => ({
  coreLogger: { logEvent: jest.fn() },
}));

jest.mock('date-fns/locale', () => ({ is: jest.fn() }));

import { userReducer } from '../../../reducers/user/userReducer';
import { initialUserState } from '../../../core/constants/initialState';
import { USER_ACTIONS } from '../../../core/constants/actions';

describe('userReducer', () => {
  it('retorna estado inicial quando chamado sem ação', () => {
    expect(userReducer(undefined, { type: '@@INIT' })).toEqual(initialUserState);
  });

  it('ação desconhecida retorna o estado atual sem mutação', () => {
    const state = { ...initialUserState };
    expect(userReducer(state, { type: 'X' })).toBe(state);
  });

  it('FETCH_START seta userLoading: true e limpa error', () => {
    const state = { ...initialUserState, error: 'err' };
    const result = userReducer(state, {
      type: USER_ACTIONS.FETCH_START,
      userId: 'u1',
    });
    expect(result.userLoading).toBe(true);
    expect(result.error).toBeNull();
    expect(result.userId).toBe('u1');
  });

  it('FETCH_USER_SUCCESS popula usersById e seta userLoading: false', () => {
    const usersById = { u1: { uid: 'u1', name: 'João' } };
    const result = userReducer(
      { ...initialUserState, userLoading: true },
      { type: USER_ACTIONS.FETCH_USER_SUCCESS, usersById }
    );
    expect(result.userLoading).toBe(false);
    expect(result.usersById['u1'].name).toBe('João');
    expect(result.error).toBeNull();
  });

  it('FETCH_USER_SUCCESS não sobrescreve user atual', () => {
    const currentUser = { uid: 'u1', name: 'João' };
    const state = { ...initialUserState, user: currentUser };
    const result = userReducer(state, {
      type: USER_ACTIONS.FETCH_USER_SUCCESS,
      usersById: { u2: { uid: 'u2' } },
    });
    expect(result.user).toEqual(currentUser);
  });

  it('FETCH_FAILURE seta userLoading: false e error', () => {
    const result = userReducer(
      { ...initialUserState, userLoading: true },
      { type: USER_ACTIONS.FETCH_FAILURE, error: 'falha' }
    );
    expect(result.userLoading).toBe(false);
    expect(result.error).toBe('falha');
  });

  it('UPDATE_SUCCESS mescla updates ao perfil existente', () => {
    const user = { uid: 'u1', name: 'João', email: 'j@ex.com' };
    const state = { ...initialUserState, user };
    const result = userReducer(state, {
      type: USER_ACTIONS.UPDATE_SUCCESS,
      user: { name: 'João Silva' },
    });
    expect(result.user.name).toBe('João Silva');
    expect(result.user.email).toBe('j@ex.com');
    // Cache de usersById também atualizado
    expect(result.usersById['u1'].name).toBe('João Silva');
  });

  it('UPDATE_SUCCESS sem user no estado retorna estado atual', () => {
    const state = { ...initialUserState, user: null };
    const result = userReducer(state, {
      type: USER_ACTIONS.UPDATE_SUCCESS,
      user: { name: 'Nome' },
    });
    expect(result).toBe(state);
  });

  it('USER_PROFILE_COMPLETE seta isAuthenticated: true e isProfileComplete: true', () => {
    const user = { uid: 'u1', name: 'João' };
    const result = userReducer(initialUserState, {
      type: USER_ACTIONS.USER_PROFILE_COMPLETE,
      user,
    });
    expect(result.user).toEqual(user);
    expect(result.isAuthenticated).toBe(true);
    expect(result.isProfileComplete).toBe(true);
    expect(result.userLoading).toBe(false);
    expect(result.authLoading).toBe(false);
  });

  it('USER_PROFILE_INCOMPLETE seta isProfileComplete: false e needsProfileCompletion: true', () => {
    const user = { uid: 'u1' };
    const result = userReducer(initialUserState, {
      type: USER_ACTIONS.USER_PROFILE_INCOMPLETE,
      user,
    });
    expect(result.user).toEqual(user);
    expect(result.isProfileComplete).toBe(false);
    expect(result.needsProfileCompletion).toBe(true);
  });

  it('DELETE_SUCCESS remove user do cache usersById', () => {
    const state = {
      ...initialUserState,
      user: { uid: 'u1' },
      usersById: { u1: { uid: 'u1' }, u2: { uid: 'u2' } },
    };
    const result = userReducer(state, {
      type: USER_ACTIONS.DELETE_SUCCESS,
      userId: 'u2',
    });
    expect(result.usersById['u2']).toBeUndefined();
    expect(result.usersById['u1']).toBeDefined();
    expect(result.user).toEqual({ uid: 'u1' }); // user atual não é afetado
  });

  it('DELETE_SUCCESS limpa user quando userId é o usuário atual', () => {
    const state = {
      ...initialUserState,
      user: { uid: 'u1' },
      usersById: { u1: { uid: 'u1' } },
    };
    const result = userReducer(state, {
      type: USER_ACTIONS.DELETE_SUCCESS,
      userId: 'u1',
    });
    expect(result.user).toBeNull();
  });

  it('DELETE_SUCCESS sem userId retorna estado atual', () => {
    const state = { ...initialUserState, user: { uid: 'u1' } };
    const result = userReducer(state, {
      type: USER_ACTIONS.DELETE_SUCCESS,
      userId: undefined,
    });
    expect(result).toBe(state);
  });

  it('CLEAR_USER retorna ao estado inicial', () => {
    const dirty = {
      ...initialUserState,
      user: { uid: 'u1' },
      userLoading: true,
      error: 'x',
    };
    const result = userReducer(dirty, { type: USER_ACTIONS.CLEAR_USER });
    expect(result.user).toEqual(initialUserState.user);
    expect(result.error).toEqual(initialUserState.error);
  });
});
