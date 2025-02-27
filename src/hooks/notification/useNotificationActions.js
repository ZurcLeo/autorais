import { useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { showToast, showPromiseToast } from '@/utils/toastUtils';
import { NOTIFICATION_ACTIONS } from '../state/notificationState';

export const useNotificationActions = (state, dispatch, userId, syncStateUpdate) => {
  const markAsRead = useCallback(async (notificationId, type) => {
    if (!userId || !notificationId) {
      showToast('Invalid notification data', { type: 'error' });
      return;
    }

    return showPromiseToast(
      syncStateUpdate(async () => {
        try {
          // Optimistic update
          const updatedNotifications = state.notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, lida: true }
              : notification
          );

          dispatch({
            type: NOTIFICATION_ACTIONS.UPDATE_NOTIFICATIONS,
            payload: updatedNotifications
          });

          dispatch({
            type: NOTIFICATION_ACTIONS.UPDATE_UNREAD_COUNT,
            payload: state.unreadCount > 0 ? state.unreadCount - 1 : 0
          });

          await notificationService.markAsRead(userId, notificationId, type);
          return 'Notification marked as read';

        } catch (error) {
        const notifications = await notificationService.fetchNotifications(userId);
          dispatch({
            type: NOTIFICATION_ACTIONS.UPDATE_NOTIFICATIONS,
            payload: notifications
          });
          throw new Error('Failed to mark notification as read');
        }
      }),
      {
        loading: 'Marking as read...',
        success: 'Notification marked as read',
        error: 'Failed to mark as read'
      }
    );
  }, [userId, state.notifications, state.unreadCount, syncStateUpdate]);

  const clearAllNotifications = useCallback(async () => {
    if (!userId) {
      showToast('User not authenticated', { type: 'error' });
      return;
    }

    return showPromiseToast(
      syncStateUpdate(async () => {
        try {
          // Optimistic update
          dispatch({
            type: NOTIFICATION_ACTIONS.UPDATE_NOTIFICATIONS,
            payload: []
          });

          dispatch({
            type: NOTIFICATION_ACTIONS.UPDATE_UNREAD_COUNT,
            payload: 0
          });

          await notificationService.clearAllNotifications(userId);
          return 'All notifications cleared';
        } catch (error) {
          // Revert optimistic update by refreshing notifications
          const notifications = await notificationService.fetchNotifications(userId);
          dispatch({
            type: NOTIFICATION_ACTIONS.UPDATE_NOTIFICATIONS,
            payload: notifications
          });
          throw new Error('Failed to clear notifications');
        }
      }),
      {
        loading: 'Clearing notifications...',
        success: 'All notifications cleared',
        error: 'Failed to clear notifications'
      }
    );
  }, [userId, syncStateUpdate]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    return syncStateUpdate(async () => {
      if (!userId) return;

      dispatch({ type: NOTIFICATION_ACTIONS.FETCH_START });
      
      try {
        const notifications = await notificationService.fetchNotifications(userId);
        const unreadCount = notifications.filter(
          notification => !notification.lida
        ).length;

        dispatch({
          type: NOTIFICATION_ACTIONS.FETCH_SUCCESS,
          payload: {
            notifications,
            unreadCount
          }
        });
      } catch (error) {
        dispatch({
          type: NOTIFICATION_ACTIONS.FETCH_FAILURE,
          payload: error.message
        });
        throw error;
      }
    });
  }, [userId, syncStateUpdate]);

  return {
    markAsRead,
    clearAllNotifications,
    refreshNotifications
    // ... outros métodos ...
  };
};