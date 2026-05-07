import { setupInterestsMappings } from '../../../services/EventActionBridgeService/interestsMappings';
import { INTERESTS_EVENTS } from '../../../core/constants/events';
import { INTERESTS_ACTIONS } from '../../../core/constants/actions';

// Mock do serviceLocator
jest.mock('../../../core/services/BaseService', () => ({
  serviceLocator: {
    get: jest.fn()
  }
}));

describe('interestsMappings', () => {
  let mockEventActionBridge;
  let registeredMappings;

  beforeEach(() => {
    registeredMappings = [];
    mockEventActionBridge = {
      registerMappings: jest.fn((mappings) => {
        registeredMappings.push(...mappings);
      })
    };
    setupInterestsMappings(mockEventActionBridge);
  });

  it('deve registrar mapeamento para FETCH_CATEGORIES_SUCCESS', () => {
    const mapping = registeredMappings.find(m => m.eventType === INTERESTS_EVENTS.FETCH_CATEGORIES_SUCCESS);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(INTERESTS_ACTIONS.FETCH_CATEGORIES_SUCCESS);
    
    const eventData = { categories: ['music', 'sports'] };
    expect(mapping.transformer(eventData).availableInterests).toEqual(eventData.categories);
  });

  it('deve registrar mapeamento para USER_INTERESTS_UPDATED', () => {
    const mapping = registeredMappings.find(m => m.eventType === INTERESTS_EVENTS.USER_INTERESTS_UPDATED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(INTERESTS_ACTIONS.FETCH_USER_INTERESTS_SUCCESS);
    
    const eventData = { interests: ['coding'] };
    expect(mapping.transformer(eventData).interests).toEqual(eventData.interests);
  });

  it('deve registrar mapeamento para CATEGORIES_UPDATED', () => {
    const mapping = registeredMappings.find(m => m.eventType === INTERESTS_EVENTS.CATEGORIES_UPDATED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(INTERESTS_ACTIONS.SET_AVAILABLE_INTERESTS);
    
    const eventData = { categories: ['a', 'b'] };
    expect(mapping.transformer(eventData)).toEqual(eventData.categories);
  });

  it('deve registrar mapeamento para INTERESTS_UPDATE_ERROR', () => {
    const mapping = registeredMappings.find(m => m.eventType === INTERESTS_EVENTS.INTERESTS_UPDATE_ERROR);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(INTERESTS_ACTIONS.UPDATE_INTERESTS_FAILURE);
    
    expect(mapping.transformer({ error: 'fail' })).toBe('fail');
  });
});
