// APP_ACTIONS está comentado no arquivo de ações — mockar com os valores esperados
jest.mock('../../../core/constants/actions', () => ({
  APP_ACTIONS: {
    LOADING_STARTED: 'app/LOADING_STARTED',
    LOADING_FINISHED: 'app/LOADING_FINISHED',
  },
}));

import { appReducer } from '../../../reducers/app/appReducer';
import { initialAppState } from '../../../core/constants/initialState';
import { APP_ACTIONS } from '../../../core/constants/actions';

describe('appReducer', () => {
  it('retorna estado inicial quando chamado sem ação', () => {
    expect(appReducer(undefined, { type: '@@INIT' })).toEqual(initialAppState);
  });

  it('ação desconhecida retorna o estado atual sem mutação', () => {
    const state = { ...initialAppState };
    const result = appReducer(state, { type: 'DESCONHECIDA' });
    expect(result).toBe(state);
  });

  it('LOADING_STARTED seta appLoading: true', () => {
    const result = appReducer(initialAppState, { type: APP_ACTIONS.LOADING_STARTED });
    expect(result.appLoading).toBe(true);
  });

  it('LOADING_FINISHED seta appLoading: false', () => {
    const state = { appLoading: true };
    const result = appReducer(state, { type: APP_ACTIONS.LOADING_FINISHED });
    expect(result.appLoading).toBe(false);
  });

  it('LOADING_STARTED preserva outras chaves do estado', () => {
    const state = { appLoading: false, extraKey: 'val' };
    const result = appReducer(state, { type: APP_ACTIONS.LOADING_STARTED });
    expect(result.extraKey).toBe('val');
  });
});
