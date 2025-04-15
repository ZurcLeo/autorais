// src/reducers/metadata/metadataReducer.js
import {METADATA_ACTIONS} from "../../core/constants/actions.js";
import { initialState } from "../../core/constants/initialState.js";
import {LOG_LEVELS, LOG_CONFIG} from "../../core/constants/config.js";

export const SERVICE_METADATA = {
    eventActionBridge: {
        description: 'Sistema de comunicação entre serviços via eventos',
        criticalPath: true, // Não é crítico porque a aplicação pode funcionar sem ele
        phase: 'CORE',
        order: 1,
        dependencies: [], // Depende do store para despachar ações
        timeout: 5000,
        initFn: async () => {
            console.log('Initializing EventActionBridge...');
            await new Promise(resolve => setTimeout(resolve, 400));
            console.log('EventActionBridge Ready.');
            return true;
        }
    },
    store: {
        description: 'Redux store service that manages application state',
        criticalPath: true,
        phase: 'CORE',
        order: 2,
        dependencies: ['eventActionBridge'],
        timeout: 8000,
        initFn: async () => {
            console.log('Initializing StoreService...');
            await new Promise(resolve => setTimeout(resolve, 600));
            console.log('StoreService Ready.');
            return true;
        }
    },
    authToken: {
        description: 'AuthToken management service.',
        criticalPath: true,
        phase: 'CORE',
        order: 3,
        dependencies: ['store'],
        timeout: 4000,
        initFn: async () => {
            console.log('Initializing AuthToken...');
            await new Promise(resolve => setTimeout(resolve, 800));
            console.log('AuthToken Ready.');
            return true;
        }
    },
    apiService: {
        description: 'ApiService management.',
        criticalPath: true,
        phase: 'CORE',
        order: 4,
        dependencies: ['authToken'],
        timeout: 3000,
        initFn: async () => {
            console.log('Initializing ApiService...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('ApiService Ready.');
            return true;
        }
    },
    auth: {
        description: 'Authentication service provider',
        criticalPath: true,
        phase: 'CORE',
        order: 5,
        dependencies: ['apiService'],
        timeout: 10000,
        initFn: async () => {
            console.log('Initializing AuthService - Start');
            await new Promise(resolve => setTimeout(resolve, 1200));
            console.log('AuthService Ready.');
            return true;
        }
    },
    users: {
        description: 'User management service',
        criticalPath: true,
        phase: 'ESSENTIAL',
        order: 6,
        dependencies: ['auth'],
        timeout: 8000,
        initFn: async () => {
            console.log('Initializing UserService...');
            await new Promise(resolve => setTimeout(resolve, 1400));
            console.log('UserService Ready.');
            return true
        }
    },
    interests: {
        description: 'Interests management service',
        criticalPath: true,
        phase: 'ESSENTIAL',
        order: 7,
        dependencies: ['auth'],
        timeout: 6000,
        initFn: async () => {
            console.log('Initializing InterestsService...');
            await new Promise(resolve => setTimeout(resolve, 1600));
            console.log('InterestsService Ready.');
            return true
        }
    },
    invites: {
        description: 'Invite service for managing user invitations',
        criticalPath: true,
        phase: 'ESSENTIAL',
        order: 8,
        dependencies: ['auth', 'users'],
        timeout: 6000,
        initFn: async () => {
          console.log('Initializing InviteService...');
          await new Promise(resolve => setTimeout(resolve, 1700));
          console.log('InviteService Ready.');
          return true;
        }
      },
    userPreferences: {
        description: 'userPreferences service for managing user User Preferences',
        criticalPath: true,
        phase: 'ESSENTIAL',
        order: 9,
        dependencies: ['auth', 'users'],
        timeout: 6000,
        initFn: async () => {
          console.log('Initializing UserPreferencesService...');
          await new Promise(resolve => setTimeout(resolve, 1800));
          console.log('UserPreferencesService Ready.');
          return true;
        }
      },
    notifications: {
        description: 'Notification management service',
        criticalPath: false,
        phase: 'COMMUNICATION',
        order: 10,
        dependencies: ['auth', 'users'],
        timeout: 6000,
        initFn: async () => {
            console.log('Initializing NotificationService...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('NotificationService Ready.');
            return true;
        }
    },
    connections: {
        description: 'Connections management service',
        criticalPath: false,
        phase: 'COMMUNICATION',
        order: 11,
        dependencies: ['auth', 'users'],
        timeout: 7000,
        initFn: async () => {
            console.log('Initializing ConnectionsService...');
            await new Promise(resolve => setTimeout(resolve, 2200));
            console.log('ConnectionsService Ready.');
            return true
        }
    },
    messages: {
        description: 'Message management service',
        criticalPath: false,
        phase: 'COMMUNICATION',
        order: 12,
        dependencies: ['auth', 'users'],
        timeout: 8000,
        initFn: async () => {
            console.log('Initializing MessagesService...');
            await new Promise(resolve => setTimeout(resolve, 2400));
            console.log('MessagesService Ready.');
            return true
        }
    },
    // Adicionar ao SERVICE_METADATA
socketService: {
    description: 'Serviço de comunicação em tempo real via Socket.IO',
    criticalPath: false, // Não é crítico para inicialização da aplicação
    phase: 'COMMUNICATION', // Deve ser inicializado após os serviços básicos
    order: 12.5, // Inserimos entre messages e caixinhas
    dependencies: ['authToken'], // Depende do serviço authToken
    timeout: 8000,
    initFn: async () => {
        console.log('Initializing SocketService...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('SocketService Ready.');
        return true;
    }
},

    caixinhas: {
        description: 'Caixinhas management service',
        criticalPath: false,
        phase: 'FEATURES',
        order: 13,
        dependencies: ['auth', 'users'],
        timeout: 7000,
        initFn: async () => {
            console.log('Initializing CaixinhasService...');
            await new Promise(resolve => setTimeout(resolve, 2600));
            console.log('CaixinhasService Ready.');
            return true
        }
    },
    dashboard: {
        description: 'Dashboard management service',
        criticalPath: false,
        phase: 'PRESENTATION',
        order: 14,
        dependencies: ['auth', 'users'],
        timeout: 7000,
        initFn: async () => {
            console.log('Initializing DashboardService...');
            await new Promise(resolve => setTimeout(resolve, 2800));
            console.log('DashboardService Ready.');
            return true
        }
    }
};



function validateDependencies(dependencies, availableServices) {
    return dependencies.every(dep => availableServices.includes(dep));
}

function hasDependencyCycle(
    services,
    serviceName,
    dependencies,
    visited = new Set()
) {
    if (visited.has(serviceName)) 
        return true;
    visited.add(serviceName);

    return dependencies.some(dep => {
        if (!services[dep]) 
            return false;
        return hasDependencyCycle(
            services,
            dep,
            services[dep].dependencies,
            new Set(visited)
        );
    });
}

export const metadataReducer = (state = initialState.metadata, action) => {
    const logAction = (type, details) => {
        if (LOG_CONFIG.enableConsoleLogging) {
            console.log(`[MetadataReducer] ${type}:`, details);
        }
    };

    try {
        if (!action || typeof action !== 'object') {
            console.warn('[MetadataReducer] Received invalid action:', action);
            return state;
        }
        switch (action.type) {
            case METADATA_ACTIONS.UPDATE_SERVICE_TIMEOUT:
                {
                    const {serviceName, timeout} = action.payload;

                    if (!state[serviceName]) {
                        throw new Error(`Service ${serviceName} not found`);
                    }

                    if (timeout < 0) {
                        throw new Error('Timeout cannot be negative');
                    }

                    logAction('Updating service timeout', {serviceName, timeout});

                    return {
                        ...state,
                        [serviceName]: {
                            ...state[serviceName],
                            timeout
                        }
                    };
                }

            case METADATA_ACTIONS.UPDATE_SERVICE_DEPENDENCIES:
                {
                    const {serviceName, dependencies} = action.payload;

                    if (!state[serviceName]) {
                        throw new Error(`Service ${serviceName} not found`);
                    }

                    // Valida se todas as dependências existem
                    if (!validateDependencies(dependencies, Object.keys(state))) {
                        throw new Error('Invalid dependencies specified');
                    }

                    // Verifica ciclos de dependência
                    if (hasDependencyCycle(state, serviceName, dependencies)) {
                        throw new Error('Dependency cycle detected');
                    }

                    logAction('Updating service dependencies', {serviceName, dependencies});

                    return {
                        ...state,
                        [serviceName]: {
                            ...state[serviceName],
                            dependencies
                        }
                    };
                }

            case METADATA_ACTIONS.UPDATE_SERVICE_CRITICAL_PATH:
                {
                    const {serviceName, criticalPath} = action.payload;

                    if (!state[serviceName]) {
                        throw new Error(`Service ${serviceName} not found`);
                    }

                    logAction('Updating critical path', {serviceName, criticalPath});

                    return {
                        ...state,
                        [serviceName]: {
                            ...state[serviceName],
                            criticalPath
                        }
                    };
                }

            case METADATA_ACTIONS.ADD_SERVICE:
                {
                    const {serviceName, serviceConfig} = action.payload;

                    if (state[serviceName]) {
                        throw new Error(`Service ${serviceName} already exists`);
                    }

                    // Valida configuração mínima necessária
                    if (!serviceConfig.description || typeof serviceConfig.criticalPath !== 'boolean') {
                        throw new Error('Invalid service configuration');
                    }

                    // Valida dependências se especificadas
                    if (serviceConfig.dependencies && !validateDependencies(serviceConfig.dependencies, Object.keys(state))) {
                        throw new Error('Invalid dependencies specified');
                    }

                    logAction('Adding new service', {serviceName, serviceConfig});

                    return {
                        ...state,
                        [serviceName]: {
                            description: serviceConfig.description,
                            criticalPath: serviceConfig.criticalPath,
                            dependencies: serviceConfig.dependencies || [],
                            timeout: serviceConfig.timeout || 15000
                        }
                    };
                }

            case METADATA_ACTIONS.REMOVE_SERVICE:
                {
                    const {serviceName} = action.payload;

                    if (!state[serviceName]) {
                        throw new Error(`Service ${serviceName} not found`);
                    }

                    // Verifica se algum serviço depende deste
                    const dependentServices = Object
                        .entries(state)
                        .filter(([_, service]) => service.dependencies.includes(serviceName));

                    if (dependentServices.length > 0) {
                        throw new Error(
                            `Cannot remove service: ${dependentServices.map(([name]) => name).join(', ')} depend on it`
                        );
                    }

                    logAction('Removing service', {serviceName});

                    const newState = {
                        ...state
                    };
                    delete newState[serviceName];
                    return newState;
                }

            case METADATA_ACTIONS.UPDATE_SEVERITY_LEVEL:
                {
                    const {level, severity} = action.payload;

                    if (!LOG_LEVELS[level]) {
                        throw new Error(`Invalid log level: ${level}`);
                    }

                    if (typeof severity !== 'number' || severity < 0) {
                        throw new Error('Invalid severity value');
                    }

                    logAction('Updating severity level', {level, severity});

                    return {
                        ...state,
                        SEVERITY_LEVELS: {
                            ...state.SEVERITY_LEVELS,
                            [level]: severity
                        }
                    };
                }

            case METADATA_ACTIONS.UPDATE_LOG_CONFIG:
                {
                    const {config} = action.payload;

                    logAction('Updating log config', config);

                    return {
                        ...state,
                        LOG_CONFIG: {
                            ...state.LOG_CONFIG,
                            ...config
                        }
                    };
                }

            case METADATA_ACTIONS.RESET_METADATA:
                logAction('Resetting metadata to initial state');
                return SERVICE_METADATA;

            default:
                return state;
        }
    } catch (error) {
        logAction('Error in metadata reducer', error.message);

        // Em desenvolvimento, lança o erro para facilitar o debugging
        if (process.env.NODE_ENV === 'development') {
            throw error;
        }

        // Em produção, mantém o estado atual
        return state;
    }
};