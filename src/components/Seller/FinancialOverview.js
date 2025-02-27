import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const FinancialOverview = () => {
  const { t } = useTranslation();
  
  return (
    <Box>
      <Typography variant="h5">{t('financial.title')}</Typography>
      <Typography variant="body1">{t('financial.description')}</Typography>
    </Box>
  );
};

export default FinancialOverview;