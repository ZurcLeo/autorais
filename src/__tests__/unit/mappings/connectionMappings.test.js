import { setupConnectionMappings } from '../../../services/EventActionBridgeService/connectionMappings';
import { CONNECTION_EVENTS } from '../../../core/constants/events';
import { CONNECTION_ACTIONS } from '../../../core/constants/actions';

// Mock do serviceLocator
jest.mock('../../../core/services/BaseService', () => ({
  serviceLocator: {
    get: jest.fn()
  }
}));

describe('connectionMappings', () => {
  let mockEventActionBridge;
  let registeredMappings;

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  beforeEach(() => {
    registeredMappings = [];
    mockEventActionBridge = {
      registerMappings: jest.fn((mappings) => {
        registeredMappings.push(...mappings);
      })
    };
    setupConnectionMappings(mockEventActionBridge);
  });

  it('deve registrar mapeamento para CONNECTIONS_FETCHED', () => {
    const mapping = registeredMappings.find(m => m.eventType === CONNECTION_EVENTS.CONNECTIONS_FETCHED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CONNECTION_ACTIONS.FETCH_CONNECTION_SUCCESS);
    
    const eventData = { 
      result: { 
        friends: { u1: {} }, 
        bestFriends: { u2: {} }, 
        sentRequests: { u3: {} } 
      } 
    };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.friends).toEqual(eventData.result.friends);
    expect(actionPayload.bestFriends).toEqual(eventData.result.bestFriends);
    expect(actionPayload.sentRequests).toEqual(eventData.result.sentRequests);
  });

  it('deve registrar mapeamento para FETCH_FAILURE', () => {
    const mapping = registeredMappings.find(m => m.eventType === CONNECTION_EVENTS.FETCH_FAILURE);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CONNECTION_ACTIONS.FETCH_FAILURE);
    
    expect(mapping.transformer({ error: 'Fail' }).error).toBe('Fail');
  });

  it('deve registrar mapeamento para BEST_FRIEND_ADDED', () => {
    const mapping = registeredMappings.find(m => m.eventType === CONNECTION_EVENTS.BEST_FRIEND_ADDED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CONNECTION_ACTIONS.UPDATE_BEST_FRIENDS);
    
    const eventData = { connection: { id: 'c1' }, friendId: 'u1' };
    const actionPayload = mapping.transformer(eventData);
    expect(actionPayload.connection).toEqual(eventData.connection);
    expect(actionPayload.action).toBe('add');
    
    // Test with array
    const arrayData = [{ id: 'c1' }];
    expect(mapping.transformer(arrayData)).toEqual(arrayData);
  });

  it('deve registrar mapeamento para BEST_FRIEND_REMOVED', () => {
    const mapping = registeredMappings.find(m => m.eventType === CONNECTION_EVENTS.BEST_FRIEND_REMOVED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CONNECTION_ACTIONS.UPDATE_BEST_FRIENDS);
    
    const eventData = { connection: { id: 'c1' }, friendId: 'u1' };
    const actionPayload = mapping.transformer(eventData);
    expect(actionPayload.action).toBe('remove');
  });

  it('deve registrar mapeamento para CONNECTION_DELETED', () => {
    const mapping = registeredMappings.find(m => m.eventType === CONNECTION_EVENTS.CONNECTION_DELETED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CONNECTION_ACTIONS.REMOVE_CONNECTION);
    
    expect(mapping.transformer({ connectionId: 'c1' }).connectionId).toBe('c1');
  });

  it('deve registrar mapeamento para CONNECTION_REQUESTED', () => {
    const mapping = registeredMappings.find(m => m.eventType === CONNECTION_EVENTS.CONNECTION_REQUESTED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CONNECTION_ACTIONS.UPDATE_CONNECTIONS);
    
    const eventData = { newRequest: { id: 'r1' } };
    const actionPayload = mapping.transformer(eventData);
    expect(actionPayload.type).toBe('sentRequests');
    expect(actionPayload.sentRequests).toEqual([eventData.newRequest]);
    expect(actionPayload.action).toBe('add');
  });

  it('deve registrar mapeamento para SEARCH_COMPLETED', () => {
    const mapping = registeredMappings.find(m => m.eventType === CONNECTION_EVENTS.SEARCH_COMPLETED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CONNECTION_ACTIONS.SET_SEARCH_RESULTS);
    
    const eventData = { results: [{ id: 'u1' }] };
    expect(mapping.transformer(eventData)).toEqual(eventData.results);
  });

  it('deve registrar mapeamento para SEARCH_STARTED', () => {
    const mapping = registeredMappings.find(m => m.eventType === CONNECTION_EVENTS.SEARCH_STARTED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CONNECTION_ACTIONS.SEARCH_START);
    
    const eventData = { query: 'test', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    expect(actionPayload.query).toBe('test');
    expect(actionPayload.timestamp).toBe(12345);
  });

  it('deve registrar mapeamento para CLEAR_STATE', () => {
    const mapping = registeredMappings.find(m => m.eventType === CONNECTION_EVENTS.CLEAR_STATE);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CONNECTION_ACTIONS.CLEAR_STATE);
  });

  it('deve registrar mapeamento para CONNECTION_UPDATED', () => {
    const mapping = registeredMappings.find(m => m.eventType === CONNECTION_EVENTS.CONNECTION_UPDATED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CONNECTION_ACTIONS.UPDATE_FRIENDS);
    
    const eventData = { type: 'bestFriend', action: 'remove', connection: { id: 'c1' } };
    const actionPayload = mapping.transformer(eventData);
    expect(actionPayload.connection.isBestFriend).toBe(false);
    expect(actionPayload.action).toBe('add');
  });
});
