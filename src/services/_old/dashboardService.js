// // src/services/dashboardService.js
// import { coreLogger } from '../core/logging/CoreLogger'; // Importe o logger
// import { LOG_LEVELS } from '../core/constants'; // Importe os níveis de log
// import caixinhaService from './caixinhaService';
// import notificationService from './notificationService';
// import messageService from './messageService';
// import connectionService from './connectionService';

// // Função auxiliar para validar parâmetros obrigatórios (mantida)
// const validateRequiredParams = (params, requiredFields) => {
//   for (const field of requiredFields) {
//     if (!params[field]) {
//       throw new Error(`O campo ${field} é obrigatório.`);
//     }
//   }
// };

// // Função auxiliar para processar os dados do dashboard (mantida)
// const processDashboardData = (rawData) => {
//   return {
//     caixinhas: Array.isArray(rawData.caixinhas) ? rawData.caixinhas : [],
//     notifications: Array.isArray(rawData.notifications) ? rawData.notifications : [],
//     messages: Array.isArray(rawData.messages) ? rawData.messages : [],
//     connections: {
//       friends: Array.isArray(rawData.connections?.friends) ? rawData.connections.friends : [],
//       bestFriends: Array.isArray(rawData.connections?.bestFriends) ? rawData.connections.bestFriends : []
//     }
//   };
// };

// const getDashboardData = async (userId) => {
//     coreLogger.logEvent('dashboardService', LOG_LEVELS.INFO, `Iniciando busca de dados do dashboard para usuário com ID: ${userId}...`); // Usando o logger
//     //console.time(`getDashboardData-${userId}`); //Removido o console.time

//     validateRequiredParams({ userId }, ['userId']);

//     try {
//         const [
//             caixinhasResponse,
//             notificationsResponse,
//             messagesResponse,
//             connectionsResponse
//         ] = await Promise.allSettled([ // Usando Promise.allSettled
//             caixinhaService.getCaixinhas(userId),
//             notificationService.fetchNotifications(userId),
//             messageService.fetchAllMessages(userId),
//             connectionService.getConnectionsByUserId(userId)
//         ]);

//       const rawData = {
//         caixinhas: caixinhasResponse.status === 'fulfilled' ? caixinhasResponse.value.data : [], // Trata o resultado de Promise.allSettled
//         notifications: notificationsResponse.status === 'fulfilled' ? notificationsResponse.value : [], // Trata o resultado
//         messages: messagesResponse.status === 'fulfilled' ? messagesResponse.value : [], // Trata o resultado
//         connections: connectionsResponse.status === 'fulfilled' ? connectionsResponse.value : { friends: [], bestFriends: [] }, // Trata o resultado
//       };


//         const processedData = processDashboardData(rawData);

//         coreLogger.logEvent('dashboardService', LOG_LEVELS.INFO, `Dados do dashboard processados com sucesso para usuário ${userId}`, {  // Usando o logger
//             totalCaixinhas: processedData.caixinhas.length,
//             totalNotifications: processedData.notifications.length,
//             totalMessages: processedData.messages.length,
//             totalConnections: processedData.connections.friends.length + processedData.connections.bestFriends.length
//         });

//         return processedData;

//     } catch (error) {
//         coreLogger.logEvent('dashboardService', LOG_LEVELS.ERROR, `Erro ao buscar dados do dashboard para usuário ${userId}:`, { error: error.message, stack: error.stack }); // Usando o logger
//         throw new Error(`Falha ao buscar dados do dashboard: ${error.message}`);
//     } finally {
//         //console.timeEnd(`getDashboardData-${userId}`); //Removido o console.time
//     }
// };



// const getEssentialDashboardData = async (userId) => { //Mesma lógica de tratamento de erros com Promise.allSettled
//     coreLogger.logEvent('dashboardService', LOG_LEVELS.INFO, `Iniciando busca de dados essenciais do dashboard para usuário com ID: ${userId}...`);
//     //console.time(`getEssentialDashboardData-${userId}`); // Removido console.time

//     validateRequiredParams({ userId }, ['userId']);

//     try {
//         const [caixinhasResponse, notificationsResponse] = await Promise.allSettled([
//             caixinhaService.getCaixinhas(userId),
//             notificationService.fetchNotifications(userId)
//         ]);

//         const essentialData = {
//             caixinhas: caixinhasResponse.status === 'fulfilled' ? caixinhasResponse.value.data : [],
//             notifications: notificationsResponse.status === 'fulfilled' ? notificationsResponse.value : [],
//             hasUnreadNotifications: (notificationsResponse.status === 'fulfilled' ? notificationsResponse.value : []).some(notif => !notif.read)
//         };

//         coreLogger.logEvent('dashboardService', LOG_LEVELS.INFO, `Dados essenciais do dashboard obtidos com sucesso para usuário ${userId}`, {
//             totalCaixinhas: essentialData.caixinhas.length,
//             totalNotifications: essentialData.notifications.length,
//             hasUnreadNotifications: essentialData.hasUnreadNotifications
//         });

//         return essentialData;

//     } catch (error) {
//         coreLogger.logEvent('dashboardService', LOG_LEVELS.ERROR, `Erro ao buscar dados essenciais do dashboard para usuário ${userId}:`, { error: error.message, stack: error.stack });
//         throw new Error(`Falha ao buscar dados essenciais do dashboard: ${error.message}`);
//     } finally {
//         //console.timeEnd(`getEssentialDashboardData-${userId}`); //Removido console.time
//     }
// };

// const dashboardService = {
//     getDashboardData,
//     getEssentialDashboardData
// };

// export default dashboardService;