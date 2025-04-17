// components/NotificationList.js
import React from 'react';
import { Box, Grid, CircularProgress } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import NotificationCard from './NotificationCard';
import NotificationGroup from './NotificationGroup';
import NotificationSkeleton from './NotificationSkeleton';
import EmptyState from './EmptyState';

const NotificationList = ({
  groupedNotifications,
  isLoading,
  isEmpty,
  hasMore,
  loadMoreRef,
  onMarkAsRead,
  onAction,
  isMobile
}) => {
  // Se temos dados para exibir
  if (!isEmpty) {
    return (
      <Box sx={{ mt: 2 }}>
        {/* Notificações agrupadas por data */}
        {groupedNotifications.map((group) => (
          <NotificationGroup 
            key={group.key} 
            title={group.title} 
            count={group.items.length}
          >
            <Grid container spacing={2}>
              <AnimatePresence>
                {group.items.map((notification, index) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onAction={onAction}
                    onMarkAsRead={onMarkAsRead}
                    index={index}
                    isMobile={isMobile}
                  />
                ))}
              </AnimatePresence>
            </Grid>
          </NotificationGroup>
        ))}
        
        {/* Exibir skeleton loading ao carregar mais dados */}
        <NotificationSkeleton 
          visible={isLoading} 
          count={3} 
        />
        
        {/* Elemento observável para infinite scroll */}
        {hasMore && !isLoading && (
          <Box ref={loadMoreRef} display="flex" justifyContent="center" my={3}>
            <CircularProgress size={30} />
          </Box>
        )}
      </Box>
    );
  }
  
  // Se não temos dados e está carregando
  if (isLoading) {
    return (
      <Box sx={{ mt: 2 }}>
        <NotificationSkeleton visible={true} count={5} />
      </Box>
    );
  }
  
  // Se não temos dados e não está carregando
  return (
    <Box sx={{ mt: 2 }}>
      <EmptyState type="info" />
    </Box>
  );
};

export default NotificationList;