// src/services/BankingService/index.js
import { BaseService, serviceLocator, serviceEventHub } from '../../core/services/BaseService';
import { LOG_LEVELS } from '../../core/constants/config';
import { coreLogger } from '../../core/logging';
import { BANKING_ACTIONS, SERVICE_ACTIONS } from '../../core/constants/actions';
import { BANKING_EVENTS } from '../../core/constants/events';

const MODULE_NAME = 'banking';

class BankingService extends BaseService {
  constructor() {
    super(MODULE_NAME);
    this.instanceId = Math.random().toString(36).substring(2, 10);

    this._currentUser = null;
    this._bankingCache = new Map();
    this._isInitialized = false;

    this._metadata = {
      name: MODULE_NAME,
      phase: 'FEATURES',              // Fase de inicialização 
      criticalPath: false,            // Indica se é um serviço crítico para a aplicação
      dependencies: ['auth', 'users'], // Serviços que devem estar prontos antes deste
      category: 'finances',           // Categoria do serviço
      description: 'Gerencia informações bancárias e transações.' // Descrição
    };

    this._log(`📊 Nova instância de ${MODULE_NAME} criada, instanceId: ${this.instanceId}`);

    this.apiService = serviceLocator.get('apiService');
    this.authService = serviceLocator.get('auth');
  }

