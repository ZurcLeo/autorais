// // enhancedApiService.js
// import { connectionManager } from '../utils/logger/';
// import { diagnosticLogger } from '../core/logging/DiagnosticLogger';

// const enhanceApiInstance = (instance) => {
//   const originalRequest = instance.interceptors.request.handlers[0];

//   // Remover o interceptor existente
//   instance.interceptors.request.eject(originalRequest);

//   // Adicionar novo interceptor com gerenciamento de conexão
//   instance.interceptors.request.use(
//     async (config) => {
//       try {
//         // Aplicar rate limiting e gerenciamento de conexão
//         return await connectionManager.manageConnection(
//           config.url,
//           async () => {
//             const limiter = config.url.includes('/auth')
//               ? rateLimiters.auth
//               : config.url.includes('/users')
//                 ? rateLimiters.user
//                 : rateLimiters.default;

//             await limiter.schedule(() => Promise.resolve());

//             if (!config.url.includes('/auth/login') && !config.url.includes('/auth/register')) {
//               const isAuthenticated = await tokenManager.isAuthenticated();
//               if (!isAuthenticated) {
//                 throw new Error('Not authenticated');
//               }
//             }

//             return config;
//           }
//         );
//       } catch (error) {
//         diagnosticLogger.log('API request failed', 'ERROR', {
//           url: config.url,
//           error: error.message
//         });
//         return Promise.reject(error);
//       }
//     },
//     (error) => Promise.reject(error)
//   );

//   return instance;
// };

// // Aplicar melhorias às instâncias existentes
// export const enhancedApi = enhanceApiInstance(api);
// export const enhancedApiUpload = enhanceApiInstance(apiUpload);