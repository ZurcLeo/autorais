import { setupUserPrefsMappings } from '../../../services/EventActionBridgeService/userPrefsMappings';
import { USER_PREFS_EVENTS } from '../../../core/constants/events';
import { USER_PREFS_ACTIONS } from '../../../core/constants/actions';

jest.mock('../../../core/services/BaseService', () => ({
  serviceLocator: { get: jest.fn() },
}));

describe('userPrefsMappings', () => {
  let registeredMappings;
  let mockBridge;

  beforeEach(() => {
    registeredMappings = [];
    mockBridge = { registerMappings: jest.fn((ms) => registeredMappings.push(...ms)) };
    setupUserPrefsMappings(mockBridge);
  });

  const find = (eventType) => registeredMappings.find((m) => m.eventType === eventType);

  it('deve registrar exatamente 10 mapeamentos', () => {
    expect(registeredMappings).toHaveLength(10);
  });

  it('PREFS_INITIALIZED → INITIALIZE_SUCCESS com preferences', () => {
    const m = find(USER_PREFS_EVENTS.PREFS_INITIALIZED);
    expect(m.actionType).toBe(USER_PREFS_ACTIONS.INITIALIZE_SUCCESS);
    const prefs = { theme: 'dark', language: 'pt' };
    const p = m.transformer({ preferences: prefs, timestamp: 100 });
    expect(p.preferences).toEqual(prefs);
    expect(p.timestamp).toBe(100);
  });

  it('PREFS_LOADED → LOAD_SUCCESS com preferences', () => {
    const m = find(USER_PREFS_EVENTS.PREFS_LOADED);
    expect(m.actionType).toBe(USER_PREFS_ACTIONS.LOAD_SUCCESS);
    const p = m.transformer({ preferences: { theme: 'light' } });
    expect(p.preferences).toEqual({ theme: 'light' });
  });

  it('PREFS_UPDATED → UPDATE_SUCCESS com category, values, changes e preserveUserData: true', () => {
    const m = find(USER_PREFS_EVENTS.PREFS_UPDATED);
    expect(m.actionType).toBe(USER_PREFS_ACTIONS.UPDATE_SUCCESS);
    const p = m.transformer({
      category: 'notifications',
      values: { email: true },
      changes: { email: { from: false, to: true } },
    });
    expect(p.category).toBe('notifications');
    expect(p.values).toEqual({ email: true });
    expect(p.preserveUserData).toBe(true);
  });

  it('PREFS_RESET → RESET_SUCCESS com preferences', () => {
    const m = find(USER_PREFS_EVENTS.PREFS_RESET);
    expect(m.actionType).toBe(USER_PREFS_ACTIONS.RESET_SUCCESS);
    const p = m.transformer({ preferences: { theme: 'system' } });
    expect(p.preferences).toEqual({ theme: 'system' });
  });

  it('PREFS_IMPORTED → IMPORT_SUCCESS com preferences', () => {
    const m = find(USER_PREFS_EVENTS.PREFS_IMPORTED);
    expect(m.actionType).toBe(USER_PREFS_ACTIONS.IMPORT_SUCCESS);
    const p = m.transformer({ preferences: { imported: true } });
    expect(p.preferences).toEqual({ imported: true });
  });

  it('PREFS_ERROR → OPERATION_FAILURE com operation e error', () => {
    const m = find(USER_PREFS_EVENTS.PREFS_ERROR);
    expect(m.actionType).toBe(USER_PREFS_ACTIONS.OPERATION_FAILURE);
    const p = m.transformer({ operation: 'save', error: 'network error' });
    expect(p.operation).toBe('save');
    expect(p.error).toBe('network error');
  });

  it('COOKIE_CONSENT_UPDATED → COOKIE_CONSENT_SET com cookiePreferences', () => {
    const m = find(USER_PREFS_EVENTS.COOKIE_CONSENT_UPDATED);
    expect(m.actionType).toBe(USER_PREFS_ACTIONS.COOKIE_CONSENT_SET);
    const p = m.transformer({ cookiePreferences: { analytics: false }, timestamp: 200 });
    expect(p.cookiePreferences).toEqual({ analytics: false });
    expect(p.consentTimestamp).toBe(200);
  });

  it('THEME_UPDATED → THEME_CHANGED com themePreferences (values) e previousTheme (previousValues)', () => {
    const m = find(USER_PREFS_EVENTS.THEME_UPDATED);
    expect(m.actionType).toBe(USER_PREFS_ACTIONS.THEME_CHANGED);
    const p = m.transformer({ values: { mode: 'dark' }, previousValues: { mode: 'light' } });
    expect(p.themePreferences).toEqual({ mode: 'dark' });
    expect(p.previousTheme).toEqual({ mode: 'light' });
  });

  it('LANGUAGE_UPDATED → LANGUAGE_CHANGED com languagePreferences (values)', () => {
    const m = find(USER_PREFS_EVENTS.LANGUAGE_UPDATED);
    expect(m.actionType).toBe(USER_PREFS_ACTIONS.LANGUAGE_CHANGED);
    const p = m.transformer({ values: { locale: 'en-US' }, previousValues: { locale: 'pt-BR' } });
    expect(p.languagePreferences).toEqual({ locale: 'en-US' });
    expect(p.previousLanguage).toEqual({ locale: 'pt-BR' });
  });

  it('ACCESSIBILITY_UPDATED → ACCESSIBILITY_CHANGED com accessibilityPreferences (values)', () => {
    const m = find(USER_PREFS_EVENTS.ACCESSIBILITY_UPDATED);
    expect(m.actionType).toBe(USER_PREFS_ACTIONS.ACCESSIBILITY_CHANGED);
    const p = m.transformer({ values: { highContrast: true }, previousValues: { highContrast: false } });
    expect(p.accessibilityPreferences).toEqual({ highContrast: true });
    expect(p.previousSettings).toEqual({ highContrast: false });
  });
});
