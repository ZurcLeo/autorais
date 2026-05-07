import { rifaReducer } from '../../../reducers/rifas/rifaReducer';
import { initialRifaState } from '../../../core/constants/initialState';

// rifaReducer não tem estado padrão, sempre requer estado inicial explícito
describe('rifaReducer', () => {
  it('ação desconhecida retorna o estado atual sem mutação', () => {
    const result = rifaReducer(initialRifaState, { type: 'X' });
    expect(result).toBe(initialRifaState);
  });

  it('FETCH_START seta loading: true e limpa error', () => {
    const state = { ...initialRifaState, error: 'err' };
    const result = rifaReducer(state, { type: 'FETCH_START' });
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('FETCH_SUCCESS popula rifas e seta loading: false', () => {
    const rifas = [{ id: 'r1' }, { id: 'r2' }];
    const result = rifaReducer(
      { ...initialRifaState, loading: true },
      { type: 'FETCH_SUCCESS', payload: rifas }
    );
    expect(result.rifas).toEqual(rifas);
    expect(result.loading).toBe(false);
    expect(result.error).toBeNull();
    expect(result.lastUpdated).toBeDefined();
  });

  it('FETCH_SINGLE_SUCCESS seta selectedRifa', () => {
    const rifa = { id: 'r1', titulo: 'Rifa Teste' };
    const result = rifaReducer(initialRifaState, {
      type: 'FETCH_SINGLE_SUCCESS',
      payload: rifa,
    });
    expect(result.selectedRifa).toEqual(rifa);
    expect(result.loading).toBe(false);
  });

  it('FETCH_ERROR seta error e loading: false', () => {
    const result = rifaReducer(
      { ...initialRifaState, loading: true },
      { type: 'FETCH_ERROR', payload: 'falha ao buscar rifas' }
    );
    expect(result.loading).toBe(false);
    expect(result.error).toBe('falha ao buscar rifas');
  });

  it('UPDATE_RIFA_SUCCESS substitui rifa existente na lista', () => {
    const original = { id: 'r1', titulo: 'Original' };
    const updated = { id: 'r1', titulo: 'Atualizada' };
    const state = { ...initialRifaState, rifas: [original, { id: 'r2' }] };
    const result = rifaReducer(state, {
      type: 'UPDATE_RIFA_SUCCESS',
      payload: updated,
    });
    expect(result.rifas[0].titulo).toBe('Atualizada');
    expect(result.rifas).toHaveLength(2);
    expect(result.loading).toBe(false);
  });

  it('UPDATE_RIFA_SUCCESS atualiza selectedRifa quando é a mesma rifa', () => {
    const rifa = { id: 'r1', titulo: 'Original' };
    const updated = { id: 'r1', titulo: 'Atualizada' };
    const state = { ...initialRifaState, rifas: [rifa], selectedRifa: rifa };
    const result = rifaReducer(state, {
      type: 'UPDATE_RIFA_SUCCESS',
      payload: updated,
    });
    expect(result.selectedRifa.titulo).toBe('Atualizada');
  });

  it('UPDATE_RIFA_SUCCESS não altera selectedRifa quando é rifa diferente', () => {
    const selected = { id: 'r2', titulo: 'Outra' };
    const state = { ...initialRifaState, rifas: [{ id: 'r1' }], selectedRifa: selected };
    const result = rifaReducer(state, {
      type: 'UPDATE_RIFA_SUCCESS',
      payload: { id: 'r1', titulo: 'Atualizada' },
    });
    expect(result.selectedRifa).toEqual(selected);
  });

  it('CREATE_RIFA_SUCCESS adiciona nova rifa à lista', () => {
    const newRifa = { id: 'rNew', titulo: 'Nova Rifa' };
    const state = { ...initialRifaState, rifas: [{ id: 'r1' }] };
    const result = rifaReducer(state, {
      type: 'CREATE_RIFA_SUCCESS',
      payload: newRifa,
    });
    expect(result.rifas).toHaveLength(2);
    expect(result.rifas[1]).toEqual(newRifa);
    expect(result.loading).toBe(false);
  });
});
