// // src/core/state/CoreStateManager.js
// import { SERVICE_METADATA, LOG_LEVELS } from '../../reducers/metadata/metadataReducer';
// import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
// import { coreLogger } from '../logging/CoreLogger';
// import { serviceInitializer } from '../initialization/ServiceInitializer';

// const CoreStateContext = createContext(null);

// // Estado inicial centralizado
// const initialState = {
//   services: {},
//   ready: false,
//   error: null,
//   initializationOrder: [],
//   dependencies: {},
//   hasCriticalFailure: false
// };

// // Actions centralizadas
// const STATE_ACTIONS = {
//     SERVICE_INIT: 'SERVICE_INIT',
//     SERVICE_READY: 'SERVICE_READY',
//     SERVICE_ERROR: 'SERVICE_ERROR',
//     CORE_READY: 'CORE_READY',
//     UPDATE_DEPENDENCIES: 'UPDATE_DEPENDENCIES',
//     RESET_SERVICE: 'RESET_SERVICE',
//     CRITICAL_FAILURE: 'CRITICAL_FAILURE',
//     UPDATE_INITIALIZATION_STATE: 'UPDATE_INITIALIZATION_STATE',
//     ADD_SERVICE: 'ADD_SERVICE',
//     REMOVE_SERVICE: 'REMOVE_SERVICE',
//     UPDATE_METADATA: 'UPDATE_METADATA',
//     RESET_ALL: 'RESET_ALL'
// };

// // Reducer com logging integrado
// const coreStateReducer = (state, action) => {
//   const startTime = performance.now();
  
//   coreLogger.logEvent('CoreStateManager', LOG_LEVELS.STATE, 
//     `Processing action: ${action.type}`, {
//       provider: action.provider,
//       currentState: state.readyStates?.[action.provider]
//   });

//   try {
//     let newState;
//     switch (action.type) {
//       case STATE_ACTIONS.SERVICE_INIT:
//         newState = handleServiceInit(state, action);
//         break;

//       case STATE_ACTIONS.SERVICE_READY:
//         newState = handleServiceReady(state, action);
//         break;

//       case STATE_ACTIONS.SERVICE_ERROR:
//         newState = handleServiceError(state, action);
//         break;

//       case STATE_ACTIONS.CORE_READY:
//         newState = {
//           ...state,
//           ready: true,
//           completedAt: Date.now()
//         };
//         break;

//         case STATE_ACTIONS.UPDATE_DEPENDENCIES:
//             newState = handleUpdateDependencies(state, action);
//             break;
    
//           case STATE_ACTIONS.RESET_SERVICE:
//             newState = handleResetService(state, action);
//             break;
    
//           case STATE_ACTIONS.CRITICAL_FAILURE:
//             newState = handleCriticalFailure(state, action);
//             break;
    
//           case STATE_ACTIONS.UPDATE_INITIALIZATION_STATE:
//             newState = handleUpdateInitializationState(state, action);
//             break;
    
//           case STATE_ACTIONS.ADD_SERVICE:
//             newState = handleAddService(state, action);
//             break;
    
//           case STATE_ACTIONS.REMOVE_SERVICE:
//             newState = handleRemoveService(state, action);
//             break;
    
//           case STATE_ACTIONS.UPDATE_METADATA:
//             newState = handleUpdateMetadata(state, action);
//             break;
    
//           case STATE_ACTIONS.RESET_ALL:
//             newState = handleResetAll(state);
//             break;
    
//           default:
//             return state;
//         }
    
//         coreLogger.logServicePerformance('CoreStateManager', action.type, 
//           performance.now() - startTime);
        
//         return newState;
//       } catch (error) {
//         coreLogger.logServiceError('CoreStateManager', error, 
//           { actionType: action.type });
//         return state;
//       }
//     };

// // Handlers separados para cada tipo de ação
// const handleServiceInit = (state, action) => {
//   return {
//     ...state,
//     services: {
//       ...state.services,
//       [action.service]: {
//         status: 'initializing',
//         error: null,
//         startTime: Date.now(),
//         retryCount: 0,
//         dependencies: action.dependencies || []
//       }
//     },
//     dependencies: {
//       ...state.dependencies,
//       [action.service]: action.dependencies || []
//     }
//   };
// };

