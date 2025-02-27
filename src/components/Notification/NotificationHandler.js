import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import notificationService from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

const NotificationHandler = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchUserNotifications = async () => {
      if (currentUser?.uid) {
        const response = await notificationService.fetchNotifications(currentUser.uid);
        const userNotifications = [...response.data.privateNotification, ...response.data.publicNotification];
        
        setNotifications(userNotifications);

        userNotifications.forEach(notification => {
          toast.info(notification.conteudo, {
            onClose: () => handleNotificationRead(currentUser.uid, notification.id, notification.tipo),
            autoClose: false,
            closeOnClick: true,
          });
        });
      }
    };
    fetchUserNotifications();
  }, [currentUser]);

  const handleNotificationRead = async (userId, notificationId, type) => {
    await notificationService.markAsRead(userId, notificationId, type);
    setNotifications(prevNotifications => prevNotifications.filter(n => n.id !== notificationId));
  };

  return null;
};

export default NotificationHandler;