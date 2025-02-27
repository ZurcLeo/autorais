// src/reducers/metadata/metadataReducer.js
// Document critical services and their initialization requirements
export const SERVICE_METADATA = {
  auth: {
    description: 'Authentication service provider',
    criticalPath: true,
    dependencies: [],
    timeout: 30000,
    initFn: async () => {
      console.log('Initializing AuthService...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('AuthService Ready.');
      return true
    }
  },
  user: {
    description: 'User management service',
    criticalPath: true,
    dependencies: ['auth'],
    timeout: 20000,
    initFn: async () => {
      console.log('Initializing UserService...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('UserService Ready.');
      return true
    }
  },
  notifications: {
    description: 'Notification management service',
    criticalPath: false,
    dependencies: ['auth', 'user'],
    timeout: 15000,
    initFn: async () => {
      console.log('Initializing NotificationService...');
      await new Promise(resolve => setTimeout(resolve, 1200));
      console.log('NotificationService Ready.');
      return true;
    }
  },
  connections: {
    description: 'Connections management service',
    criticalPath: false,
    dependencies: ['auth', 'user'],
    timeout: 15000,
    initFn: async () => {
      console.log('Initializing ConnectionsService...');
      await new Promise(resolve => setTimeout(resolve, 1300));
      console.log('ConnectionsService Ready.');
      return true
    }
  },
  messages: {
    description: 'Message management service',
    criticalPath: false,
    dependencies: ['auth', 'user'],
    timeout: 15000,
    initFn: async () => {
      console.log('Initializing MessagesService...');
      await new Promise(resolve => setTimeout(resolve, 1400));
      console.log('MessagesService Ready.');
      return true
    }
  },
  interests: {
    description: 'Interests management service',
    criticalPath: false,
    dependencies: ['auth', 'user', 'connections'],
    timeout: 15000,
    initFn: async () => {
      console.log('Initializing InterestsService...');
      await new Promise(resolve => setTimeout(resolve, 1100));
      console.log('InterestsService Ready.');
      return true
    }
  },
  caixinhas: {
    description: 'Caixinhas management service',
    criticalPath: false,
    dependencies: ['auth', 'user', 'connections', 'messages'],
    timeout: 15000,
    initFn: async () => {
      console.log('Initializing CaixinhasService...');
      await new Promise(resolve => setTimeout(resolve, 1250));
      console.log('CaixinhasService Ready.');
      return true
    }
  },
  dashboard: {
    description: 'Dashboard management service',
    criticalPath: false,
    dependencies: ['auth', 'user', 'connections', 'messages', 'interests', 'caixinhas'],
    timeout: 15000,
    initFn: async () => {
      console.log('Initializing DashboardService...');
      await new Promise(resolve => setTimeout(resolve, 1350));
      console.log('DashboardService Ready.');
      return true
    }
  }
};

export const LOG_LEVELS = {
    INITIALIZATION: 'INIT',
    LIFECYCLE: 'LIFECYCLE',
    STATE: 'STATE',
    NETWORK: 'NETWORK',
    PERFORMANCE: 'PERF',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARNING: 'WARNING',
};

export const SEVERITY_LEVELS = {
  [LOG_LEVELS.ERROR]: 0,
  [LOG_LEVELS.INITIALIZATION]: 1,
  [LOG_LEVELS.NETWORK]: 1,
  [LOG_LEVELS.STATE]: 2,
  [LOG_LEVELS.LIFECYCLE]: 2,
  [LOG_LEVELS.PERFORMANCE]: 2,
  [LOG_LEVELS.DEBUG]: 3,
  [LOG_LEVELS.INFO]: 3
};

// Reverse mapping for severity levels to LOG_LEVELS strings
export const SEVERITY_TO_LOG_LEVEL = Object.entries(SEVERITY_LEVELS).reduce((acc, [logLevel, severity]) => {
  acc[severity] = logLevel;
  return acc;
}, {});

export const CRITICAL_SERVICES = {
    AUTH: 5,
    MESSAGES: 3,
    USERS: 4,
    CAIXINHAS: 5,
    NOTIFICATIONS: 2,
    DASHBOARD: 5
};

export const LOG_CONFIG = {
    minSeverity: process.env.NODE_ENV === 'production' ? 0 : 3,
    enableConsoleLogging: process.env.NODE_ENV === 'development'
};

export const METADATA_ACTIONS = {
  UPDATE_SERVICE_TIMEOUT: 'UPDATE_SERVICE_TIMEOUT',
  UPDATE_SERVICE_DEPENDENCIES: 'UPDATE_SERVICE_DEPENDENCIES',
  UPDATE_SERVICE_CRITICAL_PATH: 'UPDATE_SERVICE_CRITICAL_PATH',
  ADD_SERVICE: 'ADD_SERVICE',
  REMOVE_SERVICE: 'REMOVE_SERVICE',
  UPDATE_SEVERITY_LEVEL: 'UPDATE_SEVERITY_LEVEL',
  UPDATE_LOG_CONFIG: 'UPDATE_LOG_CONFIG',
  RESET_METADATA: 'RESET_METADATA'
};

export const initialState = {
  metadata: SERVICE_METADATA,
  loading: false,
  error: null
};

function validateDependencies(dependencies, availableServices) {
  return dependencies.every(dep => availableServices.includes(dep));
}

function hasDependencyCycle(services, serviceName, dependencies, visited = new Set()) {
  if (visited.has(serviceName)) return true;
  visited.add(serviceName);
  
  return dependencies.some(dep => {
    if (!services[dep]) return false;
    return hasDependencyCycle(services, dep, services[dep].dependencies, new Set(visited));
  });
}

const metadataReducer = (state = initialState.metadata, action) => {
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
      case METADATA_ACTIONS.UPDATE_SERVICE_TIMEOUT: {
        const { serviceName, timeout } = action.payload;
        
        if (!state[serviceName]) {
          throw new Error(`Service ${serviceName} not found`);
        }

        if (timeout < 0) {
          throw new Error('Timeout cannot be negative');
        }

        logAction('Updating service timeout', { serviceName, timeout });

        return {
          ...state,
          [serviceName]: {
            ...state[serviceName],
            timeout
          }
        };
      }

      case METADATA_ACTIONS.UPDATE_SERVICE_DEPENDENCIES: {
        const { serviceName, dependencies } = action.payload;
        
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

        logAction('Updating service dependencies', { serviceName, dependencies });

        return {
          ...state,
          [serviceName]: {
            ...state[serviceName],
            dependencies
          }
        };
      }

      case METADATA_ACTIONS.UPDATE_SERVICE_CRITICAL_PATH: {
        const { serviceName, criticalPath } = action.payload;
        
        if (!state[serviceName]) {
          throw new Error(`Service ${serviceName} not found`);
        }

        logAction('Updating critical path', { serviceName, criticalPath });

        return {
          ...state,
          [serviceName]: {
            ...state[serviceName],
            criticalPath
          }
        };
      }

      case METADATA_ACTIONS.ADD_SERVICE: {
        const { serviceName, serviceConfig } = action.payload;
        
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

        logAction('Adding new service', { serviceName, serviceConfig });

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

      case METADATA_ACTIONS.REMOVE_SERVICE: {
        const { serviceName } = action.payload;
        
        if (!state[serviceName]) {
          throw new Error(`Service ${serviceName} not found`);
        }

        // Verifica se algum serviço depende deste
        const dependentServices = Object.entries(state)
          .filter(([_, service]) => service.dependencies.includes(serviceName));

        if (dependentServices.length > 0) {
          throw new Error(`Cannot remove service: ${dependentServices.map(([name]) => name).join(', ')} depend on it`);
        }

        logAction('Removing service', { serviceName });

        const newState = { ...state };
        delete newState[serviceName];
        return newState;
      }

      case METADATA_ACTIONS.UPDATE_SEVERITY_LEVEL: {
        const { level, severity } = action.payload;
        
        if (!LOG_LEVELS[level]) {
          throw new Error(`Invalid log level: ${level}`);
        }

        if (typeof severity !== 'number' || severity < 0) {
          throw new Error('Invalid severity value');
        }

        logAction('Updating severity level', { level, severity });

        return {
          ...state,
          SEVERITY_LEVELS: {
            ...state.SEVERITY_LEVELS,
            [level]: severity
          }
        };
      }

      case METADATA_ACTIONS.UPDATE_LOG_CONFIG: {
        const { config } = action.payload;

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

export default metadataReducer;