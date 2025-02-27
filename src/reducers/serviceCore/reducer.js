// src/reducers/serviceCore/reducer.js
import { SERVICE_ACTIONS } from './actions';
import { SERVICE_METADATA } from '../metadata/metadataReducer';
import { loggerSystem, LOG_LEVELS } from '../../core/logging/loggerSystem';

const MODULE_NAME = 'ServiceCoreReducer';

function handleInitAction(state, action) {
  return {
    ...state,
    services: {
      ...state.services,
      [action.service]: {
        status: 'initializing',
        error: null,
        startTime: Date.now(),
        retryCount: 0,
        dependencies: action.dependencies || []
      }
    },
    dependencies: {
      ...state.dependencies,
      [action.service]: action.dependencies || []
    }
  };
}

function handleReadyAction(state, action) {
  const serviceState = state.services[action.service] || {};
  const initializationTime = Date.now() - (serviceState.startTime || Date.now());
  
  return {
    ...state,
    services: {
      ...state.services,
      [action.service]: {
        ...serviceState,
        status: 'ready',
        error: null,
        completedAt: Date.now(),
        initializationTime
      }
    },
    initializationOrder: [...state.initializationOrder, action.service]
  };
}

function handleErrorAction(state, action) {
  const serviceState = state.services[action.service] || {};
  const metadata = SERVICE_METADATA[action.service];
  const retryCount = (serviceState.retryCount || 0) + 1;
  
  const isCriticalFailure = metadata?.criticalPath && action.error.isMaxRetriesError;
  
  const failedDependencies = (metadata?.dependencies || [])
    .filter(dep => state.services[dep]?.status === 'failed');
  
  const impactedServices = isCriticalFailure 
    ? Object.entries(SERVICE_METADATA)
        .filter(([_, meta]) => meta.dependencies.includes(action.service))
        .map(([name]) => name)
    : [];

  return {
    ...state,
    services: {
      ...state.services,
      [action.service]: {
        ...serviceState,
        status: action.error.isMaxRetriesError ? 'failed' : 'error',
        error: action.error,
        retryCount,
        lastError: {
          message: action.error.message,
          timestamp: Date.now(),
          isMaxRetriesError: action.error.isMaxRetriesError,
          isCriticalFailure,
          failedDependencies
        }
      },
      ...impactedServices.reduce((acc, serviceName) => ({
        ...acc,
        [serviceName]: {
          ...state.services[serviceName],
          status: 'blocked',
          error: {
            message: `Blocked by critical service failure: ${action.service}`,
            timestamp: Date.now()
          }
        }
      }), {})
    },
    hasCriticalFailure: isCriticalFailure || state.hasCriticalFailure
  };
}

export function serviceReducer(state, action) {
  const startTime = performance.now();
  
  try {
    let newState;
    
    switch (action.type) {
      case SERVICE_ACTIONS.INIT:
        newState = handleInitAction(state, action);
        break;
        
      case SERVICE_ACTIONS.READY:
        newState = handleReadyAction(state, action);
        break;
        
      case SERVICE_ACTIONS.ERROR:
        newState = handleErrorAction(state, action);
        break;
        
      case SERVICE_ACTIONS.CORE_READY:
        newState = { ...state, ready: true, completedAt: Date.now() };
        break;
        
      case SERVICE_ACTIONS.DEPENDENCY_CHECK:
        newState = {
          ...state,
          dependencies: {
            ...state.dependencies,
            [action.service]: action.dependencies
          }
        };
        break;
        
      default:
        return state;
    }

    loggerSystem(MODULE_NAME, LOG_LEVELS.PERFORMANCE, 'Reducer completed', {
      actionType: action.type,
      duration: performance.now() - startTime
    });

    return newState;
  } catch (error) {
    loggerSystem(MODULE_NAME, LOG_LEVELS.ERROR, 'Reducer error', {
      error: error.message,
      action: action.type
    });
    return state;
  }
}