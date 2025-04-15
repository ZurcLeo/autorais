// src/core/resilience/RetryManager.js
import { LOG_LEVELS } from '../constants/config';
import { SERVICE_METADATA } from '../../reducers/metadata/metadataReducer';
import { coreLogger } from '../logging/CoreLogger';
import { CircuitState, ResilienceError } from './../constants/config';
import { ResilienceConfig } from './ResilienceConfig';

class RetryManager {
    static instance = null;

    static getInstance() {
        if (!RetryManager.instance) {
            RetryManager.instance = new RetryManager();
        }
        return RetryManager.instance;
    }

    constructor() {
        if (RetryManager.instance) {
            return RetryManager.instance;
        }

        // Mapas para armazenar estado dos serviços
        this.retryAttempts = new Map();
        this.circuitStates = new Map();
        this.serviceStartTimes = new Map();
        this.initializationAttempts = new Map();
        this.timeWindowAttempts = new Map();
        this.serviceSuccessCount = new Map();
        this.serviceTotalAttempts = new Map();
        this.serviceLastAttemptTime = new Map();

        // Referência para os metadados de serviço
        this.serviceMetadata = SERVICE_METADATA;

        // Configurações de resiliência
        const env = process.env.NODE_ENV || 'development';
        const envConfig = ResilienceConfig.environments[env] || ResilienceConfig.environments.development;

        // Configurações do retry
        this.criticalServiceMaxRetries = envConfig.retry.maxRetries.critical;
        this.normalServiceMaxRetries = envConfig.retry.maxRetries.normal;
        this.baseDelay = ResilienceConfig.retry.baseDelay;
        this.maxDelay = ResilienceConfig.retry.maxDelay;
        this.backoffMultiplier = ResilienceConfig.retry.backoffMultiplier;
        this.jitter = ResilienceConfig.retry.jitter || 0.1;

        // Configurações do circuit breaker
        this.failureThreshold = envConfig.circuitBreaker.failureThreshold;
        this.cooldownPeriod = envConfig.circuitBreaker.cooldownPeriod;
        this.halfOpenTimeout = envConfig.circuitBreaker.halfOpenTimeout;
        this.minimumRequests = envConfig.circuitBreaker.minimumRequests;
        this.successThreshold = envConfig.circuitBreaker.successThreshold;

        // Configurações de detecção de loops
        this.absoluteTimeLimit = 30000; // 30 segundos máximo para inicialização
        this.rapidInitThreshold = 1000; // 1 segundo entre tentativas é considerado rápido demais
        this.maxRapidAttempts = 3; // 3 tentativas rápidas são consideradas um loop

        // Métricas
        this.metrics = {
            retryAttempts: 0,
            successfulRetries: 0,
            failedRetries: 0,
            totalOperations: 0,
            circuitBreaks: 0,

            recordRetryAttempt: (serviceName, attempt, duration) => {
                this.metrics.retryAttempts++;
                this.serviceTotalAttempts.set(
                    serviceName,
                    (this.serviceTotalAttempts.get(serviceName) || 0) + 1
                );
                this.serviceLastAttemptTime.set(serviceName, Date.now());

                coreLogger.logServicePerformance('RetryManager', 'retry-attempt', duration, {
                    service: serviceName,
                    attempt,
                    timestamp: new Date().toISOString()
                });
            },

            recordSuccess: (serviceName) => {
                this.metrics.successfulRetries++;
                this.metrics.totalOperations++;
                this.serviceSuccessCount.set(
                    serviceName,
                    (this.serviceSuccessCount.get(serviceName) || 0) + 1
                );
            },

            recordFailure: (serviceName, error) => {
                this.metrics.failedRetries++;
                this.metrics.totalOperations++;

                if (error.code === ResilienceError.CIRCUIT_OPEN) {
                    this.metrics.circuitBreaks++;
                }
            },

            getMetrics: () => {
                return {
                    retryAttempts: this.metrics.retryAttempts,
                    successfulRetries: this.metrics.successfulRetries,
                    failedRetries: this.metrics.failedRetries,
                    totalOperations: this.metrics.totalOperations,
                    circuitBreaks: this.metrics.circuitBreaks,
                    successRate: this.metrics.totalOperations > 0
                        ? (this.metrics.successfulRetries / this.metrics.totalOperations) * 100
                        : 0
                };
            }
        };

        coreLogger.log('RetryManager initialized', LOG_LEVELS.INITIALIZATION, {
            env,
            criticalRetries: this.criticalServiceMaxRetries,
            normalRetries: this.normalServiceMaxRetries,
            baseDelay: this.baseDelay,
            maxDelay: this.maxDelay
        });

        // Registro da instância
        RetryManager.instance = this;

        // Implementação do Garbage Collection - Executar a cada 5 minutos (300000 ms)
        setInterval(() => this.garbageCollection(), 300000);
    }

