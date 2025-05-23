// src/components/Loans/dialogs/RequestLoanDialog.js
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Alert, 
  AlertTitle, 
  Grid, 
  Box, 
  Typography, 
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

const formatPercentage = (value) => {
  return `${value}%`;
};

// Calculate installment value
const calculateInstallment = (totalValue, numInstallments, interestRate = 0) => {
  if (!numInstallments || numInstallments <= 0) return 0;
  
  // Simple interest calculation for demonstration
  const totalWithInterest = totalValue * (1 + (interestRate / 100));
  return totalWithInterest / numInstallments;
};

const RequestLoanDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  caixinha,
  availableFundsForLoans,
  loading 
}) => {
  const { t } = useTranslation();
  
  const [loanData, setLoanData] = useState({
    valor: '',
    parcelas: '',
    motivo: '',
  });

  const handleSubmit = async () => {
    try {
      if (!loanData.valor || !loanData.parcelas || !loanData.motivo) {
        return;
      }

      if (parseFloat(loanData.valor) > availableFundsForLoans) {
        return;
      }

      await onSubmit(loanData);
      onClose();
      setLoanData({ valor: '', parcelas: '', motivo: '' });
      
    } catch (error) {
      console.error('Error submitting loan request:', error);
    }
  };

  const handleChange = (field) => (event) => {
    setLoanData({
      ...loanData,
      [field]: event.target.value
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        {t('loanManagement.newLoan')}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>{t('loanManagement.loanTerms')}</AlertTitle>
          {t('loanManagement.maxAvailableAmount', {
            amount: formatCurrency(availableFundsForLoans)
          })}
          <Box sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>{t('loanManagement.interestRate')}:</strong> {formatPercentage(caixinha.valorJuros || 2.5)} {t('loanManagement.perMonth')}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>{t('loanManagement.lateFee')}:</strong> {formatCurrency(caixinha.valorMulta || 10)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Alert>
        
        <TextField
          autoFocus
          margin="dense"
          label={t('loanManagement.value')}
          type="number"
          fullWidth
          value={loanData.valor}
          onChange={handleChange('valor')}
          InputProps={{
            startAdornment: 'R$',
          }}
          helperText={t('loanManagement.limitInfo', {
            amount: formatCurrency(availableFundsForLoans)
          })}
          sx={{ mb: 2 }}
        />
        
        <TextField
          margin="dense"
          label={t('loanManagement.installments')}
          type="number"
          fullWidth
          value={loanData.parcelas}
          onChange={handleChange('parcelas')}
          inputProps={{ min: 1, max: 12 }}
          helperText={t('loanManagement.installmentInfo')}
          sx={{ mb: 2 }}
        />
        
        {loanData.valor && loanData.parcelas && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px dashed', borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('loanManagement.installmentSimulation')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>{t('loanManagement.amountPerInstallment')}:</strong>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold" color="primary">
                  {formatCurrency(calculateInstallment(
                    parseFloat(loanData.valor), 
                    parseInt(loanData.parcelas), 
                    caixinha.valorJuros
                  ))}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>{t('loanManagement.totalWithInterest')}:</strong>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold" color="primary">
                  {formatCurrency(parseFloat(loanData.valor) * (1 + (caixinha.valorJuros || 2.5) / 100))}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
        
        <TextField
          margin="dense"
          label={t('loanManagement.reason')}
          multiline
          rows={3}
          fullWidth
          value={loanData.motivo}
          onChange={handleChange('motivo')}
          helperText={t('loanManagement.reasonHelper')}
        />
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
          disabled={loading || !loanData.valor || !loanData.parcelas || !loanData.motivo}
          startIcon={loading && <CircularProgress size={18} color="inherit" />}
        >
          {t('loanManagement.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestLoanDialog;