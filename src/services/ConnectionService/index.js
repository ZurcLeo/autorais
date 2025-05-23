// src/services/ConnectionService/index.js
import {BaseService, serviceLocator, serviceEventHub} from '../../core/services/BaseService';
import {LOG_LEVELS} from '../../core/constants/config';
import {CONNECTION_ACTIONS, SERVICE_ACTIONS} from '../../core/constants/actions';
import {CONNECTION_EVENTS} from '../../core/constants/events';

const MODULE_NAME = 'connections';

class ConnectionService extends BaseService {
    constructor() {
        super(MODULE_NAME);
        this.instanceId = Math
            .random()
            .toString(36)
            .substring(2, 10);

        this._connectionsCache = new Map();
        this._searchCache = new Map();
        this._isInitialized = false;

        this._metadata = {
            name: MODULE_NAME,
            phase: 'COMMUNICATION',
            criticalPath: true,
            dependencies: [
                'auth', 'users'
            ],
            category: 'communications',
            description: 'Gerencia Amizades e Conexoes.'
        };

        this._log(
            `📊 Nova instância de ${MODULE_NAME} criada, instanceId: ${this.instanceId}`
        );

        this.apiService = serviceLocator.get('apiService');
        this.authService = serviceLocator.get('auth');
        this.notificationService = serviceLocator.get('notifications');
        this.socket = null;
    }

    // Método para obter o usuário atual - mesma abordagem do InviteService
    getCurrentUser() {
        return this._currentUser = this
            .authService
            .getCurrentUser();
    }

    async initialize() {
        if (this.isInitialized) 
            return this;
        
        this._log(
            MODULE_NAME,
            LOG_LEVELS.LIFECYCLE,
            'ConnectionService initializing...',
            {timestamp: Date.now()}
        );

        try {
            this._log(
                MODULE_NAME,
                LOG_LEVELS.INITIALIZATION,
                'Initializing serviço de conexões'
            );

            this._isInitialized = true;

            // this._setupSocketListeners();

            this._emitEvent(SERVICE_ACTIONS.SERVICE_READY, {
                serviceName: MODULE_NAME,
                timestamp: new Date().toISOString()
            });

            return this;
        } catch (error) {
            this._logError(error, 'initialize');
            throw error;
        }
    }

      async initialize() {
        if (this.isInitialized) return this;
    
        this._log(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'ConnectionService initializing...', { timestamp: Date.now() });
    
        try {
    
          this._log(MODULE_NAME, LOG_LEVELS.INITIALIZATION, 'Inicializando serviço de convites');
          
          this._isInitialized = true;
          
          this._emitEvent(SERVICE_ACTIONS.SERVICE_READY, {
            serviceName: MODULE_NAME,
            timestamp: new Date().toISOString()
          });
    
          return this;
        } catch (error) {
          this._logError(error, 'initialize');
          return true; // Mantendo o comportamento de retornar true em caso de erro
        }
      }

      async healthCheck() {
        try {
          // Tentar verificar a saúde via API
          const healthResponse = await this._executeWithRetry(
            async () => {
              return await this.apiService.get(`/api/health/service/${this.serviceName}`);
            },
            'healthCheck'
          );
    
          return { status: healthResponse.data.status, timestamp: Date.now() };
        } catch (error) {
          // Implementar fallback se o endpoint de saúde estiver indisponível
          this._log(
            MODULE_NAME,
            LOG_LEVELS.WARNING,
            'Health check endpoint unavailable, proceeding with degraded mode',
            { error: error.message }
          );
    
          // Ainda retornar healthy para não bloquear outras funcionalidades
          return {
            status: 'degraded',
            details: 'Operating in offline mode',
            timestamp: Date.now(),
            error: error.message
          };
        }
      }
      
