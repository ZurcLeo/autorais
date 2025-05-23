import { BaseService, serviceLocator } from '../../core/services/BaseService';
import {NOTIFICATION_EVENTS} from '../../core/constants/events.js';
import { LOG_LEVELS } from '../../core/constants/config.js';
import { SERVICE_ACTIONS } from '../../core/constants/actions.js';
import socket from '../socketService.js';

const MODULE_NAME = 'notifications';

/**
 * Serviço para gerenciar notificações de usuários
 */
class NotificationService extends BaseService {
  constructor() {
    super(MODULE_NAME);

    this.instanceId = Math.random().toString(36).substring(2, 10);

    this._currentUser = null;
    this._notificationsCache = new Map();
    this._isInitialized = false;
    this._setupSocketHandlers();

    this._metadata = {
      name: MODULE_NAME,
      phase: 'COMMUNICATION',              // Fase de inicialização (CORE, ESSENTIAL, etc.)
      criticalPath: true,         // Indica se é um serviço crítico para a aplicação
      dependencies: ['auth', 'users'], // Serviços que devem estar prontos antes deste
      category: 'communications',       // Categoria do serviço
      description: 'Gerencia Notificacoes.' // Descrição
    };

    this._log(`📊 Nova instância de NotificationService criada, instanceId: ${this.instanceId}`);
    this.apiService = serviceLocator.get('apiService');
    this.authService = serviceLocator.get('auth');
    this.usersService = serviceLocator.get('users');
  }