    /**
     * Garbage Collection para limpar tentativas antigas e evitar leak de memória
     */
    garbageCollection() {
        const now = Date.now();
        const GC_THRESHOLD = 3600000; // 1 hora em milissegundos

        for (const serviceName of this.retryAttempts.keys()) {
            const circuitState = this.circuitStates.get(serviceName);
            const lastAttemptTime = this.serviceLastAttemptTime.get(serviceName);

            if (circuitState === CircuitState.OPEN && lastAttemptTime) {
                if ((now - lastAttemptTime) > GC_THRESHOLD) {
                    // Limpar dados do serviço se o circuit breaker está aberto e a última tentativa foi há mais de 1 hora
                    this._clearServiceData(serviceName);
                    coreLogger.log('Garbage Collection', LOG_LEVELS.INFO, `Cleared stale retry data for service: ${serviceName}`, {
                        circuitState: CircuitState.OPEN,
                        lastAttemptAge: (now - lastAttemptTime) / 1000 + ' seconds'
                    });
                }
            } else if (circuitState === CircuitState.CLOSED) {
                // Opcional: Limpar dados também para serviços em estado CLOSED após um tempo (mais conservador)
                // Útil se quisermos garantir que mesmo serviços bem-sucedidos não acumulem dados indefinidamente.
                // if ((now - (this.serviceLastAttemptTime.get(serviceName) || this.serviceStartTimes.get(serviceName) )) > GC_THRESHOLD) {
                //     this._clearServiceData(serviceName);
                //     coreLogger.log('Garbage Collection', LOG_LEVELS.INFO, `Cleared data for service in CLOSED state: ${serviceName}`, { circuitState: CircuitState.CLOSED });
                // }
            }
        }
    }

    /**
     * Limpa os dados de um serviço específico de todos os mapas de estado.
     * @param {string} serviceName - Nome do serviço a ter seus dados limpos.
     * @private
     */
    _clearServiceData(serviceName) {
        this.retryAttempts.delete(serviceName);
        this.circuitStates.delete(serviceName);
        this.serviceStartTimes.delete(serviceName);
        this.initializationAttempts.delete(serviceName);
        this.timeWindowAttempts.delete(serviceName);
        this.serviceSuccessCount.delete(serviceName);
        this.serviceTotalAttempts.delete(serviceName);
        this.serviceLastAttemptTime.delete(serviceName);
    }


    /**
     * Obtém o número máximo de retentativas com base nos metadados do serviço
     * @param {string} serviceName - Nome do serviço
     * @returns {number} - Número máximo de retentativas
     */
    getMaxRetries(serviceName) {
        const metadata = this.serviceMetadata[serviceName];
        return metadata?.criticalPath
            ? this.criticalServiceMaxRetries
            : this.normalServiceMaxRetries;
    }

