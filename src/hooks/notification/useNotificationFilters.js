// hooks/useNotificationFilters.js
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { isToday, isThisWeek, isThisMonth } from 'date-fns';

export default function useNotificationFilters(notifications) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState({
    type: 'all',
    readStatus: 'all',
    dateRange: 'all'
  });
  const [filteredNotifications, setFilteredNotifications] = useState([]);

  const filterAndSortNotifications = useCallback(() => {
    if (!Array.isArray(notifications)) {
      console.warn("Notifications is not an array in filterNotifications");
      setFilteredNotifications([]);
      return;
    }

    // Aplicar filtro de abas
    let filtered = [...notifications];
    
    // Filtro básico por tipo
    if (activeTab !== 'all') {
      filtered = filtered.filter(notification => notification.type === activeTab);
    }
    
    // Aplicar pesquisa
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(notification => 
        (notification.content && notification.content.toLowerCase().includes(query)) ||
        (notification.title && notification.title.toLowerCase().includes(query)) ||
        (notification.type && t(`notification.types.${notification.type}`).toLowerCase().includes(query))
      );
    }
    
    // Aplicar filtros avançados
    if (advancedFilters.type !== 'all') {
      filtered = filtered.filter(notification => notification.type === advancedFilters.type);
    }
    
    if (advancedFilters.readStatus !== 'all') {
      filtered = filtered.filter(notification => {
        if (advancedFilters.readStatus === 'read') return notification.read;
        if (advancedFilters.readStatus === 'unread') return !notification.read;
        return true;
      });
    }
    
    if (advancedFilters.dateRange !== 'all') {
      filtered = filtered.filter(notification => {
        const date = new Date(notification.createdAt?._seconds * 1000);
        if (advancedFilters.dateRange === 'today') return isToday(date);
        if (advancedFilters.dateRange === 'week') return isThisWeek(date);
        if (advancedFilters.dateRange === 'month') return isThisMonth(date);
        return true;
      });
    }
    
    // Ordenar notificações
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt?._seconds * 1000);
      const dateB = new Date(b.createdAt?._seconds * 1000);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredNotifications(filtered);
  }, [notifications, activeTab, sortOrder, searchQuery, advancedFilters, t]);

  useEffect(() => {
    filterAndSortNotifications();
  }, [filterAndSortNotifications]);

  return {
    activeTab,
    setActiveTab,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    advancedFilters,
    setAdvancedFilters,
    filteredNotifications,
  };
}