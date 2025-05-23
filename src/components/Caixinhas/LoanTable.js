// src/components/Loans/LoanTable.js
import React from 'react';
import { 
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
  Tooltip, 
  CircularProgress 
} from '@mui/material';
import { 
  Payment as PaymentIcon, 
  Cancel as CancelIcon, 
  Info as InfoIcon, 
  CheckCircleOutline as CheckCircleIcon 
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import LoanTableRow from './LoanTableRow';

// Helper function to format currency
const formatCurrency = (value, currency = 'BRL') => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
};

// Helper function to format dates
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('pt-BR');
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

const LoanTable = ({ 
  loans = [], 
  type = 'active', 
  onMakePayment, 
  onApprove, 
  onReject, 
  onViewDetails,
  loading = false
}) => {
  const { t } = useTranslation();

  // Define table headers based on type
  const getTableHeaders = () => {
    switch (type) {
      case 'active':
        return [
          { id: 'member', label: t('loanManagement.member'), align: 'left' },
          { id: 'value', label: t('loanManagement.value'), align: 'right' },
          { id: 'installments', label: t('loanManagement.installments'), align: 'right' },
          { id: 'nextDueDate', label: t('loanManagement.nextDueDate'), align: 'right' },
          { id: 'status', label: t('loanManagement.status'), align: 'center' },
          { id: 'actions', label: t('loanManagement.actions'), align: 'right' }
        ];
      case 'pending':
        return [
          { id: 'member', label: t('loanManagement.member'), align: 'left' },
          { id: 'requestedValue', label: t('loanManagement.requestedValue'), align: 'right' },
          { id: 'reason', label: t('loanManagement.reason'), align: 'left' },
          { id: 'requestDate', label: t('loanManagement.requestDate'), align: 'right' },
          { id: 'actions', label: t('loanManagement.actions'), align: 'right' }
        ];
      case 'completed':
        return [
          { id: 'member', label: t('loanManagement.member'), align: 'left' },
          { id: 'value', label: t('loanManagement.value'), align: 'right' },
          { id: 'completionDate', label: t('loanManagement.completionDate'), align: 'right' },
          { id: 'status', label: t('loanManagement.status'), align: 'center' },
          { id: 'actions', label: t('loanManagement.actions'), align: 'right' }
        ];
      default:
        return [];
    }
  };

  const getTableHeaderColor = () => {
    switch (type) {
      case 'active':
        return 'primary.main';
      case 'pending':
        return 'warning.light';
      case 'completed':
        return 'success.light';
      default:
        return 'primary.main';
    }
  };

  // Render no loans message
  const renderNoLoansMessage = () => {
    let message = '';
    switch (type) {
      case 'active':
        message = t('loanManagement.noActiveLoans');
        break;
      case 'pending':
        message = t('loanManagement.noPendingLoans');
        break;
      case 'completed':
        message = t('loanManagement.noCompletedLoans');
        break;
      default:
        message = t('loanManagement.noLoans');
    }

    return (
      <TableRow>
        <TableCell colSpan={getTableHeaders().length} align="center" sx={{ py: 3 }}>
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <Typography color="text.secondary">
              {message}
            </Typography>
          )}
        </TableCell>
      </TableRow>
    );
  };

  const headers = getTableHeaders();
  const headerColor = getTableHeaderColor();

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Table>
        <TableHead sx={{ bgcolor: headerColor }}>
          <TableRow>
            {headers.map((header) => (
              <TableCell 
                key={header.id} 
                align={header.align} 
                sx={{ color: 'white' }}
              >
                {header.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loans.length > 0 ? (
            loans.map((loan) => (
              <LoanTableRow
                key={loan.id}
                loan={loan}
                type={type}
                onMakePayment={onMakePayment}
                onApprove={onApprove}
                onReject={onReject}
                onViewDetails={onViewDetails}
              />
            ))
          ) : (
            renderNoLoansMessage()
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LoanTable;