// // src/context/DashboardContext.js
// import React, { createContext, useContext, useReducer, useState, useMemo, useCallback } from 'react';
// import { useAuth } from './AuthContext';
// import getDashboardData from '../services/dashboardService';
// import { showToast } from '../utils/toastUtils';
// // import { useServiceInit } from './ServiceInitializationProvider';
// // import { useRootState } from './RootStateProvider';

// const DashboardContext = createContext();

// // Cache configuration
// const CACHE_CONFIG = {
//   DASHBOARD_KEY: 'user:dashboard',
//   CACHE_TIME: 5 * 60 * 1000, // 5 minutes
//   STALE_TIME: 30 * 1000     // 30 seconds
// };

// // Action types for dashboard state management
// const DASHBOARD_ACTIONS = {
//   FETCH_START: 'FETCH_START',
//   FETCH_SUCCESS: 'FETCH_SUCCESS',
//   FETCH_FAILURE: 'FETCH_FAILURE',
//   UPDATE_MESSAGES: 'UPDATE_MESSAGES',
//   UPDATE_NOTIFICATIONS: 'UPDATE_NOTIFICATIONS',
//   UPDATE_CONNECTIONS: 'UPDATE_CONNECTIONS',
//   UPDATE_CAIXINHAS: 'UPDATE_CAIXINHAS',
//   SET_ERROR: 'SET_ERROR',
//   SET_LOADING: 'SET_LOADING',
//   CLEAR_STATE: 'CLEAR_STATE'
// };

// // Initial state for dashboard context
// const initialDashboardState = {
//   messages: [],
//   notifications: [],
//   connections: {
//     friends: [],
//     bestFriends: []
//   },
//   caixinhas: [],
//   loading: true,
//   error: null,
//   lastUpdated: null
// };

// // Reducer for handling dashboard state changes
// const dashboardReducer = (state, action) => {
//   switch (action.type) {
//     case DASHBOARD_ACTIONS.FETCH_START:
//       return {
//         ...state,
//         loading: true,
//         error: null
//       };
      
//     case DASHBOARD_ACTIONS.FETCH_SUCCESS:
//       return {
//         ...state,
//         ...action.payload,
//         loading: false,
//         error: null,
//         lastUpdated: Date.now()
//       };
    
//     case DASHBOARD_ACTIONS.FETCH_FAILURE:
//       return {
//         ...state,
//         loading: false,
//         error: action.payload,
//         lastUpdated: Date.now()
//       };

//     case DASHBOARD_ACTIONS.UPDATE_MESSAGES:
//       return {
//         ...state,
//         messages: action.payload,
//         lastUpdated: Date.now()
//       };

//     case DASHBOARD_ACTIONS.UPDATE_NOTIFICATIONS:
//       return {
//         ...state,
//         notifications: action.payload,
//         lastUpdated: Date.now()
//       };

//     case DASHBOARD_ACTIONS.UPDATE_CONNECTIONS:
//       return {
//         ...state,
//         connections: action.payload,
//         lastUpdated: Date.now()
//       };

//     case DASHBOARD_ACTIONS.UPDATE_CAIXINHAS:
//       return {
//         ...state,
//         caixinhas: action.payload,
//         lastUpdated: Date.now()
//       };

//     case DASHBOARD_ACTIONS.SET_ERROR:
//       return {
//         ...state,
//         error: action.payload,
//         lastUpdated: Date.now()
//       };

//     case DASHBOARD_ACTIONS.SET_LOADING:
//       return {
//         ...state,
//         loading: action.payload
//       };

//     case DASHBOARD_ACTIONS.CLEAR_STATE:
//       return {
//         ...initialDashboardState,
//         loading: false,
//         lastUpdated: Date.now()
//       };

//     default:
//       return state;
//   }
// };

// export const DashboardProvider = ({ children }) => {
//   const { currentUser } = useAuth();
//   const { syncStateUpdate, invalidateCache } = useRootState();
//   const [state, dispatch] = useReducer(dashboardReducer, initialDashboardState);
//   const [dashboardReady, setDashboardReady] = useState(false);
//   const { initializeService, CRITICAL_SERVICES } = useServiceInit();

//   const userId = currentUser?.uid;

