// hooks/useNotificationGroups.js
import { useCallback } from 'react';
import { isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { useTranslation } from 'react-i18next';

export default function useNotificationGroups(notifications) {
  const { t } = useTranslation();
  
  const groupNotificationsByDate = useCallback(() => {
    const groups = {
      'today': [],
      'yesterday': [],
      'this_week': [],
      'this_month': [],
      'older': []
    };
    
    notifications.forEach(notification => {
      const date = new Date(notification.createdAt?._seconds * 1000);
      
      if (isToday(date)) {
        groups.today.push(notification);
      } else if (isYesterday(date)) {
        groups.yesterday.push(notification);
      } else if (isThisWeek(date)) {
        groups.this_week.push(notification);
      } else if (isThisMonth(date)) {
        groups.this_month.push(notification);
      } else {
        groups.older.push(notification);
      }
    });
    
    // Filtrar grupos vazios
    return Object.entries(groups)
      .filter(([_, items]) => items.length > 0)
      .map(([key, items]) => ({
        key,
        title: t(`time.${key}`),
        items
      }));
  }, [notifications, t]);

  const groupedNotifications = groupNotificationsByDate();

  return { groupedNotifications };
}