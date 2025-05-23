
// src/providers/CaixinhaProvider/index.js
import React, { createContext, useContext, useReducer, useState, useMemo, useCallback, useEffect } from 'react';
import { CAIXINHA_ACTIONS } from '../../core/constants/actions';
import { CAIXINHA_EVENTS } from '../../core/constants/events';
import { serviceEventHub, serviceLocator } from '../../core/services/BaseService.js';
import { CAIXINHA_CACHE_CONFIG } from '../../core/constants/config';
import { initialCaixinhaState } from '../../core/constants/initialState';
import { caixinhaReducer } from '../../reducers/caixinha/caixinhaReducer';
import { useToast } from '../ToastProvider';
import { globalCache } from '../../utils/cache/cacheManager';
import { validateCaixinhaData } from '../../utils/validation';
import useProcessCaixinhaData from '../../hooks/caixinha/useProcessCaixinhaData';
import { LOG_LEVELS } from '../../core/constants/config';
import { coreLogger } from '../../core/logging';

const MODULE_NAME = 'CaixinhaProvider';
const CaixinhaContext = createContext();

export const CaixinhaProvider = ({ children }) => {
  // const { showToast } = useToast();
  const [state, dispatch] = useReducer(caixinhaReducer, initialCaixinhaState);
  const processCaixinhaData = useProcessCaixinhaData();
  const [eventListeners, setEventListeners] = useState([]);

  const [caixinhasError, setCaixinhasError] = useState()

  let caixinhaService;
   let serviceStore;
   let serviceCai;
   try {
    caixinhaService = serviceLocator.get('caixinhas');
     serviceStore = serviceLocator.get('store').getState()?.auth;
     serviceCai = serviceLocator.get('store').getState()?.caixinhas;
 
   } catch (err) {
     console.warn('Error accessing services:', err);
     setCaixinhasError(err);
   }
 
   console.log('caixinha service: ', serviceCai)
   const { currentUser } = serviceStore || {};
   const userId = currentUser?.uid;


  // Registrar listeners de eventos
  useEffect(() => {
    if (!currentUser) return;

    // Listener para quando caixinhas são carregadas
    const caixinhasFetchedListener = serviceEventHub.on(
      'caixinhas',
      CAIXINHA_EVENTS.CAIXINHAS_FETCHED,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Caixinhas fetched event received', {
          userId: data.userId,
          count: data.caixinhas?.length || 0
        });
        
        if (data.userId === userId) {
          dispatch({
            type: CAIXINHA_ACTIONS.FETCH_SUCCESS,
            payload: { caixinhas: data.caixinhas }
          });
        }
      }
    );

    // Listener para quando uma caixinha individual é carregada
    const caixinhaFetchedListener = serviceEventHub.on(
      'caixinhas',
      CAIXINHA_EVENTS.CAIXINHA_FETCHED,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Caixinha fetched event received', {
          caixinhaId: data.caixinhaId
        });
        
        dispatch({
          type: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA,
          payload: data.caixinha
        });
      }
    );

    // Listener para quando uma caixinha é criada
    const caixinhaCriadaListener = serviceEventHub.on(
      'caixinhas',
      CAIXINHA_EVENTS.CAIXINHA_CREATED,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Caixinha created event received', {
          caixinhaId: data.caixinhaId,
          adminId: data.adminId
        });
        
        if (data.adminId === userId) {
          getCaixinhas();
        }
      }
    );

    // Listener para quando uma caixinha é atualizada
    const caixinhaAtualizadaListener = serviceEventHub.on(
      'caixinhas',
      CAIXINHA_EVENTS.CAIXINHA_UPDATED,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Caixinha updated event received', {
          caixinhaId: data.caixinhaId,
          updatedFields: data.updatedFields
        });
        
        if (state.currentCaixinha?.caixinha.id === data.caixinhaId) {
          dispatch({
            type: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA,
            payload: data.caixinha
          });
        }
        
        // Atualiza a lista de caixinhas se a caixinha atualizada estiver nela
        if (state.caixinhas.some(cx => cx.id === data.caixinhaId)) {
          getCaixinhas();
        }
      }
    );

    // Listener para quando uma caixinha é excluída
    const caixinhaExcluidaListener = serviceEventHub.on(
      'caixinhas',
      CAIXINHA_EVENTS.CAIXINHA_DELETED,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Caixinha deleted event received', {
          caixinhaId: data.caixinhaId
        });
        
        // Remove da lista
        dispatch({
          type: CAIXINHA_ACTIONS.UPDATE_CAIXINHAS,
          payload: state.caixinhas.filter(cx => cx.id !== data.caixinhaId)
        });
        
        // Limpa a caixinha atual se for a excluída
        if (state.currentCaixinha?.caixinha.id === data.caixinhaId) {
          dispatch({ 
            type: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA, 
            payload: null 
          });
        }
      }
    );

    // Listener para quando uma contribuição é adicionada
    const contribuicaoListener = serviceEventHub.on(
      'caixinhas',
      CAIXINHA_EVENTS.CONTRIBUICAO_ADDED,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Contribuição added event received', {
          caixinhaId: data.caixinhaId,
          userId: data.userId
        });
        
        // Se for para a caixinha atual, atualiza as contribuições
        if (state.currentCaixinha?.caixinha.id === data.caixinhaId) {
          getContributions(data.caixinhaId);
          getCaixinha(data.caixinhaId); // Atualiza os detalhes da caixinha também
        }
      }
    );

    // Armazena os cancelamentos dos listeners
    setEventListeners([
      caixinhasFetchedListener,
      caixinhaFetchedListener,
      caixinhaCriadaListener,
      caixinhaAtualizadaListener,
      caixinhaExcluidaListener,
      contribuicaoListener
    ]);

    // Função de cleanup para remover os listeners
    return () => {
      eventListeners.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [currentUser, userId, state.currentCaixinha, state.caixinhas]);

  // // Se o serviço falhou, mostrar erro
  // useEffect(() => {
  //   if (caixinhaServiceError) {
  //     coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Caixinha service initialization failed', {
  //       error: caixinhaServiceError
  //     });
  //     showToast('Falha ao inicializar serviço de caixinhas', { 
  //       type: 'error', 
  //       description: caixinhaServiceError 
  //     });
  //   }
  // }, [caixinhaServiceError, showToast]);

  // Get All Caixinhas
  const getCaixinhas = useCallback(async () => {
    if (!userId || !currentUser) {
      dispatch({ type: CAIXINHA_ACTIONS.CLEAR_STATE });
      return [];
    }

    dispatch({ type: CAIXINHA_ACTIONS.FETCH_START });
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Fetching caixinhas', { userId });
    
    try {
      const cacheKey = `${CAIXINHA_CACHE_CONFIG.CAIXINHAS_KEY}:${userId}`;
      const cachedData = globalCache.getItem(cacheKey);

      if (cachedData && Date.now() - cachedData.timestamp < CAIXINHA_CACHE_CONFIG.CACHE_TIME) {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Using cached caixinhas data', {
          userId,
          cacheAge: Date.now() - cachedData.timestamp
        });
        
        dispatch({
          type: CAIXINHA_ACTIONS.FETCH_SUCCESS,
          payload: { caixinhas: cachedData.data }
        });
        return cachedData.data;
      }

      const response = await caixinhaService.getCaixinhas(userId);
      const processedCaixinhas = response.data.map(processCaixinhaData);

      dispatch({
        type: CAIXINHA_ACTIONS.FETCH_SUCCESS,
        payload: { caixinhas: processedCaixinhas }
      });

      globalCache.setItem(cacheKey, { 
        data: processedCaixinhas, 
        timestamp: Date.now() 
      });
      
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Caixinhas fetched successfully', {
        userId,
        count: processedCaixinhas.length
      });
      
      return processedCaixinhas;

    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to fetch caixinhas', {
        userId,
        error: error.message
      });
      
      dispatch({ 
        type: CAIXINHA_ACTIONS.FETCH_FAILURE, 
        payload: error.message 
      });
      
      throw error;
    }
  }, [userId, currentUser, processCaixinhaData]);

  // Get Single Caixinha
  const getCaixinha = useCallback(async (caixinhaId) => {
    if (!caixinhaId || !currentUser) {
      return null;
    }

    dispatch({ type: CAIXINHA_ACTIONS.FETCH_START });
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Fetching single caixinha', { caixinhaId });
    
    try {
      const cacheKey = `${CAIXINHA_CACHE_CONFIG.SINGLE_CAIXINHA_KEY}:${caixinhaId}`;
      const cachedData = globalCache.getItem(cacheKey);

      if (cachedData && Date.now() - cachedData.timestamp < CAIXINHA_CACHE_CONFIG.SINGLE_CACHE_TIME) {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Using cached single caixinha data', {
          caixinhaId,
          cacheAge: Date.now() - cachedData.timestamp
        });
        
        dispatch({
          type: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA,
          payload: cachedData.data
        });
        return cachedData.data;
      }

      const caixinhaData = await caixinhaService.getCaixinhaById(caixinhaId);
      const processedCaixinha = processCaixinhaData(caixinhaData);

      dispatch({
        type: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA,
        payload: processedCaixinha
      });
      
      globalCache.setItem(cacheKey, { 
        data: processedCaixinha, 
        timestamp: Date.now() 
      });
      
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Single caixinha fetched successfully', { caixinhaId });
      
      return processedCaixinha;

    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to fetch single caixinha', {
        caixinhaId,
        error: error.message
      });
      
      dispatch({ 
        type: CAIXINHA_ACTIONS.FETCH_FAILURE, 
        payload: error.message 
      });
      
      // showToast('Falha ao carregar caixinha', { 
      //   type: 'error',
      //   description: error.message 
      // });
      
      throw error;
    }
  }, [currentUser, processCaixinhaData]);

  // Create Caixinha
  const createCaixinha = useCallback(async (caixinhaData) => {
    if (!userId || !currentUser) {
      return null;
    }
  
    // Adicionando logs detalhados para depuração
    console.log('Dados enviados para validação:', caixinhaData);
    
    const validationResult = validateCaixinhaData(caixinhaData);
    console.log('Resultado da validação:', validationResult);
    
    if (!validationResult.success) {
      // Formatação do erro
      let errorMessage = "Erro de validação";
      if (validationResult.errors) {
        console.log('Erros específicos de validação:', validationResult.errors);
        errorMessage = Object.entries(validationResult.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');
      }
      
      // Criando um objeto de erro com detalhes para depuração
      const error = new Error(errorMessage);
      error.validationErrors = validationResult.errors;
      throw error;
    }

    // Dentro da função createCaixinha, antes de chamar o caixinhaService
    const enrichedData = {
      ...caixinhaData,
      adminId: userId,
      dataCriacao: new Date().toISOString(),
      // Adicione esta linha para converter a string em booleano
      // permiteEmprestimos: caixinhaData.permiteEmprestimos === true
    };

    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Creating caixinha', {
      adminId: userId,
      nome: caixinhaData.nome
    });
  
    try {
      dispatch({ type: CAIXINHA_ACTIONS.FETCH_START });
      
      // showToast('Criando caixinha...', { type: 'loading', id: 'create-caixinha' });
      
      const newCaixinhaData = await caixinhaService.createCaixinha(enrichedData);
      const newCaixinha = processCaixinhaData(newCaixinhaData);
      
      dispatch({
        type: CAIXINHA_ACTIONS.UPDATE_CAIXINHAS,
        payload: Array.isArray(state.caixinhas) ? [...state.caixinhas, newCaixinha] : [newCaixinha]
      });
      
      // Invalida o cache
      globalCache.remove(`${CAIXINHA_CACHE_CONFIG.CAIXINHAS_KEY}:${userId}`);
      
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Caixinha created successfully', {
        id: newCaixinha.id,
        nome: newCaixinha.nome
      });
      
      // showToast('Caixinha criada com sucesso!', { 
      //   type: 'success', 
      //   id: 'create-caixinha'
      // });
      
      return newCaixinha;
      
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to create caixinha', {
        error: error.message
      });
      
      dispatch({ 
        type: CAIXINHA_ACTIONS.FETCH_FAILURE, 
        payload: error.message 
      });
      
      // showToast('Falha ao criar caixinha', { 
      //   type: 'error', 
      //   id: 'create-caixinha',
      //   description: error.message
      // });
      
      throw error;
    }
  }, [userId, currentUser, state.caixinhas, processCaixinhaData]);
  
  const getMembers = useCallback(async (caixinhaId) => {
    if (!caixinhaId || !currentUser) {
      return [];
    }
  
    dispatch({ type: CAIXINHA_ACTIONS.FETCH_START });
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Fetching caixinha members', { caixinhaId });
    
    try {
      const cacheKey = `${CAIXINHA_CACHE_CONFIG.MEMBERS_KEY}:${caixinhaId}`;
      const cachedData = globalCache.getItem(cacheKey);
  
      if (cachedData && Date.now() - cachedData.timestamp < CAIXINHA_CACHE_CONFIG.CACHE_TIME) {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Using cached members data', {
          caixinhaId,
          cacheAge: Date.now() - cachedData.timestamp
        });
        
        dispatch({
          type: CAIXINHA_ACTIONS.UPDATE_MEMBERS,
          payload: { members: cachedData.data }
        });
        return cachedData.data;
      }
  
      const membersData = await caixinhaService.getMembers(caixinhaId);
      
      dispatch({
        type: CAIXINHA_ACTIONS.UPDATE_MEMBERS,
        payload: { members: membersData }
      });
      
      globalCache.setItem(cacheKey, { 
        data: membersData, 
        timestamp: Date.now() 
      });
      
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Members fetched successfully', { 
        caixinhaId,
        count: membersData.length 
      });
      
      return membersData;
  
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to fetch members', {
        caixinhaId,
        error: error.message
      });
      
      dispatch({ 
        type: CAIXINHA_ACTIONS.FETCH_FAILURE, 
        payload: error.message 
      });
      
      throw error;
    }
  }, [currentUser]);
  
  // Update Caixinha
  const updateCaixinha = useCallback(async (id, data) => {
    if (!id || !currentUser) {
      // showToast('ID de caixinha inválido', { type: 'error' });
      return null;
    }

    const validationError = validateCaixinhaData(data, true);
    if (validationError) {
      // showToast(validationError, { type: 'error' });
      return null;
    }

    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Updating caixinha', {
      id,
      fields: Object.keys(data)
    });

    try {
      dispatch({ type: CAIXINHA_ACTIONS.FETCH_START });
      
      // showToast('Atualizando caixinha...', { type: 'loading', id: 'update-caixinha' });
      
      const updatedCaixinhaData = await caixinhaService.updateCaixinha(id, data);
      const updatedCaixinha = processCaixinhaData(updatedCaixinhaData);
      
      dispatch({
        type: CAIXINHA_ACTIONS.UPDATE_CAIXINHAS,
        payload: state.caixinhas.map(cx => cx.id === id ? updatedCaixinha : cx)
      });

      if (state.currentCaixinha?.caixinha.id === id) {
        dispatch({
          type: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA,
          payload: updatedCaixinha
        });
      }
      
      // Invalida os caches
      globalCache.remove(`${CAIXINHA_CACHE_CONFIG.CAIXINHAS_KEY}:${userId}`);
      globalCache.remove(`${CAIXINHA_CACHE_CONFIG.SINGLE_CAIXINHA_KEY}:${id}`);
      
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Caixinha updated successfully', {
        id,
        nome: updatedCaixinha.nome
      });
      
      // showToast('Caixinha atualizada com sucesso!', { 
      //   type: 'success', 
      //   id: 'update-caixinha' 
      // });
      
      return updatedCaixinha;
      
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to update caixinha', {
        id,
        error: error.message
      });
      
      dispatch({ 
        type: CAIXINHA_ACTIONS.FETCH_FAILURE,
        payload: error.message 
      });
      
      // showToast('Falha ao atualizar caixinha', { 
      //   type: 'error', 
      //   id: 'update-caixinha',
      //   description: error.message 
      // });
      
      throw error;
    }
  }, [userId, currentUser, state.caixinhas, state.currentCaixinha, processCaixinhaData]);

  // Delete Caixinha
  const deleteCaixinha = useCallback(async (id) => {
    if (!id || !currentUser) {
      // showToast('ID de caixinha inválido', { type: 'error' });
      return null;
    }

    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Deleting caixinha', { id });

    try {
      dispatch({ type: CAIXINHA_ACTIONS.FETCH_START });
      
      // showToast('Excluindo caixinha...', { type: 'loading', id: 'delete-caixinha' });
      
      await caixinhaService.deleteCaixinha(id);
      
      dispatch({
        type: CAIXINHA_ACTIONS.UPDATE_CAIXINHAS,
        payload: state.caixinhas.filter(cx => cx.id !== id)
      });

      if (state.currentCaixinha?.caixinha.id === id) {
        dispatch({ 
          type: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA, 
          payload: null 
        });
      }
      
      // Invalida os caches
      globalCache.remove(`${CAIXINHA_CACHE_CONFIG.CAIXINHAS_KEY}:${userId}`);
      globalCache.remove(`${CAIXINHA_CACHE_CONFIG.SINGLE_CAIXINHA_KEY}:${id}`);
      
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Caixinha deleted successfully', { id });
      
      // showToast('Caixinha excluída com sucesso!', { 
      //   type: 'success', 
      //   id: 'delete-caixinha' 
      // });
      
      return { success: true, id };
      
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to delete caixinha', {
        id,
        error: error.message
      });
      
      dispatch({ 
        type: CAIXINHA_ACTIONS.FETCH_FAILURE, 
        payload: error.message 
      });
      
      // showToast('Falha ao excluir caixinha', { 
      //   type: 'error',
      //   id: 'delete-caixinha',
      //   description: error.message 
      // });
      
      throw error;
    }
  }, [userId, currentUser, state.caixinhas, state.currentCaixinha]);

  // Add Contribution
  const addContribution = useCallback(async (data) => {
    if (!userId || !currentUser) {
      // showToast('Usuário deve estar autenticado', { type: 'error' });
      return null;
    }
    
    if (!data.caixinhaId || !data.valor) {
      // showToast('Dados da contribuição incompletos', { type: 'error' });
      return null;
    }

    const contributionData = {
      ...data,
      userId: data.userId || userId,
      dataContribuicao: data.dataContribuicao || new Date().toISOString()
    };

    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Adding contribution', {
      caixinhaId: data.caixinhaId,
      userId: contributionData.userId,
      valor: data.valor
    });

    try {
      
      // showToast('Adicionando contribuição...', { type: 'loading', id: 'add-contribution' });
      
      const response = await caixinhaService.addContribuicao(contributionData);
      
      // Invalida o cache da caixinha individual
      globalCache.remove(`${CAIXINHA_CACHE_CONFIG.SINGLE_CAIXINHA_KEY}:${data.caixinhaId}`);
      
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Contribution added successfully', {
        caixinhaId: data.caixinhaId,
        contributionId: response.id
      });
      
      // showToast('Contribuição adicionada com sucesso!', { 
      //   type: 'success',
      //   id: 'add-contribution'
      // });
      
      // Atualizar a caixinha e as contribuições se for a caixinha atual
      if (state.currentCaixinha?.caixinha.id === data.caixinhaId) {
        getContributions(data.caixinhaId);
        getCaixinha(data.caixinhaId);
      }
      
      return response;
      
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to add contribution', {
        caixinhaId: data.caixinhaId,
        error: error.message
      });
      
      // showToast('Falha ao adicionar contribuição', { 
      //   type: 'error',
      //   id: 'add-contribution',
      //   description: error.message 
      // });
      
      throw error;
    }
  }, [userId, currentUser, state.currentCaixinha, getCaixinha]);

  // Get Contributions
  const getContributions = useCallback(async (caixinhaId) => {
    if (!caixinhaId || !currentUser) {
      // showToast('ID de caixinha inválido', { type: 'error' });
      return [];
    }

    dispatch({ type: CAIXINHA_ACTIONS.FETCH_START });
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Fetching contributions', { caixinhaId });
    
    try {
      const contributions = await caixinhaService.getContribuicoes(caixinhaId);
      
      dispatch({ 
        type: CAIXINHA_ACTIONS.UPDATE_CONTRIBUTIONS, 
        payload: contributions || [] 
      });
      
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Contributions fetched successfully', {
        caixinhaId,
        count: contributions.length
      });
      
      return contributions;
      
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to fetch contributions', {
        caixinhaId,
        error: error.message
      });
      
      dispatch({ 
        type: CAIXINHA_ACTIONS.FETCH_FAILURE, 
        payload: error.message 
      });
      
      // showToast('Falha ao carregar contribuições', { 
      //   type: 'error',
      //   description: error.message 
      // });
      
      throw error;
    }
  }, [currentUser]);

  // Invite Member
  const inviteMember = useCallback(async (caixinhaId, inviteData) => {
    if (!caixinhaId || !inviteData.email || !currentUser) {
      // showToast('Dados do convite inválidos', { type: 'error' });
      return null;
    }

    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Inviting member', {
      caixinhaId,
      email: inviteData.email
    });

    try {
      
      // showToast('Enviando convite...', { type: 'loading', id: 'invite-member' });
      
      const response = await caixinhaService.inviteMember(caixinhaId, inviteData);
      
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Member invited successfully', {
        caixinhaId,
        email: inviteData.email,
        caxinhaInviteId: response.id
      });
      
      // showToast('Convite enviado com sucesso!', { 
      //   type: 'success',
      //   id: 'invite-member'
      // });
      
      return response;
      
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to invite member', {
        caixinhaId,
        email: inviteData.email,
        error: error.message
      });
      
      // showToast('Falha ao enviar convite', { 
      //   type: 'error',
      //   id: 'invite-member',
      //   description: error.message 
      // });
      
      throw error;
    }
  }, [currentUser]);

  // Join Caixinha
  const joinCaixinha = useCallback(async (caixinhaId, joinData = {}) => {
    if (!userId || !caixinhaId || !currentUser) {
      // showToast('Dados inválidos', { type: 'error' });
      return null;
    }

    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Joining caixinha', {
      caixinhaId,
      userId
    });

    try {
      
      // showToast('Entrando na caixinha...', { type: 'loading', id: 'join-caixinha' });
      
      const response = await caixinhaService.joinCaixinha(caixinhaId, { 
        ...joinData, 
        userId 
      });
      
      // Invalida os caches
      globalCache.remove(`${CAIXINHA_CACHE_CONFIG.CAIXINHAS_KEY}:${userId}`);
      globalCache.remove(`${CAIXINHA_CACHE_CONFIG.SINGLE_CAIXINHA_KEY}:${caixinhaId}`);
      
      // Recarrega as caixinhas
      getCaixinhas();
      
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Joined caixinha successfully', {
        caixinhaId,
        userId
      });
      
      // showToast('Entrada na caixinha realizada com sucesso!', { 
      //   type: 'success',
      //   id: 'join-caixinha'
      // });
      
      return response;
      
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to join caixinha', {
        caixinhaId,
        userId,
        error: error.message
      });
      
      // showToast('Falha ao entrar na caixinha', { 
      //   type: 'error',
      //   id: 'join-caixinha',
      //   description: error.message 
      // });
      
      throw error;
    }
  }, [userId, currentUser, getCaixinhas]);

  // Leave Caixinha
  const leaveCaixinha = useCallback(async (caixinhaId) => {
    if (!userId || !caixinhaId || !currentUser) {
      // showToast('Dados inválidos', { type: 'error' });
      return null;
    }

coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Leaving caixinha', {
  caixinhaId,
  userId
});

