/**
 * Smoke test: valida que Jest + react-scripts test estão configurados corretamente.
 *
 * authReducer é uma função pura — sem dependências externas, sem mocks necessários.
 * Se este teste passar, o pipeline de testes do frontend está operacional.
 */
import { authReducer } from '../../reducers/auth/authReducer';
import { AUTH_ACTIONS } from '../../core/constants/actions';
import { initialAuthState } from '../../core/constants/initialState';

describe('smoke: authReducer', () => {
  it('deve retornar o estado inicial quando chamado sem ação', () => {
    const state = authReducer(undefined, { type: '@@INIT' });
    expect(state).toEqual(initialAuthState);
  });

  it('ação desconhecida não deve mutar o estado atual', () => {
    const current = { ...initialAuthState, isAuthenticated: true };
    const state = authReducer(current, { type: 'ACAO_INEXISTENTE' });
    expect(state).toBe(current); // mesma referência — sem cópia desnecessária
  });

  it('LOGIN_START deve setar authLoading: true e limpar error', () => {
    const state = authReducer(
      { ...initialAuthState, error: 'erro anterior' },
      { type: AUTH_ACTIONS.LOGIN_START }
    );
    expect(state.authLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('LOGIN_SUCCESS deve setar isAuthenticated: true e limpar authLoading', () => {
    const payload = { userId: 'uid-123', user: { uid: 'uid-123', email: 'a@b.com' } };
    const state = authReducer(
      { ...initialAuthState, authLoading: true },
      { type: AUTH_ACTIONS.LOGIN_SUCCESS, payload }
    );
    expect(state.isAuthenticated).toBe(true);
    expect(state.authLoading).toBe(false);
    expect(state.userId).toBe('uid-123');
    expect(state.error).toBeNull();
  });

  it('LOGIN_FAILURE deve setar isAuthenticated: false e registrar o error', () => {
    const state = authReducer(
      { ...initialAuthState, authLoading: true },
      { type: AUTH_ACTIONS.LOGIN_FAILURE, payload: { error: 'credenciais inválidas' } }
    );
    expect(state.isAuthenticated).toBe(false);
    expect(state.authLoading).toBe(false);
    expect(state.error).toBe('credenciais inválidas');
  });

  it('LOGOUT deve retornar ao estado inicial (exceto authLoading: false)', () => {
    const authenticatedState = {
      ...initialAuthState,
      isAuthenticated: true,
      currentUser: { uid: 'uid-123' },
    };
    const state = authReducer(authenticatedState, { type: AUTH_ACTIONS.LOGOUT });
    expect(state.isAuthenticated).toBe(false);
    expect(state.currentUser).toBeNull();
    expect(state.authLoading).toBe(false);
  });

  it('LOGIN_EXPIRED deve marcar sessão como inválida e incluir mensagem de erro', () => {
    const state = authReducer(
      { ...initialAuthState, isAuthenticated: true },
      { type: AUTH_ACTIONS.LOGIN_EXPIRED }
    );
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeTruthy();
  });

  it('SET_AUTH_LOADING com true deve setar authLoading: true', () => {
    const state = authReducer(initialAuthState, {
      type: AUTH_ACTIONS.SET_AUTH_LOADING,
      payload: true,
    });
    expect(state.authLoading).toBe(true);
  });

  it('SET_AUTH_LOADING com valor inválido deve default para false', () => {
    const state = authReducer(
      { ...initialAuthState, authLoading: true },
      { type: AUTH_ACTIONS.SET_AUTH_LOADING, payload: 'invalido' }
    );
    expect(state.authLoading).toBe(false);
  });
});
