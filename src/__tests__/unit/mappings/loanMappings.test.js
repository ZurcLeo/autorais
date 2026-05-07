import { setupLoanMappings } from '../../../services/EventActionBridgeService/loanMappings';
import { LOAN_EVENTS } from '../../../core/constants/events';
import { LOAN_ACTIONS } from '../../../core/constants/actions';

// Mock do serviceLocator para evitar erros de inicialização
jest.mock('../../../core/services/BaseService', () => ({
  serviceLocator: {
    get: jest.fn()
  }
}));

describe('loanMappings', () => {
  let mockEventActionBridge;
  let registeredMappings;

  beforeEach(() => {
    registeredMappings = [];
    mockEventActionBridge = {
      registerMappings: jest.fn((mappings) => {
        registeredMappings.push(...mappings);
      })
    };
    setupLoanMappings(mockEventActionBridge);
  });

  it('deve registrar mapeamento para LOANS_FETCHED', () => {
    const mapping = registeredMappings.find(m => m.eventType === LOAN_EVENTS.LOANS_FETCHED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(LOAN_ACTIONS.FETCH_SUCCESS);
    
    const eventData = { 
      loans: [{ id: '1' }], 
      caixinhaId: 'cx1', 
      count: 1,
      timestamp: 12345
    };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.loans).toEqual(eventData.loans);
    expect(actionPayload.caixinhaId).toBe('cx1');
    expect(actionPayload.lastUpdated).toBe(12345);
    expect(actionPayload.loading).toBe(false);
  });

  it('deve registrar mapeamento para LOAN_CREATED', () => {
    const mapping = registeredMappings.find(m => m.eventType === LOAN_EVENTS.LOAN_CREATED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(LOAN_ACTIONS.UPDATE_LOANS);
    
    const eventData = { 
      loan: { id: '2' }, 
      caixinhaId: 'cx1', 
      requiresDispute: true 
    };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.loan).toEqual(eventData.loan);
    expect(actionPayload.requiresDispute).toBe(true);
    expect(actionPayload.loading).toBe(false);
  });

  it('deve registrar mapeamento para LOAN_PAYMENT_MADE', () => {
    const mapping = registeredMappings.find(m => m.eventType === LOAN_EVENTS.LOAN_PAYMENT_MADE);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(LOAN_ACTIONS.UPDATE_LOAN_DETAILS);
    
    const eventData = { 
      payment: { valor: 100 }, 
      loanId: 'l1',
      caixinhaId: 'cx1' 
    };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.payment).toEqual(eventData.payment);
    expect(actionPayload.loanId).toBe('l1');
  });

  it('deve registrar mapeamento para LOAN_APPROVED', () => {
    const mapping = registeredMappings.find(m => m.eventType === LOAN_EVENTS.LOAN_APPROVED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(LOAN_ACTIONS.UPDATE_LOAN_DETAILS);
    
    const eventData = { 
      loan: { id: 'l1', status: 'aprovado' }, 
      loanId: 'l1' 
    };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.loan).toEqual(eventData.loan);
    expect(actionPayload.status).toBe('aprovado');
  });

  it('deve registrar mapeamento para FETCH_FAILURE', () => {
    const mapping = registeredMappings.find(m => m.eventType === LOAN_EVENTS.FETCH_FAILURE);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(LOAN_ACTIONS.FETCH_FAILURE);
    
    const eventData = { 
      error: 'Falha na conexão',
      errorDetails: { code: 500 }
    };
    const actionPayload = mapping.transformer(eventData);
    
    expect(actionPayload.error).toBe('Falha na conexão');
    expect(actionPayload.errorDetails).toEqual({ code: 500 });
    expect(actionPayload.loading).toBe(false);
  });
});
