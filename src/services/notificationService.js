// src/services/notificationService.js
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export const fetchNotifications = async (userId) => {
  const notificationsRef = collection(db, 'notificacoes');
  const q = query(notificationsRef, where('userId', '==', userId), where('lida', '==', false));
  const querySnapshot = await getDocs(q);

  const notifications = [];
  querySnapshot.forEach((doc) => {
    notifications.push({ id: doc.id, ...doc.data() });
  });

  return notifications;
};

export const markAsRead = async (notificationId) => {
  const notificationRef = doc(db, 'notificacoes', notificationId);
  await updateDoc(notificationRef, {
    lida: true,
  });
};