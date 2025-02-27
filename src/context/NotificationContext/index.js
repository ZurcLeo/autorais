import { createContext } from 'react';

// Criar o contexto com um valor inicial (facilitando o intellisense)
export const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  loading: true,
  error: null,
  markAsRead: () => Promise.resolve(),
  clearAllNotifications: () => Promise.resolve(),
  refreshNotifications: () => Promise.resolve()
});