// // src/managers/RootStateManager.js
// import { useEffect } from 'react';
// import { loggerSystem } from '../utils/logger/loggerSystem'
// import { LOG_LEVELS } from '../reducers/metadata/metadataReducer'; // Import loggerSystem and LOG_LEVELS
// import { useServiceCore } from './ServiceCoreProvider';
// import { useRootState } from '../providers/RootStateProvider';
// import { AuthService } from '../services/auth';
// import {diagnosticLogger} from '../utils/logger/DiagnosticLogger'

// const MODULE_NAME = 'RootStateManager';

// // Funções de inicialização para cada serviço
// const serviceInitializers = {
//     auth: async () => {
//         diagnosticLogger.log("Starting auth service initialization", 'SERVICE');
        
//         try {
//           // Inicializa o serviço de auth
//           const result = await AuthService.initialize();
          
//           if (!result) {
//             throw new Error('Auth service initialization failed');
//           }
    
//           diagnosticLogger.log("Auth service initialization completed", 'SUCCESS');
//           return result;
//         } catch (error) {
//           diagnosticLogger.log("Auth service initialization failed", 'ERROR', {
//             error: error.message,
//             stack: error.stack
//           });
//           throw error;
//         }
//       },

//   user: async () => {
//     loggerSystem(MODULE_NAME, LOG_LEVELS.INITIALIZATION, "Starting user service initialization"); // Use loggerSystem
//     // Implementar lógica real de inicialização do serviço de usuário
//     await new Promise(resolve => setTimeout(resolve, 1000));
//     return true;
//   },

//   notifications: async () => {
//     loggerSystem(MODULE_NAME, LOG_LEVELS.INITIALIZATION, "Starting notifications service initialization"); // Use loggerSystem
//     // Implementar lógica real de inicialização do serviço de notificações
//     await new Promise(resolve => setTimeout(resolve, 1000));
//     return true;
//   }
//   // Adicionar inicializadores para outros serviços conforme necessário
// };

// export const RootStateManager = () => {
//   const { initializeService } = useServiceCore();
//   const { metadata, markProviderReady, markProviderError } = useRootState();

//   useEffect(() => {
//     console.log("RootStateManager: Starting initialization with metadata:", metadata);
      
//     for (const [serviceName, serviceMetadata] of Object.entries(metadata)) {
//       console.log(`RootStateManager: Checking service ${serviceName}`, {
//         criticalPath: serviceMetadata.criticalPath,
//         hasInitializer: !!serviceInitializers[serviceName]
//       })}

//     let mounted = true;

//     const initializeServices = async () => {
//      diagnosticLogger.log("Starting services initialization", 'LIFECYCLE');
      
//       await new Promise(resolve => setTimeout(resolve, 0));
      
//       if (!mounted) return;

//       for (const [serviceName, serviceMetadata] of Object.entries(metadata)) {
//         // Se o serviço está no caminho crítico, tenta inicializar
//         if (serviceMetadata.criticalPath) {
//           const initializer = serviceInitializers[serviceName];
          
//           if (!initializer) {
//             diagnosticLogger.log(`No initializer found for ${serviceName}`, 'ERROR');
//             continue;
//           }

//           try {
//             diagnosticLogger.log(`Initializing critical service: ${serviceName}`, 'SERVICE');
            
//             await initializeService(
//               serviceName,
//               initializer,
//               serviceMetadata.dependencies
//             );

//             markProviderReady(serviceName);
//           } catch (error) {
//             diagnosticLogger.log(`Failed to initialize ${serviceName}`, 'ERROR', {
//               error: error.message
//             });
//             markProviderError(serviceName, error.message);
//           }
//         }
//       }
//     };
//     initializeServices();
//     return () => {
//         mounted = false;
//       };
//   }, [initializeService, metadata, markProviderReady, markProviderError]);

//   return null;
// };

// export default RootStateManager;