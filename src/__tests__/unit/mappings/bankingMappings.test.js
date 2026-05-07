import { setupBankingMappings } from '../../../services/EventActionBridgeService/bankingMappings';
import { BANKING_EVENTS } from '../../../core/constants/events';
import { BANKING_ACTIONS } from '../../../core/constants/actions';

// Mock do serviceLocator para evitar erros de inicialização
jest.mock('../../../core/services/BaseService', () => ({
  serviceLocator: {
    get: jest.fn()
  }
}));

describe('bankingMappings', () => {
  let mockEventActionBridge;
  let registeredMappings;

  beforeEach(() => {
    registeredMappings = [];
    mockEventActionBridge = {
      registerMappings: jest.fn((mappings) => {
        registeredMappings.push(...mappings);
      })
    };
    setupBankingMappings(mockEventActionBridge);
  });

  it('deve registrar mapeamento para FETCH_START', () => {
    const mapping = registeredMappings.find(m => m.eventType === BANKING_EVENTS.FETCH_START);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(BANKING_ACTIONS.FETCH_START);
    expect(mapping.transformer()).toEqual({});
  });

  it('deve registrar mapeamento para BANKING_INFO_FETCHED', () => {
    const mapping = registeredMappings.find(m => m.eventType === BANKING_EVENTS.BANKING_INFO_FETCHED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(BANKING_ACTIONS.FETCH_SUCCESS);
    
    const eventData = { bankingInfo: { balance: 100 } };
    expect(mapping.transformer(eventData).bankingInfo).toEqual(eventData.bankingInfo);
  });

  it('deve registrar mapeamento para BANKING_HISTORY_FETCHED', () => {
    const mapping = registeredMappings.find(m => m.eventType === BANKING_EVENTS.BANKING_HISTORY_FETCHED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(BANKING_ACTIONS.UPDATE_BANKING_HISTORY);
    
    const eventData = { history: [{ id: 1 }] };
    expect(mapping.transformer(eventData).history).toEqual(eventData.history);
  });

  it('deve registrar mapeamento para FETCH_FAILURE', () => {
    const mapping = registeredMappings.find(m => m.eventType === BANKING_EVENTS.FETCH_FAILURE);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(BANKING_ACTIONS.FETCH_FAILURE);
    
    const eventData = { error: 'Connection error' };
    expect(mapping.transformer(eventData).error).toBe('Connection error');
  });

  it('deve registrar mapeamento para REGISTER_START', () => {
    const mapping = registeredMappings.find(m => m.eventType === BANKING_EVENTS.REGISTER_START);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(BANKING_ACTIONS.REGISTER_START);
    expect(mapping.transformer()).toEqual({});
  });

  it('deve registrar mapeamento para ACCOUNT_REGISTERED', () => {
    const mapping = registeredMappings.find(m => m.eventType === BANKING_EVENTS.ACCOUNT_REGISTERED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(BANKING_ACTIONS.REGISTER_SUCCESS);
    
    const eventData = { accountData: { id: 'acc1' } };
    expect(mapping.transformer(eventData).accountData).toEqual(eventData.accountData);
  });

  it('deve registrar mapeamento para REGISTER_FAILURE', () => {
    const mapping = registeredMappings.find(m => m.eventType === BANKING_EVENTS.REGISTER_FAILURE);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(BANKING_ACTIONS.REGISTER_FAILURE);
    
    const eventData = { error: 'Register error' };
    expect(mapping.transformer(eventData).error).toBe('Register error');
  });

  it('deve registrar mapeamento para VALIDATE_START', () => {
    const mapping = registeredMappings.find(m => m.eventType === BANKING_EVENTS.VALIDATE_START);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(BANKING_ACTIONS.VALIDATE_START);
    expect(mapping.transformer()).toEqual({});
  });

  it('deve registrar mapeamento para ACCOUNT_VALIDATED', () => {
    const mapping = registeredMappings.find(m => m.eventType === BANKING_EVENTS.ACCOUNT_VALIDATED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(BANKING_ACTIONS.VALIDATE_SUCCESS);
    
    const eventData = { result: { valid: true } };
    expect(mapping.transformer(eventData).result).toEqual(eventData.result);
  });

  it('deve registrar mapeamento para VALIDATE_FAILURE', () => {
    const mapping = registeredMappings.find(m => m.eventType === BANKING_EVENTS.VALIDATE_FAILURE);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(BANKING_ACTIONS.VALIDATE_FAILURE);
    
    const eventData = { error: 'Validation error' };
    expect(mapping.transformer(eventData).error).toBe('Validation error');
  });

  it('deve registrar mapeamento para TRANSFER_START', () => {
    const mapping = registeredMappings.find(m => m.eventType === BANKING_EVENTS.TRANSFER_START);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(BANKING_ACTIONS.TRANSFER_START);
    expect(mapping.transformer()).toEqual({});
  });

  it('deve registrar mapeamento para FUNDS_TRANSFERRED', () => {
    const mapping = registeredMappings.find(m => m.eventType === BANKING_EVENTS.FUNDS_TRANSFERRED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(BANKING_ACTIONS.TRANSFER_SUCCESS);
    
    const eventData = { result: { txId: 'tx1' } };
    expect(mapping.transformer(eventData).result).toEqual(eventData.result);
  });

  it('deve registrar mapeamento para TRANSFER_FAILURE', () => {
    const mapping = registeredMappings.find(m => m.eventType === BANKING_EVENTS.TRANSFER_FAILURE);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(BANKING_ACTIONS.TRANSFER_FAILURE);
    
    const eventData = { error: 'Transfer error' };
    expect(mapping.transformer(eventData).error).toBe('Transfer error');
  });

  it('deve registrar mapeamento para CANCEL_START', () => {
    const mapping = registeredMappings.find(m => m.eventType === BANKING_EVENTS.CANCEL_START);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(BANKING_ACTIONS.CANCEL_START);
    expect(mapping.transformer()).toEqual({});
  });

  it('deve registrar mapeamento para TRANSACTION_CANCELED', () => {
    const mapping = registeredMappings.find(m => m.eventType === BANKING_EVENTS.TRANSACTION_CANCELED);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(BANKING_ACTIONS.CANCEL_SUCCESS);
    
    const eventData = { result: { canceled: true } };
    expect(mapping.transformer(eventData).result).toEqual(eventData.result);
  });

  it('deve registrar mapeamento para CANCEL_FAILURE', () => {
    const mapping = registeredMappings.find(m => m.eventType === BANKING_EVENTS.CANCEL_FAILURE);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(BANKING_ACTIONS.CANCEL_FAILURE);
    
    const eventData = { error: 'Cancel error' };
    expect(mapping.transformer(eventData).error).toBe('Cancel error');
  });

  it('deve registrar mapeamento para CLEAR_BANKING_DATA', () => {
    const mapping = registeredMappings.find(m => m.eventType === BANKING_EVENTS.CLEAR_BANKING_DATA);
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe(BANKING_ACTIONS.CLEAR_STATE);
    expect(mapping.transformer()).toEqual({});
  });

  it('deve registrar mapeamento para TRANSACTION_DETAILS_FETCHED', () => {
    const mapping = registeredMappings.find(m => m.eventType === 'TRANSACTION_DETAILS_FETCHED');
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe('banking/TRANSACTION_DETAILS_FETCHED');
    
    const eventData = { details: { id: 'tx1' } };
    expect(mapping.transformer(eventData).transactionDetails).toEqual(eventData.details);
  });

  it('deve registrar mapeamento para TRANSACTION_STATUS_UPDATED', () => {
    const mapping = registeredMappings.find(m => m.eventType === 'TRANSACTION_STATUS_UPDATED');
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe('banking/TRANSACTION_STATUS_UPDATED');
    
    const eventData = { transactionId: 'tx1', status: 'completed', updatedAt: '2023-01-01' };
    const result = mapping.transformer(eventData);
    expect(result.transactionId).toBe('tx1');
    expect(result.status).toBe('completed');
    expect(result.updatedAt).toBe('2023-01-01');
  });

  it('deve registrar mapeamento para BALANCE_UPDATED', () => {
    const mapping = registeredMappings.find(m => m.eventType === 'BALANCE_UPDATED');
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe('banking/BALANCE_UPDATED');
    
    const eventData = { accountId: 'acc1', previousBalance: 50, currentBalance: 100, updatedAt: '2023-01-01' };
    const result = mapping.transformer(eventData);
    expect(result.accountId).toBe('acc1');
    expect(result.previousBalance).toBe(50);
    expect(result.currentBalance).toBe(100);
    expect(result.updatedAt).toBe('2023-01-01');
  });

  it('deve registrar mapeamento para INSUFFICIENT_FUNDS_ERROR', () => {
    const mapping = registeredMappings.find(m => m.eventType === 'INSUFFICIENT_FUNDS_ERROR');
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe('banking/TRANSACTION_ERROR');
    
    const eventData = { message: 'Sem grana', transactionId: 'tx1' };
    const result = mapping.transformer(eventData);
    expect(result.errorType).toBe('INSUFFICIENT_FUNDS');
    expect(result.message).toBe('Sem grana');
    expect(result.transactionId).toBe('tx1');
  });

  it('deve registrar mapeamento para BANKING_NOTIFICATION_RECEIVED', () => {
    const mapping = registeredMappings.find(m => m.eventType === 'BANKING_NOTIFICATION_RECEIVED');
    expect(mapping).toBeDefined();
    expect(mapping.actionType).toBe('banking/NOTIFICATION_RECEIVED');
    
    const eventData = { type: 'alert', message: 'alerta', priority: 'high', timestamp: '2023-01-01' };
    const result = mapping.transformer(eventData);
    expect(result.notificationType).toBe('alert');
    expect(result.message).toBe('alerta');
    expect(result.priority).toBe('high');
    expect(result.timestamp).toBe('2023-01-01');
  });
});
