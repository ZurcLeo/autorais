import { setupInviteMappings } from '../../../services/EventActionBridgeService/inviteMappings';
import { INVITATION_EVENTS } from '../../../core/constants/events';
import { INVITATION_ACTIONS } from '../../../core/constants/actions';

// Mock do serviceLocator
jest.mock('../../../core/services/BaseService', () => ({
  serviceLocator: {
    get: jest.fn()
  }
}));

describe('inviteMappings', () => {
  let mockEventActionBridge;
  let registeredMappings;

  beforeEach(() => {
    registeredMappings = [];
    mockEventActionBridge = {
      registerMappings: jest.fn((mappings) => {
        registeredMappings.push(...mappings);
      })
    };
    setupInviteMappings(mockEventActionBridge);
  });

  it('deve registrar mapeamento para FETCH_START', () => {
    const mapping = registeredMappings.find(m => m.eventType === INVITATION_EVENTS.FETCH_START);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(INVITATION_ACTIONS.FETCH_START);
    expect(mapping.transformer()).toEqual({});
  });

  it('deve registrar mapeamento para INVITATIONS_FETCHED', () => {
    const mapping = registeredMappings.find(m => m.eventType === INVITATION_EVENTS.INVITATIONS_FETCHED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(INVITATION_ACTIONS.FETCH_SUCCESS);
    
    const eventData = { invitations: { i1: {} } };
    expect(mapping.transformer(eventData).invitations).toEqual(eventData.invitations);
  });

  it('deve registrar mapeamento para FETCH_FAILURE', () => {
    const mapping = registeredMappings.find(m => m.eventType === INVITATION_EVENTS.FETCH_FAILURE);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(INVITATION_ACTIONS.FETCH_FAILURE);
    
    expect(mapping.transformer({ error: 'Fail' }).error).toBe('Fail');
  });

  it('deve registrar mapeamento para SEND_START', () => {
    const mapping = registeredMappings.find(m => m.eventType === INVITATION_EVENTS.SEND_START);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(INVITATION_ACTIONS.SEND_START);
    expect(mapping.transformer()).toEqual({});
  });

  it('deve registrar mapeamento para INVITATION_SENT', () => {
    const mapping = registeredMappings.find(m => m.eventType === INVITATION_EVENTS.INVITATION_SENT);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(INVITATION_ACTIONS.SEND_SUCCESS);
    
    const eventData = { invitation: { id: 'i1' } };
    expect(mapping.transformer(eventData).invitation).toEqual(eventData.invitation);
  });

  it('deve registrar mapeamento para SEND_FAILURE', () => {
    const mapping = registeredMappings.find(m => m.eventType === INVITATION_EVENTS.SEND_FAILURE);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(INVITATION_ACTIONS.SEND_FAILURE);
    
    expect(mapping.transformer({ error: 'Fail' }).error).toBe('Fail');
  });

  it('deve registrar mapeamento para INVITATION_CANCELED', () => {
    const mapping = registeredMappings.find(m => m.eventType === INVITATION_EVENTS.INVITATION_CANCELED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(INVITATION_ACTIONS.UPDATE_INVITATION);
    
    const res = mapping.transformer({ inviteId: 'i1' });
    expect(res.inviteId).toBe('i1');
    expect(res.updates.status).toBe('canceled');
  });

  it('deve registrar mapeamento para INVITATION_INVALIDATED', () => {
    const mapping = registeredMappings.find(m => m.eventType === INVITATION_EVENTS.INVITATION_INVALIDATED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(INVITATION_ACTIONS.UPDATE_INVITATION);
    
    const res = mapping.transformer({ inviteId: 'i1' });
    expect(res.inviteId).toBe('i1');
    expect(res.updates.status).toBe('invalid');
  });

  it('deve registrar mapeamento para INVITATION_RESENT', () => {
    const mapping = registeredMappings.find(m => m.eventType === INVITATION_EVENTS.INVITATION_RESENT);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(INVITATION_ACTIONS.UPDATE_INVITATION);
    
    const res = mapping.transformer({ inviteId: 'i1' });
    expect(res.inviteId).toBe('i1');
    expect(res.updates.resent).toBe(true);
  });

  it('deve registrar mapeamento para INVITATION_VALIDATED', () => {
    const mapping = registeredMappings.find(m => m.eventType === INVITATION_EVENTS.INVITATION_VALIDATED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(INVITATION_ACTIONS.UPDATE_INVITATION);
    
    const res = mapping.transformer({ inviteId: 'i1' });
    expect(res.inviteId).toBe('i1');
    expect(res.updates.validated).toBe(true);
  });

  it('deve registrar mapeamento para INVITATIONS_CLEARED', () => {
    const mapping = registeredMappings.find(m => m.eventType === INVITATION_EVENTS.INVITATIONS_CLEARED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(INVITATION_ACTIONS.CLEAR_STATE);
  });
});
