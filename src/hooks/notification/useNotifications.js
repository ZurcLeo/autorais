import { useContext } from 'react';
import { NotificationProvider } from '../../providers/NotificationProvider/';

export function useNotifications() {
  const context = useContext(NotificationProvider);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
}