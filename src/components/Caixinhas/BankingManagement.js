import React, { useEffect, useState } from 'react';
import { 
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Box,
  List,
  IconButton,
  Chip,
  Collapse,
  Divider,
  Paper,
  Tooltip,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  LinearProgress,
  useTheme,
  Avatar,
  Badge
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  CheckCircle,
  PendingActions,
  KeyboardArrowDown,
  KeyboardArrowUp,
  AccountBalance,
  Add as AddIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBanking } from '../../providers/BankingProvider';
import BankAccountModal from './BankAccountModal';
import PixPayment from '../Common/PixPayment';

// Helper functions moved to top for organization
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

/**
 * Component to display bank account status
 */
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

/**
 * Component to display bank account information
 */
const BankingHistoryItem = ({ entry, onValidate }) => {
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  const theme = useTheme();
  
  const toggleSensitiveInfo = (e) => {
    e.stopPropagation();
    setShowSensitiveInfo(!showSensitiveInfo);
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        mb: 2, 
        borderRadius: 2,
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: 3,
          backgroundColor: 'rgba(0, 0, 0, 0.02)'
        }
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'stretch',
          cursor: 'pointer',
          p: 2
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center">
              <Avatar 
                sx={{ 
                  bgcolor: entry.isActive ? theme.palette.success.light : theme.palette.warning.light,
                  mr: 1
                }}
              >
                <AccountBalance />
              </Avatar>
              <Typography variant="subtitle1" fontWeight="medium">
                {entry.bankName}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                {showSensitiveInfo ? entry.accountNumber : maskAccountNumber(entry.accountNumber)}
              </Typography>
              <Tooltip title={t('banking.toggleVisibility')}>
                <IconButton size="small" onClick={toggleSensitiveInfo}>
                  {showSensitiveInfo ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
          <Grid item xs={12} sm={2}>
            <StatusChip isActive={entry.isActive} />
          </Grid>
          <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            {!entry.isActive && (
              <Button 
                variant="outlined" 
                size="small" 
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onValidate(entry);
                }}
                startIcon={<LockOpenIcon />}
              >
                {t('banking.validate')}
              </Button>
            )}
          </Grid>
        </Grid>

        <Collapse in={expanded} timeout="auto" unmountOnExit sx={{ width: '100%', mt: 2 }}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ pl: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('banking.accountType')}:
                </Typography>
                <Typography variant="body1">
                  {t(`banking.${entry.accountType.toLowerCase()}`)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('banking.bankCode')}:
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {entry.bankCode}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('banking.accountHolder')}:
                </Typography>
                <Typography variant="body1">
                  {entry.accountHolder}
                </Typography>
              </Grid>
              {entry.pixKey && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('banking.pixKey')}:
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {showSensitiveInfo ? entry.pixKey : maskPixKey(entry.pixKey)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('banking.pixKeyType')}:
                    </Typography>
                    <Typography variant="body1">
                      {entry.pixKeyType}
                    </Typography>
                  </Grid>
                </>
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

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <IconButton 
            sx={{ width: 30, height: 30 }}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

/**
 * Component to display banking history
 */
