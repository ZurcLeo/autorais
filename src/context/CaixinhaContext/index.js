// // src/context/CaixinhaContext.js
// import React, { createContext, useContext, useReducer, useState, useMemo, useCallback, useEffect } from 'react';
// import { CAIXINHA_ACTIONS } from '../../core/constants/actions';
// import { CAIXINHA_CACHE_CONFIG } from '../../core/constants/config';
// import { initialCaixinhaState } from '../../core/constants/initialState';
// import { caixinhaReducer } from '../../reducers/caixinha/caixinhaReducer';
// import {caixinhaService} from '../../services/CaixinhaService/';
// import { useAuth } from '../../providers/AuthProvider';
// import { showToast, showPromiseToast } from '../../utils/toastUtils';
// import { globalCache } from '../../utils/cache/cacheManager';
// import { validateCaixinhaData } from '../../utils/validation';
// // import { processCaixinhaData } from '../utils/caixinhaUtils'; // REMOVE o import do utils
// import useProcessCaixinhaData from '../../hooks/caixinha/useProcessCaixinhaData'; // IMPORTA o hook

// const CaixinhaContext = createContext();

// export const CaixinhaProvider = ({ children }) => {
//   const { currentUser } = useAuth();
//   const [state, dispatch] = useReducer(caixinhaReducer, initialCaixinhaState);
//   const processCaixinhaData = useProcessCaixinhaData(); // USA o hook

//   const userId = currentUser?.userId;

//   // Get All Caixinhas
//   const getCaixinhas = useCallback(async () => {
//     if (!userId) {
//       dispatch({ type: CAIXINHA_ACTIONS.CLEAR_STATE });
//       return;
//     }

//     dispatch({ type: CAIXINHA_ACTIONS.FETCH_START });
//     try {
//       const cacheKey = `<span class="math-inline">\{CACHE\_CONFIG\.CAIXINHAS\_KEY\}\:</span>{userId}`;
//       const cachedData = globalCache.get(cacheKey);

//       if (cachedData && Date.now() - cachedData.timestamp < CAIXINHA_CACHE_CONFIG.CACHE_TIME) {
//         dispatch({
//           type: CAIXINHA_ACTIONS.FETCH_SUCCESS,
//           payload: { caixinhas: cachedData.data }
//         });
//         return cachedData.data; // Retorna os dados do cache
//       }

//       const caixinhasData = await caixinhaService.getCaixinhas(userId);
//       const processedCaixinhas = caixinhasData.map(processCaixinhaData); // Usa o HOOK

//       dispatch({
//         type: CAIXINHA_ACTIONS.FETCH_SUCCESS,
//         payload: { caixinhas: processedCaixinhas }
//       });

//       globalCache.set(cacheKey, { data: processedCaixinhas, timestamp: Date.now() });
//       return processedCaixinhas; // Retorna os dados da API

//     } catch (error) {
//       dispatch({ type: CAIXINHA_ACTIONS.FETCH_FAILURE, payload: error.message });
//       showToast(error.message, { type: 'error' });
//       throw error;
//     }
//   }, [userId, processCaixinhaData]); // Adiciona processCaixinhaData às dependências


//   // Inicialização (useEffect) - chama getCaixinhas
//   useEffect(() => {
//     if (userId) {
//       getCaixinhas();
//     } else {
//       dispatch({ type: CAIXINHA_ACTIONS.CLEAR_STATE });
//     }
//   }, [userId, getCaixinhas]);


//   // Get Single Caixinha
//   const getCaixinha = useCallback(async (id) => {
//     if (!id) {
//       showToast('Invalid caixinha ID', { type: 'error' });
//       return null;
//     }

//     dispatch({ type: CAIXINHA_ACTIONS.FETCH_START });
//     try {
//       const cacheKey = `<span class="math-inline">\{CACHE\_CONFIG\.SINGLE\_CAIXINHA\_KEY\}\:</span>{id}`;
//       const cachedData = globalCache.get(cacheKey);

//       if (cachedData && Date.now() - cachedData.timestamp < CAIXINHA_CACHE_CONFIG.SINGLE_CACHE_TIME) {
//         dispatch({
//           type: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA,
//           payload: cachedData.data
//         });
//         return cachedData.data;
//       }

//       const caixinhaData = await caixinhaService.getCaixinhaById(id);
//       const processedCaixinha = processCaixinhaData(caixinhaData); // Usa o HOOK

//       dispatch({
//         type: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA,
//         payload: processedCaixinha
//       });
//       globalCache.set(cacheKey, { data: processedCaixinha, timestamp: Date.now() });
//       return processedCaixinha;

//     } catch (error) {
//       dispatch({ type: CAIXINHA_ACTIONS.FETCH_FAILURE, payload: error.message });
//       showToast(error.message, { type: 'error' });
//       throw error;
//     }
//   }, [processCaixinhaData]); // Adiciona processCaixinhaData


