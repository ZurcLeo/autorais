import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '../../providers/ToastProvider/index.js';
import notificationService from '../../services/NotificationService/index.js';
import { useAuth } from '../../provider/AuthProvider/index.js';
import { useNotifications } from '../../providers/NotificationProvider/index.js';
import { coreLogger } from '../../core/logging/index.js';

const MODULE_NAME = 'notification-handler';

/**
 * Componente que gerencia a exibição de notificações como toasts
 * Otimizado para evitar requisições desnecessárias e melhorar UX
 */
const NotificationHandler = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  // Usar o contexto de notificações para obter dados em cache
  const { 
    notifications, 
    notifLoading, 
    markAsRead,
    isNotificationsInitialized 
  } = useNotifications();
  
  // Estado para controlar quais notificações já foram exibidas como toast
  const [displayedNotifications, setDisplayedNotifications] = useState(new Set());
  
  // Processar notificações não lidas para exibição como toast
  useEffect(() => {
    if (!currentUser?.uid || notifLoading || !isNotificationsInitialized) {
      return;
    }

    // Filtrar notificações não lidas e que ainda não foram exibidas
    const unreadNotifications = notifications.filter(
      notification => !notification.read && !displayedNotifications.has(notification.id)
    );
    
    if (unreadNotifications.length > 0) {
      coreLogger.logEvent(
        MODULE_NAME,
        'INFO',
        `Exibindo ${unreadNotifications.length} novas notificações como toast`,
        { userId: currentUser.uid }
      );
      
      // Atualizar o conjunto de notificações já exibidas
      const newDisplayedSet = new Set(displayedNotifications);
      
      // Exibir cada notificação como toast
      unreadNotifications.forEach(notification => {
        showToast.info(notification.content || notification.conteudo, {
          onClose: () => handleNotificationRead(notification.id, notification.tipo),
          autoClose: false,
          closeOnClick: true,
          title: notification.title,
          subtitle: notification.subtitle
        });
        
        // Marcar como exibida
        newDisplayedSet.add(notification.id);
      });
      
      setDisplayedNotifications(newDisplayedSet);
    }
  }, [notifications, currentUser, notifLoading, isNotificationsInitialized, displayedNotifications]);
  
  // Função para marcar notificação como lida
  const handleNotificationRead = useCallback(async (notificationId, type) => {
    if (currentUser?.uid && notificationId) {
      try {
        // Usar a função de contexto que já implementa otimistic update
        await markAsRead(notificationId);
        
        coreLogger.logEvent(
          MODULE_NAME,
          'INFO',
          'Notificação marcada como lida após fechar toast',
          { notificationId, userId: currentUser.uid }
        );
      } catch (error) {
        coreLogger.logEvent(
          MODULE_NAME,
          'ERROR',
          'Erro ao marcar notificação como lida',
          { notificationId, error: error.message }
        );
      }
    }
  }, [currentUser, markAsRead]);
  
  // Este componente não renderiza nada visível
  return null;
};

export default NotificationHandler;