try {
  
  // showToast('Saindo da caixinha...', { type: 'loading', id: 'leave-caixinha' });
  
  const response = await caixinhaService.leaveCaixinha(caixinhaId, userId);
  
  // Invalida os caches
  globalCache.remove(`${CAIXINHA_CACHE_CONFIG.CAIXINHAS_KEY}:${userId}`);
  globalCache.remove(`${CAIXINHA_CACHE_CONFIG.SINGLE_CAIXINHA_KEY}:${caixinhaId}`);
  
  // Recarrega as caixinhas
  getCaixinhas();
  
  // Limpa a caixinha atual se for a que o usuário saiu
  if (state.currentCaixinha?.caixinha.id === caixinhaId) {
    dispatch({ 
      type: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA, 
      payload: null 
    });
  }
  
  coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Left caixinha successfully', {
    caixinhaId,
    userId
  });
  
  // showToast('Saída da caixinha realizada com sucesso!', { 
  //   type: 'success',
  //   id: 'leave-caixinha'
  // });
  
  return response;
  
} catch (error) {
  coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to leave caixinha', {
    caixinhaId,
    userId,
    error: error.message
  });
  
  // showToast('Falha ao sair da caixinha', { 
  //   type: 'error',
  //   id: 'leave-caixinha',
  //   description: error.message 
  // });
  
  throw error;
}
}, [userId, currentUser, getCaixinhas, state.currentCaixinha]);

