// // src/context/ConnectionContext.js
// import React, { createContext, useContext, useMemo, useCallback, useReducer, useState } from 'react';
// import { useAuth } from './AuthContext';
// import connectionService from '../services/connectionService';
// import inviteService from '../services/inviteService';
// import { showToast, showPromiseToast } from '../utils/toastUtils';
// import { useCachedResource, globalCache } from '../utils/cache/cacheManager';
// // import { useServiceInit } from './ServiceInitializationProvider';
// // import { useRootState } from './RootStateProvider';

// const ConnectionContext = createContext();

// // Cache configuration
// const CACHE_CONFIG = {
//   CONNECTIONS_KEY: 'user:connections',
//   INVITATIONS_KEY: 'user:invitations',
//   CACHE_TIME: 30 * 60 * 1000, // 30 minutes
//   STALE_TIME: 5 * 60 * 1000   // 5 minutes
// };

// // Action types for connection state management
// const CONNECTION_ACTIONS = {
//   FETCH_START: 'FETCH_START',
//   FETCH_SUCCESS: 'FETCH_SUCCESS',
//   FETCH_FAILURE: 'FETCH_FAILURE',
//   UPDATE_FRIENDS: 'UPDATE_FRIENDS',
//   UPDATE_BEST_FRIENDS: 'UPDATE_BEST_FRIENDS',
//   UPDATE_INVITATIONS: 'UPDATE_INVITATIONS',
//   SET_ERROR: 'SET_ERROR',
//   SET_LOADING: 'SET_LOADING',
//   CLEAR_STATE: 'CLEAR_STATE'
// };

// // Initial state for connection context
// const initialConnectionState = {
//   friends: [],
//   bestFriends: [],
//   invitations: [],
//   loading: true,
//   error: null,
//   lastUpdated: null
// };

// // Reducer for handling connection state changes
// const connectionReducer = (state, action) => {
//   switch (action.type) {
//     case CONNECTION_ACTIONS.FETCH_START:
//       return {
//         ...state,
//         loading: true,
//         error: null
//       };
      
//     case CONNECTION_ACTIONS.FETCH_SUCCESS:
//       return {
//         ...state,
//         ...action.payload,
//         loading: false,
//         error: null,
//         lastUpdated: Date.now()
//       };
    
//     case CONNECTION_ACTIONS.FETCH_FAILURE:
//       return {
//         ...state,
//         loading: false,
//         error: action.payload,
//         lastUpdated: Date.now()
//       };

//     case CONNECTION_ACTIONS.UPDATE_FRIENDS:
//       return {
//         ...state,
//         friends: action.payload,
//         lastUpdated: Date.now()
//       };

//     case CONNECTION_ACTIONS.UPDATE_BEST_FRIENDS:
//       return {
//         ...state,
//         bestFriends: action.payload,
//         lastUpdated: Date.now()
//       };

//     case CONNECTION_ACTIONS.UPDATE_INVITATIONS:
//       return {
//         ...state,
//         invitations: action.payload,
//         lastUpdated: Date.now()
//       };

//     case CONNECTION_ACTIONS.SET_ERROR:
//       return {
//         ...state,
//         error: action.payload,
//         lastUpdated: Date.now()
//       };

//     case CONNECTION_ACTIONS.SET_LOADING:
//       return {
//         ...state,
//         loading: action.payload
//       };

//     case CONNECTION_ACTIONS.CLEAR_STATE:
//       return {
//         ...initialConnectionState,
//         loading: false,
//         lastUpdated: Date.now()
//       };

//     default:
//       return state;
//   }
// };

// export const ConnectionProvider = ({ children }) => {
//   const { currentUser } = useAuth();
//   const { syncStateUpdate, invalidateCache } = useRootState();
//   const [state, dispatch] = useReducer(connectionReducer, initialConnectionState);
//   const [connectionReady, setConnectionReady] = useState(false);
//   const { initializeService, CRITICAL_SERVICES } = useServiceInit();

//   const userId = currentUser?.uid;

//   // Cache key for current user's connections
//   const cacheKey = useMemo(() => 
//     userId ? `${CACHE_CONFIG.CONNECTIONS_KEY}:${userId}` : null
//   , [userId]);

