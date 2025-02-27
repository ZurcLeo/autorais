import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Payment as PaymentIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next'; // Importando i18n

// Helper function to format currency
const formatCurrency = (value, currency) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
};

const getLoanStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'approved':
    case 'aprovado':
      return 'success';
    case 'pending':
    case 'pendente':
      return 'warning';
    case 'denied':
    case 'negado':
      return 'error';
    default:
      return 'default';
  }
};

const LoanManagement = ({ caixinha }) => {
  const { t, i18n } = useTranslation(); // Hook para tradução
  const currency = i18n.language === 'nl' ? 'EUR' : i18n.language === 'en' ? 'USD' : 'BRL';

  const [openDialog, setOpenDialog] = useState(false);
  const [loanData, setLoanData] = useState({
    valor: '',
    parcelas: '',
    motivo: '',
  });

  const handleSubmit = async () => {
    try {
      if (!loanData.valor || !loanData.parcelas || !loanData.motivo) {
        throw new Error(t('errors.requiredFields'));
      }

      if (parseFloat(loanData.valor) > maxLoanValue) {
        throw new Error(t('errors.exceedsLimit'));
      }

      // Call API to create loan
      setOpenDialog(false);
      setLoanData({ valor: '', parcelas: '', motivo: '' });
    } catch (error) {
      console.error(t('errors.loanError'), error);
    }
  };

  const handlePayment = async (loanId) => {
    try {
      // await processLoanPayment(caixinha.id, loanId);
    } catch (error) {
      console.error(t('errors.paymentError'), error);
    }
  };

  const handleCancel = async (loanId) => {
    try {
      // await cancelLoan(caixinha.id, loanId);
    } catch (error) {
      console.error(t('errors.cancelError'), error);
    }
  };

  const maxLoanValue = caixinha.saldoTotal * 0.7;
  const activeLoans = caixinha.emprestimos?.filter(
    (loan) => loan.status === t('statuses.approved') && loan.saldoDevedor > 0
  ) || [];

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{t('loanManagement.title')}</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            disabled={!caixinha.permiteEmprestimos}
          >
            {t('loanManagement.requestLoan')}
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          {t('loanManagement.availableAmount', {
            amount: formatCurrency(maxLoanValue, currency),
          })}
        </Alert>

        {activeLoans.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('loanManagement.member')}</TableCell>
                  <TableCell align="right">{t('loanManagement.value')}</TableCell>
                  <TableCell align="right">{t('loanManagement.installments')}</TableCell>
                  <TableCell align="right">{t('loanManagement.remainingBalance')}</TableCell>
                  <TableCell>{t('loanManagement.status')}</TableCell>
                  <TableCell align="right">{t('loanManagement.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell component="th" scope="row">
                      {loan.membro.nome}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(loan.valor, currency)}</TableCell>
                    <TableCell align="right">
                      {loan.parcelasPagas}/{loan.totalParcelas}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(loan.saldoDevedor, currency)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(`statuses.${loan.status.toLowerCase()}`)}
                        color={getLoanStatusColor(loan.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handlePayment(loan.id)}
                        disabled={loan.status !== t('statuses.approved')}
                      >
                        <PaymentIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleCancel(loan.id)}>
                        <CancelIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="textSecondary" align="center">
            {t('loanManagement.noActiveLoans')}
          </Typography>
        )}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('loanManagement.newLoan')}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            {t('loanManagement.maxAvailableAmount', {
              amount: formatCurrency(maxLoanValue, currency),
            })}
          </Alert>
          <TextField
            autoFocus
            margin="dense"
            label={t('loanManagement.value')}
            type="number"
            fullWidth
            value={loanData.valor}
            onChange={(e) => setLoanData({ ...loanData, valor: e.target.value })}
            InputProps={{
              startAdornment: currency,
            }}
            helperText={t('loanManagement.limitInfo', {
              amount: formatCurrency(maxLoanValue, currency),
            })}
          />
          <TextField
            margin="dense"
            label={t('loanManagement.installments')}
            type="number"
            fullWidth
            value={loanData.parcelas}
            onChange={(e) => setLoanData({ ...loanData, parcelas: e.target.value })}
            inputProps={{ min: 1, max: 12 }}
            helperText={t('loanManagement.installmentInfo')}
          />
          <TextField
            margin="dense"
            label={t('loanManagement.reason')}
            multiline
            rows={4}
            fullWidth
            value={loanData.motivo}
            onChange={(e) => setLoanData({ ...loanData, motivo: e.target.value })}
            helperText={t('loanManagement.reasonHelper')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>{t('common.cancel')}</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!loanData.valor || !loanData.parcelas || !loanData.motivo}
          >
            {t('loanManagement.submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LoanManagement;