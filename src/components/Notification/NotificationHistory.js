// src/components/Notifications/NotificationHistory.js
import React, { useEffect, useState } from 'react';
import { fetchNotifications } from '../../services/notificationService';
import { auth } from '../../firebaseConfig';

const NotificationHistory = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchUserNotifications = async () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const userNotifications = await fetchNotifications(userId);
        setNotifications(userNotifications);
      }
    };

    fetchUserNotifications();
  }, []);

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