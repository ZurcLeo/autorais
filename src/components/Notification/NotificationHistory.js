// src/components/Notifications/NotificationHistory.js
import React, { useEffect, useState } from 'react';
import { fetchNotifications } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

const NotificationHistory = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchUserNotifications = async () => {
      const userId = currentUser?.uid;
      if (userId) {
        const userNotifications = await fetchNotifications(userId);
        setNotifications(userNotifications);
      }
    };

    fetchUserNotifications();
  }, [currentUser]);

  return (
    <div>
      <h2>Notification History</h2>
      <ul>
        {notifications.map(notification => (
          <li key={notification.id}>
            {notification.conteudo} - {notification.lida ? 'Read' : 'Unread'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationHistory;