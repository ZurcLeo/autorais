// src/components/Loans/dialogs/LoanDetailDialog.js
import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  Payment as PaymentIcon, 
  Cancel as CancelIcon, 
  CheckCircleOutline as CheckCircleIcon 
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Helper functions
const formatCurrency = (value, currency = 'BRL') => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('pt-BR');
};

const formatPercentage = (value) => {
  return `${value}%`;
};

// Get loan status color
const getLoanStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
    case 'aprovado':
      return 'success';
    case 'pending':
    case 'pendente':
      return 'warning';
    case 'denied':
    case 'negado':
    case 'rejected':
    case 'cancelled':
    case 'cancelado':
      return 'error';
    case 'paid':
    case 'pago':
      return 'info';
    default:
      return 'default';
  }
};

const LoanDetailDialog = ({ 
  open, 
  onClose, 
  loan, 
  onMakePayment, 
  onApprove, 
  onReject, 
  loading 
}) => {
  const { t } = useTranslation();

  if (!loan) return null;

  const renderPaymentHistory = () => {
    if (!loan.pagamentos || loan.pagamentos.length === 0) return null;

    return (
      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              {t('loanManagement.paymentHistory')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('loanManagement.date')}</TableCell>
                    <TableCell align="right">{t('loanManagement.amount')}</TableCell>
                    <TableCell>{t('loanManagement.status')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loan.pagamentos.map((pagamento, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatDate(pagamento.data)}</TableCell>
                      <TableCell align="right">{formatCurrency(pagamento.valor)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={t('loanManagement.confirmed')} 
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle 
        sx={{ 
          bgcolor: getLoanStatusColor(loan.status) + '.light', 
          color: getLoanStatusColor(loan.status) + '.dark'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {t('loanManagement.loanDetails')} - {formatCurrency(loan.valor)}
          </Typography>
          <Chip
            label={t(`statuses.${loan.status.toLowerCase()}`)}
            color={getLoanStatusColor(loan.status)}
            size="small"
          />
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {t('loanManagement.generalInfo')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('loanManagement.member')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="medium">
                      {loan.membro.nome}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('loanManagement.requestDate')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {formatDate(loan.dataSolicitacao)}
                    </Typography>
                  </Grid>
                  
                  {loan.dataAprovacao && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          {t('loanManagement.approvalDate')}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          {formatDate(loan.dataAprovacao)}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  
                  {loan.dataConclusao && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          {t('loanManagement.completionDate')}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          {formatDate(loan.dataConclusao)}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('loanManagement.reason')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {loan.motivo}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {t('loanManagement.financialDetails')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('loanManagement.totalValue')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(loan.valor)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('loanManagement.installments')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {loan.parcelasPagas} / {loan.totalParcelas}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('loanManagement.installmentValue')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {formatCurrency(loan.valorParcela)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('loanManagement.outstandingBalance')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      color={loan.saldoDevedor > 0 ? 'error.main' : 'success.main'}
                    >
                      {formatCurrency(loan.saldoDevedor)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('loanManagement.interestRate')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {formatPercentage(loan.taxaJuros)}
                    </Typography>
                  </Grid>
                  
                  {loan.dataVencimento && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          {t('loanManagement.nextDueDate')}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography 
                          variant="body2" 
                          fontWeight="medium"
                          color={new Date(loan.dataVencimento) < new Date() ? 'error.main' : 'text.primary'}
                        >
                          {formatDate(loan.dataVencimento)}
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {renderPaymentHistory()}
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        {loan.status === 'aprovado' && loan.saldoDevedor > 0 && onMakePayment && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PaymentIcon />}
            onClick={() => {
              onClose();
              onMakePayment(loan);
            }}
            sx={{ mr: 'auto' }}
            disabled={loading}
          >
            {t('loanManagement.makePayment')}
          </Button>
        )}
        
        {loan.status === 'pendente' && (
          <>
            {onReject && (
              <Button
                variant="contained"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => {
                  onReject(loan.id);
                  onClose();
                }}
                sx={{ mr: 1 }}
                disabled={loading}
              >
                {t('loanManagement.reject')}
              </Button>
            )}
            
            {onApprove && (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => {
                  onApprove(loan.id);
                  onClose();
                }}
                sx={{ mr: 1 }}
                disabled={loading}
              >
                {t('loanManagement.approve')}
              </Button>
            )}
          </>
        )}
        
        <Button onClick={onClose} disabled={loading}>
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoanDetailDialog;