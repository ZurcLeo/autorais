import { api } from '../apiService';
import { coreLogger } from '../../core/logging/CoreLogger';

class NotificationService {
  constructor() {
    this.serviceName = 'notifications';
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
      await api.get('/api/notifications/health');
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

  async fetchNotifications(userId) {
    coreLogger.log(`Fetching notifications for user ${userId}`, 'INFO');
    
    try {
      const response = await api.get(`/api/notifications/${userId}`);
      return response.data;
    } catch (error) {
      coreLogger.logServiceError(this.serviceName, error, { 
        context: 'fetchNotifications',
        userId 
      });
      throw error;
    }
  }

  async markAsRead(userId, notificationId, type) {
    coreLogger.log(`Marking notification ${notificationId} as read`, 'INFO');
    
    try {
      const response = await api.post(`/api/notifications/${userId}/markAsRead`, {
        notificationId,
        type
      });
      return response.data;
    } catch (error) {
      coreLogger.logServiceError(this.serviceName, error, { 
        context: 'markAsRead',
        userId,
        notificationId,
        type 
      });
      throw error;
    }
  }

  async clearAllNotifications(userId) {
    coreLogger.log(`Clearing all notifications for user ${userId}`, 'INFO');
    
    try {
      const response = await api.post(`/api/notifications/${userId}/clearAll`);
      return response.data;
    } catch (error) {
      coreLogger.logServiceError(this.serviceName, error, { 
        context: 'clearAllNotifications',
        userId 
      });
      throw error;
    }
  }
}

// Exporta uma instância singleton
export const notificationService = new NotificationService();