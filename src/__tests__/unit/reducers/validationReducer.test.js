import { validationReducer } from '../../../reducers/validation/validationReducer';
import { initialValidationState } from '../../../core/constants/initialState';
import { VALIDATION_ACTIONS } from '../../../core/constants/actions';

describe('validationReducer', () => {
  it('retorna estado inicial quando chamado sem ação', () => {
    const state = validationReducer(undefined, { type: '@@INIT' });
    expect(state.errors).toBeInstanceOf(Map);
    expect(state.dirtyFields).toBeInstanceOf(Set);
    expect(state.isValidating).toBe(false);
  });

  it('ação desconhecida retorna o estado atual sem mutação', () => {
    const state = { ...initialValidationState };
    expect(validationReducer(state, { type: 'X' })).toBe(state);
  });

  it('SET_ERRORS cria novo Map com os erros fornecidos', () => {
    const result = validationReducer(initialValidationState, {
      type: VALIDATION_ACTIONS.SET_ERRORS,
      payload: [['campo1', 'Campo obrigatório'], ['campo2', 'Inválido']],
    });
    expect(result.errors).toBeInstanceOf(Map);
    expect(result.errors.get('campo1')).toBe('Campo obrigatório');
    expect(result.errors.get('campo2')).toBe('Inválido');
    expect(result.errors.size).toBe(2);
  });

  it('SET_ERRORS retorna estado atual quando Map novo tem mesmo tamanho e chaves', () => {
    const state = {
      ...initialValidationState,
      errors: new Map([['campo1', 'erro']]),
    };
    // Mesmo tamanho, mesma chave - deve retornar o mesmo estado
    const result = validationReducer(state, {
      type: VALIDATION_ACTIONS.SET_ERRORS,
      payload: [['campo1', 'outro texto']],
    });
    expect(result).toBe(state);
  });

  it('SET_ERRORS com erros diferentes retorna novo estado', () => {
    const state = {
      ...initialValidationState,
      errors: new Map([['campo1', 'erro']]),
    };
    const result = validationReducer(state, {
      type: VALIDATION_ACTIONS.SET_ERRORS,
      payload: [['campo1', 'erro'], ['campo2', 'novo erro']],
    });
    expect(result).not.toBe(state);
    expect(result.errors.size).toBe(2);
  });

  it('SET_DIRTY_FIELDS adiciona campos ao Set de dirtyFields', () => {
    const result = validationReducer(initialValidationState, {
      type: VALIDATION_ACTIONS.SET_DIRTY_FIELDS,
      payload: ['campo1', 'campo2'],
    });
    expect(result.dirtyFields).toBeInstanceOf(Set);
    expect(result.dirtyFields.has('campo1')).toBe(true);
    expect(result.dirtyFields.has('campo2')).toBe(true);
    expect(result.dirtyFields.size).toBe(2);
  });

  it('SET_DIRTY_FIELDS retorna estado atual quando campos já estão no Set', () => {
    const state = {
      ...initialValidationState,
      dirtyFields: new Set(['campo1']),
    };
    const result = validationReducer(state, {
      type: VALIDATION_ACTIONS.SET_DIRTY_FIELDS,
      payload: ['campo1'], // já existe
    });
    expect(result).toBe(state);
  });

  it('SET_DIRTY_FIELDS acumula campos (não substitui)', () => {
    const state = {
      ...initialValidationState,
      dirtyFields: new Set(['campo1']),
    };
    const result = validationReducer(state, {
      type: VALIDATION_ACTIONS.SET_DIRTY_FIELDS,
      payload: ['campo2'],
    });
    expect(result.dirtyFields.size).toBe(2);
    expect(result.dirtyFields.has('campo1')).toBe(true);
    expect(result.dirtyFields.has('campo2')).toBe(true);
  });

  it('SET_IS_VALIDATING atualiza isValidating para true', () => {
    const result = validationReducer(initialValidationState, {
      type: VALIDATION_ACTIONS.SET_IS_VALIDATING,
      payload: true,
    });
    expect(result.isValidating).toBe(true);
  });

  it('SET_IS_VALIDATING retorna estado atual quando valor não muda', () => {
    const state = { ...initialValidationState, isValidating: false };
    const result = validationReducer(state, {
      type: VALIDATION_ACTIONS.SET_IS_VALIDATING,
      payload: false,
    });
    expect(result).toBe(state);
  });

  it('RESET_VALIDATION retorna ao estado inicial', () => {
    const dirty = {
      errors: new Map([['campo', 'erro']]),
      dirtyFields: new Set(['campo']),
      isValidating: true,
      lastUpdated: '2024-01-01',
    };
    const result = validationReducer(dirty, { type: VALIDATION_ACTIONS.RESET_VALIDATION });
    expect(result).toEqual(initialValidationState);
    expect(result.errors.size).toBe(0);
    expect(result.dirtyFields.size).toBe(0);
    expect(result.isValidating).toBe(false);
  });
});
