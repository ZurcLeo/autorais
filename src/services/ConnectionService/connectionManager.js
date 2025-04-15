// import { connectionService } from './';
// import { globalCache } from '../../utils/cache/cacheManager';
// import { coreLogger } from '../../core/logging';

// // Configuração de cache
// const CACHE_CONFIG = {
//   CONNECTIONS_KEY: 'user:connections',
//   INVITATIONS_KEY: 'user:invitations',
//   SEARCH_RESULTS_KEY: 'user:search',
//   CACHE_TIME: 30 * 60 * 1000, // 30 minutos
//   STALE_TIME: 5 * 60 * 1000   // 5 minutos
// };

// class ConnectionManager {
//   // Obter conexões de um usuário com cache
//   async getConnections(userId) {
//     if (!userId) {
//       throw new Error('userId é obrigatório');
//     }
    
//     // Chave de cache para este usuário
//     const cacheKey = `${CACHE_CONFIG.CONNECTIONS_KEY}:${userId}`;
    
//     // Verificar se temos dados em cache
//     const cachedData = globalCache.getItem(cacheKey);
//     if (cachedData && !globalCache.isStale(cacheKey, CACHE_CONFIG.STALE_TIME)) {
//       coreLogger.log('Using cached connections data', 'DEBUG', { userId });
//       return cachedData;
//     }
    
//     // Se não tivermos em cache ou estiver obsoleto, buscar da API
//     const connections = await connectionService.getConnectionsByUserId(userId);
    
//     // Armazenar no cache
//     globalCache.setItem(cacheKey, connections, { 
//       cacheTime: CACHE_CONFIG.CACHE_TIME 
//     });
    
//     return connections;
//   }
  
//   // Adicionar amigo como melhor amigo
//   async addBestFriend(userId, friendId) {
//     const result = await connectionService.addBestFriend(userId, friendId);
    
//     // Invalidar o cache para forçar uma nova busca na próxima solicitação
//     this.invalidateConnectionCache(userId);
    
//     return result;
//   }
  
//   // Remover amigo da lista de melhores amigos
//   async removeBestFriend(userId, friendId) {
//     const result = await connectionService.removeBestFriend(userId, friendId);
    
//     // Invalidar o cache para forçar uma nova busca na próxima solicitação
//     this.invalidateConnectionCache(userId);
    
//     return result;
//   }
  
//   // Excluir uma conexão
//   async deleteConnection(userId, friendId) {
//     const result = await connectionService.deleteActiveConnection(userId, friendId);
    
//     // Invalidar o cache para forçar uma nova busca na próxima solicitação
//     this.invalidateConnectionCache(userId);
    
//     // Também invalidar o cache do amigo, se houver
//     if (friendId) {
//       this.invalidateConnectionCache(friendId);
//     }
    
//     return result;
//   }
  
//   // Enviar solicitação de amizade
//   async createConnectionRequest(userId, friendId) {
//     const result = await connectionService.createRequestConnection(userId, friendId);
    
//     // Invalidar o cache para forçar uma nova busca na próxima solicitação
//     this.invalidateConnectionCache(userId);
    
//     // Também invalidar o cache do amigo que recebeu a solicitação
//     if (friendId) {
//       this.invalidateConnectionCache(friendId);
//     }
    
//     return result;
//   }
  
//   // Buscar usuários
//   async searchUsers(query, options = {}) {
//     const { useCache = true, userId } = options;
    
//     // Se cache estiver desabilitado, buscar diretamente
//     if (!useCache) {
//       return await connectionService.searchUsers(query);
//     }
    
//     // Chave de cache para esta busca
//     const cacheKey = `${CACHE_CONFIG.SEARCH_RESULTS_KEY}:${query.trim().toLowerCase()}`;
    
//     // Verificar se temos resultados em cache
//     const cachedResults = globalCache.getItem(cacheKey);
//     if (cachedResults && !globalCache.isStale(cacheKey, 60 * 1000)) { // 1 minuto de stale time para buscas
//       return cachedResults;
//     }
    
//     // Buscar da API
//     const results = await connectionService.searchUsers(query);
    
//     // Armazenar no cache com um tempo mais curto
//     globalCache.setItem(cacheKey, results, { 
//       cacheTime: 5 * 60 * 1000 // 5 minutos para resultados de busca
//     });
    
//     return results;
//   }
  
//   // Invalidar o cache de conexões de um usuário
//   invalidateConnectionCache(userId) {
//     if (!userId) return;
    
//     globalCache.invalidate(`${CACHE_CONFIG.CONNECTIONS_KEY}:${userId}`);
//     globalCache.invalidate(`${CACHE_CONFIG.INVITATIONS_KEY}:${userId}`);
    
//     coreLogger.log('Connection cache invalidated', 'DEBUG', { userId });
//   }
  
//   // Invalidar todos os caches relacionados a conexões
//   invalidateAllConnectionCaches() {
//     globalCache.invalidateByPattern(`${CACHE_CONFIG.CONNECTIONS_KEY}:*`);
//     globalCache.invalidateByPattern(`${CACHE_CONFIG.INVITATIONS_KEY}:*`);
//     globalCache.invalidateByPattern(`${CACHE_CONFIG.SEARCH_RESULTS_KEY}:*`);
    
//     coreLogger.log('All connection caches invalidated', 'DEBUG');
//   }
  
//   // Processar os dados das conexões para separar amigos e melhores amigos
//   processConnectionData(connections) {
//     if (!connections || !Array.isArray(connections)) {
//       return { friends: [], bestFriends: [] };
//     }
    
//     const friends = connections.filter(conn => !conn.isBestFriend);
//     const bestFriends = connections.filter(conn => conn.isBestFriend);
    
//     return { friends, bestFriends };
//   }
// }

// export const connectionManager = new ConnectionManager();