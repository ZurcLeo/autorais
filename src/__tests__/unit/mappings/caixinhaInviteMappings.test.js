import { setupCaixinhaInviteMappings } from '../../../services/EventActionBridgeService/caixinhaInviteMappings';
import { CAIXINHA_INVITE_EVENTS } from '../../../core/constants/events';
import { CAIXINHA_INVITE_ACTIONS } from '../../../core/constants/actions';

// Mock do serviceLocator e coreLogger
jest.mock('../../../core/services/BaseService', () => ({
  serviceLocator: {
    get: jest.fn()
  }
}));

jest.mock('../../../core/logging', () => ({
  coreLogger: {
    logEvent: jest.fn()
  }
}));

describe('caixinhaInviteMappings', () => {
  let mockEventActionBridge;
  let registeredMappings;

  beforeEach(() => {
    registeredMappings = [];
    mockEventActionBridge = {
      registerMappings: jest.fn((mappings) => {
        registeredMappings.push(...mappings);
      })
    };
    setupCaixinhaInviteMappings(mockEventActionBridge);
  });

  it('deve registrar mapeamento para CAIXINHA_INVITES_FETCHED (received)', () => {
    const mapping = registeredMappings.find(m => m.eventType === CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITES_FETCHED);
    expect(mapping).toBeDefined();
    
    const eventData = { isReceivedInvites: true, invites: [{ id: 1 }], count: 1 };
    
    // Test actionType as a function
    const actionType = typeof mapping.actionType === 'function' ? mapping.actionType(eventData) : mapping.actionType;
    expect(actionType).toBe(CAIXINHA_INVITE_ACTIONS.CAIXINHA_UPDATE_PENDING_INVITES);
    
    const actionPayload = mapping.transformer(eventData);
    expect(actionPayload.invites).toEqual(eventData.invites);
    expect(actionPayload.totalCount).toBe(1);
    expect(actionPayload.lastUpdated).toBeDefined();
  });

  it('deve registrar mapeamento para CAIXINHA_INVITES_FETCHED (sent)', () => {
    const mapping = registeredMappings.find(m => m.eventType === CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITES_FETCHED);
    expect(mapping).toBeDefined();
    
    const eventData = { isReceivedInvites: false, invites: [{ id: 1 }], count: 1 };
    
    const actionType = typeof mapping.actionType === 'function' ? mapping.actionType(eventData) : mapping.actionType;
    expect(actionType).toBe(CAIXINHA_INVITE_ACTIONS.CAIXINHA_UPDATE_SENT_INVITES);
  });

  it('deve registrar mapeamento para CAIXINHA_INVITE_SENT', () => {
    const mapping = registeredMappings.find(m => m.eventType === CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_SENT);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CAIXINHA_INVITE_ACTIONS.CAIXINHA_INVITE_SUCCESS);
    
    const eventData = { invite: { id: 'inv1', targetId: 'u2' }, caixinhaId: 'cx1', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.newInvite).toEqual(eventData.invite);
    expect(actionPayload.caixinhaId).toBe('cx1');
    expect(actionPayload.targetId).toBe('u2');
    expect(actionPayload.loading).toBe(false);
    expect(actionPayload.lastUpdated).toBe(12345);
  });

  it('deve registrar mapeamento para CAIXINHA_INVITE_ACCEPTED', () => {
    const mapping = registeredMappings.find(m => m.eventType === CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_ACCEPTED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CAIXINHA_INVITE_ACTIONS.CAIXINHA_ACCEPT_SUCCESS);
    
    const eventData = { caxinhaInviteId: 'inv1', caixinhaId: 'cx1', userId: 'u1', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.caxinhaInviteId).toBe('inv1');
    expect(actionPayload.caixinhaId).toBe('cx1');
    expect(actionPayload.userId).toBe('u1');
    expect(actionPayload.loading).toBe(false);
    expect(actionPayload.lastUpdated).toBe(12345);
  });

  it('deve registrar mapeamento para CAIXINHA_INVITE_REJECTED', () => {
    const mapping = registeredMappings.find(m => m.eventType === CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_REJECTED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CAIXINHA_INVITE_ACTIONS.CAIXINHA_REJECT_SUCCESS);
    
    const eventData = { caxinhaInviteId: 'inv1', caixinhaId: 'cx1', userId: 'u1', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.caxinhaInviteId).toBe('inv1');
    expect(actionPayload.loading).toBe(false);
  });

  it('deve registrar mapeamento para CAIXINHA_INVITE_CANCELED', () => {
    const mapping = registeredMappings.find(m => m.eventType === CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_CANCELED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CAIXINHA_INVITE_ACTIONS.CAIXINHA_CANCEL_SUCCESS);
    
    const eventData = { caxinhaInviteId: 'inv1', caixinhaId: 'cx1', senderId: 'u1', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.caxinhaInviteId).toBe('inv1');
    expect(actionPayload.senderId).toBe('u1');
    expect(actionPayload.loading).toBe(false);
  });

  it('deve registrar mapeamento para CAIXINHA_INVITE_ERROR', () => {
    const mapping = registeredMappings.find(m => m.eventType === CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_ERROR);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CAIXINHA_INVITE_ACTIONS.CAIXINHA_SET_ERROR);
    
    const eventData = { error: 'Invite error', errorDetails: 'Details', context: 'Context', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.error).toBe('Invite error');
    expect(actionPayload.errorDetails).toBe('Details');
    expect(actionPayload.loading).toBe(false);
    expect(actionPayload.timestamp).toBe(12345);
  });

  it('deve registrar mapeamento para CAIXINHA_FETCH_START', () => {
    const mapping = registeredMappings.find(m => m.eventType === CAIXINHA_INVITE_EVENTS.CAIXINHA_FETCH_START);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CAIXINHA_INVITE_ACTIONS.CAIXINHA_FETCH_START);
    
    const actionPayload = mapping.transformer({ timestamp: 12345 });
    expect(actionPayload.loading).toBe(true);
    expect(actionPayload.timestamp).toBe(12345);
  });

  it('deve registrar mapeamento para CAIXINHA_FETCH_FAILURE', () => {
    const mapping = registeredMappings.find(m => m.eventType === CAIXINHA_INVITE_EVENTS.CAIXINHA_FETCH_FAILURE);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CAIXINHA_INVITE_ACTIONS.CAIXINHA_FETCH_FAILURE);
    
    const eventData = { error: 'Fetch error', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.error).toBe('Fetch error');
    expect(actionPayload.loading).toBe(false);
    expect(actionPayload.timestamp).toBe(12345);
  });
});
