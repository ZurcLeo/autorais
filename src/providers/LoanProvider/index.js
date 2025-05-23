// src/providers/LoanProvider/index.js
import React, { createContext, useContext, useReducer, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { LOAN_ACTIONS } from '../../core/constants/actions';
import { LOAN_EVENTS } from '../../core/constants/events';
import { serviceEventHub, serviceLocator } from '../../core/services/BaseService';
import { initialLoanState } from '../../core/constants/initialState';
import { loanReducer } from '../../reducers/loan/loanReducer';
import { useToast } from '../ToastProvider';
import { useTranslation } from 'react-i18next';
import { LOG_LEVELS } from '../../core/constants/config';
import { coreLogger } from '../../core/logging';

const MODULE_NAME = 'LoanProvider';
const LoanContext = createContext();

export const LoanProvider = ({ children }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  
  // Estado local usando useReducer
  const [state, dispatch] = useReducer(loanReducer, initialLoanState);
  const [eventListeners, setEventListeners] = useState([]);
  const [serviceError, setServiceError] = useState();

  // Cache para armazenar empréstimos por caixinhaId
  const loansCache = useRef({});
  const loanDetailsCache = useRef({});

  // Obter serviços necessários
  let loanService;
  let caixinhaService;
  let serviceStore;
  try {
    loanService = serviceLocator.get('loans');
    caixinhaService = serviceLocator.get('caixinhas');
    serviceStore = serviceLocator.get('store').getState()?.auth;
  } catch (err) {
    console.warn('Error accessing services:', err);
    setServiceError(err);
  }

  // Obter informações do usuário autenticado
  const { currentUser } = serviceStore || {};
  const userId = currentUser?.uid;

  // Registrar listeners de eventos
  useEffect(() => {
    if (!currentUser) return;

    // Listener para quando empréstimos são carregados
    const loansFetchedListener = serviceEventHub.on(
      'loans',
      LOAN_EVENTS.LOANS_FETCHED,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Loans fetched event received', {
          caixinhaId: data.caixinhaId,
          count: data.loans?.length || 0
        });
        
        // Atualizar o cache de empréstimos para esta caixinha
        if (data.caixinhaId && data.loans) {
          loansCache.current[data.caixinhaId] = data.loans;
        }
        
        dispatch({
          type: LOAN_ACTIONS.FETCH_SUCCESS,
          payload: {
            loans: data.loans,
            caixinhaId: data.caixinhaId
          }
        });
      }
    );

    // Listener para quando detalhes de um empréstimo são carregados
    const loanDetailsFetchedListener = serviceEventHub.on(
      'loans',
      LOAN_EVENTS.LOAN_DETAILS_FETCHED,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Loan details fetched event received', {
          caixinhaId: data.caixinhaId,
          loanId: data.loanId
        });
        
        // Atualizar o cache de detalhes do empréstimo
        if (data.loanId && data.loan) {
          loanDetailsCache.current[`${data.caixinhaId}-${data.loanId}`] = data.loan;
        }
        
        dispatch({
          type: LOAN_ACTIONS.UPDATE_LOAN_DETAILS,
          payload: {
            loan: data.loan,
            loanId: data.loanId,
            caixinhaId: data.caixinhaId
          }
        });
      }
    );

    // Listener para quando um empréstimo é criado
    const loanCreatedListener = serviceEventHub.on(
      'loans',
      LOAN_EVENTS.LOAN_CREATED,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Loan created event received', {
          caixinhaId: data.caixinhaId,
          loanId: data.loan?.id
        });
        
        // Invalidar o cache de empréstimos para esta caixinha
        if (data.caixinhaId) {
          delete loansCache.current[data.caixinhaId];
        }
        
        dispatch({
          type: LOAN_ACTIONS.UPDATE_LOANS,
          payload: {
            loan: data.loan,
            caixinhaId: data.caixinhaId,
            requiresDispute: data.requiresDispute
          }
        });
      }
    );

    // Listener para quando um pagamento é feito
    const loanPaymentMadeListener = serviceEventHub.on(
      'loans',
      LOAN_EVENTS.LOAN_PAYMENT_MADE,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Loan payment made event received', {
          caixinhaId: data.caixinhaId,
          loanId: data.loanId
        });
        
        // Invalidar cache
        if (data.caixinhaId) {
          delete loansCache.current[data.caixinhaId];
          if (data.loanId) {
            delete loanDetailsCache.current[`${data.caixinhaId}-${data.loanId}`];
          }
        }
      }
    );

    // Listener para quando um empréstimo é aprovado
    const loanApprovedListener = serviceEventHub.on(
      'loans',
      LOAN_EVENTS.LOAN_APPROVED,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Loan approved event received', {
          caixinhaId: data.caixinhaId,
          loanId: data.loanId
        });
        
        // Invalidar cache
        if (data.caixinhaId) {
          delete loansCache.current[data.caixinhaId];
          if (data.loanId) {
            delete loanDetailsCache.current[`${data.caixinhaId}-${data.loanId}`];
          }
        }
      }
    );

    // Listener para quando um empréstimo é rejeitado
    const loanRejectedListener = serviceEventHub.on(
      'loans',
      LOAN_EVENTS.LOAN_REJECTED,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Loan rejected event received', {
          caixinhaId: data.caixinhaId,
          loanId: data.loanId
        });
        
        // Invalidar cache
        if (data.caixinhaId) {
          delete loansCache.current[data.caixinhaId];
          if (data.loanId) {
            delete loanDetailsCache.current[`${data.caixinhaId}-${data.loanId}`];
          }
        }
      }
    );

    // Armazenar os listeners para limpeza posterior
    setEventListeners([
      loansFetchedListener,
      loanDetailsFetchedListener,
      loanCreatedListener,
      loanPaymentMadeListener,
      loanApprovedListener,
      loanRejectedListener
    ]);

    // Função de cleanup para remover os listeners
    return () => {
      eventListeners.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [currentUser]);

  // Função para buscar empréstimos de uma caixinha específica
  const fetchLoans = useCallback(async (caixinhaId) => {
    if (!caixinhaId || !currentUser || !loanService) {
      return [];
    }

    dispatch({ type: LOAN_ACTIONS.FETCH_START });
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Fetching loans', { caixinhaId });
    
    try {
      // Verificar cache
      if (loansCache.current[caixinhaId]) {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Using cached loans data', {
          caixinhaId,
          count: loansCache.current[caixinhaId].length
        });
        
        dispatch({
          type: LOAN_ACTIONS.FETCH_SUCCESS,
          payload: {
            loans: loansCache.current[caixinhaId],
            caixinhaId
          }
        });
        
        return loansCache.current[caixinhaId];
      }

      // Buscar empréstimos do serviço
      const response = await loanService.getLoans(caixinhaId);
      
      // Atualizar o cache
      if (response.data) {
        loansCache.current[caixinhaId] = response.data;
      }
      
      return response.data;
      
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to fetch loans', {
        caixinhaId,
        error: error.message
      });
      
      dispatch({ 
        type: LOAN_ACTIONS.FETCH_FAILURE, 
        payload: {
          error: error.message,
          caixinhaId
        }
      });
      
      // Mostrar mensagem de erro
      showToast(t('errors.fetchLoansError'), { type: 'error' });
      
      throw error;
    }
  }, [currentUser, loanService, t, showToast]);

  // Função para buscar detalhes de um empréstimo específico
  const getLoanById = useCallback(async (caixinhaId, loanId) => {
    if (!caixinhaId || !loanId || !currentUser || !loanService) {
      return null;
    }

    dispatch({ type: LOAN_ACTIONS.FETCH_START });
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Fetching loan details', { caixinhaId, loanId });
    
    try {
      // Verificar cache
      const cacheKey = `${caixinhaId}-${loanId}`;
      if (loanDetailsCache.current[cacheKey]) {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Using cached loan details', {
          caixinhaId,
          loanId
        });
        
        dispatch({
          type: LOAN_ACTIONS.UPDATE_LOAN_DETAILS,
          payload: {
            loan: loanDetailsCache.current[cacheKey],
            loanId,
            caixinhaId
          }
        });
        
        return loanDetailsCache.current[cacheKey];
      }

      // Buscar detalhes do empréstimo
      const response = await loanService.getLoanById(caixinhaId, loanId);
      
      // Atualizar o cache
      if (response.data) {
        loanDetailsCache.current[cacheKey] = response.data;
      }
      
      return response.data;
      
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to fetch loan details', {
        caixinhaId,
        loanId,
        error: error.message
      });
      
      dispatch({ 
        type: LOAN_ACTIONS.FETCH_FAILURE, 
        payload: {
          error: error.message,
          caixinhaId,
          loanId
        }
      });
      
      // Mostrar mensagem de erro
      showToast(t('errors.loanDetailsError'), { type: 'error' });
      
      throw error;
    }
  }, [currentUser, loanService, t, showToast]);

  // Função para solicitar empréstimo
  const requestLoan = useCallback(async (caixinhaId, loanData) => {
    if (!caixinhaId || !currentUser || !loanService) {
      showToast(t('errors.notAuthenticated'), { type: 'error' });
      return null;
    }

    dispatch({ type: LOAN_ACTIONS.FETCH_START });
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Requesting loan', { 
      caixinhaId, 
      userId: loanData.userId || userId,
      valor: loanData.valor
    });
    
    try {
      // Garantir que o userId está definido
      const enrichedData = {
        ...loanData,
        userId: loanData.userId || userId
      };
      
      // Solicitar empréstimo
      const result = await loanService.requestLoan(caixinhaId, enrichedData);
      
      // Invalidar cache
      delete loansCache.current[caixinhaId];
      
      // Mostrar mensagem de sucesso
      if (result.requiresDispute) {
        showToast(t('loanManagement.loanDisputeCreated'), { type: 'info' });
      } else {
        showToast(t('loanManagement.loanRequestSuccess'), { type: 'success' });
      }
      
      return result;
      
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to request loan', {
        caixinhaId,
        error: error.message
      });
      
      dispatch({ 
        type: LOAN_ACTIONS.FETCH_FAILURE, 
        payload: {
          error: error.message,
          caixinhaId
        }
      });
      
      showToast(t('errors.loanRequestError'), { type: 'error' });
      throw error;
    }
  }, [currentUser, userId, loanService, t, showToast]);

  // Função para realizar pagamento
  const makePayment = useCallback(async (caixinhaId, loanId, paymentData) => {
    if (!caixinhaId || !loanId || !currentUser || !loanService) {
      showToast(t('errors.notAuthenticated'), { type: 'error' });
      return null;
    }

    dispatch({ type: LOAN_ACTIONS.FETCH_START });
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Making loan payment', { 
      caixinhaId, 
      loanId,
      valor: paymentData.valor
    });
    
    try {
      // Realizar pagamento
      const result = await loanService.makePayment(caixinhaId, loanId, {
        ...paymentData,
        userId: userId // Adicionar userId ao pagamento
      });
      
      // Invalidar cache
      delete loansCache.current[caixinhaId];
      delete loanDetailsCache.current[`${caixinhaId}-${loanId}`];
      
      showToast(t('loanManagement.paymentSuccess'), { type: 'success' });
      
      return result;
      
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to make payment', {
        caixinhaId,
        loanId,
        error: error.message
      });
      
      dispatch({ 
        type: LOAN_ACTIONS.FETCH_FAILURE, 
        payload: {
          error: error.message,
          caixinhaId,
          loanId
        }
      });
      
      showToast(t('errors.paymentError'), { type: 'error' });
      throw error;
    }
  }, [currentUser, userId, loanService, t, showToast]);

  // Função para aprovar empréstimo
  const approveLoan = useCallback(async (caixinhaId, loanId) => {
    if (!caixinhaId || !loanId || !currentUser || !loanService) {
      showToast(t('errors.notAuthenticated'), { type: 'error' });
      return null;
    }

    dispatch({ type: LOAN_ACTIONS.FETCH_START });
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Approving loan', { 
      caixinhaId, 
      loanId,
      adminId: userId
    });
    
    try {
      // Aprovar empréstimo
      const result = await loanService.approveLoan(caixinhaId, loanId, userId);
      
      // Invalidar cache
      delete loansCache.current[caixinhaId];
      delete loanDetailsCache.current[`${caixinhaId}-${loanId}`];
      
      showToast(t('loanManagement.approveSuccess'), { type: 'success' });
      
      return result;
      
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to approve loan', {
        caixinhaId,
        loanId,
        error: error.message
      });
      
      dispatch({ 
        type: LOAN_ACTIONS.FETCH_FAILURE, 
        payload: {
          error: error.message,
          caixinhaId,
          loanId
        }
      });
      
      showToast(t('errors.approveError'), { type: 'error' });
      throw error;
    }
  }, [currentUser, userId, loanService, t, showToast]);

  // Função para rejeitar empréstimo
  const rejectLoan = useCallback(async (caixinhaId, loanId, reason) => {
    if (!caixinhaId || !loanId || !currentUser || !loanService) {
      showToast(t('errors.notAuthenticated'), { type: 'error' });
      return null;
    }

    dispatch({ type: LOAN_ACTIONS.FETCH_START });
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Rejecting loan', { 
      caixinhaId, 
      loanId,
      reason
    });
    
    try {
      // Rejeitar empréstimo
      const result = await loanService.rejectLoan(caixinhaId, loanId, userId, reason);
      
      // Invalidar cache
      delete loansCache.current[caixinhaId];
      delete loanDetailsCache.current[`${caixinhaId}-${loanId}`];
      
      showToast(t('loanManagement.rejectSuccess'), { type: 'success' });
      
      return result;
      
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to reject loan', {
        caixinhaId,
        loanId,
        error: error.message
      });
      
      dispatch({ 
        type: LOAN_ACTIONS.FETCH_FAILURE, 
        payload: {
          error: error.message,
          caixinhaId,
          loanId
        }
      });
      
      showToast(t('errors.rejectError'), { type: 'error' });
      throw error;
    }
  }, [currentUser, userId, loanService, t, showToast]);

  // Calcular valores derivados do estado - agora dinâmicos baseados no caixinhaId
  const getActiveLoans = useCallback((caixinhaId) => {
    if (!caixinhaId) return [];
    
    // Se temos empréstimos em cache para esta caixinha
    if (loansCache.current[caixinhaId]) {
      return loansCache.current[caixinhaId].filter(
        loan => loan.status === 'aprovado' && loan.saldoDevedor > 0
      );
    }
    
    // Caso contrário, usar o estado global (pode estar desatualizado)
    if (state.caixinhaId === caixinhaId) {
      return state.loans.filter(
        loan => loan.status === 'aprovado' && loan.saldoDevedor > 0
      );
    }
    
    return [];
  }, [state.loans, state.caixinhaId]);
  
  const getPendingLoans = useCallback((caixinhaId) => {
    if (!caixinhaId) return [];
    
    // Se temos empréstimos em cache para esta caixinha
    if (loansCache.current[caixinhaId]) {
      return loansCache.current[caixinhaId].filter(
        loan => loan.status === 'pendente'
      );
    }
    
    // Caso contrário, usar o estado global (pode estar desatualizado)
    if (state.caixinhaId === caixinhaId) {
      return state.loans.filter(loan => loan.status === 'pendente');
    }
    
    return [];
  }, [state.loans, state.caixinhaId]);
  
  const getCompletedLoans = useCallback((caixinhaId) => {
    if (!caixinhaId) return [];
    
    // Se temos empréstimos em cache para esta caixinha
    if (loansCache.current[caixinhaId]) {
      return loansCache.current[caixinhaId].filter(
        loan => loan.status === 'pago' || (loan.status === 'aprovado' && loan.saldoDevedor === 0)
      );
    }
    
    // Caso contrário, usar o estado global (pode estar desatualizado)
    if (state.caixinhaId === caixinhaId) {
      return state.loans.filter(
        loan => loan.status === 'pago' || (loan.status === 'aprovado' && loan.saldoDevedor === 0)
      );
    }
    
    return [];
  }, [state.loans, state.caixinhaId]);

  // Memoizar o valor do contexto para evitar re-renderizações desnecessárias
  const contextValue = useMemo(() => ({
    // Estado global - não depende de caixinhaId específico
    loans: state.loans,
    loanDetails: state.loanDetails,
    loading: state.loading,
    error: state.error,
    
    // Funções que funcionam com um caixinhaId específico
    getLoans: fetchLoans,
    getLoanById,
    requestLoan,
    makePayment,
    approveLoan,
    rejectLoan,
    
    // Funções de consulta para categorias específicas
    getActiveLoans,
    getPendingLoans, 
    getCompletedLoans,
    
    // Status do serviço
    serviceReady: !!currentUser && !!loanService,
    serviceError,
    
    // Cache
    loansCache: loansCache.current,
    loanDetailsCache: loanDetailsCache.current
  }), [
    // Estado
    state.loans,
    state.loanDetails,
    state.loading,
    state.error,
    
    // Ações
    fetchLoans,
    getLoanById,
    requestLoan,
    makePayment,
    approveLoan,
    rejectLoan,
    
    // Funções de consulta
    getActiveLoans,
    getPendingLoans,
    getCompletedLoans,
    
    // Status do serviço
    currentUser,
    loanService,
    serviceError
  ]);

  return (
    <LoanContext.Provider value={contextValue}>
      {children}
    </LoanContext.Provider>
  );
};

// Hook customizado para acessar o contexto
export const useLoan = () => {
  const context = useContext(LoanContext);

  if (!context) {
    throw new Error('useLoan deve ser usado dentro de um LoanProvider');
  }

  return context;
};