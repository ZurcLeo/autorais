// src/services/apiService.js
import axios from 'axios';
import Bottleneck from 'bottleneck';
import {BaseService, serviceEventHub, serviceLocator} from '../core/services/BaseService';
import {AUTH_EVENTS} from '../core/constants/events';
import {LOG_LEVELS} from '../core/constants/config';
import { auth } from '../firebaseConfig';
import { SERVICE_ACTIONS } from '../core/constants/actions';

const MODULE_NAME = 'apiService';
const API_URL = process.env.REACT_APP_BACKEND_URL;

// Rate limiters configuration
const rateLimiters = {
  default: new Bottleneck({
    maxConcurrent: 10,
    minTime: 100,
    reservoir: 50,
    reservoirRefreshAmount: 50,
    reservoirRefreshInterval: 60 * 1000
  }),
  user: new Bottleneck({
    maxConcurrent: 3,
    minTime: 500,
    reservoir: 20,
    reservoirRefreshAmount: 20,
    reservoirRefreshInterval: 60 * 1000
  }),
  auth: new Bottleneck({
    maxConcurrent: 1,
    minTime: 1000,
    reservoir: 5,
    reservoirRefreshAmount: 5,
    reservoirRefreshInterval: 60 * 1000
  })
};

class ApiService extends BaseService {
  constructor() {
    super(MODULE_NAME);

    this.instanceId = Math.random().toString(36).substring(2, 10);

    this.api = null;
    this.apiUpload = null;
    this._isInitialized = false;

    // this._metadata = {
    //   name: MODULE_NAME,
    // //   phase: 'CORE',
    // //   criticalPath: true,
    // //   dependencies: ['authToken'],
    //   instanceId: this.instanceId,
    // };

    this._log(MODULE_NAME, LOG_LEVELS.STATE, {
        metadata: {
            ...this._metadata,
            instanceId: this.instanceId,
            message: `📊 Nova instância de ApiService criada, instanceId: ${this.instanceId}`
        },
    });
  }