// const handleServiceReady = (state, action) => {
//     return {
//       ...state,
//       services: {
//         ...state.services,
//         [action.service]: {
//           ...state.services[action.service],
//           status: 'ready',
//           error: null,
//           duration: Date.now() - state.services[action.service].startTime
//         }
//       },
//       initializationOrder: [...state.initializationOrder, action.service]
//     };
//   };
  
//   const handleServiceError = (state, action) => {
//     return {
//       ...state,
//       services: {
//         ...state.services,
//         [action.service]: {
//           ...state.services[action.service],
//           status: 'error',
//           error: action.error,
//           retryCount: (state.services[action.service].retryCount || 0) + 1
//         }
//       },
//       hasCriticalFailure: true,
//       error: action.error
//     };
//   };

// const handleUpdateDependencies = (state, action) => {
//     return {
//       ...state,
//       dependencies: {
//         ...state.dependencies,
//         [action.service]: action.dependencies
//       }
//     };
//   };

//   const handleResetService = (state, action) => {
//     const newServices = { ...state.services };
//     delete newServices[action.service];
  
//     return {
//       ...state,
//       services: newServices,
//       initializationOrder: state.initializationOrder.filter(service => service !== action.service)
//     };
//   };

//   const handleCriticalFailure = (state, action) => {
//     return {
//       ...state,
//       hasCriticalFailure: true,
//       error: action.error
//     };
//   };

//   const handleUpdateInitializationState = (state, action) => {
//     return {
//       ...state,
//       services: {
//         ...state.services,
//         [action.service]: {
//           ...state.services[action.service],
//           status: action.status,
//           error: action.error || null,
//           duration: action.duration || null,
//           timestamp: action.timestamp || null
//         }
//       }
//     };
//   };

//   const handleAddService = (state, action) => {
//     return {
//       ...state,
//       services: {
//         ...state.services,
//         [action.service]: {
//           status: 'pending',
//           error: null,
//           startTime: null,
//           retryCount: 0,
//           dependencies: action.dependencies || []
//         }
//       },
//       dependencies: {
//         ...state.dependencies,
//         [action.service]: action.dependencies || []
//       }
//     };
//   };

//   const handleRemoveService = (state, action) => {
//     const newServices = { ...state.services };
//     delete newServices[action.service];
  
//     const newDependencies = { ...state.dependencies };
//     delete newDependencies[action.service];
  
//     return {
//       ...state,
//       services: newServices,
//       dependencies: newDependencies,
//       initializationOrder: state.initializationOrder.filter(service => service !== action.service)
//     };
//   };

//   const handleUpdateMetadata = (state, action) => {
//     return {
//       ...state,
//       services: {
//         ...state.services,
//         [action.service]: {
//           ...state.services[action.service],
//           metadata: action.metadata
//         }
//       }
//     };
//   };

//   const handleResetAll = (state) => {
//     return {
//       ...initialState,
//       initializationOrder: [],
//       dependencies: {}
//     };
//   };

// export const CoreStateProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(coreStateReducer, initialState);

//   // Inicialização de serviços
//   useEffect(() => {
//     const initializeServices = async () => {
//       coreLogger.logServiceInitStart('CoreStateManager');
      
//       try {
//         await serviceInitializer.initializeServices({
//           onServiceInit: (service) => dispatch({ 
//             type: STATE_ACTIONS.SERVICE_INIT, 
//             service 
//           }),
//           onServiceReady: (service) => dispatch({ 
//             type: STATE_ACTIONS.SERVICE_READY, 
//             service 
//           }),
//           onServiceError: (service, error) => dispatch({ 
//             type: STATE_ACTIONS.SERVICE_ERROR,
//             service,
//             error
//           })
//         });

//         coreLogger.logServiceInitComplete('CoreStateManager');
//       } catch (error) {
//         coreLogger.logServiceInitError('CoreStateManager', error);
//         throw error;
//       }
//     };

//     initializeServices();
//   }, []);

//   const value = useMemo(() => ({
//     state,
//     dispatch,
//     // retryManager
//   }), [state]);

//   return (
//     <CoreStateContext.Provider value={value}>
//       {children}
//     </CoreStateContext.Provider>
//   );
// };

// export const useCoreState = () => {
//   const context = useContext(CoreStateContext);
//   if (!context) {
//     throw new Error('useCoreState must be used within CoreStateProvider');
//   }
//   return context;
// };