    async getConnections() {
        // Obter o usuário atual de forma segura
        this.getCurrentUser();
    
        // Verificar se o usuário está autenticado
        if (!this._currentUser) {
            throw new Error('Usuário não autenticado');
        }
    
        this._emitEvent(CONNECTION_ACTIONS.FETCH_START);
    
        try {
            const userId = this._currentUser.uid;
    
            // Verificar cache
            if (this._connectionsCache.has(userId) && !this._isCacheExpired(userId)) {
                const cachedData = this._connectionsCache.get(userId);
                this._emitEvent(CONNECTION_EVENTS.CONNECTIONS_FETCHED, {result: cachedData});
                return cachedData;
            }
    
            const response = await this._executeWithRetry(async () => {
                return await this.apiService.get(`/api/connections/active/user/${userId}`);
            }, 'getConnections');
            
            // Processar os dados
            const {friends, bestFriends, sentRequests, receivedRequests} = this.processConnectionData(response.data);
            
            // Buscar perfis completos dos amigos
            const userService = serviceLocator.get('users');
            
            // Buscar perfis dos amigos normais
            const friendProfiles = await Promise.all(
                friends.map(async friend => {
                    const friendId = friend.id || friend.uid || friend.friendId;
                    if (!friendId) return friend;
                    try {
                        return await userService.getUserById(friendId);
                    } catch (error) {
                        this._logError(error, `Failed to fetch profile for friend ${friendId}`);
                        return friend; // Retornar o objeto original em caso de falha
                    }
                })
            );
            
            // Buscar perfis dos melhores amigos
            const bestFriendProfiles = await Promise.all(
                bestFriends.map(async friend => {
                    const friendId = friend.id || friend.uid || friend.friendId;
                    if (!friendId) return friend;
                    try {
                        return await userService.getUserById(friendId);
                    } catch (error) {
                        this._logError(error, `Failed to fetch profile for best friend ${friendId}`);
                        return friend; // Retornar o objeto original em caso de falha
                    }
                })
            );
            
            // Atualizar os arrays com perfis completos
            const enrichedFriends = friendProfiles.filter(Boolean);
            const enrichedBestFriends = bestFriendProfiles.filter(Boolean);
            
            const result = {
                friends: enrichedFriends,
                bestFriends: enrichedBestFriends,
                receivedRequests,
                sentRequests
            };
            
            // Armazenar em cache
            this._cacheConnections(userId, result);
    
            // Emitir evento
            this._emitEvent(CONNECTION_EVENTS.CONNECTIONS_FETCHED, {result});
            return result;
        } catch (error) {
            this._logError(error, 'getConnections');
            this._emitEvent(CONNECTION_EVENTS.FETCH_FAILURE, {error: error.message});
            throw error;
        }
    }

    async getRequestsByStatus(userId, status) {
        this.getCurrentUser();
        // Obter o usuário atual se não for fornecido
        if (!userId) {

            if (!this._currentUser) {
                throw new Error('Usuário não autenticado');
            }
            userId = this._currentUser.uid;
        }

        try {
            const response = await this._executeWithRetry(async () => {
                return await this
                    .apiService
                    .get(`/api/connections/requested/${userId}?status=${status}`);
            }, 'getRequestsByStatus');

            const requestedConnections = response.data || [];

            this._log(
                MODULE_NAME,
                'INFO',
                `Obtidas ${requestedConnections.length} solicitações com status: ${status}`
            );

            this._emitEvent(
                CONNECTION_EVENTS.REQUESTED_CONNECTIONS_LOADED,
                {requestedConnections, status}
            );

            return requestedConnections;
        } catch (error) {
            this._logError(error, 'getRequestsByStatus');
            throw error;
        }
    }

    async getPendingRequests() {
        return this.getRequestsAsSender();
    }

    /**
 * Obtém solicitações enviadas pelo usuário atual com um determinado status
 * @param {string} status - Status das solicitações a serem buscadas
 * @returns {Promise<Array>} - Lista de solicitações
 */
    async getRequestsAsSender(status = 'pending') {
        this.getCurrentUser();

        if (!this._currentUser) {
            throw new Error('Usuário não autenticado');
        }

        try {
            const userId = this._currentUser.uid;

            const response = await this._executeWithRetry(async () => {
                return await this
                    .apiService
                    .get(`/api/connections/requested/user/${userId}`);
            }, 'getRequestsAsSender');

            const sentRequests = response.data || [];

            this._log(
                MODULE_NAME,
                'INFO',
                `Obtidas ${sentRequests.length} solicitações enviadas com status: ${status}`
            );

            this._emitEvent(CONNECTION_EVENTS.SENT_REQUESTS_LOADED, {sentRequests, status});

            return sentRequests;
        } catch (error) {
            this._logError(error, 'getRequestsAsSender');
            return [];
        }
    }

