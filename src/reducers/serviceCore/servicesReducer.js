// src/reducers/services/servicesReducer.js
import { SERVICE_ACTIONS } from '../../core/constants/actions';

// Estado inicial
const initialState = {
  services: {},      // Estado individual de cada serviço
  coreReady: false,  // Indica se os serviços core estão prontos
  criticalFailure: false, // Indica se houve falha crítica
  error: null,       // Detalhes de erro, se houver
  initializationPhase: 'pending' // [pending, initializing, ready, failed]
};

// Reducer
export const servicesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SERVICE_ACTIONS.SERVICE_INIT:
      return {
        ...state,
        services: {
          ...state.services,
          [action.payload.serviceName]: {
            ...state.services[action.payload.serviceName],
            status: 'initializing',
            timestamp: action.payload.timestamp || Date.now()
          }
        }
      };

    case SERVICE_ACTIONS.SERVICE_READY:
      return {
        ...state,
        services: {
          ...state.services,
          [action.payload.serviceName]: {
            ...state.services[action.payload.serviceName],
            status: 'ready',
            // initializationTime: action.payload.initializationTime,
            timestamp: action.payload.timestamp || Date.now()
          }
        }
      };

    case SERVICE_ACTIONS.SERVICE_ERROR:
      const isCritical = action.payload.critical || 
                        (state.services[action.payload.serviceName]?.critical === true);
      
      return {
        ...state,
        services: {
          ...state.services,
          [action.payload.serviceName]: {
            ...state.services[action.payload.serviceName],
            status: 'failed',
            error: action.payload.error,
            timestamp: action.payload.timestamp || Date.now()
          }
        },
        criticalFailure: isCritical ? true : state.criticalFailure,
        error: isCritical ? action.payload.error : state.error
      };

    case SERVICE_ACTIONS.SERVICE_STOPPED:
      return {
        ...state,
        services: {
          ...state.services,
          [action.payload.serviceName]: {
            ...state.services[action.payload.serviceName],
            status: 'stopped',
            timestamp: action.payload.timestamp || Date.now()
          }
        }
      };

    case SERVICE_ACTIONS.CORE_READY:
      return {
        ...state,
        coreReady: true,
        initializationPhase: 'ready'
      };

    case SERVICE_ACTIONS.CRITICAL_FAILURE:
      return {
        ...state,
        criticalFailure: true,
        error: action.payload.error,
        initializationPhase: 'failed'
      };

    case SERVICE_ACTIONS.UPDATE_INITIALIZATION_STATE:
      return {
        ...state,
        services: {
          ...state.services,
          [action.payload.serviceName]: {
            ...state.services[action.payload.serviceName],
            status: action.payload.status,
            error: action.payload.error || null,
            timestamp: action.payload.timestamp || Date.now()
          }
        }
      };

    case SERVICE_ACTIONS.ADD_SERVICE:
      return {
        ...state,
        services: {
          ...state.services,
          [action.payload.serviceName]: {
            status: 'pending',
            critical: action.payload.critical || false,
            dependencies: action.payload.dependencies || [],
            phase: action.payload.phase || 'FEATURES',
            timestamp: action.payload.timestamp || Date.now()
          }
        }
      };

    case SERVICE_ACTIONS.REMOVE_SERVICE:
      const newServices = { ...state.services };
      delete newServices[action.payload.serviceName];
      
      return {
        ...state,
        services: newServices
      };

    case SERVICE_ACTIONS.RESET_SERVICE:
      return {
        ...state,
        services: {
          ...state.services,
          [action.payload.serviceName]: {
            ...state.services[action.payload.serviceName],
            status: 'pending',
            error: null,
            timestamp: action.payload.timestamp || Date.now()
          }
        }
      };

    case SERVICE_ACTIONS.RESET_ALL:
      return initialState;

    default:
      return state;
  }
};

// Seletores
export const getServiceStatus = (state, serviceName) => 
  state.services[serviceName]?.status || 'unknown';

export const isServiceReady = (state, serviceName) => 
  state.services[serviceName]?.status === 'ready';

export const getAllServiceStates = (state) => state.services;

export const areCoreServicesReady = (state) => state.coreReady;

export const hasCriticalFailure = (state) => state.criticalFailure;