  async initialize() {
    if (this.isInitialized) return this;

    this._log(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'BankingService initializing...', { timestamp: Date.now() });

    try {
      this._log(MODULE_NAME, LOG_LEVELS.INITIALIZATION, 'Inicializando serviço bancário');
      
      // Setup completo, marcar como inicializado
      this._isInitialized = true;
      
      this._emitEvent(SERVICE_ACTIONS.SERVICE_READY, {
        serviceName: MODULE_NAME,
        timestamp: new Date().toISOString()
      });

      return this;
    } catch (error) {
      this._logError(error, 'initialize');
      return true; // Mantendo o comportamento de retornar true em caso de erro
    }
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  async healthCheck() {
    try {
      // Tentar verificar a saúde via API
      const healthResponse = await this._executeWithRetry(
        async () => {
          return await this.apiService.get(`/api/health/service/${this.serviceName}`);
        },
        'healthCheck'
      );

      return { status: healthResponse.data.status, timestamp: Date.now() };
    } catch (error) {
      // Implementar fallback se o endpoint de saúde estiver indisponível
      this._log(
        MODULE_NAME,
        LOG_LEVELS.WARNING,
        'Health check endpoint unavailable, proceeding with degraded mode',
        { error: error.message }
      );

      // Ainda retornar healthy para não bloquear outras funcionalidades
      return {
        status: 'degraded',
        details: 'Operating in offline mode',
        timestamp: Date.now(),
        error: error.message
      };
    }
  }

  async getBankingInfo(caixinhaId) {
    // Obter o usuário atual de forma segura
    const currentUser = this.getCurrentUser();

    // Verificar se o usuário está autenticado
    if (!currentUser) {
      this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Tentativa de obter informações bancárias sem usuário autenticado');
      throw new Error('User not authenticated');
    }

    this._emitEvent(BANKING_EVENTS.FETCH_START);

    try {
      const response = await this._executeWithRetry(async () => {
        return await this.apiService.get(`/api/banking/${caixinhaId}`);
      }, 'getBankingInfo');

      const bankingInfo = response.data;
      
      // Armazenar em cache
      this._cacheBankingInfo(caixinhaId, bankingInfo);
      
      this._emitEvent(BANKING_EVENTS.BANKING_INFO_FETCHED, { bankingInfo });
      return bankingInfo;
    } catch (error) {
      this._logError(error, 'getBankingInfo');
      this._emitEvent(BANKING_EVENTS.FETCH_FAILURE, { error: error.message });
      throw error;
    }
  }

  async getBankingHistory(caixinhaId) {
    // Verificar se o ID da caixinha foi fornecido
    if (!caixinhaId) {
      this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Tentativa de obter histórico bancário sem ID da caixinha');
      throw new Error('Caixinha ID not provided');
    }
    
    this._emitEvent(BANKING_EVENTS.FETCH_START);

    try {
      const response = await this._executeWithRetry(async () => {
        return await this.apiService.get(`/api/banking/${caixinhaId}/history`);
      }, 'getBankingHistory');

      const history = response.data.history || [];
      
      // Emitir evento
      this._emitEvent(BANKING_EVENTS.BANKING_HISTORY_FETCHED, { 
        caixinhaId,
        history 
      });
      
      return { history };
    } catch (error) {
      this._logError(error, 'getBankingHistory');
      this._emitEvent(BANKING_EVENTS.FETCH_FAILURE, { error: error.message });
      throw error;
    }
  }

  async registerBankAccount(caixinhaId, accountData) {
    // Obter o usuário atual de forma segura
    const currentUser = this.getCurrentUser();

    // Verificar se o usuário está autenticado
    if (!currentUser) {
      this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Tentativa de registrar conta bancária sem usuário autenticado');
      throw new Error('User not authenticated');
    }

    if (!caixinhaId || !accountData) {
      throw new Error('Invalid account data or caixinha ID');
    }

    this._emitEvent(BANKING_EVENTS.REGISTER_START);

    try {
      const response = await this._executeWithRetry(async () => {
        return await this.apiService.post(`/api/banking/${caixinhaId}/register`, accountData);
      }, 'registerBankAccount');

      const result = response.data;
      
      // Emitir evento
      this._emitEvent(BANKING_EVENTS.ACCOUNT_REGISTERED, { 
        caixinhaId,
        accountData: result 
      });
      
      // Invalidar cache
      this._invalidateBankingInfo(caixinhaId);
      
      return result;
    } catch (error) {
      this._logError(error, 'registerBankAccount');
      this._emitEvent(BANKING_EVENTS.REGISTER_FAILURE, { error: error.message });
      throw error;
    }
  }

  async validateBankAccount(transactionData) {
    if (!transactionData || !transactionData.accountId) {
      throw new Error('Invalid transaction data');
    }

    const accountId = transactionData.accountId;
    this._emitEvent(BANKING_EVENTS.VALIDATE_START);

    try {
      const response = await this._executeWithRetry(async () => {
        return await this.apiService.post(`/api/banking/${accountId}/validate`, transactionData);
      }, 'validateBankAccount');

      const result = response.data;
      
      // Emitir evento
      this._emitEvent(BANKING_EVENTS.ACCOUNT_VALIDATED, { 
        accountId,
        result 
      });
      
      // Invalidar cache se o ID da caixinha estiver disponível
      if (transactionData.caixinhaId) {
        this._invalidateBankingInfo(transactionData.caixinhaId);
        this._invalidateBankingHistory(transactionData.caixinhaId);
      }
      
      return result;
    } catch (error) {
      this._logError(error, 'validateBankAccount');
      this._emitEvent(BANKING_EVENTS.VALIDATE_FAILURE, { error: error.message });
      throw error;
    }
  }

  async transferFunds(transferData) {
    if (!transferData || !transferData.caixinhaId || !transferData.amount) {
      throw new Error('Invalid transfer data');
    }

    this._emitEvent(BANKING_EVENTS.TRANSFER_START);

    try {
      const response = await this._executeWithRetry(async () => {
        return await this.apiService.post(`/api/banking/transfer`, transferData);
      }, 'transferFunds');

      const result = response.data;
      
      // Emitir evento
      this._emitEvent(BANKING_EVENTS.FUNDS_TRANSFERRED, { 
        caixinhaId: transferData.caixinhaId,
        result 
      });
      
      // Invalidar cache
      this._invalidateBankingInfo(transferData.caixinhaId);
      this._invalidateBankingHistory(transferData.caixinhaId);
      
      return result;
    } catch (error) {
      this._logError(error, 'transferFunds');
      this._emitEvent(BANKING_EVENTS.TRANSFER_FAILURE, { error: error.message });
      throw error;
    }
  }

  async cancelTransaction(transactionId) {
    if (!transactionId) {
      throw new Error('Invalid transaction ID');
    }

    this._emitEvent(BANKING_EVENTS.CANCEL_START);

    try {
      const response = await this._executeWithRetry(async () => {
        return await this.apiService.post(`/api/banking/transaction/${transactionId}/cancel`);
      }, 'cancelTransaction');

      const result = response.data;
      
      // Emitir evento
      this._emitEvent(BANKING_EVENTS.TRANSACTION_CANCELED, { 
        transactionId,
        result 
      });
      
      // Se o resultado incluir o ID da caixinha, invalidar o cache
      if (result.caixinhaId) {
        this._invalidateBankingInfo(result.caixinhaId);
        this._invalidateBankingHistory(result.caixinhaId);
      }
      
      return result;
    } catch (error) {
      this._logError(error, 'cancelTransaction');
      this._emitEvent(BANKING_EVENTS.CANCEL_FAILURE, { error: error.message });
      throw error;
    }
  }

  async getTransactionDetails(transactionId) {
    if (!transactionId) {
      throw new Error('Invalid transaction ID');
    }

    try {
      const response = await this._executeWithRetry(async () => {
        return await this.apiService.get(`/api/banking/transaction/${transactionId}`);
      }, 'getTransactionDetails');

      const details = response.data;
      return details;
    } catch (error) {
      this._logError(error, 'getTransactionDetails');
      throw error;
    }
  }

  // Métodos auxiliares privados
  _cacheBankingInfo(caixinhaId, bankingInfo) {
    const cacheKey = `banking:info:${caixinhaId}`;
    this._bankingCache.set(cacheKey, {
      data: bankingInfo,
      timestamp: Date.now()
    });
  }

  _cacheBankingHistory(caixinhaId, history) {
    const cacheKey = `banking:history:${caixinhaId}`;
    this._bankingCache.set(cacheKey, {
      data: history,
      timestamp: Date.now()
    });
  }

  _invalidateBankingInfo(caixinhaId) {
    const cacheKey = `banking:info:${caixinhaId}`;
    this._bankingCache.delete(cacheKey);
  }

  _invalidateBankingHistory(caixinhaId) {
    const cacheKey = `banking:history:${caixinhaId}`;
    this._bankingCache.delete(cacheKey);
  }

  _clearCache() {
    this._bankingCache.clear();
  }
}

export { BankingService };