import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ProductManagement = () =>{

  const { t } = useTranslation();
  return (
  <Box>
    <Typography variant="h5">{t('ProductManagement.title')}</Typography>
    <Typography variant="body1">{t('ProductManagement.description')}</Typography>
  </Box>
  )
}

export default ProductManagement;