  /**
   * Inicializa o serviço
   * @returns {Promise<boolean>} true se inicializado com sucesso
   */
  async initialize() {
    if (this.isInitialized) return this;

    this._log(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'NotificationService initializing...', { timestamp: Date.now() });

    try {
      // Adicione aqui a lógica de inicialização específica do NotificationService, se necessário.
      // Por exemplo, conectar a um websocket, carregar configurações iniciais, etc.

      this._log(MODULE_NAME, LOG_LEVELS.INITIALIZATION, 'NotificationService initialized', { timestamp: Date.now() });

   

      this._isInitialized = true;

   
      this._emitEvent(SERVICE_ACTIONS.SERVICE_READY, {
        serviceName: MODULE_NAME,
        timestamp: new Date().toISOString()
      });
      return this;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'NotificationService initialization failed', { timestamp: Date.now() }, { error });

      // Mesmo com erro no healthCheck, consideramos o serviço inicializado
      // para não bloquear funcionalidades que não dependem do backend
      return true;
    }
  }

  getCurrentUser() {
    return this._currentUser = this.authService.getCurrentUser();
}

  /**
   * Verifica a saúde do serviço
   * @returns {Promise<Object>} Estado de saúde do serviço
   */
  async healthCheck() {
    try {
      // this._startLoading()
      // Tentar verificar a saúde via API
      const healthResponse = await this._executeWithRetry(
        async () => {
          return await this.apiService.get(`/api/health/service/${this.serviceName}`);
        },
        'healthCheck'
      );
      // this._stopLoading()
      console.log('checando resposta', healthResponse.data.status)

      return { status: healthResponse.data.status, timestamp: Date.now() };
    } catch (error) {
      // this._stopLoading()
      // Implementar fallback se o endpoint de saúde estiver indisponível
      this._log('warning', 'Health check endpoint unavailable, proceeding with degraded mode');
      
      // Ainda retornar healthy para não bloquear outras funcionalidades
      return { 
        status: 'degraded', 
        details: 'Operating in offline mode',
        timestamp: Date.now() 
      };
    }
  }

  /**
   * Desliga o serviço e libera recursos
   * @returns {Promise<boolean>} true se desligado com sucesso
   */
  async shutdown() {
    this._log('shutting down', { timestamp: Date.now() });
    return true;
  }

  /**
   * Busca notificações de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Array>} Lista de notificações do usuário
   */
  async fetchNotifications() {
    this._currentUser = this.authService.getCurrentUser();
    if (!this._currentUser) {
      throw new Error('Usuário não autenticado');
    }

    const userId = this._currentUser.uid;

    return this._executeWithRetry(async () => {
      // this._startLoading();
      const startTime = performance.now();
      
      if (!userId) {
        const error = new Error('userId é obrigatório para buscar notificações');
        this._logError(error, 'fetchNotifications');
        throw error;
      }
      
      try {
        this._log('fetching notifications', { userId });
        
        const response = await this.apiService.get(`/api/notifications/${userId}`);
        const notifications = response.data;
        
        const duration = performance.now() - startTime;
        this._log('fetchNotifications', duration, {
          userId,
          count: notifications?.length || 0
        });
        
        // Emitir evento de notificações obtidas
        this._emitEvent(NOTIFICATION_EVENTS.NOTIFICATIONS_FETCHED, {
          userId,
          notifications,
          count: notifications?.length || 0,
          timestamp: Date.now()
        });
        // this._stopLoading()

        return notifications;
      } catch (error) {
        // this._stopLoading()

        const duration = performance.now() - startTime;
        this._logError(error, 'fetchNotifications', duration);
        throw error;
      }
    }, 'fetchNotifications');
  }

  /**
   * Cria uma nova notificação para um usuário
   * @param {string} userId - ID do usuário destinatário
   * @param {Object} notificationData - Dados da notificação
   * @returns {Promise<Object>} Notificação criada
   */
  async createNotification(notificationData) {
    this._currentUser = this.authService.getCurrentUser();
    if (!this._currentUser) {
      throw new Error('Usuário não autenticado');
    }

    const userId = this._currentUser.uid;

    // this._startLoading();

    return this._executeWithRetry(async () => {
      const startTime = performance.now();
      
      if (!userId || !notificationData) {
        const error = new Error('userId e notificationData são obrigatórios');
        this._logError(error, 'createNotification');
        throw error;
      }
      
      try {
        this._log('creating notification', { 
          userId, 
          type: notificationData.type,
          referenceId: notificationData.referenceId
        });
        
        const response = await this.apiService.post(`/api/notifications/${userId}`, notificationData);
        const notification = response.data;
        
        const duration = performance.now() - startTime;
        this._logPerformance('createNotification', duration, {
          userId,
          notificationType: notificationData.type
        });
        
        // Emitir evento de notificação criada
        this._emitEvent(NOTIFICATION_EVENTS.NOTIFICATION_CREATED, {
          userId,
          notification,
          timestamp: Date.now()
        });
        // this._stopLoading()

        return notification;
      } catch (error) {
        // this._stopLoading()

        const duration = performance.now() - startTime;
        this._logError(error, 'createNotification', duration);
        throw error;
      }
    }, 'createNotification');
  }

  /**
   * Marca uma notificação como lida
   * @param {string} userId - ID do usuário
   * @param {string} notificationId - ID da notificação
   * @param {string} type - Tipo da notificação
   * @returns {Promise<Object>} Resultado da operação
   */
  async markAsRead(notificationId) {
    this._currentUser = this.authService.getCurrentUser();
    if (!this._currentUser) {
      throw new Error('Usuário não autenticado');
    }

    const userId = this._currentUser.uid;
    // this._startLoading();
    return this._executeWithRetry(async () => {
      const startTime = performance.now();
      
      if (!userId || !notificationId) {
        const error = new Error('userId e notificationId são obrigatórios');
        this._logError(error, 'markAsRead');
        throw error;
      }
      
      try {
        this._log('marking notification as read', { 
          userId, 
          notificationId 
        });
        
        const response = await this.apiService.post(`/api/notifications/${userId}/markAsRead/${notificationId}`, {
          notificationId
        });
        
        const result = response.data;
        
        const duration = performance.now() - startTime;
        this._logPerformance('markAsRead', duration, {
          userId,
          notificationId
          });
        
        // Emitir evento de notificação marcada como lida
        this._emitEvent(NOTIFICATION_EVENTS.NOTIFICATION_MARKED_READ, {
          userId,
          notificationId,
          result,
          timestamp: Date.now()
        });
        // this._stopLoading()

        return result;
      } catch (error) {
        // this._stopLoading()

        const duration = performance.now() - startTime;
        this._logError(error, 'markAsRead', duration);
        throw error;
      }
    }, 'markAsRead');
  }

  /**
   * Limpa todas as notificações de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Resultado da operação
   */
  async clearAllNotifications(userId) {
    // this._startLoading();
    return this._executeWithRetry(async () => {
      const startTime = performance.now();
      
      if (!userId) {
        const error = new Error('userId é obrigatório para limpar notificações');
        this._logError(error, 'clearAllNotifications');
        throw error;
      }
      
      try {
        this._log('clearing all notifications', { userId });
        
        const response = await this.apiService.post(`/api/notifications/${userId}/clearAll`);
        const result = response.data;
        
        const duration = performance.now() - startTime;
        this._logPerformance('clearAllNotifications', duration, { userId });
        
        // Emitir evento de todas as notificações limpas
        this._emitEvent(NOTIFICATION_EVENTS.ALL_NOTIFICATIONS_CLEARED, {
          userId,
          result,
          timestamp: Date.now()
        });
        // this._stopLoading()

        return result;
      } catch (error) {
        // this._stopLoading()

        const duration = performance.now() - startTime;
        this._logError(error, 'clearAllNotifications', duration);
        throw error;
      }
    }, 'clearAllNotifications');
  }
  
  /**
   * Busca notificações não lidas de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Array>} Lista de notificações não lidas
   */
  async fetchUnreadNotifications(userId) {
    // this._startLoading();
    return this._executeWithRetry(async () => {
      const startTime = performance.now();
      
      if (!userId) {
        const error = new Error('userId é obrigatório para buscar notificações não lidas');
        this._logError(error, 'fetchUnreadNotifications');
        throw error;
      }
      
      try {
        this._log('fetching unread notifications', { userId });
        
        const response = await this.apiService.get(`/api/notifications/${userId}/unread`);
        const notifications = response.data;
        
        const duration = performance.now() - startTime;
        this._log('fetchUnreadNotifications', duration, {
          userId,
          count: notifications?.length || 0
        });
        
        // Emitir evento de notificações não lidas obtidas
        this._emitEvent(NOTIFICATION_EVENTS.NOTIFICATIONS_FETCHED, {
          userId,
          notifications,
          count: notifications?.length || 0,
          unreadOnly: true,
          timestamp: Date.now()
        });
        // this._stopLoading()
        return notifications;
      } catch (error) {
        // this._stopLoading()
        const duration = performance.now() - startTime;
        this._logError(error, 'fetchUnreadNotifications', duration);
        throw error;
      }
    }, 'fetchUnreadNotifications');
  }


  _setupSocketHandlers() {
    // Registrar ouvintes para eventos de socket relacionados a notificações
    socket.on(NOTIFICATION_EVENTS.NEW_NOTIFICATION, (notificationData) => {
      this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Nova notificação recebida via socket', { 
        notificationId: notificationData.id,
        type: notificationData.type
      });
      
      // Adicionar à cache e emitir evento para o sistema
      if (this._notificationsCache.has(this._currentUser?.uid)) {
        const userNotifications = this._notificationsCache.get(this._currentUser.uid) || [];
        userNotifications.unshift(notificationData);
        this._notificationsCache.set(this._currentUser.uid, userNotifications);
      }
      
      this._emitEvent(NOTIFICATION_EVENTS.NOTIFICATION_CREATED, {
        userId: this._currentUser?.uid,
        notification: notificationData,
        timestamp: Date.now()
      });
    });
    
    socket.on(NOTIFICATION_EVENTS.NOTIFICATION_READ, (readData) => {
      this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Notificação marcada como lida via socket', { 
        notificationId: readData.notificationId
      });
      
      // Atualizar cache se necessário
      if (this._notificationsCache.has(this._currentUser?.uid)) {
        const userNotifications = this._notificationsCache.get(this._currentUser.uid) || [];
        const updatedNotifications = userNotifications.map(notif => 
          notif.id === readData.notificationId ? { ...notif, lida: true } : notif
        );
        this._notificationsCache.set(this._currentUser.uid, updatedNotifications);
      }
      
      this._emitEvent(NOTIFICATION_EVENTS.NOTIFICATION_MARKED_READ, {
        userId: this._currentUser?.uid,
        notificationId: readData.notificationId,
        timestamp: Date.now()
      });
    });
    
    socket.on(NOTIFICATION_EVENTS.CLEAR_NOTIFICATIONS, () => {
      this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Todas notificações limpas via socket');
      
      // Limpar cache
      if (this._currentUser?.uid) {
        this._notificationsCache.set(this._currentUser.uid, []);
      }
      
      this._emitEvent(NOTIFICATION_EVENTS.ALL_NOTIFICATIONS_CLEARED, {
        userId: this._currentUser?.uid,
        timestamp: Date.now()
      });
    });
  }
  
}



export { NotificationService };