
import { initialState } from "../../core/constants/initialState";
import { INIT_ACTIONS } from "../../core/constants/actions";
import {metadataReducer} from "../metadata/metadataReducer";
  
  // Reducer combinado
  export function initializationReducer(state = initialState, action) {
    switch (action.type) {
      // Ações de bootstrap
      case INIT_ACTIONS.START_BOOTSTRAP:
        return {
          ...state,
          bootstrap: {
            ...state.bootstrap,
            status: 'initializing',
            startTime: Date.now(),
            error: null
          }
        };
      
      case INIT_ACTIONS.BOOTSTRAP_SUCCESS:
        return {
          ...state,
          bootstrap: {
            ...state.bootstrap,
            status: 'ready',
            initializationTime: Date.now() - state.bootstrap.startTime,
            error: null
          }
        };
      
      case INIT_ACTIONS.BOOTSTRAP_ERROR:
        return {
          ...state,
          bootstrap: {
            ...state.bootstrap,
            status: 'failed',
            error: action.payload,
            initializationTime: Date.now() - state.bootstrap.startTime
          }
        };
      
      // Ações de serviço
      case INIT_ACTIONS.UPDATE_SERVICE_STATUS:
        return {
          ...state,
          services: {
            ...state.services,
            [action.payload.serviceName]: {
              ...state.services[action.payload.serviceName],
              status: action.payload.status,
              error: action.payload.error || null,
              timestamp: new Date().toISOString()
            }
          }
        }
        // case INIT_ACTIONS.FORCE_INITIALIZATION_COMPLETE:
        //   console.log('Forcing initialization complete, current state:', state);
          
        //   // Contar quantos serviços críticos estão prontos
        //   const criticalServices = Object.entries(SERVICE_METADATA)
        //     .filter(([_, meta]) => meta.criticalPath === true)
        //     .map(([name]) => name);
          
        //   const readyCriticalServices = criticalServices
        //     .filter(name => state.services[name]?.status === 'ready');
          
        //   console.log('Critical services status:', {
        //     total: criticalServices.length,
        //     ready: readyCriticalServices.length,
        //     criticalServices,
        //     readyCriticalServices
        //   });
          
        //   return {
        //     ...state,
        //     bootstrap: {
        //       ...state.bootstrap,
        //       status: 'ready',
        //       error: null
        //     },
        //     // Certifique-se de que todos os serviços críticos estão marcados como prontos
        //     services: {
        //       ...state.services,
        //       ...Object.fromEntries(
        //         criticalServices.map(serviceName => [
        //           serviceName,
        //           { status: 'ready', error: null, timestamp: new Date().toISOString() }
        //         ])
        //       )
        //     }
        //   };
      
      // Reset
      case INIT_ACTIONS.RESET_INITIALIZATION:
        return initialState;
      
      // Outras ações de metadataReducer
      default:
        return metadataReducer(state, action);
    }
  }