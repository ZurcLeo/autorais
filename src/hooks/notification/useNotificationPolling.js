import { useEffect } from 'react';
import { NOTIFICATION_ACTIONS } from '../../reducers/notification/notificationReducer';
import {notificationService} from '../../services/NotificationService/';

export const useNotificationPolling = (userId, dispatch, pollingService, pollingInterval) => {
  useEffect(() => {
    if (!userId) return;

    const pollNotifications = async () => {
      if (document.visibilityState !== 'visible') return;

      try {
        dispatch({ type: NOTIFICATION_ACTIONS.FETCH_START });
        const notifications = await notificationService.fetchNotifications(userId);
        
        const unreadCount = notifications.filter(
          notification => !notification.lida
        ).length;

        dispatch({
          type: NOTIFICATION_ACTIONS.FETCH_SUCCESS,
          payload: { notifications, unreadCount }
        });
      } catch (error) {
        console.error('Error polling notifications:', error);
        dispatch({
          type: NOTIFICATION_ACTIONS.FETCH_FAILURE,
          payload: error.message
        });
      }
    };

    pollingService.addTask('pollNotifications', pollNotifications, pollingInterval);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        pollNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      pollingService.removeTask('pollNotifications');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId, dispatch, pollingService, pollingInterval]);
};