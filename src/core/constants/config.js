/**
 * @fileoverview Define constantes e configurações globais utilizadas na aplicação.
 */

export const ServiceStatus = {
    INITIALIZING: 'initializing',
    READY: 'ready',
    ERROR: 'error',
    FAILED: 'failed',
    BLOCKED: 'blocked'
  };
/**
 * Constantes de opções de persistência de dados.
 * @namespace STORAGE_TYPES
 * @type {Object}
 * @property {string} LOCAL - Utiliza o `localStorage` do navegador para persistência.
 * @property {string} SESSION - Utiliza o `sessionStorage` do navegador para persistência.
 * @property {string} INDEXED_DB - Utiliza o IndexedDB do navegador para persistência.
 * @property {string} BACKEND - Persistência de dados em um servidor backend.
 * @property {string} COOKIE - Persistência de dados utilizando cookies do navegador.
 * @example
 * // Exemplo de uso:
 * const storageType = STORAGE_TYPES.LOCAL;
 * localStorage.setItem('data', JSON.stringify(myData));
 */
export const STORAGE_TYPES = {
    LOCAL: 'localStorage',
    SESSION: 'sessionStorage',
    INDEXED_DB: 'indexedDB',
    BACKEND: 'backend',
    COOKIE: 'cookie'
};

/**
   * Constantes para tipos de preferências do usuário.
   * @namespace PREFERENCE_CATEGORIES
   * @type {Object}
   * @property {string} THEME - Preferências relacionadas ao tema visual da aplicação.
   * @property {string} PRIVACY - Preferências relacionadas à privacidade do usuário.
   * @property {string} NOTIFICATIONS - Preferências relacionadas a notificações da aplicação.
   * @property {string} ACCESSIBILITY - Preferências relacionadas à acessibilidade da aplicação.
   * @property {string} DISPLAY - Preferências relacionadas à exibição de conteúdo na aplicação.
   * @property {string} LANGUAGE - Preferências relacionadas ao idioma da aplicação.
   * @property {string} COOKIES - Preferências relacionadas ao gerenciamento de cookies.
   * @example
   * // Exemplo de uso:
   * const userTheme = localStorage.getItem(PREFERENCE_CATEGORIES.THEME);
   */
export const PREFERENCE_CATEGORIES = {
    THEME: 'theme',
    PRIVACY: 'privacy',
    NOTIFICATIONS: 'notifications',
    ACCESSIBILITY: 'accessibility',
    DISPLAY: 'display',
    LANGUAGE: 'language',
    COOKIES: 'cookies'
};

/**
   * Constantes de períodos de tempo para filtragem de dados.
   * @namespace TIME_RANGES
   * @type {Object}
   * @property {number} LAST_MINUTE - Período de tempo correspondente ao último minuto (em milissegundos).
   * @property {number} LAST_5_MINUTES - Período de tempo correspondente aos últimos 5 minutos (em milissegundos).
   * @property {number} LAST_HOUR - Período de tempo correspondente à última hora (em milissegundos).
   * @example
   * // Exemplo de uso:
   * const dataFromLastHour = data.filter(item => item.timestamp > Date.now() - TIME_RANGES.LAST_HOUR);
   */
export const TIME_RANGES = {
    LAST_MINUTE: 60 * 1000,
    LAST_5_MINUTES: 5 * 60 * 1000,
    LAST_HOUR: 60 * 60 * 1000
};

/**
   * Constantes para representar o estado de um circuito (Circuit Breaker pattern).
   * @namespace CircuitState
   * @enum {string}
   * @property {string} CLOSED - O circuito está fechado, o fluxo normal de execução é permitido.
   * @property {string} OPEN - O circuito está aberto, o fluxo normal de execução é interrompido.
   * @property {string} HALF_OPEN - O circuito está em estado semiaberto, tentando recuperar o fluxo normal.
   * @example
   * // Exemplo de uso:
   * if (circuitState === CircuitState.OPEN) {
   * // Lógica para tratamento de falha
   * }
   */
export const CircuitState = {
    CLOSED: 'CLOSED',
    OPEN: 'OPEN',
    HALF_OPEN: 'HALF_OPEN'
};

