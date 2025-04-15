// src/core/logging/CoreLogger.js
import { LOG_LEVELS, SEVERITY_LEVELS, LOG_CONFIG } from '../../core/constants/config';

const DEBUG = process.env.NODE_ENV === 'development';

// Gerenciamento de sessão para logs
const sessionId = Date.now().toString();
const sessionStartTime = Date.now();

class CoreLogger {
    // Implementação consistente do padrão Singleton
    static #instance = null;
    
    static getInstance() {
        if (!CoreLogger.#instance) {
            CoreLogger.#instance = new CoreLogger();
        }
        return CoreLogger.#instance;
    }

    constructor() {
        // Se já existe uma instância, retorna ela
        if (CoreLogger.#instance) {
            return CoreLogger.#instance;
        }

        this.logs = [];
        this.MAX_LOGS = 100;
        this.subscribers = new Set();
        this.startTime = performance.now();
        this.enabled = DEBUG;
        this.batchTimeout = null;
        this.batchedLogs = [];
        
        // Registra a instância
        CoreLogger.#instance = this;
        
        // Adiciona listener para limpeza automática de recursos
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', this.cleanupResources.bind(this));
        }
    }

    /**
     * Inicializa o logger e registra logs iniciais
     */
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
        
        return Promise.resolve(true); // Torna a inicialização assíncrona para facilitar o tratamento de erro
    }

/**
 * Adiciona múltiplos logs ao batch para processamento
 * @param {Array} entries - Array de objetos de log
 */
batchLog(entries) {
    // Validação de entrada - protege contra entradas inválidas
    if (!Array.isArray(entries)) {
        console.warn('[Logger] batchLog requires an array of entries:', entries);
        return;
    }
    
    const newEntries = entries.map(entry => {
        // Validação básica de cada entrada
        if (!this.validateLogEntry(entry)) {
            return null;
        }
        
        // Sanitizar dados antes de adicioná-los aos logs
        const safeData = this._safeSerialize(entry.data);
        
        return {
            timestamp: new Date().toISOString(),
            timeSinceStart: Math.round(performance.now() - this.startTime),
            type: entry.type,
            severity: SEVERITY_LEVELS[entry.type] || SEVERITY_LEVELS[LOG_LEVELS.DEBUG],
            message: entry.message,
            data: safeData, // Usar dados sanitizados
            component: entry.component
        };
    }).filter(Boolean); // Remove entradas inválidas (null)

    if (newEntries.length === 0) return;

    if (DEBUG) {
        newEntries.forEach(entry => {
            this._consoleLog(entry);
        });
    }

    if (!this.enabled) return;

    this.batchedLogs.push(...newEntries);
    this._debouncedNotify();
    
    // Persistir logs críticos
    this.persistCriticalLogs(newEntries);
}

    /**
     * Validação centralizada de entradas de log
     * @param {Object} entry - Objeto de log a ser validado
     * @param {Array} requiredFields - Campos obrigatórios (padrão: message e type)
     * @returns {Boolean} - true se válido, false se inválido
     */
    validateLogEntry(entry, requiredFields = ['message', 'type']) {
        if (!entry || typeof entry !== 'object') {
            console.warn('[Logger] Invalid log entry (not an object):', entry);
            return false;
        }
        
        const missingFields = requiredFields.filter(field => entry[field] === undefined);
        if (missingFields.length > 0) {
            console.warn(`[Logger] Log entry missing required fields: ${missingFields.join(', ')}`, entry);
            return false;
        }
        
        return true;
    }

/**
 * Formata e exibe logs no console do navegador
 * @param {Object} logEntry - Objeto de log a ser exibido
 */
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
        
        // Garantir que os dados sejam seguros para exibição no console
        if (logEntry.data) {
            // Os dados já devem estar sanitizados, mas vamos garantir
            console.log('Data:', logEntry.data);
        }
        
        // Garantir que os metadados sejam seguros para exibição no console
        if (logEntry.metadata && Object.keys(logEntry.metadata).length > 0) {
            console.log('Metadata:', logEntry.metadata);
        }
        
        console.groupEnd();
    } catch (error) {
        // Fallback se console.group falhar
        console.log(`[${logType}] ${logEntry.component || 'App'}: ${logEntry.message}`);
        if (logEntry.data) console.log(`[${logType}] Data:`, logEntry.data);
    }
}

/**
 * Serializa objetos de forma segura para evitar referências circulares e objetos não serializáveis
 * @param {any} obj - Objeto a ser serializado
 * @param {number} maxDepth - Profundidade máxima de serialização para evitar objetos muito aninhados
 * @returns {any} - Versão segura e serializável do objeto
 */
