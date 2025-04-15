// src/providers/InviteProvider/index.js
import React, { createContext, useCallback, useContext, useReducer, useEffect, useState } from 'react';
import { inviteReducer } from '../../reducers/invites/inviteReducer';
import { INVITATION_ACTIONS } from '../../core/constants/actions';
import { serviceEventHub, serviceLocator } from '../../core/services/BaseService';
import { initialInviteState } from '../../core/constants/initialState';

const InviteContext = createContext(null);
const MODULE_NAME = 'invites';

export const InviteProvider = ({ children }) => {
  const [state, dispatch] = useReducer(inviteReducer, initialInviteState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [inviteError, setInviteError] = useState(null);  
  const [checkingInvite, setCheckingInvite] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  
  let inviteService;
  let serviceStore;
  let serviceInv;
  try {
    inviteService = serviceLocator.get('invites');
    serviceStore = serviceLocator.get('store').getState()?.auth;
    serviceInv = serviceLocator.get('store').getState()?.invites;

  } catch (err) {
    console.inviteError('Error accessing services:', err);
    setInviteError(err);
  }

  const { isAuthenticated, currentUser } = serviceStore || {};

  // Use o hook useAuth para obter informações de autenticação consistentes  
  // Inicializar o serviço de convites
  useEffect(() => {
    async function initInvites() {
      if (isAuthenticated && currentUser) {
        try {
          // Obter o serviço de convites
          // const inviteService = serviceLocator.get('invites');
          console.log('convites processados: ', serviceInv);

          // Carregar convites enviados (com tratamento de erro defensivo)
          try {
            await inviteService.getSentInvitations();
          } catch (err) {
            console.error('Erro ao carregar convites iniciais:', err);
            // Continuamos mesmo se falhar para que a interface do usuário funcione
          }
          
          setIsInitialized(true);
        } catch (error) {
          console.error('Failed to initialize invite service:', error);
          setIsInitialized(true); // Mesmo com erro, marcamos como inicializado
        }
      }
    }
    
    if (isAuthenticated && currentUser && !isInitialized) {
      initInvites();
    }
    
    // Não chamamos stop() no cleanup, pois o serviço é gerenciado pelo serviceLocator
    return () => {
      if (isInitialized) {
        setIsInitialized(false);
      }
    };
  }, [isAuthenticated, currentUser, isInitialized]);

  // Escutar eventos de convites
  useEffect(() => {
    // if (!isInitialized) return;
    
    const fetchSuccessUnsubscribe = serviceEventHub.on(
      'invites',  
      'INVITATIONS_FETCHED', 
      (invitations) => {
        console.log('check: ', invitations)
        const invitationsArray = invitations?.invitations || [];
        const processedInvitations = Array.isArray(invitationsArray) ? invitationsArray : [];
        
        dispatch({ 
          type: INVITATION_ACTIONS.FETCH_SUCCESS, 
          payload: processedInvitations
        });
      }
    );
   
    const fetchFailureUnsubscribe = serviceEventHub.on(
      'invites',  
      'FETCH_FAILURE', 
      (data) => {
        dispatch({ 
          type: INVITATION_ACTIONS.FETCH_FAILURE, 
          payload: data 
        });
      }
    );
    
    const sendSuccessUnsubscribe = serviceEventHub.on(
      'invites',  
      'SEND_SUCCESS', 
      (data) => {
        dispatch({ 
          type: INVITATION_ACTIONS.SEND_SUCCESS, 
          payload: data 
        });
      }
    );
    
    const sendFailureUnsubscribe = serviceEventHub.on(
      'invites',  
      'SEND_FAILURE', 
      (data) => {
        dispatch({ 
          type: INVITATION_ACTIONS.SEND_FAILURE, 
          payload: data 
        });
      }
    );
    
    const invitationCanceledUnsubscribe = serviceEventHub.on(
      'invites',  
      'INVITATION_CANCELED', 
      (data) => {
        dispatch({ 
          type: INVITATION_ACTIONS.UPDATE_INVITATION, 
          payload: {
            inviteId: data.inviteId,
            updates: { 
              status: 'canceled',
              canceledAt: new Date().toISOString()
            }
          }
        });
      }
    );
    
    const invitationInvalidatedUnsubscribe = serviceEventHub.on(
      'invites',  
      'INVITATION_INVALIDATED', 
      (data) => {
        dispatch({ 
          type: INVITATION_ACTIONS.UPDATE_INVITATION, 
          payload: {
            inviteId: data.inviteId,
            updates: { 
              status: 'invalid',
              invalidatedAt: new Date().toISOString()
            }
          }
        });
      }
    );
    
    const invitationResentUnsubscribe = serviceEventHub.on(
      'invites',  
      'INVITATION_RESENT', 
      (data) => {
        dispatch({ 
          type: INVITATION_ACTIONS.UPDATE_INVITATION, 
          payload: {
            inviteId: data.inviteId,
            updates: { 
              resent: true,
              resentAt: new Date().toISOString()
            }
          }
        });
      }
    );
    
    const invitationValidatedUnsubscribe = serviceEventHub.on(
      'invites',  
      'INVITATION_VALIDATED', 
      (data) => {
        dispatch({ 
          type: INVITATION_ACTIONS.UPDATE_INVITATION, 
          payload: {
            inviteId: data.inviteId,
            updates: { 
              validated: true,
              validatedAt: new Date().toISOString()
            }
          }
        });
      }
    );
    
    const invitationsClearedUnsubscribe = serviceEventHub.on(
      'invites',  
      'INVITATIONS_CLEARED', 
      () => {
        dispatch({ type: INVITATION_ACTIONS.CLEAR_STATE });
      }
    );
    
    return () => {
      fetchSuccessUnsubscribe();
      fetchFailureUnsubscribe();
      sendSuccessUnsubscribe();
      sendFailureUnsubscribe();
      invitationCanceledUnsubscribe();
      invitationInvalidatedUnsubscribe();
      invitationResentUnsubscribe();
      invitationValidatedUnsubscribe();
      invitationsClearedUnsubscribe();
    };
  }, [isInitialized]);
  
  const checkInvite = useCallback(async (inviteId) => {
    if (!inviteId) {
      setInviteError('ID do convite não fornecido');
      return null;
    }

    setCheckingInvite(true);
    setInviteError(null);

    try {
      const inviteService = serviceLocator.get('invites');
      const response = await inviteService.checkInvite(inviteId);
      setInviteData(response.valid ? response.invite : null);
      
      if (!response.valid) {
        setInviteError(response.message || 'Convite inválido');
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao verificar convite:', error);
      setInviteError('Não foi possível verificar este convite');
      return { valid: false, message: error.message };
    } finally {
      setCheckingInvite(false);
    }
  }, []);

  // Métodos de API expostos para componentes de forma segura e consistente
  const getSentInvitations = useCallback(() => {
    if (!isAuthenticated) return Promise.resolve([]);
    
    try {
      const inviteService = serviceLocator.get('invites');
      return inviteService.getSentInvitations();
    } catch (error) {
      console.error('Erro ao obter serviço de convites:', error);
      return Promise.resolve([]);
    }
  }, [isAuthenticated]);
  
  const getInviteById = useCallback((inviteId) => {
    try {
      const inviteService = serviceLocator.get('invites');
      return inviteService.getInviteById(inviteId);
    } catch (error) {
      console.error('Erro ao obter serviço de convites:', error);
      return Promise.reject(error);
    }
  }, []);
  
  const sendInvitation = useCallback(async (invitationData) => {
    if (!isAuthenticated) return Promise.reject(new Error('Não autenticado'));
    
    try {
      const inviteService = serviceLocator.get('invites');
      const response = await inviteService.sendInvitation(invitationData);
      
      // Atualizar a lista de convites enviados
      dispatch({
        type: INVITATION_ACTIONS.SEND_SUCCESS,
        payload: {
          invitation: response,
          sentInvitations: [...state.sentInvitations, response]
        }
      });
      
      return response;
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      return Promise.reject(error);
    }
  }, [isAuthenticated, state.sentInvitations]);
  
  const cancelInvitation = useCallback((inviteId) => {
    if (!isAuthenticated) return Promise.reject(new Error('Não autenticado'));
    
    try {
      const inviteService = serviceLocator.get('invites');
      return inviteService.cancelInvitation(inviteId);
    } catch (error) {
      console.error('Erro ao cancelar convite:', error);
      return Promise.reject(error);
    }
  }, [isAuthenticated]);
  
  const resendInvitation = useCallback((inviteId) => {
    if (!isAuthenticated) return Promise.reject(new Error('Não autenticado'));
    
    try {
      const inviteService = serviceLocator.get('invites');
      return inviteService.resendInvitation(inviteId);
    } catch (error) {
      console.error('Erro ao reenviar convite:', error);
      return Promise.reject(error);
    }
  }, [isAuthenticated]);
  
  const validateInvite = useCallback((inviteId, email, nome) => {
    try {
      const inviteService = serviceLocator.get('invites');
      return inviteService.validateInvite(inviteId, email, nome);
    } catch (error) {
      console.error('Erro ao validar convite:', error);
      return Promise.reject(error);
    }
  }, []);
  
  const invalidateInvite = useCallback((inviteId) => {
    try {
      const inviteService = serviceLocator.get('invites');
      return inviteService.invalidateInvite(inviteId);
    } catch (error) {
      console.error('Erro ao invalidar convite:', error);
      return Promise.reject(error);
    }
  }, []);
  
  const value = {
    ...state,
    invitations: state.sentInvitations,
    sentInvitations: state.sentInvitations,
    receivedInvitations: state.receivedInvitations,
    isLoading: state.isLoading,
    error: state.error,
    isInitialized,
    checkingInvite,
    inviteData,
    inviteError,
    checkInvite,
    getSentInvitations,
    getInviteById,
    sendInvitation,
    cancelInvitation,
    resendInvitation,
    validateInvite,
    invalidateInvite,
  };
  
  return (
    <InviteContext.Provider value={value}>
      {children}
    </InviteContext.Provider>
  );
};

export const useInvites = () => {
  const context = useContext(InviteContext);
  if (!context) {
    throw new Error('useInvites must be used within an InviteProvider');
  }
  return context;
};