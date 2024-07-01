import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchNotifications, markAsRead } from '../../services/notificationService';

const NotificationHandler = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchUserNotifications = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const userNotifications = await fetchNotifications(userId);
        setNotifications(userNotifications);
        userNotifications.forEach(notification => {
          toast.info(notification.conteudo, {
            onClose: () => handleNotificationRead(userId, notification.id),
            autoClose: false,
            closeOnClick: true,
          });
        });
      }
    };

    fetchUserNotifications();
  }, []);

  const handleNotificationRead = async (userId, notificationId) => {
    await markAsRead(userId, notificationId);
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  return null;
};

export default NotificationHandler;