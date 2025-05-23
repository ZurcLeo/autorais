// src/components/Loans/LoanTableRow.js
import React from 'react';
import { 
  TableRow, 
  TableCell, 
  Chip, 
  IconButton, 
  Tooltip 
} from '@mui/material';
import { 
  Payment as PaymentIcon, 
  Cancel as CancelIcon, 
  Info as InfoIcon, 
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

const LoanTableRow = ({ 
  loan, 
  type, 
  onMakePayment, 
  onApprove, 
  onReject, 
  onViewDetails 
}) => {
  const { t } = useTranslation();

  const handleRowClick = () => {
    if (onViewDetails) {
      onViewDetails(loan);
    }
  };

  // Rendering cells based on loan type
  const renderCells = () => {
    switch (type) {
      case 'active':
        return (
          <>
            <TableCell component="th" scope="row">
              {loan.membro.nome}
            </TableCell>
            <TableCell align="right">{formatCurrency(loan.valor)}</TableCell>
            <TableCell align="right">
              {loan.parcelasPagas}/{loan.totalParcelas}
            </TableCell>
            <TableCell align="right">
              {formatDate(loan.dataVencimento)}
            </TableCell>
            <TableCell align="center">
              <Chip
                label={t(`statuses.${loan.status.toLowerCase()}`)}
                color={getLoanStatusColor(loan.status)}
                size="small"
              />
            </TableCell>
            <TableCell align="right">
              {onMakePayment && (
                <Tooltip title={t('loanManagement.makePayment')}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMakePayment(loan);
                    }}
                    color="primary"
                  >
                    <PaymentIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={t('loanManagement.viewDetails')}>
                <IconButton
                  size="small"
                  onClick={handleRowClick}
                  color="info"
                >
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </TableCell>
          </>
        );
      case 'pending':
        return (
          <>
            <TableCell component="th" scope="row">
              {loan.membro.nome}
            </TableCell>
            <TableCell align="right">{formatCurrency(loan.valor)}</TableCell>
            <TableCell>{loan.motivo}</TableCell>
            <TableCell align="right">{formatDate(loan.dataSolicitacao)}</TableCell>
            <TableCell align="right">
              {onApprove && (
                <Tooltip title={t('loanManagement.approve')}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApprove(loan.id);
                    }}
                    color="success"
                  >
                    <CheckCircleIcon />
                  </IconButton>
                </Tooltip>
              )}
              {onReject && (
                <Tooltip title={t('loanManagement.reject')}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReject(loan.id);
                    }}
                    color="error"
                  >
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={t('loanManagement.viewDetails')}>
                <IconButton
                  size="small"
                  onClick={handleRowClick}
                  color="info"
                >
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </TableCell>
          </>
        );
      case 'completed':
        return (
          <>
            <TableCell component="th" scope="row">
              {loan.membro.nome}
            </TableCell>
            <TableCell align="right">{formatCurrency(loan.valor)}</TableCell>
            <TableCell align="right">{formatDate(loan.dataConclusao)}</TableCell>
            <TableCell align="center">
              <Chip
                label={t(`statuses.${loan.status.toLowerCase()}`)}
                color={getLoanStatusColor(loan.status)}
                size="small"
              />
            </TableCell>
            <TableCell align="right">
              <Tooltip title={t('loanManagement.viewDetails')}>
                <IconButton
                  size="small"
                  onClick={handleRowClick}
                  color="info"
                >
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </TableCell>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <TableRow 
      sx={{ 
        '&:hover': { bgcolor: 'action.hover' },
        cursor: 'pointer'
      }}
      onClick={handleRowClick}
    >
      {renderCells()}
    </TableRow>
  );
};

export default LoanTableRow;