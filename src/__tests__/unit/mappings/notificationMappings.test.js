import { setupNotificationMappings } from '../../../services/EventActionBridgeService/notificationMappings';
import { NOTIFICATION_EVENTS } from '../../../core/constants/events';
import { NOTIFICATION_ACTIONS } from '../../../core/constants/actions';

// notificationMappings usa serviceLocator.get('store').getState() dentro dos transformers
let mockNotificationState = { notifications: [], unreadCount: 0 };

jest.mock('../../../core/services/BaseService', () => ({
  serviceLocator: { get: jest.fn() },
}));

const { serviceLocator } = require('../../../core/services/BaseService');

beforeAll(() => { jest.spyOn(console, 'log').mockImplementation(() => {}); });
afterAll(() => { jest.restoreAllMocks(); });

describe('notificationMappings', () => {
  let registeredMappings;
  let mockBridge;

  beforeEach(() => {
    registeredMappings = [];
    mockBridge = { registerMappings: jest.fn((ms) => registeredMappings.push(...ms)) };

    // Configura o mock do store para os transformers que acessam estado
    serviceLocator.get.mockImplementation((key) => {
      if (key === 'store') return { getState: () => ({ notifications: mockNotificationState }) };
      return null;
    });

    mockNotificationState = { notifications: [], unreadCount: 0 };
    setupNotificationMappings(mockBridge);
  });

  const find = (eventType, actionType) =>
    registeredMappings.find(
      (m) => m.eventType === eventType && (!actionType || m.actionType === actionType)
    );

  it('deve registrar exatamente 5 mapeamentos', () => {
    expect(registeredMappings).toHaveLength(5);
  });

  it('NOTIFICATIONS_FETCHED → FETCH_NOTIFICATION_SUCCESS com payload (notifications) e unreadCount', () => {
    const m = find(NOTIFICATION_EVENTS.NOTIFICATIONS_FETCHED);
    expect(m.actionType).toBe(NOTIFICATION_ACTIONS.FETCH_NOTIFICATION_SUCCESS);
    const notifications = [{ id: 'n1' }, { id: 'n2' }];
    const p = m.transformer({ notifications, unreadCount: 2, timestamp: 100 });
    expect(p.payload).toEqual(notifications);
    expect(p.unreadCount).toBe(2);
    expect(p.timestamp).toBe(100);
  });

  it('NOTIFICATIONS_FETCHED → payload default [] quando notifications ausente', () => {
    const m = find(NOTIFICATION_EVENTS.NOTIFICATIONS_FETCHED);
    expect(m.transformer({}).payload).toEqual([]);
  });

  it('NOTIFICATION_CREATED → UPDATE_NOTIFICATIONS prepend nova notificação na lista', () => {
    mockNotificationState = { notifications: [{ id: 'n-old' }], unreadCount: 1 };
    const m = find(NOTIFICATION_EVENTS.NOTIFICATION_CREATED);
    expect(m.actionType).toBe(NOTIFICATION_ACTIONS.UPDATE_NOTIFICATIONS);
    const newNotif = { id: 'n-new' };
    const p = m.transformer({ notification: newNotif });
    expect(p.payload[0]).toEqual(newNotif);
    expect(p.payload[1]).toEqual({ id: 'n-old' });
    expect(p.payload).toHaveLength(2);
  });

  it('NOTIFICATION_MARKED_READ → UPDATE_NOTIFICATIONS marca notificação como lida', () => {
    mockNotificationState = {
      notifications: [
        { id: 'n1', read: false },
        { id: 'n2', read: false },
      ],
      unreadCount: 2,
    };
    const m = find(NOTIFICATION_EVENTS.NOTIFICATION_MARKED_READ, NOTIFICATION_ACTIONS.UPDATE_NOTIFICATIONS);
    expect(m).toBeDefined();
    const p = m.transformer({ notificationId: 'n1' });
    const markedNotif = p.payload.find((n) => n.id === 'n1');
    const unmarkedNotif = p.payload.find((n) => n.id === 'n2');
    expect(markedNotif.read).toBe(true);
    expect(unmarkedNotif.read).toBe(false);
  });

  it('NOTIFICATION_MARKED_READ → UPDATE_NOTIFICATIONS decrementa unreadCount (sem negativar)', () => {
    mockNotificationState = { notifications: [], unreadCount: 3 };
    const m = find(NOTIFICATION_EVENTS.NOTIFICATION_MARKED_READ, NOTIFICATION_ACTIONS.UPDATE_NOTIFICATIONS);
    const p = m.transformer({ notificationId: 'n1' });
    expect(p.unreadCount).toBe(2);
  });

  it('NOTIFICATION_MARKED_READ → UPDATE_NOTIFICATIONS não vai abaixo de zero', () => {
    mockNotificationState = { notifications: [], unreadCount: 0 };
    const m = find(NOTIFICATION_EVENTS.NOTIFICATION_MARKED_READ, NOTIFICATION_ACTIONS.UPDATE_NOTIFICATIONS);
    const p = m.transformer({ notificationId: 'n1' });
    expect(p.unreadCount).toBe(0);
  });

  it('NOTIFICATION_MARKED_READ → UPDATE_UNREAD_COUNT decrementa contador', () => {
    mockNotificationState = { notifications: [], unreadCount: 5 };
    const m = find(NOTIFICATION_EVENTS.NOTIFICATION_MARKED_READ, NOTIFICATION_ACTIONS.UPDATE_UNREAD_COUNT);
    expect(m).toBeDefined();
    const p = m.transformer({ notificationId: 'n1' });
    expect(p.payload).toBe(4);
  });

  it('ALL_NOTIFICATIONS_CLEARED → CLEAR_STATE com timestamp', () => {
    const m = find(NOTIFICATION_EVENTS.ALL_NOTIFICATIONS_CLEARED);
    expect(m.actionType).toBe(NOTIFICATION_ACTIONS.CLEAR_STATE);
    const p = m.transformer({ timestamp: 9000 });
    expect(p.timestamp).toBe(9000);
  });
});
