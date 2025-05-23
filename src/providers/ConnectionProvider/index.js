// src/providers/ConnectionProvider/index.js
import React, { createContext, useRef, useContext, useReducer, useCallback, useMemo, useEffect, useState } from 'react';
import { initialConnectionState } from '../../core/constants/initialState';
import { connectionReducer } from '../../reducers/connection/connectionReducer';
import { CONNECTION_ACTIONS } from '../../core/constants/actions';
import { showToast, showPromiseToast } from '../../utils/toastUtils';
import { serviceEventHub, serviceLocator } from '../../core/services/BaseService';
import { CONNECTION_EVENTS } from '../../core/constants/events';

const ConnectionContext = createContext(null);
const MODULE_NAME = 'connections';

export const ConnectionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(connectionReducer, initialConnectionState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionsState, setConnectionsState] = useState();
  const [connectionsError, setConnectionsError] = useState(false);
   
  let connectionService;
   let serviceStore;
   let serviceCon;
   try {
    connectionService = serviceLocator.get('connections');
     serviceStore = serviceLocator.get('store').getState()?.auth;
     serviceCon = serviceLocator.get('store').getState()?.notifications;
 
   } catch (err) {
     console.error('Error accessing services:', err);
     setConnectionsError(err);
   }
 
   const { isAuthenticated, currentUser } = serviceStore || {};
   
   useEffect(() => {
    console.log("ConnectionProvider local state changed:", state);
  }, [state]);

  const isConnected = useCallback((userId) => {
    if (!userId) return false;
    
    // Verificar em ambas as listas (amigos e melhores amigos)
    return state.friends.some(friend => friend.id === userId || friend.uid === userId) || 
           state.bestFriends.some(friend => friend.id === userId || friend.uid === userId);
  }, [state.friends, state.bestFriends]);

 console.log('impressaono servico de conexoes: ', serviceCon);
  // // Inicializar o serviço de conexões
  useEffect(() => {
    async function initConnections() {
      if (isAuthenticated && currentUser) {
        try {
          // Carregar conexoes
          await connectionService.getConnections();
          setIsInitialized(true);
        } catch (error) {
          console.error('Failed to initialize connection service:', error);
          setIsInitialized(true);
        }
      }
    }
    
    if (isAuthenticated && currentUser && !isInitialized) {
      initConnections();
    } else if (!isAuthenticated && isInitialized) {
      // Resetar estado quando o usuário deslogar
      dispatch({ type: CONNECTION_ACTIONS.CLEAR_STATE });
      setIsInitialized(false);
    }
    
    return () => {
      // Não finalizamos o serviço aqui para não interferir com outros componentes que possam usá-lo
    };
  }, [isAuthenticated, currentUser, isInitialized]);

  // Escutar eventos do serviço de conexões
  useEffect(() => {
    // if (!connectionService.isInitialized) return;
    
    const fetchSuccessUnsubscribe = serviceEventHub.on(
      'connections', 
      CONNECTION_EVENTS.CONNECTIONS_FETCHED, 
      (data) => {
        console.log('useConnections()', data)
        dispatch({ 
          type: CONNECTION_ACTIONS.FETCH_CONNECTION_SUCCESS,
          payload: data
      });
      }
    );
    
    const fetchFailureUnsubscribe = serviceEventHub.on(
      'connections', 
      CONNECTION_EVENTS.FETCH_FAILURE, 
      (data) => {
        dispatch({ 
          type: CONNECTION_ACTIONS.FETCH_FAILURE, 
          payload: data.error 
        });
      }
    );
    
    const connectionUpdatedUnsubscribe = serviceEventHub.on(
      'connections', 
      CONNECTION_EVENTS.CONNECTION_UPDATED, 
      (data) => {
        // Atualizar listas de amigos com base no tipo de atualização
        if (data.type === 'bestFriend') {
          if (data.action === 'add') {
            dispatch({
              type: CONNECTION_ACTIONS.UPDATE_BEST_FRIENDS,
              payload: [...state.bestFriends, data.connection]
            });
            
            dispatch({
              type: CONNECTION_ACTIONS.UPDATE_FRIENDS,
              payload: state.friends.filter(f => f.id !== data.connection.id)
            });
          } else if (data.action === 'remove') {
            dispatch({
              type: CONNECTION_ACTIONS.UPDATE_FRIENDS,
              payload: [...state.friends, { ...data.connection, isBestFriend: false }]
            });
            
            dispatch({
              type: CONNECTION_ACTIONS.UPDATE_BEST_FRIENDS,
              payload: state.bestFriends.filter(f => f.id !== data.connection.id)
            });
          }
        }
      }
    );
    
    const connectionDeletedUnsubscribe = serviceEventHub.on(
      'connections', 
      CONNECTION_EVENTS.CONNECTION_DELETED, 
      (data) => {
        dispatch({
          type: CONNECTION_ACTIONS.UPDATE_FRIENDS,
          payload: state.friends.filter(f => f.id !== data.connectionId)
        });
        
        dispatch({
          type: CONNECTION_ACTIONS.UPDATE_BEST_FRIENDS,
          payload: state.bestFriends.filter(f => f.id !== data.connectionId)
        });
      }
    );
    
    const connectionRequestedUnsubscribe = serviceEventHub.on(
      'connections', 
      CONNECTION_EVENTS.CONNECTION_REQUESTED, 
      (data) => {
        dispatch({
          type: CONNECTION_ACTIONS.UPDATE_CONNECTIONS,
          payload: [...state.connections, data.connections]
        });
      }
    );
    
    const usersSearchCompletedUnsubscribe = serviceEventHub.on(
      'connections', 
      CONNECTION_EVENTS.USERS_SEARCH_COMPLETED, 
      (data) => {
        dispatch({
          type: CONNECTION_ACTIONS.SET_SEARCH_RESULTS,
          payload: data.results
        });
      }
    );
    
    return () => {
      fetchSuccessUnsubscribe();
      fetchFailureUnsubscribe();
      connectionUpdatedUnsubscribe();
      connectionDeletedUnsubscribe();
      connectionRequestedUnsubscribe();
      usersSearchCompletedUnsubscribe();
    };
  }, [isInitialized, state.friends, state.bestFriends, state.invitations]);
  
  const getConnectionsFromCache = useCallback((userId) => {
    const connectionService = serviceLocator.get('connections');
    return connectionService._connectionsCache.get(userId) || {};
  }, []);

  // Add a method to refresh the cache explicitly
  const refreshConnectionCache = useCallback(async () => {
    const connectionService = serviceLocator.get('connections');
    const currentUserId = connectionService.currentUser?.uid;
    
    if (currentUserId) {
      // Fetch fresh connections data from your API
      const freshData = await connectionService.apiService.get(`/connections/${currentUserId}`);
      
      // Update the cache
      connectionService._connectionsCache.set(currentUserId, freshData);
      
      // Force a re-render by updating the context value
      setConnectionsState(prevState => ({
        ...prevState,
        friends: freshData.activeConnections || [],
        bestFriends: freshData.bestFriends || [],
        pendingRequests: freshData.pendingRequests || []
      }));
    }
  }, []);

  const refreshConnections = useCallback(async () => {
    if (!currentUser) return false;
    
    dispatch({ type: CONNECTION_ACTIONS.FETCH_START });
    
    try {
      await connectionService.getConnections();
      return true;
    } catch (error) {
      console.error("Error refreshing connections:", error);
      return false;
    }
  }, [currentUser]);
  
  const addBestFriend = useCallback(async (friendId) => {
    if (!currentUser || !friendId) {
      showToast('Invalid user data', { type: 'error' });
      return;
    }
    
    return showPromiseToast(
      (async () => {
        try {
          // Atualização otimista
          const friendToPromote = state.friends.find(f => f.id === friendId);
          
          if (friendToPromote) {
            dispatch({
              type: CONNECTION_ACTIONS.UPDATE_BEST_FRIENDS,
              payload: [...state.bestFriends, { ...friendToPromote, isBestFriend: true }]
            });
            
            dispatch({
              type: CONNECTION_ACTIONS.UPDATE_FRIENDS,
              payload: state.friends.filter(f => f.id !== friendId)
            });
          }
          
          // Chamada ao serviço
          await connectionService.addBestFriend(friendId);
          
          return 'Friend added to best friends';
        } catch (error) {
          // Reverter a atualização otimista
          refreshConnections();
          throw new Error('Failed to add best friend');
        }
      })(),
      {
        loading: 'Adding to best friends...',
        success: 'Added to best friends',
        error: 'Failed to add to best friends'
      }
    );
  }, [currentUser, state.friends, state.bestFriends, refreshConnections]);
  
  const removeBestFriend = useCallback(async (friendId) => {
    if (!currentUser || !friendId) {
      showToast('Invalid user data', { type: 'error' });
      return;
    }
    
    return showPromiseToast(
      (async () => {
        try {
          // Atualização otimista
          const friendToDemote = state.bestFriends.find(f => f.id === friendId);
          
          if (friendToDemote) {
            dispatch({
              type: CONNECTION_ACTIONS.UPDATE_FRIENDS,
              payload: [...state.friends, { ...friendToDemote, isBestFriend: false }]
            });
            
            dispatch({
              type: CONNECTION_ACTIONS.UPDATE_BEST_FRIENDS,
              payload: state.bestFriends.filter(f => f.id !== friendId)
            });
          }
          
          // Chamada ao serviço
          await connectionService.removeBestFriend(friendId);
          
          return 'Friend removed from best friends';
        } catch (error) {
          // Reverter a atualização otimista
          refreshConnections();
          throw new Error('Failed to remove from best friends');
        }
      })(),
      {
        loading: 'Removing from best friends...',
        success: 'Removed from best friends',
        error: 'Failed to remove from best friends'
      }
    );
  }, [currentUser, state.friends, state.bestFriends, refreshConnections]);
  
  const deleteConnection = useCallback(async (friendId) => {
    if (!currentUser || !friendId) {
      showToast('Invalid user data', { type: 'error' });
      return;
    }
    
    return showPromiseToast(
      (async () => {
        try {
          // Atualização otimista
          dispatch({
            type: CONNECTION_ACTIONS.UPDATE_FRIENDS,
            payload: state.friends.filter(f => f.id !== friendId)
          });
          
          dispatch({
            type: CONNECTION_ACTIONS.UPDATE_BEST_FRIENDS,
            payload: state.bestFriends.filter(f => f.id !== friendId)
          });
          
          // Chamada ao serviço
          await connectionService.deleteConnection(friendId);
          
          return 'Connection deleted successfully';
        } catch (error) {
          // Reverter a atualização otimista
          refreshConnections();
          throw new Error('Failed to delete connection');
        }
      })(),
      {
        loading: 'Deleting connection...',
        success: 'Connection deleted',
        error: 'Failed to delete connection'
      }
    );
  }, [currentUser, state.friends, state.bestFriends, refreshConnections]);
  
  const acceptConnectionRequest = useCallback(async (requestId) => {
    if (!currentUser || !requestId) {
      showToast('Usuário não autenticado ou requisicao nao enviada', { type: 'error' });
      return false;
    }
    const senderId = requestId;
  
    return showPromiseToast(
      (async () => {
        try {
          const response = await connectionService.acceptRequest(senderId);
          
          // Atualizar estado local com o formato correto esperado pelo reducer
          dispatch({
            type: CONNECTION_ACTIONS.UPDATE_CONNECTIONS,
            payload: { 
              type: 'acceptedRequest',  // Adicionar o tipo esperado pelo reducer
              requestId, 
              connection: response,     // Renomear para 'connection' se necessário
              senderId                  // Incluir o senderId se necessário para atualizar a UI
            }
          });
          
          // Recarregar conexões após aceitar a solicitação
          await refreshConnections();
          
          return true;
        } catch (error) {
          console.error('Erro ao aceitar solicitação de conexão:', error);
          throw new Error('Falha ao aceitar solicitação');
        }
      })(),
      {
        loading: 'Aceitando solicitação...',
        success: 'Solicitação aceita com sucesso',
        error: 'Falha ao aceitar solicitação'
      }
    );
  }, [currentUser, dispatch, refreshConnections]);

  const rejectConnectionRequest = useCallback(async (requestId) => {
    if (!currentUser) {
      showToast('Usuário não autenticado', { type: 'error' });
      return false;
    }
    
    return showPromiseToast(
      (async () => {
        try {
          const response = await connectionService.rejectRequest(requestId);
          
          // Atualizar estado local
          dispatch({
            type: CONNECTION_ACTIONS.REJECT_CONNECTION_REQUEST,
            payload: { requestId, response }
          });
          
          return true;
        } catch (error) {
          console.error('Erro ao rejeitar solicitação de conexão:', error);
          throw new Error('Falha ao rejeitar solicitação');
        }
      })(),
      {
        loading: 'Rejeitando solicitação...',
        success: 'Solicitação rejeitada',
        error: 'Falha ao rejeitar solicitação'
      }
    );
  }, [currentUser, dispatch]);
  
  // Método para bloquear um usuário
  const blockUser = useCallback(async (userId) => {
    if (!currentUser) {
      showToast('Usuário não autenticado', { type: 'error' });
      return false;
    }
    
    return showPromiseToast(
      (async () => {
        try {
          const response = await connectionService.blockUser(userId);
          
          // Atualizar estado local
          dispatch({
            type: CONNECTION_ACTIONS.BLOCK_USER,
            payload: { userId, response }
          });
          
          return true;
        } catch (error) {
          console.error('Erro ao bloquear usuário:', error);
          throw new Error('Falha ao bloquear usuário');
        }
      })(),
      {
        loading: 'Bloqueando usuário...',
        success: 'Usuário bloqueado',
        error: 'Falha ao bloquear usuário'
      }
    );
  }, [currentUser, dispatch]);

  const createConnectionRequest = useCallback(async (targetUserId) => {
    if (!currentUser || !targetUserId) {
      showToast('Dados de usuário inválidos', { type: 'error' });
      return;
    }
    
    return showPromiseToast(
      (async () => {
        try {
          await connectionService.createConnectionRequest(targetUserId);
          return 'Solicitação de conexão enviada';
        } catch (error) {
          // Tratar diferentes tipos de erros com base nos códigos
          if (error.code === 'ALREADY_CONNECTED') {
            // Já são amigos - podemos navegar para o perfil ou destacar na lista
            dispatch({
              type: CONNECTION_ACTIONS.HIGHLIGHT_CONNECTION,
              payload: { connectionId: targetUserId }
            });
            
            // Mensagem informativa
            throw new Error('Vocês já são amigos.');
          } 
          else if (error.code === 'REQUEST_ALREADY_SENT') {
            // Solicitação já enviada - podemos destacar a solicitação pendente
            dispatch({
              type: CONNECTION_ACTIONS.HIGHLIGHT_OUTGOING_REQUEST,
              payload: { requestId: error.requestId }
            });
            
            // Mensagem informativa
            throw new Error('Você já enviou uma solicitação para este usuário.');
          }
          else if (error.code === 'REQUEST_ALREADY_RECEIVED') {
            // O outro usuário já enviou uma solicitação - podemos destacar na lista de pendentes
            dispatch({
              type: CONNECTION_ACTIONS.HIGHLIGHT_INCOMING_REQUEST,
              payload: { requestId: error.requestId }
            });
            
            // Abrir modal ou navegar para a seção de solicitações pendentes
            dispatch({
              type: CONNECTION_ACTIONS.SHOW_PENDING_REQUESTS_MODAL,
              payload: { highlightRequestId: error.requestId }
            });
            
            // Mensagem informativa
            throw new Error('Este usuário já enviou uma solicitação para você. Você pode aceitá-la na sua lista de solicitações pendentes.');
          }
          else {
            // Erro genérico
            throw new Error('Falha ao enviar solicitação de conexão');
          }
        }
      })(),
      {
        loading: 'Enviando solicitação de conexão...',
        success: 'Solicitação de conexão enviada',
        error: (error) => error.message // Usar a mensagem de erro específica
      }
    );
  }, [currentUser, dispatch]);
  
  // Buscar usuários
  const searchUsers = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      dispatch({ 
        type: CONNECTION_ACTIONS.CLEAR_SEARCH_RESULTS 
      });
      return [];
    }
    
    dispatch({ 
      type: CONNECTION_ACTIONS.SET_LOADING, 
      payload: { searching: true } 
    });
    
    try {
      const results = await connectionService.searchUsers(query);
      return results;
    } catch (error) {
      dispatch({
        type: CONNECTION_ACTIONS.SET_ERROR,
        payload: error.message
      });
      
      showToast('Failed to search users', { type: 'error' });
      return [];
    } finally {
      dispatch({ 
        type: CONNECTION_ACTIONS.SET_LOADING, 
        payload: { searching: false } 
      });
    }
  }, []);

    // Implementação do hook useSmartSearch
    const searchTimeoutRef = useRef(null);
    const lastSearchTimeRef = useRef(0);
    const abortControllerRef = useRef(null);

    const smartSearchUsers = useCallback(async (query, options = {}) => {
      // Cancelar busca anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Limpar timeout anterior
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Validar entrada
      if (!query || query.trim().length === 0) {
        dispatch({ type: CONNECTION_ACTIONS.CLEAR_SEARCH_RESULTS });
        return Promise.resolve([]);
      }
      
      // Sinalizar início da busca
      dispatch({ 
        type: CONNECTION_ACTIONS.SET_LOADING, 
        payload: { searching: true } 
      });
      
      // Calcular atraso baseado em throttling
      const now = Date.now();
      const timeSinceLastSearch = now - lastSearchTimeRef.current;
      const minInterval = 500; // ms
      
      const delay = Math.max(
        options.immediate ? 0 : 300, // debounce padrão ou imediato
        timeSinceLastSearch < minInterval ? minInterval - timeSinceLastSearch : 0
      );
      
      return new Promise((resolve, reject) => {
        searchTimeoutRef.current = setTimeout(async () => {
          lastSearchTimeRef.current = Date.now();
          
          try {
            const results = await connectionService.searchUsers(query);
            
            dispatch({
              type: CONNECTION_ACTIONS.SET_SEARCH_RESULTS,
              payload: results
            });
            
            resolve(results);
          } catch (error) {
            dispatch({
              type: CONNECTION_ACTIONS.SET_ERROR,
              payload: error.message
            });
            
            reject(error);
          } finally {
            dispatch({ 
              type: CONNECTION_ACTIONS.SET_LOADING, 
              payload: { searching: false } 
            });
          }
        }, delay);
      });
    }, [dispatch]);
    
    // Limpar recursos ao desmontar
    useEffect(() => {
      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }, [isAuthenticated, currentUser, isInitialized]);

    const getPendingRequests = useCallback(async () => {
      if (!currentUser?.uid) {
        return [];
      }
      
      try {
        return await connectionService.getPendingRequests();
      } catch (error) {
        console.error('Erro ao buscar solicitações pendentes:', error);
        return [];
      }
    }, [currentUser?.uid, connectionService]);
  
    const getPendingRequestsAsSender = useCallback(async () => {
      if (!currentUser?.uid) {
        return [];
      }
      
      try {
        return await connectionService.getRequestsAsSender('pending');
      } catch (error) {
        console.error('Erro ao buscar solicitações enviadas:', error);
        return [];
      }
    }, [currentUser?.uid, connectionService]);

  // Memoizar o valor do contexto
  const contextValue = useMemo(() => ({
    state,
    bestFriends: state.bestFriends,
    friends: state.friends,
    cacheStatus: state.cacheStatus,
    connectionHistory: state.connectionHistory,
    loading: state.loading,
    pendingRequests: state.pendingRequests,
    receivedRequests: state.receivedRequests,
    sentRequests: state.sentRequests,
    isInitialized,
    isConnected,
    addBestFriend,
    removeBestFriend,
    deleteConnection,
    getPendingRequests,
    getPendingRequestsAsSender,
    createConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    blockUser,
    searchUsers,
    smartSearchUsers, 
    refreshConnections
  }), [
    state,
    isInitialized,
    isConnected,
    addBestFriend,
    removeBestFriend,
    deleteConnection,
    getPendingRequests,
    getPendingRequestsAsSender,
    createConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    blockUser,
    searchUsers,
    smartSearchUsers,
    refreshConnections,
    getConnectionsFromCache,
    refreshConnectionCache
  ]);
  
  return (
    <ConnectionContext.Provider value={contextValue}>
      {children}
    </ConnectionContext.Provider>
  );
};

export function useConnections() {
  const context = useContext(ConnectionContext);
  
  if (context === undefined) {
    throw new Error('useConnections must be used within a ConnectionProvider');
  }
  
  return context;
}