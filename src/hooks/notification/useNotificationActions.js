import { useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { showToast, showPromiseToast } from '@/utils/toastUtils';
import { NOTIFICATION_ACTIONS } from '../../core/constants/actions';

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
  }, [userId, state.notifications, state.unreadCount, syncStateUpdate, fetchNotifications]);

  const fetchNotifications = useCallback(async (userId) => { // Keep fetchNotifications if it exists, or adapt if it's in Provider directly
    dispatch({ type: NOTIFICATION_ACTIONS.FETCH_START });
    try {
      const notifications = await notificationService.fetchNotifications(userId);
      const unreadCount = notifications.filter(
        notification => !notification.lida
      ).length;

      dispatch({
        type: NOTIFICATION_ACTIONS.FETCH_SUCCESS,
        payload: { notifications, unreadCount }
      });
      return { notifications, unreadCount };
    } catch (error) {
      dispatch({
        type: NOTIFICATION_ACTIONS.FETCH_FAILURE,
        payload: error.message
      });
      showToast('Error fetching notifications', { type: 'error' });
      throw error;
    }
  }, [dispatch]);

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
  }, [userId, syncStateUpdate, fetchNotifications]);

  const addNotificationAction = useCallback(async (userId, notificationData) => {
    dispatch({ type: NOTIFICATION_ACTIONS.FETCH_START }); // Optionally start loading if needed

    try {
      const newNotification = await notificationService.createNotification(userId, notificationData);
      // Option 1: Refresh the entire notification list after adding (simplest if polling is the main mechanism)
      await fetchNotifications(userId); // Re-fetch notifications to update the list with the new notification
      // Option 2: Add the new notification directly to the state (if you want to update UI immediately without full refresh)
      // dispatch({ type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION, payload: newNotification }); // You'd need to add ADD_NOTIFICATION case to reducer (see step 3)

      showToast('Notification created successfully', { type: 'success' });
      return newNotification; // Or return something else if needed

    } catch (error) {
      dispatch({ type: NOTIFICATION_ACTIONS.FETCH_FAILURE, payload: error.message });
      showToast('Error creating notification', { type: 'error' });
      throw error;
    }
  }, [dispatch, fetchNotifications]); 

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
    refreshNotifications,
    addNotification: addNotificationAction,
  };
};