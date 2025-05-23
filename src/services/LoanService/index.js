// src/services/LoanService/index.js
import { BaseService, serviceLocator, serviceEventHub } from '../../core/services/BaseService';
import { LOAN_EVENTS } from '../../core/constants/events';
import { LOG_LEVELS } from '../../core/constants/config';

const MODULE_NAME = 'loans';

class LoanService extends BaseService {
  constructor() {
    super(MODULE_NAME);
    this.instanceId = Math.random().toString(36).substring(2, 10);
    this._currentUser = null;

    this._metadata = {
      name: MODULE_NAME,
      phase: 'FEATURES',
      criticalPath: false,
      dependencies: ['auth', 'caixinhas'],
      category: 'finances',
      description: 'Gerencia empréstimos nas caixinhas'
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

    this._log(LOG_LEVELS.LIFECYCLE, 
      MODULE_NAME,
      this.instanceId,
      'Initializing loans service specific logic'
    );

    this._isInitialized = true;
    this.getCurrentUser();
    return this;
  }

  async healthCheck() {
    try {
      const healthResponse = await this._executeWithRetry(
        async () => {
          return await this.apiService.get(`/api/health/service/${MODULE_NAME}`);
        },
        'healthCheck'
      );

      return { status: healthResponse.data.status, timestamp: Date.now() };
    } catch (error) {
      this._log('warning', 'Health check endpoint unavailable, proceeding with degraded mode');
      
      return { 
        status: 'degraded', 
        details: 'Operating in offline mode',
        timestamp: Date.now() 
      };
    }
  }

  async shutdown() {
    this._log('shutting down', { timestamp: Date.now() });
    this._isInitialized = false;
    return true;
  }

  async getLoans(caixinhaId) {
    this.getCurrentUser();
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        try {
          this._log('fetching loans', { caixinhaId });
          
          const response = await this.apiService.get(`/api/caixinha/${caixinhaId}/emprestimos`);
          
          const duration = performance.now() - startTime;
          this._logPerformance('getLoans', duration, {
            caixinhaId,
            count: response.data.length
          });

          // Emitir evento de empréstimos obtidos
          this._emitEvent(LOAN_EVENTS.LOANS_FETCHED, {
            caixinhaId,
            loans: response.data,
            count: response.data.length
          });

          return response.data;
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'getLoans', duration);
          
          // Emitir evento de erro
          this._emitEvent(LOAN_EVENTS.FETCH_FAILURE, {
            error: error.message,
            caixinhaId
          });
          
          throw error;
        }
      },
      'getLoans'
    );
  }

  async getLoanById(caixinhaId, loanId) {
    this.getCurrentUser();
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        try {
          this._log('fetching loan details', { caixinhaId, loanId });
          
          const response = await this.apiService.get(`/api/caixinha/${caixinhaId}/emprestimos/${loanId}`);
          
          const duration = performance.now() - startTime;
          this._logPerformance('getLoanById', duration, {
            caixinhaId,
            loanId
          });

          // Emitir evento de detalhes do empréstimo obtidos
          this._emitEvent(LOAN_EVENTS.LOAN_DETAILS_FETCHED, {
            caixinhaId,
            loanId,
            loan: response.data
          });

          return response.data;
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'getLoanById', duration);
          
          // Emitir evento de erro
          this._emitEvent(LOAN_EVENTS.FETCH_FAILURE, {
            error: error.message,
            caixinhaId,
            loanId
          });
          
          throw error;
        }
      },
      'getLoanById'
    );
  }

  async requestLoan(caixinhaId, loanData) {
    this.getCurrentUser();
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        try {
          this._log('requesting loan', { 
            caixinhaId, 
            userId: loanData.userId,
            valor: loanData.valor
          });
          
          const response = await this.apiService.post(`/api/caixinha/${caixinhaId}/emprestimos`, loanData);
          
          const duration = performance.now() - startTime;
          this._logPerformance('requestLoan', duration, {
            caixinhaId,
            loanId: response.data.id
          });

          // Emitir evento de empréstimo criado
          this._emitEvent(LOAN_EVENTS.LOAN_CREATED, {
            caixinhaId,
            loan: response.data,
            requiresDispute: response.data.requiresDispute
          });

          return response.data;
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'requestLoan', duration);
          
          // Emitir evento de erro
          this._emitEvent(LOAN_EVENTS.FETCH_FAILURE, {
            error: error.message,
            caixinhaId
          });
          
          throw error;
        }
      },
      'requestLoan'
    );
  }

  async makePayment(caixinhaId, loanId, paymentData) {
    this.getCurrentUser();
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        try {
          this._log('making loan payment', { 
            caixinhaId, 
            loanId,
            valor: paymentData.valor
          });
          
          const response = await this.apiService.post(
            `/api/caixinha/${caixinhaId}/emprestimos/${loanId}/pagamento`, 
            paymentData
          );
          
          const duration = performance.now() - startTime;
          this._logPerformance('makePayment', duration, {
            caixinhaId,
            loanId
          });

          // Emitir evento de pagamento realizado
          this._emitEvent(LOAN_EVENTS.LOAN_PAYMENT_MADE, {
            caixinhaId,
            loanId,
            payment: response.data
          });

          return response.data;
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'makePayment', duration);
          
          // Emitir evento de erro
          this._emitEvent(LOAN_EVENTS.FETCH_FAILURE, {
            error: error.message,
            caixinhaId,
            loanId
          });
          
          throw error;
        }
      },
      'makePayment'
    );
  }

  async approveLoan(caixinhaId, loanId) {
    this.getCurrentUser();
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        try {
          this._log('approving loan', { 
            caixinhaId, 
            loanId
          });
          
          const response = await this.apiService.post(
            `/api/caixinha/${caixinhaId}/emprestimos/${loanId}/aprovar`
          );
          
          const duration = performance.now() - startTime;
          this._logPerformance('approveLoan', duration, {
            caixinhaId,
            loanId
          });

          // Emitir evento de empréstimo aprovado
          this._emitEvent(LOAN_EVENTS.LOAN_APPROVED, {
            caixinhaId,
            loanId,
            loan: response.data
          });

          return response.data;
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'approveLoan', duration);
          
          // Emitir evento de erro
          this._emitEvent(LOAN_EVENTS.FETCH_FAILURE, {
            error: error.message,
            caixinhaId,
            loanId
          });
          
          throw error;
        }
      },
      'approveLoan'
    );
  }

  async rejectLoan(caixinhaId, loanId, reason) {
    this.getCurrentUser();
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        try {
          this._log('rejecting loan', { 
            caixinhaId, 
            loanId,
            reason
          });
          
          const response = await this.apiService.post(
            `/api/caixinha/${caixinhaId}/emprestimos/${loanId}/rejeitar`,
            { reason }
          );
          
          const duration = performance.now() - startTime;
          this._logPerformance('rejectLoan', duration, {
            caixinhaId,
            loanId
          });

          // Emitir evento de empréstimo rejeitado
          this._emitEvent(LOAN_EVENTS.LOAN_REJECTED, {
            caixinhaId,
            loanId,
            reason,
            loan: response.data
          });

          return response.data;
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'rejectLoan', duration);
          
          // Emitir evento de erro
          this._emitEvent(LOAN_EVENTS.FETCH_FAILURE, {
            error: error.message,
            caixinhaId,
            loanId
          });
          
          throw error;
        }
      },
      'rejectLoan'
    );
  }
}

export { LoanService };