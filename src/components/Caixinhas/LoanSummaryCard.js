// src/components/Loans/LoanSummaryCard.js
import React from 'react';
import { Card, CardContent, Grid, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Helper functions
const formatCurrency = (value, currency = 'BRL') => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
};

const formatPercentage = (value) => {
  return `${value}%`;
};

const LoanSummaryCard = ({ 
  availableFundsForLoans, 
  activeLoansCount, 
  totalActiveLoans, 
  interestRate, 
  lateFee 
}) => {
  const { t } = useTranslation();

  return (
    <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('loanManagement.availableFunds')}
              </Typography>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(availableFundsForLoans)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('loanManagement.maxLoanInfo', { percentage: '70%' })}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('loanManagement.activeLoans')}
              </Typography>
              <Typography variant="h5" color="warning.main" sx={{ fontWeight: 'bold' }}>
                {activeLoansCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatCurrency(totalActiveLoans)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('loanManagement.interestRate')}
              </Typography>
              <Typography variant="h5" color="success.main" sx={{ fontWeight: 'bold' }}>
                {formatPercentage(interestRate)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('loanManagement.perMonth')}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('loanManagement.lateFee')}
              </Typography>
              <Typography variant="h5" color="error.main" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(lateFee)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('loanManagement.perLatePayment')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default LoanSummaryCard;