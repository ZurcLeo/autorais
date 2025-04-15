// src/services/AuthService/AuthTokenService.js
import { BaseService, serviceLocator, serviceEventHub } from '../../core/services/BaseService';
import { coreLogger } from '../../core/logging/CoreLogger.js';
import { LOG_LEVELS } from '../../core/constants/config.js';
import { SERVICE_ACTIONS } from '../../core/constants/actions.js';

const MODULE_NAME = 'authToken';

const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  TOKEN_EXPIRY: 'auth_token_expiry'
};

class AuthTokenService extends BaseService {
  constructor() {
    super(MODULE_NAME);

    this.instanceId = Math.random().toString(36).substring(2, 10);

    this._accessToken = null;
    this._refreshToken = null;
    this._tokenExpiry = null;

    this._metadata = {
      name: MODULE_NAME,
      phase: 'CORE',              // Fase de inicialização (CORE, ESSENTIAL, etc.)
      criticalPath: true,         // Indica se é um serviço crítico para a aplicação
      dependencies: ['store'], // Serviços que devem estar prontos antes deste
      category: 'initialization',       // Categoria do serviço
      description: 'Gerencia tokens de acesso a aplicacao' // Descrição
    };

    this._log(`📊 Nova instância de ${MODULE_NAME} criada, instanceId: ${this.instanceId}`);
  }