  async initialize() {
    if (this.isInitialized) return this;

    this._log(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'ApiService initializing...', { timestamp: Date.now() });

    try {
      this.api = axios.create({ baseURL: API_URL, withCredentials: true });

      this.apiUpload = axios.create({
        baseURL: API_URL,
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      this._setupInterceptors();
      this._isInitialized = true;

      this._log(MODULE_NAME, LOG_LEVELS.INITIALIZATION, 'ApiService initialized successfully', { timestamp: Date.now() });

    //   // Emite evento de serviço pronto
    //   this._emitEvent('initialization', SERVICE_ACTIONS.SERVICE_READY, {
    //     serviceName: MODULE_NAME,
    //     timestamp: new Date().toISOString()
    //   });

    //   // Log de sucesso com coreLogger
    //   this._log(
    //     MODULE_NAME,
    //     LOG_LEVELS.INITIALIZATION,
    //     'ApiService initialized successfully'
    //   );
    this._emitEvent(SERVICE_ACTIONS.SERVICE_READY, {
        serviceName: MODULE_NAME,
        timestamp: new Date().toISOString()
      });

      return this;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'ApiService initialization failed', { timestamp: Date.now(), error: error.message });

      // Emite evento de serviço falhou
    //   this._emitEvent('initialization', SERVICE_ACTIONS.SERVICE_ERROR, {
    //     serviceName: MODULE_NAME,
    //     error: error.message, // ou error.toString()
    //     timestamp: new Date().toISOString()
    //   });

    //   // Log de falha com coreLogger
    //   this._log(
    //     MODULE_NAME,
    //     error,
    //     {
    //       message: 'ApiService initialization failed',
    //       timestamp: new Date().toISOString()
    //     }
    //   );

      throw error;
    }
  }

    async get(url, config = {}) {
        // if (!this.initialized) {
        //     await this.initialize();
        // }
        return this.api.get(url, config);
    }

    async post(url, data = {}, config = {}) {
        // if (!this.initialized) {
        //     await this.initialize();
        // }
        return this.api.post(url, data, config);
    }

    async put(url, data = {}, config = {}) {
        // if (!this.initialized) {
        //     await this.initialize();
        // }
        return this.api.put(url, data, config);
    }

    async delete(url, config = {}) {
        // if (!this.initialized) {
        //     await this.initialize();
        // }
        return this.api.delete(url, config);
    }

    async upload(url, formData, config = {}) {
        // if (!this.initialized) {
        //     await this.initialize();
        // }
        // Configuração específica para uploads
        const uploadConfig = {
            ...config,
            headers: {
                ...config.headers,
                'Content-Type': 'multipart/form-data'
            }
        };
        return this
            .apiUpload
            .post(url, formData, uploadConfig);
    }

    async collectBrowserFingerprint() {
      try {
        // Valores básicos para fingerprinting
        const fingerprint = {
          version: navigator.version,
          cipherSuites: [],
          extensions: [],
          ellipticCurves: [],
          ellipticCurvePointFormats: []
        };
    
        // Coletar informações de user-agent
        fingerprint.userAgent = navigator.userAgent;
        
        // Coletar informações de resolução
        fingerprint.screenWidth = window.screen.width;
        fingerprint.screenHeight = window.screen.height;
        fingerprint.colorDepth = window.screen.colorDepth;
        
        // Coletar informações de plugins
        fingerprint.plugins = Array.from(navigator.plugins || [])
          .map(p => p.name)
          .slice(0, 10);
        
        // Coletar informações de linguagem
        fingerprint.languages = navigator.languages || [navigator.language];
        
        // Coletar informações de timezone
        fingerprint.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Coletar informações de hardware (se disponível)
        if (navigator.hardwareConcurrency) {
          fingerprint.cpuCores = navigator.hardwareConcurrency;
        }
        
        // Simular valores para campos JA3 que normalmente viriam de TLS
        fingerprint.cipherSuites = [
          "TLS_AES_128_GCM_SHA256",
          "TLS_AES_256_GCM_SHA384",
          "TLS_CHACHA20_POLY1305_SHA256"
        ];
        
        fingerprint.extensions = [
          "server_name",
          "status_request",
          "supported_groups",
          "signature_algorithms",
          "application_layer_protocol_negotiation"
        ];
        
        fingerprint.ellipticCurves = ["x25519", "secp256r1", "secp384r1"];
        fingerprint.ellipticCurvePointFormats = ["uncompressed"];
        
        // Você poderia adicionar mais propriedades conforme necessário
        
        return fingerprint;
      } catch (error) {
        this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Erro ao coletar fingerprint', { error: error.message });
        // Retornar um objeto vazio em caso de erro
        return {};
      }
    }

// Método que deve substituir o _setupInterceptors atual
_setupInterceptors() {
  let cachedFingerprint = null;

    // Interceptor de requisição para adicionar token de autorização
    this.api.interceptors.request.use(async (config) => {
      const authTokenService = serviceLocator.get('authToken');
      
      // Log de diagnóstico para requisições
      this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Preparando requisição', {
        url: config.url,
        method: config.method,
        hasAuthHeader: !!config.headers.Authorization,
        hasCookies: document.cookie.length > 0
      });
  
    // Coletar JA3 Fingerprint (apenas uma vez)
    if (!cachedFingerprint) {
      cachedFingerprint = await this.collectBrowserFingerprint();
      this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Fingerprint coletado', {
        hasFingerprint: !!cachedFingerprint
      });
    }
    
    // Adicionar JA3 fingerprint aos cabeçalhos, especialmente para rotas de autenticação
    if (cachedFingerprint && config.url.includes('/api/auth/')) {
      // Para rota de token, incluir no corpo da requisição
      if (config.url.includes('/api/auth/token') && config.data) {
        config.data = {
          ...config.data,
          ja3Data: cachedFingerprint
        };
        this._log(MODULE_NAME, LOG_LEVELS.INFO, 'JA3 fingerprint adicionado ao body da requisição');
      } 
      // Para outras rotas de auth, incluir nos headers
      else {
        config.headers['X-Browser-Fingerprint'] = JSON.stringify(cachedFingerprint);
        this._log(MODULE_NAME, LOG_LEVELS.INFO, 'JA3 fingerprint adicionado aos headers');
      }
    }

      // Aplicar rate limiting
      const limiter = config.url.includes('/auth')
        ? rateLimiters.auth
        : config.url.includes('/users')
          ? rateLimiters.user
          : rateLimiters.default;
  
      await limiter.schedule(() => Promise.resolve());
  
      // Caso especial para rota de token - não adicionar Authorization
      if (config.url.includes('/api/auth/token')) {
        this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Requisição de troca de token, ignorando cabeçalho auth');
        config.withCredentials = true; // Garante envio de cookies
        return config;
      }
  
