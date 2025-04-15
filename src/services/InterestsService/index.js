// src/services/InterestsService/index.js
import { BaseService, serviceLocator, serviceEventHub } from '../../core/services/BaseService';
import { LOG_LEVELS } from '../../core/logging';
import { INTERESTS_EVENTS } from '../../core/constants/events';
import { SERVICE_ACTIONS } from '../../core/constants/actions';

const MODULE_NAME = 'interests';

class InterestsService extends BaseService {
  constructor() {
    super(MODULE_NAME);
    this.instanceId = Math.random().toString(36).substring(2, 10);

    this._currentUser = null;
    this._interestsCache = new Map();
    this._categoriesCache = null;
    this._lastCacheUpdate = null;
    this._isInitialized = false;

    this._metadata = {
      name: MODULE_NAME,
      phase: 'ESSENTIAL',              // Fase de inicialização (CORE, ESSENTIAL, etc.)
      criticalPath: true,         // Indica se é um serviço crítico para a aplicação
      dependencies: ['auth', 'users'], // Serviços que devem estar prontos antes deste
      category: 'communications',       // Categoria do serviço
      description: 'Gerencia Interesses.' // Descrição
    };

    this._log(`📊 Nova instância de ${MODULE_NAME} criada, instanceId: ${this.instanceId}`);

    this.apiService = serviceLocator.get('apiService');
    this.authService = serviceLocator.get('auth');

  }

  getCurrentUser() {
    return this._currentUser = this.authService.getCurrentUser();
}

  async initialize() {
    if (this.isInitialized) return this;

    this._log(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'InterestsService initializing...', { timestamp: Date.now() });

    try {
      this._log(MODULE_NAME, LOG_LEVELS.INITIALIZATION, 'Inicializando serviço de interesses');

      this._isInitialized = true;
      
      this._emitEvent(SERVICE_ACTIONS.SERVICE_READY, {
        serviceName: MODULE_NAME,
        timestamp: new Date().toISOString()
      });

      this.fetchAvailableInterests()

      return this;
    } catch (error) {
      this._logError(error, 'initialize');

      throw error;
    }
  }

/**
   * Verifica a saúde do serviço
   * @returns {Promise<Object>} Estado de saúde do serviço
   */
  async healthCheck() {
    try {
      // this._startLoading();
      // Tentar verificar a saúde via API
      const healthResponse = await this._executeWithRetry(
        async () => {
          return await this.apiService.get(`/api/health/service/${this.serviceName}`);
        },
        'healthCheck'
      );
      // this._stopLoading();
    //   console.log('checando resposta', healthResponse.data.status)

      return { status: healthResponse.data.status, timestamp: Date.now() };
    } catch (error) {
      // this._stopLoading();
      // Implementar fallback se o endpoint de saúde estiver indisponível
      this._log(
        MODULE_NAME,
        LOG_LEVELS.WARNING,
        'Health check endpoint unavailable, proceeding with degraded mode',
        { error: error.message } // Adicionando o erro ao log
      );

      // Ainda retornar healthy para não bloquear outras funcionalidades
      return {
        status: 'degraded',
        details: 'Operating in offline mode',
        timestamp: Date.now(),
        error: error.message // Adicionando o erro ao retorno
      };
    }
  }

  async getInterestStats() {
    // this._startLoading();
  
    try {
      const response = await this._executeWithRetry(async () => {
        return await this.apiService.get(`/api/interests/admin/stats`);
      }, 'getInterestStats');
  
      const statsData = response.data;
      // this._stopLoading();
      return statsData;
    } catch (error) {
      this._logError(error, 'getInterestStats');
      // this._stopLoading();
      throw error;
    }
  }

async fetchAvailableInterests() {
    this._emitEvent(INTERESTS_EVENTS.FETCH_CATEGORIES_START); // Emitir evento específico de início

    try {
      // Verificar cache com TTL de 1 hora
      const now = Date.now();
      const cacheAge = this._lastCacheUpdate ? now - this._lastCacheUpdate : null;

      if (this._categoriesCache && cacheAge && cacheAge < 3600000) {
        this._log('Usando cache de categorias', this._categoriesCache);
        const categories = this._categoriesCache;
        this._emitEvent(INTERESTS_EVENTS.FETCH_CATEGORIES_SUCCESS, { categories }); // Emitir evento específico de sucesso
        return this._categoriesCache;
      }

      const response = await this._executeWithRetry(async () => {
        return await this.apiService.get('/api/interests/categories');
      }, 'fetchAvailableInterests');

      const categories = response.data.data;

      // Atualizar cache
      this._categoriesCache = categories;
      this._lastCacheUpdate = now;

      this._emitEvent(INTERESTS_EVENTS.FETCH_CATEGORIES_SUCCESS, { categories }); // Emitir evento específico de sucesso
      return categories;
    } catch (error) {
      this._logError(error, 'fetchAvailableInterests');
      this._emitEvent(INTERESTS_EVENTS.FETCH_CATEGORIES_FAILURE, { error: error.message }); // Emitir evento específico de falha
      throw error;
    }
  }

