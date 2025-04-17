// components/NotificationHistoryHeader.js
import React from 'react';
import { Typography, Button, Box, CircularProgress } from '@mui/material';
import { Refresh as RefreshIcon, ClearAll as ClearAllIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const NotificationHistoryHeader = ({ 
  onRefresh, 
  onClearAll, 
  isRefreshing, 
  hasNotifications,
  isMobile 
}) => {
  const { t } = useTranslation();
  
  return (
    <Box
      display="flex"
      flexDirection={isMobile ? 'column' : 'row'}
      justifyContent="space-between"
      alignItems={isMobile ? "flex-start" : "center"}
      gap={2}
      mb={2}
    >
      <Typography variant="h5" component="h1">
        {t('notification.history_title')}
      </Typography>
      
      <Box display="flex" gap={1}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? t('common.refreshing') : t('common.refresh')}
        </Button>
        
        <Button
          variant="outlined"
          color="error"
          startIcon={<ClearAllIcon />}
          onClick={onClearAll}
          disabled={isRefreshing || !hasNotifications}
        >
          {t('notification.clear_all')}
        </Button>
      </Box>
    </Box>
  );
};

export default NotificationHistoryHeader;