// src/services/BankingService/index.js
import { BaseService, serviceLocator, serviceEventHub } from '../../core/services/BaseService';
import { LOG_LEVELS } from '../../core/constants/config';
import { coreLogger } from '../../core/logging';
import { BANKING_ACTIONS, SERVICE_ACTIONS } from '../../core/constants/actions';
import { BANKING_EVENTS } from '../../core/constants/events';
import { 
  generateDeviceId, 
  waitForMercadoPagoSDK, 
  initializeMercadoPago,
  createCardToken,
  validateCardData 
} from '../../utils/mercadoPagoUtils';
import { validatePaymentData, createStandardPaymentData, logPaymentDataSafely } from '../../utils/mercadoPagoValidation';

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

    // Initialize services as null - will be set in initialize()
    this.apiService = null;
    this.authService = null;
  }

  async initialize() {
    if (this.isInitialized) return this;

    this._log(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'BankingService initializing...', { timestamp: Date.now() });

    try {
      // Get services during initialization instead of constructor
      this.apiService = serviceLocator.get('apiService');
      this.authService = serviceLocator.get('auth');
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
    // Ensure service is initialized
    if (!this.isInitialized) {
      await this.initialize();
    }
    
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
    // Ensure service is initialized
    if (!this.isInitialized) {
      await this.initialize();
    }
    
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

      console.log('🔍 Banking Service Raw Response:', {
        hasResponseData: !!response.data,
        responseDataKeys: response.data ? Object.keys(response.data) : [],
        hasHistory: !!response.data?.history,
        historyLength: response.data?.history?.length || 0,
        status: response.data?.status
      });

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

  async generateValidationPix(accountId, paymentData = {}) {
    if (!accountId) {
      throw new Error('Account ID is required');
    }

    this._emitEvent(BANKING_EVENTS.VALIDATE_START);

    try {
      // Get current user data for validation
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Wait for MercadoPago SDK and generate device ID
      this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Waiting for MercadoPago SDK...');
      await waitForMercadoPagoSDK(3000); // Wait up to 3 seconds for SDK
      
      this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Generating device ID...');
      const deviceId = await generateDeviceId();
      
      if (!deviceId) {
        throw new Error('Failed to generate device ID - required for MercadoPago integration');
      }

      // Create user info object with fallbacks
      const userInfo = {
        email: paymentData.email || currentUser.email,
        firstName: paymentData.firstName || currentUser.displayName?.split(' ')[0] || 'Usuario',
        lastName: paymentData.lastName || currentUser.displayName?.split(' ').slice(1).join(' ') || 'ElosCloud',
        identificationType: paymentData.identificationType || "CPF",
        identificationNumber: paymentData.identificationNumber || ""
      };

      // Create standardized payment data following MercadoPago recommendations
      const completePaymentData = createStandardPaymentData(
        userInfo,
        deviceId,
        paymentData.amount || 1.00,
        accountId
      );

      // Validate payment data before sending
      const validation = validatePaymentData(completePaymentData);
      
      if (!validation.isValid) {
        this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Payment data validation failed', { errors: validation.errors });
        throw new Error(`Payment data validation failed: ${validation.errors.join(', ')}`);
      }

      if (validation.warnings.length > 0) {
        this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Payment data validation warnings', { warnings: validation.warnings });
      }

      // Log payment data safely (without sensitive info)
      logPaymentDataSafely(completePaymentData);

      this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Payment data validation successful', validation.summary);

      const response = await this._executeWithRetry(async () => {
        return await this.apiService.post(`/api/banking/${accountId}/generate-validation-pix`, completePaymentData);
      }, 'generateValidationPix');

      const result = response.data;
      
      // Emitir evento
      this._emitEvent(BANKING_EVENTS.PIX_GENERATED, { 
        accountId,
        pixData: result.pixData,
        paymentData: completePaymentData
      });
      
      return result;
    } catch (error) {
      this._logError(error, 'generateValidationPix');
      this._emitEvent(BANKING_EVENTS.VALIDATE_FAILURE, { error: error.message });
      throw error;
    }
  }

  async validateBankAccount(transactionData) {
    if (!transactionData || !transactionData.accountId || !transactionData.transactionId) {
      throw new Error('Invalid transaction data: accountId and transactionId are required');
    }

    const accountId = transactionData.accountId;
    this._emitEvent(BANKING_EVENTS.VALIDATE_START);

    try {
      const response = await this._executeWithRetry(async () => {
        return await this.apiService.post(`/api/banking/${accountId}/validate`, {
          accountId: transactionData.accountId,
          transactionId: transactionData.transactionId
        });
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

  async processCardPayment(paymentData) {
    if (!paymentData || !paymentData.token) {
      throw new Error('Payment data or card token is required');
    }

    // Ensure service is initialized
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Get current user
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Attempt to process card payment without authenticated user');
      throw new Error('User not authenticated');
    }

    this._emitEvent(BANKING_EVENTS.PAYMENT_START);

    try {
      this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Processing card payment with MercadoPago token');

      // Validate that we have required payment data
      if (!paymentData.amount || paymentData.amount <= 0) {
        throw new Error('Invalid payment amount');
      }

      if (!paymentData.payer || !paymentData.payer.email) {
        throw new Error('Payer information is required');
      }

      // Prepare payment data for backend
      const completePaymentData = {
        // Token and device ID from MercadoPago SDK V2
        token: paymentData.token,
        device_id: paymentData.device_id, // Automatically included by SDK V2
        
        // Payment details
        amount: paymentData.amount,
        currency: paymentData.currency || 'BRL',
        description: paymentData.description || 'Pagamento com cartão',
        
        // Payer information
        payer: {
          email: paymentData.payer.email,
          identification: paymentData.payer.identification
        },
        
        // Additional payment options
        installments: paymentData.installments || 1,
        payment_method_id: paymentData.payment_method_id,
        issuer_id: paymentData.issuer_id,
        
        // Metadata for tracking
        metadata: {
          user_id: currentUser.uid,
          payment_type: 'credit_card',
          sdk_version: 'v2',
          tokenization_method: 'mercadopago_sdk',
          ...paymentData.metadata
        }
      };

      // Log payment data safely (without sensitive info)
      this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Card payment data prepared', {
        hasToken: !!completePaymentData.token,
        hasDeviceId: !!completePaymentData.device_id,
        amount: completePaymentData.amount,
        installments: completePaymentData.installments,
        paymentMethodId: completePaymentData.payment_method_id
      });

      // Send payment to backend for processing
      const response = await this._executeWithRetry(async () => {
        return await this.apiService.post('/api/banking/payments/card', completePaymentData);
      }, 'processCardPayment');

      const result = response.data;

      // Emit success event
      this._emitEvent(BANKING_EVENTS.PAYMENT_SUCCESS, {
        paymentId: result.id,
        amount: completePaymentData.amount,
        status: result.status
      });

      this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Card payment processed successfully', {
        paymentId: result.id,
        status: result.status
      });

      return result;

    } catch (error) {
      this._logError(error, 'processCardPayment');
      this._emitEvent(BANKING_EVENTS.PAYMENT_FAILURE, { error: error.message });
      throw error;
    }
  }

  async tokenizeCard(cardData) {
    if (!cardData) {
      throw new Error('Card data is required');
    }

    try {
      this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Starting card tokenization with MercadoPago SDK V2');

      // Wait for MercadoPago SDK
      await waitForMercadoPagoSDK(5000);

      // Initialize MercadoPago if needed
      await initializeMercadoPago();

      // Validate card data
      const validation = validateCardData(cardData);
      if (!validation.isValid) {
        throw new Error(`Card validation failed: ${validation.errors.join(', ')}`);
      }

      // Create card token using MercadoPago SDK V2
      const token = await createCardToken(cardData);

      this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Card tokenized successfully', {
        tokenId: token.id,
        hasDeviceId: !!token.device_id,
        cardBrand: validation.cardBrand,
        paymentMethodId: token.payment_method_id
      });

      return token;

    } catch (error) {
      this._logError(error, 'tokenizeCard');
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