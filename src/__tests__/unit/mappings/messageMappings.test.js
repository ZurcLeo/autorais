import { setupMessageMappings } from '../../../services/EventActionBridgeService/messageMappings';
import { MESSAGE_EVENTS } from '../../../core/constants/events';
import { MESSAGE_ACTIONS } from '../../../core/constants/actions';

// Mock do serviceLocator
jest.mock('../../../core/services/BaseService', () => ({
  serviceLocator: {
    get: jest.fn()
  }
}));

describe('messageMappings', () => {
  let mockEventActionBridge;
  let registeredMappings;

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    console.log.mockRestore();
  });

  beforeEach(() => {
    registeredMappings = [];
    mockEventActionBridge = {
      registerMappings: jest.fn((mappings) => {
        registeredMappings.push(...mappings);
      })
    };
    setupMessageMappings(mockEventActionBridge);
  });

  it('deve registrar mapeamento para FETCH_MESSAGE_SUCCESS', () => {
    const mapping = registeredMappings.find(m => m.eventType === MESSAGE_EVENTS.FETCH_MESSAGE_SUCCESS);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(MESSAGE_ACTIONS.FETCH_MESSAGE_SUCCESS);
    
    const eventData = { messages: [{ id: 'm1' }], conversationId: 'c1' };
    const res = mapping.transformer(eventData);
    expect(res.messages).toEqual(eventData.messages);
    expect(res.conversationId).toBe('c1');
  });

  it('deve registrar mapeamento para UPDATE_MESSAGES', () => {
    const mapping = registeredMappings.find(m => m.eventType === MESSAGE_EVENTS.UPDATE_MESSAGES);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(MESSAGE_ACTIONS.UPDATE_MESSAGES);
    
    const eventData = { message: { id: 'm1' }, conversationId: 'c1', messageId: 'm1', deleted: false };
    const res = mapping.transformer(eventData);
    expect(res.message).toEqual(eventData.message);
    expect(res.deleted).toBe(false);
  });

  it('deve registrar mapeamento para ACTIVE_CHAT_CHANGED', () => {
    const mapping = registeredMappings.find(m => m.eventType === MESSAGE_EVENTS.ACTIVE_CHAT_CHANGED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(MESSAGE_ACTIONS.SET_ACTIVE_CHAT);
    
    expect(mapping.transformer({ conversationId: 'c1' }).conversationId).toBe('c1');
  });

  it('deve registrar mapeamento para RECONCILE_MESSAGE', () => {
    const mapping = registeredMappings.find(m => m.eventType === MESSAGE_EVENTS.RECONCILE_MESSAGE);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(MESSAGE_ACTIONS.RECONCILE_MESSAGE);
    
    const eventData = { temporaryId: 'tmp1', permanentMessage: { id: 'm1' } };
    const res = mapping.transformer(eventData);
    expect(res.temporaryId).toBe('tmp1');
    expect(res.permanentMessage).toEqual(eventData.permanentMessage);
  });

  it('deve registrar mapeamento para UPDATE_LATEST_MESSAGE', () => {
    const mapping = registeredMappings.find(m => m.eventType === MESSAGE_EVENTS.UPDATE_LATEST_MESSAGE);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(MESSAGE_ACTIONS.UPDATE_LATEST_MESSAGE);
    
    const eventData = { conversationId: 'c1', message: { id: 'm1' } };
    const res = mapping.transformer(eventData);
    expect(res.conversationId).toBe('c1');
    expect(res.message).toEqual(eventData.message);
  });

  it('deve registrar mapeamento para UPDATE_UNREAD_COUNT', () => {
    const mapping = registeredMappings.find(m => m.eventType === MESSAGE_EVENTS.UPDATE_UNREAD_COUNT);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(MESSAGE_ACTIONS.UPDATE_UNREAD_COUNT);
    
    const eventData = { conversationId: 'c1', count: 5, increment: true };
    const res = mapping.transformer(eventData);
    expect(res.count).toBe(5);
    expect(res.increment).toBe(true);
  });

  it('deve registrar mapeamento para UPDATE_MESSAGE_STATUS', () => {
    const mapping = registeredMappings.find(m => m.eventType === MESSAGE_EVENTS.UPDATE_MESSAGE_STATUS);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(MESSAGE_ACTIONS.UPDATE_MESSAGE_STATUS);
    
    const eventData = { messageId: 'm1', status: 'read', value: true };
    const res = mapping.transformer(eventData);
    expect(res.status).toBe('read');
  });

  it('deve registrar mapeamento para UPDATE_TYPING_STATUS', () => {
    const mapping = registeredMappings.find(m => m.eventType === MESSAGE_EVENTS.UPDATE_TYPING_STATUS);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(MESSAGE_ACTIONS.UPDATE_TYPING_STATUS);
    
    const eventData = { conversationId: 'c1', isTyping: true, userId: 'u1' };
    const res = mapping.transformer(eventData);
    expect(res.isTyping).toBe(true);
  });

  it('deve registrar mapeamento para SET_ERROR', () => {
    const mapping = registeredMappings.find(m => m.eventType === MESSAGE_EVENTS.SET_ERROR);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(MESSAGE_ACTIONS.SET_ERROR);
    
    expect(mapping.transformer({ error: 'fail' }).error).toBe('fail');
  });

  it('deve registrar mapeamento para ESCALATION_INITIATED', () => {
    const mapping = registeredMappings.find(m => m.eventType === MESSAGE_EVENTS.ESCALATION_INITIATED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(MESSAGE_ACTIONS.SET_CONVERSATION_STATUS);
    
    const res = mapping.transformer({ conversationId: 'c1' });
    expect(res.status).toBe('escalation_initiated');
    expect(res.isLoading).toBe(true);
  });
});
