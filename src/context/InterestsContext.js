// // src/context/InterestsContext.js
// import React, { createContext, useContext, useReducer, useState, useMemo, useCallback } from 'react';
// import { useTranslation } from 'react-i18next';
// import { globalCache } from '../utils/cache/cacheManager';
// import { showToast, showPromiseToast } from '../utils/toastUtils';
// import { useAuth } from './AuthContext';
// // import { useServiceInit } from './ServiceInitializationProvider';
// // import { useRootState } from './RootStateProvider';

// const InterestsContext = createContext();

// // Cache configuration
// const CACHE_CONFIG = {
//   INTERESTS_KEY: 'user:interests',
//   CACHE_TIME: 24 * 60 * 60 * 1000, // 24 hours
//   STALE_TIME: 60 * 60 * 1000 // 1 hour
// };

// // Action types for interests state management
// const INTERESTS_ACTIONS = {
//   FETCH_START: 'FETCH_START',
//   FETCH_SUCCESS: 'FETCH_SUCCESS',
//   FETCH_FAILURE: 'FETCH_FAILURE',
//   UPDATE_PERSONAL_INTERESTS: 'UPDATE_PERSONAL_INTERESTS',
//   UPDATE_BUSINESS_INTERESTS: 'UPDATE_BUSINESS_INTERESTS',
//   UPDATE_SELECTED_INTERESTS: 'UPDATE_SELECTED_INTERESTS',
//   SET_ERROR: 'SET_ERROR',
//   SET_LOADING: 'SET_LOADING',
//   CLEAR_STATE: 'CLEAR_STATE'
// };

// // Initial state for interests context
// const initialInterestsState = {
//   pessoais: [],
//   negocios: [],
//   selectedInterests: new Set(),
//   loading: true,
//   error: null,
//   lastUpdated: null
// };

// // Reducer for handling interests state changes
// const interestsReducer = (state, action) => {
//   switch (action.type) {
//     case INTERESTS_ACTIONS.FETCH_START:
//       return {
//         ...state,
//         loading: true,
//         error: null
//       };
      
//     case INTERESTS_ACTIONS.FETCH_SUCCESS:
//       return {
//         ...state,
//         ...action.payload,
//         loading: false,
//         error: null,
//         lastUpdated: Date.now()
//       };
    
//     case INTERESTS_ACTIONS.FETCH_FAILURE:
//       return {
//         ...state,
//         loading: false,
//         error: action.payload,
//         lastUpdated: Date.now()
//       };

//     case INTERESTS_ACTIONS.UPDATE_PERSONAL_INTERESTS:
//       return {
//         ...state,
//         pessoais: action.payload,
//         lastUpdated: Date.now()
//       };

//     case INTERESTS_ACTIONS.UPDATE_BUSINESS_INTERESTS:
//       return {
//         ...state,
//         negocios: action.payload,
//         lastUpdated: Date.now()
//       };

//     case INTERESTS_ACTIONS.UPDATE_SELECTED_INTERESTS:
//       return {
//         ...state,
//         selectedInterests: action.payload,
//         lastUpdated: Date.now()
//       };

//     case INTERESTS_ACTIONS.SET_ERROR:
//       return {
//         ...state,
//         error: action.payload,
//         lastUpdated: Date.now()
//       };

//     case INTERESTS_ACTIONS.SET_LOADING:
//       return {
//         ...state,
//         loading: action.payload
//       };

//     case INTERESTS_ACTIONS.CLEAR_STATE:
//       return {
//         ...initialInterestsState,
//         loading: false,
//         lastUpdated: Date.now()
//       };

//     default:
//       return state;
//   }
// };

// export const InterestsProvider = ({ children }) => {
//   const { t, i18n } = useTranslation();
//   const { currentUser } = useAuth();
//   const { syncStateUpdate, invalidateCache } = useRootState();
//   const [state, dispatch] = useReducer(interestsReducer, initialInterestsState);
//   const [interestsReady, setInterestsReady] = useState(false);
//   const { initializeService, CRITICAL_SERVICES } = useServiceInit();

//   const userId = currentUser?.uid;

//   // Define interest categories with translations
//   const interestCategories = useMemo(() => ({
//     pessoais: [
//       // ... (keep existing categories)
//     ],
//     negocios: [
//       // ... (keep existing categories)
//     ]
//   }), []);

//   // Transform interests data with translations
//   const transformInterests = useCallback((category) => {
//     return interestCategories[category].map(interest => ({
//       label: t(`${interest.translationKey}.label`),
//       value: interest.id,
//       description: t(`${interest.translationKey}.description`),
//       icon: interest.icon
//     }));
//   }, [t, interestCategories]);

