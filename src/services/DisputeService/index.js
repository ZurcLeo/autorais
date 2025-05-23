// src/services/DisputeService/index.js
import { BaseService, serviceLocator, serviceEventHub } from '../../core/services/BaseService';
import { DISPUTE_EVENTS } from '../../core/constants/events';
import { LOG_LEVELS } from '../../core/constants/config';

const MODULE_NAME = 'disputes';

class DisputeService extends BaseService {
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
      description: 'Gerencia disputas nas caixinhas'
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
      'Initializing disputes service specific logic'
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

  async getDisputes(caixinhaId, status = 'all') {
    this.getCurrentUser();
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        try {
          this._log('fetching disputes', { caixinhaId, status });
          
          const response = await this.apiService.get(`/api/caixinha/${caixinhaId}/disputes`, {
            params: { status }
          });
          
          const duration = performance.now() - startTime;
          this._logPerformance('getDisputes', duration, {
            caixinhaId,
            count: response.data.length
          });

          // Emitir evento de disputas obtidas
          this._emitEvent(DISPUTE_EVENTS.DISPUTES_FETCHED, {
            caixinhaId,
            disputes: response.data,
            count: response.data.length,
            status
          });

          return response.data;
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'getDisputes', duration);
          
          // Emitir evento de erro
          this._emitEvent(DISPUTE_EVENTS.FETCH_FAILURE, {
            error: error.message,
            caixinhaId
          });
          
          throw error;
        }
      },
      'getDisputes'
    );
  }

  async getDisputeById(caixinhaId, disputeId) {
    this.getCurrentUser();
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        try {
          this._log('fetching dispute details', { caixinhaId, disputeId });
          
          const response = await this.apiService.get(`/api/caixinha/${caixinhaId}/disputes/${disputeId}`);
          
          const duration = performance.now() - startTime;
          this._logPerformance('getDisputeById', duration, {
            caixinhaId,
            disputeId
          });

          // Emitir evento de detalhes da disputa obtidos
          this._emitEvent(DISPUTE_EVENTS.DISPUTE_DETAILS_FETCHED, {
            caixinhaId,
            disputeId,
            dispute: response.data
          });

          return response.data;
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'getDisputeById', duration);
          
          // Emitir evento de erro
          this._emitEvent(DISPUTE_EVENTS.FETCH_FAILURE, {
            error: error.message,
            caixinhaId,
            disputeId
          });
          
          throw error;
        }
      },
      'getDisputeById'
    );
  }

  async createDispute(caixinhaId, disputeData) {
    this.getCurrentUser();
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        try {
          this._log('creating dispute', { 
            caixinhaId, 
            type: disputeData.type,
            title: disputeData.title
          });
          
          const response = await this.apiService.post(`/api/caixinha/${caixinhaId}/disputes`, disputeData);
          
          const duration = performance.now() - startTime;
          this._logPerformance('createDispute', duration, {
            caixinhaId,
            disputeId: response.data.id
          });

          // Emitir evento de disputa criada
          this._emitEvent(DISPUTE_EVENTS.DISPUTE_CREATED, {
            caixinhaId,
            dispute: response.data
          });

          return response.data;
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'createDispute', duration);
          
          // Emitir evento de erro
          this._emitEvent(DISPUTE_EVENTS.FETCH_FAILURE, {
            error: error.message,
            caixinhaId
          });
          
          throw error;
        }
      },
      'createDispute'
    );
  }

  async voteOnDispute(caixinhaId, disputeId, voteData) {
    this.getCurrentUser();
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        try {
          this._log('voting on dispute', { 
            caixinhaId, 
            disputeId,
            vote: voteData.vote
          });
          
          const response = await this.apiService.post(
            `/api/caixinha/${caixinhaId}/disputes/${disputeId}/vote`, 
            voteData
          );
          
          const duration = performance.now() - startTime;
          this._logPerformance('voteOnDispute', duration, {
            caixinhaId,
            disputeId
          });

          // Emitir evento de voto registrado
          this._emitEvent(DISPUTE_EVENTS.DISPUTE_VOTED, {
            caixinhaId,
            disputeId,
            vote: voteData,
            result: response.data
          });

          return response.data;
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'voteOnDispute', duration);
          
          // Emitir evento de erro
          this._emitEvent(DISPUTE_EVENTS.FETCH_FAILURE, {
            error: error.message,
            caixinhaId,
            disputeId
          });
          
          throw error;
        }
      },
      'voteOnDispute'
    );
  }

  async cancelDispute(caixinhaId, disputeId, reason) {
    this.getCurrentUser();
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        try {
          this._log('canceling dispute', { 
            caixinhaId, 
            disputeId,
            reason
          });
          
          const response = await this.apiService.post(
            `/api/caixinha/${caixinhaId}/disputes/${disputeId}/cancel`,
            { reason }
          );
          
          const duration = performance.now() - startTime;
          this._logPerformance('cancelDispute', duration, {
            caixinhaId,
            disputeId
          });

          // Emitir evento de disputa cancelada
          this._emitEvent(DISPUTE_EVENTS.DISPUTE_CANCELED, {
            caixinhaId,
            disputeId,
            reason,
            dispute: response.data
          });

          return response.data;
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'cancelDispute', duration);
          
          // Emitir evento de erro
          this._emitEvent(DISPUTE_EVENTS.FETCH_FAILURE, {
            error: error.message,
            caixinhaId,
            disputeId
          });
          
          throw error;
        }
      },
      'cancelDispute'
    );
  }

  async checkDisputeRequirement(caixinhaId, changeType) {
    this.getCurrentUser();
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        try {
          this._log('checking dispute requirement', { 
            caixinhaId, 
            changeType
          });
          
          const response = await this.apiService.get(
            `/api/caixinha/${caixinhaId}/disputes/check`,
            { params: { changeType } }
          );
          
          const duration = performance.now() - startTime;
          this._logPerformance('checkDisputeRequirement', duration, {
            caixinhaId,
            changeType
          });

          return response.data;
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'checkDisputeRequirement', duration);
          throw error;
        }
      },
      'checkDisputeRequirement'
    );
  }

  async createRuleChangeDispute(caixinhaId, currentRules, proposedRules, title, description) {
    this.getCurrentUser();
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        try {
          this._log('creating rule change dispute', { 
            caixinhaId, 
            title
          });
          
          const response = await this.apiService.post(
            `/api/caixinha/${caixinhaId}/disputes/rule-change`,
            {
              currentRules,
              proposedRules,
              title,
              description
            }
          );
          
          const duration = performance.now() - startTime;
          this._logPerformance('createRuleChangeDispute', duration, {
            caixinhaId,
            disputeId: response.data.id
          });

          // Emitir evento de disputa criada
          this._emitEvent(DISPUTE_EVENTS.DISPUTE_CREATED, {
            caixinhaId,
            dispute: response.data,
            type: 'RULE_CHANGE'
          });

          return response.data;
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'createRuleChangeDispute', duration);
          
          // Emitir evento de erro
          this._emitEvent(DISPUTE_EVENTS.FETCH_FAILURE, {
            error: error.message,
            caixinhaId
          });
          
          throw error;
        }
      },
      'createRuleChangeDispute'
    );
  }
}

export { DisputeService };