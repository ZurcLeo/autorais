import { notificationService } from './';
import { globalCache } from '../../utils/cache/cacheManager';

// Configuração de cache
const CACHE_CONFIG = {
  NOTIFICATIONS_KEY: 'user:notifications',
  CACHE_TIME: 5 * 60 * 1000, // 5 minutos
  STALE_TIME: 30 * 1000     // 30 segundos
};

class NotificationManager {
  async getNotifications(userId) {
    // Tenta obter do cache primeiro
    const cachedData = globalCache.getItem(
      `${CACHE_CONFIG.NOTIFICATIONS_KEY}:${userId}`
    );
    
    if (cachedData && !globalCache.isStale(
      `${CACHE_CONFIG.NOTIFICATIONS_KEY}:${userId}`, 
      CACHE_CONFIG.STALE_TIME
    )) {
      return cachedData;
    }
    
    // Se não estiver no cache ou estiver obsoleto, busca da API
    const notifications = await notificationService.fetchNotifications(userId);
    
    // Armazena no cache
    globalCache.setItem(
      `${CACHE_CONFIG.NOTIFICATIONS_KEY}:${userId}`,
      notifications,
      { cacheTime: CACHE_CONFIG.CACHE_TIME }
    );
    
    return notifications;
  }
  
  async markAsRead(userId, notificationId, type) {
    const result = await notificationService.markAsRead(userId, notificationId, type);
    
    // Invalida o cache para forçar uma nova busca na próxima solicitação
    globalCache.invalidate(`${CACHE_CONFIG.NOTIFICATIONS_KEY}:${userId}`);
    
    return result;
  }
  
  async clearAllNotifications(userId) {
    const result = await notificationService.clearAllNotifications(userId);
    
    // Invalida o cache para forçar uma nova busca na próxima solicitação
    globalCache.invalidate(`${CACHE_CONFIG.NOTIFICATIONS_KEY}:${userId}`);
    
    return result;
  }
  
  getUnreadCount(notifications) {
    if (!notifications || !Array.isArray(notifications)) {
      return 0;
    }
    
    return notifications.filter(notification => !notification.lida).length;
  }
}

export const notificationManager = new NotificationManager();