    /**
     * Verifica se uma operação para o serviço deve ser tentada novamente
     * @param {string} serviceName - Nome do serviço
     * @param {function} operation - Função a ser executada
     * @param {Object} options - Opções para retry
     * @returns {Promise<any>} - Resultado da operação
     */
    async retryWithBackoff(serviceName, operation, options = {}) {
        const operationStartTime = Date.now();

        // Registrar início da operação se primeira tentativa
        if (!this.serviceStartTimes.has(serviceName)) {
            this.serviceStartTimes.set(serviceName, operationStartTime);
            console.log(`[RetryManager] Starting service: ${serviceName}`);

            coreLogger.logEvent('RetryManager', LOG_LEVELS.INFO,
                `Starting retry sequence for service: ${serviceName}`, {
                    timestamp: new Date().toISOString(),
                    options: JSON.stringify(options)
                });
        }

        // Verificar limites antes de tentar operação
        try {
            this._checkLimits(serviceName, options);
        } catch (error) {
            coreLogger.logServiceError('RetryManager', error, {
                context: 'checkLimits',
                serviceName
            });

            this.metrics.recordFailure(serviceName, error);
            throw error;
        }

        // Verificar ciclos de inicialização rápidos
        const loopError = this._detectInfiniteLoop(serviceName);
        if (loopError) {
            coreLogger.logServiceError('RetryManager', loopError, {
                context: 'detectInfiniteLoop',
                serviceName
            });

            this.metrics.recordFailure(serviceName, loopError);
            throw loopError;
        }

        // Configurações para esta tentativa
        const startTime = performance.now();
        const currentAttempt = this.retryAttempts.get(serviceName) || 0;
        const maxRetries = options.maxRetries || this.getMaxRetries(serviceName);

        // Log da tentativa atual
        console.log(`[RetryManager] Attempt ${currentAttempt + 1}/${maxRetries} for service: ${serviceName}`);

        try {
            // Verificar se circuit breaker está half-open
            const circuitState = this.circuitStates.get(serviceName);
            if (circuitState === CircuitState.HALF_OPEN) {
                coreLogger.logEvent('RetryManager', LOG_LEVELS.INFO,
                    `Circuit half-open for ${serviceName}, testing...`);
            }

            // Executa a operação
            const result = await operation();
            const duration = performance.now() - startTime;

            // Registra sucesso da operação
            this._recordSuccess(serviceName);
            this.metrics.recordSuccess(serviceName);

            // Log de sucesso
            console.log(`[RetryManager] Operation successful for service: ${serviceName} (${duration.toFixed(2)}ms)`);

            return result;
        } catch (error) {
            const duration = performance.now() - startTime;
            const nextAttempt = currentAttempt + 1;

            // Registra métricas
            this.metrics.recordRetryAttempt(serviceName, nextAttempt, duration);

            // Atualiza contador de tentativas
            this.retryAttempts.set(serviceName, nextAttempt);

            // Log detalhado do erro
            coreLogger.logServiceError('RetryManager', error, {
                context: 'operation',
                serviceName,
                attempt: nextAttempt,
                maxRetries,
                duration
            });

            // Se atingiu limite de tentativas, abre o circuit breaker e propaga erro
            if (nextAttempt >= maxRetries) {
                this._openCircuitBreaker(serviceName, error);

                console.error(`[RetryManager] Maximum retry attempts (${maxRetries}) reached for service: ${serviceName}`);

                const maxRetryError = new Error(`Maximum retry attempts (${maxRetries}) reached for service: ${serviceName}`);
                maxRetryError.code = ResilienceError.MAX_RETRIES;
                maxRetryError.originalError = error;

                this.metrics.recordFailure(serviceName, maxRetryError);
                throw maxRetryError;
            }

            // Calcula delay para próxima tentativa com jitter
            const baseDelay = options.baseDelay || this.baseDelay;
            const maxDelay = options.maxDelay || this.maxDelay;
            const backoffMultiplier = options.backoffMultiplier || this.backoffMultiplier;

            const exponentialDelay = baseDelay * Math.pow(backoffMultiplier, currentAttempt);
            const jitterAmount = exponentialDelay * this.jitter * (Math.random() * 2 - 1);
            const delay = Math.min(exponentialDelay + jitterAmount, maxDelay);

            console.log(`[RetryManager] Retrying in ${delay.toFixed(0)}ms for service: ${serviceName}`);

            // Aguarda o delay calculado
            await new Promise(resolve => setTimeout(resolve, delay));

            // Tenta novamente (recursivamente)
            return this.retryWithBackoff(serviceName, operation, options);
        }
    }

    /**
     * Abre o circuit breaker para um serviço
     * @param {string} serviceName - Nome do serviço
     * @param {Error} error - Erro que causou a abertura
     * @private
     */
    _openCircuitBreaker(serviceName, error) {
        this.circuitStates.set(serviceName, CircuitState.OPEN);

        coreLogger.logEvent('RetryManager', LOG_LEVELS.WARNING,
            `Circuit breaker opened for ${serviceName}`, {
                error: error.message,
                reason: 'Max retries exceeded',
                cooldownPeriod: this.cooldownPeriod
            });

        // Agenda transição para half-open após cooldown
        setTimeout(() => {
            if (this.circuitStates.get(serviceName) === CircuitState.OPEN) {
                this.circuitStates.set(serviceName, CircuitState.HALF_OPEN);

                coreLogger.logEvent('RetryManager', LOG_LEVELS.INFO,
                    `Circuit changed to half-open for ${serviceName}`, {
                        timestamp: new Date().toISOString(),
                        cooldownCompleted: true
                    });
            }
        }, this.cooldownPeriod);
    }

