import { setupDisputeMappings } from '../../../services/EventActionBridgeService/disputeMappings';
import { DISPUTE_EVENTS } from '../../../core/constants/events';
import { DISPUTE_ACTIONS } from '../../../core/constants/actions';

// Mock do serviceLocator
jest.mock('../../../core/services/BaseService', () => ({
  serviceLocator: {
    get: jest.fn()
  }
}));

describe('disputeMappings', () => {
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
    setupDisputeMappings(mockEventActionBridge);
  });

  it('deve registrar mapeamento para DISPUTES_FETCHED', () => {
    const mapping = registeredMappings.find(m => m.eventType === DISPUTE_EVENTS.DISPUTES_FETCHED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(DISPUTE_ACTIONS.FETCH_SUCCESS);
    
    const eventData = { disputes: [{ id: 'd1' }], caixinhaId: 'cx1', count: 1, status: 'open', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.disputes).toEqual(eventData.disputes);
    expect(actionPayload.caixinhaId).toBe('cx1');
    expect(actionPayload.status).toBe('open');
    expect(actionPayload.loading).toBe(false);
    expect(actionPayload.lastUpdated).toBe(12345);
  });

  it('deve registrar mapeamento para DISPUTE_DETAILS_FETCHED', () => {
    const mapping = registeredMappings.find(m => m.eventType === DISPUTE_EVENTS.DISPUTE_DETAILS_FETCHED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(DISPUTE_ACTIONS.UPDATE_DISPUTE_DETAILS);
    
    const eventData = { dispute: { id: 'd1' }, caixinhaId: 'cx1', disputeId: 'd1', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.dispute).toEqual(eventData.dispute);
    expect(actionPayload.caixinhaId).toBe('cx1');
    expect(actionPayload.disputeId).toBe('d1');
  });

  it('deve registrar mapeamento para DISPUTE_CREATED', () => {
    const mapping = registeredMappings.find(m => m.eventType === DISPUTE_EVENTS.DISPUTE_CREATED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(DISPUTE_ACTIONS.UPDATE_DISPUTES);
    
    const eventData = { dispute: { id: 'd2' }, caixinhaId: 'cx1', type: 'loan', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.dispute).toEqual(eventData.dispute);
    expect(actionPayload.type).toBe('loan');
  });

  it('deve registrar mapeamento para DISPUTE_VOTED', () => {
    const mapping = registeredMappings.find(m => m.eventType === DISPUTE_EVENTS.DISPUTE_VOTED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(DISPUTE_ACTIONS.UPDATE_DISPUTE_DETAILS);
    
    const eventData = { result: { id: 'd1', votes: 1 }, caixinhaId: 'cx1', disputeId: 'd1', vote: 'yes', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.dispute).toEqual(eventData.result);
    expect(actionPayload.vote).toBe('yes');
  });

  it('deve registrar mapeamento para DISPUTE_RESOLVED', () => {
    const mapping = registeredMappings.find(m => m.eventType === DISPUTE_EVENTS.DISPUTE_RESOLVED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(DISPUTE_ACTIONS.UPDATE_DISPUTE_DETAILS);
    
    const eventData = { dispute: { id: 'd1', status: 'resolved' }, caixinhaId: 'cx1', disputeId: 'd1', result: 'approved', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.dispute).toEqual(eventData.dispute);
    expect(actionPayload.result).toBe('approved');
  });

  it('deve registrar mapeamento para DISPUTE_CANCELED', () => {
    const mapping = registeredMappings.find(m => m.eventType === DISPUTE_EVENTS.DISPUTE_CANCELED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(DISPUTE_ACTIONS.UPDATE_DISPUTE_DETAILS);
    
    const eventData = { dispute: { id: 'd1', status: 'canceled' }, caixinhaId: 'cx1', disputeId: 'd1', reason: 'error', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.dispute).toEqual(eventData.dispute);
    expect(actionPayload.reason).toBe('error');
  });

  it('deve registrar mapeamento para FETCH_START', () => {
    const mapping = registeredMappings.find(m => m.eventType === DISPUTE_EVENTS.FETCH_START);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(DISPUTE_ACTIONS.FETCH_START);
    
    const actionPayload = mapping.transformer({ timestamp: 12345 });
    expect(actionPayload.loading).toBe(true);
    expect(actionPayload.timestamp).toBe(12345);
  });

  it('deve registrar mapeamento para FETCH_FAILURE', () => {
    const mapping = registeredMappings.find(m => m.eventType === DISPUTE_EVENTS.FETCH_FAILURE);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(DISPUTE_ACTIONS.FETCH_FAILURE);
    
    const eventData = { error: 'Fetch fail', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.error).toBe('Fetch fail');
    expect(actionPayload.loading).toBe(false);
  });
});