//   // Initialize dashboard service
//   React.useEffect(() => {
//     initializeService(CRITICAL_SERVICES.DASHBOARD, async () => {
//       if (!userId) {
//         dispatch({ type: DASHBOARD_ACTIONS.CLEAR_STATE });
//         setDashboardReady(true);
//         return;
//       }

//       try {
//         dispatch({ type: DASHBOARD_ACTIONS.FETCH_START });
//         const dashboardData = await getDashboardData(userId);
        
//         dispatch({
//           type: DASHBOARD_ACTIONS.FETCH_SUCCESS,
//           payload: {
//             messages: dashboardData.messages || [],
//             notifications: dashboardData.notifications || [],
//             connections: dashboardData.connections || { friends: [], bestFriends: [] },
//             caixinhas: dashboardData.caixinhas || []
//           }
//         });

//         setDashboardReady(true);
//       } catch (error) {
//         dispatch({
//           type: DASHBOARD_ACTIONS.FETCH_FAILURE,
//           payload: error.message
//         });
//         console.error('[DashboardProvider] Initialization error:', error);
//         showToast('Error loading dashboard data', { type: 'error' });
//       }
//     });
//   }, [userId, initializeService]);

//   // Function to invalidate dashboard cache
//   const invalidateDashboardCache = useCallback(async () => {
//     await invalidateCache(`${CACHE_CONFIG.DASHBOARD_KEY}:${userId}`);
//   }, [userId, invalidateCache]);

//   // Function to refresh all dashboard data
//   const refreshDashboard = useCallback(async () => {
//     return syncStateUpdate(async () => {
//       if (!userId) return;

//       dispatch({ type: DASHBOARD_ACTIONS.FETCH_START });
      
//       try {
//         const dashboardData = await getDashboardData(userId);
        
//         dispatch({
//           type: DASHBOARD_ACTIONS.FETCH_SUCCESS,
//           payload: {
//             messages: dashboardData.messages || [],
//             notifications: dashboardData.notifications || [],
//             connections: dashboardData.connections || { friends: [], bestFriends: [] },
//             caixinhas: dashboardData.caixinhas || []
//           }
//         });

//         showToast('Dashboard refreshed successfully', { type: 'success' });
//       } catch (error) {
//         dispatch({
//           type: DASHBOARD_ACTIONS.FETCH_FAILURE,
//           payload: error.message
//         });
//         showToast('Error refreshing dashboard', { type: 'error' });
//         throw error;
//       }
//     });
//   }, [userId, syncStateUpdate]);

//   // Function to update specific sections of the dashboard
//   const updateDashboardSection = useCallback(async (section, data) => {
//     return syncStateUpdate(async () => {
//       try {
//         switch (section) {
//           case 'messages':
//             dispatch({ type: DASHBOARD_ACTIONS.UPDATE_MESSAGES, payload: data });
//             break;
//           case 'notifications':
//             dispatch({ type: DASHBOARD_ACTIONS.UPDATE_NOTIFICATIONS, payload: data });
//             break;
//           case 'connections':
//             dispatch({ type: DASHBOARD_ACTIONS.UPDATE_CONNECTIONS, payload: data });
//             break;
//           case 'caixinhas':
//             dispatch({ type: DASHBOARD_ACTIONS.UPDATE_CAIXINHAS, payload: data });
//             break;
//           default:
//             throw new Error(`Invalid dashboard section: ${section}`);
//         }

//         await invalidateDashboardCache();
//       } catch (error) {
//         console.error(`Error updating dashboard section ${section}:`, error);
//         showToast(`Error updating ${section}`, { type: 'error' });
//         throw error;
//       }
//     });
//   }, [syncStateUpdate, invalidateDashboardCache]);

//   // Context value
//   const value = useMemo(() => ({
//     messages: state.messages,
//     notifications: state.notifications,
//     connections: state.connections,
//     caixinhas: state.caixinhas,
//     loading: state.loading,
//     error: state.error,
//     refreshDashboard,
//     updateDashboardSection,
//     invalidateDashboardCache
//   }), [
//     state,
//     refreshDashboard,
//     updateDashboardSection,
//     invalidateDashboardCache
//   ]);

//   return (
//     <DashboardContext.Provider value={value}>
//       {children}
//     </DashboardContext.Provider>
//   );
// };

// export const useDashboard = () => {
//   const context = useContext(DashboardContext);
//   if (!context) {
//     throw new Error('useDashboard must be used within a DashboardProvider');
//   }
//   return context;
// };