    /**
   * Aceita uma solicitação de conexão
   * @param {string} requestId - ID da solicitação
   * @returns {Promise<Object>} - Resposta do servidor
   */
    async acceptRequest(requestId) {
        this.getCurrentUser();

        if (!this._currentUser) {
            throw new Error('Usuário não autenticado');
        }

        try {
            const response = await this._executeWithRetry(async () => {
                return await this
                    .apiService
                    .post(`/api/connections/requests/${requestId}/accept`);
            }, 'acceptRequest');

            // Invalidar cache após aceitar uma solicitação
            this.invalidateConnectionCache(this._currentUser.uid);

            this._emitEvent(
                CONNECTION_EVENTS.CONNECTION_REQUEST_ACCEPTED,
                {requestId, result: response.data}
            );

            return response.data;
        } catch (error) {
            this._logError(error, 'acceptRequest');
            throw error;
        }
    }

    /**
   * Rejeita uma solicitação de conexão
   * @param {string} requestId - ID da solicitação
   * @returns {Promise<Object>} - Resposta do servidor
   */
    async rejectRequest(requestId) {
        this.getCurrentUser();

        if (!this._currentUser) {
            throw new Error('Usuário não autenticado');
        }

        try {
            const response = await this._executeWithRetry(async () => {
                return await this
                    .apiService
                    .put(`/api/connections/requested/${requestId}/reject`);
            }, 'rejectRequest');

            this._emitEvent(
                CONNECTION_EVENTS.CONNECTION_REQUEST_REJECTED,
                {requestId, result: response.data}
            );

            return response.data;
        } catch (error) {
            this._logError(error, 'rejectRequest');
            throw error;
        }
    }

    /**
   * Bloqueia um usuário
   * @param {string} userId - ID do usuário a ser bloqueado
   * @returns {Promise<Object>} - Resposta do servidor
   */
    async blockUser(userId) {
        this.getCurrentUser();

        if (!this._currentUser) {
            throw new Error('Usuário não autenticado');
        }

        try {
            const currentUserId = this._currentUser.uid;

            const response = await this._executeWithRetry(async () => {
                return await this
                    .apiService
                    .post(`/api/connections/blocked`, {
                        userId: currentUserId,
                        blockedUserId: userId
                    });
            }, 'blockUser');

            // Invalidar cache após bloqueio
            this.invalidateConnectionCache(currentUserId);

            this._emitEvent(CONNECTION_EVENTS.USER_BLOCKED, {
                blockedUserId: userId,
                result: response.data
            });

            return response.data;
        } catch (error) {
            this._logError(error, 'blockUser');
            throw error;
        }
    }

    async addBestFriend(friendId) {
        // Obter o usuário atual de forma segura
        this.getCurrentUser();

        // Verificar se o usuário está autenticado
        if (!this._currentUser) {
            throw new Error('Usuário não autenticado');
        }

        try {
            const userId = this._currentUser.uid;

            const response = await this._executeWithRetry(async () => {
                return await this
                    .apiService
                    .put(`/api/connections/active/bestfriends/${friendId}`, {friendId});
            }, 'addBestFriend');

            // Invalidar cache
            this.invalidateConnectionCache(userId);

            // Emitir evento
            this._emitEvent(
                CONNECTION_EVENTS.BEST_FRIEND_ADDED,
                {friendId, connection: response.data}
            );

            // Emitir evento de atualização para o provider
            this._emitEvent(CONNECTION_EVENTS.CONNECTION_UPDATED, {
                type: 'bestFriend',
                action: 'add',
                connection: response.data
            });

            return response.data;
        } catch (error) {
            this._logError(error, 'addBestFriend');
            throw error;
        }
    }

    async removeBestFriend(friendId) {
        // Obter o usuário atual de forma segura
        this.getCurrentUser();

        // Verificar se o usuário está autenticado
        if (!this._currentUser) {
            throw new Error('Usuário não autenticado');
        }

        try {
            const userId = this._currentUser.uid;

            const response = await this._executeWithRetry(async () => {
                return await this
                    .apiService
                    .delete(`/api/connections/active/bestfriends/${friendId}`);
            }, 'removeBestFriend');

            // Invalidar cache
            this.invalidateConnectionCache(userId);

            // Emitir evento
            this._emitEvent(
                CONNECTION_EVENTS.BEST_FRIEND_REMOVED,
                {friendId, connection: response.data}
            );

            // Emitir evento de atualização para o provider
            this._emitEvent(CONNECTION_EVENTS.CONNECTION_UPDATED, {
                type: 'bestFriend',
                action: 'remove',
                connection: response.data
            });

            return response.data;
        } catch (error) {
            this._logError(error, 'removeBestFriend');
            throw error;
        }
    }