//   // Create Caixinha
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

//     const enrichedData = {
//       ...caixinhaData,
//       adminId: userId,
//       dataCriacao: new Date()
//     };

//     const promise = caixinhaService.createCaixinha(enrichedData)
//       .then(newCaixinhaData => {
//         const newCaixinha = processCaixinhaData(newCaixinhaData); // Usa o HOOK
//         dispatch({
//           type: CAIXINHA_ACTIONS.UPDATE_CAIXINHAS,
//           payload: [...state.caixinhas, newCaixinha]
//         });
//         globalCache.remove(`<span class="math-inline">\{CACHE\_CONFIG\.CAIXINHAS\_KEY\}\:</span>{userId}`);
//         return newCaixinha;
//       });

//     showPromiseToast(promise, {
//       loading: 'Creating caixinha...',
//       success: 'Caixinha created successfully!',
//       error: 'Failed to create caixinha'
//     });
//     return promise;

//   }, [userId, state.caixinhas, processCaixinhaData]); // Adiciona processCaixinhaData


//   // Update Caixinha
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

//     const promise = caixinhaService.updateCaixinha(id, data)
//       .then(updatedCaixinhaData => {
//         const updatedCaixinha = processCaixinhaData(updatedCaixinhaData); // Usa o HOOK
//         dispatch({
//           type: CAIXINHA_ACTIONS.UPDATE_CAIXINHAS,
//           payload: state.caixinhas.map(cx => cx.id === id ? updatedCaixinha : cx)
//         });

//         if (state.currentCaixinha?.id === id) {
//           dispatch({
//             type: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA,
//             payload: updatedCaixinha
//           });
//         }
//         globalCache.remove(`<span class="math-inline">\{CACHE\_CONFIG\.CAIXINHAS\_KEY\}\:</span>{userId}`);
//         globalCache.remove(`<span class="math-inline">\{CACHE\_CONFIG\.SINGLE\_CAIXINHA\_KEY\}\:</span>{id}`);
//         return updatedCaixinha;
//       });

//     showPromiseToast(promise, {
//       loading: 'Updating caixinha...',
//       success: 'Caixinha updated successfully!',
//       error: 'Failed to update caixinha'
//     });
//     return promise;

//   }, [userId, state.caixinhas, state.currentCaixinha, processCaixinhaData]); // Adiciona processCaixinhaData


//   // Delete Caixinha
//   const deleteCaixinha = useCallback(async (id) => {
//     if (!id) {
//       showToast('Invalid caixinha ID', { type: 'error' });
//       return;
//     }

//     const promise = caixinhaService.deleteCaixinha(id)
//       .then(() => {
//         dispatch({
//           type: CAIXINHA_ACTIONS.UPDATE_CAIXINHAS,
//           payload: state.caixinhas.filter(cx => cx.id !== id)
//         });

//         if (state.currentCaixinha?.id === id) {
//           dispatch({ type: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA, payload: null });
//         }
//         globalCache.remove(`<span class="math-inline">\{CACHE\_CONFIG\.CAIXINHAS\_KEY\}\:</span>{userId}`);
//         globalCache.remove(`<span class="math-inline">\{CACHE\_CONFIG\.SINGLE\_CAIXINHA\_KEY\}\:</span>{id}`);
//       });

//     showPromiseToast(promise, {
//       loading: 'Deleting caixinha...',
//       success: 'Caixinha deleted successfully!',
//       error: 'Failed to delete caixinha'
//     });
//     return promise;

//   }, [userId, state.caixinhas, state.currentCaixinha]);


//   // Join Caixinha
//   const joinCaixinha = useCallback(async (caixinhaId, joinData) => {
//     if (!userId || !caixinhaId) {
//       showToast('Invalid request data', { type: 'error' });
//       return;
//     }

//     const promise = caixinhaService.joinCaixinha(caixinhaId, { ...joinData, userId })
//       .then(response => {
//         globalCache.remove(`<span class="math-inline">\{CACHE\_CONFIG\.CAIXINHAS\_KEY\}\:</span>{userId}`);
//         globalCache.remove(`<span class="math-inline">\{CACHE\_CONFIG\.SINGLE\_CAIXINHA\_KEY\}\:</span>{caixinhaId}`);
//         getCaixinhas();
//         return response;
//       });

//     showPromiseToast(promise, {
//       loading: 'Joining caixinha...',
//       success: 'Successfully joined caixinha!',
//       error: 'Failed to join caixinha'
//     });
//     return promise;
//   }, [userId, getCaixinhas]);