    /**
     * Verifica se há um possível loop infinito de inicialização
     * @param {string} serviceName - Nome do serviço
     * @returns {Error|null} - Erro de loop ou null
     * @private
     */
    _detectInfiniteLoop(serviceName) {
        const now = Date.now();
        const attempts = this.initializationAttempts.get(serviceName) || [];

        // Adiciona tentativa atual
        attempts.push(now);
        this.initializationAttempts.set(serviceName, attempts);

        // Mantém apenas tentativas recentes (últimos 60 segundos)
        const recentAttempts = attempts.filter(time => (now - time) < 60000);
        this.initializationAttempts.set(serviceName, recentAttempts);

        // Verifica tentativas muito rápidas
        if (recentAttempts.length > 1) {
            // Ordena tentativas para garantir ordem cronológica
            recentAttempts.sort((a, b) => a - b);

            // Verifica intervalos entre tentativas consecutivas
            for (let i = 1; i < recentAttempts.length; i++) {
                const timeDiff = recentAttempts[i] - recentAttempts[i - 1];

                // Se a tentativa ocorreu muito rapidamente após a anterior
                if (timeDiff < this.rapidInitThreshold) {
                    const currentRapidAttempts = (this.timeWindowAttempts.get(serviceName) || 0) + 1;
                    this.timeWindowAttempts.set(serviceName, currentRapidAttempts);

                    coreLogger.logEvent('RetryManager', LOG_LEVELS.WARNING,
                        `Rapid reinitialization detected for ${serviceName}`, {
                            timeBetweenAttempts: timeDiff,
                            rapidAttemptCount: currentRapidAttempts,
                            threshold: this.maxRapidAttempts
                        });

                    // Se excedeu limite de tentativas rápidas, detectamos um loop
                    if (currentRapidAttempts >= this.maxRapidAttempts) {
                        coreLogger.logEvent('RetryManager', LOG_LEVELS.ERROR,
                            `Infinite initialization loop detected for ${serviceName}`, {
                                attemptsCount: recentAttempts.length,
                                recentAttempts: recentAttempts.slice(-5).map(t => new Date(t).toISOString()),
                                rapidAttemptCount: currentRapidAttempts
                            });

                        // Abre o circuit breaker para parar tentativas
                        this.circuitStates.set(serviceName, CircuitState.OPEN);

                        const loopError = new Error(`Probable infinite initialization loop detected for ${serviceName}. Service initialization has been blocked.`);
                        loopError.code = ResilienceError.INFINITE_LOOP;
                        loopError.metadata = {
                            service: serviceName,
                            attempts: recentAttempts.length,
                            rapidAttempts: currentRapidAttempts
                        };

                        return loopError;
                    }

                    break; // Encontrou uma tentativa rápida, não precisa verificar o resto
                }
            }

            // Se chegou aqui, nenhuma tentativa rápida foi encontrada neste ciclo
            if (recentAttempts.length >= 2) {
                const latestDiff = recentAttempts[recentAttempts.length - 1] - recentAttempts[recentAttempts.length - 2];
                if (latestDiff >= this.rapidInitThreshold) {
                    // Resetamos o contador porque esta tentativa teve intervalo adequado
                    this.timeWindowAttempts.set(serviceName, 0);
                }
            }
        }

        return null;
    }

    /**
     * Verifica limites de tempo e circuit breaker
     * @param {string} serviceName - Nome do serviço
     * @param {Object} options - Opções de retry
     * @throws {Error} Se algum limite for excedido
     * @private
     */
    _checkLimits(serviceName, options = {}) {
        // Verificar tempo absoluto
        const startTime = this.serviceStartTimes.get(serviceName);
        if (startTime) {
            const elapsedTime = Date.now() - startTime;
            const timeLimit = options.absoluteTimeLimit || this.absoluteTimeLimit;

            if (elapsedTime > timeLimit) {
                this.circuitStates.set(serviceName, CircuitState.OPEN);

                coreLogger.logEvent('RetryManager', LOG_LEVELS.ERROR,
                    `Absolute time limit exceeded for ${serviceName}`, {
                        elapsedTime,
                        timeLimit
                    });

                const timeoutError = new Error(`Absolute time limit exceeded (${timeLimit}ms) for service: ${serviceName}`);
                timeoutError.code = ResilienceError.TIMEOUT;
                timeoutError.metadata = {
                    service: serviceName,
                    elapsedTime,
                    timeLimit
                };

                throw timeoutError;
            }
        }

        // Verificar circuit breaker
        const circuitState = this.circuitStates.get(serviceName);
        if (circuitState === CircuitState.OPEN) {
            coreLogger.logEvent('RetryManager', LOG_LEVELS.WARNING,
                `Operation blocked by circuit breaker for ${serviceName}`);

            const circuitError = new Error(`Circuit breaker open for service: ${serviceName}. Service is blocked from further attempts.`);
            circuitError.code = ResilienceError.CIRCUIT_OPEN;
            circuitError.metadata = {
                service: serviceName,
                circuitState: 'OPEN'
            };

            throw circuitError;
        }
    }

