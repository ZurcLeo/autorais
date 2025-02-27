// src/services/connectionService.js
import {api} from './apiService';

// Função auxiliar para validar parâmetros obrigatórios
const validateRequiredParams = (params, requiredFields) => {
  for (const field of requiredFields) {
    if (!params[field]) {
      throw new Error(`O campo ${field} é obrigatório.`);
    }
  }
};

const connectionService = {
  /**
   * Obtém conexões e melhores amigos de um usuário.
   * @param {string} userId - ID do usuário.
   * @returns {Promise<Object>} - Dados das conexões do usuário.
   */
  getConnectionsByUserId: async (userId) => {
    console.debug(`Iniciando busca de conexões para o usuário com ID: ${userId}...`);
    console.time(`getConnections-${userId}`);

    if (!userId) {
      console.error('userId não fornecido para busca de conexões.');
      throw new Error('userID é obrigatório para buscar conexões.');
    }

    try {
      const response = await api.get(`/api/connections/active/user/${userId}`);
      console.info(`Conexões obtidas com sucesso para o usuário ${userId}. Total: ${response.data.length}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao obter conexões para usuário ${userId}:`, error.message, error.stack);
      throw new Error(`Falha ao buscar conexões: ${error.message}`);
    } finally {
      console.timeEnd(`getConnections-${userId}`);
    }
  },

  /**
   * Atualiza uma conexão ativa, incluindo status de melhor amigo
   * @param {string} connectionId - ID da conexão
   * @param {Object} updateData - Dados a serem atualizados
   * @returns {Promise<Object>} - Conexão atualizada
   */
  updateActiveConnection: async (connectionId, updateData) => {
    console.debug(`Iniciando atualização da conexão com ID: ${connectionId}...`);
    console.time(`updateConnection-${connectionId}`);

    validateRequiredParams({ connectionId, updateData }, ['connectionId', 'updateData']);

    try {
      const response = await api.put(`/api/connections/active/${connectionId}`, updateData);
      console.info(`Conexão ${connectionId} atualizada com sucesso.`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar conexão ${connectionId}:`, error.message, error.stack);
      throw new Error(`Falha ao atualizar conexão: ${error.message}`);
    } finally {
      console.timeEnd(`updateConnection-${connectionId}`);
    }
  },

  /**
   * Adiciona um amigo à lista de melhores amigos
   * @param {string} connectionId - ID da conexão
   * @returns {Promise<Object>}
   */
  addBestFriend: async (connectionId) => {
    console.debug(`Iniciando adição de melhor amigo para conexão ID: ${connectionId}...`);
    console.time(`addBestFriend-${connectionId}`);

    if (!connectionId) {
      console.error('connectionId não fornecido para adicionar melhor amigo.');
      throw new Error('connectionId é obrigatório para adicionar melhor amigo.');
    }

    try {
      const result = await connectionService.updateActiveConnection(connectionId, {
        isBestFriend: true,
        updatedAt: new Date().toISOString()
      });
      console.info(`Conexão ${connectionId} marcada como melhor amigo com sucesso.`);
      return result;
    } catch (error) {
      console.error(`Erro ao adicionar melhor amigo ${connectionId}:`, error.message, error.stack);
      throw new Error(`Falha ao adicionar melhor amigo: ${error.message}`);
    } finally {
      console.timeEnd(`addBestFriend-${connectionId}`);
    }
  },

  /**
   * Remove um amigo da lista de melhores amigos
   * @param {string} connectionId - ID da conexão
   * @returns {Promise<Object>}
   */
  removeBestFriend: async (connectionId) => {
    console.debug(`Iniciando remoção de melhor amigo para conexão ID: ${connectionId}...`);
    console.time(`removeBestFriend-${connectionId}`);

    if (!connectionId) {
      console.error('connectionId não fornecido para remover melhor amigo.');
      throw new Error('connectionId é obrigatório para remover melhor amigo.');
    }

    try {
      const result = await connectionService.updateActiveConnection(connectionId, {
        isBestFriend: false,
        updatedAt: new Date().toISOString()
      });
      console.info(`Conexão ${connectionId} removida da lista de melhores amigos com sucesso.`);
      return result;
    } catch (error) {
      console.error(`Erro ao remover melhor amigo ${connectionId}:`, error.message, error.stack);
      throw new Error(`Falha ao remover melhor amigo: ${error.message}`);
    } finally {
      console.timeEnd(`removeBestFriend-${connectionId}`);
    }
  },

  /**
   * Deleta uma conexão ativa.
   * @param {string} friendId - ID do amigo a ser removido.
   */
  deleteActiveConnection: async (friendId) => {
    console.debug(`Iniciando exclusão da conexão com amigo ID: ${friendId}...`);
    console.time(`deleteConnection-${friendId}`);

    if (!friendId) {
      console.error('friendId não fornecido para deletar conexão.');
      throw new Error('friendId é obrigatório para deletar conexão.');
    }

    try {
      const response = await api.delete(`/api/connections/active/${friendId}`);
      console.info(`Conexão com amigo ${friendId} excluída com sucesso.`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao deletar conexão com amigo ${friendId}:`, error.message, error.stack);
      throw new Error(`Falha ao deletar conexão: ${error.message}`);
    } finally {
      console.timeEnd(`deleteConnection-${friendId}`);
    }
  },

  /**
   * Cria uma nova conexão ativa.
   * @param {string} friendId - ID do amigo a ser conectado.
   * @returns {Promise<Object>} - Nova conexão criada.
   */
  createActiveConnection: async (friendId) => {
    console.debug(`Iniciando criação de nova conexão com amigo ID: ${friendId}...`);
    console.time(`createConnection-${friendId}`);

    if (!friendId) {
      console.error('friendId não fornecido para criar conexão.');
      throw new Error('friendId é obrigatório para criar conexão.');
    }

    try {
      const response = await api.post('/api/connections/active', { friendId });
      console.info(`Nova conexão criada com sucesso com amigo ${friendId}.`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao criar conexão com amigo ${friendId}:`, error.message, error.stack);
      throw new Error(`Falha ao criar conexão: ${error.message}`);
    } finally {
      console.timeEnd(`createConnection-${friendId}`);
    }
  },

  /**
   * Envia uma solicitação de amizade.
   * @param {string} userId - ID do usuário que envia a solicitação.
   * @param {string} friendId - ID do amigo a ser convidado.
   * @returns {Promise<Object>} - Dados da solicitação enviada.
   */
  createRequestConnection: async (userId, friendId) => {
    console.debug(`Iniciando criação de solicitação de amizade de ${userId} para ${friendId}...`);
    console.time(`createRequest-${userId}-${friendId}`);

    validateRequiredParams({ userId, friendId }, ['userId', 'friendId']);

    try {
      const response = await api.post('/api/connections/request', { userId, friendId });
      console.info(`Solicitação de amizade enviada com sucesso de ${userId} para ${friendId}.`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao criar solicitação de amizade de ${userId} para ${friendId}:`, error.message, error.stack);
      throw new Error(`Falha ao criar solicitação de amizade: ${error.message}`);
    } finally {
      console.timeEnd(`createRequest-${userId}-${friendId}`);
    }
  },

  /**
   * Busca usuários com base em um termo de pesquisa.
   * @param {string} query - Termo de busca.
   * @returns {Promise<Array>} - Lista de usuários encontrados.
   */
  searchUsers: async (query) => {
    console.debug(`Iniciando busca de usuários com termo: "${query}"...`);
    console.time(`searchUsers-${query}`);

    if (!query || query.trim().length === 0) {
      console.error('Query não fornecida ou vazia para busca de usuários.');
      throw new Error('Termo de busca é obrigatório para pesquisar usuários.');
    }

    try {
      const response = await api.get(`/api/connections/search`, { params: { q: query } });
      console.info(`Busca de usuários concluída com sucesso. Encontrados: ${response.data.length} resultados.`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar usuários com termo "${query}":`, error.message, error.stack);
      throw new Error(`Falha ao buscar usuários: ${error.message}`);
    } finally {
      console.timeEnd(`searchUsers-${query}`);
    }
  }
};

export default connectionService;