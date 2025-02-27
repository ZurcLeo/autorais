import React, { useReducer, useCallback, useMemo, useEffect, useState } from 'react';
import { ConnectionContext } from '../context/ConnectionContext';
import { connectionReducer, initialConnectionState, CONNECTION_ACTIONS } from '../reducers/connectionReducer';
import { connectionManager } from '../services/connectionManager';
import { connectionService } from '../services/connectionService';
import { showToast, showPromiseToast } from '../../utils/toastUtils';
import { useAuth } from '../../providers/AuthProvider';
import { coreLogger } from '../../core/logging/CoreLogger';
import { useServiceInitialization } from '../../core/initialization/ServiceInitializationProvider';
import { inviteService } from '../../services/inviteService';

export const ConnectionProvider = ({ children }) => {
  const { user } = useAuth(); 
  const userId = user?.uid;
  const [state, dispatch] = useReducer(connectionReducer, initialConnectionState);
  const { contextValueC } = useServiceInitialization();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Inicialização 
  useEffect(() => {
    // Se não tivermos usuário, limpar o estado
    if (!userId) {
      dispatch({ type: CONNECTION_ACTIONS.CLEAR_STATE });
      return;
    }
    
    // Se já inicializamos, não precisamos fazer de novo
    if (isInitialized) return;
    
    const initializeConnectionData = async () => {
      dispatch({ type: CONNECTION_ACTIONS.FETCH_START });
      
      try {
        // Buscar conexões e convites em paralelo
        const [connectionsData, invitationsData] = await Promise.all([
          connectionManager.getConnections(userId),
          inviteService.getSentInvitations(userId)
        ]);
        
        // Processar dados das conexões para separar amigos e melhores amigos
        const { friends, bestFriends } = connectionManager.processConnectionData(connectionsData);
        
        dispatch({
          type: CONNECTION_ACTIONS.FETCH_SUCCESS,
          payload: {
            friends,
            bestFriends,
            invitations: invitationsData || []
          }
        });
        
        setIsInitialized(true);
      } catch (error) {
        dispatch({
          type: CONNECTION_ACTIONS.FETCH_FAILURE,
          payload: error.message
        });
        
        coreLogger.logServiceError('connections', error, {
          context: 'initializeConnectionData',
          userId
        });
        
        showToast('Failed to load connection data', { type: 'error' });
      }
    };
    
    initializeConnectionData();
  }, [userId, isInitialized]);
  
  // Atualizar quando o usuário mudar
  useEffect(() => {
    if (userId && isInitialized) {
      setIsInitialized(false);
    }
  }, [userId]);
  
  // Adicionar como melhor amigo
  const addBestFriend = useCallback(async (friendId) => {
    if (!userId || !friendId) {
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
          
          // Chamada à API
          await connectionManager.addBestFriend(userId, friendId);
          
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
  }, [userId, state.friends, state.bestFriends]);
  
  // Remover dos melhores amigos
  const removeBestFriend = useCallback(async (friendId) => {
    if (!userId || !friendId) {
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
          
          // Chamada à API
          await connectionManager.removeBestFriend(userId, friendId);
          
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
  }, [userId, state.friends, state.bestFriends]);
  
  // Excluir conexão
  const deleteConnection = useCallback(async (friendId) => {
    if (!userId || !friendId) {
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
          
          // Chamada à API
          await connectionManager.deleteConnection(userId, friendId);
          
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
  }, [userId, state.friends, state.bestFriends]);
  
  // Criar solicitação de conexão
  const createConnectionRequest = useCallback(async (targetUserId) => {
    if (!userId || !targetUserId) {
      showToast('Invalid user data', { type: 'error' });
      return;
    }
    
    return showPromiseToast(
      (async () => {
        try {
          const result = await connectionManager.createConnectionRequest(userId, targetUserId);
          
          // Adicionar à lista de convites
          dispatch({
            type: CONNECTION_ACTIONS.UPDATE_INVITATIONS,
            payload: [...state.invitations, result]
          });
          
          return 'Connection request sent';
        } catch (error) {
          coreLogger.logServiceError('connections', error, {
            context: 'createConnectionRequest',
            userId,
            targetUserId
          });
          
          throw new Error('Failed to send connection request');
        }
      })(),
      {
        loading: 'Sending connection request...',
        success: 'Connection request sent',
        error: 'Failed to send connection request'
      }
    );
  }, [userId, state.invitations]);
  
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
      const results = await connectionManager.searchUsers(query, { userId });
      
      dispatch({
        type: CONNECTION_ACTIONS.SET_SEARCH_RESULTS,
        payload: results
      });
      
      return results;
    } catch (error) {
      dispatch({
        type: CONNECTION_ACTIONS.SET_ERROR,
        payload: error.message
      });
      
      showToast('Failed to search users', { type: 'error' });
      return [];
    }
  }, [userId]);
  
  // Atualizar dados de conexões
  const refreshConnections = useCallback(async () => {
    if (!userId) return;
    
    dispatch({ type: CONNECTION_ACTIONS.FETCH_START });
    
    try {
      // Invalidar caches primeiro
      connectionManager.invalidateConnectionCache(userId);
      
      // Buscar dados atualizados
      const [connectionsData, invitationsData] = await Promise.all([
        connectionManager.getConnections(userId),
        inviteService.getSentInvitations(userId)
      ]);
      
      // Processar dados das conexões
      const { friends, bestFriends } = connectionManager.processConnectionData(connectionsData);
      
      dispatch({
        type: CONNECTION_ACTIONS.FETCH_SUCCESS,
        payload: {
          friends,
          bestFriends,
          invitations: invitationsData || []
        }
      });
      
      return true;
    } catch (error) {
      dispatch({
        type: CONNECTION_ACTIONS.FETCH_FAILURE,
        payload: error.message
      });
      
      coreLogger.logServiceError('connections', error, {
        context: 'refreshConnections',
        userId
      });
      
      return false;
    }
  }, [userId]);
  
  // Memoizar o valor do contexto
  const contextValue = useMemo(() => ({
    friends: state.friends,
    bestFriends: state.bestFriends,
    invitations: state.invitations,
    searchResults: state.searchResults,
    loading: state.loading,
    searching: state.searching,
    error: state.error,
    addBestFriend,
    removeBestFriend,
    deleteConnection,
    createConnectionRequest,
    searchUsers,
    refreshConnections
  }), [
    state,
    addBestFriend,
    removeBestFriend,
    deleteConnection,
    createConnectionRequest,
    searchUsers,
    refreshConnections
  ]);
  
  return (
    <ConnectionContext.Provider value={contextValue}>
      {children}
    </ConnectionContext.Provider>
  );
};