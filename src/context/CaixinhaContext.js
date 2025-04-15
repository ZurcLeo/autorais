// export const CaixinhaProvider = ({ children }) => {
//   const { currentUser } = useAuth();
//   const { syncStateUpdate, invalidateCache } = useRootState();
//   const [state, dispatch] = useReducer(caixinhaReducer, initialCaixinhaState);
//   const [caixinhaReady, setCaixinhaReady] = useState(false);
//   const { initializeService, CRITICAL_SERVICES } = useServiceInit();

//   const userId = currentUser?.uid;

//   // Initialize caixinha service
//   React.useEffect(() => {
//     initializeService(CRITICAL_SERVICES.CAIXINHA, async () => {
//       if (!userId) {
//         dispatch({ type: CAIXINHA_ACTIONS.CLEAR_STATE });
//         setCaixinhaReady(true);
//         return;
//       }

//       try {
//         dispatch({ type: CAIXINHA_ACTIONS.FETCH_START });
//         const caixinhas = await caixinhaService.getCaixinhas(userId);

//         dispatch({
//           type: CAIXINHA_ACTIONS.FETCH_SUCCESS,
//           payload: {
//             caixinhas: caixinhas.data || [],
//             currentCaixinha: null,
//             contributions: []
//           }
//         });

//         setCaixinhaReady(true);
//       } catch (error) {
//         dispatch({
//           type: CAIXINHA_ACTIONS.FETCH_FAILURE,
//           payload: error.message
//         });
//         console.error('[CaixinhaProvider] Initialization error:', error);
//         showToast('Error loading caixinhas', { type: 'error' });
//       }
//     });
//   }, [userId, initializeService]);

//   // Create caixinha
//   const createCaixinha = useCallback(async (caixinhaData) => {
//     if (!userId) {
//       showToast('User must be authenticated', { type: 'error' });
//       return;
//     }

//     const validationError = validateCaixinhaData(caixinhaData);
//     if (validationError) {
//       showToast(validationError, { type: 'error' });
//       return;
//     }

//     return showPromiseToast(
//       syncStateUpdate(async () => {
//         try {
//           const enrichedData = {
//             ...caixinhaData,
//             adminId: userId,
//             dataCriacao: new Date()
//           };

//           const newCaixinha = await caixinhaService.createCaixinha(enrichedData);
          
//           // Update state optimistically
//           dispatch({
//             type: CAIXINHA_ACTIONS.UPDATE_CAIXINHAS,
//             payload: [...state.caixinhas, newCaixinha]
//           });

//           // Update cache
//           await invalidateCache(`${CACHE_CONFIG.CAIXINHAS_KEY}:${userId}`);
          
//           return newCaixinha;
//         } catch (error) {
//           // Revert optimistic update
//           const caixinhas = await caixinhaService.getCaixinhas(userId);
//           dispatch({
//             type: CAIXINHA_ACTIONS.UPDATE_CAIXINHAS,
//             payload: caixinhas.data || []
//           });
//           throw error;
//         }
//       }),
//       {
//         loading: 'Creating caixinha...',
//         success: 'Caixinha created successfully!',
//         error: 'Failed to create caixinha'
//       }
//     );
//   }, [userId, state.caixinhas, syncStateUpdate, invalidateCache]);

//   // Update caixinha
//   const updateCaixinha = useCallback(async (id, data) => {
//     if (!id) {
//       showToast('Invalid caixinha ID', { type: 'error' });
//       return;
//     }

//     const validationError = validateCaixinhaData(data, true);
//     if (validationError) {
//       showToast(validationError, { type: 'error' });
//       return;
//     }

//     return showPromiseToast(
//       syncStateUpdate(async () => {
//         try {
//           const updatedCaixinha = await caixinhaService.updateCaixinha(id, data);
          
//           // Update state optimistically
//           dispatch({
//             type: CAIXINHA_ACTIONS.UPDATE_CAIXINHAS,
//             payload: state.caixinhas.map(cx => 
//               cx.id === id ? updatedCaixinha : cx
//             )
//           });

//           if (state.currentCaixinha?.id === id) {
//             dispatch({
//               type: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA,
//               payload: updatedCaixinha
//             });
//           }

//           // Update cache
//           await invalidateCache(`${CACHE_CONFIG.CAIXINHAS_KEY}:${userId}`);
//           await invalidateCache(`${CACHE_CONFIG.SINGLE_CAIXINHA_KEY}:${id}`);
          
//           return updatedCaixinha;
//         } catch (error) {
//           // Revert optimistic update
//           const caixinhas = await caixinhaService.getCaixinhas(userId);
//           dispatch({
//             type: CAIXINHA_ACTIONS.UPDATE_CAIXINHAS,
//             payload: caixinhas.data || []
//           });
//           throw error;
//         }
//       }),
//       {
//         loading: 'Updating caixinha...',
//         success: 'Caixinha updated successfully!',
//         error: 'Failed to update caixinha'
//       }
//     );
//   }, [userId, state.caixinhas, state.currentCaixinha, syncStateUpdate, invalidateCache]);

