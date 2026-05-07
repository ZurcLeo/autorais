import { caixinhaReducer } from '../../../reducers/caixinha/caixinhaReducer';
import { initialCaixinhaState } from '../../../core/constants/initialState';
import { CAIXINHA_ACTIONS } from '../../../core/constants/actions';

beforeAll(() => { jest.spyOn(console, 'log').mockImplementation(() => {}); });
afterAll(() => { jest.restoreAllMocks(); });

describe('caixinhaReducer', () => {
  it('retorna estado inicial quando chamado sem ação', () => {
    expect(caixinhaReducer(undefined, { type: '@@INIT' })).toEqual(
      expect.objectContaining({ caixinhas: [], loading: false })
    );
  });

  it('ação desconhecida retorna o estado atual sem mutação', () => {
    const state = { ...initialCaixinhaState };
    expect(caixinhaReducer(state, { type: 'X' })).toBe(state);
  });

  it('FETCH_START seta loading: true e limpa error', () => {
    const state = { ...initialCaixinhaState, error: 'err' };
    const result = caixinhaReducer(state, { type: CAIXINHA_ACTIONS.FETCH_START });
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('FETCH_SUCCESS popula caixinhas e seta loading: false', () => {
    const list = [{ id: '1' }, { id: '2' }];
    const result = caixinhaReducer(
      { ...initialCaixinhaState, loading: true },
      { type: CAIXINHA_ACTIONS.FETCH_SUCCESS, payload: list }
    );
    expect(result.caixinhas).toEqual(list);
    expect(result.loading).toBe(false);
  });

  it('FETCH_SUCCESS com payload undefined usa array vazio', () => {
    const result = caixinhaReducer(initialCaixinhaState, {
      type: CAIXINHA_ACTIONS.FETCH_SUCCESS,
      payload: undefined,
    });
    expect(result.caixinhas).toEqual([]);
  });

  it('FETCH_FAILURE seta error e loading: false', () => {
    const result = caixinhaReducer(
      { ...initialCaixinhaState, loading: true },
      { type: CAIXINHA_ACTIONS.FETCH_FAILURE, payload: 'erro de rede' }
    );
    expect(result.loading).toBe(false);
    expect(result.error).toBe('erro de rede');
  });

  it('UPDATE_SINGLE_CAIXINHA atualiza currentCaixinha', () => {
    const caixinha = { id: 'cx1', nome: 'Férias' };
    const result = caixinhaReducer(initialCaixinhaState, {
      type: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA,
      payload: caixinha,
    });
    expect(result.currentCaixinha).toEqual(caixinha);
  });

  it('UPDATE_CONTRIBUTIONS atualiza contributions', () => {
    const contribs = [{ id: 'c1' }];
    const result = caixinhaReducer(initialCaixinhaState, {
      type: CAIXINHA_ACTIONS.UPDATE_CONTRIBUTIONS,
      payload: contribs,
    });
    expect(result.contributions).toEqual(contribs);
  });

  it('UPDATE_MEMBERS usa members do payload e seta loading: false', () => {
    const members = [{ uid: 'u1' }, { uid: 'u2' }];
    const result = caixinhaReducer(
      { ...initialCaixinhaState, loading: true },
      { type: CAIXINHA_ACTIONS.UPDATE_MEMBERS, payload: { members } }
    );
    expect(result.members).toEqual(members);
    expect(result.loading).toBe(false);
  });

  it('UPDATE_MEMBERS com payload sem members usa array vazio', () => {
    const result = caixinhaReducer(initialCaixinhaState, {
      type: CAIXINHA_ACTIONS.UPDATE_MEMBERS,
      payload: {},
    });
    expect(result.members).toEqual([]);
  });

  it('SET_ERROR seta error no estado', () => {
    const result = caixinhaReducer(initialCaixinhaState, {
      type: CAIXINHA_ACTIONS.SET_ERROR,
      payload: 'erro customizado',
    });
    expect(result.error).toBe('erro customizado');
  });

  it('SET_LOADING atualiza loading com o payload', () => {
    const result = caixinhaReducer(initialCaixinhaState, {
      type: CAIXINHA_ACTIONS.SET_LOADING,
      payload: true,
    });
    expect(result.loading).toBe(true);
  });

  it('CLEAR_STATE retorna ao estado inicial com loading: false', () => {
    const dirty = { ...initialCaixinhaState, loading: true, error: 'x', caixinhas: [{}] };
    const result = caixinhaReducer(dirty, { type: CAIXINHA_ACTIONS.CLEAR_STATE });
    expect(result.loading).toBe(false);
    expect(result.error).toBeNull();
    expect(result.caixinhas).toEqual([]);
  });
});