const BankingHistory = ({ bankingHistory, onValidate, loading }) => {
  const { t } = useTranslation();
  
  
  if (loading) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('banking.history')}
        </Typography>
        <LinearProgress sx={{ mb: 2 }} />
        {[1, 2].map((i) => (
          <Paper 
            key={i}
            sx={{ 
              height: 100, 
              mb: 2, 
              borderRadius: 2, 
              opacity: 0.7 
            }} 
          />
        ))}
      </Box>
    );
  }

  if (!bankingHistory || bankingHistory.length === 0) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('banking.history')}
        </Typography>
        <Paper 
          sx={{ 
            p: 3, 
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}
        >
          <InfoIcon color="info" sx={{ fontSize: 40, mb: 2 }} />
          <Typography variant="body1">
            {t('banking.noAccountsRegistered')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('banking.registerAccountPrompt')}
          </Typography>
        </Paper>
      </Box>
    );
  }
  
  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        mb: 3
      }}>
        <Typography variant="h6">
          {t('banking.history')}
        </Typography>
        <Chip 
          label={`${bankingHistory.length} ${t('banking.accounts')}`}
          size="small"
          color="primary"
          variant="outlined"
        />
      </Box>
      
      <List sx={{ width: '100%' }}>
        {bankingHistory.map((entry) => (
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

// Guide component for banking operations
const BankingGuide = ({ status }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const isActive = status === 'validada';
  
  return (
    <Box sx={{ mb: 4 }}>
      <Paper 
        elevation={2}
        sx={{ 
          p: 3, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: isActive ? 'success.light' : 'warning.light',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {isActive ? (
            <CheckCircle color="success" sx={{ mr: 1, fontSize: 28 }} />
          ) : (
            <WarningIcon color="warning" sx={{ mr: 1, fontSize: 28 }} />
          )}
          <Typography variant="h6" color={isActive ? 'success.main' : 'warning.main'}>
            {isActive ? t('banking.activeBankingLock') : t('banking.inactiveBankingLock')}
          </Typography>
        </Box>
        
        <Typography variant="body1" paragraph>
          {isActive 
            ? t('banking.activeBankingLockDescription') 
            : t('banking.inactiveBankingLockDescription')
          }
        </Typography>
        <span>Para comecar a movimentar sua caixinha, voce precisa criar uma Trava Bancaria.</span>
        <Stepper 
          activeStep={isActive ? 3 : 0} 
          orientation="vertical"
          sx={{ mt: 3 }}
        >
          <Step completed={isActive}>
            <StepLabel>
              <Typography variant="subtitle1">
                {t('banking.step1Title')}
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2">
                {t('banking.step1Description')}
              </Typography>
            </StepContent>
            <Badge>Informe os dados como constam em seus documentos oficiais, isso assegura que a Trava sera realizada em uma conta real e assegura que apenas esta conta possa movimentar fluxos futuros, como retiradas e depositos.</Badge>
          </Step>
          
          <Step completed={isActive}>
            <StepLabel>
              <Typography variant="subtitle1">
                {t('banking.step2Title')}
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2">
                {t('banking.step2Description')}
              </Typography>
            </StepContent>
          </Step>
          
          <Step completed={isActive}>
            <StepLabel>
              <Typography variant="subtitle1">
                {t('banking.step3Title')}
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2">
                {t('banking.step3Description')}
              </Typography>
            </StepContent>
          </Step>
        </Stepper>
      </Paper>
    </Box>
  );
};

/**
 * Main component for banking management
 */
const BankingManagement = ({ caixinhaId }) => {
  const { bankingInfo, 
    bankingHistory, 
    loading,
    refetchBankingInfo, 
    refetchBankingHistory, 
    setModalOpen,
    selectCaixinha,
    selectedCaixinha } = useBanking();
  const { t } = useTranslation();
  const theme = useTheme();
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Select caixinha when caixinhaId prop changes
  useEffect(() => {
    if (caixinhaId && selectedCaixinha !== caixinhaId) {
      selectCaixinha(caixinhaId);
    }
  }, [caixinhaId, selectCaixinha, selectedCaixinha]);


  const handlePaymentComplete = () => {
    refetchBankingHistory();
    refetchBankingInfo();
    setSelectedAccount(null);
  };

  const isLockActive = bankingInfo?.status === 'validada';

  return (
    <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <CardHeader 
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isLockActive ? (
              <LockIcon color="success" sx={{ mr: 1 }} />
            ) : (
              <LockOpenIcon color="warning" sx={{ mr: 1 }} />
            )}
            <Typography variant="h5">
              {t('banking.travaBancaria')}
            </Typography>
          </Box>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            {isLockActive 
              ? t('banking.activeLockDescription') 
              : t('banking.inactiveLockDescription')
            }
          </Typography>
        }
        action={
          <Button 
            variant="contained" 
            onClick={() => setModalOpen(true)}
            startIcon={<AddIcon />}
            sx={{ 
              borderRadius: 8, 
              px: 2,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-3px)'
              }
            }}
          >
            {t('banking.registerAccount')}
          </Button>
        }
        sx={{ 
          bgcolor: isLockActive ? 'success.light' : 'warning.light',
          color: isLockActive ? 'success.contrastText' : 'warning.contrastText',
          borderBottom: '1px solid',
          borderColor: isLockActive ? 'success.main' : 'warning.main',
          pb: 2
        }}
      />
      
      <CardContent sx={{ p: 3 }}>
        {/* Status information */}
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
          <StatusChip isActive={isLockActive} />
          
          {loading && (
            <Typography variant="body2" color="text.secondary">
              {t('banking.loadingData')}
            </Typography>
          )}
        </Box>
        
        {/* Guide/Instructions */}
        <BankingGuide status={bankingInfo?.status} />

        {/* List of accounts */}
        <BankingHistory 
          bankingHistory={bankingHistory} 
          onValidate={(account) => setSelectedAccount(account)}
          loading={loading}
        />
      </CardContent>

      {/* Payment Modal */}
      {selectedAccount && (
        <PixPayment
          amount={0.01} // Micropayment value
          description={`${t('banking.accountValidation')}: ${selectedAccount.bankName}`}
          paymentId={selectedAccount.id}
          caixinhaId={caixinhaId}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {/* Account Registration Modal */}
      <BankAccountModal caixinhaId={caixinhaId} />
    </Card>
  );
};

export default BankingManagement;