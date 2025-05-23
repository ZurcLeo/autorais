// src/components/Loans/LoanPolicyAlert.js
import React from 'react';
import { Alert, AlertTitle, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Info as InfoIcon, AttachMoney as AttachMoneyIcon, CalendarToday as CalendarTodayIcon, Warning as WarningIcon } from '@mui/icons-material';
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

const LoanPolicyAlert = ({ maxLoanValue, interestRate, lateFee }) => {
  const { t } = useTranslation();

  return (
    <Alert 
      severity="info" 
      icon={<InfoIcon />}
      sx={{ mb: 3, borderRadius: 2 }}
    >
      <AlertTitle>{t('loanManagement.loanPolicy.title')}</AlertTitle>
      <List dense disablePadding>
        <ListItem>
          <ListItemIcon>
            <AttachMoneyIcon color="primary" fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary={t('loanManagement.loanPolicy.maxAmount')}
            secondary={t('loanManagement.loanPolicy.maxAmountDesc', {
              amount: formatCurrency(maxLoanValue)
            })} 
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CalendarTodayIcon color="primary" fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary={t('loanManagement.loanPolicy.paymentDeadline')}
            secondary={t('loanManagement.loanPolicy.paymentDeadlineDesc')} 
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <WarningIcon color="warning" fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary={t('loanManagement.loanPolicy.lateFees')}
            secondary={t('loanManagement.loanPolicy.lateFeesDesc', {
              fee: formatCurrency(lateFee),
              interest: formatPercentage(interestRate)
            })} 
          />
        </ListItem>
      </List>
    </Alert>
  );
};

export default LoanPolicyAlert;