// src/core/logging/CoreLogger.js
import { LOG_LEVELS, SEVERITY_LEVELS, LOG_CONFIG } from '../../reducers/metadata/metadataReducer';

const DEBUG = process.env.NODE_ENV === 'development';

// Gerenciamento de sessão para logs
const sessionId = Date.now().toString();
const sessionStartTime = Date.now();

class CoreLogger {
    
    static instance = null;
    
    static getInstance() {
        
        if (!CoreLogger.instance) {
            CoreLogger.instance = new CoreLogger();
        }
        return CoreLogger.instance;
    }

    constructor() {
        if (CoreLogger.instance) {
            return CoreLogger.instance;
        }

        this.logs = [];
        this.MAX_LOGS = 100;
        this.subscribers = new Set();
        this.startTime = performance.now();
        this.enabled = DEBUG;
        this.batchTimeout = null;
        this.batchedLogs = [];

        CoreLogger.instance = this;
    }

    initialize() {
        this.batchLog([
            {
                message: 'CoreLogger initialized',
                type: LOG_LEVELS.INITIALIZATION,
                data: { enabled: this.enabled, env: process.env.NODE_ENV }
            },
            {
                message: 'Environment check',
                type: LOG_LEVELS.INITIALIZATION,
                data: {
                    nodeEnv: process.env.NODE_ENV,
                    debug: DEBUG,
                    timestamp: new Date().toISOString()
                }
            }
            
        ]);
    }

    batchLog(entries) {
        const newEntries = entries.map(entry => ({
            timestamp: new Date().toISOString(),
            timeSinceStart: Math.round(performance.now() - this.startTime),
            type: entry.type,
            severity: SEVERITY_LEVELS[entry.type] || SEVERITY_LEVELS[LOG_LEVELS.DEBUG],
            message: entry.message,
            data: entry.data
        }));

        if (DEBUG) {
            newEntries.forEach(entry => {
                this._consoleLog(entry);
            });
        }

        if (!this.enabled) return;

        this.batchedLogs.push(...newEntries);
        this._debouncedNotify();
    }

// No CoreLogger.js, atualize o método _consoleLog:
_consoleLog(logEntry) {
    // Validação mais rigorosa do logEntry
    if (!logEntry || typeof logEntry !== 'object') {
        console.warn('[Logger] Invalid log entry (not an object):', logEntry);
        return;
    }

    // Identificar o tipo de log a usar - pode ser type ou level
    const logType = logEntry.type || logEntry.level;
    if (!logType) {
        console.warn('[Logger] Invalid log entry (no type or level):', logEntry);
        console.log(`[FALLBACK] ${logEntry.component || 'Unknown'}: ${logEntry.message || 'No message'}`);
        return;
    }

    // Obter a função de console apropriada
    let logFn;
    try {
        logFn = this._getConsoleFunction(logType);
    } catch (error) {
        console.warn(`[Logger] Error getting console function for type ${logType}:`, error);
        logFn = console.log; // Fallback para console.log
    }

    // Usar try/catch para proteger o console.group
    try {
        console.group(`[${logType}] ${logEntry.component || 'App'} (Session: ${sessionId.slice(-4)})`);
        console.log(`Message: ${logEntry.message}`);
        if (logEntry.data) console.log('Data:', logEntry.data);
        if (logEntry.metadata && Object.keys(logEntry.metadata).length > 0) console.log('Metadata:', logEntry.metadata);
        console.groupEnd();
    } catch (error) {
        // Fallback se console.group falhar
        console.log(`[${logType}] ${logEntry.component || 'App'}: ${logEntry.message}`);
        if (logEntry.data) console.log(`[${logType}] Data:`, logEntry.data);
    }
}

// Também atualize o método _getConsoleFunction para ser mais defensivo:
_getConsoleFunction(type) {
    // Proteger contra undefined ou tipos inválidos
    if (!type) {
        return console.log;
    }

    // Normalize o tipo para string para comparação mais segura
    const typeStr = String(type).toUpperCase();

    // Verificar se é um LOG_LEVELS conhecido
    const isKnownLevel = Object.values(LOG_LEVELS)
        .some(level => String(level).toUpperCase() === typeStr);

    // Se não for um nível conhecido, use log por padrão
    if (!isKnownLevel) {
        return console.log;
    }

    // Agora processe o tipo normalizado
    switch(typeStr) {
        case String(LOG_LEVELS.ERROR).toUpperCase():
            return console.error;
        case String(LOG_LEVELS.INITIALIZATION).toUpperCase():
        case String(LOG_LEVELS.LIFECYCLE).toUpperCase():
        case String(LOG_LEVELS.INFO).toUpperCase():
            return console.info;
        case String(LOG_LEVELS.PERFORMANCE).toUpperCase():
        case String(LOG_LEVELS.DEBUG).toUpperCase():
            return console.debug;
        default:
            return console.log;
    }
}

