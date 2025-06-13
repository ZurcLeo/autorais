// ResilienceConfig.js
export const ResilienceConfig = {
    // Configurações padrão de retry
    retry: {
        baseDelay: 1000,           // 1 segundo inicial
        maxDelay: 30000,           // máximo 30 segundos
        backoffMultiplier: 2,      // multiplicador exponencial
        maxRetries: {
            critical: 5,           // serviços críticos
            normal: 3              // serviços não críticos
        },
        jitter: 0.1               // variação aleatória de 10%
    },

    // Circuit breaker
    circuitBreaker: {
        failureThreshold: 5,        // falhas antes de abrir
        cooldownPeriod: 60000,      // 1 minuto de cooldown
        halfOpenTimeout: 30000,     // 30 segundos em half-open
        minimumRequests: 3,         // mínimo antes de considerar falhas
        successThreshold: 2         // sucessos para fechar
    },

    // Timeouts por tipo de serviço (ms)
    timeouts: {
        auth: 30000,               // serviços de autenticação
        core: 20000,               // serviços core
        api: 15000,                // chamadas API
        cache: 5000,               // operações de cache
        default: 10000             // timeout padrão
    },

    // Estratégias por ambiente
    environments: {
        development: {
            retry: {
                maxRetries: {
                    critical: 5,    // mais tentativas em dev para debugging
                    normal: 3
                }
            },
            circuitBreaker: {
                failureThreshold: 8,    // mais tolerante em dev
                cooldownPeriod: 45000   // mais tempo para recuperação
            },
            logging: {
                verbose: true,      // mais logs em dev
                metrics: true
            }
        },
        production: {
            retry: {
                maxRetries: {
                    critical: 5,    // mais tentativas em prod
                    normal: 3
                }
            },
            circuitBreaker: {
                failureThreshold: 5,
                cooldownPeriod: 60000
            },
            logging: {
                verbose: false,     // menos logs em prod
                metrics: true
            }
        }
    },

    // Estratégias por tipo de erro
    errorStrategies: {
        network: {
            retryable: true,
            maxRetries: 3,
            backoffMultiplier: 1.5
        },
        authentication: {
            retryable: false,      // não retenta erros de auth
            circuitBreaker: true   // mas monitora para circuit breaker
        },
        timeout: {
            retryable: true,
            maxRetries: 2,
            backoffMultiplier: 2
        },
        validation: {
            retryable: false,      // não retenta erros de validação
            circuitBreaker: false  // não afeta circuit breaker
        }
    },

    // Métricas e monitoramento
    metrics: {
        collectRetryMetrics: true,
        collectCircuitBreakerMetrics: true,
        metricsBufferSize: 100,
        flushInterval: 60000       // flush a cada minuto
    },
    
    // Detecção de loop infinito
    loopDetection: {
        rapidInitThreshold: 1000,  // 1 segundo entre tentativas é muito rápido
        maxRapidAttempts: 3,       // 3 tentativas rápidas = loop
        timeWindow: 60000,         // janela de 60 segundos para análise
        absoluteTimeLimit: 30000   // 30 segundos é o máximo para inicialização
    }
};

// Helpers de validação
export const validateResilienceConfig = (config) => {
    // Validação base
    if (!config.retry || !config.circuitBreaker || !config.timeouts) {
        throw new Error('Missing required resilience config sections');
    }

    // Validação de retry
    if (config.retry.maxDelay < config.retry.baseDelay) {
        throw new Error('maxDelay must be greater than baseDelay');
    }

    if (config.retry.backoffMultiplier <= 1) {
        throw new Error('backoffMultiplier must be greater than 1');
    }

    // Validação de circuit breaker
    if (config.circuitBreaker.failureThreshold < config.circuitBreaker.successThreshold) {
        throw new Error('failureThreshold must be greater than successThreshold');
    }

    // Validação de timeouts
    Object.values(config.timeouts).forEach(timeout => {
        if (timeout <= 0) {
            throw new Error('Timeouts must be positive values');
        }
    });

    return true;
};

// Helper para obter configuração por ambiente
export const getEnvironmentConfig = () => {
    const env = process.env.NODE_ENV || 'development';
    return ResilienceConfig.environments[env] || ResilienceConfig.environments.development;
};