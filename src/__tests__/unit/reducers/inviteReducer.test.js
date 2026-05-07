import { inviteReducer } from '../../../reducers/invites/inviteReducer';
import { initialInviteState } from '../../../core/constants/initialState';
import { INVITATION_ACTIONS } from '../../../core/constants/actions';

beforeAll(() => { jest.spyOn(console, 'log').mockImplementation(() => {}); });
afterAll(() => { jest.restoreAllMocks(); });

describe('inviteReducer', () => {
  it('retorna estado inicial quando chamado sem ação', () => {
    expect(inviteReducer(undefined, { type: '@@INIT' })).toEqual(initialInviteState);
  });

  it('ação desconhecida retorna o estado atual sem mutação', () => {
    const state = { ...initialInviteState };
    expect(inviteReducer(state, { type: 'X' })).toBe(state);
  });

  it('FETCH_START seta isLoading: true e limpa error', () => {
    const state = { ...initialInviteState, error: 'err' };
    const result = inviteReducer(state, { type: INVITATION_ACTIONS.FETCH_START });
    expect(result.isLoading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('FETCH_SUCCESS com array popula sentInvitations', () => {
    const invites = [{ id: 'i1' }, { id: 'i2' }];
    const result = inviteReducer(
      { ...initialInviteState, isLoading: true },
      { type: INVITATION_ACTIONS.FETCH_SUCCESS, payload: invites }
    );
    expect(result.sentInvitations).toEqual(invites);
    expect(result.isLoading).toBe(false);
    expect(result.error).toBeNull();
  });

  it('FETCH_SUCCESS com payload não-array usa array vazio em sentInvitations', () => {
    const result = inviteReducer(initialInviteState, {
      type: INVITATION_ACTIONS.FETCH_SUCCESS,
      payload: {},
    });
    expect(result.sentInvitations).toEqual([]);
  });

  it('FETCH_FAILURE seta error e isLoading: false', () => {
    const result = inviteReducer(
      { ...initialInviteState, isLoading: true },
      { type: INVITATION_ACTIONS.FETCH_FAILURE, payload: { error: 'falha' } }
    );
    expect(result.isLoading).toBe(false);
    expect(result.error).toBe('falha');
  });

  it('SEND_START seta isLoading: true', () => {
    const result = inviteReducer(initialInviteState, { type: INVITATION_ACTIONS.SEND_START });
    expect(result.isLoading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('SEND_SUCCESS adiciona convite à lista sentInvitations', () => {
    const existing = { id: 'old' };
    const newInvite = { id: 'new' };
    const state = { ...initialInviteState, sentInvitations: [existing] };
    const result = inviteReducer(state, {
      type: INVITATION_ACTIONS.SEND_SUCCESS,
      payload: { invitation: newInvite },
    });
    expect(result.sentInvitations).toHaveLength(2);
    expect(result.sentInvitations).toContainEqual(newInvite);
    expect(result.isLoading).toBe(false);
  });

  it('SEND_FAILURE seta error e isLoading: false', () => {
    const result = inviteReducer(initialInviteState, {
      type: INVITATION_ACTIONS.SEND_FAILURE,
      payload: { error: 'envio falhou' },
    });
    expect(result.error).toBe('envio falhou');
    expect(result.isLoading).toBe(false);
  });

  it('UPDATE_INVITATION aplica updates ao convite com id correspondente', () => {
    const invite = { id: 'i1', status: 'pending' };
    const state = { ...initialInviteState, sentInvitations: [invite] };
    const result = inviteReducer(state, {
      type: INVITATION_ACTIONS.UPDATE_INVITATION,
      payload: { inviteId: 'i1', updates: { status: 'accepted' } },
    });
    expect(result.sentInvitations[0].status).toBe('accepted');
  });

  it('REMOVE_INVITATION remove o convite com id correspondente', () => {
    const state = {
      ...initialInviteState,
      sentInvitations: [{ id: 'i1' }, { id: 'i2' }],
    };
    const result = inviteReducer(state, {
      type: INVITATION_ACTIONS.REMOVE_INVITATION,
      payload: { inviteId: 'i1' },
    });
    expect(result.sentInvitations).toHaveLength(1);
    expect(result.sentInvitations[0].id).toBe('i2');
  });

  it('CLEAR_STATE retorna ao estado inicial', () => {
    const dirty = { ...initialInviteState, isLoading: true, sentInvitations: [{ id: 'x' }] };
    const result = inviteReducer(dirty, { type: INVITATION_ACTIONS.CLEAR_STATE });
    expect(result).toEqual(initialInviteState);
  });
});
