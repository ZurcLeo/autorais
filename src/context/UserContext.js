// import React, { createContext, useState, useMemo, useContext, useReducer, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import userService from '../services/userService';
// import { globalCache, invalidate } from '../utils/cache/cacheManager';
// import { showToast } from '../utils/toastUtils';
// import { syncStateUpdate } from '../utils/stateSync';

// const UserContext = createContext();

// // Define cache configuration constants
// const USER_CACHE_CONFIG = {
//   USER_PROFILE: 'user:profile',
//   USERS_LIST: 'users:list',
//   USER_PREFERENCES: 'user:preferences',
//   CACHE_TIME: 30 * 60 * 1000, // 30 minutes
//   STALE_TIME: 5 * 60 * 1000   // 5 minutes
// };

// // Action types for user state management
// const USER_ACTIONS = {
//   FETCH_START: 'FETCH_START',
//   FETCH_SUCCESS: 'FETCH_SUCCESS',
//   FETCH_FAILURE: 'FETCH_FAILURE',
//   UPDATE_USER: 'UPDATE_USER',
//   SET_ERROR: 'SET_ERROR',
//   SET_LOADING: 'SET_LOADING',
//   CLEAR_USER: 'CLEAR_USER'
// };

// // Initial state for user context
// const initialUserState = {
//   currentUser: null,
//   usersList: [],
//   isLoading: true,
//   error: null,
//   lastUpdated: null
// };

// // Reducer for handling user state changes
// const userReducer = (state, action) => {
//   switch (action.type) {
//     case USER_ACTIONS.FETCH_START:
//       return {
//         ...state,
//         isLoading: true,
//         error: null
//       };
      
//     case USER_ACTIONS.FETCH_SUCCESS:
//       return {
//         ...state,
//         currentUser: action.payload,
//         isLoading: false,
//         error: null,
//         lastUpdated: Date.now()
//       };
    
//     case USER_ACTIONS.FETCH_FAILURE:
//       return {
//         ...state,
//         isLoading: false,
//         error: action.payload,
//         lastUpdated: Date.now()
//       };

//     case USER_ACTIONS.UPDATE_USER:
//       return {
//         ...state,
//         currentUser: {
//           ...state.currentUser,
//           ...action.payload
//         },
//         lastUpdated: Date.now()
//       };

//     case USER_ACTIONS.SET_ERROR:
//       return {
//         ...state,
//         error: action.payload,
//         lastUpdated: Date.now()
//       };

//     case USER_ACTIONS.SET_LOADING:
//       return {
//         ...state,
//         isLoading: action.payload
//       };

//     case USER_ACTIONS.CLEAR_USER:
//       return {
//         ...initialUserState,
//         isLoading: false,
//         lastUpdated: Date.now()
//       };

//     default:
//       return state;
//   }
// };

// export const UserProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(userReducer, initialUserState);
//   const [userReady, setUserReady] = useState(false);

//   const navigate = useNavigate();

//   // Function to clear all user-related caches
//   const clearUserCaches = useCallback(() => {
//     Object.values(USER_CACHE_CONFIG).forEach(key => {
//       if (typeof key === 'string') {
//         globalCache.invalidate(key);
//       }
//     });
//   }, []);

//   // Function to invalidate dependent states on user changes
// //   const invalidateDependentStates = useCallback(() => {
// //     return syncStateUpdate(async () => {
// //       await Promise.all([
// //         invalidate('notifications:*'),
// //         invalidate('messages:*'),
// //         invalidate('connections:*'),
// //         invalidate('interests:*')
// //       ]);
// //     }, { id: 'user-state-change' });
// //   }, [syncStateUpdate, invalidate]);

//   // Initialize user service
//   useEffect(() => {
//     initializeService(CRITICAL_SERVICES.USER, async () => {
//       try {
//         dispatch({ type: USER_ACTIONS.FETCH_START });
//         const userData = await userService.getCurrentUser();
        
//         if (userData) {
//           dispatch({ 
//             type: USER_ACTIONS.FETCH_SUCCESS, 
//             payload: userData 
//           });
//           setUserReady(true);
//         } else {
//           dispatch({ type: USER_ACTIONS.CLEAR_USER });
//           setUserReady(true);
//         }
//       } catch (error) {
//         dispatch({ 
//           type: USER_ACTIONS.FETCH_FAILURE, 
//           payload: error.message 
//         });
//         console.error('[UserProvider] Initialization error:', error);
//       }
//     });
//   }, [initializeService]);

//   // Get user by ID with caching
//   const getUserById = useCallback(async (userId) => {
//     return syncStateUpdate(async () => {
//       try {
//         dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
//         const user = await userService.getUserById(userId);
//         return user;
//       } catch (error) {
//         showToast('Error fetching user data', { type: 'error' });
//         throw error;
//       } finally {
//         dispatch({ type: USER_ACTIONS.SET_LOADING, payload: false });
//       }
//     }, { id: 'get-user-by-id' });
//   }, [syncStateUpdate]);

//   // Update user data
//   const updateUser = useCallback(async (userId, updates) => {
//     return syncStateUpdate(async () => {
//       try {
//         const updatedUser = await userService.updateUser(userId, updates);
        
//         dispatch({ 
//           type: USER_ACTIONS.UPDATE_USER, 
//           payload: updatedUser 
//         });

//         showToast('User updated successfully', { type: 'success' });
//         return updatedUser;
//       } catch (error) {
//         showToast('Error updating user', { type: 'error' });
//         dispatch({ 
//           type: USER_ACTIONS.SET_ERROR, 
//           payload: error.message 
//         });
//         throw error;
//       }
//     }, { id: 'update-user-data' });
//   }, [syncStateUpdate]);

//   // Upload profile picture
//   const uploadProfilePicture = useCallback(async (userId, file) => {
//     return syncStateUpdate(async () => {
//       try {
//         const result = await userService.uploadProfilePicture(userId, file);
//         dispatch({
//           type: USER_ACTIONS.UPDATE_USER,
//           payload: { profilePicture: result.url }
//         });
//         showToast('Profile picture updated successfully', { type: 'success' });
//         return result;
//       } catch (error) {
//         showToast('Error uploading profile picture', { type: 'error' });
//         throw error;
//       }
//     }, { id: 'upload-profile-picture' });
//   }, [syncStateUpdate]);

//   // Delete user account
//   const deleteAccount = useCallback(async (userId) => {
//     return syncStateUpdate(async () => {
//       try {
//         await userService.deleteUser(userId);
//         dispatch({ type: USER_ACTIONS.CLEAR_USER });
//         clearUserCaches();
//         navigate('/login');
//         showToast('Account deleted successfully', { type: 'success' });
//       } catch (error) {
//         showToast('Error deleting account', { type: 'error' });
//         throw error;
//       }
//     }, { id: 'delete-account' });
//   }, [navigate, clearUserCaches, syncStateUpdate]);

//   const value = useMemo(() => ({
//     currentUser: state.currentUser,
//     usersList: state.usersList,
//     isLoading: state.isLoading,
//     error: state.error,
//     getUserById,
//     updateUser,
//     uploadProfilePicture,
//     deleteAccount,
//     invalidateDependentStates
//   }), [
//     state,
//     getUserById,
//     updateUser,
//     uploadProfilePicture,
//     deleteAccount,
//     invalidateDependentStates
//   ]);

//   return (
//     <UserContext.Provider value={value}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUser = () => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error('useUser must be used within UserProvider');
//   }
//   return context;
// };