// src/services/apiService.js
import axios from 'axios';
import Bottleneck from 'bottleneck';
import { tokenManager } from '../tokenManager';
import { coreLogger } from '../core/logging/CoreLogger';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Configuração dos rate limiters (mantida do código original)
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

// Verifica ambiente seguro
const isSecureEnvironment = () => {
  return process.env.NODE_ENV === 'production' || window.location.protocol === 'https:';
};

// Criação de instâncias do Axios com diferentes configurações
const createApiInstance = (contentType = 'application/json') => {
  const instance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    secure: isSecureEnvironment(),
    headers: {
        'Content-Type': contentType
    },
    timeout: 30000
});

  instance.interceptors.request.use(
    config => {
        console.log('[API] Making request:', {
            url: config.url,
            method: config.method,
            headers: config.headers
        });
        return config;
    },
    error => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    response => {
        console.log('[API] Response received:', {
            status: response.status,
            data: response.data
        });
        return response;
    },
    error => {
        console.error('[API] Response error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        return Promise.reject(error);
    }
);

  // Interceptor de requisição
  instance.interceptors.request.use(
    async (config) => {
      // Aplicar rate limiting
      const limiter = config.url.includes('/auth')
        ? rateLimiters.auth
        : config.url.includes('/users')
          ? rateLimiters.user
          : rateLimiters.default;

      await limiter.schedule(() => Promise.resolve());

      // Verificar autenticação (exceto para rotas específicas ou quando explicitamente solicitado)
      if (!config.skipAuthCheck && 
          !config.url.includes('/auth/login') && 
          !config.url.includes('/auth/register')) {
        
        // Injeta header de autorização, se necessário
        config = await tokenManager.injectAuthHeader(config);
        
        // Verificar se usuário está autenticado
        const isAuthenticated = await tokenManager.isAuthenticated();
        if (!isAuthenticated) {
          throw new Error('Not authenticated');
        }
      }

      // Remover flags de controle antes de enviar a requisição
      if (config.skipAuthCheck) delete config.skipAuthCheck;

      return config;
    },
    (error) => {
      coreLogger.logServiceError('ApiService', error, {
        context: 'request'
      });
      return Promise.reject(error);
    }
  );

  // Interceptor de resposta
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (!error.response) {
        coreLogger.logServiceError('ApiService', error, {
          context: 'network'
        });
        throw new Error('Network error occurred');
      }

      // Tratamento de erro 401 Unauthorized
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Tentar atualizar sessão
          const refreshed = await tokenManager.refreshSession();
          
          if (refreshed) {
            // Atualizar cabeçalho de autorização
            originalRequest = await tokenManager.injectAuthHeader(originalRequest);
            return instance(originalRequest);
          } else {
            // Se não conseguiu atualizar, limpar sessão e redirecionar
            tokenManager.clearSession();
            window.location.href = '/login';
            throw new Error('Session refresh failed');
          }
        } catch (refreshError) {
          tokenManager.clearSession();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Criar e exportar instâncias
export const api = createApiInstance();
export const apiUpload = createApiInstance('multipart/form-data');