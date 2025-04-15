import React from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Add as AddIcon, AccountBalance as AccountBalanceIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { serviceLocator } from '../../core/services/BaseService';

const ElosCoinsSection = ({ transactions, onBuyElosCoins }) => {
  const { t } = useTranslation();
      const serviceStore = serviceLocator.get('store').getState()?.auth;
      const { currentUser } = serviceStore;
console.log('eloscoinsection: ', currentUser)

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center">
          <AccountBalanceIcon color="secondary" />
          <Typography variant="h5" component="div" ml={1}>
            {t('elosCoins.balanceTitle')}
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={onBuyElosCoins}>
          {t('elosCoins.buyButton')}
        </Button>
      </Box>
      <Typography variant="h6">
        {currentUser.saldoElosCoins || 0} {t('elosCoins.currency')}
      </Typography>
      <Box mt={2}>
        <Typography variant="subtitle1">{t('elosCoins.recentTransactions')}</Typography>
        <List>
          {transactions.slice(0, 5).map((transaction, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemText
                  primary={`${transaction.date} ${transaction.time} - ${transaction.action}`}
                  secondary={`${t('elosCoins.value')}: ${transaction.cost} ${t('elosCoins.currency')}`}
                />
              </ListItem>
              {index < 4 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default ElosCoinsSection;