/**
   * Constantes para representar os tipos de erros de resiliência.
   * @namespace ResilienceError
   * @enum {string}
   * @property {string} CIRCUIT_OPEN - Erro indicando que o circuito está aberto (Circuit Breaker).
   * @property {string} MAX_RETRIES - Erro indicando que o número máximo de retentativas foi atingido.
   * @property {string} TIMEOUT - Erro indicando que a operação excedeu o tempo limite.
   * @property {string} DEPENDENCY_FAILURE - Erro indicando falha em uma dependência.
   * @property {string} INFINITE_LOOP - Erro indicando potencial loop infinito.
   * @example
   * // Exemplo de uso:
   * if (errorType === ResilienceError.TIMEOUT) {
   * // Lógica para tratamento de timeout
   * }
   */
export const ResilienceError = {
    CIRCUIT_OPEN: 'CIRCUIT_OPEN',
    MAX_RETRIES: 'MAX_RETRIES',
    TIMEOUT: 'TIMEOUT',
    DEPENDENCY_FAILURE: 'DEPENDENCY_FAILURE',
    INFINITE_LOOP: 'INFINITE_LOOP'
};

/**
   * Constantes para representar as fases de inicialização da aplicação.
   * @namespace InitializationPhase
   * @type {Object}
   * @property {Object} CORE - Fase de inicialização dos serviços essenciais para o funcionamento básico da aplicação.
   * @property {number} CORE.order - Ordem da fase de inicialização.
   * @property {string} CORE.name - Nome da fase de inicialização.
   * @property {Array<string>} CORE.services - Lista dos serviços inicializados nesta fase.
   * @property {boolean} CORE.required - Indica se a fase é obrigatória para a inicialização da aplicação.
   * @property {Object} ESSENTIAL - Fase de inicialização dos serviços essenciais para a funcionalidade principal da aplicação.
   * @property {number} ESSENTIAL.order - Ordem da fase de inicialização.
   * @property {string} ESSENTIAL.name - Nome da fase de inicialização.
   * @property {Array<string>} ESSENTIAL.services - Lista dos serviços inicializados nesta fase.
   * @property {boolean} ESSENTIAL.required - Indica se a fase é obrigatória para a inicialização da aplicação.
   * @property {Object} COMMUNICATION - Fase de inicialização dos serviços relacionados à comunicação na aplicação.
   * @property {number} COMMUNICATION.order - Ordem da fase de inicialização.
   * @property {string} COMMUNICATION.name - Nome da fase de inicialização.
   * @property {Array<string>} COMMUNICATION.services - Lista dos serviços inicializados nesta fase.
   * @property {boolean} COMMUNICATION.required - Indica se a fase é obrigatória para a inicialização da aplicação.
   * @property {Object} FEATURES - Fase de inicialização dos serviços relacionados a funcionalidades específicas da aplicação.
   * @property {number} FEATURES.order - Ordem da fase de inicialização.
   * @property {string} FEATURES.name - Nome da fase de inicialização.
   * @property {Array<string>} FEATURES.services - Lista dos serviços inicializados nesta fase.
   * @property {boolean} FEATURES.required - Indica se a fase é obrigatória para a inicialização da aplicação.
   * @property {Object} PRESENTATION - Fase de inicialização dos serviços relacionados à apresentação da aplicação.
   * @property {number} PRESENTATION.order - Ordem da fase de inicialização.
   * @property {string} PRESENTATION.name - Nome da fase de inicialização.
   * @property {Array<string>} PRESENTATION.services - Lista dos serviços inicializados nesta fase.
   * @property {boolean} PRESENTATION.required - Indica se a fase é obrigatória para a inicialização da aplicação.
   * @example
   * // Exemplo de uso:
   * const coreServices = InitializationPhase.CORE.services;
   */
export const InitializationPhase = {
    CORE: {
        order: 1,
        name: 'CORE',
        services: ['eventActionBridge', 'store', 'authToken', 'apiService', 'auth'],
        required: true
    },
    ESSENTIAL: {
        order: 2,
        name: 'ESSENTIAL',
        services: ['users', 'interests', 'invites', 'userPreferences'],
        required: true
    },
    COMMUNICATION: {
        order: 3,
        name: 'COMMUNICATION',
        services: ['socketService', 'notifications', 'connections', 'messages', 'socketService'],
        required: false
    },
    FEATURES: {
        order: 4,
        name: 'FEATURES',
        services: ['caixinhas', 'banking'],
        required: false
    },
    PRESENTATION: {
        order: 5,
        name: 'PRESENTATION',
        services: ['dashboard'],
        required: false
    }
};

