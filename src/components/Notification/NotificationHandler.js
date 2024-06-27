// src/components/Notifications/NotificationHandler.js
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchNotifications, markAsRead } from '../../services/notificationService';
import { auth } from '../../firebaseConfig';

const NotificationHandler = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchUserNotifications = async () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const userNotifications = await fetchNotifications(userId);
        setNotifications(userNotifications);
        userNotifications.forEach(notification => {
          toast.info(notification.conteudo, {
            onClose: () => handleNotificationRead(notification.id),
            autoClose: false,
            closeOnClick: true,
          });
        });
      }
    };

    fetchUserNotifications();
  }, []);

  const handleNotificationRead = async (notificationId) => {
    await markAsRead(notificationId);
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  return null;
};

export default NotificationHandler;