//   // Initialize interests service
//   React.useEffect(() => {
//     initializeService(CRITICAL_SERVICES.INTERESTS, async () => {
//       if (!userId) {
//         dispatch({ type: INTERESTS_ACTIONS.CLEAR_STATE });
//         setInterestsReady(true);
//         return;
//       }

//       try {
//         dispatch({ type: INTERESTS_ACTIONS.FETCH_START });
        
//         // Here you would typically make an API call to fetch user's interests
//         // const response = await interestsService.getUserInterests(userId);
//         const selectedInterests = new Set(/* response.interests */);

//         dispatch({
//           type: INTERESTS_ACTIONS.FETCH_SUCCESS,
//           payload: {
//             pessoais: transformInterests('pessoais'),
//             negocios: transformInterests('negocios'),
//             selectedInterests
//           }
//         });

//         setInterestsReady(true);
//       } catch (error) {
//         dispatch({
//           type: INTERESTS_ACTIONS.FETCH_FAILURE,
//           payload: error.message
//         });
//         console.error('[InterestsProvider] Initialization error:', error);
//         showToast('Error loading interests', { type: 'error' });
//       }
//     });
//   }, [userId, transformInterests, initializeService]);

//   // Update interests when language changes
//   React.useEffect(() => {
//     if (!state.loading) {
//       dispatch({
//         type: INTERESTS_ACTIONS.UPDATE_PERSONAL_INTERESTS,
//         payload: transformInterests('pessoais')
//       });

//       dispatch({
//         type: INTERESTS_ACTIONS.UPDATE_BUSINESS_INTERESTS,
//         payload: transformInterests('negocios')
//       });
//     }
//   }, [i18n.language, transformInterests, state.loading]);

//   // Toggle interest selection
//   const toggleInterest = useCallback(async (interestId) => {
//     return showPromiseToast(
//       syncStateUpdate(async () => {
//         try {
//           const newSelected = new Set(state.selectedInterests);
//           if (newSelected.has(interestId)) {
//             newSelected.delete(interestId);
//           } else {
//             newSelected.add(interestId);
//           }

//           // Optimistic update
//           dispatch({
//             type: INTERESTS_ACTIONS.UPDATE_SELECTED_INTERESTS,
//             payload: newSelected
//           });

//           // Here you would typically make an API call to update user's interests
//           // await interestsService.updateUserInterests(userId, Array.from(newSelected));

//           // Update cache
//           globalCache.setItem(`${CACHE_CONFIG.INTERESTS_KEY}:${userId}`, {
//             ...state,
//             selectedInterests: newSelected
//           }, {
//             cacheTime: CACHE_CONFIG.CACHE_TIME,
//             staleTime: CACHE_CONFIG.STALE_TIME
//           });

//           return 'Interests updated successfully';
//         } catch (error) {
//           // Revert optimistic update
//           dispatch({
//             type: INTERESTS_ACTIONS.UPDATE_SELECTED_INTERESTS,
//             payload: state.selectedInterests
//           });
//           throw new Error('Failed to update interests');
//         }
//       }),
//       {
//         loading: 'Updating interests...',
//         success: 'Interests updated successfully',
//         error: 'Failed to update interests'
//       }
//     );
//   }, [userId, state, syncStateUpdate]);

//   // Refresh interests
//   const refreshInterests = useCallback(async () => {
//     return syncStateUpdate(async () => {
//       if (!userId) return;

//       dispatch({ type: INTERESTS_ACTIONS.FETCH_START });
      
//       try {
//         // Here you would typically make an API call to fetch user's interests
//         // const response = await interestsService.getUserInterests(userId);
//         const selectedInterests = new Set(/* response.interests */);

//         dispatch({
//           type: INTERESTS_ACTIONS.FETCH_SUCCESS,
//           payload: {
//             pessoais: transformInterests('pessoais'),
//             negocios: transformInterests('negocios'),
//             selectedInterests
//           }
//         });
//       } catch (error) {
//         dispatch({
//           type: INTERESTS_ACTIONS.FETCH_FAILURE,
//           payload: error.message
//         });
//         throw error;
//       }
//     });
//   }, [userId, transformInterests, syncStateUpdate]);

//   // Context value
//   const value = useMemo(() => ({
//     interests: {
//       pessoais: state.pessoais,
//       negocios: state.negocios
//     },
//     selectedInterests: state.selectedInterests,
//     loading: state.loading,
//     error: state.error,
//     toggleInterest,
//     refreshInterests
//   }), [
//     state,
//     toggleInterest,
//     refreshInterests
//   ]);

//   return (
//     <InterestsContext.Provider value={value}>
//       {children}
//     </InterestsContext.Provider>
//   );
// };

// export const useInterests = () => {
//   const context = useContext(InterestsContext);
//   if (context === undefined) {
//     throw new Error('useInterests must be used within an InterestsProvider');
//   }
//   return context;
// };