/**
   * Configuração de cache para mensagens.
   * @namespace MESSAGE_CACHE_CONFIG
   * @type {Object}
   * @property {string} MESSAGES_KEY - Chave para armazenar todas as mensagens no cache.
   * @property {string} UNREAD_KEY - Chave para armazenar mensagens não lidas no cache.
   * @property {string} LATEST_KEY - Chave para armazenar as últimas mensagens no cache.
   * @property {string} ACTIVE_CHATS_KEY - Chave para armazenar chats ativos no cache.
   * @property {number} CACHE_TIME - Tempo de vida do cache (em milissegundos).
   * @property {number} STALE_TIME - Tempo após o qual os dados do cache são considerados obsoletos (em milissegundos).
   * @property {number} POLLING_INTERVAL - Intervalo de tempo para verificar atualizações (em milissegundos).
   * @example
   * // Exemplo de uso:
   * const messages = cache.get(MESSAGE_CACHE_CONFIG.MESSAGES_KEY);
   */
export const MESSAGE_CACHE_CONFIG = {
    MESSAGES_KEY: 'messages:all',
    UNREAD_KEY: 'messages:unread',
    LATEST_KEY: 'messages:latest',
    ACTIVE_CHATS_KEY: 'messages:active-chats',
    CACHE_TIME: 5 * 60 * 1000, // 5 minutes
    STALE_TIME: 30 * 1000, // 30 seconds
    POLLING_INTERVAL: 10 * 1000 // 10 seconds
};

export const NOTIFICATION_CACHE_CONFIG = {
    NOTIFICATIONS_KEY: 'notifications:all',
    UNREAD_KEY: 'notifications:unread',
    LATEST_KEY: 'notifications:latest',
    CACHE_TIME: 5 * 60 * 1000, // 5 minutos
    STALE_TIME: 30 * 1000, // 30 segundos
    POLLING_INTERVAL: 30 * 1000 // 30 segundos (você já estava usando este valor)
};

/**
   * Configurações de Cache usadas pelo serviço de Caixinhas
   * @namespace CAIXINHA_CACHE_CONFIG
   * @type {Object}
   * @property {string} CAIXINHAS_KEY - Chave para armazenar a lista de caixinhas do usuário no cache
   * @property {string} SINGLE_CAIXINHA_KEY - Chave para armazenar uma única caixinha específica no cache
   * @property {number} CACHE_TIME - Tempo total em cache para listas de caixinhas (5 minutos)
   * @property {number} STALE_TIME - Tempo em que os dados são considerados válidos antes de nova requisição (30 segundos)
   * @property {number} SINGLE_CACHE_TIME - Tempo total em cache para uma caixinha individual (2 minutos)
   * @property {number} SINGLE_STALE_TIME - Tempo válido para dados individuais antes da atualização (15 segundos)
   * @example
   * // Exemplo de uso para configurar o cache de uma requisição:
   * fetchCaixinhas({
   * cacheKey: CAIXINHA_CACHE_CONFIG.CAIXINHAS_KEY,
   * cacheTime: CAIXINHA_CACHE_CONFIG.CACHE_TIME
   * });
   */
export const CAIXINHA_CACHE_CONFIG = {
    CAIXINHAS_KEY: 'user:caixinhas', // Chave para armazenar a lista de caixinhas do usuário
    SINGLE_CAIXINHA_KEY: 'caixinha:single', // Chave para armazenar uma única caixinha específica
    CACHE_TIME: 5 * 60 * 1000, // Tempo total em cache: 5 minutos
    STALE_TIME: 30 * 1000, // Tempo em que os dados são considerados válidos antes de nova requisição: 30 segundos
    SINGLE_CACHE_TIME: 2 * 60 * 1000, // Tempo total em cache para uma caixinha individual: 2 minutos
    SINGLE_STALE_TIME: 15 * 1000 // Tempo válido para dados individuais antes da atualização: 15 segundos
};

