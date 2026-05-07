import { userPrefsReducer } from '../../../reducers/userPrefs/userPrefsReducer';
import { initialUserPrefsReducerState } from '../../../core/constants/initialState';
import { USER_PREFS_ACTIONS } from '../../../core/constants/actions';
import { PREFERENCE_CATEGORIES } from '../../../core/constants/config';

beforeAll(() => { jest.spyOn(console, 'log').mockImplementation(() => {}); });
afterAll(() => { jest.restoreAllMocks(); });

describe('userPrefsReducer', () => {
  it('retorna estado inicial quando chamado sem ação', () => {
    expect(userPrefsReducer(undefined, { type: '@@INIT' })).toEqual(initialUserPrefsReducerState);
  });

  it('ação desconhecida retorna o estado atual sem mutação', () => {
    const state = { ...initialUserPrefsReducerState };
    expect(userPrefsReducer(state, { type: 'X' })).toBe(state);
  });

  it('INITIALIZE_SUCCESS seta initialized: true e popula preferences', () => {
    const prefs = { theme: { mode: 'dark' } };
    const result = userPrefsReducer(initialUserPrefsReducerState, {
      type: USER_PREFS_ACTIONS.INITIALIZE_SUCCESS,
      payload: { preferences: prefs },
    });
    expect(result.initialized).toBe(true);
    expect(result.loading).toBe(false);
    expect(result.preferences).toEqual(prefs);
  });

  it('INITIALIZE_SUCCESS sem preferences mantém preferências atuais', () => {
    const result = userPrefsReducer(initialUserPrefsReducerState, {
      type: USER_PREFS_ACTIONS.INITIALIZE_SUCCESS,
      payload: {},
    });
    expect(result.preferences).toEqual(initialUserPrefsReducerState.preferences);
  });

  it('LOAD_SUCCESS seta loading: false e popula preferences', () => {
    const prefs = { language: { locale: 'pt-BR' } };
    const result = userPrefsReducer(initialUserPrefsReducerState, {
      type: USER_PREFS_ACTIONS.LOAD_SUCCESS,
      payload: { preferences: prefs },
    });
    expect(result.loading).toBe(false);
    expect(result.preferences).toEqual(prefs);
  });

  it('UPDATE_SUCCESS atualiza apenas a categoria especificada', () => {
    const values = { mode: 'dark', primaryColor: 'blue' };
    const result = userPrefsReducer(initialUserPrefsReducerState, {
      type: USER_PREFS_ACTIONS.UPDATE_SUCCESS,
      payload: { category: PREFERENCE_CATEGORIES.THEME, values },
    });
    expect(result.preferences[PREFERENCE_CATEGORIES.THEME]).toEqual(values);
    // Outras categorias preservadas
    expect(result.preferences[PREFERENCE_CATEGORIES.PRIVACY]).toBeDefined();
  });

  it('RESET_SUCCESS restaura preferences do payload', () => {
    const prefs = { theme: { mode: 'system' } };
    const result = userPrefsReducer(initialUserPrefsReducerState, {
      type: USER_PREFS_ACTIONS.RESET_SUCCESS,
      payload: { preferences: prefs },
    });
    expect(result.loading).toBe(false);
    expect(result.preferences).toEqual(prefs);
  });

  it('RESET_SUCCESS sem payload.preferences usa initialUserPrefsReducerState.preferences', () => {
    const result = userPrefsReducer(initialUserPrefsReducerState, {
      type: USER_PREFS_ACTIONS.RESET_SUCCESS,
      payload: {},
    });
    expect(result.preferences).toEqual(initialUserPrefsReducerState.preferences);
  });

  it('IMPORT_SUCCESS popula preferences do payload', () => {
    const prefs = { cookies: { analytics: true } };
    const result = userPrefsReducer(initialUserPrefsReducerState, {
      type: USER_PREFS_ACTIONS.IMPORT_SUCCESS,
      payload: { preferences: prefs },
    });
    expect(result.preferences).toEqual(prefs);
    expect(result.loading).toBe(false);
  });

  it('OPERATION_FAILURE seta loading: false e error', () => {
    const result = userPrefsReducer(
      { ...initialUserPrefsReducerState, loading: true },
      {
        type: USER_PREFS_ACTIONS.OPERATION_FAILURE,
        payload: { error: 'falha ao salvar' },
      }
    );
    expect(result.loading).toBe(false);
    expect(result.error).toBe('falha ao salvar');
  });

  it('COOKIE_CONSENT_SET seta cookieConsent e preferences de cookies', () => {
    const cookiePreferences = { analytics: true, marketing: false };
    const result = userPrefsReducer(initialUserPrefsReducerState, {
      type: USER_PREFS_ACTIONS.COOKIE_CONSENT_SET,
      payload: { consentTimestamp: '2024-01-01', cookiePreferences },
    });
    expect(result.cookieConsent.given).toBe(true);
    expect(result.cookieConsent.preferences).toEqual(cookiePreferences);
    expect(result.preferences[PREFERENCE_CATEGORIES.COOKIES]).toEqual(cookiePreferences);
  });

  it('THEME_CHANGED atualiza preferências de tema', () => {
    const themePreferences = { mode: 'dark' };
    const result = userPrefsReducer(initialUserPrefsReducerState, {
      type: USER_PREFS_ACTIONS.THEME_CHANGED,
      payload: { themePreferences },
    });
    expect(result.preferences[PREFERENCE_CATEGORIES.THEME]).toEqual(themePreferences);
  });

  it('LANGUAGE_CHANGED atualiza preferências de idioma', () => {
    const languagePreferences = { locale: 'en-US' };
    const result = userPrefsReducer(initialUserPrefsReducerState, {
      type: USER_PREFS_ACTIONS.LANGUAGE_CHANGED,
      payload: { languagePreferences },
    });
    expect(result.preferences[PREFERENCE_CATEGORIES.LANGUAGE]).toEqual(languagePreferences);
  });

  it('ACCESSIBILITY_CHANGED atualiza preferências de acessibilidade', () => {
    const accessibilityPreferences = { highContrast: true };
    const result = userPrefsReducer(initialUserPrefsReducerState, {
      type: USER_PREFS_ACTIONS.ACCESSIBILITY_CHANGED,
      payload: { accessibilityPreferences },
    });
    expect(result.preferences[PREFERENCE_CATEGORIES.ACCESSIBILITY]).toEqual(accessibilityPreferences);
  });
});