//   // Delete caixinha
//   const deleteCaixinha = useCallback(async (id) => {
//     if (!id) {
//       showToast('Invalid caixinha ID', { type: 'error' });
//       return;
//     }

//     return showPromiseToast(
//       syncStateUpdate(async () => {
//         try {
//           await caixinhaService.deleteCaixinha(id);
          
//           // Update state optimistically
//           dispatch({
//             type: CAIXINHA_ACTIONS.UPDATE_CAIXINHAS,
//             payload: state.caixinhas.filter(cx => cx.id !== id)
//           });

//           if (state.currentCaixinha?.id === id) {
//             dispatch({
//               type: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA,
//               payload: null
//             });
//           }

//           // Update cache
//           await invalidateCache(`${CACHE_CONFIG.CAIXINHAS_KEY}:${userId}`);
//           await invalidateCache(`${CACHE_CONFIG.SINGLE_CAIXINHA_KEY}:${id}`);
          
//           return 'Caixinha deleted successfully';
//         } catch (error) {
//           // Revert optimistic update
//           const caixinhas = await caixinhaService.getCaixinhas(userId);
//           dispatch({
//             type: CAIXINHA_ACTIONS.UPDATE_CAIXINHAS,
//             payload: caixinhas.data || []
//           });
//           throw error;
//         }
//       }),
//       {
//         loading: 'Deleting caixinha...',
//         success: 'Caixinha deleted successfully!',
//         error: 'Failed to delete caixinha'
//       }
//     );
//   }, [userId, state.caixinhas, state.currentCaixinha, syncStateUpdate, invalidateCache]);

//   // Get single caixinha
//   const getCaixinha = useCallback(async (id) => {
//     if (!id) {
//       showToast('Invalid caixinha ID', { type: 'error' });
//       return null;
//     }

//     return syncStateUpdate(async () => {
//       try {
//         dispatch({ type: CAIXINHA_ACTIONS.FETCH_START });
//         const caixinha = await caixinhaService.getCaixinhaById(id);
        
//         dispatch({
//           type: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA,
//           payload: caixinha
//         });

//         return caixinha;
//       } catch (error) {
//         dispatch({
//           type: CAIXINHA_ACTIONS.FETCH_FAILURE,
//           payload: error.message
//         });
//         throw error;
//       }
//     });
//   }, [syncStateUpdate]);

//   // Join caixinha
//   const joinCaixinha = useCallback(async (caixinhaId, joinData) => {
//     if (!userId || !caixinhaId) {
//       showToast('Invalid request data', { type: 'error' });
//       return;
//     }

//     return showPromiseToast(
//       syncStateUpdate(async () => {
//         try {
//           const response = await caixinhaService.joinCaixinha(caixinhaId, {
//             ...joinData,
//             userId
//           });
          
//           // Update cache and refetch data
//           await invalidateCache(`${CACHE_CONFIG.CAIXINHAS_KEY}:${userId}`);
//           await invalidateCache(`${CACHE_CONFIG.SINGLE_CAIXINHA_KEY}:${caixinhaId}`);
          
//           const caixinhas = await caixinhaService.getCaixinhas(userId);
//           dispatch({
//             type: CAIXINHA_ACTIONS.UPDATE_CAIXINHAS,
//             payload: caixinhas.data || []
//           });
          
//           return response;
//         } catch (error) {
//           throw error;
//         }
//       }),
//       {
//         loading: 'Joining caixinha...',
//         success: 'Successfully joined caixinha!',
//         error: 'Failed to join caixinha'
//       }
//     );
//   }, [userId, syncStateUpdate, invalidateCache]);

//   // Leave caixinha
//   const leaveCaixinha = useCallback(async (caixinhaId) => {
//     if (!userId || !caixinhaId) {
//       showToast('Invalid request data', { type: 'error' });
//       return;
//     }

//     return showPromiseToast(
//       syncStateUpdate(async () => {
//         try {
//           await caixinhaService.leaveCaixinha(caixinhaId, userId);
          
//           // Update cache and refetch data
//           await invalidateCache(`${CACHE_CONFIG.CAIXINHAS_KEY}:${userId}`);
//           await invalidateCache(`${CACHE_CONFIG.SINGLE_CAIXINHA_KEY}:${caixinhaId}`);
          
//           const caixinhas = await caixinhaService.getCaixinhas(userId);
//           dispatch({
//             type: CAIXINHA_ACTIONS.UPDATE_CAIXINHAS,
//             payload: caixinhas.data || []
//           });
          
//           if (state.currentCaixinha?.id === caixinhaId) {
//             dispatch({
//               type: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA,
//               payload: null
//             });
//           }
          
