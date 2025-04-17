// NotificationHistory.js (componente principal simplificado)
import React, { useRef, useState } from 'react';
import { Box, Fade, Fab, useMediaQuery, useTheme } from '@mui/material';
import { ArrowUpward as ArrowUpIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../providers/NotificationProvider';

// Componentes
import NotificationHistoryHeader from './NotificationHistoryHeader';
import NotificationFiltersBar from './NotificationFiltersBar';
import NotificationSearchBar from './NotificationSearchBar';
import NotificationList from './NotificationList';
import EmptyState from './EmptyState';
import CustomSnackbar from './CustomSnackbar';
import NotificationFilterDrawer from './NotificationFilterDrawer';

// Hooks
import useNotificationFilters from '../../hooks/notification/useNotificationFilters';
import useNotificationPagination from '../../hooks/notification/useNotificationPagination';
import useNotificationGroups from '../../hooks/notification/useNotificationGroups';

const NotificationHistory = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const contentRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [refreshError, setRefreshError] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  
  // Context do NotificationProvider
  const {
    notifications = [],
    notifLoading,
    error,
    markAsRead,
    refreshNotifications,
    clearAllNotifications,
    unreadCount = 0
  } = useNotifications();

  // Hooks customizados
  const {
    activeTab,
    setActiveTab,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    advancedFilters,
    setAdvancedFilters,
    filteredNotifications,
  } = useNotificationFilters(notifications);

  const {
    page,
    setPage,
    hasMore,
    paginatedNotifications,
    loadMoreRef,
  } = useNotificationPagination(filteredNotifications, notifLoading);

  const { groupedNotifications } = useNotificationGroups(paginatedNotifications);

  // Funções de ação
  const handleRefresh = async () => {
    try {
      await refreshNotifications();
      setPage(1);
    } catch (error) {
      setRefreshError(t('notification.refresh_error'));
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const handleAction = (notificationId, action) => {
    if (action === 'delete') {
      // Por enquanto, apenas marcamos como lida
      handleMarkAsRead(notificationId);
    } else {
      handleMarkAsRead(notificationId);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
    } catch (error) {
      setRefreshError(t('notification.clear_error'));
    }
  };

  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleFilterDrawer = (open) => () => {
    setFilterDrawerOpen(open);
  };

  // Renderização condicional
  if (error) return <EmptyState type="error" message={error} />;

  return (
    <Box
      ref={contentRef}
      sx={{ p: isMobile ? 1 : 3, height: '80vh', overflow: 'auto' }}
      onScroll={(e) => {
        setShowScrollTop(e.target.scrollTop > 500);
      }}
    >
      {/* Cabeçalho */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          zIndex: 1,
          pt: 2,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <NotificationHistoryHeader 
          onRefresh={handleRefresh} 
          onClearAll={handleClearAll}
          isRefreshing={notifLoading}
          hasNotifications={filteredNotifications.length > 0}
          isMobile={isMobile}
        />

        <NotificationSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />

        <NotificationFiltersBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          onOpenFilters={toggleFilterDrawer(true)}
          unreadCount={unreadCount}
          advancedFilters={advancedFilters}
          isMobile={isMobile}
        />
      </Box>

      {/* Drawer para filtros avançados */}
      <NotificationFilterDrawer
        open={filterDrawerOpen}
        onClose={toggleFilterDrawer(false)}
        onApplyFilters={setAdvancedFilters}
        currentFilters={advancedFilters}
        isMobile={isMobile}
      />

      {/* Lista de notificações */}
      <NotificationList
        groupedNotifications={groupedNotifications}
        isLoading={notifLoading}
        isEmpty={filteredNotifications.length === 0}
        hasMore={hasMore}
        loadMoreRef={loadMoreRef}
        onMarkAsRead={handleMarkAsRead}
        onAction={handleAction}
        isMobile={isMobile}
      />

      {/* Botão para voltar ao topo */}
      <Fade in={showScrollTop}>
        <Fab
          color="primary"
          size="small"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 2,
          }}
        >
          <ArrowUpIcon />
        </Fab>
      </Fade>
      
      {/* Exibe erros de atualização */}
      <CustomSnackbar 
        open={!!refreshError} 
        message={refreshError} 
        severity="error" 
        onClose={() => setRefreshError(null)}
      />
    </Box>
  );
};

export default NotificationHistory;