  async fetchUserInterests(userId) {
    if (!userId) {
      if (!this._currentUser?.uid) {
        throw new Error('Usuário não autenticado');
      }
      userId = this._currentUser.uid;
    }
    
    // this._startLoading();
    this._emitEvent(INTERESTS_EVENTS.FETCH_USER_INTERESTS_START);

    try {
      const cachedData = this._interestsCache.get(userId);
      const now = Date.now();

      if (cachedData && (now - cachedData.timestamp < 300000)) { // 5 minutes cache
        this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Using cached user interests', { userId });
        this._emitEvent(INTERESTS_EVENTS.FETCH_USER_INTERESTS_SUCCESS, { 
          interests: cachedData.interests 
        });
        return cachedData.interests;
      }

      const response = await this._executeWithRetry(async () => {
        return await this.apiService.get(`/api/interests/${userId}`);
      }, 'fetchUserInterests');

      const userInterests = response.data.data;
      
      // Armazenar em cache
      this._interestsCache.set(userId, {
        interests: userInterests,
        timestamp: now
      });
      
      this._emitEvent(INTERESTS_EVENTS.FETCH_USER_INTERESTS_SUCCESS, {payload: { interests: userInterests }});
      // this._stopLoading();
      return { interests: userInterests };
    } catch (error) {
      this._logError(error, 'fetchUserInterests');
      this._emitEvent(INTERESTS_EVENTS.FETCH_USER_INTERESTS_FAILURE, { error: error.message });
      // this._stopLoading();
      throw error;
    }
  }

  async updateUserInterests(userId, selectedInterestIds) {
    if (!userId) {
      if (!this._currentUser?.uid) {
        throw new Error('Usuário não autenticado');
      }
      userId = this._currentUser.uid;
    }

    // this._startLoading();
    this._emitEvent(INTERESTS_EVENTS.UPDATE_START);

    try {

      if (!Array.isArray(selectedInterestIds)) {
        throw new Error('selectedInterestIds deve ser um array');
      }

      const response = await this._executeWithRetry(async () => {
        return await this.apiService.put(`/api/interests/${userId}`, {
          interestIds: selectedInterestIds
        });
      }, 'updateUserInterests');

      const result = response.data.data;
      
      // Invalidar cache para forçar recarga na próxima consulta
      this._interestsCache.delete(userId);
      
      this._emitEvent(INTERESTS_EVENTS.UPDATE_SUCCESS, result);
      // this._stopLoading();
      return result;
    } catch (error) {
      this._logError(error, 'updateUserInterests');
      this._emitEvent(INTERESTS_EVENTS.UPDATE_FAILURE, { error: error.message });
      // this._stopLoading();
      throw error;
    }
  }

  async getSuggestedInterests(limit = 10) {
    // this._startLoading();

    try {
      const response = await this._executeWithRetry(async () => {
        return await this.apiService.get(`/api/interests/suggested?limit=${limit}`);
      }, 'getSuggestedInterests');

      const suggestedInterests = response.data.data || [];
      // this._stopLoading();
      return suggestedInterests;
    } catch (error) {
      this._logError(error, 'getSuggestedInterests');
      // this._stopLoading();
      throw error;
    }
  }

  async getTrendingInterests(limit = 10) {
    // this._startLoading();

    try {
      const response = await this._executeWithRetry(async () => {
        return await this.apiService.get(`/api/interests/trending?limit=${limit}`);
      }, 'getTrendingInterests');

      const trendingInterests = response.data.data || [];
      // this._stopLoading();
      return trendingInterests;
    } catch (error) {
      this._logError(error, 'getTrendingInterests');
      // this._stopLoading();
      throw error;
    }
  }

  // Métodos auxiliares privados
  _clearCache() {
    this._interestsCache.clear();
    this._categoriesCache = null;
    this._lastCacheUpdate = null;
    this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Cache cleared');
  }
}

export {InterestsService}