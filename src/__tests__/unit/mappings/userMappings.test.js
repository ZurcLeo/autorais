import { setupUserMappings } from '../../../services/EventActionBridgeService/userMappings';
import { USER_EVENTS, AUTH_EVENTS } from '../../../core/constants/events';
import { USER_ACTIONS } from '../../../core/constants/actions';

jest.mock('../../../core/services/BaseService', () => ({
  serviceLocator: { get: jest.fn() },
}));

beforeAll(() => { jest.spyOn(console, 'log').mockImplementation(() => {}); });
afterAll(() => { jest.restoreAllMocks(); });

describe('userMappings', () => {
  let registeredMappings;
  let mockBridge;

  beforeEach(() => {
    registeredMappings = [];
    mockBridge = { registerMappings: jest.fn((ms) => registeredMappings.push(...ms)) };
    setupUserMappings(mockBridge);
  });

  const find = (eventType, actionType) =>
    registeredMappings.find(
      (m) => m.eventType === eventType && (!actionType || m.actionType === actionType)
    );

  it('deve registrar exatamente 13 mapeamentos', () => {
    expect(registeredMappings).toHaveLength(13);
  });

  it('USER_SIGNED_IN → USER_PROFILE_COMPLETE com isAuthenticated e userId', () => {
    const m = find(AUTH_EVENTS.USER_SIGNED_IN);
    expect(m.actionType).toBe(USER_ACTIONS.USER_PROFILE_COMPLETE);
    const p = m.transformer({ user: { uid: 'u1' }, userId: 'u1', email: 'a@b.com' });
    expect(p.isAuthenticated).toBe(true);
    expect(p.userId).toBe('u1');
    expect(p.authLoading).toBe(false);
    expect(p.userLoading).toBe(false);
    expect(p.needsProfileUpdate).toBe(false);
  });

  it('USER_SIGNED_IN: userId extraído de user.uid quando userId ausente', () => {
    const m = find(AUTH_EVENTS.USER_SIGNED_IN);
    const p = m.transformer({ user: { uid: 'u-from-user' } });
    expect(p.userId).toBe('u-from-user');
  });

  it('PROFILE_UPDATE_NEEDED → SET_PROFILE_UPDATE_NEEDED com needsProfileUpdate: true', () => {
    const m = find(USER_EVENTS.PROFILE_UPDATE_NEEDED);
    expect(m.actionType).toBe(USER_ACTIONS.SET_PROFILE_UPDATE_NEEDED);
    const p = m.transformer({ userId: 'u1', reason: 'incomplete' });
    expect(p.needsProfileUpdate).toBe(true);
    expect(p.reason).toBe('incomplete');
    expect(p.userLoading).toBe(false);
  });

  it('PROFILE_COMPLETED → USER_PROFILE_COMPLETE com isProfileComplete: true', () => {
    const m = find(USER_EVENTS.PROFILE_COMPLETED);
    expect(m.actionType).toBe(USER_ACTIONS.USER_PROFILE_COMPLETE);
    const p = m.transformer({ userId: 'u1' });
    expect(p.isProfileComplete).toBe(true);
    expect(p.needsProfileUpdate).toBe(false);
  });

  it('USER_SESSION_READY → FETCH_USER_SUCCESS com user e usersById (default {})', () => {
    const m = find(USER_EVENTS.USER_SESSION_READY);
    expect(m.actionType).toBe(USER_ACTIONS.FETCH_USER_SUCCESS);
    const user = { uid: 'u1', name: 'Ana' };
    const p = m.transformer({ user, timestamp: 1000 });
    expect(p.user).toEqual(user);
    expect(p.usersById).toEqual({});
    expect(p.userLoading).toBe(false);
    expect(p.isAuthenticated).toBe(true);
  });

  it('USER_SIGN_IN → USER_PROFILE_COMPLETE com isComplete: true', () => {
    const m = find(USER_EVENTS.USER_SIGN_IN);
    expect(m.actionType).toBe(USER_ACTIONS.USER_PROFILE_COMPLETE);
    const p = m.transformer({ user: { uid: 'u1' }, userId: 'u1' });
    expect(p.isComplete).toBe(true);
    expect(p.isProfileComplete).toBe(true);
  });

  it('NEW_USER_SIGN_IN → USER_PROFILE_INCOMPLETE com needsProfileCompletion: true', () => {
    const m = find(USER_EVENTS.NEW_USER_SIGN_IN);
    expect(m.actionType).toBe(USER_ACTIONS.USER_PROFILE_INCOMPLETE);
    const p = m.transformer({ userId: 'u1', user: {} });
    expect(p.isNewUser).toBe(true);
    expect(p.needsProfileCompletion).toBe(true);
  });

  it('PROFILE_UPDATED → UPDATE_SUCCESS com updatedFields derivados de user quando ausente', () => {
    const m = find(USER_EVENTS.PROFILE_UPDATED);
    expect(m.actionType).toBe(USER_ACTIONS.UPDATE_SUCCESS);
    const user = { name: 'Ana', email: 'a@b.com' };
    const p = m.transformer({ user, userId: 'u1' });
    expect(p.user).toEqual(user);
    expect(p.updatedFields).toEqual(expect.arrayContaining(['name', 'email']));
  });

  it('PROFILE_PICTURE_UPDATED → UPDATE_SUCCESS com fotoDoPerfil', () => {
    const m = find(USER_EVENTS.PROFILE_PICTURE_UPDATED);
    expect(m.actionType).toBe(USER_ACTIONS.UPDATE_SUCCESS);
    const p = m.transformer({ userId: 'u1', pictureUrl: 'https://img.com/pic.jpg' });
    expect(p.user).toEqual({ fotoDoPerfil: 'https://img.com/pic.jpg' });
    expect(p.updatedFields).toEqual(['fotoDoPerfil']);
  });

  it('PROFILE_FETCHED → FETCH_USER_SUCCESS construindo usersById com userId como chave', () => {
    const m = find(USER_EVENTS.PROFILE_FETCHED);
    expect(m.actionType).toBe(USER_ACTIONS.FETCH_USER_SUCCESS);
    const user = { uid: 'u1', name: 'Ana' };
    const p = m.transformer({ user, userId: 'u1' });
    expect(p.usersById['u1']).toEqual(user);
    expect(p.isAuthenticated).toBe(true);
    expect(p.error).toBeNull();
  });

  it('PROFILE_FETCHED: extrai userId de user.uid ou user.id quando userId ausente', () => {
    const m = find(USER_EVENTS.PROFILE_FETCHED);
    const user = { uid: 'u-from-uid', name: 'Bia' };
    const p = m.transformer({ user });
    expect(p.usersById['u-from-uid']).toEqual(user);
  });

  it('USER_DELETED → DELETE_SUCCESS com userId', () => {
    const m = find(USER_EVENTS.USER_DELETED);
    expect(m.actionType).toBe(USER_ACTIONS.DELETE_SUCCESS);
    const p = m.transformer({ userId: 'u1' });
    expect(p.userId).toBe('u1');
    expect(p.userLoading).toBe(false);
  });

  it('USER_ADDED → FETCH_USER_SUCCESS com usersById (default {})', () => {
    const m = find(USER_EVENTS.USER_ADDED);
    expect(m.actionType).toBe(USER_ACTIONS.FETCH_USER_SUCCESS);
    const p = m.transformer({ user: { uid: 'u2' } });
    expect(p.usersById).toEqual({});
    expect(p.isAuthenticated).toBe(true);
  });

  it('USER_SIGNED_OUT → CLEAR_USER (mapeamento do userMappings, não authMappings)', () => {
    const m = find(AUTH_EVENTS.USER_SIGNED_OUT, USER_ACTIONS.CLEAR_USER);
    expect(m).toBeDefined();
    const p = m.transformer({ timestamp: 5000 });
    expect(p.userLoading).toBe(false);
  });

  it('AUTH_LOGOUT_COMPLETED → CLEAR_USER', () => {
    const m = find(AUTH_EVENTS.AUTH_LOGOUT_COMPLETED, USER_ACTIONS.CLEAR_USER);
    expect(m).toBeDefined();
    const p = m.transformer({});
    expect(p.userLoading).toBe(false);
  });
});
