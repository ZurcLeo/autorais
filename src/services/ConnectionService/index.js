import { api } from '../apiService';
import { coreLogger } from '../../core/logging/CoreLogger';

class ConnectionService {
  constructor() {
    this.serviceName = 'connections';
  }

  // Método de inicialização requerido pelo ServiceInitializer
  async initialize() {
    coreLogger.log(`Initializing ${this.serviceName} service`, 'INITIALIZATION');
    // Verificação inicial do endpoint para garantir que o serviço está acessível
    await this.healthCheck();
    return true;
  }

  // Método de health check requerido pelo ServiceInitializer
  async healthCheck() {
    try {
      await api.get('/api/connections/health');
      return { status: 'healthy' };
    } catch (error) {
      coreLogger.logServiceError(this.serviceName, error, { 
        context: 'healthCheck' 
      });
      throw error;
    }
  }

  // Método de shutdown requerido pelo ServiceInitializer
  async shutdown() {
    coreLogger.log(`Shutting down ${this.serviceName} service`, 'INITIALIZATION');
    return true;
  }

  /**
   * Obtém conexões e melhores amigos de um usuário.
   * @param {string} userId - ID do usuário.
   * @returns {Promise<Object>} - Dados das conexões do usuário.
   */
  async getConnectionsByUserId(userId) {
    if (!userId) {
      const error = new Error('userID é obrigatório para buscar conexões');
      coreLogger.logServiceError(this.serviceName, error);
      throw error;
    }

    try {
      const response = await api.get(`/api/connections/active/user/${userId}`);
      coreLogger.log(`Connections fetched for user ${userId}`, 'INFO', {
        count: response.data?.length || 0
      });
      return response.data;
    } catch (error) {
      coreLogger.logServiceError(this.serviceName, error, { 
        context: 'getConnectionsByUserId',
        userId 
      });
      throw error;
    }
  }

  /**
   * Atualiza uma conexão ativa.
   * @param {string} connectionId - ID da conexão
   * @param {Object} updateData - Dados a serem atualizados
   * @returns {Promise<Object>} - Conexão atualizada
   */
  async updateActiveConnection(connectionId, updateData) {
    if (!connectionId || !updateData) {
      const error = new Error('connectionId e updateData são obrigatórios');
      coreLogger.logServiceError(this.serviceName, error);
      throw error;
    }

    try {
      const response = await api.put(`/api/connections/active/${connectionId}`, updateData);
      coreLogger.log(`Connection ${connectionId} updated`, 'INFO', { 
        updateFields: Object.keys(updateData) 
      });
      return response.data;
    } catch (error) {
      coreLogger.logServiceError(this.serviceName, error, { 
        context: 'updateActiveConnection',
        connectionId,
        updateFields: Object.keys(updateData)
      });
      throw error;
    }
  }

  /**
   * Adiciona um amigo à lista de melhores amigos
   * @param {string} userId - ID do usuário
   * @param {string} friendId - ID do amigo
   * @returns {Promise<Object>}
   */
  async addBestFriend(userId, friendId) {
    if (!userId || !friendId) {
      const error = new Error('userId e friendId são obrigatórios');
      coreLogger.logServiceError(this.serviceName, error);
      throw error;
    }

    try {
      const response = await api.post(`/api/connections/bestfriends`, { 
        userId, 
        friendId 
      });
      
      coreLogger.log(`Added best friend relationship`, 'INFO', {
        userId,
        friendId
      });
      
      return response.data;
    } catch (error) {
      coreLogger.logServiceError(this.serviceName, error, { 
        context: 'addBestFriend',
        userId,
        friendId
      });
      throw error;
    }
  }

  /**
   * Remove um amigo da lista de melhores amigos
   * @param {string} userId - ID do usuário
   * @param {string} friendId - ID do amigo
   * @returns {Promise<Object>}
   */
  async removeBestFriend(userId, friendId) {
    if (!userId || !friendId) {
      const error = new Error('userId e friendId são obrigatórios');
      coreLogger.logServiceError(this.serviceName, error);
      throw error;
    }

    try {
      const response = await api.delete(`/api/connections/bestfriends/${userId}/${friendId}`);
      
      coreLogger.log(`Removed best friend relationship`, 'INFO', {
        userId,
        friendId
      });
      
      return response.data;
    } catch (error) {
      coreLogger.logServiceError(this.serviceName, error, { 
        context: 'removeBestFriend',
        userId,
        friendId
      });
      throw error;
    }
  }

  /**
   * Deleta uma conexão ativa.
   * @param {string} userId - ID do usuário
   * @param {string} friendId - ID do amigo a ser removido
   */
  async deleteActiveConnection(userId, friendId) {
    if (!userId || !friendId) {
      const error = new Error('userId e friendId são obrigatórios');
      coreLogger.logServiceError(this.serviceName, error);
      throw error;
    }

    try {
      const response = await api.delete(`/api/connections/active/${userId}/${friendId}`);
      
      coreLogger.log(`Connection deleted`, 'INFO', {
        userId,
        friendId
      });
      
      return response.data;
    } catch (error) {
      coreLogger.logServiceError(this.serviceName, error, { 
        context: 'deleteActiveConnection',
        userId,
        friendId
      });
      throw error;
    }
  }

  /**
   * Envia uma solicitação de amizade.
   * @param {string} userId - ID do usuário que envia a solicitação
   * @param {string} friendId - ID do amigo a ser convidado
   * @returns {Promise<Object>} - Dados da solicitação enviada
   */
  async createRequestConnection(userId, friendId) {
    if (!userId || !friendId) {
      const error = new Error('userId e friendId são obrigatórios');
      coreLogger.logServiceError(this.serviceName, error);
      throw error;
    }

    try {
      const response = await api.post('/api/connections/request', { userId, friendId });
      
      coreLogger.log(`Connection request sent`, 'INFO', {
        from: userId,
        to: friendId
      });
      
      return response.data;
    } catch (error) {
      coreLogger.logServiceError(this.serviceName, error, { 
        context: 'createRequestConnection',
        userId,
        friendId
      });
      throw error;
    }
  }

  /**
   * Busca usuários com base em um termo de pesquisa.
   * @param {string} query - Termo de busca.
   * @returns {Promise<Array>} - Lista de usuários encontrados.
   */
  async searchUsers(query) {
    if (!query || query.trim().length === 0) {
      const error = new Error('Termo de busca é obrigatório');
      coreLogger.logServiceError(this.serviceName, error);
      throw error;
    }

    try {
      const response = await api.get(`/api/connections/search`, { 
        params: { q: query.trim() } 
      });
      
      coreLogger.log(`User search performed`, 'INFO', {
        query,
        resultsCount: response.data?.length || 0
      });
      
      return response.data;
    } catch (error) {
      coreLogger.logServiceError(this.serviceName, error, { 
        context: 'searchUsers',
        query
      });
      throw error;
    }
  }
}

// Exporta uma instância singleton
export const connectionService = new ConnectionService();