// src/components/Loans/dialogs/MakePaymentDialog.js
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Box, 
  Grid, 
  Typography, 
  MenuItem,
  CircularProgress 
} from '@mui/material';
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

const MakePaymentDialog = ({ 
  open, 
  onClose, 
  loan, 
  onSubmit, 
  loading 
}) => {
  const { t } = useTranslation();
  const [paymentData, setPaymentData] = useState({
    valor: '',
    metodo: 'pix',
  });

  // Update payment amount when loan changes
  useEffect(() => {
    if (loan) {
      setPaymentData({
        valor: loan.valorParcela || '',
        metodo: 'pix'
      });
    }
  }, [loan]);

  const handleSubmit = async () => {
    try {
      if (!paymentData.valor || parseFloat(paymentData.valor) <= 0) {
        return;
      }

      await onSubmit(paymentData);
      onClose();
    } catch (error) {
      console.error('Error submitting payment:', error);
    }
  };

  const handleChange = (field) => (event) => {
    setPaymentData({
      ...paymentData,
      [field]: event.target.value
    });
  };

  if (!loan) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        {t('loanManagement.makePayment')}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('loanManagement.loanDetails')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2">
                {t('loanManagement.outstandingBalance')}:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" fontWeight="bold" color="error">
                {formatCurrency(loan.saldoDevedor)}
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="body2">
                {t('loanManagement.nextInstallment')}:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" fontWeight="bold">
                {formatCurrency(loan.valorParcela)}
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="body2">
                {t('loanManagement.dueDate')}:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" fontWeight="bold">
                {formatDate(loan.dataVencimento)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      
        <TextField
          autoFocus
          margin="dense"
          label={t('loanManagement.paymentAmount')}
          type="number"
          fullWidth
          value={paymentData.valor}
          onChange={handleChange('valor')}
          InputProps={{
            startAdornment: 'R$',
          }}
          helperText={t('loanManagement.paymentAmountHelper')}
          sx={{ mb: 2 }}
        />
        
        <TextField
          select
          margin="dense"
          label={t('loanManagement.paymentMethod')}
          fullWidth
          value={paymentData.metodo}
          onChange={handleChange('metodo')}
          helperText={t('loanManagement.paymentMethodHelper')}
        >
          <MenuItem value="pix">PIX</MenuItem>
          <MenuItem value="transferencia">
            {t('loanManagement.bankTransfer')}
          </MenuItem>
          <MenuItem value="deposito">
            {t('loanManagement.deposit')}
          </MenuItem>
        </TextField>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose}
          disabled={loading}
        >
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !paymentData.valor || parseFloat(paymentData.valor) <= 0}
          startIcon={loading && <CircularProgress size={18} color="inherit" />}
        >
          {t('loanManagement.confirmPayment')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MakePaymentDialog;