      // Para outras rotas, obter token da fonte mais confiável
      try {
        // Verificar se o AuthTokenService está disponível e inicializado
        if (authTokenService && authTokenService.isInitialized) {
          // Usar o serviço de token para obter o token (ele já prioriza as fontes)
          const token = await authTokenService.getAccessToken();
          
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Token adicionado ao cabeçalho via AuthTokenService');
          } else {
            // Nenhum token disponível do serviço, verificar cookies como fallback
            const cookieToken = document.cookie.match(/authorization=([^;]+)/);
            if (cookieToken) {
              const authHeader = decodeURIComponent(cookieToken[1]);
              if (authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                config.headers.Authorization = `Bearer ${token}`;
                this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Token adicionado ao cabeçalho via cookie');
              }
            }
          }
        } else {
          // AuthTokenService não disponível, tentar método legado
          this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'AuthTokenService não disponível, usando método legado');
          
          // 1. Verificar cookies
          const cookieToken = document.cookie.match(/authorization=([^;]+)/);
          if (cookieToken) {
            const authHeader = decodeURIComponent(cookieToken[1]);
            if (authHeader.startsWith('Bearer ')) {
              const token = authHeader.substring(7);
              config.headers.Authorization = `Bearer ${token}`;
              this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Token adicionado ao cabeçalho via cookie (legado)');
            }
          } 
          // 2. Fallback para localStorage
          else {
            const localStorageToken = localStorage.getItem('auth_access_token');
            if (localStorageToken) {
              config.headers.Authorization = `Bearer ${localStorageToken}`;
              this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Token adicionado ao cabeçalho via localStorage');
            }
          }
        }
  
        // Garantir envio de cookies em todas as requisições
        config.withCredentials = true;
  
        // Log adicional para diagnóstico
        this._log(MODULE_NAME, LOG_LEVELS.DEBUG, 'Configuração final da requisição', {
          hasAuthHeader: !!config.headers.Authorization,
          sendingCookies: config.withCredentials
        });
  
      } catch (tokenError) {
        this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Erro ao obter token para requisição', {
          error: tokenError.message
        });
      }
  
      return config;
    }, (error) => {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Erro na configuração da requisição', { 
        error: error.message 
      });
      return Promise.reject(error);
    });
  
    // Interceptor de resposta 
    this.api.interceptors.response.use((response) => {
      // Verificar se é resposta da rota de token e tem tokens na resposta
      if (response.config.url.includes('/api/auth/token') && response.data.isAuthenticated) {
        const authTokenService = serviceLocator.get('authToken');
        
        // Salvar tokens através do AuthTokenService se disponível
        if (authTokenService && authTokenService.isInitialized && response.data.tokens) {
          authTokenService.setTokens(
            response.data.tokens.accessToken,
            response.data.tokens.refreshToken,
            response.data.tokens.expiresIn || 3600
          );
          this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Tokens salvos via AuthTokenService');
        } 
        // Fallback para localStorage se o serviço não estiver disponível
        else if (response.data.tokens) {
          localStorage.setItem('auth_access_token', response.data.tokens.accessToken);
          localStorage.setItem('auth_refresh_token', response.data.tokens.refreshToken);
          this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Tokens salvos em localStorage (fallback)');
        }
        
        // Detectar primeiro acesso
        if (response.data.isFirstAccess) {
          this._emitEvent(AUTH_EVENTS.FIRST_ACCESS_DETECTED, {
            user: response.data.user
          });
          this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Primeiro acesso detectado', {
            userId: response.data.user?.uid
          });
        }
      }
      
      // Cache para modo offline
      try {
        if (response.config.method === 'get') {
          const url = response.config.url;
          const offlineEligibleEndpoints = [
            '/api/user/', 
            '/api/messages/', 
            '/api/connections/'
          ];
          
          const isOfflineEligible = offlineEligibleEndpoints.some(endpoint => 
            url.includes(endpoint)
          );
          
          if (isOfflineEligible) {
            localStorage.setItem('cached_data_' + url, JSON.stringify(response.data));
            localStorage.setItem('cached_data_timestamp_' + url, Date.now().toString());
            
            this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Dados armazenados para uso offline', {
              url,
              timestamp: Date.now()
            });
          }
        }
      } catch (cacheError) {
        this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Erro ao armazenar dados offline', {
          error: cacheError.message
        });
      }
      
      return response;
    }, this._handleResponseError.bind(this));
    
    // Configuração similar para apiUpload
    this.apiUpload.interceptors.request.use(async (config) => {
      const authTokenService = serviceLocator.get('authToken');
      if (authTokenService && authTokenService.isInitialized) {
        const limiter = rateLimiters.default;
        await limiter.schedule(() => Promise.resolve());
  
        const token = await authTokenService.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
  
        this._log(MODULE_NAME, LOG_LEVELS.INFO, 'API upload request', {
          url: config.url,
          method: config.method
        });
        
        // Garantir envio de cookies em todas as requisições
        config.withCredentials = true;
        
        return config;
      }
    }, (error) => {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'API upload request error', {error});
      return Promise.reject(error);
    });
  
    this.apiUpload.interceptors.response.use((response) => {
      // Verificar se a resposta de upload tem a flag de primeiro acesso
      if (response.data?.isFirstAccess) {
        // Emitir evento para informar sobre primeiro acesso
        this._emitEvent(AUTH_EVENTS.FIRST_ACCESS_DETECTED, {
          user: response.data.user
        });
  
        this._log(MODULE_NAME, LOG_LEVELS.INFO, 'First access detected on upload', {
          userId: response.data.user?.uid
        });
      }
  
      this._log(MODULE_NAME, LOG_LEVELS.INFO, 'API upload response', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
      return response;
    }, this._handleResponseError.bind(this));
  }
  
  // Método de tratamento de erro de resposta (separado para melhor organização)
  async _handleResponseError(error, originalRequest) {
    // Adicionar logs detalhados para diagnóstico
    this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Ocorreu um erro na requisição', {
      url: originalRequest?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
  
    // Lidar com erros 401 (sessão expirada)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Log de diagnóstico do estado de autenticação
      this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Erro 401 detectado, verificando opções de autenticação', {
        hasCookies: document.cookie.length > 0,
        hasCurrentUser: !!auth.currentUser,
        hasLocalStorageTokens: !!localStorage.getItem('auth_access_token'),
        url: originalRequest.url
      });
  
      try {
        const authTokenService = serviceLocator.get('authToken');
        
        // Requisição para /api/auth/token que falhou
        if (originalRequest.url.includes('/api/auth/token')) {
          // Verificar se é um caso de usuário novo
          if (error.response?.data?.error?.includes('Usuário não encontrado')) {
            this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Usuário não encontrado, pode ser necessário criar perfil');
            
            // Emitir evento para informar sobre primeiro acesso
            this._emitEvent(AUTH_EVENTS.FIRST_ACCESS_NEEDED, {
              reason: 'user_not_found',
              url: originalRequest.url
            });
            
            return Promise.reject(new Error('Usuário não encontrado, primeiro acesso necessário'));
          }
          
          // Outro problema com o token
          this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Problema na validação do token', {
            error: error.response?.data
          });
  
          this._emitEvent(AUTH_EVENTS.AUTH_ERROR, {
            reason: 'token_invalid',
            url: originalRequest.url,
            error: error.response?.data
          });
          
          return Promise.reject(error);
        } else {
          // Para outras requisições autenticadas
          this._log(MODULE_NAME, LOG_LEVELS.STATE, 'Sessão expirada, tentando renovar');
          
          // Tentar primeiro com AuthTokenService se disponível
          if (authTokenService && authTokenService.isInitialized) {
            const refreshSuccess = await authTokenService.refreshToken();
            
            if (refreshSuccess) {
              this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Token renovado via AuthTokenService');
              // Obter o novo token e atualizar a requisição
              const newToken = await authTokenService.getAccessToken();
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.api(originalRequest);
            }
          }
          
          // ETAPA 1: Tentar com refreshToken se disponível
          const refreshTokenSources = [
            localStorage.getItem('auth_refresh_token'),
            localStorage.getItem('refresh_token'),
            document.cookie.match(/refreshToken=([^;]+)/)?.[1]
          ];
          
          const refreshToken = refreshTokenSources.find(token => token);
          
          if (refreshToken) {
            try {
              this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Tentando renovar com refresh token');
              
              const refreshResponse = await axios.post(`${API_URL}/api/auth/refresh`, {
                refreshToken
              }, { 
                withCredentials: true 
              });
              
              if (refreshResponse.data.isAuthenticated) {
                this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Refresh token renovado com sucesso');
                
                // Armazenar tokens no localStorage para fallback
                if (refreshResponse.data.tokens) {
                  localStorage.setItem('auth_access_token', refreshResponse.data.tokens.accessToken);
                  localStorage.setItem('auth_refresh_token', refreshResponse.data.tokens.refreshToken);
                  
                  // Também armazenar no AuthTokenService se disponível
                  if (authTokenService && authTokenService.isInitialized) {
                    authTokenService.setTokens(
                      refreshResponse.data.tokens.accessToken,
                      refreshResponse.data.tokens.refreshToken,
                      refreshResponse.data.tokens.expiresIn || 3600
                    );
                  }
                }
                
                // Retentar a requisição original
                originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.tokens.accessToken}`;
                return this.api(originalRequest);
              }
            } catch (refreshError) {
              this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Falha ao renovar com refresh token, tentando Firebase', {
                error: refreshError.message
              });
              // Continue para o próximo método
            }
          }
          
          // ETAPA 2: Se falhar, tenta com Firebase
          const currentUser = auth.currentUser;
          if (currentUser) {
            try {
              this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Tentando renovar com Firebase', {
                email: currentUser.email
              });
              
              // Obter novo token do Firebase
              const idToken = await currentUser.getIdToken(true);
              
              // Trocar por tokens JWT da aplicação
              const response = await axios.post(`${API_URL}/api/auth/token`, {
                firebaseToken: idToken
              }, { 
                withCredentials: true 
              });
              
              if (response.data.isAuthenticated) {
                this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Token Firebase renovado com sucesso');
                
                // Armazenar tokens no localStorage para fallback
                if (response.data.tokens) {
                  localStorage.setItem('auth_access_token', response.data.tokens.accessToken);
                  localStorage.setItem('auth_refresh_token', response.data.tokens.refreshToken);
                  
                  // Também armazenar no AuthTokenService se disponível
                  if (authTokenService && authTokenService.isInitialized) {
                    authTokenService.setTokens(
                      response.data.tokens.accessToken,
                      response.data.tokens.refreshToken,
                      response.data.tokens.expiresIn || 3600
                    );
                  }
                }
                
                // Verificar primeiro acesso
                if (response.data.isFirstAccess) {
                  this._emitEvent(AUTH_EVENTS.FIRST_ACCESS_DETECTED, {
                    user: response.data.user
                  });
                }
                
                // Retentar a requisição original
                originalRequest.headers.Authorization = `Bearer ${response.data.tokens.accessToken}`;
                return this.api(originalRequest);
              }
            } catch (firebaseError) {
              this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Falha ao renovar token com Firebase', {
                error: firebaseError.message
              });
            }
          }
          
          // ETAPA 3: Implementar modo offline se aplicável para certos endpoints
          const offlineEligibleEndpoints = [
            '/api/user/', 
            '/api/messages/', 
            '/api/connections/'
          ];
          
          const isOfflineEligible = offlineEligibleEndpoints.some(endpoint => 
            originalRequest.url.includes(endpoint)
          );
          
          if (isOfflineEligible && localStorage.getItem('cached_data_' + originalRequest.url)) {
            this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Usando dados em cache para modo offline', {
              url: originalRequest.url
            });
            
            // Emitir evento de modo offline
            this._emitEvent('OFFLINE_MODE_ACTIVATED', {
              url: originalRequest.url,
              timestamp: Date.now()
            });
            
            // Retornar dados em cache
            return Promise.resolve({
              data: JSON.parse(localStorage.getItem('cached_data_' + originalRequest.url)),
              status: 200,
              offlineMode: true
            });
          }
          
          // ETAPA 4: Todas as tentativas falharam, redirecionar para login
          this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Todas as tentativas de renovação falharam');
          
          // Emitir evento
          this._emitEvent(AUTH_EVENTS.SESSION_EXPIRED, {
            reason: 'token_expired',
            url: originalRequest.url
          });
  
          // Redirecionar para página de login
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_redirect_reason', 'token_expired');
            localStorage.setItem('auth_redirect_url', window.location.pathname);
            window.location.href = '/login?expired=true';
          }                        
          
          return Promise.reject(new Error('Sessão expirada, redirecionando para login'));
        }
      } catch (processingError) {
        this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Erro crítico ao processar erro 401', {
          error: processingError.message,
          originalUrl: originalRequest.url
        });
        return Promise.reject(processingError);
      }
    }
  
    // Para outros tipos de erro, apenas registre e rejeite
    this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Erro na resposta da API', {
      url: originalRequest?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
  
    return Promise.reject(error);
  }

    async healthCheck() {
        try {
            const response = await this
                .api
                .get('/api/health/full');
            return response.status === 200;
        } catch (error) {
            // handleResponseError(error);  Consider if you want to handle errors here
            // differently
            console.warn('ApiService health check failed:', error);
            return false;
        }
    }

// Adicionar ao apiService
async executeWithOfflineFallback(requestPromise, fallbackData = null) {
    try {
        return await requestPromise;
    } catch (error) {
        if (error.response?.status === 401 || !navigator.onLine) {
            this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Usando fallback offline', {
                url: error.config?.url,
                fallbackAvailable: !!fallbackData
            });
            
            if (fallbackData) {
                return { data: fallbackData, status: 200, offlineMode: true };
            }
        }
        throw error;
    }
}
}

export { ApiService };