_safeSerialize(obj, maxDepth = 3) {
    // Para valores primitivos ou null/undefined, retornar como está
    if (obj === null || obj === undefined || typeof obj !== 'object') {
        return obj;
    }
    
    // Para funções, retornar uma string representativa
    if (typeof obj === 'function') {
        return '[Function]';
    }
    
    // Para objetos de Data, converter para string ISO
    if (obj instanceof Date) {
        return obj.toISOString();
    }
    
    // Para arrays, processar elementos individualmente
    if (Array.isArray(obj)) {
        // Se atingir maxDepth, não processar mais
        if (maxDepth <= 0) {
            return '[Array]';
        }
        
        return obj.map(item => this._safeSerialize(item, maxDepth - 1));
    }
    
    // Para objetos personalizados com toJSON, usar isso
    if (typeof obj.toJSON === 'function') {
        try {
            return obj.toJSON();
        } catch {
            return '[Object with toJSON]';
        }
    }
    
    // Para Error, extrair propriedades importantes
    if (obj instanceof Error) {
        return {
            message: obj.message,
            name: obj.name,
            stack: obj.stack,
            code: obj.code
        };
    }
    
    // Para outros objetos, processamos atentamente
    try {
        // Se atingir maxDepth, não processar mais
        if (maxDepth <= 0) {
            return '[Object]';
        }
        
        // Objetos Firebase, Auth, DOM, etc. tipicamente causam problemas
        const objectType = Object.prototype.toString.call(obj);
        if (
            objectType.includes('Firebase') ||
            objectType.includes('HTML') ||
            objectType.includes('DOM') ||
            objectType.includes('Window') ||
            objectType.includes('Global')
        ) {
            return `[${objectType.slice(8, -1)}]`;
        }
        
        // Objetos com muitas propriedades provavelmente são complexos demais
        const keys = Object.keys(obj);
        if (keys.length > 100) {
            return `[Complex Object with ${keys.length} properties]`;
        }
        
        // Processamos cada propriedade individualmente
        const result = {};
        for (const key of keys) {
            // Ignorar propriedades que comecem com underscore ou asterisco (convenção para privadas)
            if (key.startsWith('_') || key.startsWith('*')) {
                result[key] = '[Private Property]';
                continue;
            }
            
            try {
                const value = obj[key];
                // Processar recursivamente, diminuindo a profundidade máxima
                result[key] = this._safeSerialize(value, maxDepth - 1);
            } catch (err) {
                result[key] = '[Property Error]';
            }
        }
        
        return result;
    } catch (error) {
        // Fallback seguro se tudo falhar
        return `[Non-serializable ${typeof obj}]`;
    }
}

    /**
     * Retorna a função de console apropriada para o tipo de log
     * @param {String} type - Tipo de log
     * @returns {Function} - Função de console (log, warn, error, etc)
     */
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
            case String(LOG_LEVELS.WARNING).toUpperCase():
                return console.warn;
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

    /**
     * Registra um evento com contexto completo
     * @param {String} component - Componente que gerou o log (use SERVICE_METADATA)
     * @param {String} level - Nível do log (use LOG_LEVELS)
     * @param {String} message - Mensagem do log
     * @param {Object} data - Dados adicionais
     * @param {Object} metadata - Metadados
     */
// Corrigir a função logEvent para usar os dados sanitizados
logEvent(component, level, message, data = null, metadata = {}) {
    // Verificação básica dos parâmetros
    if (!component || !level || !message) {
        console.warn('[Logger] Invalid parameters for logEvent:', { component, level, message });
        return;
    }

    // Sanitize os dados e metadados
    const safeData = this._safeSerialize(data);
    const safeMetadata = this._safeSerialize(metadata);

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
        data: safeData, // Usar dados sanitizados aqui
        metadata: {
            ...safeMetadata, // Usar metadados sanitizados aqui
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
        data: safeData, // Usar dados sanitizados aqui também
        component: component,
        metadata: logData.metadata // Já contém metadados sanitizados
    }]);
}

/**
 * Método simplificado para registrar um log
 * @param {String} message - Mensagem do log
 * @param {String} type - Tipo de log (padrão: DEBUG)
 * @param {Object} data - Dados adicionais
 */
