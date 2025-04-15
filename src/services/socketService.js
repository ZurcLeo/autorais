// src/services/socketService.js
import { io } from 'socket.io-client';
import { BaseService, serviceLocator, serviceEventHub } from '../core/services/BaseService';
import { SERVICE_ACTIONS } from '../core/constants/actions';
import { LOG_LEVELS } from '../core/logging';

const MODULE_NAME = 'socketService';

class SocketService extends BaseService {
  constructor() {
    super(MODULE_NAME);
    
    this.instanceId = Math.random().toString(36).substring(2, 10);
    this.socket = null;
    this.isConnecting = false;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventHandlers = new Map();
    
    this._metadata = {
      name: MODULE_NAME,
      phase: 'COMMUNICATION',              // Fase de inicialização (CORE, ESSENTIAL, etc.)
      criticalPath: false,         // Indica se é um serviço crítico para a aplicação
      dependencies: ['authToken'], // Serviços que devem estar prontos antes deste
      category: 'communications',       // Categoria do serviço
      description: 'Gerencia Servico de Socket.' // Descrição
    };

    // Definir URL baseada no ambiente
    this.SOCKET_URL = process.env.NODE_ENV === 'production' 
      ? 'https://backend-elos.onrender.com'
      : 'https://localhost:9000';
    
    // Configuração inicial sem token (será adicionado antes da conexão)
    this.socketConfig = {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      secure: process.env.NODE_ENV === 'production',
      rejectUnauthorized: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      autoConnect: false // Importante: não conectar automaticamente até termos o token
    };
    
    this._log('info', { message: `📊 Nova instância de ${MODULE_NAME} criada, instanceId: ${this.instanceId}` });
    // this.authTokenService = serviceLocator.get('authToken');
  }

  /**
   * Inicializa o serviço de socket
   * Este método é chamado pelo framework de inicialização de serviços
   */
  async initialize() {
    if (this._isInitialized) {
      this._log('info', { message: 'SocketService já inicializado', instanceId: this.instanceId });
      return this;
    }

    this._log(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'socketService initializing...', { timestamp: Date.now() });

    try {
      // Criar a instância do socket mas não conectar ainda
      this.socket = io(this.SOCKET_URL, this.socketConfig);
      
      // Configurar manipuladores de eventos básicos
      this._setupBaseEventListeners();
      
      // Registrar listener para mudanças no token de autenticação
      this._setupTokenListeners();
      
      // Inicializar socket com token atual
      const success = await this._initializeSocket();
      
      if (!success) {
        throw new Error('Falha ao inicializar socket com token de autenticação');
      }
      
      this._isInitialized = true;
      this._log(MODULE_NAME, LOG_LEVELS.INITIALIZATION, 'socketService initialized successfully', { timestamp: Date.now() });
      
      return this;
    } catch (error) {
      this._logError(error, 'initialize');
      throw error;
    }
  }

