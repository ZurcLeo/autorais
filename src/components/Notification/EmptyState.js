import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const EmptyState = ({ type = 'info', message }) => {
  const { t } = useTranslation();
  
  const messages = {
    info: t('notifications.no_notifications'),
    error: t('common.error_occurred'),
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
      <Typography variant="body1" color={type === 'error' ? 'error' : 'textSecondary'}>
        {message || messages[type]}
      </Typography>
    </Box>
  );
};

export default EmptyState;