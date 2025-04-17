import React, { useEffect, useState } from 'react';
import { 
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  IconButton,
  Chip,
  Collapse,
  Divider,
  Paper,
  Tooltip,
  Grid
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  CheckCircle,
  PendingActions,
  KeyboardArrowDown,
  KeyboardArrowUp
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBanking } from '../../providers/BankingProvider';
import BankAccountModal from './BankAccountModal';
import PixPayment from '../Common/PixPayment';
import { loadMercadoPago } from "@mercadopago/sdk-js";

await loadMercadoPago();
const mPK = process.env.REACT_APP_MERCADOPAGO_PUBLIC_KEY;
const mp = new window.MercadoPago(mPK);

const maskAccountNumber = (number) => {
  if (!number) return '';
  const visible = number.slice(-4);
  return `***${visible}`;
};

const maskPixKey = (key) => {
  if (!key) return '';
  if (key.includes('@')) {
    const [localPart, domain] = key.split('@');
    return `${localPart[0]}***@${domain}`;
  }
  if (key.includes('.')) {
    return key.replace(/\d(?=\d{4})/g, '*');
  }
  return '****' + key.slice(-4);
};

const StatusChip = ({ isActive }) => {
  const { t } = useTranslation();
  
  return (
    <Chip
      icon={isActive ? <CheckCircle /> : <PendingActions />}
      label={isActive ? t('banking.active') : t('banking.pending')}
      color={isActive ? 'success' : 'warning'}
      size="small"
      sx={{ 
        '& .MuiChip-icon': {
          color: 'inherit'
        }
      }}
    />
  );
};

const BankingHistoryItem = ({ entry, onValidate }) => {
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  const { validateBankAccount } = useBanking();

  const toggleSensitiveInfo = (e) => {
    e.stopPropagation();
    setShowSensitiveInfo(!showSensitiveInfo);
  };

  const handleValidation = async () => {
    try {
      await validateBankAccount({ caixinhaId: entry.caixinhaId, accountId: entry.id });
      // Feedback ao usuário pode ser implementado
    } catch (error) {
      console.error('Erro ao validar a conta:', error);
    }
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        mb: 2, 
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.02)'
        }
      }}
    >
      <ListItem 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'stretch',
          cursor: 'pointer'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" fontWeight="medium">
              {entry.bankName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="text.secondary">
                {showSensitiveInfo ? entry.accountNumber : maskAccountNumber(entry.accountNumber)}
              </Typography>
              <Tooltip title={t('banking.toggleVisibility')}>
                <IconButton size="small" onClick={(e) => {
                  e.stopPropagation();
                  setShowSensitiveInfo(!showSensitiveInfo);
                }}>
                  {showSensitiveInfo ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
          <Grid item xs={12} sm={2}>
            <StatusChip isActive={entry.isActive} />
          </Grid>
          <Grid item xs={12} sm={3}>
            {!entry.isActive && (
              <Button 
                variant="outlined" 
                size="small" 
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onValidate(entry);
                }}
              >
                {t('banking.validate')}
              </Button>
            )}
          </Grid>
        </Grid>

        <Collapse in={expanded} timeout="auto" unmountOnExit sx={{ width: '100%' }}>
          <Box sx={{ mt: 2, pl: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('banking.accountHolder')}:
                </Typography>
                <Typography variant="body1">
                  {entry.accountHolder}
                </Typography>
              </Grid>
              {entry.pixKey && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('banking.pixKey')}:
                  </Typography>
                  <Typography variant="body1">
                    {showSensitiveInfo ? entry.pixKey : maskPixKey(entry.pixKey)}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  {t('banking.createdAt')}:
                </Typography>
                <Typography variant="body1">
                  {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : t('banking.notAvailable')}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        <IconButton 
          sx={{ alignSelf: 'center', mt: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        </IconButton>
      </ListItem>
      <Divider />
    </Paper>
  );
};

const BankingHistory = ({ bankingHistory, onValidate }) => {
  const { t } = useTranslation();
  
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        mb: 3
      }}>
        {t('banking.history')}
        <Chip 
          label={`${bankingHistory?.length} ${t('banking.accounts')}`}
          size="small"
          sx={{ ml: 1 }}
        />
      </Typography>
      
      <List sx={{ width: '100%' }}>
        {bankingHistory?.map((entry) => (
      <BankingHistoryItem 
      key={entry.id} 
      entry={entry} 
      onValidate={onValidate}
    />       
     ))}
      </List>
    </Box>
  );
};

const BankingManagement = ({ caixinhaId }) => {
  const { bankingInfo, bankingHistory, refetchBankingInfo, refetchBankingHistory, setModalOpen } = useBanking();
  const { t } = useTranslation();
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    refetchBankingInfo(caixinhaId);
    refetchBankingHistory(caixinhaId);
  }, [caixinhaId]);

  const handlePaymentComplete = () => {
    refetchBankingHistory(caixinhaId); // Atualiza histórico ao concluir pagamento
    setSelectedAccount(null); // Fecha o modal
  };

  console.log('bankingInfo:', bankingInfo);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {t('banking.travaBancaria')}
        </Typography>
        
        <Box sx={{ 
          my: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <StatusChip isActive={bankingInfo?.status === 'validada'} />
          <Button 
            variant="contained" 
            onClick={() => setModalOpen(true)}
            sx={{ ml: 2 }}
          >
            {t('banking.registerAccount')}
          </Button>
        </Box>

        <BankingHistory 
          bankingHistory={bankingHistory} 
          onValidate={(account) => setSelectedAccount(account)} 
        />
      </CardContent>

      {selectedAccount && (
        <PixPayment
          amount={0.01} // Valor do micropagamento
          description={`Validação de conta: ${selectedAccount.bankName}`}
          paymentId={selectedAccount.id}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      <BankAccountModal caixinhaId={caixinhaId} />
    </Card>
  );
};

export default BankingManagement;