import {api} from './apiService';

const fetchNotifications = async (userId) => {
  console.debug(`Iniciando busca de notificações para o usuário com ID: ${userId}...`);
  console.time(`fetchNotifications-${userId}`); // Timer para medir o tempo de execução

  try {
    const response = await api.get(`/api/notifications/${userId}`);
    console.info(`Notificações buscadas com sucesso para o usuário com ID: ${userId}. Total: ${response.data.length}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar notificações para o usuário com ID: ${userId}:`, error.message, error.stack);
    throw new Error(`Falha ao buscar notificações: ${error.message}`);
  } finally {
    console.timeEnd(`fetchNotifications-${userId}`);
  }
};

const markAsRead = async (userId, notificationId, type) => {
  console.debug(`Iniciando marcação de notificação como lida. UserID: ${userId}, NotificationID: ${notificationId}, Type: ${type}...`);
  console.time(`markAsRead-${notificationId}`); // Timer para medir o tempo de execução

  try {
    const response = await api.post(`/api/notifications/${userId}/markAsRead`, {
      userId,
      notificationId,
      type
    });
    console.info(`Notificação marcada como lida com sucesso. UserID: ${userId}, NotificationID: ${notificationId}, Type: ${type}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao marcar notificação como lida. UserID: ${userId}, NotificationID: ${notificationId}, Type: ${type}:`, error.message, error.stack);
    throw new Error(`Falha ao marcar notificação como lida: ${error.message}`);
  } finally {
    console.timeEnd(`markAsRead-${notificationId}`);
  }
}

export default {
  fetchNotifications,
  markAsRead
};