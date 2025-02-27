// src/services/dashboardService.js
import caixinhaService from './caixinhaService';
import notificationService from './notificationService';
import messageService from './messageService';
import connectionService from './connectionService';

// Função auxiliar para validar parâmetros obrigatórios
const validateRequiredParams = (params, requiredFields) => {
  for (const field of requiredFields) {
    if (!params[field]) {
      throw new Error(`O campo ${field} é obrigatório.`);
    }
  }
};

// Função auxiliar para processar os dados do dashboard
const processDashboardData = (rawData) => {
  return {
    caixinhas: Array.isArray(rawData.caixinhas) ? rawData.caixinhas : [],
    notifications: Array.isArray(rawData.notifications) ? rawData.notifications : [],
    messages: Array.isArray(rawData.messages) ? rawData.messages : [],
    connections: {
      friends: Array.isArray(rawData.connections?.friends) ? rawData.connections.friends : [],
      bestFriends: Array.isArray(rawData.connections?.bestFriends) ? rawData.connections.bestFriends : []
    }
  };
};

/**
 * Obtém todos os dados necessários para o dashboard do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} Dados do dashboard processados
 */
const getDashboardData = async (userId) => {
  console.debug(`Iniciando busca de dados do dashboard para usuário com ID: ${userId}...`);
  console.time(`getDashboardData-${userId}`);

  // Validação do userId
  if (!userId) {
    console.error('userId não fornecido para busca de dados do dashboard.');
    throw new Error('userID é obrigatório para buscar dados do dashboard.');
  }

  try {
    console.debug('Iniciando busca paralela de dados...');
    
    const [
      caixinhasResponse,
      notificationsResponse,
      messagesResponse,
      connectionsResponse
    ] = await Promise.all([
      caixinhaService.getCaixinhas(userId).catch(error => {
        console.warn(`Erro ao buscar caixinhas: ${error.message}`);
        return { data: [] };
      }),
      notificationService.fetchNotifications(userId).catch(error => {
        console.warn(`Erro ao buscar notificações: ${error.message}`);
        return [];
      }),
      messageService.fetchAllMessages(userId).catch(error => {
        console.warn(`Erro ao buscar mensagens: ${error.message}`);
        return [];
      }),
      connectionService.getConnectionsByUserId(userId).catch(error => {
        console.warn(`Erro ao buscar conexões: ${error.message}`);
        return { friends: [], bestFriends: [] };
      })
    ]);

    const rawData = {
      caixinhas: caixinhasResponse.data,
      notifications: notificationsResponse,
      messages: messagesResponse,
      connections: connectionsResponse
    };

    const processedData = processDashboardData(rawData);

    console.info(`Dados do dashboard processados com sucesso para usuário ${userId}`, {
      totalCaixinhas: processedData.caixinhas.length,
      totalNotifications: processedData.notifications.length,
      totalMessages: processedData.messages.length,
      totalConnections: processedData.connections.friends.length + processedData.connections.bestFriends.length
    });

    return processedData;

  } catch (error) {
    console.error(`Erro ao buscar dados do dashboard para usuário ${userId}:`, error.message, error.stack);
    throw new Error(`Falha ao buscar dados do dashboard: ${error.message}`);
  } finally {
    console.timeEnd(`getDashboardData-${userId}`);
  }
};

/**
 * Obtém uma versão simplificada dos dados do dashboard (apenas dados essenciais)
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} Dados essenciais do dashboard
 */
const getEssentialDashboardData = async (userId) => {
  console.debug(`Iniciando busca de dados essenciais do dashboard para usuário com ID: ${userId}...`);
  console.time(`getEssentialDashboardData-${userId}`);

  validateRequiredParams({ userId }, ['userId']);

  try {
    const [caixinhasResponse, notificationsResponse] = await Promise.all([
      caixinhaService.getCaixinhas(userId).catch(error => {
        console.warn(`Erro ao buscar caixinhas: ${error.message}`);
        return { data: [] };
      }),
      notificationService.fetchNotifications(userId).catch(error => {
        console.warn(`Erro ao buscar notificações: ${error.message}`);
        return [];
      })
    ]);

    const essentialData = {
      caixinhas: caixinhasResponse.data || [],
      notifications: notificationsResponse || [],
      hasUnreadNotifications: (notificationsResponse || []).some(notif => !notif.read)
    };

    console.info(`Dados essenciais do dashboard obtidos com sucesso para usuário ${userId}`, {
      totalCaixinhas: essentialData.caixinhas.length,
      totalNotifications: essentialData.notifications.length,
      hasUnreadNotifications: essentialData.hasUnreadNotifications
    });

    return essentialData;

  } catch (error) {
    console.error(`Erro ao buscar dados essenciais do dashboard para usuário ${userId}:`, error.message, error.stack);
    throw new Error(`Falha ao buscar dados essenciais do dashboard: ${error.message}`);
  } finally {
    console.timeEnd(`getEssentialDashboardData-${userId}`);
  }
};

const dashboardService = {
  getDashboardData,
  getEssentialDashboardData
};

export default dashboardService;