  async initialize() {
    if (this.isInitialized) return this;

    this._log(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'AuthTokenService initializing...', { timestamp: Date.now() });
    try {
      // Prioridade: primeiro cookies, depois localStorage
      this._checkCookieTokens();
      if (!this._accessToken) {
        this._loadTokensFromStorage();
      }

      this._log(MODULE_NAME, LOG_LEVELS.INITIALIZATION, 'AuthTokenService initialized', { timestamp: Date.now() });

      this._isInitialized = true;

      this._emitEvent(SERVICE_ACTIONS.SERVICE_READY, {
        serviceName: MODULE_NAME,
        timestamp: new Date().toISOString()
      });
      return this;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'AuthTokenService failed', { timestamp: Date.now() }, { error });

      // Mesmo com erro no healthCheck, consideramos o serviço inicializado
      // para não bloquear funcionalidades que não dependem do backend
      return true;
    }
  }

  async healthCheck() {
    // Verificar se o serviço está saudável
    return true;
  }

  async shutdown() {
    // Limpar recursos ao encerrar o serviço
    this.clearTokens();
    this._log(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'AuthTokenService shutdown');
  }

  // Manipuladores de evento
  _handleUserSignedIn(data) {
    
    if (data.tokens) {
      this.setTokens(
        data.tokens.accessToken,
        data.tokens.refreshToken,
        data.tokens.expiresIn || 3600
      );
      this._log(MODULE_NAME, LOG_LEVELS.STATE, 'Tokens updated from sign-in');
    }
  }

  _handleUserSignedOut() {
    this.clearTokens();
    this._log(MODULE_NAME, LOG_LEVELS.STATE, 'Tokens cleared on sign-out');
  }

  // Carregar tokens do armazenamento local
  _loadTokensFromStorage() {
    try {
      this._accessToken = localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
      this._refreshToken = localStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
      const expiry = localStorage.getItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY);
      
      if (expiry) {
        this._tokenExpiry = parseInt(expiry, 10);
      }
      
      if (this._accessToken) {
        this._log(MODULE_NAME, LOG_LEVELS.STATE, 'Tokens loaded from storage');
      }
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to load tokens from storage', { error });
    }
  }

  // Salvar tokens após autenticação
  setTokens(accessToken, refreshToken, expiresIn) {
    if (!accessToken) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Attempted to set null access token');
      return false;
    }
    
    try {
      this._accessToken = accessToken;
      this._refreshToken = refreshToken;
      this._tokenExpiry = Date.now() + (expiresIn * 1000);
      
      // Salvar em localStorage para persistência
      localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      
      if (refreshToken) {
        localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
      
      localStorage.setItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY, this._tokenExpiry.toString());
      
      this._log(MODULE_NAME, LOG_LEVELS.STATE, 'Tokens updated and stored', {
        hasRefreshToken: !!refreshToken,
        expiresIn
      });
      
      // Emitir evento de tokens atualizados
      this._emitEvent(this.serviceName, 'TOKENS_UPDATED', {
        hasAccessToken: true,
        hasRefreshToken: !!refreshToken,
        expiresIn
      });

      return true;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to set tokens', { error });
      return false;
    }
  }

  // Verificar se temos um token válido
  async isTokenValid() {
    try {
      // Se não temos token, não é válido
      if (!this._accessToken) {
        return false;
      }
      
      const now = Date.now();
      
      // Se temos expiry e ainda não expirou, é válido
      if (this._tokenExpiry && now < this._tokenExpiry) {
        return true;
      }
      
      // Se expirou mas temos refresh token, tenta renovar
      if (this._refreshToken) {
        const refreshed = await this.refreshToken();
        return refreshed;
      }

      // Não conseguimos validar ou renovar
      return false;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Token validation failed', { error });
      return false;
    }
  }

  // Verificar se temos um token, mesmo que possa estar expirado
  isTokenAvailable() {
    return !!this._accessToken;
  }

  // Obter o access token
  async getAccessToken() {
    // First attempt: check memory
    if (this._accessToken) {
      // Check if expired
      if (this._tokenExpiry && Date.now() < this._tokenExpiry) {
        return this._accessToken;
      }
    }
    
    // Second attempt: check cookies (pode ter sido atualizado desde a inicialização)
    this._checkCookieTokens();
    if (this._accessToken) {
      // We don't know expiry from cookies, assume valid for now
      return this._accessToken;
    }
    
    // Third attempt: load from storage
    if (!this._accessToken) {
      this._loadTokensFromStorage();
      
      if (this._accessToken && this._tokenExpiry && Date.now() < this._tokenExpiry) {
        return this._accessToken;
      }
    }
    
    // Fourth attempt: try to refresh
    if (this._refreshToken) {
      const success = await this.refreshToken();
      if (success) {
        return this._accessToken;
      }
    }
    
    // No valid token available
    this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'No valid access token available');
    return null;
  }

  // Obter o refresh token
  getRefreshToken() {
    if (!this._refreshToken) {
      // Se não tiver token em memória, tenta carregar do storage
      this._refreshToken = localStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
      
      // Verificar também nos cookies
      if (!this._refreshToken) {
        this._checkCookieTokens();
      }
    }
    
    return this._refreshToken;
  }

  // Tentar renovar o token com o backend
  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Refresh token not available');
      return false;
    }
    
    try {
      this.apiService = serviceLocator.get('apiService');

      this._log(MODULE_NAME, LOG_LEVELS.STATE, 'Token refresh initiated');
      
      const response = await this.apiService.post('/api/auth/refresh', { 
        refreshToken 
      }, { withCredentials: true }); 
      
      if (response.data && response.data.accessToken) {
        this.setTokens(
          response.data.accessToken,
          response.data.refreshToken || refreshToken,
          response.data.expiresIn || 3600
        );
        
        this._log(MODULE_NAME, LOG_LEVELS.STATE, 'Token refreshed successfully');
        
        // Emitir evento de token renovado
        this._emitEvent(this.serviceName, 'TOKEN_REFRESHED', {
          success: true
        });
        return true;
      }
      
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Token refresh failed - invalid response');
      
      // Emitir evento de falha na renovação
      this._emitEvent(this.serviceName, 'TOKEN_REFRESH_FAILED', {
        reason: 'invalid_response'
      });
      return false;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Token refresh failed', { 
        error: error.message,
        status: error.response?.status
      });
      
      // Emitir evento de falha na renovação
      this._emitEvent(this.serviceName, 'TOKEN_REFRESH_FAILED', {
        reason: 'api_error',
        status: error.response?.status,
        message: error.message
      });
      
      return false;
    }
  }

  // Para uso quando a autenticação falhar completamente
  setTemporaryToken(token) {
    this._accessToken = token;
    this._tokenExpiry = Date.now() + (60 * 1000); // 1 minuto apenas
    this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Setting temporary token');
    return true;
  }

  // Limpar tokens ao fazer logout
  clearTokens() {
    try {
      this._accessToken = null;
      this._refreshToken = null;
      this._tokenExpiry = null;
      
      localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY);
      
      // Limpar também os cookies relacionados a autenticação
      this._clearAuthCookies();
      
      this._log(MODULE_NAME, LOG_LEVELS.STATE, 'Tokens cleared');
      this._emitEvent(this.serviceName, 'TOKENS_CLEARED');
      return true;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to clear tokens', { error });
      return false;
    }
  }

  _clearAuthCookies() {
    const cookiesToClear = ['authorization', 'refreshToken', 'accessToken'];
    const domains = [window.location.hostname, '.' + window.location.hostname, 'localhost', '.localhost'];
    const paths = ['/', '/api', ''];
    
    domains.forEach(domain => {
      paths.forEach(path => {
        cookiesToClear.forEach(name => {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain};`;
        });
      });
    });
    
    this._log(MODULE_NAME, LOG_LEVELS.STATE, 'Auth cookies cleared');
  }

  _checkCookieTokens() {
    try {
      // Extrair o cookie de autorização diretamente usando regex para evitar problemas de parsing
      const authCookieMatch = document.cookie.match(/authorization=([^;]+)/);
      if (authCookieMatch) {
        // Decodificar o valor do cookie (URL-encoded)
        let authHeader = decodeURIComponent(authCookieMatch[1]);
        
        // Verificar se contém "Bearer "
        if (authHeader.startsWith('Bearer ')) {
          const tokenFromCookie = authHeader.substring(7);
          
          // Se não temos token em memória, use o do cookie
          if (!this._accessToken) {
            this._accessToken = tokenFromCookie;
            this._log(MODULE_NAME, LOG_LEVELS.STATE, 'Access token loaded from cookie');
          }
        }
      }
      
      // Similar para refresh token
      const refreshCookieMatch = document.cookie.match(/refreshToken=([^;]+)/);
      if (refreshCookieMatch) {
        const refreshTokenFromCookie = decodeURIComponent(refreshCookieMatch[1]);
        
        if (!this._refreshToken) {
          this._refreshToken = refreshTokenFromCookie;
          this._log(MODULE_NAME, LOG_LEVELS.STATE, 'Refresh token loaded from cookie');
        }
      }
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to check cookie tokens', { error });
    }
  }
}

export { AuthTokenService };