  /**
   * Verificação de saúde do serviço
   * Implementação obrigatória para BaseService
   */
  async healthCheck() {
    return {
      status: this.socket && this.socket.connected ? 'healthy' : 'degraded',
      connected: this.socket ? this.socket.connected : false,
      connectionId: this.socket ? this.socket.id : null,
      reconnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Desliga o serviço
   * Implementação obrigatória para BaseService
   */
  async shutdown() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this._isInitialized = false;
      this._log(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'socketService finished.', { timestamp: Date.now() });
  }

  /**
   * Obtém o token de autenticação do serviço de tokens
   * @private
   */
  async _getAuthToken() {
    try {
      if (!serviceLocator.registry.has('authToken')) {
        this._log('warning', { 
          message: 'AuthTokenService não disponível', 
          action: '_getAuthToken' 
        });
        return null;
      }
      
      const authTokenService = serviceLocator.get('authToken');
      return await authTokenService.getAccessToken();
    } catch (error) {
      this._logError(error, '_getAuthToken');
      return null;
    }
  }

  /**
   * Inicializa o socket com autenticação
   * @private
   */
  async _initializeSocket() {
    if (this.isConnecting) return false;
    this.isConnecting = true;

    try {
      const token = await this._getAuthToken();
      
      if (!token) {
        this._log('warning', { 
          message: 'Tentativa de inicializar socket sem token de autenticação', 
          action: '_initializeSocket' 
        });
        this.isConnecting = false;
        return false;
      }
      
      // Configurar autenticação
      this.socket.auth = { token };
      
      // Conectar se ainda não estiver conectado
      if (!this.socket.connected) {
        this.socket.connect();
        this._log('info', { 
          message: 'Iniciando conexão do socket com autenticação', 
          action: '_initializeSocket' 
        });
      }
      
      this.isConnecting = false;
      return true;
    } catch (error) {
      this.isConnecting = false;
      this._logError(error, '_initializeSocket');
      return false;
    }
  }

  /**
   * Configura manipuladores de eventos básicos do socket
   * @private
   */
  _setupBaseEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      this._log('info', { 
        message: 'Conectado ao servidor de socket', 
        action: 'connect', 
        socketId: this.socket.id 
      });
      
      this._emitEvent('SOCKET_CONNECTED', {
        socketId: this.socket.id,
        timestamp: Date.now()
      });
    });

    this.socket.on('connect_error', (error) => {
      this.connected = false;
      this._logError(error, 'connect_error');
      
      this._emitEvent('SOCKET_CONNECTION_ERROR', {
        error: error.message,
        timestamp: Date.now()
      });
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      this._log('info', { 
        message: 'Desconectado do servidor de socket', 
        action: 'disconnect', 
        reason 
      });
      
      this._emitEvent('SOCKET_DISCONNECTED', {
        reason,
        timestamp: Date.now()
      });
    });

    this.socket.on('error', (error) => {
      this._logError(error, 'socket_error');
      
      this._emitEvent('SOCKET_ERROR', {
        error: error.message,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Configura listeners para eventos do serviço de token
   * @private
   */
  _setupTokenListeners() {
    try {
      if (!serviceLocator.registry.has('authToken')) {
        this._log('warning', { 
          message: 'AuthTokenService não encontrado, escutas de token não configuradas', 
          action: '_setupTokenListeners' 
        });
        return;
      }
      
      const authTokenService = serviceLocator.get('authToken');
      
      // Escutar eventos de atualização de token
      this._onServiceEvent('authToken', 'TOKENS_UPDATED', () => {
        this._log('info', { 
          message: 'Token atualizado, atualizando socket', 
          action: 'tokenListener'
        });
        this._updateSocketAuth();
      });
      
      this._onServiceEvent('authToken', 'TOKEN_REFRESHED', () => {
        this._log('info', { 
          message: 'Token atualizado, atualizando socket', 
          action: 'tokenListener'
        });
        this._updateSocketAuth();
      });
      
      this._onServiceEvent('authToken', 'TOKENS_CLEARED', () => {
        this._log('info', { 
          message: 'Tokens removidos, desconectando socket', 
          action: 'tokenListener'
        });
        if (this.socket) {
          this.socket.disconnect();
        }
      });
      
      this._log('info', { 
        message: 'Escutas de token configuradas com sucesso', 
        action: '_setupTokenListeners' 
      });
    } catch (error) {
      this._logError(error, '_setupTokenListeners');
    }
  }

  /**
   * Atualiza o token de autenticação do socket
   * @private
   */
  async _updateSocketAuth() {
    if (!this.socket) return false;
    
    try {
      const token = await this._getAuthToken();
      
      if (!token) {
        this._log('warning', { 
          message: 'Não foi possível atualizar token do socket - token não disponível', 
          action: '_updateSocketAuth' 
        });
        return false;
      }
      
      // Atualizar auth e reconectar para aplicar novo token
      this.socket.auth = { token };
      
      if (this.socket.connected) {
        this.socket.disconnect().connect();
        this._log('info', { 
          message: 'Socket reconectado com novo token', 
          action: '_updateSocketAuth' 
        });
      } else {
        this.socket.connect();
        this._log('info', { 
          message: 'Socket conectado com novo token', 
          action: '_updateSocketAuth' 
        });
      }
      
      return true;
    } catch (error) {
      this._logError(error, '_updateSocketAuth');
      return false;
    }
  }

  /**
   * Emite um evento para o servidor
   * @param {string} eventName - Nome do evento
   * @param {Object} data - Dados do evento
   * @returns {boolean} - Sucesso da emissão
   */
  emit(eventName, data) {
    if (!this.socket || !this.socket.connected) {
      this._log('warning', { 
        message: 'Tentativa de emitir evento sem socket conectado', 
        action: 'emit', 
        eventName 
      });
      return false;
    }
    
    try {
      this.socket.emit(eventName, data);
      this._log('debug', { 
        message: 'Evento emitido', 
        action: 'emit', 
        eventName 
      });
      return true;
    } catch (error) {
      this._logError(error, 'emit');
      return false;
    }
  }

  /**
   * Registra um handler para um evento do servidor
   * @param {string} eventName - Nome do evento
   * @param {Function} handler - Função handler
   */
  on(eventName, handler) {
    if (!this.socket) {
      this._log('warning', { 
        message: 'Tentativa de registrar handler sem socket inicializado', 
        action: 'on', 
        eventName 
      });
      return;
    }
    
    // Armazenar o handler para possível reuso
    this.eventHandlers.set(eventName, handler);
    
    // Registrar o handler no socket
    this.socket.on(eventName, (data) => {
      try {
        handler(data);
      } catch (error) {
        this._logError(error, `handler:${eventName}`);
      }
    });
    
    this._log('debug', { 
      message: 'Handler registrado', 
      action: 'on', 
      eventName 
    });
  }

  /**
   * Remove um handler de um evento do servidor
   * @param {string} eventName - Nome do evento
   */
  off(eventName) {
    if (!this.socket) {
      return;
    }
    
    this.socket.off(eventName);
    this.eventHandlers.delete(eventName);
    
    this._log('debug', { 
      message: 'Handler removido', 
      action: 'off', 
      eventName 
    });
  }

  /**
   * Retorna o estado atual da conexão
   * @returns {Object} - Estado da conexão
   */
  getConnectionState() {
    return {
      connected: this.connected,
      socketId: this.socket ? this.socket.id : null,
      url: this.SOCKET_URL,
      reconnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Criar instância singleton do serviço
const socketService = new SocketService();

export default socketService;