// Inicialização - Carregar caixinhas quando o serviço estiver pronto e o usuário autenticado
useEffect(() => {
if (userId && currentUser) {
  getCaixinhas();
} else {
  dispatch({ type: CAIXINHA_ACTIONS.CLEAR_STATE });
}
}, [userId, currentUser, getCaixinhas]);

// Memoizar o valor do contexto para evitar re-renderizações desnecessárias
const contextValue = useMemo(() => ({
// Estado
caixinhas: state.caixinhas,
currentCaixinha: state.currentCaixinha,
contributions: state.contributions,
members: state.members, 
loading: state.loading,
error: state.error,

// Status do serviço
serviceReady: currentUser,
// serviceError: caixinhaServiceError,

// Ações
createCaixinha,
getMembers,
updateCaixinha,
deleteCaixinha,
getCaixinha,
getCaixinhas,
joinCaixinha,
leaveCaixinha,
addContribution,
getContributions,
inviteMember,

// Helper
processCaixinhaData
}), [
// Estado
state.caixinhas,
state.currentCaixinha,
state.contributions,
state.members, 
state.loading,
state.error,

// Status do serviço
currentUser,
// caixinhaServiceError,

createCaixinha,
getMembers,
updateCaixinha,
deleteCaixinha,
getCaixinha,
getCaixinhas,
joinCaixinha,
leaveCaixinha,
addContribution,
getContributions,
inviteMember,

// Helper
processCaixinhaData
]);

// Renderizar o context provider
return (
<CaixinhaContext.Provider value={contextValue}>
  {children}
</CaixinhaContext.Provider>
);
};

// Hook customizado para acessar o contexto
export const useCaixinha = () => {
const context = useContext(CaixinhaContext);

if (!context) {
throw new Error('useCaixinha deve ser usado dentro de um CaixinhaProvider');
}

return context;
};

// Componente para usuar o serviço de caixinha
// export const CaixinhaService = ({ children }) => {
// // Precisamos apenas do context provider aqui
// return <CaixinhaProvider>{children}</CaixinhaProvider>;
// };

// export default CaixinhaService;