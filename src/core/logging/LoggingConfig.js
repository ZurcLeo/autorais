// src/core/logging/LoggingConfig.js
export const LoggingConfig = {
    // Configurações padrão do sistema de logging
    defaults: {
        maxLogs: 100,
        batchDelay: 100,
        minSeverity: process.env.NODE_ENV === 'production' ? 1 : 0,
    },

    // Formatação de mensagens
    format: {
        timestamp: () => new Date().toISOString(),
        duration: (startTime) => `${Math.round(performance.now() - startTime)}ms`,
        error: (error) => ({
            message: error.message,
            stack: error.stack,
            name: error.name
        })
    },

    // Configurações específicas por ambiente
    environments: {
        development: {
            console: true,
            persist: false,
            minSeverity: 0,
        },
        production: {
            console: false,
            persist: true,
            minSeverity: 1,
        },
        test: {
            console: false,
            persist: false,
            minSeverity: 2,
        }
    },

    // Handlers padrão por tipo de log
    handlers: {
        error: (log) => console.error(log),
        warn: (log) => console.warn(log),
        info: (log) => console.info(log),
        debug: (log) => console.debug(log),
    }
};

// Helpers para validação de configuração
export const validateLogConfig = (config) => {
    const requiredFields = ['maxLogs', 'batchDelay', 'minSeverity'];
    const missingFields = requiredFields.filter(field => config[field] === undefined);
    
    if (missingFields.length > 0) {
        throw new Error(`Missing required logging config fields: ${missingFields.join(', ')}`);
    }

    if (config.maxLogs < 1) {
        throw new Error('maxLogs must be greater than 0');
    }

    if (config.batchDelay < 0) {
        throw new Error('batchDelay cannot be negative');
    }

    return true;
};