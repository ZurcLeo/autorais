import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const OrderManagement = () => {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant="h5">{t('orderManagement.title')}</Typography>
      <Typography variant="body1">{t('orderManagement.description')}</Typography>
    </Box>
  );
};

export default OrderManagement;