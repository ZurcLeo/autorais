// src/core/services/BaseService.js
import { SERVICE_METADATA } from '../../reducers/metadata/metadataReducer';
import { coreLogger } from '../logging';
import { retryManager } from '../resilience';
import { serviceInitializer } from '../initialization';

export class BaseService {
    constructor(serviceName) {

        if (!serviceName) {
            throw new Error('Service name is required');
        }

        this._serviceName = serviceName;
        this._metadata = SERVICE_METADATA[serviceName];
        this._isInitialized = false;
        this._healthCheckInterval = null;
        
        if (!this._metadata) {
            throw new Error(`No metadata found for service: ${serviceName}`);
        }

        this._validateImplementation();
    }

    // API Pública
    async start() {
        if (this._isInitialized) {
            return;
        }

        const startTime = performance.now();
        
        try {
            await this._validateDependencies();
            await this._initializeWithRetry();
            
            const duration = performance.now() - startTime;
            this._isInitialized = true;
            
            this._startHealthCheck();
            this._log('initialized', { duration });
            
            return true;
        } catch (error) {
            this._logError(error, 'initialization');
            throw error;
        }
    }

    async stop() {
        if (!this._isInitialized) {
            return;
        }

        try {
            this._stopHealthCheck();
            await this.shutdown();
            this._isInitialized = false;
            this._log('stopped');
        } catch (error) {
            this._logError(error, 'shutdown');
            throw error;
        }
    }

    // Métodos que devem ser implementados pelos serviços
    async initialize() {
        throw new Error('initialize() must be implemented');
    }

    async shutdown() {
        // Opcional - implementação padrão vazia
    }

    async healthCheck() {
        throw new Error('healthCheck() must be implemented');
    }

    // Métodos protegidos para uso dos serviços filhos
    async _executeWithRetry(operation, context) {
        console.log(`[BaseService] Starting retry for ${this._serviceName}:${context}`);
        return retryManager.retryWithBackoff(
            this._serviceName,
            async () => {
                const startTime = performance.now();
                try {
                    console.log(`[BaseService] Executing operation for ${this._serviceName}:${context}`);
                    const result = await operation();
                    console.log(`[BaseService] Operation completed for ${this._serviceName}:${context}`);
                    return result;
                } catch (error) {
                    console.error(`[BaseService] Operation failed for ${this._serviceName}:${context}:`, error);
                    throw error;
                }
            }
        );
    }

    // Métodos privados
    async _initializeWithRetry() {
        return this._executeWithRetry(
            () => this.initialize(),
            'initialization'
        );
    }

    async _validateDependencies() {
        for (const dep of this._metadata.dependencies || []) {
            if (!serviceInitializer.isServiceReady(dep)) {
                throw new Error(`Dependency not ready: ${dep}`);
            }
        }
    }

    _validateImplementation() {
        const requiredMethods = ['initialize', 'healthCheck'];
        
        requiredMethods.forEach(method => {
            if (typeof this[method] !== 'function') {
                throw new Error(
                    `Service ${this._serviceName} must implement ${method}()`
                );
            }
        });
    }

    _startHealthCheck() {
        if (this._healthCheckInterval) {
            return;
        }

        const interval = this._metadata.healthCheckInterval || 30000;
        
        this._healthCheckInterval = setInterval(async () => {
            try {
                await this._executeWithRetry(
                    () => this.healthCheck(),
                    'healthCheck'
                );
            } catch (error) {
                this._logError(error, 'healthCheck');
            }
        }, interval);
    }

    _stopHealthCheck() {
        if (this._healthCheckInterval) {
            clearInterval(this._healthCheckInterval);
            this._healthCheckInterval = null;
        }
    }

    // Logging interno
    _log(state, metadata = {}) {
        coreLogger.logServiceState(this._serviceName, state, metadata);
    }

    _logError(error, context, duration = null) {
        coreLogger.logServiceError(this._serviceName, error, {
            context,
            duration,
            critical: this._metadata.criticalPath
        });
    }

    _logPerformance(operation, duration, metadata = {}) {
        coreLogger.logServicePerformance(
            this._serviceName,
            operation,
            duration,
            metadata
        );
    }

    // Getters públicos
    get isInitialized() {
        return this._isInitialized;
    }

    get metadata() {
        return this._metadata;
    }

    get serviceName() {
        return this._serviceName;
    }
}