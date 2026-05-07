import { setupAuthMappings } from '../../../services/EventActionBridgeService/authMappings';
import { AUTH_EVENTS } from '../../../core/constants/events';
import { AUTH_ACTIONS } from '../../../core/constants/actions';

// Mock do serviceLocator para evitar erros de inicialização
jest.mock('../../../core/services/BaseService', () => ({
  serviceLocator: {
    get: jest.fn()
  }
}));

describe('authMappings', () => {
  let mockEventActionBridge;
  let registeredMappings;

  beforeEach(() => {
    registeredMappings = [];
    mockEventActionBridge = {
      registerMappings: jest.fn((mappings) => {
        registeredMappings.push(...mappings);
      })
    };
    setupAuthMappings(mockEventActionBridge);
  });

  it('deve registrar mapeamento para FIRST_ACCESS_DETECTED', () => {
    const mapping = registeredMappings.find(m => m.eventType === AUTH_EVENTS.FIRST_ACCESS_DETECTED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(AUTH_ACTIONS.SET_FIRST_ACCESS);
    
    const eventData = { user: { id: 'u1' }, timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.isFirstAccess).toBe(true);
    expect(actionPayload.user).toEqual(eventData.user);
    expect(actionPayload.timestamp).toBe(12345);
  });

  it('deve registrar mapeamento para FIRST_ACCESS_NEEDED', () => {
    const mapping = registeredMappings.find(m => m.eventType === AUTH_EVENTS.FIRST_ACCESS_NEEDED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(AUTH_ACTIONS.SET_PROFILE_UPDATE_NEEDED);
    
    const eventData = { reason: 'missing_info', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.needsProfileUpdate).toBe(true);
    expect(actionPayload.reason).toBe('missing_info');
    expect(actionPayload.timestamp).toBe(12345);
  });

  it('deve registrar mapeamento para AUTH_SESSION_VALID', () => {
    const mapping = registeredMappings.find(m => m.eventType === AUTH_EVENTS.AUTH_SESSION_VALID);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(AUTH_ACTIONS.LOGIN_SUCCESS);
    
    const eventData = { user: { id: 'u1' }, userId: 'u1', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.success).toBe(true);
    expect(actionPayload.user).toEqual(eventData.user);
    expect(actionPayload.isAuthenticated).toBe(true);
    expect(actionPayload.authLoading).toBe(false);
    expect(actionPayload.userId).toBe('u1');
    expect(actionPayload.timestamp).toBe(12345);
  });

  it('deve registrar mapeamento para AUTH_LOGIN_COMPLETED', () => {
    const mapping = registeredMappings.find(m => m.eventType === AUTH_EVENTS.AUTH_LOGIN_COMPLETED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(AUTH_ACTIONS.LOGIN_SUCCESS);
    
    const eventData = { user: { id: 'u1' }, userId: 'u1', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.user).toEqual(eventData.user);
    expect(actionPayload.isAuthenticated).toBe(true);
    expect(actionPayload.authLoading).toBe(false);
    expect(actionPayload.timestamp).toBe(12345);
  });

  it('deve registrar mapeamento para USER_SIGNED_OUT', () => {
    const mapping = registeredMappings.find(m => m.eventType === AUTH_EVENTS.USER_SIGNED_OUT);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(AUTH_ACTIONS.LOGOUT);
    
    const eventData = { previousUserId: 'u1', reason: 'manual', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.previousUserId).toBe('u1');
    expect(actionPayload.reason).toBe('manual');
    expect(actionPayload.isAuthenticated).toBe(false);
    expect(actionPayload.authLoading).toBe(false);
    expect(actionPayload.timestamp).toBe(12345);
  });

  it('deve registrar mapeamento para AUTH_LOGOUT_COMPLETED', () => {
    const mapping = registeredMappings.find(m => m.eventType === AUTH_EVENTS.AUTH_LOGOUT_COMPLETED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(AUTH_ACTIONS.LOGOUT);
    
    const eventData = { previousUserId: 'u1', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.previousUserId).toBe('u1');
    expect(actionPayload.reason).toBe('user_initiated');
    expect(actionPayload.isAuthenticated).toBe(false);
    expect(actionPayload.timestamp).toBe(12345);
  });

  it('deve registrar mapeamento para AUTH_ERROR', () => {
    const mapping = registeredMappings.find(m => m.eventType === AUTH_EVENTS.AUTH_ERROR);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(AUTH_ACTIONS.LOGIN_FAILURE);
    
    const eventData = { error: 'Invalid credentials', code: '401', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.error).toBe('Invalid credentials');
    expect(actionPayload.code).toBe('401');
    expect(actionPayload.isAuthenticated).toBe(false);
    expect(actionPayload.timestamp).toBe(12345);
  });

  it('deve registrar mapeamento para SESSION_EXPIRED', () => {
    const mapping = registeredMappings.find(m => m.eventType === AUTH_EVENTS.SESSION_EXPIRED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(AUTH_ACTIONS.LOGIN_EXPIRED);
    
    const eventData = { timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.reason).toBe('session_expired');
    expect(actionPayload.isAuthenticated).toBe(false);
    expect(actionPayload.timestamp).toBe(12345);
  });

  it('deve registrar mapeamento para AUTH_SESSION_INVALID', () => {
    const mapping = registeredMappings.find(m => m.eventType === AUTH_EVENTS.AUTH_SESSION_INVALID);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(AUTH_ACTIONS.LOGIN_EXPIRED);
    
    const eventData = { reason: 'invalid_token', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.reason).toBe('invalid_token');
    expect(actionPayload.isAuthenticated).toBe(false);
    expect(actionPayload.timestamp).toBe(12345);
  });

  it('deve registrar mapeamento para AUTH_LOGIN_START', () => {
    const mapping = registeredMappings.find(m => m.eventType === AUTH_EVENTS.AUTH_LOGIN_START);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(AUTH_ACTIONS.LOGIN_START);
    
    const eventData = { method: 'google', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.payload).toEqual(eventData);
    expect(actionPayload.timestamp).toBe(12345);
  });
});