/**
   * Chaves de Cache usadas pelo serviço de Usuário
   * @namespace USER_CACHE_KEYS
   * @type {Object}
   * @property {string} USER_PROFILE - Chave para armazenar o perfil do usuário no cache
   * @property {string} USERS_LIST - Chave para armazenar a lista completa de usuários no cache
   * @example
   * // Exemplo de uso para buscar o perfil do usuário do cache:
   * const userProfile = cacheService.get(USER_CACHE_KEYS.USER_PROFILE);
   */
export const USER_CACHE_KEYS = {
    USER_PROFILE: 'user:profile', // Chave para armazenar o perfil do usuário
    USERS_LIST: 'users:list' // Chave para armazenar a lista completa de usuários
};

/**
   * Níveis de log utilizados por todos os serviços
   * @namespace LOG_LEVELS
   * @enum {string}
   * @property {string} INITIALIZATION - Logs relacionados à inicialização dos serviços
   * @property {string} LIFECYCLE - Logs referentes ao ciclo de vida da aplicação
   * @property {string} STATE - Logs de alterações de estado da aplicação
   * @property {string} NETWORK - Logs sobre requisições e respostas de rede
   * @property {string} PERFORMANCE - Logs referentes ao desempenho e métricas
   * @property {string} ERROR - Logs de erros críticos da aplicação
   * @property {string} DEBUG - Logs de depuração com detalhes internos
   * @property {string} INFO - Logs informativos gerais
   * @property {string} WARNING - Logs de alertas e avisos importantes
   * @example
   * // Exemplo de uso para registrar um erro:
   * coreLogger.log(LOG_LEVELS.ERROR, 'Falha na conexão com o servidor', { error });
   */
export const LOG_LEVELS = {
    INITIALIZATION: 'INIT', // Logs relacionados à inicialização
    LIFECYCLE: 'LIFECYCLE', // Logs referentes ao ciclo de vida da aplicação
    STATE: 'STATE', // Logs de alterações de estado da aplicação
    NETWORK: 'NETWORK', // Logs sobre requisições e respostas de rede
    PERFORMANCE: 'PERF', // Logs referentes ao desempenho
    ERROR: 'ERROR', // Logs de erros críticos
    DEBUG: 'DEBUG', // Logs de depuração (detalhes internos)
    INFO: 'INFO', // Logs informativos gerais
    WARNING: 'WARNING', // Logs de alertas e avisos importantes
    POLLING: 'POLLING', // Logs de requisições de polling
    TASK_REMOVED: 'TASK_REMOVED', // Logs de tarefas removidas
    TASK_ADDED: 'TASK_ADDED', // Logs de tarefas adicionadas
};

/**
   * Níveis de severidade associados aos níveis de log
   * @namespace SEVERITY_LEVELS
   * @type {Object}
   * @description Mapeamento de níveis de log para valores de severidade (0-3),
   * onde 0 é a maior prioridade/criticidade e 3 é a menor.
   * Usado para determinar a prioridade de visualização e tratamento dos logs.
   * @property {number} ERROR - Erros críticos, prioridade máxima (0)
   * @property {number} INITIALIZATION - Inicialização do serviço (1)
   * @property {number} NETWORK - Questões relacionadas à rede (1)
   * @property {number} STATE - Mudanças de estado intermediárias (2)
   * @property {number} LIFECYCLE - Eventos do ciclo de vida (2)
   * @property {number} PERFORMANCE - Métricas de desempenho (2)
   * @property {number} DEBUG - Informações detalhadas para debugging (3)
   * @property {number} INFO - Informações gerais menos críticas (3)
   * @example
   * // Exemplo de uso para filtrar logs com base na severidade:
   * if (SEVERITY_LEVELS[log.level] <= LOG_CONFIG.minSeverity) {
   * displayLog(log);
   * }
   */
