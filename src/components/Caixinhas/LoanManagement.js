// src/components/Loans/LoanManagement.js
import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Tabs, Tab, Card, CardContent, Chip } from '@mui/material';
import { Add as AddIcon, Payment as PaymentIcon, ReceiptLong as ReceiptLongIcon, Paid as PaidIcon, Gavel as GavelIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../providers/ToastProvider';
import { useLoan } from '../../providers/LoanProvider';
import { useDispute } from '../../providers/DisputeProvider';

// Componentes
import LoanSummaryCard from './LoanSummaryCard';
import LoanPolicyAlert from './LoanPolicyAlert';
import LoanTable from './LoanTable';
import RequestLoanDialog from './RequestLoanDialog';
import MakePaymentDialog from './MakePaymentDialog';
import LoanDetailDialog from './LoanDetailDialog';
import DisputeDetailDialog from './DisputeDetailDialog';

const LoanManagement = ({ caixinha }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [openRequestLoanDialog, setOpenRequestLoanDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openLoanDetailDialog, setOpenLoanDetailDialog] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [openDisputeDialog, setOpenDisputeDialog] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  
  // Hooks personalizados
  const {
    loans,
    getLoans,
    loading,
    requestLoan,
    makePayment,
    approveLoan,
    rejectLoan,
    getActiveLoans,
    getPendingLoans,
    getCompletedLoans
  } = useLoan();

  // Hook de disputas
  const {
    loanDisputes,
    checkDisputeRequirement,
    createDispute,
    getDisputes,
    loading: disputeLoading
  } = useDispute();
  
// Garantir que todos os arrays estão definidos usando as funções do provider
const safeLoans = Array.isArray(getActiveLoans(caixinha?.id)) ? getActiveLoans(caixinha?.id) : [];
const safePendingLoans = Array.isArray(getPendingLoans(caixinha?.id)) ? getPendingLoans(caixinha?.id) : [];
const safeCompletedLoans = Array.isArray(getCompletedLoans(caixinha?.id)) ? getCompletedLoans(caixinha?.id) : [];
const safeLoanDisputes = Array.isArray(loanDisputes) ? loanDisputes : [];

  // Calcular métricas financeiras
  const maxLoanValue = caixinha?.saldoTotal ? caixinha.saldoTotal * 0.7 : 0;
  const totalActiveLoans = Array.isArray(safeLoans) 
    ? safeLoans.reduce((sum, loan) => sum + (loan.saldoDevedor || 0), 0)
    : 0;
  const availableFundsForLoans = maxLoanValue - totalActiveLoans;

  // Carregar empréstimos e disputas quando o componente montar
  useEffect(() => {
    if (caixinha && caixinha.id) {
      getLoans(caixinha.id);
      getDisputes(caixinha.id, 'all');
    }
  }, [caixinha, getLoans, getDisputes]);

  // Handlers para ações de empréstimo
  const handleOpenLoanDetail = (loan) => {
    setSelectedLoan(loan);
    setOpenLoanDetailDialog(true);
  };

  const handleOpenPaymentDialog = (loan) => {
    setSelectedLoan(loan);
    setOpenPaymentDialog(true);
  };

  const handleOpenDispute = (dispute) => {
    setSelectedDispute(dispute);
    setOpenDisputeDialog(true);
  };

  const handleCreateLoanDispute = async (loanData) => {
    try {
      const disputeRequirement = await checkDisputeRequirement(caixinha.id, 'LOAN_APPROVAL');
      
      if (disputeRequirement.requiresDispute) {
        const dispute = await createDispute(caixinha.id, {
          type: 'LOAN_APPROVAL',
          title: `Aprovação de Empréstimo - R$ ${loanData.valor}`,
          description: `Solicitação de empréstimo de R$ ${loanData.valor} em ${loanData.parcelas} parcelas. Motivo: ${loanData.motivo}`,
          proposedChanges: {
            loan: loanData
          }
        });
        
        showToast('Disputa criada para aprovação do empréstimo', { type: 'success' });
        return dispute;
      } else {
        return await requestLoan(caixinha.id, loanData);
      }
    } catch (error) {
      console.error('Error handling loan request:', error);
      throw error;
    }
  };

  const handleApprove = async (loanId) => {
    try {
      await approveLoan(caixinha.id, loanId);
      getLoans(caixinha.id); // Atualizar a lista após aprovação
    } catch (error) {
      console.error('Error approving loan:', error);
    }
  };

  const handleReject = async (loanId) => {
    try {
      await rejectLoan(caixinha.id, loanId);
      getLoans(caixinha.id); // Atualizar a lista após rejeição
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
            <Tab 
              icon={<GavelIcon />} 
              label={`Disputas (${safeLoanDisputes.length})`}
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
          {activeTab === 3 && (
            <Box>
              {safeLoanDisputes.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <GavelIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Nenhuma disputa de empréstimo
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Disputas de aprovação de empréstimo aparecerão aqui
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {safeLoanDisputes.map((dispute) => (
                    <Card key={dispute.id} sx={{ mb: 2, borderLeft: '4px solid', borderLeftColor: 'primary.main' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="h6">
                              {dispute.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {dispute.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Chip size="small" label={dispute.status} color="primary" />
                              <Chip size="small" label="Empréstimo" variant="outlined" />
                            </Box>
                          </Box>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleOpenDispute(dispute)}
                          >
                            Ver Detalhes
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Diálogos */}
      <RequestLoanDialog 
        open={openRequestLoanDialog}
        onClose={() => setOpenRequestLoanDialog(false)}
        caixinha={caixinha}
        availableFundsForLoans={availableFundsForLoans}
        onSubmit={handleCreateLoanDispute}
        loading={loading}
      />

      <MakePaymentDialog 
        open={openPaymentDialog}
        onClose={() => setOpenPaymentDialog(false)}
        loan={selectedLoan}
        onSubmit={(paymentData) => makePayment(caixinha.id, selectedLoan?.id, paymentData)}
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

      <DisputeDetailDialog
        open={openDisputeDialog}
        onClose={() => setOpenDisputeDialog(false)}
        dispute={selectedDispute}
        caixinha={caixinha}
        currentUserId={caixinha?.currentUserId}
      />
    </>
  );
};

export default LoanManagement;