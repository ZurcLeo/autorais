import { loanReducer } from '../../../reducers/loan/loanReducer';
import { initialLoanState } from '../../../core/constants/initialState';
import { LOAN_ACTIONS } from '../../../core/constants/actions';

describe('loanReducer', () => {
  it('retorna estado inicial quando chamado sem ação', () => {
    expect(loanReducer(undefined, { type: '@@INIT' })).toEqual(initialLoanState);
  });

  it('ação desconhecida retorna o estado atual sem mutação', () => {
    const state = { ...initialLoanState };
    expect(loanReducer(state, { type: 'X' })).toBe(state);
  });

  it('FETCH_START seta loading: true e limpa error', () => {
    const state = { ...initialLoanState, error: 'err' };
    const result = loanReducer(state, { type: LOAN_ACTIONS.FETCH_START });
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('FETCH_SUCCESS popula loans e seta loading: false', () => {
    const loans = [{ id: 'l1' }, { id: 'l2' }];
    const result = loanReducer(
      { ...initialLoanState, loading: true },
      { type: LOAN_ACTIONS.FETCH_SUCCESS, payload: { loans, caixinhaId: 'cx1' } }
    );
    expect(result.loans).toEqual(loans);
    expect(result.loading).toBe(false);
    expect(result.caixinhaId).toBe('cx1');
    expect(result.error).toBeNull();
  });

  it('FETCH_SUCCESS com payload sem loans usa array vazio', () => {
    const result = loanReducer(initialLoanState, {
      type: LOAN_ACTIONS.FETCH_SUCCESS,
      payload: { loans: 'não é array' },
    });
    expect(result.loans).toEqual([]);
  });

  it('FETCH_FAILURE seta error e loading: false', () => {
    const result = loanReducer(
      { ...initialLoanState, loading: true },
      { type: LOAN_ACTIONS.FETCH_FAILURE, payload: { error: 'falha' } }
    );
    expect(result.loading).toBe(false);
    expect(result.error).toBe('falha');
  });

  it('UPDATE_LOANS adiciona empréstimo à lista quando payload.loan existe', () => {
    const state = { ...initialLoanState, loans: [{ id: 'l1' }] };
    const newLoan = { id: 'l2' };
    const result = loanReducer(state, {
      type: LOAN_ACTIONS.UPDATE_LOANS,
      payload: { loan: newLoan, caixinhaId: 'cx1' },
    });
    expect(result.loans).toHaveLength(2);
    expect(result.loans[1]).toEqual(newLoan);
  });

  it('UPDATE_LOANS sem loan não altera a lista', () => {
    const state = { ...initialLoanState, loans: [{ id: 'l1' }] };
    const result = loanReducer(state, {
      type: LOAN_ACTIONS.UPDATE_LOANS,
      payload: {},
    });
    expect(result.loans).toHaveLength(1);
  });

  it('UPDATE_LOAN_DETAILS atualiza empréstimo existente e seta loanDetails', () => {
    const loan = { id: 'l1', status: 'PENDING' };
    const state = { ...initialLoanState, loans: [loan] };
    const updated = { ...loan, status: 'APPROVED' };
    const result = loanReducer(state, {
      type: LOAN_ACTIONS.UPDATE_LOAN_DETAILS,
      payload: { loanId: 'l1', loan: updated },
    });
    expect(result.loans[0].status).toBe('APPROVED');
    expect(result.loanDetails).toEqual(updated);
  });

  it('UPDATE_LOAN_STATISTICS mescla estatísticas', () => {
    const result = loanReducer(initialLoanState, {
      type: LOAN_ACTIONS.UPDATE_LOAN_STATISTICS,
      payload: { statistics: { totalActive: 3, totalAmount: 1000 } },
    });
    expect(result.loanStatistics.totalActive).toBe(3);
    expect(result.loanStatistics.totalAmount).toBe(1000);
  });

  it('SET_ERROR seta error', () => {
    const result = loanReducer(initialLoanState, {
      type: LOAN_ACTIONS.SET_ERROR,
      payload: 'erro customizado',
    });
    expect(result.error).toBe('erro customizado');
  });

  it('SET_LOADING atualiza loading', () => {
    const result = loanReducer(initialLoanState, {
      type: LOAN_ACTIONS.SET_LOADING,
      payload: true,
    });
    expect(result.loading).toBe(true);
  });

  it('CLEAR_STATE retorna ao estado inicial (exceto lastUpdated)', () => {
    const dirty = { ...initialLoanState, loading: true, error: 'x', loans: [{ id: 'l1' }] };
    const result = loanReducer(dirty, { type: LOAN_ACTIONS.CLEAR_STATE });
    expect(result.loading).toBe(false);
    expect(result.error).toBeNull();
    expect(result.loans).toEqual([]);
  });
});
