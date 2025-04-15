// src/services/UserPreferencesService/index.js
import { BaseService, serviceLocator } from '../../core/services/BaseService';
import { LOG_LEVELS, STORAGE_TYPES, PREFERENCE_CATEGORIES } from '../../core/constants/config';
import { USER_PREFS_EVENTS } from '../../core/constants/events';
import { SERVICE_ACTIONS } from '../../core/constants/actions';

const MODULE_NAME = 'userPreferences';

/**
 * Serviço responsável pelo gerenciamento de preferências do usuário
 * Implementa operações de leitura/escrita com diferentes estratégias de persistência
 * e integração com EventActionBridgeService para notificação de mudanças
 */
class UserPreferencesService extends BaseService {
  constructor() {
    super(MODULE_NAME);
    this.instanceId = Math.random().toString(36).substring(2, 10);
    this._isInitialized = false;

    this._metadata = {
      name: MODULE_NAME,
      phase: 'ESSENTIAL',              // Fase de inicialização (CORE, ESSENTIAL, etc.)
      criticalPath: true,         // Indica se é um serviço crítico para a aplicação
      dependencies: ['auth', 'users'], // Serviços que devem estar prontos antes deste
      category: 'essentials',       // Categoria do serviço
      description: 'Gerencia Servico de Preferencia de Usuarios.' // Descrição
    };

    this._preferences = {};
    this._storageStrategies = {};
    this._defaultPreferences = {};
    this._userLoading = false;

    // Configuração inicial das estratégias de armazenamento
    this._registerStorageStrategy(STORAGE_TYPES.LOCAL, { // Certifique-se de que STORAGE_TYPES está definido
      save: this._saveToLocalStorage.bind(this),
      load: this._loadFromLocalStorage.bind(this),
      clear: this._clearLocalStorage.bind(this)
    });

    this._registerStorageStrategy(STORAGE_TYPES.SESSION, {
      save: this._saveToSessionStorage.bind(this),
      load: this._loadFromSessionStorage.bind(this),
      clear: this._clearSessionStorage.bind(this)
    });

    this._registerStorageStrategy(STORAGE_TYPES.COOKIE, {
      save: this._saveToCookie.bind(this),
      load: this._loadFromCookie.bind(this),
      clear: this._clearCookies.bind(this)
    });

    this._currentUser = null;
    this._setDefaultPreferences();

    this._log(`📊 Nova instância de UserPreferencesService criada, instanceId: ${this.instanceId}`);
  }

