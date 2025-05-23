// src/services/EventActionBridgeService/loanMappings.js
import { serviceLocator } from '../../core/services/BaseService';
import { LOAN_EVENTS } from '../../core/constants/events';
import { LOAN_ACTIONS } from '../../core/constants/actions';

export const setupLoanMappings = (eventBridgeService) => {
  const eventActionBridgeService = eventBridgeService || 
  serviceLocator.get('eventActionBridge');

  eventActionBridgeService.registerMappings([
    // Mapeamento para quando os empréstimos são carregados
    {
      serviceName: 'loans',
      eventType: LOAN_EVENTS.LOANS_FETCHED,
      actionType: LOAN_ACTIONS.FETCH_SUCCESS,
      transformer: (eventData) => ({
        loans: eventData.loans || [],
        caixinhaId: eventData.caixinhaId,
        count: eventData.count,
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para quando detalhes de um empréstimo são carregados
    {
      serviceName: 'loans',
      eventType: LOAN_EVENTS.LOAN_DETAILS_FETCHED,
      actionType: LOAN_ACTIONS.UPDATE_LOAN_DETAILS,
      transformer: (eventData) => ({
        loan: eventData.loan,
        caixinhaId: eventData.caixinhaId,
        loanId: eventData.loanId,
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para quando um empréstimo é criado
    {
      serviceName: 'loans',
      eventType: LOAN_EVENTS.LOAN_CREATED,
      actionType: LOAN_ACTIONS.UPDATE_LOANS,
      transformer: (eventData) => ({
        loan: eventData.loan,
        caixinhaId: eventData.caixinhaId,
        requiresDispute: eventData.requiresDispute,
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para quando um pagamento é feito
    {
      serviceName: 'loans',
      eventType: LOAN_EVENTS.LOAN_PAYMENT_MADE,
      actionType: LOAN_ACTIONS.UPDATE_LOAN_DETAILS,
      transformer: (eventData) => ({
        payment: eventData.payment,
        caixinhaId: eventData.caixinhaId,
        loanId: eventData.loanId,
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para quando um empréstimo é aprovado
    {
      serviceName: 'loans',
      eventType: LOAN_EVENTS.LOAN_APPROVED,
      actionType: LOAN_ACTIONS.UPDATE_LOAN_DETAILS,
      transformer: (eventData) => ({
        loan: eventData.loan,
        caixinhaId: eventData.caixinhaId,
        loanId: eventData.loanId,
        status: 'aprovado',
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para quando um empréstimo é rejeitado
    {
      serviceName: 'loans',
      eventType: LOAN_EVENTS.LOAN_REJECTED,
      actionType: LOAN_ACTIONS.UPDATE_LOAN_DETAILS,
      transformer: (eventData) => ({
        loan: eventData.loan,
        caixinhaId: eventData.caixinhaId,
        loanId: eventData.loanId,
        reason: eventData.reason,
        status: 'rejeitado',
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Estado de loading para ações que iniciam
    {
      serviceName: 'loans',
      eventType: LOAN_EVENTS.FETCH_START,
      actionType: LOAN_ACTIONS.FETCH_START,
      transformer: (eventData) => ({
        loading: true,
        error: null,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para erros
    {
      serviceName: 'loans',
      eventType: LOAN_EVENTS.FETCH_FAILURE,
      actionType: LOAN_ACTIONS.FETCH_FAILURE,
      transformer: (eventData) => ({
        error: eventData.error,
        errorDetails: eventData.errorDetails,
        loading: false,
        timestamp: eventData.timestamp || Date.now()
      })
    }
  ]);
  
  console.log('[LoanMappings] Loan mappings registered successfully');
};