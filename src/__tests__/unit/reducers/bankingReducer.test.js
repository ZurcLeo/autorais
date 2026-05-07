import { bankingReducer } from '../../../reducers/banking/bankingReducer';
import { initialBankingState } from '../../../core/constants/initialState';
import { BANKING_ACTIONS } from '../../../core/constants/actions';

beforeAll(() => { jest.spyOn(console, 'log').mockImplementation(() => {}); });
afterAll(() => { jest.restoreAllMocks(); });

describe('bankingReducer', () => {
  it('retorna estado inicial quando chamado sem ação', () => {
    expect(bankingReducer(undefined, { type: '@@INIT' })).toEqual(initialBankingState);
  });

  it('ação desconhecida retorna o estado atual sem mutação', () => {
    const state = { ...initialBankingState };
    expect(bankingReducer(state, { type: 'DESCONHECIDA' })).toBe(state);
  });

  it('FETCH_START seta loading: true e limpa error', () => {
    const state = { ...initialBankingState, error: 'err anterior' };
    const result = bankingReducer(state, { type: BANKING_ACTIONS.FETCH_START });
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('FETCH_SUCCESS popula bankingInfo e seta loading: false', () => {
    const info = { conta: '123' };
    const result = bankingReducer(
      { ...initialBankingState, loading: true },
      { type: BANKING_ACTIONS.FETCH_SUCCESS, payload: { bankingInfo: info } }
    );
    expect(result.loading).toBe(false);
    expect(result.bankingInfo).toEqual(info);
    expect(result.error).toBeNull();
  });

  it('FETCH_SUCCESS sem bankingInfo seta null', () => {
    const result = bankingReducer(
      initialBankingState,
      { type: BANKING_ACTIONS.FETCH_SUCCESS, payload: {} }
    );
    expect(result.bankingInfo).toBeNull();
  });

  it('FETCH_FAILURE seta error e loading: false', () => {
    const result = bankingReducer(
      { ...initialBankingState, loading: true },
      { type: BANKING_ACTIONS.FETCH_FAILURE, payload: { error: 'falha' } }
    );
    expect(result.loading).toBe(false);
    expect(result.error).toBe('falha');
  });

  it('REGISTER_START / VALIDATE_START / TRANSFER_START / CANCEL_START setam loading: true', () => {
    [
      BANKING_ACTIONS.REGISTER_START,
      BANKING_ACTIONS.VALIDATE_START,
      BANKING_ACTIONS.TRANSFER_START,
      BANKING_ACTIONS.CANCEL_START,
    ].forEach((type) => {
      const result = bankingReducer(initialBankingState, { type });
      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  it('VALIDATE_SUCCESS / TRANSFER_SUCCESS / CANCEL_SUCCESS setam loading: false', () => {
    [
      BANKING_ACTIONS.VALIDATE_SUCCESS,
      BANKING_ACTIONS.TRANSFER_SUCCESS,
      BANKING_ACTIONS.CANCEL_SUCCESS,
    ].forEach((type) => {
      const result = bankingReducer({ ...initialBankingState, loading: true }, { type, payload: {} });
      expect(result.loading).toBe(false);
    });
  });

  it('REGISTER_FAILURE / VALIDATE_FAILURE / TRANSFER_FAILURE / CANCEL_FAILURE setam error', () => {
    [
      BANKING_ACTIONS.REGISTER_FAILURE,
      BANKING_ACTIONS.VALIDATE_FAILURE,
      BANKING_ACTIONS.TRANSFER_FAILURE,
      BANKING_ACTIONS.CANCEL_FAILURE,
    ].forEach((type) => {
      const result = bankingReducer(initialBankingState, { type, payload: { error: type } });
      expect(result.error).toBe(type);
      expect(result.loading).toBe(false);
    });
  });

  it('TRANSACTION_STATUS_UPDATED popula transactionStatuses pelo transactionId', () => {
    const result = bankingReducer(initialBankingState, {
      type: BANKING_ACTIONS.TRANSACTION_STATUS_UPDATED,
      payload: { transactionId: 'tx1', status: 'paid', updatedAt: '2024-01-01' },
    });
    expect(result.transactionStatuses['tx1'].status).toBe('paid');
  });

  it('BALANCE_UPDATED registra saldo pelo accountId', () => {
    const result = bankingReducer(initialBankingState, {
      type: BANKING_ACTIONS.BALANCE_UPDATED,
      payload: { accountId: 'acc1', previousBalance: 100, currentBalance: 200, updatedAt: 'now' },
    });
    expect(result.balances['acc1'].current).toBe(200);
    expect(result.balances['acc1'].previous).toBe(100);
  });

  it('TRANSACTION_ERROR acumula erros e seta error na raiz', () => {
    const state = { ...initialBankingState, transactionErrors: [] };
    const result = bankingReducer(state, {
      type: BANKING_ACTIONS.TRANSACTION_ERROR,
      payload: { errorType: 'timeout', message: 'ops', transactionId: 'tx1' },
    });
    expect(result.transactionErrors).toHaveLength(1);
    expect(result.transactionErrors[0].type).toBe('timeout');
    expect(result.error).toBe('ops');
  });

  it('NOTIFICATION_RECEIVED acumula notificações', () => {
    const state = { ...initialBankingState, notifications: [] };
    const result = bankingReducer(state, {
      type: BANKING_ACTIONS.NOTIFICATION_RECEIVED,
      payload: { notificationType: 'info', message: 'ok', priority: 'low', timestamp: 1 },
    });
    expect(result.notifications).toHaveLength(1);
    expect(result.notifications[0].read).toBe(false);
  });

  it('CLEAR_ERROR seta error: null', () => {
    const state = { ...initialBankingState, error: 'algum erro' };
    const result = bankingReducer(state, { type: BANKING_ACTIONS.CLEAR_ERROR });
    expect(result.error).toBeNull();
  });

  it('CLEAR_STATE retorna ao initialBankingState', () => {
    const state = { ...initialBankingState, loading: true, error: 'x', bankingInfo: {} };
    const result = bankingReducer(state, { type: BANKING_ACTIONS.CLEAR_STATE });
    expect(result).toEqual(initialBankingState);
  });
});