  /**
   * Inicializa o serviço
   * @returns {Promise<boolean>} true se inicializado com sucesso
   */
  async initialize() {
    if (this.isInitialized) return this;

    this._log(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'UserPreferencesService initializing...', { timestamp: Date.now() });

    try {
      // Carregar preferências iniciais (com fallback em cascata)
      await this._loadAllPreferences();


      // this._log(MODULE_NAME, LOG_LEVELS.INITIALIZATION, 'UserPreferencesService initialized', { timestamp: Date.now() });

      // // Emitir evento de inicialização concluída
      // this._emitEvent(this.serviceName, USER_PREFS_EVENTS.PREFS_INITIALIZED, {
      //   preferences: this._preferences,
      //   timestamp: Date.now()
      // });

      // Atualiza o status de inicialização
      // this.initializationStatus.set(MODULE_NAME, {
      //   status: 'ready',
      //   timestamp: new Date().toISOString()
      // });

      this._isInitialized = true;
      this.storeService = serviceLocator.get('store');
      this.userService = serviceLocator.get('users');

      // Emite evento de serviço pronto
      // this._emitEvent('initialization', SERVICE_ACTIONS.SERVICE_READY, {
      //   serviceName: MODULE_NAME,
      //   timestamp: new Date().toISOString()
      // });

      // // Log de sucesso com coreLogger
      // this._log(
      //   MODULE_NAME,
      //   LOG_LEVELS.INITIALIZATION,
      //   'UserPreferencesService initialized successfully'
      // );
      this._emitEvent(SERVICE_ACTIONS.SERVICE_READY, {
        serviceName: MODULE_NAME,
        timestamp: new Date().toISOString()
      });
      return this;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'UserPreferencesService initialization failed', { timestamp: Date.now(), error: error.message });

      // Atualiza o status de inicialização para falha
      // this.initializationStatus.set(MODULE_NAME, {
      //   status: 'failed',
      //   error: error.message, // ou error.toString()
      //   timestamp: new Date().toISOString()
      // });

      // // Emite evento de serviço falhou
      // this._emitEvent('initialization', SERVICE_ACTIONS.SERVICE_ERROR, {
      //   serviceName: MODULE_NAME,
      //   error: error.message, // ou error.toString()
      //   timestamp: new Date().toISOString()
      // });

      // // Log de falha com coreLogger
      // this._log(
      //   MODULE_NAME,
      //   error,
      //   {
      //     message: 'UserPreferencesService initialization failed',
      //     timestamp: new Date().toISOString()
      //   }
      // );

      throw error;
    }
  }
  
  /**
   * Verifica a saúde do serviço
   * @returns {Promise<Object>} Estado de saúde do serviço
   */
  async healthCheck() {
    const statusCheck = {
      isInitialized: this._isInitialized,
      preferencesLoaded: Object.keys(this._preferences).length > 0,
      storageStrategies: Object.keys(this._storageStrategies),
      timestamp: Date.now()
    };
    
    return {
      status: statusCheck.initialized ? 'healthy' : 'degraded',
      details: statusCheck
    };
  }
  
  /**
   * Desliga o serviço e libera recursos
   * @returns {Promise<boolean>} true se desligado com sucesso
   */
  async shutdown() {
    this._isInitialized = false;
    return true;
  }
  
  /**
   * Define preferências padrão por categoria
   * @private
   */
  _setDefaultPreferences() {
    this._defaultPreferences = {
      [PREFERENCE_CATEGORIES.THEME]: {
        mode: 'system', // 'light', 'dark', 'system'
        primaryColor: 'default',
        fontSize: 'medium',
        enableAnimations: true
      },
      [PREFERENCE_CATEGORIES.PRIVACY]: {
        shareAnalytics: false,
        saveHistory: true
      },
      [PREFERENCE_CATEGORIES.NOTIFICATIONS]: {
        email: true,
        push: true,
        inApp: true,
        marketingEmails: false
      },
      [PREFERENCE_CATEGORIES.ACCESSIBILITY]: {
        reduceMotion: false,
        highContrast: false,
        screenReader: false,
        enableShortcuts: true
      },
      [PREFERENCE_CATEGORIES.DISPLAY]: {
        density: 'normal',
        sidebarCollapsed: false,
        dashboardLayout: 'default'
      },
      [PREFERENCE_CATEGORIES.LANGUAGE]: {
        locale: 'pt-BR',
        timezone: 'auto' // 'auto' ou específico como 'America/Sao_Paulo'
      },
      [PREFERENCE_CATEGORIES.COOKIES]: {
        necessary: true, // Sempre true, não pode ser alterado
        functional: true,
        analytics: false,
        marketing: false,
        thirdParty: false,
        consentTimestamp: null
      }
    };
  }
  
  /**
   * Registra uma estratégia de armazenamento
   * @param {string} typeName - Nome do tipo de armazenamento
   * @param {Object} strategy - Objeto com métodos save, load e clear
   * @private
   */
  _registerStorageStrategy(typeName, strategy) {
    if (!strategy || typeof strategy.save !== 'function' || typeof strategy.load !== 'function') {
      throw new Error(`Invalid storage strategy for ${typeName}`);
    }
    
    this._storageStrategies[typeName] = strategy;
  }
  
  /**
   * Carrega preferências de todas as fontes registradas
   * @private
   * @returns {Promise<Object>} Preferências carregadas
   */
  async _loadAllPreferences() {
    const preferences = { ...this._defaultPreferences };
    
    // Primeiro tentar carregar do localStorage (persistente)
    try {
      const localData = await this._loadFromLocalStorage();
      if (localData) {
        this._log(MODULE_NAME, LOG_LEVELS.STATE, 'Preferences loaded from localStorage', { 
          categories: Object.keys(localData)
        });
        
        // Merge com os padrões
        Object.keys(localData).forEach(category => {
          if (preferences[category]) {
            preferences[category] = { ...preferences[category], ...localData[category] };
          } else {
            preferences[category] = localData[category];
          }
        });
      }
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Could not load from localStorage', { error: error.message });
    }
    
    // Verificar e carregar do backend para usuários autenticados
    if (this._isUserAuthenticated()) {
      try {
        const backendData = await this._loadFromBackend();
        if (backendData) {
          this._log(MODULE_NAME, LOG_LEVELS.STATE, 'Preferences loaded from backend', { 
            categories: Object.keys(backendData)
          });
          
          // Merge com os dados já carregados
          Object.keys(backendData).forEach(category => {
            if (preferences[category]) {
              preferences[category] = { ...preferences[category], ...backendData[category] };
            } else {
              preferences[category] = backendData[category];
            }
          });
        }
      } catch (error) {
        this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Could not load from backend', { error: error.message });
      }
    }
    
    // Atualizar cache em memória
    this._preferences = preferences;
    
    // Emitir evento de preferências carregadas
    this._emitEvent(this.serviceName, USER_PREFS_EVENTS.PREFS_LOADED, {
      preferences: this._preferences,
      timestamp: Date.now()
    });
    
    return preferences;
  }
  
  /**
   * Verifica se o usuário está autenticado
   * @private
   * @returns {boolean} true se o usuário estiver autenticado
   */
  _isUserAuthenticated() {
    // Implementação pode variar dependendo da estrutura da aplicação
    // Por exemplo, usando uma referência ao AuthService ou verificando tokens
    try {
      const hasToken = !!localStorage.getItem('auth_token') || !!sessionStorage.getItem('auth_token');
      const hasUser = !!localStorage.getItem('current_user');
      return hasToken && hasUser;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Salva as preferências usando uma estratégia específica
   * @param {string} strategyName - Nome da estratégia de armazenamento
   * @param {Object} data - Dados a serem salvos
   * @private
   */
  async _saveWithStrategy(strategyName, data) {
    const strategy = this._storageStrategies[strategyName];
    if (!strategy || typeof strategy.save !== 'function') {
      throw new Error(`Invalid or unregistered storage strategy: ${strategyName}`);
    }
    
    return strategy.save(data);
  }
  
  /**
   * Carrega as preferências usando uma estratégia específica
   * @param {string} strategyName - Nome da estratégia de armazenamento
   * @private
   */
  async _loadWithStrategy(strategyName) {
    const strategy = this._storageStrategies[strategyName];
    if (!strategy || typeof strategy.load !== 'function') {
      throw new Error(`Invalid or unregistered storage strategy: ${strategyName}`);
    }
    
    return strategy.load();
  }
  
  /**
   * Salva as preferências no localStorage
   * @param {Object} data - Dados a serem salvos
   * @private
   */
  async _saveToLocalStorage(data = this._preferences) {
    try {
      localStorage.setItem('user_preferences', JSON.stringify(data));
      return true;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Error saving to localStorage', { error: error.message });
      return false;
    }
  }
  
  /**
   * Carrega as preferências do localStorage
   * @private
   */
  async _loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('user_preferences');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Error loading from localStorage', { error: error.message });
      return null;
    }
  }
  
  /**
   * Limpa as preferências do localStorage
   * @private
   */
  async _clearLocalStorage() {
    try {
      localStorage.removeItem('user_preferences');
      return true;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Error clearing localStorage', { error: error.message });
      return false;
    }
  }
  
  /**
   * Salva as preferências no sessionStorage
   * @param {Object} data - Dados a serem salvos
   * @private
   */
  async _saveToSessionStorage(data = this._preferences) {
    try {
      sessionStorage.setItem('user_preferences', JSON.stringify(data));
      return true;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Error saving to sessionStorage', { error: error.message });
      return false;
    }
  }
  
  /**
   * Carrega as preferências do sessionStorage
   * @private
   */
  async _loadFromSessionStorage() {
    try {
      const data = sessionStorage.getItem('user_preferences');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Error loading from sessionStorage', { error: error.message });
      return null;
    }
  }
  
  /**
   * Limpa as preferências do sessionStorage
   * @private
   */
  async _clearSessionStorage() {
    try {
      sessionStorage.removeItem('user_preferences');
      return true;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Error clearing sessionStorage', { error: error.message });
      return false;
    }
  }
  
  /**
   * Salva as preferências como cookies
   * @param {Object} data - Dados a serem salvos
   * @private
   */
  async _saveToCookie(data = this._preferences) {
    try {
      // Implementação simplificada - em produção, usar bibliotecas como js-cookie
      // ou implementar opções como secure, httpOnly, etc.
      const cookieValue = encodeURIComponent(JSON.stringify(data));
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Expira em 1 ano
      
      document.cookie = `user_preferences=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
      return true;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Error saving to cookie', { error: error.message });
      return false;
    }
  }
  
  /**
   * Carrega as preferências dos cookies
   * @private
   */
  async _loadFromCookie() {
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'user_preferences') {
          return JSON.parse(decodeURIComponent(value));
        }
      }
      return null;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Error loading from cookie', { error: error.message });
      return null;
    }
  }
  
  /**
   * Limpa os cookies de preferências
   * @private
   */
  async _clearCookies() {
    try {
      document.cookie = 'user_preferences=; Max-Age=0; path=/; SameSite=Strict';
      return true;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Error clearing cookies', { error: error.message });
      return false;
    }
  }
  
  /**
   * Carrega as preferências do backend
   * @private
   */
  async _loadFromBackend() {
    // Implementação depende da estrutura da API
    // Por exemplo, usando apiService
    try {
      const response = await fetch('/api/users/preferences', {
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Error loading from backend', { error: error.message });
      return null;
    }
  }
  
  /**
   * Salva as preferências no backend
   * @param {Object} data - Dados a serem salvos
   * @private
   */
  async _saveToBackend(data = this._preferences) {
    // Implementação depende da estrutura da API
    // Por exemplo, usando apiService
    try {
      const response = await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this._getAuthToken()}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Error saving to backend', { error: error.message });
      return false;
    }
  }
  
  /**
   * Obtém o token de autenticação
   * @private
   */
  _getAuthToken() {
    // Implementação pode variar dependendo da estrutura da aplicação
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
  }
  
  // === API Pública ===
  
  /**
   * Obtém todas as preferências ou de uma categoria específica
   * @param {string} [category] - Categoria opcional
   * @returns {Object} Preferências
   */
  getPreferences(category) {
    if (category) {
      return this._preferences[category] || this._defaultPreferences[category] || {};
    }
    
    return this._preferences;
  }
  
  /**
   * Define as preferências para uma categoria
   * @param {string} category - Categoria
   * @param {Object} values - Valores a serem definidos
   * @param {Object} [options] - Opções adicionais
   * @returns {Promise<boolean>} true se salvo com sucesso
   */
  async setPreferences(category, values, options = {}) {
    // this._startLoading();
    
    try {
      // Validar categoria
      if (!Object.values(PREFERENCE_CATEGORIES).includes(category)) {
        throw new Error(`Invalid preference category: ${category}`);
      }
      
      // Validar valores de acordo com a categoria
      this._validatePreferences(category, values);
      
      // Mesclar com valores existentes
      const currentValues = this._preferences[category] || {};
      const newValues = { ...currentValues, ...values };
      
      // Atualizar em memória
      this._preferences[category] = newValues;
      
      // Definir estratégias de persistência
      const persistOptions = {
        localStorage: options.localStorage !== false,
        sessionStorage: !!options.sessionStorage,
        cookie: !!options.cookie,
        backend: options.backend !== false && this._isUserAuthenticated()
      };
      
      // Persistir de acordo com as opções
      const savePromises = [];
      
      if (persistOptions.localStorage) {
        savePromises.push(this._saveToLocalStorage());
      }
      
      if (persistOptions.sessionStorage) {
        savePromises.push(this._saveToSessionStorage());
      }
      
      if (persistOptions.cookie) {
        savePromises.push(this._saveToCookie());
      }
      
      if (persistOptions.backend) {
        savePromises.push(this._saveToBackend());
      }
      
      // Aguardar todas as operações de persistência
      await Promise.all(savePromises);
      if (!this._userLoading) {

      // Emitir evento de preferências atualizadas
      this._emitEvent(this.serviceName, USER_PREFS_EVENTS.PREFS_UPDATED, {
        category,
        values: newValues,
        changes: values,
        timestamp: Date.now()
      });
      
      // this._stopLoading();
    } else {
      
      // this.userService.onUserLoaded(() => {

      //   this._emitEvent(this.serviceName, USER_PREFS_EVENTS.PREFS_UPDATED, {
      //     category,
      //     values: newValues,
      //     changes: values,
      //     timestamp: Date.now()
      //   });
      // });
      // this._stopLoading();
    }
      return true;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Error setting preferences', { 
        category, 
        error: error.message 
      });
      
      // this._stopLoading();
      throw error;
    }
  }
  
  /**
   * Valida os valores das preferências de acordo com a categoria
   * @param {string} category - Categoria
   * @param {Object} values - Valores a serem validados
   * @private
   */
  _validatePreferences(category, values) {
    switch (category) {
      case PREFERENCE_CATEGORIES.THEME:
        if (values.mode && !['light', 'dark', 'system'].includes(values.mode)) {
          throw new Error(`Invalid theme mode: ${values.mode}`);
        }
        break;
        
      case PREFERENCE_CATEGORIES.COOKIES:
        // Cookies necessários sempre são true
        if (values.necessary === false) {
          throw new Error('Necessary cookies cannot be disabled');
        }
        break;
        
      // Adicionar validações para outras categorias conforme necessário
        
      default:
        // Sem validação específica para outras categorias
        break;
    }
  }
  
  /**
   * Limpa todas as preferências e redefine para os valores padrão
   * @returns {Promise<boolean>} true se limpo com sucesso
   */
  async resetAllPreferences() {
    // this._startLoading();
    
    try {
      // Restaurar para os valores padrão
      this._preferences = { ...this._defaultPreferences };
      
      // Limpar em todas as estratégias de armazenamento
      const clearPromises = Object.values(this._storageStrategies).map(strategy => {
        if (typeof strategy.clear === 'function') {
          return strategy.clear();
        }
        return Promise.resolve(true);
      });
      
      await Promise.all(clearPromises);
      
      // Salvar os valores padrão
      await this._saveToLocalStorage();
      
      // Se o usuário estiver autenticado, atualizar no backend também
      if (this._isUserAuthenticated()) {
        await this._saveToBackend();
      }
      
      // Emitir evento de preferências redefinidas
      this._emitEvent(this.serviceName, USER_PREFS_EVENTS.PREFS_RESET, {
        preferences: this._preferences,
        timestamp: Date.now()
      });
      
      // this._stopLoading();
      return true;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Error resetting preferences', { error: error.message });
      // this._stopLoading();
      return false;
    }
  }
  
  /**
   * Configura as preferências de cookies de acordo com as escolhas do usuário
   * @param {Object} cookieChoices - Escolhas de cookies
   * @returns {Promise<boolean>} true se salvo com sucesso
   */
  async setCookiePreferences(cookieChoices) {
    // Garantir que cookies necessários sejam sempre true
    const safeChoices = {
      ...cookieChoices,
      necessary: true,
      consentTimestamp: Date.now()
    };
    
    return this.setPreferences(PREFERENCE_CATEGORIES.COOKIES, safeChoices, {
      cookie: true, // Também salvar como cookie
      backend: true // Salvar no backend se o usuário estiver autenticado
    });
  }
  
  /**
   * Verifica se o usuário já forneceu consentimento para cookies
   * @returns {boolean} true se o consentimento foi dado
   */
  hasCookieConsent() {
    const cookiePrefs = this.getPreferences(PREFERENCE_CATEGORIES.COOKIES);
    return !!cookiePrefs.consentTimestamp;
  }
  
  /**
   * Obtém as preferências de cookies
   * @returns {Object} Preferências de cookies
   */
  getCookiePreferences() {
    return this.getPreferences(PREFERENCE_CATEGORIES.COOKIES);
  }
  
  /**
   * Obtém as preferências de tema
   * @returns {Object} Preferências de tema
   */
  getThemePreferences() {
    return this.getPreferences(PREFERENCE_CATEGORIES.THEME);
  }
  
  /**
   * Define as preferências de tema
   * @param {Object} themePrefs - Preferências de tema
   * @returns {Promise<boolean>} true se salvo com sucesso
   */
  async setThemePreferences(themePrefs) {
    return this.setPreferences(PREFERENCE_CATEGORIES.THEME, themePrefs);
  }
  
  /**
   * Obtém as preferências de idioma
   * @returns {Object} Preferências de idioma
   */
  getLanguagePreferences() {
    return this.getPreferences(PREFERENCE_CATEGORIES.LANGUAGE);
  }
  
  /**
   * Define as preferências de idioma
   * @param {Object} langPrefs - Preferências de idioma
   * @returns {Promise<boolean>} true se salvo com sucesso
   */
  async setLanguagePreferences(langPrefs) {
    return this.setPreferences(PREFERENCE_CATEGORIES.LANGUAGE, langPrefs);
  }
  
  /**
   * Obtém as preferências de acessibilidade
   * @returns {Object} Preferências de acessibilidade
   */
  getAccessibilityPreferences() {
    return this.getPreferences(PREFERENCE_CATEGORIES.ACCESSIBILITY);
  }
  
  /**
   * Define as preferências de acessibilidade
   * @param {Object} accessPrefs - Preferências de acessibilidade
   * @returns {Promise<boolean>} true se salvo com sucesso
   */
  async setAccessibilityPreferences(accessPrefs) {
    return this.setPreferences(PREFERENCE_CATEGORIES.ACCESSIBILITY, accessPrefs);
  }
  
  /**
   * Exporta todas as preferências do usuário
   * @returns {Object} Todas as preferências
   */
  exportPreferences() {
    return {
      preferences: JSON.parse(JSON.stringify(this._preferences)),
      exportedAt: new Date().toISOString()
    };
  }
  
  /**
   * Importa preferências do usuário
   * @param {Object} data - Dados a serem importados
   * @returns {Promise<boolean>} true se importado com sucesso
   */
  async importPreferences(data) {
    // this._startLoading();
    
    try {
      if (!data || !data.preferences) {
        throw new Error('Invalid preference data format');
      }
      
      // Validar os dados importados
      Object.keys(data.preferences).forEach(category => {
        if (this._defaultPreferences[category]) {
          this._validatePreferences(category, data.preferences[category]);
        }
      });
      
      // Atualizar em memória
      this._preferences = {
        ...this._preferences,
        ...data.preferences
      };
      
      // Persistir
      await this._saveToLocalStorage();
      
      // Se o usuário estiver autenticado, atualizar no backend também
      if (this._isUserAuthenticated()) {
        await this._saveToBackend();
      }
      
      // Emitir evento de preferências importadas
      this._emitEvent(this.serviceName, USER_PREFS_EVENTS.PREFS_IMPORTED, {
        preferences: this._preferences,
        timestamp: Date.now()
      });
      
      // this._stopLoading();
      return true;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Error importing preferences', { error: error.message });
      // this._stopLoading();
      throw error;
    }
  }
}

export { UserPreferencesService };