// src/providers/CaixinhaInviteProvider/index.js
import React, { createContext, useContext, useReducer, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { CAIXINHA_INVITE_ACTIONS } from '../../core/constants/actions';
import { CAIXINHA_INVITE_EVENTS } from '../../core/constants/events';
import { serviceEventHub, serviceLocator } from '../../core/services/BaseService.js';
import { initialCaixinhaInviteState } from '../../core/constants/initialState';
import { caixinhaInviteReducer } from '../../reducers/caixinhaInvite/caixinhaInviteReducer';
import { useToast } from '../ToastProvider';
import { LOG_LEVELS } from '../../core/constants/config';
import { coreLogger } from '../../core/logging';
import { useConnections } from '../ConnectionProvider';

const MODULE_NAME = 'CaixinhaInviteProvider';
const CaixinhaInviteContext = createContext();

/**
 * Provider component for managing Caixinha invitations
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} - Provider component
 */
export const CaixinhaInviteProvider = ({ children }) => {
  const { showToast } = useToast();
  const [state, dispatch] = useReducer(caixinhaInviteReducer, initialCaixinhaInviteState);
  const [eventListeners, setEventListeners] = useState([]);
  const [caixinhaInviteServiceError, setCaixinhaInviteServiceError] = useState(null);

  // Cache de detalhes de caixinha para evitar buscas duplicadas
  const caixinhaCache = useRef({});

  let caixinhaInviteService;
  let caixinhaService;
  let connectionsService;
  let serviceStore;
  
  try {
    caixinhaInviteService = serviceLocator.get('caixinhaInvites');
    caixinhaService = serviceLocator.get('caixinhas');
    connectionsService = serviceLocator.get('connections');
    serviceStore = serviceLocator.get('store').getState()?.auth;
  } catch (err) {
    console.warn('Error accessing services:', err);
    setCaixinhaInviteServiceError(err);
  }

  const { currentUser } = serviceStore || {};
  const userId = currentUser?.uid;
  const { friends, bestFriends } = useConnections();

  // Registrar listeners de eventos
  useEffect(() => {
    if (!currentUser) return;

    // Listener para quando convites são carregados
    const invitesFetchedListener = serviceEventHub.on(
      'caixinhaInvites',
      CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITES_FETCHED,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Invites fetched event received', {
          userId: data.userId,
          isReceivedInvites: data.isReceivedInvites,
          count: data.count
        });
        
        if (data.userId === userId) {
          const actionType = data.isReceivedInvites ? 
            CAIXINHA_INVITE_ACTIONS.CAIXINHA_UPDATE_PENDING_INVITES : 
            CAIXINHA_INVITE_ACTIONS.CAIXINHA_UPDATE_SENT_INVITES;
          
          dispatch({
            type: actionType,
            payload: { invites: data.invites, totalCount: data.count }
          });
        }
      }
    );

    // Listener para quando um convite é enviado
    const inviteSentListener = serviceEventHub.on(
      'caixinhaInvites',
      CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_SENT,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Invite sent event received', {
          caixinhaId: data.caixinhaId,
          targetId: data.targetId
        });
        
        if (data.invite.senderId === userId) {
          dispatch({
            type: CAIXINHA_INVITE_ACTIONS.CAIXINHA_INVITE_SUCCESS,
            payload: { 
              newInvite: data.invite,
              caixinhaId: data.caixinhaId,
              targetId: data.targetId 
            }
          });
        }
      }
    );

    // Listener para quando um convite é aceito
    const inviteAcceptedListener = serviceEventHub.on(
      'caixinhaInvites',
      CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_ACCEPTED,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Invite accepted event received', {
          caxinhaInviteId: data.caxinhaInviteId,
          userId: data.userId
        });
        
        if (data.userId === userId) {
          dispatch({
            type: CAIXINHA_INVITE_ACTIONS.CAIXINHA_ACCEPT_SUCCESS,
            payload: { 
              caxinhaInviteId: data.caxinhaInviteId,
              caixinhaId: data.caixinhaId 
            }
          });
        }
      }
    );

    // Listener para quando um convite é rejeitado
    const inviteRejectedListener = serviceEventHub.on(
      'caixinhaInvites',
      CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_REJECTED,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Invite rejected event received', {
          caxinhaInviteId: data.caxinhaInviteId,
          userId: data.userId
        });
        
        if (data.userId === userId) {
          dispatch({
            type: CAIXINHA_INVITE_ACTIONS.CAIXINHA_REJECT_SUCCESS,
            payload: { 
              caxinhaInviteId: data.caxinhaInviteId,
              caixinhaId: data.caixinhaId 
            }
          });
        }
      }
    );

    // Listener para quando um convite é cancelado
    const inviteCanceledListener = serviceEventHub.on(
      'caixinhaInvites',
      CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_CANCELED,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Invite canceled event received', {
          caxinhaInviteId: data.caxinhaInviteId,
          senderId: data.senderId
        });
        
        if (data.senderId === userId) {
          dispatch({
            type: CAIXINHA_INVITE_ACTIONS.CAIXINHA_CANCEL_SUCCESS,
            payload: { 
              caxinhaInviteId: data.caxinhaInviteId,
              caixinhaId: data.caixinhaId 
            }
          });
        }
      }
    );
    
    // Listener para quando detalhes de uma caixinha são carregados
    const caixinhaFetchedListener = serviceEventHub.on(
      'caixinhas',
      CAIXINHA_INVITE_EVENTS.CAIXINHA_FETCHED,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Caixinha details fetched event received', {
          caixinhaId: data.caixinhaId
        });
        
        // Armazenar no cache
        if (data.caixinhaId && data.caixinha) {
          caixinhaCache.current[data.caixinhaId] = data.caixinha;
        }
      }
    );

    // Listener para erros
    const inviteErrorListener = serviceEventHub.on(
      'caixinhaInvites',
      CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_ERROR,
      (data) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Invite error event received', {
          error: data.error,
          errorDetails: data.errorDetails
        });
        
        dispatch({
          type: CAIXINHA_INVITE_ACTIONS.CAIXINHA_SET_ERROR,
          payload: data.error
        });
      }
    );

    // Armazena os cancelamentos dos listeners
    setEventListeners([
      invitesFetchedListener,
      inviteSentListener,
      inviteAcceptedListener,
      inviteRejectedListener,
      inviteCanceledListener,
      caixinhaFetchedListener,
      inviteErrorListener
    ]);

    // Função de cleanup para remover os listeners
    return () => {
      eventListeners.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [currentUser, userId]);

  // Se o serviço falhou, mostrar erro
  useEffect(() => {
    if (caixinhaInviteServiceError) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'CaixinhaInvite service initialization failed', {
        error: caixinhaInviteServiceError
      });
      showToast('Falha ao inicializar serviço de convites', { 
        type: 'error', 
        description: caixinhaInviteServiceError.message 
      });
    }
  }, [caixinhaInviteServiceError, showToast]);

  // Carregar convites pendentes
  const loadPendingInvites = useCallback(async () => {
    if (!userId || !currentUser || !caixinhaInviteService) {
      return [];
    }
    
    dispatch({ type: CAIXINHA_INVITE_ACTIONS.CAIXINHA_FETCH_START });
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Loading pending invites', { userId });
    
    try {
      const pendingInvites = await caixinhaInviteService.getInvitationsByType(
        userId, 
        ['caixinha_invite', 'caixinha_email_invite'], 
        'received',
        'pending'
      );
      
      dispatch({
        type: CAIXINHA_INVITE_ACTIONS.CAIXINHA_UPDATE_PENDING_INVITES,
        payload: { invites: pendingInvites, totalCount: pendingInvites.length }
      });
      
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Pending invites loaded successfully', {
        userId,
        count: pendingInvites.length
      });
      
      return pendingInvites;
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to load pending invites', {
        userId,
        error: error.message
      });
      
      dispatch({ 
        type: CAIXINHA_INVITE_ACTIONS.CAIXINHA_FETCH_FAILURE, 
        payload: error.message 
      });
      
      showToast('Erro ao carregar convites pendentes', { 
        type: 'error',
        description: error.message 
      });
      
      return [];
    }
  }, [userId, currentUser, caixinhaInviteService, showToast]);

  // Carregar convites enviados
  const loadSentInvites = useCallback(async () => {
    if (!userId || !currentUser || !caixinhaInviteService) {
      return [];
    }
    
    dispatch({ type: CAIXINHA_INVITE_ACTIONS.CAIXINHA_FETCH_START });
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Loading sent invites', { userId });
    
    try {
      const sentInvites = await caixinhaInviteService.getInvitationsByType(
        userId, 
        ['caixinha_invite', 'caixinha_email_invite'], 
        'sent',
        'pending'
      );
      
      dispatch({
        type: CAIXINHA_INVITE_ACTIONS.CAIXINHA_UPDATE_SENT_INVITES,
        payload: { invites: sentInvites, totalCount: sentInvites.length }
      });
      
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Sent invites loaded successfully', {
        userId,
        count: sentInvites.length
      });
      
      return sentInvites;
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to load sent invites', {
        userId,
        error: error.message
      });
      
      dispatch({ 
        type: CAIXINHA_INVITE_ACTIONS.CAIXINHA_FETCH_FAILURE, 
        payload: error.message 
      });
      
      showToast('Erro ao carregar convites enviados', { 
        type: 'error',
        description: error.message 
      });
      
      return [];
    }
  }, [userId, currentUser, caixinhaInviteService, showToast]);

  /**
   * Obtém os detalhes de uma caixinha específica pelo ID
   * @param {string} caixinhaId - ID da caixinha
   * @returns {Promise<Object>} - Detalhes da caixinha
   */
  const getCaixinhaById = useCallback(async (caixinhaId) => {
    // Verificar se está no cache primeiro
    if (caixinhaCache.current[caixinhaId]) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Using cached caixinha details', {
        caixinhaId
      });
      return caixinhaCache.current[caixinhaId];
    }
    
    if (!caixinhaId || !caixinhaService) {
      throw new Error('ID de caixinha inválido ou serviço indisponível');
    }
    console.log('dados na caixinha no provedor: ', caixinhaId)
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Fetching caixinha details', {
      caixinhaId
    });
    
    try {
      // Buscar dados da caixinha
      const caixinhaData = await caixinhaService.getCaixinhaById(caixinhaId);
      
      // Armazenar no cache
      caixinhaCache.current[caixinhaId] = caixinhaData;
      
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Caixinha details fetched successfully', {
        caixinhaId
      });
      
      return caixinhaData;
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to fetch caixinha details', {
        caixinhaId,
        error: error.message
      });
      
      showToast('Erro ao buscar detalhes da caixinha', { 
        type: 'error',
        description: error.message 
      });
      
      throw error;
    }
  }, [caixinhaService, showToast]);

  // Enviar convite para amigo existente
  const inviteFriend = useCallback(async (caixinhaId, friendId, message) => {
    if (!currentUser || !caixinhaInviteService) {
      throw new Error('Serviço não disponível');
    }
        
    try {
      // Variables to store friend info
      let targetName, targetPhoto;
      let friendInfo;
      
      // First check if we have data from hooks
      if (friends?.length > 0 || bestFriends?.length > 0) {
        const allFriends = [...(friends || []), ...(bestFriends || [])];
        friendInfo = allFriends.find(friend => friend.id === friendId);
      }
      
      // If not found via hooks, try to access directly from connection service cache
      if (!friendInfo && connectionsService) {
        // Look in the _connectionsCache for the current user's data
        const userCache = connectionsService._connectionsCache?.get(currentUser.uid);
        
        if (userCache) {
          // Try to find the friend in both friends and bestFriends arrays
          const cachedFriends = [...(userCache.friends || []), ...(userCache.bestFriends || [])];
          friendInfo = cachedFriends.find(friend => friend.id === friendId);
        }
        
        // If still not found, check the search cache
        if (!friendInfo && connectionsService._searchCache?.size > 0) {
          // Try each search result in the cache
          for (const [key, value] of connectionsService._searchCache.entries()) {
            const searchResults = value.results?.results || [];
            const foundInSearch = searchResults.find(result => result.id === friendId);
            if (foundInSearch) {
              friendInfo = foundInSearch;
              break;
            }
          }
        }
        
        // If still not found and we have a method to fetch connections, try fetching
        if (!friendInfo && typeof connectionsService.getConnections === 'function') {
          try {
            // This should update the cache with fresh data
            await connectionsService.getConnections();
            
            // Try again to get the data from the updated cache
            const refreshedCache = connectionsService._connectionsCache?.get(currentUser.uid);
            if (refreshedCache) {
              const refreshedFriends = [...(refreshedCache.friends || []), ...(refreshedCache.bestFriends || [])];
              friendInfo = refreshedFriends.find(friend => friend.id === friendId);
            }
          } catch (fetchError) {
            console.error('Error fetching connections:', fetchError);
            // Continue with what we have
          }
        }
      }
  
      // Extract name and photo from friendInfo if found
      if (friendInfo) {
        targetName = friendInfo.nome || friendInfo.name || friendInfo.displayName;
        targetPhoto = friendInfo.fotoDoPerfil || friendInfo.fotoPerfil || friendInfo.photoURL;
        console.log('Friend found:', targetName, friendInfo);
      } else {
        console.warn(`Friend with ID ${friendId} not found. Sending invite without name.`);
      }
  
      // Send the invite with whatever information we found
      const result = await caixinhaInviteService.inviteExistingMember({
        caixinhaId,
        targetId: friendId,
        targetName,
        targetPhoto, 
        message,
        sendMessage: true
      });
      
      await loadSentInvites();
      return result;
    } catch (err) {
      console.error('Error sending invite:', err);
      throw err;
    }
  }, [currentUser, caixinhaInviteService, loadSentInvites, connectionsService, friends, bestFriends]);

  // Enviar convite por email
  const inviteByEmail = useCallback(async (caixinhaId, email, message) => {
    if (!userId || !currentUser || !caixinhaInviteService) {
      showToast('Serviço não disponível', { type: 'error' });
      throw new Error('Serviço não disponível');
    }
    
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Inviting by email', {
      caixinhaId,
      email,
      senderId: userId
    });
    
    try {
      showToast('Enviando convite...', { type: 'loading', id: 'invite-email' });
      
      const result = await caixinhaInviteService.inviteNewMember({
        caixinhaId,
        email,
        message
      });
      
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Email invite sent successfully', {
        caixinhaId,
        email,
        caixinhaInviteId: result.caixinhaInviteId
      });
      
      showToast('Convite enviado com sucesso!', { 
        type: 'success',
        id: 'invite-email'
      });
      
      await loadSentInvites();
      return result;
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to invite by email', {
        caixinhaId,
        email,
        error: error.message
      });
      
      showToast('Erro ao enviar convite', { 
        type: 'error',
        id: 'invite-email',
        description: error.message 
      });
      
      throw error;
    }
  }, [userId, currentUser, caixinhaInviteService, showToast, loadSentInvites]);

  // Aceitar convite
  const acceptInvite = useCallback(async (caixinhaInviteId) => {
    if (!userId || !currentUser || !caixinhaInviteService) {
      showToast('Serviço não disponível', { type: 'error' });
      throw new Error('Serviço não disponível');
    }
    
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Accepting invite', {
      caixinhaInviteId,
      userId
    });
    
    try {
      showToast('Aceitando convite...', { type: 'loading', id: 'accept-invite' });
      
      const result = await caixinhaInviteService.acceptInvite(caixinhaInviteId);
      
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Invite accepted successfully', {
        caixinhaInviteId,
        caixinhaId: result.caixinhaId
      });
      
      showToast('Convite aceito com sucesso!', { 
        type: 'success',
        id: 'accept-invite'
      });
      
      await loadPendingInvites();
      return result;
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to accept invite', {
        caixinhaInviteId,
        error: error.message
      });
      
      showToast('Erro ao aceitar convite', { 
        type: 'error',
        id: 'accept-invite',
        description: error.message 
      });
      
      throw error;
    }
  }, [userId, currentUser, caixinhaInviteService, showToast, loadPendingInvites]);

  // Rejeitar convite
  const rejectInvite = useCallback(async (caixinhaInviteId) => {
    if (!userId || !currentUser || !caixinhaInviteService) {
      showToast('Serviço não disponível', { type: 'error' });
      throw new Error('Serviço não disponível');
    }
    
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Rejecting invite', {
      caixinhaInviteId,
      userId
    });
    
    try {
      showToast('Rejeitando convite...', { type: 'loading', id: 'reject-invite' });
      
      await caixinhaInviteService.rejectInvite(caixinhaInviteId);
      
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Invite rejected successfully', {
        caixinhaInviteId
      });
      
      showToast('Convite rejeitado com sucesso!', { 
        type: 'success',
        id: 'reject-invite'
      });
      
      await loadPendingInvites();
      return { success: true };
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to reject invite', {
        caixinhaInviteId,
        error: error.message
      });
      
      showToast('Erro ao rejeitar convite', { 
        type: 'error',
        id: 'reject-invite',
        description: error.message 
      });
      
      throw error;
    }
  }, [userId, currentUser, caixinhaInviteService, showToast, loadPendingInvites]);

  // Cancelar convite
  const cancelInvite = useCallback(async (caixinhaInviteId) => {
    if (!userId || !currentUser || !caixinhaInviteService) {
      showToast('Serviço não disponível', { type: 'error' });
      throw new Error('Serviço não disponível');
    }
    
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Canceling invite', {
      caixinhaInviteId,
      userId
    });
    
    try {
      showToast('Cancelando convite...', { type: 'loading', id: 'cancel-invite' });
      
      // Esta função precisa ser implementada no serviço
      await caixinhaInviteService.cancelInvite(caixinhaInviteId);
      
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Invite canceled successfully', {
        caixinhaInviteId
      });
      
      showToast('Convite cancelado com sucesso!', { 
        type: 'success',
        id: 'cancel-invite'
      });
      
      await loadSentInvites();
      return { success: true };
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to cancel invite', {
        caixinhaInviteId,
        error: error.message
      });
      
      showToast('Erro ao cancelar convite', { 
        type: 'error',
        id: 'cancel-invite',
        description: error.message 
      });
      
      throw error;
    }
  }, [userId, currentUser, caixinhaInviteService, showToast, loadSentInvites]);

  // Carregar convites quando o usuário mudar
  useEffect(() => {
    if (userId && currentUser && caixinhaInviteService) {
      loadPendingInvites();
      loadSentInvites();
    } else {
      dispatch({ type: CAIXINHA_INVITE_ACTIONS.CAIXINHA_CLEAR_STATE });
    }
  }, [userId, currentUser, caixinhaInviteService, loadPendingInvites, loadSentInvites]);

  // Memoizar o valor do contexto para evitar re-renderizações desnecessárias
  const contextValue = useMemo(() => ({
    // Estado
    pendingInvites: state.pendingInvites,
    sentInvites: state.sentInvites,
    loading: state.loading,
    error: state.error,
    
    // Status do serviço
    isServiceAvailable: !!caixinhaInviteService && !!caixinhaService,
    serviceError: caixinhaInviteServiceError,
    
    // Ações
    loadPendingInvites,
    loadSentInvites,
    inviteFriend,
    inviteByEmail,
    acceptInvite,
    rejectInvite,
    cancelInvite,
    getCaixinhaById
  }), [
    state.pendingInvites,
    state.sentInvites,
    state.loading,
    state.error,
    caixinhaInviteService,
    caixinhaService,
    caixinhaInviteServiceError,
    loadPendingInvites,
    loadSentInvites,
    inviteFriend,
    inviteByEmail,
    acceptInvite,
    rejectInvite,
    cancelInvite,
    getCaixinhaById
  ]);

  return (
    <CaixinhaInviteContext.Provider value={contextValue}>
      {children}
    </CaixinhaInviteContext.Provider>
  );
};

/**
 * Custom hook to access the CaixinhaInvite context
 * @returns {Object} CaixinhaInvite context
 * @throws {Error} If used outside of CaixinhaInviteProvider
 */
export const useCaixinhaInvite = () => {
  const context = useContext(CaixinhaInviteContext);
  if (!context) {
    throw new Error('useCaixinhaInvite deve ser usado dentro de um CaixinhaInviteProvider');
  }
  return context;
};