//           return 'Successfully left caixinha';
//         } catch (error) {
//           throw error;
//         }
//       }),
//       {
//         loading: 'Leaving caixinha...',
//         success: 'Successfully left caixinha!',
//         error: 'Failed to leave caixinha'
//       }
//     );
//   }, [userId, state.currentCaixinha, syncStateUpdate, invalidateCache]);

// // Add contribution
// const addContribution = useCallback(async (data) => {
//   if (!userId) {
//     showToast('User must be authenticated', { type: 'error' });
//     return;
//   }

//   return showPromiseToast(
//     syncStateUpdate(async () => {
//       try {
//         const response = await caixinhaService.addContribuicao(data);
        
//         // Update contributions state optimistically
//         dispatch({
//           type: CAIXINHA_ACTIONS.UPDATE_CONTRIBUTIONS,
//           payload: [...state.contributions, response]
//         });

//         // Update cache
//         const caixinhaId = data.caixinhaId;
//         await invalidateCache(`${CACHE_CONFIG.SINGLE_CAIXINHA_KEY}:${caixinhaId}`);
        
//         return response;
//       } catch (error) {
//         // Revert optimistic update by refreshing contributions
//         const contributions = await caixinhaService.getContribuicoes(data.caixinhaId);
//         dispatch({
//           type: CAIXINHA_ACTIONS.UPDATE_CONTRIBUTIONS,
//           payload: contributions || []
//         });
//         throw error;
//       }
//     }),
//     {
//       loading: 'Adding contribution...',
//       success: 'Contribution added successfully!',
//       error: 'Failed to add contribution'
//     }
//   );
// }, [userId, state.contributions, syncStateUpdate, invalidateCache]);

// // Get contributions
// const getContributions = useCallback(async (caixinhaId) => {
//   if (!caixinhaId) {
//     showToast('Invalid caixinha ID', { type: 'error' });
//     return;
//   }

//   return syncStateUpdate(async () => {
//     try {
//       dispatch({ type: CAIXINHA_ACTIONS.FETCH_START });
//       const contributions = await caixinhaService.getContribuicoes(caixinhaId);
      
//       dispatch({
//         type: CAIXINHA_ACTIONS.UPDATE_CONTRIBUTIONS,
//         payload: contributions || []
//       });

//       return contributions;
//     } catch (error) {
//       dispatch({
//         type: CAIXINHA_ACTIONS.FETCH_FAILURE,
//         payload: error.message
//       });
//       throw error;
//     }
//   });
// }, [syncStateUpdate]);

// // Invite member function
// const inviteMember = useCallback(async (caixinhaId, inviteData) => {
//   if (!caixinhaId || !inviteData.email) {
//     showToast('Invalid invite data', { type: 'error' });
//     return;
//   }

//   return showPromiseToast(
//     syncStateUpdate(async () => {
//       try {
//         const response = await caixinhaService.inviteMember(caixinhaId, inviteData);
//         return response;
//       } catch (error) {
//         throw error;
//       }
//     }),
//     {
//       loading: 'Sending invitation...',
//       success: 'Invitation sent successfully!',
//       error: 'Failed to send invitation'
//     }
//   );
// }, [syncStateUpdate]);

// // Refresh caixinhas
// const refreshCaixinhas = useCallback(async () => {
//   return syncStateUpdate(async () => {
//     if (!userId) return;

//     dispatch({ type: CAIXINHA_ACTIONS.FETCH_START });
    
//     try {
//       const caixinhas = await caixinhaService.getCaixinhas(userId);
      
//       dispatch({
//         type: CAIXINHA_ACTIONS.UPDATE_CAIXINHAS,
//         payload: caixinhas.data || []
//       });
//     } catch (error) {
//       dispatch({
//         type: CAIXINHA_ACTIONS.FETCH_FAILURE,
//         payload: error.message
//       });
//       throw error;
//     }
//   });
// }, [userId, syncStateUpdate]);

// // Context value with memoization
// const value = useMemo(() => ({
//   caixinhas: state.caixinhas,
//   currentCaixinha: state.currentCaixinha,
//   contributions: state.contributions,
//   loading: state.loading,
//   error: state.error,
//   createCaixinha,
//   updateCaixinha,
//   deleteCaixinha,
//   getCaixinha,
//   joinCaixinha,
//   leaveCaixinha,
//   addContribution,
//   getContributions,
//   inviteMember,
//   refreshCaixinhas
// }), [
//   state,
//   createCaixinha,
//   updateCaixinha,
//   deleteCaixinha,
//   getCaixinha,
//   joinCaixinha,
//   leaveCaixinha,
//   addContribution,
//   getContributions,
//   inviteMember,
//   refreshCaixinhas
// ]);

// return (
//   <CaixinhaContext.Provider value={value}>
//     {children}
//   </CaixinhaContext.Provider>
// );
// };

// export const useCaixinha = () => {
//   const context = useContext(CaixinhaContext);
//   if (context === undefined) {
//     throw new Error('useCaixinha must be used within CaixinhaProvider');
//   }
//   return context;
// };