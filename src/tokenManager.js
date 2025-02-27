// src/services/auth/tokenManager.js
import { auth } from './firebaseConfig';
import { api } from './services/apiService';
import { coreLogger } from './core/logging/CoreLogger';

// Armazenamento local de tokens e timestamp para controle de expiração
const tokenStorage = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null
};

export class TokenManager {
  static instance = null;
  
  static getInstance() {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }
  
  constructor() {
    if (TokenManager.instance) {
      return TokenManager.instance;
    }
    
    this.initialized = false;
    this.refreshPromise = null;
    this.TOKEN_EXPIRY_MARGIN = 5 * 60 * 1000; // 5 minutos antes da expiração
    
    // Adicionar garbage collection automático
    this.startGarbageCollectionInterval();
    
    TokenManager.instance = this;
  }
  
  /**
   * Inicializa o TokenManager
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      coreLogger.logEvent('TokenManager', 'INITIALIZATION', 'Initializing token manager');
      
      // Verificar se há tokens armazenados
      const savedTokens = this._loadTokensFromStorage();
      if (savedTokens && this._isTokenValid(savedTokens)) {
        tokenStorage.accessToken = savedTokens.accessToken;
        tokenStorage.refreshToken = savedTokens.refreshToken;
        tokenStorage.expiresAt = savedTokens.expiresAt;
        
        coreLogger.logEvent('TokenManager', 'INITIALIZATION', 'Loaded valid tokens from storage');
      } else {
        // Se não houver tokens válidos, tentar obter novos
        const currentUser = auth.currentUser;
        if (currentUser) {
          await this.exchangeFirebaseToken();
        }
      }
      
      this.initialized = true;
    } catch (error) {
      coreLogger.logServiceError('TokenManager', error, {
        context: 'initialize'
      });
      throw error;
    }
  }
  
  /**
   * Troca o token do Firebase por tokens da aplicação
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async exchangeFirebaseToken() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        coreLogger.logEvent('TokenManager', 'WARNING', 'No user authenticated in Firebase');
        return false;
      }
      
      const firebaseToken = await currentUser.getIdToken();
      if (!firebaseToken) {
        coreLogger.logEvent('TokenManager', 'ERROR', 'Failed to get Firebase token');
        return false;
      }
      
      const response = await api.post('/api/auth/token', { 
        firebaseToken 
      }, { 
        skipAuthHeader: true 
      });
      
      // Extrair tokens da resposta (assumindo que a API retorna os tokens no corpo)
      if (response.data && response.data.accessToken) {
        this._saveTokens(
          response.data.accessToken,
          response.data.refreshToken,
          response.data.expiresIn
        );
        
        coreLogger.logEvent('TokenManager', 'INFO', 'Tokens exchanged successfully');
        return true;
      }
      
      // Se chegou aqui, os tokens estão nos cookies e foram definidos pelo backend
      coreLogger.logEvent('TokenManager', 'INFO', 'Tokens set as cookies by backend');
      return true;
    } catch (error) {
      coreLogger.logServiceError('TokenManager', error, {
        context: 'exchangeFirebaseToken'
      });
      return false;
    }
  }
  
  /**
   * Verifica se o usuário está autenticado
   * @returns {Promise<boolean>} - Estado de autenticação
   */
  async isAuthenticated() {
    try {
      // Se tivermos token válido em memória, estamos autenticados
      if (tokenStorage.accessToken && this._isTokenValid(tokenStorage)) {
        return true;
      }
      
      // Se não temos token ou está expirado, verifica com o servidor
      const response = await api.get('/api/auth/me', { 
        skipAuthCheck: true 
      });
      
      return response.status === 200;
    } catch (error) {
      coreLogger.logEvent('TokenManager', 'DEBUG', 'Authentication check failed', {
        error: error.message
      });
      return false;
    }
  }
  
  /**
   * Obtém o token de acesso para requisições à API
   * @returns {Promise<string|null>} - Token de acesso ou null se não autenticado
   */
  async getAccessToken() {
    // Se não temos token ou está prestes a expirar, atualizamos
    if (!tokenStorage.accessToken || this._isTokenExpiringSoon(tokenStorage)) {
      await this.refreshSession();
    }
    
    return tokenStorage.accessToken;
  }
  