//   // Leave Caixinha
//   const leaveCaixinha = useCallback(async (caixinhaId) => {
//     if (!userId || !caixinhaId) {
//       showToast('Invalid request data', { type: 'error' });
//       return;
//     }
//     const promise = caixinhaService.leaveCaixinha(caixinhaId, userId)
//       .then(response => {
//         globalCache.remove(`<span class="math-inline">\{CACHE\_CONFIG\.CAIXINHAS\_KEY\}\:</span>{userId}`);
//         globalCache.remove(`<span class="math-inline">\{CACHE\_CONFIG\.SINGLE\_CAIXINHA\_KEY\}\:</span>{caixinhaId}`);
//         getCaixinhas();

//         if (state.currentCaixinha?.id === caixinhaId) {
//           dispatch({ type: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA, payload: null });
//         }
//         return response;
//       });

//     showPromiseToast(promise, {
//       loading: 'Leaving caixinha...',
//       success: 'Successfully left caixinha!',
//       error: 'Failed to leave caixinha'
//     });
//     return promise;

//   }, [userId, state.currentCaixinha, getCaixinhas]);


//   // Add Contribution
//   const addContribution = useCallback(async (data) => {
//     if (!userId) {
//         showToast('User must be authenticated', { type: 'error' });
//         return;
//     }
//     const promise = caixinhaService.addContribuicao(data)
//         .then(response => {
//             // Invalida o cache da caixinha individual
//             globalCache.remove(`${CAIXINHA_CACHE_CONFIG.SINGLE_CAIXINHA_KEY}:${data.caixinhaId}`);

//             // Em vez de atualizar o estado local, apenas invalida o cache.
//             // A PRÓXIMA VEZ que os dados da caixinha forem necessários, eles serão buscados da API.
//             //Isso garante a consistência.
//             return response;

//         }).catch( error =>{ //Adicionado tratamento de erro.
//             showToast('Failed to add contribution: ' + error.message, { type: 'error' }); //Erro mais descritivo.
//             throw error; //Propaga o erro para o showPromiseToast
//         });

//     showPromiseToast(promise, {
//         loading: 'Adding contribution...',
//         success: 'Contribution added successfully!',
//         error: 'Failed to add contribution'
//     });
//     return promise;
// }, [userId]); 

//   // Get Contributions
//   const getContributions = useCallback(async (caixinhaId) => {
//     if (!caixinhaId) {
//       showToast('Invalid caixinha ID', { type: 'error' });
//       return;
//     }
//     dispatch({ type: CAIXINHA_ACTIONS.FETCH_START });
//     try {

//       const contributions = await caixinhaService.getContribuicoes(caixinhaId);
//       dispatch({ type: CAIXINHA_ACTIONS.UPDATE_CONTRIBUTIONS, payload: contributions || [] });
//       return contributions;

//     } catch (error) {
//       dispatch({ type: CAIXINHA_ACTIONS.FETCH_FAILURE, payload: error.message });
//       showToast(error.message, {type: 'error'});
//       throw error;
//     }
//   }, [dispatch]); // Simplificado: dispatch é a única dependência real


//   // Invite Member
//   const inviteMember = useCallback(async (caixinhaId, inviteData) => {
//     if (!caixinhaId || !inviteData.email) {
//       showToast('Invalid invite data', { type: 'error' });
//       return;
//     }

//     const promise = caixinhaService.inviteMember(caixinhaId, inviteData);
//     showPromiseToast(promise, {
//       loading: 'Sending invitation...',
//       success: 'Invitation sent successfully!',
//       error: 'Failed to send invitation'
//     });
//     return promise;
//   }, []);


//   const value = useMemo(() => ({
//     caixinhas: state.caixinhas,
//     currentCaixinha: state.currentCaixinha,
//     contributions: state.contributions,
//     loading: state.loading,
//     error: state.error,
//     createCaixinha,
//     updateCaixinha,
//     deleteCaixinha,
//     getCaixinha,
//     joinCaixinha,
//     leaveCaixinha,
//     addContribution,
//     inviteMember,
//     getCaixinhas, // Agora usando a versão memoizada com useCallback
//   }), [
//     state.caixinhas,
//     state.currentCaixinha,
//     state.contributions,
//     state.loading,
//     state.error,
//     createCaixinha,
//     updateCaixinha,
//     deleteCaixinha,
//     getCaixinha,
//     joinCaixinha,
//     leaveCaixinha,
//     addContribution,
//     inviteMember,
//     getCaixinhas, // Adicionado às dependências do useMemo
//   ]);

//   return (
//     <CaixinhaContext.Provider value={value}>
//       {children}
//     </CaixinhaContext.Provider>
//   );
// };

// export const useCaixinha = () => {
//   const context = useContext(CaixinhaContext);
//   if (!context) {
//     throw new Error('useCaixinha must be used within a CaixinhaProvider');
//   }
//   return context;
// };