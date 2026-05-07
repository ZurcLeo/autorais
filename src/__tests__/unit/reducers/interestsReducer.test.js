jest.mock('../../../core/logging', () => ({
  coreLogger: { logEvent: jest.fn() },
}));

import { interestsReducer } from '../../../reducers/interests/interestsReducer';
import { initialInterestsState } from '../../../core/constants/initialState';
import { INTERESTS_ACTIONS } from '../../../core/constants/actions';

describe('interestsReducer', () => {
  it('retorna estado inicial quando chamado sem ação', () => {
    expect(interestsReducer(undefined, { type: '@@INIT' })).toEqual(initialInterestsState);
  });

  it('ação desconhecida retorna o estado atual sem mutação', () => {
    const state = { ...initialInterestsState };
    expect(interestsReducer(state, { type: 'X' })).toBe(state);
  });

  it('FETCH_USER_INTERESTS_START seta loading.userInterests: true e limpa errors.userInterests', () => {
    const state = {
      ...initialInterestsState,
      errors: { ...initialInterestsState.errors, userInterests: 'err' },
    };
    const result = interestsReducer(state, { type: INTERESTS_ACTIONS.FETCH_USER_INTERESTS_START });
    expect(result.loading.userInterests).toBe(true);
    expect(result.errors.userInterests).toBeNull();
  });

  it('FETCH_USER_INTERESTS_SUCCESS popula userInterests e seta loading: false', () => {
    const interests = [{ id: 'i1' }];
    const result = interestsReducer(
      { ...initialInterestsState, loading: { ...initialInterestsState.loading, userInterests: true } },
      { type: INTERESTS_ACTIONS.FETCH_USER_INTERESTS_SUCCESS, payload: { interests } }
    );
    expect(result.userInterests).toEqual(interests);
    expect(result.loading.userInterests).toBe(false);
    expect(result.errors.userInterests).toBeNull();
  });

  it('FETCH_USER_INTERESTS_FAILURE seta loading: false e registra error', () => {
    const result = interestsReducer(initialInterestsState, {
      type: INTERESTS_ACTIONS.FETCH_USER_INTERESTS_FAILURE,
      payload: 'falha',
    });
    expect(result.loading.userInterests).toBe(false);
    expect(result.errors.userInterests).toBe('falha');
  });

  it('FETCH_CATEGORIES_SUCCESS popula availableInterests', () => {
    const availableInterests = [{ id: 'cat1' }];
    const result = interestsReducer(initialInterestsState, {
      type: INTERESTS_ACTIONS.FETCH_CATEGORIES_SUCCESS,
      payload: { availableInterests },
    });
    expect(result.availableInterests).toEqual(availableInterests);
    expect(result.loading.availableInterests).toBe(false);
  });

  it('FETCH_CATEGORIES_FAILURE seta errors.availableInterests', () => {
    const result = interestsReducer(initialInterestsState, {
      type: INTERESTS_ACTIONS.FETCH_CATEGORIES_FAILURE,
      payload: 'erro categoria',
    });
    expect(result.errors.availableInterests).toBe('erro categoria');
    expect(result.loading.availableInterests).toBe(false);
  });

  it('SET_AVAILABLE_INTERESTS atualiza availableInterests quando dados são diferentes', () => {
    const newData = [{ id: 'x1' }];
    const result = interestsReducer(initialInterestsState, {
      type: INTERESTS_ACTIONS.SET_AVAILABLE_INTERESTS,
      payload: newData,
    });
    expect(result.availableInterests).toEqual(newData);
  });

  it('SET_AVAILABLE_INTERESTS retorna estado original quando dados são iguais', () => {
    const state = {
      ...initialInterestsState,
      availableInterests: [{ id: 'same' }],
    };
    const result = interestsReducer(state, {
      type: INTERESTS_ACTIONS.SET_AVAILABLE_INTERESTS,
      payload: [{ id: 'same' }],
    });
    expect(result).toBe(state);
  });

  it('UPDATE_INTERESTS_START seta loading.updateInterests: true', () => {
    const result = interestsReducer(initialInterestsState, {
      type: INTERESTS_ACTIONS.UPDATE_INTERESTS_START,
    });
    expect(result.loading.updateInterests).toBe(true);
    expect(result.errors.updateInterests).toBeNull();
  });

  it('UPDATE_INTERESTS_SUCCESS seta loading.updateInterests: false', () => {
    const result = interestsReducer(
      { ...initialInterestsState, loading: { ...initialInterestsState.loading, updateInterests: true } },
      { type: INTERESTS_ACTIONS.UPDATE_INTERESTS_SUCCESS }
    );
    expect(result.loading.updateInterests).toBe(false);
  });

  it('UPDATE_INTERESTS_FAILURE seta errors.updateInterests', () => {
    const result = interestsReducer(initialInterestsState, {
      type: INTERESTS_ACTIONS.UPDATE_INTERESTS_FAILURE,
      payload: 'falha update',
    });
    expect(result.errors.updateInterests).toBe('falha update');
  });

  it('UPDATE_SELECTED_INTERESTS substitui selectedInterests', () => {
    const selected = [{ id: 's1' }, { id: 's2' }];
    const result = interestsReducer(initialInterestsState, {
      type: INTERESTS_ACTIONS.UPDATE_SELECTED_INTERESTS,
      payload: selected,
    });
    expect(result.selectedInterests).toEqual(selected);
  });
});