//   // Initialize connection service
//   React.useEffect(() => {
//     initializeService(CRITICAL_SERVICES.CONNECTIONS, async () => {
//       if (!userId) {
//         dispatch({ type: CONNECTION_ACTIONS.CLEAR_STATE });
//         setConnectionReady(true);
//         return;
//       }

//       try {
//         dispatch({ type: CONNECTION_ACTIONS.FETCH_START });
        
//         const [connections, invitationsData] = await Promise.all([
//           connectionService.getConnectionsByUserId(userId),
//           inviteService.getSentInvitations(userId)
//         ]);

//         dispatch({
//           type: CONNECTION_ACTIONS.FETCH_SUCCESS,
//           payload: {
//             friends: connections.friends || [],
//             bestFriends: connections.bestFriends || [],
//             invitations: invitationsData || []
//           }
//         });

//         setConnectionReady(true);
//       } catch (error) {
//         dispatch({
//           type: CONNECTION_ACTIONS.FETCH_FAILURE,
//           payload: error.message
//         });
//         console.error('[ConnectionProvider] Initialization error:', error);
//       }
//     });
//   }, [userId, initializeService]);

//   // Function to clear connection caches
//   const clearConnectionCaches = useCallback(() => {
//     globalCache.invalidate(`${CACHE_CONFIG.CONNECTIONS_KEY}:${userId}`);
//     globalCache.invalidate(`${CACHE_CONFIG.INVITATIONS_KEY}:${userId}`);
//   }, [userId]);

//   // Best friend management
//   const addBestFriend = useCallback(async (friendId) => {
//     return showPromiseToast(
//       syncStateUpdate(async () => {
//         try {
//           await connectionService.addBestFriend(userId, friendId);
          
//           // Update state optimistically
//           const friendToAdd = state.friends.find(f => f.id === friendId);
//           dispatch({
//             type: CONNECTION_ACTIONS.UPDATE_BEST_FRIENDS,
//             payload: [...state.bestFriends, friendToAdd]
//           });
          
//           clearConnectionCaches();
//           return 'Amigo adicionado aos melhores amigos!';
//         } catch (error) {
//           console.error('Erro ao adicionar melhor amigo:', error);
//           throw new Error('Erro ao adicionar melhor amigo');
//         }
//       }),
//       {
//         loading: 'Adicionando aos melhores amigos...',
//         success: 'Amigo adicionado aos melhores amigos!',
//         error: 'Erro ao adicionar melhor amigo'
//       }
//     );
//   }, [userId, state.friends, state.bestFriends, syncStateUpdate, clearConnectionCaches]);

//   const removeBestFriend = useCallback(async (friendId) => {
//     return showPromiseToast(
//       syncStateUpdate(async () => {
//         try {
//           await connectionService.removeBestFriend(userId, friendId);
          
//           // Update state optimistically
//           dispatch({
//             type: CONNECTION_ACTIONS.UPDATE_BEST_FRIENDS,
//             payload: state.bestFriends.filter(f => f.id !== friendId)
//           });
          
//           clearConnectionCaches();
//           return 'Amigo removido dos melhores amigos!';
//         } catch (error) {
//           console.error('Erro ao remover melhor amigo:', error);
//           throw new Error('Erro ao remover melhor amigo');
//         }
//       }),
//       {
//         loading: 'Removendo dos melhores amigos...',
//         success: 'Amigo removido dos melhores amigos!',
//         error: 'Erro ao remover melhor amigo'
//       }
//     );
//   }, [userId, state.bestFriends, syncStateUpdate, clearConnectionCaches]);

//   // Connection management
//   const deleteConnection = useCallback(async (friendId) => {
//     return showPromiseToast(
//       syncStateUpdate(async () => {
//         try {
//           await connectionService.deleteActiveConnection(friendId);
          
//           // Update state optimistically
//           dispatch({
//             type: CONNECTION_ACTIONS.UPDATE_FRIENDS,
//             payload: state.friends.filter(f => f.id !== friendId)
//           });
          
//           dispatch({
//             type: CONNECTION_ACTIONS.UPDATE_BEST_FRIENDS,
//             payload: state.bestFriends.filter(f => f.id !== friendId)
//           });
          