    async deleteConnection(friendId) {
        // Obter o usuário atual de forma segura
        this.getCurrentUser();

        // Verificar se o usuário está autenticado
        if (!this._currentUser) {
            throw new Error('Usuário não autenticado');
        }

        try {
            const userId = this._currentUser.uid;

            await this._executeWithRetry(async () => {
                return await this
                    .apiService
                    .delete(`/api/connections/${userId}/friends/${friendId}`);
            }, 'deleteConnection');

            // Invalidar cache
            this.invalidateConnectionCache(userId);

            // Emitir evento
            this._emitEvent(CONNECTION_EVENTS.CONNECTION_DELETED, {connectionId: friendId});

            return {success: true};
        } catch (error) {
            this._logError(error, 'deleteConnection');
            throw error;
        }
    }

    async createConnectionRequest(friendId) {
        // Obter o usuário atual de forma segura
        this.getCurrentUser();

        // Verificar se o usuário está autenticado
        if (!this._currentUser) {
            throw new Error('Usuário não autenticado');
        }

        try {
            const userId = this._currentUser.uid;

            const response = await this._executeWithRetry(async () => {
                return await this
                    .apiService
                    .post(`/api/connections/requested`, {
                        userId: userId,
                        friendId: friendId
                    });
            }, 'createConnectionRequest');

            const newRequest = response.data;

            // Emitir evento
            this._emitEvent(CONNECTION_EVENTS.CONNECTION_REQUESTED, {newRequest});

            return newRequest;
        } catch (error) {
            this._logError(error, 'createConnectionRequest');
            throw error;
        }
    }

    async searchUsers(query, options = {}) {
        // Obter o usuário atual de forma segura
        this.getCurrentUser();

        // Verificar se o usuário está autenticado
        if (!this._currentUser) {
            throw new Error('Usuário não autenticado');
        }

        // Emitir evento de início de busca
        this._emitEvent(CONNECTION_EVENTS.SEARCH_STARTED, {query, options});

        try {
            const userId = this._currentUser.uid;

            // Parâmetros de busca avançados
            const {
                type = 'all',
                page = 1,
                limit = 20,
                includeInactive = false
            } = options;

            // Verificar cache para consultas recentes
            const cacheKey = this._generateSearchCacheKey(query, userId, options);

            if (this._searchCache.has(cacheKey) && !this._isSearchCacheExpired(cacheKey)) {
                const cachedResults = this
                    ._searchCache
                    .get(cacheKey)
                    .results;

                // Emitir evento de busca concluída (do cache)
                this._emitEvent(CONNECTION_EVENTS.SEARCH_COMPLETED, {
                    results: cachedResults,
                    fromCache: true,
                    query
                });

                return cachedResults;
            }

            // Construir parâmetros de query para API
            const searchParams = new URLSearchParams({
                q: query,
                excludeUserId: userId,
                type,
                page,
                limit,
                includeInactive: includeInactive
                    ? 'true'
                    : 'false'
            });

            // Realizar busca no backend com parâmetros aprimorados
            const response = await this._executeWithRetry(async () => {
                return await this
                    .apiService
                    .get(`/api/users/search?${searchParams.toString()}`);
            }, 'searchUsers');

            const results = response.data.results || [];

            // Categorizar resultados
            const categorizedResults = this._categorizeSearchResults(results, query);

            // Armazenar em cache com metadados
            this._cacheSearchResults(cacheKey, {
                results,
                categorized: categorizedResults,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(response.data.count / limit),
                    hasMore: results.length >= limit
                }
            });

            // Emitir evento de busca concluída com resultados completos
            this._emitEvent(CONNECTION_EVENTS.SEARCH_COMPLETED, {
                results,
                categorized: categorizedResults,
                fromCache: false,
                query,
                count: response.data.count
            });

            return results;
        } catch (error) {
            this._logError(error, 'searchUsers');

            // Emitir evento de erro
            this._emitEvent(CONNECTION_EVENTS.SEARCH_ERROR, {
                error: error.message,
                query
            });

            throw error;
        }
    }

    // Método auxiliar para categorizar resultados
    _categorizeSearchResults(results, query) {
        if (!results || !Array.isArray(results)) 
            return {};
        
        const lowerQuery = query.toLowerCase();

        // Dividir em categorias
        const exactMatches = results.filter(
            user => user.nome
                ?.toLowerCase() === lowerQuery || user.email
                    ?.toLowerCase() === lowerQuery
        );

        const byInterests = results.filter(
            user => Array.isArray(user.interesses) && 
                    user.interesses.some(interest => interest.toLowerCase().includes(lowerQuery))
        );

        const byLocation = results.filter(
            user => user.localizacao
                ?.toLowerCase().includes(lowerQuery)
        );

        return {
            exactMatches,
            byInterests,
            byLocation,
            others: results.filter(
                user => !exactMatches.includes(user) && !byInterests.includes(user) && !byLocation.includes(user)
            )
        };
    }