    /**
     * Registra sucesso e atualiza estado
     * @param {string} serviceName - Nome do serviço
     * @private
     */
    _recordSuccess(serviceName) {
        const currentState = this.circuitStates.get(serviceName);

        // Resetar contadores de retry
        this.retryAttempts.delete(serviceName);
        this.timeWindowAttempts.set(serviceName, 0);

        // Controle de circuit breaker
        if (currentState === CircuitState.HALF_OPEN) {
            // Incrementar contador de sucessos durante HALF_OPEN
            const successCount = (this.serviceSuccessCount.get(serviceName) || 0) + 1;
            this.serviceSuccessCount.set(serviceName, successCount);

            // Se atingiu threshold de sucessos, fecha o circuit breaker
            if (successCount >= this.successThreshold) {
                this.circuitStates.set(serviceName, CircuitState.CLOSED);
                this.serviceSuccessCount.delete(serviceName);

                coreLogger.logEvent('RetryManager', LOG_LEVELS.INFO,
                    `Circuit closed for ${serviceName} after ${successCount} successful operations`);
            } else {
                coreLogger.logEvent('RetryManager', LOG_LEVELS.INFO,
                    `Successful operation in half-open state for ${serviceName}`, {
                        successCount,
                        threshold: this.successThreshold
                    });
            }
        } else {
            // Definir como CLOSED se estava em outro estado
            this.circuitStates.set(serviceName, CircuitState.CLOSED);
        }

        // Para serviços de inicialização, podemos limpar o tempo de início
        // após um sucesso, já que consideramos a inicialização completa
        this.serviceStartTimes.delete(serviceName);
    }

    /**
     * Reseta estado para um serviço específico
     * @param {string} serviceName - Nome do serviço
     */
    resetService(serviceName) {
        this._clearServiceData(serviceName);

        console.log(`[RetryManager] Reset service state: ${serviceName}`);

        coreLogger.logEvent('RetryManager', LOG_LEVELS.INFO,
            `Reset retry state for ${serviceName}`, {
                status: 'reset',
                circuit: CircuitState.CLOSED,
                timestamp: new Date().toISOString()
            });
    }

    /**
     * Reseta todos os serviços
     */
    resetAll() {
        this.retryAttempts.clear();
        this.circuitStates.clear();
        this.serviceStartTimes.clear();
        this.initializationAttempts.clear();
        this.timeWindowAttempts.clear();
        this.serviceSuccessCount.clear();
        this.serviceTotalAttempts.clear();
        this.serviceLastAttemptTime.clear();

        console.log(`[RetryManager] Reset all services`);

        coreLogger.logEvent('RetryManager', LOG_LEVELS.INFO,
            'Reset all services', {
                timestamp: new Date().toISOString()
            });
    }

    /**
     * Obtém o estado atual de todos os serviços
     * @returns {Object} Estado de resiliência
     */
    getState() {
        const services = {};

        // Consolidar informações de cada serviço
        for (const [serviceName, attempts] of this.retryAttempts.entries()) {
            services[serviceName] = {
                attempts,
                circuitState: this.circuitStates.get(serviceName) || CircuitState.CLOSED,
                startTime: this.serviceStartTimes.get(serviceName),
                lastAttemptTime: this.serviceLastAttemptTime.get(serviceName),
                totalAttempts: this.serviceTotalAttempts.get(serviceName) || 0,
                rapidAttempts: this.timeWindowAttempts.get(serviceName) || 0
            };
        }

        return {
            services,
            metrics: this.metrics.getMetrics(),
            timestamp: new Date().toISOString()
        };
    }
}

export { RetryManager };
export const retryManager = RetryManager.getInstance();