//           clearConnectionCaches();
//           return 'Conexão removida com sucesso!';
//         } catch (error) {
//           console.error('Erro ao deletar conexão:', error);
//           throw new Error('Erro ao deletar conexão');
//         }
//       }),
//       {
//         loading: 'Removendo conexão...',
//         success: 'Conexão removida com sucesso!',
//         error: 'Erro ao remover conexão'
//       }
//     );
//   }, [state.friends, state.bestFriends, syncStateUpdate, clearConnectionCaches]);

//   const createRequestConnection = useCallback(async (targetUserId) => {
//     if (!userId) {
//       showToast('Usuário não autenticado', { type: 'error' });
//       return;
//     }

//     return showPromiseToast(
//       syncStateUpdate(async () => {
//         try {
//           const request = await connectionService.createRequestConnection(userId, targetUserId);
          
//           // Update invitations state
//           dispatch({
//             type: CONNECTION_ACTIONS.UPDATE_INVITATIONS,
//             payload: [...state.invitations, request]
//           });
          
//           clearConnectionCaches();
//           return 'Solicitação de amizade enviada!';
//         } catch (error) {
//           console.error('Erro ao criar solicitação de amizade:', error);
//           throw new Error('Erro ao enviar solicitação de amizade');
//         }
//       }),
//       {
//         loading: 'Enviando solicitação de amizade...',
//         success: 'Solicitação de amizade enviada!',
//         error: 'Erro ao enviar solicitação'
//       }
//     );
//   }, [userId, state.invitations, syncStateUpdate, clearConnectionCaches]);

//   const searchUsers = useCallback(async (query) => {
//     dispatch({ type: CONNECTION_ACTIONS.SET_LOADING, payload: true });
    
//     try {
//       const results = await connectionService.searchUsers(query);
//       return results;
//     } catch (error) {
//       console.error('Erro ao buscar usuários:', error);
//       showToast('Erro ao buscar usuários', { type: 'error' });
//       throw error;
//     } finally {
//       dispatch({ type: CONNECTION_ACTIONS.SET_LOADING, payload: false });
//     }
//   }, []);

//   // Function to refresh connection data
//   const refreshConnections = useCallback(async () => {
//     return syncStateUpdate(async () => {
//       dispatch({ type: CONNECTION_ACTIONS.FETCH_START });
      
//       try {
//         const [connections, invitationsData] = await Promise.all([
//           connectionService.getConnectionsByUserId(userId),
//           inviteService.getSentInvitations(userId)
//         ]);

//         dispatch({
//           type: CONNECTION_ACTIONS.FETCH_SUCCESS,
//           payload: {
//             friends: connections.friends || [],
//             bestFriends: connections.bestFriends || [],
//             invitations: invitationsData || []
//           }
//         });
//       } catch (error) {
//         dispatch({
//           type: CONNECTION_ACTIONS.FETCH_FAILURE,
//           payload: error.message
//         });
//         throw error;
//       }
//     });
//   }, [userId, syncStateUpdate]);

//   // Function to invalidate related caches
//   const invalidateRelatedCaches = useCallback(async () => {
//     await invalidateCache('user:*');
//     await invalidateCache('messages:*');
//     clearConnectionCaches();
//   }, [invalidateCache, clearConnectionCaches]);

//   // Context value
//   const value = useMemo(() => ({
//     friends: state.friends,
//     bestFriends: state.bestFriends,
//     invitations: state.invitations,
//     loading: state.loading,
//     error: state.error,
//     addBestFriend,
//     removeBestFriend,
//     deleteConnection,
//     createRequestConnection,
//     searchUsers,
//     refreshConnections,
//     invalidateRelatedCaches
//   }), [
//     state,
//     addBestFriend,
//     removeBestFriend,
//     deleteConnection,
//     createRequestConnection,
//     searchUsers,
//     refreshConnections,
//     invalidateRelatedCaches
//   ]);

//   return (
//     <ConnectionContext.Provider value={value}>
//       {children}
//     </ConnectionContext.Provider>
//   );
// };

// export const useConnections = () => {
//   const context = useContext(ConnectionContext);
//   if (context === undefined) {
//     throw new Error('useConnections must be used within a ConnectionProvider');
//   }
//   return context;
// };