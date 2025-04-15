// import { eventActionBridgeService } from ".";
// import { APP_ACTIONS } from "../../core/constants/actions";

// export const setupAppMappings = () => {
//   eventActionBridgeService.registerMappings([
//     {
//       serviceName: 'auth',
//       eventType: 'LOADING_STARTED',
//       actionType: APP_ACTIONS.LOADING_STARTED,
//       transformer: (eventData) => ({
//         source: eventData.service || 'unknown',
//         timestamp: eventData.timestamp || Date.now()
//       })
//     },
//     {
//       serviceName: 'auth',
//       eventType: 'LOADING_FINISHED',
//       actionType: APP_ACTIONS.LOADING_FINISHED,
//       transformer: (eventData) => ({
//         source: eventData.service || 'unknown',
//         timestamp: eventData.timestamp || Date.now()
//       })
//     }
//   ]);
// };