export const SEVERITY_LEVELS = {
    [LOG_LEVELS.ERROR]: 0, // Erros críticos, prioridade máxima
    [LOG_LEVELS.INITIALIZATION]: 1, // Inicialização do serviço
    [LOG_LEVELS.NETWORK]: 1, // Questões relacionadas à rede
    [LOG_LEVELS.STATE]: 2, // Mudanças de estado intermediárias
    [LOG_LEVELS.LIFECYCLE]: 2, // Eventos do ciclo de vida
    [LOG_LEVELS.PERFORMANCE]: 2, // Métricas de desempenho
    [LOG_LEVELS.DEBUG]: 3, // Informações detalhadas para debugging
    [LOG_LEVELS.INFO]: 3, // Informações gerais menos críticas
    [LOG_LEVELS.POLLING]: 3, // Logs de requisições de polling
    [LOG_LEVELS.TASK_REMOVED]: 3, // Logs de tarefas removidas
    [LOG_LEVELS.TASK_ADDED]: 3, // Logs de tarefas adicion
};

/**
   * Mapeamento inverso dos níveis de severidade para níveis de log
   * @namespace SEVERITY_TO_LOG_LEVEL
   * @type {Object}
   * @description Permite encontrar o nível de log correspondente com base no valor da severidade.
   * Gerado dinamicamente a partir do objeto SEVERITY_LEVELS.
   * @example
   * // Exemplo de uso para obter o nível de log pela severidade:
   * const logLevel = SEVERITY_TO_LOG_LEVEL[2]; // Retorna o nível de log com severidade 2
   */
export const SEVERITY_TO_LOG_LEVEL = Object
    .entries(SEVERITY_LEVELS)
    .reduce((acc, [logLevel, severity]) => {
        acc[severity] = logLevel;
        return acc;
    }, {});

/**
   * Configuração dos níveis críticos de serviços
   * @namespace CRITICAL_SERVICES
   * @type {Object}
   * @description Determina a prioridade de inicialização e monitoramento dos serviços.
   * Os valores mais altos indicam maior criticidade (escala de 1-5).
   * @property {number} AUTH - Serviço de autenticação (5 - crítico)
   * @property {number} AUTHTOKEN - Serviço de geração e validação de tokens (5 - crítico)
   * @property {number} MESSAGES - Serviço de mensagens (3 - médio)
   * @property {number} USERS - Serviço de gerenciamento de usuários (4 - alto)
   * @property {number} CAIXINHAS - Serviço de gerenciamento das caixinhas (5 - crítico)
   * @property {number} NOTIFICATIONS - Serviço de notificações (2 - baixo)
   * @property {number} DASHBOARD - Serviço de painel/dashboard (5 - crítico)
   * @property {number} INTERESTS - Serviço de gerenciamento de interesses (3 - médio)
   * @example
   * // Exemplo de uso para definir ordem de inicialização:
   * const servicesOrderedByCriticality = Object.entries(CRITICAL_SERVICES)
   * .sort((a, b) => b[1] - a[1])
   * .map(([service]) => service);
   */
export const CRITICAL_SERVICES = {
    EVENTACTIONBRIDGE: 5,
    STORE: 5,
    AUTHTOKEN: 5,
    APISERVICE: 5, 
    AUTH: 5,
    USERS: 4,
    INTERESTS: 4,
    INVITES: 4,
    USERPREFERENCES: 4,
    SOCKET: 3,
    NOTIFICATIONS: 3,
    CONNECTIONS: 3,
    MESSAGES: 3,
    SOCKET: 3,
    CAIXINHAS: 2,
    BANKING: 2,
    DASHBOARD: 1,
};

/**
   * Configurações gerais para controle dos logs da aplicação
   * @namespace LOG_CONFIG
   * @type {Object}
   * @property {number} minSeverity - Severidade mínima dos logs que serão exibidos (0-3)
   * @property {boolean} enableConsoleLogging - Determina se os logs serão exibidos no console
   * @description Configurações que controlam quais logs são exibidos e como são processados.
   * Em produção, apenas logs críticos são exibidos (severidade 0), enquanto em desenvolvimento
   * todos os logs são mostrados (severidade até 3).
   * @example
   * // Exemplo de uso para verificar se deve exibir um log:
   * if (LOG_CONFIG.enableConsoleLogging && severity <= LOG_CONFIG.minSeverity) {
   * console.log(`[${level}] ${message}`);
   * }
   */
export const LOG_CONFIG = {
    minSeverity: process.env.NODE_ENV === 'production'
        ? 0
        : 3, // Severidade mínima dos logs exibidos
    enableConsoleLogging: process.env.NODE_ENV === 'development' // Habilita logs no console apenas em desenvolvimento
};