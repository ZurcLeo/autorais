import { setupSupportMappings } from '../../../services/EventActionBridgeService/supportMappings';
import { SUPPORT_EVENTS, MESSAGE_EVENTS } from '../../../core/constants/events';
import { SUPPORT_ACTIONS, MESSAGE_ACTIONS } from '../../../core/constants/actions';

// Mock do serviceLocator
jest.mock('../../../core/services/BaseService', () => ({
  serviceLocator: {
    get: jest.fn()
  }
}));

describe('supportMappings', () => {
  let mockEventActionBridge;
  let registeredMappings;

  beforeEach(() => {
    registeredMappings = [];
    mockEventActionBridge = {
      registerMappings: jest.fn((mappings) => {
        registeredMappings.push(...mappings);
      })
    };
    setupSupportMappings(mockEventActionBridge);
  });

  it('deve registrar mapeamento para ESCALATION_INITIATED', () => {
    const mapping = registeredMappings.find(m => m.eventType === SUPPORT_EVENTS.ESCALATION_INITIATED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(SUPPORT_ACTIONS.ESCALATION_START);
    
    const eventData = { conversationId: 'c1', userId: 'u1', timestamp: '2023-01-01' };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.conversationId).toBe('c1');
    expect(actionPayload.userId).toBe('u1');
    expect(actionPayload.timestamp).toBe('2023-01-01');
  });

  it('deve registrar mapeamento para TICKET_CREATED_SUCCESS', () => {
    const mapping = registeredMappings.find(m => m.eventType === SUPPORT_EVENTS.TICKET_CREATED_SUCCESS);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(SUPPORT_ACTIONS.TICKET_CREATED_SUCCESS);
    
    const eventData = { ticket: { id: 't1', title: 'Erro' } };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.ticket).toEqual(eventData.ticket);
    expect(actionPayload.timestamp).toBeDefined();
  });

  it('deve registrar mapeamento para FETCH_USER_TICKETS_SUCCESS', () => {
    const mapping = registeredMappings.find(m => m.eventType === SUPPORT_EVENTS.FETCH_USER_TICKETS_SUCCESS);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(SUPPORT_ACTIONS.FETCH_USER_TICKETS_SUCCESS);
    
    const eventData = { tickets: [{ id: 't1' }], totalCount: 1 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.tickets).toEqual(eventData.tickets);
    expect(actionPayload.totalCount).toBe(1);
  });

  it('deve registrar mapeamento para TICKET_RESOLVED_SUCCESS', () => {
    const mapping = registeredMappings.find(m => m.eventType === SUPPORT_EVENTS.TICKET_RESOLVED_SUCCESS);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(SUPPORT_ACTIONS.RESOLVE_TICKET_SUCCESS);
    
    const eventData = { ticket: { id: 't1', status: 'resolved' } };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.ticket).toEqual(eventData.ticket);
  });

  it('deve registrar mapeamento para ANALYTICS_LOADED', () => {
    const mapping = registeredMappings.find(m => m.eventType === SUPPORT_EVENTS.ANALYTICS_LOADED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(SUPPORT_ACTIONS.LOAD_METRICS);
    
    const eventData = { analytics: { total: 10 } };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.metrics).toEqual(eventData.analytics);
  });

  it('deve registrar mapeamento para MESSAGE_EVENTS.CONVERSATION_ASSIGNED', () => {
    const mapping = registeredMappings.find(m => m.serviceName === 'messages' && m.eventType === MESSAGE_EVENTS.CONVERSATION_ASSIGNED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(MESSAGE_ACTIONS.UPDATE_CONVERSATION_HANDLER);
    
    const eventData = { 
      conversationId: 'c1', 
      humanAgent: { id: 'a1', name: 'Agent' },
      previousAgentId: 'bot'
    };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.conversationId).toBe('c1');
    expect(actionPayload.newHandler).toEqual(eventData.humanAgent);
    expect(actionPayload.status).toBe('active_human');
  });

  it('deve registrar mapeamento para SUPPORT_ERROR', () => {
    const mapping = registeredMappings.find(m => m.eventType === SUPPORT_EVENTS.SUPPORT_ERROR);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(SUPPORT_ACTIONS.SET_ERROR);
    
    const eventData = { error: 'Fatal error', type: 'system' };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.error).toBe('Fatal error');
    expect(actionPayload.type).toBe('system');
  });
});