    _getConsoleFunction(type) {
        if (!type || typeof type !== 'string') {
            console.warn(`[Logger] Invalid log type in _getConsoleFunction: ${type}, defaulting to log`);
            return console.log;
        }
    
        switch(type) {
            case LOG_LEVELS.ERROR:
                return console.error;
            case LOG_LEVELS.INITIALIZATION:
            case LOG_LEVELS.LIFECYCLE:
                return console.info;
            case LOG_LEVELS.PERFORMANCE:
                return console.debug;
            default:
                return console.log;
        }
    }

    logEvent(component, level, message, data = null, metadata = {}) {
        let validLevel = level;


        const isValidLevel = Object.entries(LOG_LEVELS).some(([key, value]) => 
            key === level || value === level
        );

        if (!isValidLevel) {
            console.warn(`[Logger] Invalid log level: ${level}`);
            validLevel = LOG_LEVELS.DEBUG;
        }

        const severity = SEVERITY_LEVELS[level] ?? SEVERITY_LEVELS[LOG_LEVELS.DEBUG];

        if (severity > LOG_CONFIG.minSeverity) return;

        const logData = {
            sessionId,
            component,
            level: validLevel,
            message,
            data,
            metadata: {
                ...metadata,
                severity,
                timestamp: Date.now(),
                sessionAge: Date.now() - sessionStartTime,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null
            }
        };

        if (DEBUG && LOG_CONFIG.enableConsoleLogging && typeof console !== 'undefined') {
            this._consoleLog(logData);
        }

        this.batchLog([{
            type: validLevel,
            message: message,
            data: logData.data,
            component: component,
            metadata: logData.metadata
        }]);
    }


    log(message, type = LOG_LEVELS.DEBUG, data = {}) {
        this.batchLog([{ message, type, data }]);
    }

    _debouncedNotify() {
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
        }
        
        this.batchTimeout = setTimeout(() => {
            if (this.batchedLogs.length > 0) {
                this.logs = [...this.logs, ...this.batchedLogs]
                    .slice(-this.MAX_LOGS);
                this.batchedLogs = [];
                this._notifySubscribers();
            }
            this.batchTimeout = null;
        }, 100);
    }

    _notifySubscribers() {
        if (typeof window !== 'undefined') {
            window.requestAnimationFrame(() => {
                this.subscribers.forEach(callback => {
                    try {
                        callback(this.logs);
                    } catch (error) {
                        console.error('Error in logger subscriber:', error);
                    }
                });
            });
        }
    }

    // API Pública
    subscribe(callback) {
        this.subscribers.add(callback);
        requestAnimationFrame(() => callback(this.logs));
        return () => this.subscribers.delete(callback);
    }

    enable() {
        this.enabled = true;
        this.log('Logging enabled', LOG_LEVELS.INITIALIZATION);
    }

    disable() {
        this.log('Logging disabled', LOG_LEVELS.INITIALIZATION);
        this.enabled = false;
    }

    clear() {
        this.logs = [];
        this.batchedLogs = [];
        this._notifySubscribers();
    }

    getSnapshot() {
        return [...this.logs];
    }

    // Métodos específicos para serviços
    logServiceState(serviceName, state, metadata = {}) {
        this.log(`Service state update: ${serviceName}`, LOG_LEVELS.STATE, {
            service: serviceName,
            state,
            metadata,
            timestamp: new Date().toISOString()
        });
    }

    logServiceError(serviceName, error, context = {}) {
        this.log(`Service error: ${serviceName}`, LOG_LEVELS.ERROR, {
            service: serviceName,
            error: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString()
        });
    }

    logServicePerformance(serviceName, operation, duration, metadata = {}) {
        this.log(`Service performance: ${serviceName}`, LOG_LEVELS.PERFORMANCE, {
            service: serviceName,
            operation,
            duration,
            metadata,
            timestamp: new Date().toISOString()
        });
    }

    // Métodos específicos de diagnóstico de serviços - Moving diagnostic logs here
    logServiceInitStart(serviceName) {
        this.logEvent('ServiceInitializer', LOG_LEVELS.INITIALIZATION, `Service initialization started: ${serviceName}`, { serviceName });
    }

    logServiceInitComplete(serviceName, duration) {
        this.logEvent('ServiceInitializer', LOG_LEVELS.INITIALIZATION, `Service initialization completed: ${serviceName}`, { serviceName, duration });
    }

    logServiceInitError(serviceName, error) {
        this.logEvent('ServiceInitializer', LOG_LEVELS.ERROR, `Service initialization failed: ${serviceName}`, { serviceName, error: error.message });
    }

    // Métodos específicos de diagnóstico de providers - Moving provider logs here
    logProviderMount(providerName) {
        this.logEvent('ProviderLifecycle', LOG_LEVELS.LIFECYCLE, `Provider mounted: ${providerName}`, { providerName });
    }

    logProviderUnmount(providerName) {
        this.logEvent('ProviderLifecycle', LOG_LEVELS.LIFECYCLE, `Provider unmounted: ${providerName}`, { providerName });
    }
}

export const coreLogger = new CoreLogger();