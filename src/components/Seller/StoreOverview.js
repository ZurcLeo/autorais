import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const StoreOverview = () => {
  const {t} = useTranslation();

  <Box>
    <Typography variant="h5">{t('StoreOverview.title')}</Typography>
    <Typography variant="body1">{t('StoreOverview.description')}</Typography>
  </Box>
  
}

export default StoreOverview;