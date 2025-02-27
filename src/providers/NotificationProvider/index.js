import React, { useReducer, useCallback, useMemo, useEffect } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import { notificationReducer, initialNotificationState, NOTIFICATION_ACTIONS } from '../../reducers/notification/notificationReducer';
import { notificationManager } from '../../services/NotificationService/notificationManager';
import { useNotificationPolling } from '../../hooks/notification/useNotificationPolling';
import { showToast, showPromiseToast } from '../../utils/toastUtils';
import { useAuth } from '../../providers/AuthProvider/';
import { coreLogger } from '../../core/logging/CoreLogger';
import { useServiceInitialization } from '../../hooks/initialization/useServiceInitialization';

// Constantes
const POLLING_INTERVAL = 30 * 1000; // 30 segundos

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.uid;
  const [state, dispatch] = useReducer(notificationReducer, initialNotificationState);
  const { contextValueN } = useServiceInitialization();
  
  // Função para buscar notificações
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    
    dispatch({ type: NOTIFICATION_ACTIONS.FETCH_START });
    
    try {
      const notifications = await notificationManager.getNotifications(userId);
      const unreadCount = notificationManager.getUnreadCount(notifications);
      
      dispatch({
        type: NOTIFICATION_ACTIONS.FETCH_SUCCESS,
        payload: {
          notifications,
          unreadCount
        }
      });
      
      return { notifications, unreadCount };
    } catch (error) {
      dispatch({
        type: NOTIFICATION_ACTIONS.FETCH_FAILURE,
        payload: error.message
      });
      
      coreLogger.logServiceError('notifications', error, { 
        context: 'fetchNotifications',
        userId 
      });
      
      throw error;
    }
  }, [userId]);
  
  // Inicialização e polling de notificações
  useEffect(() => {
    // Reinicia o estado quando o usuário muda
    if (!userId) {
      dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_STATE });
      return;
    }
    
    // Busca inicial
    fetchNotifications().catch(error => {
      showToast('Failed to load notifications', { type: 'error' });
    });
  }, [userId, fetchNotifications]);
  
  // Configurar polling
  useNotificationPolling(fetchNotifications, POLLING_INTERVAL, {
    enabled: !!userId,
    onError: () => {
      showToast('Failed to update notifications', { type: 'error' });
    }
  });
  
  // Marcar notificação como lida
  const markAsRead = useCallback(async (notificationId, type) => {
    if (!userId || !notificationId) {
      showToast('Invalid notification data', { type: 'error' });
      return;
    }
    
    return showPromiseToast(
      (async () => {
        try {
          // Otimistic update
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
          
          await notificationManager.markAsRead(userId, notificationId, type);
          return 'Notification marked as read';
        } catch (error) {
          // Reverter o update otimista buscando novamente as notificações
          fetchNotifications().catch(() => {
            // Se falhar novamente, pelo menos registramos o erro
            coreLogger.logServiceError('notifications', error, { 
              context: 'markAsRead.revert',
              userId 
            });
          });
          
          throw new Error('Failed to mark notification as read');
        }
      })(),
      {
        loading: 'Marking as read...',
        success: 'Notification marked as read',
        error: 'Failed to mark as read'
      }
    );
  }, [userId, state.notifications, state.unreadCount, fetchNotifications]);
  
  // Limpar todas as notificações
  const clearAllNotifications = useCallback(async () => {
    if (!userId) {
      showToast('User not authenticated', { type: 'error' });
      return;
    }
    
    return showPromiseToast(
      (async () => {
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
          
          await notificationManager.clearAllNotifications(userId);
          return 'All notifications cleared';
        } catch (error) {
          // Reverter atualizando com dados do servidor
          fetchNotifications().catch(() => {
            coreLogger.logServiceError('notifications', error, { 
              context: 'clearAllNotifications.revert',
              userId 
            });
          });
          
          throw new Error('Failed to clear notifications');
        }
      })(),
      {
        loading: 'Clearing notifications...',
        success: 'All notifications cleared',
        error: 'Failed to clear notifications'
      }
    );
  }, [userId, fetchNotifications]);
  
  // Memoizar o valor do contexto para evitar renderizações desnecessárias
  const contextValue = useMemo(() => ({
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    loading: state.loading,
    error: state.error,
    markAsRead,
    clearAllNotifications,
    refreshNotifications: fetchNotifications
  }), [
    state,
    markAsRead,
    clearAllNotifications,
    fetchNotifications
  ]);
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};