log(message, type = LOG_LEVELS.DEBUG, data = {}) {
    if (!message) {
        console.warn('[Logger] Log message is required');
        return;
    }
    
    // Sanitizar os dados
    const safeData = this._safeSerialize(data);
    
    // Usar os dados sanitizados no batch
    this.batchLog([{ message, type, data: safeData }]);
}

    /**
     * Agenda a notificação de subscribers com debounce
     */
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

    /**
     * Notifica todos os subscribers sobre novos logs
     */
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

    /**
     * Registra um subscriber para receber atualizações de logs
     * @param {Function} callback - Função a ser chamada com novos logs
     * @returns {Function} - Função para cancelar a subscription
     */
    subscribe(callback) {
        if (typeof callback !== 'function') {
            console.warn('[Logger] Subscribe callback must be a function');
            return () => {}; // Retorna uma função vazia para não quebrar o código cliente
        }
        
        this.subscribers.add(callback);
        // Notifica imediatamente com os logs atuais
        if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(() => callback(this.logs));
        } else {
            setTimeout(() => callback(this.logs), 0);
        }
        
        // Retorna função de unsubscribe
        return () => {
            this.subscribers.delete(callback);
            return true; // Indica sucesso
        };
    }

    /**
     * Ativa o logging
     */
    enable() {
        this.enabled = true;
        this.log('Logging enabled', LOG_LEVELS.INITIALIZATION);
    }

    /**
     * Desativa o logging
     */
    disable() {
        this.log('Logging disabled', LOG_LEVELS.INITIALIZATION);
        this.enabled = false;
    }

    /**
     * Limpa todos os logs
     */
    clear() {
        this.logs = [];
        this.batchedLogs = [];
        this._notifySubscribers();
    }

    /**
     * Retorna uma cópia dos logs atuais
     * @returns {Array} - Array de logs
     */
    getSnapshot() {
        return [...this.logs];
    }

    /**
     * Persiste logs críticos no localStorage
     * @param {Array} logs - Logs a serem verificados e persistidos
     */
    persistCriticalLogs(logs) {
        if (!logs || logs.length === 0 || typeof localStorage === 'undefined') {
            return;
        }
        
        try {
            // Filtrar apenas logs críticos (severity 0)
            const criticalLogs = logs.filter(log => log.severity === 0);
            
            if (criticalLogs.length === 0) return;
            
            // Obter logs existentes
            const storedLogs = JSON.parse(localStorage.getItem('critical-logs') || '[]');
            
            // Combinar e limitar a quantidade
            const combinedLogs = [...storedLogs, ...criticalLogs].slice(-50); // Manter apenas os últimos 50
            
            localStorage.setItem('critical-logs', JSON.stringify(combinedLogs));
        } catch (error) {
            console.error('Failed to persist critical logs:', error);
        }
    }

    /**
     * Limpa recursos ao desmontar o componente
     */
    cleanupResources() {
        // Limpar timeout pendente
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
            this.batchTimeout = null;
        }
        
        // Limpar subscribers
        this.subscribers.clear();
        
        // Remover event listener
        if (typeof window !== 'undefined') {
            window.removeEventListener('beforeunload', this.cleanupResources.bind(this));
        }
    }

    // Métodos específicos para serviços
logServiceState(serviceName, state, metadata = {}) {
    const safeState = this._safeSerialize(state);
    const safeMetadata = this._safeSerialize(metadata);
    
    this.log(`Service state update: ${serviceName}`, LOG_LEVELS.STATE, {
        service: serviceName,
        state: safeState,
        metadata: safeMetadata,
        timestamp: new Date().toISOString()
    });
}

logServiceError(serviceName, error, context = {}) {
    if (!serviceName) {
        console.warn('[Logger] Service name is required for logServiceError');
        return;
    }
    
    if (!error) {
        console.warn('[Logger] Error object is required for logServiceError');
        return;
    }
    
    const errorObj = error instanceof Error ? error : { message: String(error) };
    const safeContext = this._safeSerialize(context);
    
    this.log(`Service error: ${serviceName}`, LOG_LEVELS.ERROR, {
        service: serviceName,
        error: errorObj.message,
        stack: errorObj.stack,
        context: safeContext,
        timestamp: new Date().toISOString()
    });
}

logServicePerformance(serviceName, operation, duration, metadata = {}) {
    if (!serviceName || !operation) {
        console.warn('[Logger] Service name and operation are required for logServicePerformance');
        return;
    }
    
    const safeMetadata = this._safeSerialize(metadata);
    
    this.log(`Service performance: ${serviceName}`, LOG_LEVELS.PERFORMANCE, {
        service: serviceName,
        operation,
        duration,
        metadata: safeMetadata,
        timestamp: new Date().toISOString()
    });
}

    // Métodos específicos de diagnóstico de serviços
    logServiceInitStart(serviceName) {
        this.logEvent('ServiceInitializer', LOG_LEVELS.INITIALIZATION, `Service initialization started: ${serviceName}`, { serviceName });
    }

    logServiceInitComplete(serviceName, duration) {
        this.logEvent('ServiceInitializer', LOG_LEVELS.INITIALIZATION, `Service initialization completed: ${serviceName}`, { serviceName, duration });
    }

    logServiceInitError(serviceName, error) {
        const errorObj = error instanceof Error ? error : { message: String(error) };
        this.logEvent('ServiceInitializer', LOG_LEVELS.ERROR, `Service initialization failed: ${serviceName}`, { 
            serviceName, 
            error: errorObj.message,
            stack: errorObj.stack
        });
    }

    // Métodos específicos de diagnóstico de providers
    logProviderMount(providerName) {
        this.logEvent('ProviderLifecycle', LOG_LEVELS.LIFECYCLE, `Provider mounted: ${providerName}`, { providerName });
    }

    logProviderUnmount(providerName) {
        this.logEvent('ProviderLifecycle', LOG_LEVELS.LIFECYCLE, `Provider unmounted: ${providerName}`, { providerName });
    }
}

// Exportação consistente da instância singleton
export const coreLogger = CoreLogger.getInstance();