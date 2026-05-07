import { disputeReducer } from '../../../reducers/dispute/disputeReducer';
import { initialDisputeState } from '../../../core/constants/initialState';
import { DISPUTE_ACTIONS } from '../../../core/constants/actions';

beforeAll(() => { jest.spyOn(console, 'log').mockImplementation(() => {}); });
afterAll(() => { jest.restoreAllMocks(); });

const openDispute   = { id: 'd1', status: 'OPEN',     type: 'LOAN_APPROVAL' };
const closedDispute = { id: 'd2', status: 'APPROVED',  type: 'OTHER' };
const expiredDispute = { id: 'd3', status: 'EXPIRED',  type: 'LOAN_APPROVAL' };

describe('disputeReducer', () => {
  it('retorna estado inicial quando chamado sem ação', () => {
    expect(disputeReducer(undefined, { type: '@@INIT' })).toEqual(initialDisputeState);
  });

  it('ação desconhecida retorna o estado atual sem mutação', () => {
    const state = { ...initialDisputeState };
    expect(disputeReducer(state, { type: 'X' })).toBe(state);
  });

  it('FETCH_START seta loading: true e limpa error', () => {
    const state = { ...initialDisputeState, error: 'err' };
    const result = disputeReducer(state, { type: DISPUTE_ACTIONS.FETCH_START });
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('FETCH_SUCCESS particiona disputes em active/resolved/loan', () => {
    const disputes = [openDispute, closedDispute, expiredDispute];
    const result = disputeReducer(
      { ...initialDisputeState, loading: true },
      { type: DISPUTE_ACTIONS.FETCH_SUCCESS, payload: { disputes } }
    );
    expect(result.loading).toBe(false);
    expect(result.disputes).toHaveLength(3);
    expect(result.activeDisputes).toHaveLength(1);
    expect(result.activeDisputes[0].id).toBe('d1');
    expect(result.resolvedDisputes).toHaveLength(2); // APPROVED + EXPIRED
    expect(result.loanDisputes).toHaveLength(2); // d1 + d3 (tipo LOAN_APPROVAL)
  });

  it('FETCH_SUCCESS com disputes vazio mantém arrays vazios', () => {
    const result = disputeReducer(initialDisputeState, {
      type: DISPUTE_ACTIONS.FETCH_SUCCESS,
      payload: { disputes: [] },
    });
    expect(result.disputes).toEqual([]);
    expect(result.activeDisputes).toEqual([]);
    expect(result.resolvedDisputes).toEqual([]);
  });

  it('FETCH_FAILURE seta error e loading: false', () => {
    const result = disputeReducer(
      { ...initialDisputeState, loading: true },
      { type: DISPUTE_ACTIONS.FETCH_FAILURE, payload: { error: 'falha' } }
    );
    expect(result.loading).toBe(false);
    expect(result.error).toBe('falha');
  });

  it('UPDATE_DISPUTES com dispute substitui o item existente', () => {
    const initial = { ...initialDisputeState, disputes: [openDispute] };
    const updated = { ...openDispute, status: 'APPROVED' };
    const result = disputeReducer(initial, {
      type: DISPUTE_ACTIONS.UPDATE_DISPUTES,
      payload: { dispute: updated },
    });
    expect(result.disputes).toHaveLength(1);
    expect(result.disputes[0].status).toBe('APPROVED');
    expect(result.activeDisputes).toHaveLength(0); // APPROVED não é OPEN
    expect(result.resolvedDisputes).toHaveLength(1);
  });

  it('UPDATE_DISPUTES sem dispute não altera a lista', () => {
    const state = { ...initialDisputeState, disputes: [openDispute] };
    const result = disputeReducer(state, {
      type: DISPUTE_ACTIONS.UPDATE_DISPUTES,
      payload: {},
    });
    expect(result.disputes).toHaveLength(1);
  });

  it('UPDATE_DISPUTE_DETAILS atualiza dispute existente e seta currentDispute', () => {
    const state = { ...initialDisputeState, disputes: [openDispute] };
    const updatedDispute = { ...openDispute, status: 'REJECTED' };
    const result = disputeReducer(state, {
      type: DISPUTE_ACTIONS.UPDATE_DISPUTE_DETAILS,
      payload: { disputeId: 'd1', dispute: updatedDispute },
    });
    expect(result.currentDispute).toEqual(updatedDispute);
    expect(result.disputes.find((d) => d.id === 'd1').status).toBe('REJECTED');
  });

  it('UPDATE_DISPUTE_DETAILS adiciona dispute novo se não existir', () => {
    const state = { ...initialDisputeState, disputes: [] };
    const newDispute = { id: 'dNew', status: 'OPEN', type: 'LOAN_APPROVAL' };
    const result = disputeReducer(state, {
      type: DISPUTE_ACTIONS.UPDATE_DISPUTE_DETAILS,
      payload: { disputeId: 'dNew', dispute: newDispute },
    });
    expect(result.disputes).toHaveLength(1);
  });

  it('UPDATE_DISPUTE_STATS mescla stats', () => {
    const result = disputeReducer(initialDisputeState, {
      type: DISPUTE_ACTIONS.UPDATE_DISPUTE_STATS,
      payload: { stats: { total: 10, resolved: 5 } },
    });
    expect(result.disputeStats.total).toBe(10);
    expect(result.disputeStats.resolved).toBe(5);
  });

  it('SET_ERROR seta error', () => {
    const result = disputeReducer(initialDisputeState, {
      type: DISPUTE_ACTIONS.SET_ERROR,
      payload: 'erro',
    });
    expect(result.error).toBe('erro');
  });

  it('SET_LOADING atualiza loading', () => {
    const result = disputeReducer(initialDisputeState, {
      type: DISPUTE_ACTIONS.SET_LOADING,
      payload: true,
    });
    expect(result.loading).toBe(true);
  });

  it('CLEAR_STATE retorna ao estado inicial', () => {
    const dirty = { ...initialDisputeState, disputes: [openDispute], loading: true };
    const result = disputeReducer(dirty, { type: DISPUTE_ACTIONS.CLEAR_STATE });
    expect(result.disputes).toEqual(initialDisputeState.disputes);
    expect(result.loading).toBe(initialDisputeState.loading);
  });
});
