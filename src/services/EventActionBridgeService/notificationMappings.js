// src/services/EventActionBridgeService/notificationMappings.js
import { serviceLocator } from '../../core/services/BaseService';
import { NOTIFICATION_EVENTS } from '../../core/constants/events';
import { NOTIFICATION_ACTIONS } from '../../core/constants/actions';

export const setupNotificationMappings = (eventBridgeService) => {
  const eventActionBridgeService = eventBridgeService || 
    serviceLocator.get('eventActionBridge');

  eventActionBridgeService.registerMappings([
    // Mapeamento para busca de notificações bem-sucedida
    {
      serviceName: 'notifications',
      eventType: NOTIFICATION_EVENTS.NOTIFICATIONS_FETCHED,
      actionType: NOTIFICATION_ACTIONS.FETCH_SUCCESS,
      transformer: (eventData) => ({
        payload: eventData.notifications || [],
        unreadCount: eventData.unreadCount || 0,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    // Mapeamento para criação de nova notificação
    {
      serviceName: 'notifications',
      eventType: NOTIFICATION_EVENTS.NOTIFICATION_CREATED,
      actionType: NOTIFICATION_ACTIONS.UPDATE_NOTIFICATIONS,
      transformer: (eventData) => {
        // Se uma nova notificação for criada, adiciona à lista existente
        const currentState = serviceLocator.get('store').getState().notifications;
        const updatedNotifications = [
          eventData.notification,
          ...(currentState.notifications || [])
        ];
        
        return {
          payload: updatedNotifications,
          timestamp: eventData.timestamp || Date.now()
        };
      }
    },
    // Mapeamento para marcação de notificação como lida
    {
      serviceName: 'notifications',
      eventType: NOTIFICATION_EVENTS.NOTIFICATION_MARKED_READ,
      actionType: NOTIFICATION_ACTIONS.UPDATE_NOTIFICATIONS,
      transformer: (eventData) => {
        const currentState = serviceLocator.get('store').getState().notifications;
        // Atualiza a notificação específica como lida
        const updatedNotifications = currentState.notifications.map(notif => 
          notif.id === eventData.notificationId 
            ? { ...notif, read: true } 
            : notif
        );
        
        // Também atualiza a contagem de não lidos
        return {
          payload: updatedNotifications,
          unreadCount: (currentState.unreadCount || 0) - 1 >= 0 
            ? (currentState.unreadCount || 0) - 1 
            : 0,
          timestamp: eventData.timestamp || Date.now()
        };
      }
    },
    // Também despacha a ação para atualizar o contador de não lidos
    {
      serviceName: 'notifications',
      eventType: NOTIFICATION_EVENTS.NOTIFICATION_MARKED_READ,
      actionType: NOTIFICATION_ACTIONS.UPDATE_UNREAD_COUNT,
      transformer: (eventData) => {
        const currentState = serviceLocator.get('store').getState().notifications;
        return {
          payload: (currentState.unreadCount || 0) - 1 >= 0 
            ? (currentState.unreadCount || 0) - 1 
            : 0,
          timestamp: eventData.timestamp || Date.now()
        };
      }
    },
    // Mapeamento para limpar todas as notificações
    {
      serviceName: 'notifications',
      eventType: NOTIFICATION_EVENTS.ALL_NOTIFICATIONS_CLEARED,
      actionType: NOTIFICATION_ACTIONS.CLEAR_STATE,
      transformer: (eventData) => ({
        timestamp: eventData.timestamp || Date.now()
      })
    }
  ]);
};