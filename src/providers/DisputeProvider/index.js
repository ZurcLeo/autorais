// src/providers/DisputeProvider/index.js
import React, { createContext, useRef, useContext, useReducer, useState, useMemo, useCallback, useEffect } from 'react';
import { DISPUTE_ACTIONS } from '../../core/constants/actions';
import { DISPUTE_EVENTS } from '../../core/constants/events';
import { serviceEventHub, serviceLocator } from '../../core/services/BaseService';
import { initialDisputeState } from '../../core/constants/initialState';
import { disputeReducer } from '../../reducers/dispute/disputeReducer';
import { useToast } from '../ToastProvider';
import { LOG_LEVELS } from '../../core/constants/config';
import { coreLogger } from '../../core/logging';
import { globalCache } from '../../utils/cache/cacheManager';
import { useTranslation } from 'react-i18next';

const MODULE_NAME = 'DisputeProvider';
const DisputeContext = createContext();

export const DisputeProvider = ({ children }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [state, dispatch] = useReducer(disputeReducer, initialDisputeState);
  const [eventListeners, setEventListeners] = useState([]);
  const [serviceError, setServiceError] = useState();

  const disputesCache = useRef({});
  const disputeDetailsCache = useRef({});

  // Acessar serviços
  let disputeService;
  let serviceStore;
  try {
    disputeService = serviceLocator.get('disputes');
    serviceStore = serviceLocator.get('store').getState()?.auth;
  } catch (err) {
    console.warn('Error accessing services:', err);
    setServiceError(err);
  }

  // Obter informações do usuário atual
  const { currentUser } = serviceStore || {};
  const userId = currentUser?.uid;

  // Método para buscar disputas
  const getDisputes = useCallback(async (caixinhaId, status = 'all') => {
    if (!caixinhaId || !currentUser) {
      return [];
    }

    dispatch({ type: DISPUTE_ACTIONS.FETCH_START });
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Fetching disputes', { caixinhaId, status });
    
    try {
      // Verificar cache
      const cacheKey = `disputes:${caixinhaId}:${status}`;
      const cachedData = globalCache.getItem(cacheKey);
      disputesCache.current[cacheKey] = disputesData;

      if (cachedData && Date.now() - cachedData.timestamp < 2 * 60 * 1000) { // Cache de 2 minutos
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Using cached disputes data', {
          caixinhaId,
          status,
          cacheAge: Date.now() - cachedData.timestamp
        });
        
        dispatch({
          type: DISPUTE_ACTIONS.FETCH_SUCCESS,
          payload: {
            disputes: cachedData.data,
            count: cachedData.data.length,
            status
          }
        });
        return cachedData.data;
      }

      // Buscar novos dados
      const disputesData = await disputeService.getDisputes(caixinhaId, status);
      
      // Atualizar cache
      globalCache.setItem(cacheKey, { 
        data: disputesData, 
        timestamp: Date.now() 
      });
      
      return disputesData;

    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to fetch disputes', {
        caixinhaId,
        error: error.message
      });
      
      dispatch({ 
        type: DISPUTE_ACTIONS.FETCH_FAILURE, 
        payload: { error: error.message } 
      });
      
      showToast(t('disputes.errorFetchingDisputes'), { type: 'error' });
      throw error;
    }
  }, [currentUser, t, showToast]);

  // Registrar listeners de eventos
  useEffect(() => {
    if (!currentUser) return;

    // Listener para quando disputas são carregadas
    const disputesFetchedListener = serviceEventHub.on(
      'disputes',
      DISPUTE_EVENTS.DISPUTES_FETCHED,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Disputes fetched event received', {
          caixinhaId: data.caixinhaId,
          count: data.disputes?.length || 0
        });
        
        if (data.caixinhaId) {
          dispatch({
            type: DISPUTE_ACTIONS.FETCH_SUCCESS,
            payload: {
              disputes: data.disputes,
              count: data.count,
              status: data.status
            }
          });
        }
      }
    );

    // Listener para quando detalhes de uma disputa são carregados
    const disputeDetailsFetchedListener = serviceEventHub.on(
      'disputes',
      DISPUTE_EVENTS.DISPUTE_DETAILS_FETCHED,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Dispute details fetched event received', {
          caixinhaId: data.caixinhaId,
          disputeId: data.disputeId
        });
        
        if (data.caixinhaId) {
          dispatch({
            type: DISPUTE_ACTIONS.UPDATE_DISPUTE_DETAILS,
            payload: {
              dispute: data.dispute,
              disputeId: data.disputeId
            }
          });
        }
      }
    );

    // Listener para quando uma disputa é criada
    const disputeCreatedListener = serviceEventHub.on(
      'disputes',
      DISPUTE_EVENTS.DISPUTE_CREATED,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Dispute created event received', {
          caixinhaId: data.caixinhaId,
          disputeId: data.dispute?.id
        });
        
        if (data.caixinhaId) {
          dispatch({
            type: DISPUTE_ACTIONS.UPDATE_DISPUTES,
            payload: {
              dispute: data.dispute
            }
          });
          
          // Atualizar a lista completa
        getDisputes();
        }
      }
    );

    // Listener para quando um voto é registrado
    const disputeVotedListener = serviceEventHub.on(
      'disputes',
      DISPUTE_EVENTS.DISPUTE_VOTED,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Dispute vote event received', {
          caixinhaId: data.caixinhaId,
          disputeId: data.disputeId
        });
        
        if (data.caixinhaId) {
          dispatch({
            type: DISPUTE_ACTIONS.UPDATE_DISPUTE_DETAILS,
            payload: {
              dispute: data.result,
              disputeId: data.disputeId
            }
          });
          
          // Atualizar a lista completa para refletir possíveis mudanças de status
          getDisputes();
        }
      }
    );

    // Listener para quando uma disputa é cancelada
    const disputeCanceledListener = serviceEventHub.on(
      'disputes',
      DISPUTE_EVENTS.DISPUTE_CANCELED,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Dispute canceled event received', {
          caixinhaId: data.caixinhaId,
          disputeId: data.disputeId
        });
        
        if (data.caixinhaId) {
          dispatch({
            type: DISPUTE_ACTIONS.UPDATE_DISPUTE_DETAILS,
            payload: {
              dispute: data.result,
              disputeId: data.disputeId
            }
          });
          
          // Atualizar a lista completa
          getDisputes();
        }
      }
    );

    // Armazenar os listeners para limpeza posterior
    setEventListeners([
      disputesFetchedListener,
      disputeDetailsFetchedListener,
      disputeCreatedListener,
      disputeVotedListener,
      disputeCanceledListener
    ]);

    // Função de cleanup para remover os listeners
    return () => {
      eventListeners.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [currentUser, userId, getDisputes]);

  // Método para buscar uma disputa específica
  const getDisputeById = useCallback(async (caixinhaId, disputeId) => {
    if (!caixinhaId || !disputeId || !currentUser) {
      return null;
    }

    dispatch({ type: DISPUTE_ACTIONS.FETCH_START });
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Fetching dispute details', { caixinhaId, disputeId });
    
    try {
      // Verificar cache
      const cacheKey = `disputes:${caixinhaId}:dispute:${disputeId}`;
      const cachedData = globalCache.getItem(cacheKey);

      if (cachedData && Date.now() - cachedData.timestamp < 1 * 60 * 1000) { // Cache de 1 minuto
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Using cached dispute details', {
          caixinhaId,
          disputeId,
          cacheAge: Date.now() - cachedData.timestamp
        });
        
        dispatch({
          type: DISPUTE_ACTIONS.UPDATE_DISPUTE_DETAILS,
          payload: {
            dispute: cachedData.data,
            disputeId
          }
        });
        return cachedData.data;
      }

      // Buscar novos dados
      const disputeData = await disputeService.getDisputeById(caixinhaId, disputeId);
      
      // Atualizar cache
      globalCache.setItem(cacheKey, { 
        data: disputeData, 
        timestamp: Date.now() 
      });
      
      return disputeData;

    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to fetch dispute details', {
        caixinhaId,
        disputeId,
        error: error.message
      });
      
      dispatch({ 
        type: DISPUTE_ACTIONS.FETCH_FAILURE, 
        payload: { error: error.message } 
      });
      
      showToast(t('disputes.errorFetchingDisputeDetails'), { type: 'error' });
      throw error;
    }
  }, [currentUser, t, showToast]);

  // Método para criar disputa
  const createDispute = useCallback(async (caixinhaId, disputeData) => {
    if (!caixinhaId || !currentUser) {
      showToast(t('disputes.userNotAuthenticated'), { type: 'error' });
      return null;
    }

    dispatch({ type: DISPUTE_ACTIONS.FETCH_START });
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Creating dispute', { caixinhaId, type: disputeData.type });
    
    try {
      // Criar disputa via serviço
      const dispute = await disputeService.createDispute(caixinhaId, {
        ...disputeData,
        proposedBy: userId
      });
      
      // Invalidar cache
      globalCache.remove(`disputes:${caixinhaId}:all`);
      globalCache.remove(`disputes:${caixinhaId}:active`);
      
      showToast(t('disputes.disputeCreatedSuccess'), { type: 'success' });
      return dispute;
      
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to create dispute', {
        caixinhaId,
        error: error.message
      });
      
      dispatch({ 
        type: DISPUTE_ACTIONS.FETCH_FAILURE, 
        payload: { error: error.message } 
      });
      
      showToast(t('disputes.errorCreatingDispute'), { type: 'error' });
      throw error;
    }
  }, [currentUser, userId, t, showToast]);

  // Método para votar em uma disputa
  const voteOnDispute = useCallback(async (caixinhaId, disputeId, vote, comment = '') => {
    if (!caixinhaId || !disputeId || !currentUser) {
      showToast(t('disputes.userNotAuthenticated'), { type: 'error' });
      return null;
    }

    dispatch({ type: DISPUTE_ACTIONS.FETCH_START });
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Voting on dispute', { 
      caixinhaId, 
      disputeId,
      vote
    });
    
    try {
      // Registrar voto via serviço
      const result = await disputeService.voteOnDispute(caixinhaId, disputeId, {
        userId,
        vote,
        comment
      });
      
      // Invalidar cache
      globalCache.remove(`disputes:${caixinhaId}:all`);
      globalCache.remove(`disputes:${caixinhaId}:active`);
      globalCache.remove(`disputes:${caixinhaId}:dispute:${disputeId}`);
      
      showToast(t('disputes.voteRegisteredSuccess'), { type: 'success' });
      return result;
      
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to vote on dispute', {
        caixinhaId,
        disputeId,
        error: error.message
      });
      
      dispatch({ 
        type: DISPUTE_ACTIONS.FETCH_FAILURE, 
        payload: { error: error.message } 
      });
      
      showToast(t('disputes.errorVotingDispute'), { type: 'error' });
      throw error;
    }
  }, [currentUser, userId, t, showToast]);

  // Método para cancelar disputa
  const cancelDispute = useCallback(async (caixinhaId, disputeId, reason = '') => {
    if (!caixinhaId || !disputeId || !currentUser) {
      showToast(t('disputes.userNotAuthenticated'), { type: 'error' });
      return null;
    }

    dispatch({ type: DISPUTE_ACTIONS.FETCH_START });
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Canceling dispute', { 
      caixinhaId, 
      disputeId,
      reason
    });
    
    try {
      // Cancelar disputa via serviço
      const result = await disputeService.cancelDispute(caixinhaId, disputeId, reason);
      
      // Invalidar cache
      globalCache.remove(`disputes:${caixinhaId}:all`);
      globalCache.remove(`disputes:${caixinhaId}:active`);
      globalCache.remove(`disputes:${caixinhaId}:dispute:${disputeId}`);
      
      showToast(t('disputes.disputeCanceledSuccess'), { type: 'success' });
      return result;
      
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to cancel dispute', {
        caixinhaId,
        disputeId,
        error: error.message
      });
      
      dispatch({ 
        type: DISPUTE_ACTIONS.FETCH_FAILURE, 
        payload: { error: error.message } 
      });
      
      showToast(t('disputes.errorCancelingDispute'), { type: 'error' });
      throw error;
    }
  }, [currentUser, t, showToast]);

  // Método para verificar requisito de disputa
  const checkDisputeRequirement = useCallback(async (caixinhaId, changeType) => {
    if (!caixinhaId || !currentUser) {
      return { requiresDispute: true, reason: 'DEFAULT_POLICY' };
    }

    try {
      return await disputeService.checkDisputeRequirement(caixinhaId, changeType);
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to check dispute requirement', {
        caixinhaId,
        changeType,
        error: error.message
      });
      
      // Em caso de erro, assumir que é necessário disputa para garantir
      return { requiresDispute: true, reason: 'ERROR_CHECKING' };
    }
  }, [currentUser]);

  // Método para criar disputa de alteração de regras
  const createRuleChangeDispute = useCallback(async (caixinhaId, currentRules, proposedRules, title, description) => {
    if (!caixinhaId || !currentUser) {
      showToast(t('disputes.userNotAuthenticated'), { type: 'error' });
      return null;
    }

    dispatch({ type: DISPUTE_ACTIONS.FETCH_START });
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Creating rule change dispute', { 
      caixinhaId, 
      title
    });
    
    try {
      // Criar disputa via serviço
      const dispute = await disputeService.createRuleChangeDispute(
        caixinhaId, 
        currentRules, 
        proposedRules, 
        title, 
        description
      );
      
      // Invalidar cache
      globalCache.remove(`disputes:${caixinhaId}:all`);
      globalCache.remove(`disputes:${caixinhaId}:active`);
      
      showToast(t('disputes.ruleChangeDisputeCreatedSuccess'), { type: 'success' });
      return dispute;
      
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to create rule change dispute', {
        caixinhaId,
        error: error.message
      });
      
      dispatch({ 
        type: DISPUTE_ACTIONS.FETCH_FAILURE, 
        payload: { error: error.message } 
      });
      
      showToast(t('disputes.errorCreatingRuleChangeDispute'), { type: 'error' });
      throw error;
    }
  }, [currentUser, t, showToast]);

  // Inicialização - Carregar disputas quando o provider for montado com caixinhaId
  useEffect(() => {
    if (currentUser) {
      getDisputes();
    } else {
      dispatch({ type: DISPUTE_ACTIONS.CLEAR_STATE });
    }
  }, [currentUser, getDisputes]);

  // Memoizar o valor do contexto para evitar re-renderizações desnecessárias
  const contextValue = useMemo(() => ({
    // Estado
    disputes: state.disputes,
    activeDisputes: state.activeDisputes,
    resolvedDisputes: state.resolvedDisputes,
    loanDisputes: state.loanDisputes,
    currentDispute: state.currentDispute,
    disputeStats: state.disputeStats,
    loading: state.loading,
    error: state.error,

    // Status do serviço
    serviceReady: currentUser,
    serviceError,

    // Ações
    getDisputes,
    getDisputeById,
    createDispute,
    voteOnDispute,
    cancelDispute,
    checkDisputeRequirement,
    createRuleChangeDispute,
    refreshDisputes: () => getDisputes()
  }), [
    // Estado
    state.disputes,
    state.activeDisputes,
    state.resolvedDisputes,
    state.loanDisputes,
    state.currentDispute,
    state.disputeStats,
    state.loading,
    state.error,

    // Status do serviço
    currentUser,
    serviceError,

    // Ações
    getDisputes,
    getDisputeById,
    createDispute,
    voteOnDispute,
    cancelDispute,
    checkDisputeRequirement,
    createRuleChangeDispute
  ]);

  // Renderizar o context provider
  return (
    <DisputeContext.Provider value={contextValue}>
      {children}
    </DisputeContext.Provider>
  );
};

// Hook customizado para acessar o contexto
export const useDispute = () => {
  const context = useContext(DisputeContext);

  if (!context) {
    throw new Error('useDispute deve ser usado dentro de um DisputeProvider');
  }

  return context;
};