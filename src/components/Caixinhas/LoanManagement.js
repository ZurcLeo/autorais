// src/components/Loans/LoanManagement.js
import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Tabs, Tab } from '@mui/material';
import { Add as AddIcon, Payment as PaymentIcon, ReceiptLong as ReceiptLongIcon, Paid as PaidIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../providers/ToastProvider';
import { useLoan } from '../../providers/LoanProvider';

// Componentes
import LoanSummaryCard from './LoanSummaryCard';
import LoanPolicyAlert from './LoanPolicyAlert';
import LoanTable from './LoanTable';
import RequestLoanDialog from './RequestLoanDialog';
import MakePaymentDialog from './MakePaymentDialog';
import LoanDetailDialog from './LoanDetailDialog';

const LoanManagement = ({ caixinha }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [openRequestLoanDialog, setOpenRequestLoanDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openLoanDetailDialog, setOpenLoanDetailDialog] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  
  // Hooks personalizados
  const {
    loans,
    getLoans,
    pendingLoans,
    completedLoans,
    loading,
    createLoan,
    payLoan,
    approveLoanRequest,
    rejectLoanRequest
  } = useLoan();
  
// Garantir que todos os arrays estão definidos
const safeLoans = Array.isArray(loans) ? loans : [];
const safePendingLoans = Array.isArray(pendingLoans) ? pendingLoans : [];
const safeCompletedLoans = Array.isArray(completedLoans) ? completedLoans : [];

  // Calcular métricas financeiras
  const maxLoanValue = caixinha?.saldoTotal ? caixinha.saldoTotal * 0.7 : 0;
  const totalActiveLoans = Array.isArray(safeLoans) 
    ? safeLoans.reduce((sum, loan) => sum + (loan.saldoDevedor || 0), 0)
    : 0;
  const availableFundsForLoans = maxLoanValue - totalActiveLoans;

  // Carregar empréstimos quando o componente montar
  useEffect(() => {
    if (caixinha && caixinha.id) {
      getLoans();
    }
  }, [caixinha, getLoans]);

  // Handlers para ações de empréstimo
  const handleOpenLoanDetail = (loan) => {
    setSelectedLoan(loan);
    setOpenLoanDetailDialog(true);
  };

  const handleOpenPaymentDialog = (loan) => {
    setSelectedLoan(loan);
    setOpenPaymentDialog(true);
  };

  const handleApprove = async (loanId) => {
    try {
      await approveLoanRequest(loanId);
      getLoans(); // Atualizar a lista após aprovação
    } catch (error) {
      console.error('Error approving loan:', error);
    }
  };

  const handleReject = async (loanId) => {
    try {
      await rejectLoanRequest(loanId);
      getLoans(); // Atualizar a lista após rejeição
    } catch (error) {
      console.error('Error rejecting loan:', error);
    }
  };

  // Se empréstimos não estiverem ativados, mostrar mensagem informativa
  if (!caixinha.permiteEmprestimos) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="h6">
            {t('loanManagement.loansNotEnabled')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('loanManagement.contactAdmin')}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {t('loanManagement.title')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenRequestLoanDialog(true)}
            sx={{ borderRadius: 2 }}
          >
            {t('loanManagement.requestLoan')}
          </Button>
        </Box>

        {/* Resumo financeiro */}
        <LoanSummaryCard 
          availableFundsForLoans={availableFundsForLoans}
          activeLoansCount={safeLoans.length}
          totalActiveLoans={totalActiveLoans}
          interestRate={caixinha.valorJuros || 2.5}
          lateFee={caixinha.valorMulta || 10}
        />
        
        {/* Políticas de empréstimo */}
        <LoanPolicyAlert 
          maxLoanValue={maxLoanValue}
          interestRate={caixinha.valorJuros || 2.5}
          lateFee={caixinha.valorMulta || 10}
        />

        {/* Tabs para navegação entre tipos de empréstimos */}
        <Box sx={{ mb: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 'medium',
                minWidth: 120,
              }
            }}
          >
            <Tab 
              icon={<PaymentIcon />} 
              label={`${t('loanManagement.active')} (${safeLoans.length})`}
              iconPosition="start"
            />
            <Tab 
              icon={<ReceiptLongIcon />} 
              label={`${t('loanManagement.pending')} (${safePendingLoans.length})`}
              iconPosition="start"
            />
            <Tab 
              icon={<PaidIcon />} 
              label={`${t('loanManagement.completed')} (${safeCompletedLoans.length})`}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Conteúdo com base na tab selecionada */}
        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && (
            <LoanTable 
              loans={safeLoans}
              type="active"
              onMakePayment={handleOpenPaymentDialog}
              onViewDetails={handleOpenLoanDetail}
              loading={loading}
            />
          )}
          {activeTab === 1 && (
            <LoanTable 
              loans={safePendingLoans}
              type="pending"
              onApprove={handleApprove}
              onReject={handleReject}
              onViewDetails={handleOpenLoanDetail}
              loading={loading}
            />
          )}
          {activeTab === 2 && (
            <LoanTable 
              loans={safeCompletedLoans}
              type="completed"
              onViewDetails={handleOpenLoanDetail}
              loading={loading}
            />
          )}
        </Box>
      </Box>

      {/* Diálogos */}
      <RequestLoanDialog 
        open={openRequestLoanDialog}
        onClose={() => setOpenRequestLoanDialog(false)}
        caixinha={caixinha}
        availableFundsForLoans={availableFundsForLoans}
        onSubmit={(loanData) => createLoan(loanData)}
        loading={loading}
      />

      <MakePaymentDialog 
        open={openPaymentDialog}
        onClose={() => setOpenPaymentDialog(false)}
        loan={selectedLoan}
        onSubmit={(paymentData) => payLoan(selectedLoan?.id, paymentData)}
        loading={loading}
      />

      <LoanDetailDialog 
        open={openLoanDetailDialog}
        onClose={() => setOpenLoanDetailDialog(false)}
        loan={selectedLoan}
        onMakePayment={handleOpenPaymentDialog}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={loading}
      />
    </>
  );
};

export default LoanManagement;