// Método corrigido para processConnectionData no ConnectionService
processConnectionData(connectionsData) {
    console.log("[ConnectionService] Processando dados de conexão:", connectionsData);
    
    if (!connectionsData) {
      console.warn("[ConnectionService] Dados de conexão vazios");
      return { friends: [], bestFriends: [], sentRequests: [], receivedRequests: [] };
    }
  
    // Se já temos friends e bestFriends separados na resposta
    if (Array.isArray(connectionsData.friends) || Array.isArray(connectionsData.bestFriends)) {
      return {
        friends: Array.isArray(connectionsData.friends) ? connectionsData.friends : [],
        bestFriends: Array.isArray(connectionsData.bestFriends) ? connectionsData.bestFriends : [],
        sentRequests: Array.isArray(connectionsData.sentRequests) ? connectionsData.sentRequests : [],
        receivedRequests: Array.isArray(connectionsData.receivedRequests) ? connectionsData.receivedRequests : []
      };
    }
  
    // Código para compatibilidade com formato antigo
    const friends = [];
    const bestFriends = [];
  
    if (Array.isArray(connectionsData.connections)) {
      connectionsData.connections.forEach(connection => {
        if (connection.isBestFriend) {
          bestFriends.push(connection);
        } else {
          friends.push(connection);
        }
      });
    } else if (typeof connectionsData.connections === 'object') {
      // Se connections for um objeto, convertê-lo para array
      Object.values(connectionsData.connections).forEach(connection => {
        if (connection.isBestFriend) {
          bestFriends.push(connection);
        } else {
          friends.push(connection);
        }
      });
    }
  
    console.log("[ConnectionService] Dados processados:", { 
      friendsCount: friends.length, 
      bestFriendsCount: bestFriends.length 
    });
  
    return {
      friends,
      bestFriends,
      sentRequests: Array.isArray(connectionsData.sentRequests) ? connectionsData.sentRequests : [],
      receivedRequests: Array.isArray(connectionsData.receivedRequests) ? connectionsData.receivedRequests : []
    };
  }

    // Métodos para gerenciamento de cache
    invalidateConnectionCache(userId) {
        this
            ._connectionsCache
            .delete(userId);
    }

    _cacheConnections(userId, data) {
        this
            ._connectionsCache
            .set(userId, {
                ...data,
                timestamp: Date.now()
            });
    }

    _cacheSearchResults(cacheKey, results) {
        this
            ._searchCache
            .set(cacheKey, {results, timestamp: Date.now()});
    }

    _generateSearchCacheKey(query, userId, options) {
        return `${query}:${userId}:${JSON.stringify(options)}`;
    }

    _isCacheExpired(userId, maxAge = 5 * 60 * 1000) { // 5 minutos
        if (!this._connectionsCache.has(userId)) 
            return true;
        
        const cachedData = this
            ._connectionsCache
            .get(userId);
        return Date.now() - cachedData.timestamp > maxAge;
    }

    _isSearchCacheExpired(cacheKey, maxAge = 60 * 1000) { // 1 minuto
        if (!this._searchCache.has(cacheKey)) 
            return true;
        
        const cachedData = this
            ._searchCache
            .get(cacheKey);
        return Date.now() - cachedData.timestamp > maxAge;
    }

    _clearCache() {
        this
            ._connectionsCache
            .clear();
        this
            ._searchCache
            .clear();
    }
}

export {
    ConnectionService
};