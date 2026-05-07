import { setupCaixinhaMappings } from '../../../services/EventActionBridgeService/caixinhaMappings';
import { CAIXINHA_EVENTS } from '../../../core/constants/events';
import { CAIXINHA_ACTIONS } from '../../../core/constants/actions';

// Mock do serviceLocator
jest.mock('../../../core/services/BaseService', () => ({
  serviceLocator: {
    get: jest.fn()
  }
}));

describe('caixinhaMappings', () => {
  let mockEventActionBridge;
  let registeredMappings;

  beforeEach(() => {
    registeredMappings = [];
    mockEventActionBridge = {
      registerMappings: jest.fn((mappings) => {
        registeredMappings.push(...mappings);
      })
    };
    setupCaixinhaMappings(mockEventActionBridge);
  });

  it('deve registrar mapeamento para CAIXINHAS_FETCHED', () => {
    const mapping = registeredMappings.find(m => m.eventType === CAIXINHA_EVENTS.CAIXINHAS_FETCHED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CAIXINHA_ACTIONS.FETCH_SUCCESS);
    
    const eventData = { caixinhas: [{ id: 'cx1' }], userId: 'u1', count: 1, timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.caixinhas).toEqual(eventData.caixinhas);
    expect(actionPayload.userId).toBe('u1');
    expect(actionPayload.loading).toBe(false);
    expect(actionPayload.lastUpdated).toBe(12345);
  });

  it('deve registrar mapeamento para MEMBERS_FETCHED', () => {
    const mapping = registeredMappings.find(m => m.eventType === CAIXINHA_EVENTS.MEMBERS_FETCHED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CAIXINHA_ACTIONS.UPDATE_MEMBERS);
    
    const eventData = { members: [{ id: 'm1' }], caixinhaId: 'cx1', count: 1, timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.members).toEqual(eventData.members);
    expect(actionPayload.caixinhaId).toBe('cx1');
    expect(actionPayload.lastUpdated).toBe(12345);
  });

  it('deve registrar mapeamento para CAIXINHA_FETCHED', () => {
    const mapping = registeredMappings.find(m => m.eventType === CAIXINHA_EVENTS.CAIXINHA_FETCHED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA);
    
    const eventData = { caixinha: { id: 'cx1' }, caixinhaId: 'cx1', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.caixinha).toEqual(eventData.caixinha);
    expect(actionPayload.caixinhaId).toBe('cx1');
  });

  it('deve registrar mapeamento para CAIXINHA_CREATED', () => {
    const mapping = registeredMappings.find(m => m.eventType === CAIXINHA_EVENTS.CAIXINHA_CREATED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CAIXINHA_ACTIONS.UPDATE_CAIXINHAS);
    
    const eventData = { caixinha: { id: 'cx2' }, caixinhaId: 'cx2', adminId: 'u1', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.caixinha).toEqual(eventData.caixinha);
    expect(actionPayload.adminId).toBe('u1');
  });

  it('deve registrar mapeamento para CAIXINHA_UPDATED', () => {
    const mapping = registeredMappings.find(m => m.eventType === CAIXINHA_EVENTS.CAIXINHA_UPDATED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA);
    
    const eventData = { caixinha: { id: 'cx1', name: 'New' }, caixinhaId: 'cx1', updatedFields: ['name'], timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.caixinha).toEqual(eventData.caixinha);
    expect(actionPayload.updatedFields).toEqual(['name']);
  });

  it('deve registrar mapeamento para CAIXINHA_DELETED', () => {
    const mapping = registeredMappings.find(m => m.eventType === CAIXINHA_EVENTS.CAIXINHA_DELETED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CAIXINHA_ACTIONS.UPDATE_CAIXINHAS);
    
    const eventData = { caixinhaId: 'cx1', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.caixinhaId).toBe('cx1');
    expect(actionPayload.deleted).toBe(true);
  });

  it('deve registrar mapeamento para CONTRIBUICAO_ADDED', () => {
    const mapping = registeredMappings.find(m => m.eventType === CAIXINHA_EVENTS.CONTRIBUICAO_ADDED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CAIXINHA_ACTIONS.UPDATE_CONTRIBUTIONS);
    
    const eventData = { contribuicao: { id: 'c1' }, caixinhaId: 'cx1', userId: 'u1', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.contribuicao).toEqual(eventData.contribuicao);
    expect(actionPayload.caixinhaId).toBe('cx1');
  });

  it('deve registrar mapeamento para CONTRIBUICOES_FETCHED', () => {
    const mapping = registeredMappings.find(m => m.eventType === CAIXINHA_EVENTS.CONTRIBUICOES_FETCHED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CAIXINHA_ACTIONS.UPDATE_CONTRIBUTIONS);
    
    const eventData = { contribuicoes: [{ id: 'c1' }], caixinhaId: 'cx1', count: 1, timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.contribuicoes).toEqual(eventData.contribuicoes);
    expect(actionPayload.caixinhaId).toBe('cx1');
  });

  it('deve registrar mapeamento para MEMBER_INVITED', () => {
    const mapping = registeredMappings.find(m => m.eventType === CAIXINHA_EVENTS.MEMBER_INVITED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA);
    
    const eventData = { caixinhaId: 'cx1', inviteData: { email: 'test@test.com' }, result: { success: true }, timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.caixinhaId).toBe('cx1');
    expect(actionPayload.inviteData).toEqual(eventData.inviteData);
    expect(actionPayload.result).toEqual(eventData.result);
  });

  it('deve registrar mapeamento para MEMBER_LEFT', () => {
    const mapping = registeredMappings.find(m => m.eventType === CAIXINHA_EVENTS.MEMBER_LEFT);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA);
    
    const eventData = { caixinhaId: 'cx1', userId: 'u1', result: { success: true }, timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.caixinhaId).toBe('cx1');
    expect(actionPayload.userId).toBe('u1');
    expect(actionPayload.result).toEqual(eventData.result);
  });

  it('deve registrar mapeamento para FETCH_START', () => {
    const mapping = registeredMappings.find(m => m.eventType === 'FETCH_START');
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CAIXINHA_ACTIONS.FETCH_START);
    
    const actionPayload = mapping.transformer({ timestamp: 12345 });
    expect(actionPayload.loading).toBe(true);
    expect(actionPayload.timestamp).toBe(12345);
  });

  it('deve registrar mapeamento para ERROR', () => {
    const mapping = registeredMappings.find(m => m.eventType === 'ERROR');
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(CAIXINHA_ACTIONS.FETCH_FAILURE);
    
    const eventData = { error: 'Generic error', errorDetails: 'Details', timestamp: 12345 };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.error).toBe('Generic error');
    expect(actionPayload.loading).toBe(false);
    expect(actionPayload.timestamp).toBe(12345);
  });
});