  /**
   * Atualiza a sessão do usuário
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async refreshSession() {
    // Se já existe um processo de refresh em andamento, aguarde-o
    if (this.refreshPromise) {
      return this.refreshPromise;
    }
    
    this.refreshPromise = (async () => {
      try {
        coreLogger.logEvent('TokenManager', 'INFO', 'Refreshing session');
        
        // Se tivermos refresh token, usamos ele
        if (tokenStorage.refreshToken) {
          const response = await api.post('/api/auth/refresh-token', { 
            refreshToken: tokenStorage.refreshToken 
          }, { 
            skipAuthHeader: true 
          });
          
          if (response.data && response.data.accessToken) {
            this._saveTokens(
              response.data.accessToken,
              response.data.refreshToken || tokenStorage.refreshToken,
              response.data.expiresIn
            );
            
            coreLogger.logEvent('TokenManager', 'INFO', 'Session refreshed with refresh token');
            return true;
          }
        }
        
        // Se não temos refresh token ou a atualização falhou, tenta com Firebase
        return await this.exchangeFirebaseToken();
      } catch (error) {
        coreLogger.logServiceError('TokenManager', error, {
          context: 'refreshSession'
        });
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();
    
    return this.refreshPromise;
  }
  
  /**
   * Limpa tokens e sessão
   */
  clearSession() {
    tokenStorage.accessToken = null;
    tokenStorage.refreshToken = null;
    tokenStorage.expiresAt = null;
    
    // Limpar storage local
    localStorage.removeItem('auth_tokens');
    
    // Limpar cookies (isso pode variar dependendo de como os cookies são gerenciados)
    this._clearAuthCookies();
    
    coreLogger.logEvent('TokenManager', 'INFO', 'Session cleared');
  }
  
  startGarbageCollectionInterval() {
    // Iniciar o intervalo para limpeza de tokens
    this.garbageCollectionInterval = setInterval(() => {
      this.performGarbageCollection();
    }, 15 * 60 * 1000); // A cada 15 minutos
    
    // Adicionar também no evento de visibilidade para otimizar
    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.performGarbageCollection();
        }
      });
    }
  }

  performGarbageCollection() {
    coreLogger.logEvent('TokenManager', 'INFO', 'Performing token garbage collection');
    
    try {
      // Verificar tokens em memória
      if (tokenStorage.expiresAt && tokenStorage.expiresAt < Date.now()) {
        coreLogger.logEvent('TokenManager', 'INFO', 'Clearing expired in-memory tokens');
        this.clearSession();
      }
      
      // Verificar tokens no localStorage
      const savedTokens = this._loadTokensFromStorage();
      if (savedTokens && savedTokens.expiresAt && savedTokens.expiresAt < Date.now()) {
        coreLogger.logEvent('TokenManager', 'INFO', 'Clearing expired localStorage tokens');
        localStorage.removeItem('auth_tokens');
      }
    } catch (error) {
      coreLogger.logServiceError('TokenManager', error, {
        context: 'garbageCollection'
      });
    }
  }
  
  // Adicionar esta função ao método dispose ou clearSession
  stopGarbageCollection() {
    if (this.garbageCollectionInterval) {
      clearInterval(this.garbageCollectionInterval);
    }
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('visibilitychange', this.performGarbageCollection);
    }
  }

  /**
   * Adiciona token de autorização ao cabeçalho se necessário
   * @param {Object} config - Configuração da requisição
   * @returns {Promise<Object>} - Configuração atualizada
   */
  async injectAuthHeader(config) {
    // Pular se explicitamente solicitado
    if (config.skipAuthHeader) {
      delete config.skipAuthHeader;
      return config;
    }
    
    // Se já tiver token de autorização, não faz nada
    if (config.headers && config.headers.Authorization) {
      return config;
    }
    
    // Adiciona token de autorização se estiver autenticado
    const accessToken = await this.getAccessToken();
    if (accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`
      };
    }
    
    return config;
  }
  
  // Métodos privados
  
  _saveTokens(accessToken, refreshToken, expiresIn) {
    tokenStorage.accessToken = accessToken;
    tokenStorage.refreshToken = refreshToken;
    tokenStorage.expiresAt = Date.now() + (expiresIn * 1000);
    
    // Salva no localStorage para persistência
    localStorage.setItem('auth_tokens', JSON.stringify({
      accessToken,
      refreshToken,
      expiresAt: tokenStorage.expiresAt
    }));
  }
  
  _loadTokensFromStorage() {
    try {
      const savedTokens = localStorage.getItem('auth_tokens');
      return savedTokens ? JSON.parse(savedTokens) : null;
    } catch (error) {
      coreLogger.logServiceError('TokenManager', error, {
        context: '_loadTokensFromStorage'
      });
      return null;
    }
  }
  
  _isTokenValid(tokenData) {
    return tokenData.accessToken && tokenData.expiresAt && 
           tokenData.expiresAt > Date.now();
  }
  
  _isTokenExpiringSoon(tokenData) {
    return tokenData.expiresAt && 
           (tokenData.expiresAt - Date.now()) < this.TOKEN_EXPIRY_MARGIN;
  }
  
  _clearAuthCookies() {
    // Limpa cookies de autenticação
    document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  }
}

// Exporta instância singleton
export const tokenManager = TokenManager.getInstance();