// src/core/services/BaseService.js
import { SERVICE_METADATA } from '../../reducers/metadata/metadataReducer';
import { SERVICE_ACTIONS } from '../constants/actions';
import { serviceInitializer } from '../initialization/ServiceInitializer';
import { coreLogger } from '../logging';
import { retryManager } from '../resilience/RetryManager';

// Sistema de eventos centralizado para comunicação entre serviços
class ServiceEventHub {
  constructor() {
    this.instanceId = Math.random().toString(36).substring(2, 10);
    coreLogger.log(`ServiceEventHub construtor chamado, instanceId: ${this.instanceId}`);

    this.eventBuffer = [];
    this.listeners = new Map();
    this.globalListeners = new Map();

    coreLogger.log(`📊 Nova instância de ServiceEventHub criada, instanceId: ${this.instanceId}`);
  }

  /**
   * Registra um listener para um evento específico de um serviço
   * @param {string} serviceName - Nome do serviço emissor
   * @param {string} eventType - Tipo do evento 
   * @param {Function} callback - Função callback
   * @returns {Function} Função para cancelar a inscrição
   */
  on(serviceName, eventType, callback) {
    const key = `${serviceName}:${eventType}`;
    
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key).add(callback);
    
    return () => {
      if (this.listeners.has(key)) {
        this.listeners.get(key).delete(callback);
      }
    };
  }

  /**
   * Registra um listener para um tipo de evento de qualquer serviço
   * @param {string} eventType - Tipo do evento
   * @param {Function} callback - Função callback
   * @returns {Function} Função para cancelar a inscrição
   */
  onAny(eventType, callback) {
    if (!this.globalListeners.has(eventType)) {
      this.globalListeners.set(eventType, new Set());
    }
    
    this.globalListeners.get(eventType).add(callback);
    
    console.log(`ServiceEventHub: Registrado listener global para ${eventType}`);

    return () => {
      if (this.globalListeners.has(eventType)) {
        this.globalListeners.get(eventType).delete(callback);
        console.log(`ServiceEventHub: Removido listener global para ${eventType}`);
      }
    };
  }

 /**
   * NECESSITA ATUALIZACAO DE DOCUMENTACAO
   * Emite um evento para listeners específicos e globais
   * @param {string} serviceName - Nome do serviço emissor
   * @param {string} eventType - Tipo do evento
   * @param {*} data - Dados do evento
   */
 emit(serviceName, eventType, data = {}) {
  // 1. Validar parâmetros de entrada
  const validServiceName = typeof serviceName === 'string' ? serviceName : 'unknown';
  const validEventType = typeof eventType === 'string' ? eventType : 'unknown';

  // 2. Criar objeto de evento padronizado
  const timestamp = Date.now();
  const traceId = `trace-${validServiceName}-${validEventType}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;

  const event = {
    id: timestamp,
    serviceName: validServiceName,
    eventType: validEventType,
    data: typeof data === 'object' && data !== null ? { ...data } : { value: data },
    timestamp: new Date(),
    _metadata: {
      traceId,
      serviceName: validServiceName,
      eventType: validEventType
    }
  };

  // 3. Gerenciar o buffer de eventos
  this.eventBuffer.push(event);
  if (this.eventBuffer.length > 1000) this.eventBuffer.shift();

  // 4. Notificar listeners específicos
  const key = `${validServiceName}:${validEventType}`;
  if (this.listeners.has(key)) {
    try {
      this.listeners.get(key).forEach(listener => {
        try {
          listener(event.data); // Passar apenas os dados do evento
        } catch (listenerError) {
          console.error(`Listener error for ${key}:`, listenerError);
          // Consider logging the error with a more robust logging mechanism
        }
      });
    } catch (error) {
      console.error(`Error notifying specific listeners for ${key}:`, error);
      // Consider logging the error with a more robust logging mechanism
    }
  }

  // 5. Notificar listeners globais
  if (this.globalListeners.has('*')) {
    try {
      this.globalListeners.get('*').forEach(listener => {
        try {
          listener(validServiceName, validEventType, event.data); // Passar apenas os dados do evento
        } catch (listenerError) {
          console.error(`Global listener error for ${validEventType}:`, listenerError);
          // Consider logging the error with a more robust logging mechanism
        }
      });
    } catch (error) {
      console.error(`Error notifying global listeners for ${validEventType}:`, error);
      // Consider logging the error with a more robust logging mechanism
    }
  }

  // 6. Log do evento
  console.log(`ServiceEventHub: Emitindo evento ${validServiceName}:${validEventType}`, {
    eventData: event.data,
    traceId,
    listeners: {
      specific: this.listeners.has(key) ? this.listeners.get(key).size : 0,
      global: this.globalListeners.has('*') ? this.globalListeners.get('*').size : 0 // Corrigido para '*'
    }
  });

  // 7. Adicionar ao rastreamento global (browser-only)
  if (typeof window !== 'undefined' && window._eventTracing) {
    window._eventTracing.push({
      type: 'EVENT_EMITTED',
      traceId,
      serviceName: validServiceName,
      eventType: validEventType,
      timestamp
    });
  }
}

  getBufferedEvents() {
    return [...this.eventBuffer];
  }  

  /**
   * Desregistra um listener para um evento específico de um serviço
   * @param {string} serviceName - Nome do serviço emissor
   * @param {string} eventType - Tipo do evento
   * @param {Function} callback - Função callback
   */
  off(serviceName, eventType, callback) {
    const key = `${serviceName}:${eventType}`;
    
    // Verificar se existe listeners para esse evento
    if (this.listeners.has(key)) {
      // Remover o callback da lista de listeners
      this.listeners.get(key).delete(callback);
      
      // Se não houver mais listeners para esse evento, removê-lo completamente
      if (this.listeners.get(key).size === 0) {
        this.listeners.delete(key);
      }

      console.log(`ServiceEventHub: Removed listener for ${serviceName}:${eventType}`);
    } else {
      console.warn(`ServiceEventHub: No listeners found for ${serviceName}:${eventType}`);
    }
  }

  /**
   * Desregistra um listener para um tipo de evento de qualquer serviço
   * @param {string} eventType - Tipo do evento
   * @param {Function} callback - Função callback
   */
  offAny(eventType, callback) {
    if (this.globalListeners.has(eventType)) {
      // Remover o callback da lista de listeners globais
      this.globalListeners.get(eventType).delete(callback);
      
      // Se não houver mais listeners para esse evento, removê-lo completamente
      if (this.globalListeners.get(eventType).size === 0) {
        this.globalListeners.delete(eventType);
      }

      console.log(`ServiceEventHub: Removed global listener for ${eventType}`);
    } else {
      console.warn(`ServiceEventHub: No global listeners found for ${eventType}`);
    }
  }
}

export const serviceEventHub = new ServiceEventHub();

class ServiceLocator {
  constructor() {
    this.registry = new Map();
    this.id = Math.random().toString(36).substring(2, 10); // ID único para depuração
    console.log(`ServiceLocator criado com ID: ${this.id}`);
    this.registry.forEach(id => {
      const service = this.registry.find(inv => inv.id === id);
      if (service && (service.status === 'pending' || service.status === 'expired')) {
        console.log('o que tem aqui?', this)

      }
    });
  }

  register(serviceName, serviceInstance) {
    console.log(`Usando serviceLocator com ID: ${serviceLocator.id} em [REGISTER - SERVICELOCATOR]`);
    if (this.registry.has(serviceName)) {
      console.warn(`Service ${serviceName} already registered.`);
    }
    this.registry.set(serviceName, serviceInstance);
  }

// Atualizar em ServiceLocator
get(serviceName) {
  // console.log(`[ServiceLocator ${this.id}] Obtendo serviço: ${serviceName}`);
  
  if (!this.registry.has(serviceName)) {
    console.error(`[ServiceLocator ${this.id}] Serviço ${serviceName} não encontrado!`);
    throw new Error(`Service ${serviceName} not found`);
  }
  
  const service = this.registry.get(serviceName);
  // console.log(`[ServiceLocator ${this.id}] Serviço ${serviceName} obtido com instanceId: ${service.instanceId || 'undefined'}`);
  
  return service;
}

// Adicionar método para listar todos os serviços
getServices() {
  const services = {};
  this.registry.forEach((service, name) => {
    services[name] = service;
  });
  return services;
}
  
}
export const serviceLocator = new ServiceLocator();


export class BaseService {
    constructor(serviceName) {

        if (!serviceName) {
            throw new Error('Service name is required');
        }

        this._serviceName = serviceName;
        this._metadata = SERVICE_METADATA?.[serviceName] || {};
        this._isInitialized = false;
        this._healthCheckInterval = null;
        this._loadingCount = 0; 

        if (serviceLocator && typeof serviceLocator.register === 'function') {
          serviceLocator.register(this._serviceName, this);
          console.log(`Usando serviceLocator com ID: ${serviceLocator.id} em [CONSTRUTOR - BASESERVICE]`);

      }
        if (!this._metadata) {
            throw new Error(`No metadata found for service: ${serviceName}`);
        }


        this._validateImplementation();
        this._registeredListeners = [];

    }

    registerWithInitializer(serviceInitializerInstance) {
      if (!serviceInitializerInstance) {
          this._log('warning', {
              message: 'ServiceInitializer not provided for registration',
              serviceName: this._serviceName
          });
          return;
      }

      try {
          // Extrair metadados relevantes
          const {
              dependencies = [],
              criticalPath = false,
              phase = 'FEATURES',
              lazy = false,
              category = 'general',
              description = '',
              noAutoRegister = false
          } = this._metadata || {};

          // // Permitir que serviços optem por não serem registrados
          // if (noAutoRegister) {
          //     this._log('info', {
          //         message: 'Registration skipped per metadata configuration',
          //         serviceName: this._serviceName
          //     });
          //     return;
          // }

          // Registrar o serviço
          serviceInitializerInstance.registerService(this._serviceName, this, {
              dependencies,
              criticalPath,
              phase,
              lazy,
              category,
              description
          });

          this._log('info', {
              message: 'Service registered in ServiceInitializer',
              serviceName: this._serviceName,
              dependencies,
              phase
          });

          return this;
      } catch (error) {
          this._logError(error, 'service-registration');
      }
  }

    // API Pública
    async start() {
      if (this._isInitialized) {
          return;
      }

      const startTime = performance.now();

      try {
          this._emitEvent(SERVICE_ACTIONS.SERVICE_INIT); // Padronizado

          await this._validateDependencies();
          await this._initializeWithRetry();

          const duration = performance.now() - startTime;
          this._isInitialized = true;

          this._startHealthCheck();
          this._log('initialized', { duration });

          this._emitEvent(SERVICE_ACTIONS.SERVICE_READY, { // Padronizado
              initializationTime: duration,
              dependencies: this._metadata.dependencies || []
          });

          return true;
      } catch (error) {
          this._logError(error, 'initialization');
          this._emitEvent(SERVICE_ACTIONS.SERVICE_FAILED, { // Padronizado
              error: error.message,
              stack: error.stack
          });
          throw error;
      }
  }

    async stop() {
        if (!this._isInitialized) {
            return;
        }

        try {
            this._emitEvent(SERVICE_ACTIONS.REMOVE_SERVICE, this.serviceName);

            this._stopHealthCheck();
            await this.shutdown();
            this._isInitialized = false;
            this._log('stopped');
            this._unregisterAllListeners();
            this._emitEvent(SERVICE_ACTIONS.SERVICE_STOPPED, this.serviceName);
        } catch (error) {
            this._logError(error, 'shutdown');
            throw error;
        }
    }

    async shutdown() {
        // Opcional - implementação padrão vazia
    }

    async healthCheck() {
        throw new Error('healthCheck() must be implemented');
    }

_debugInstanceInfo() {
  return {
    serviceName: this._serviceName,
    instanceId: this.instanceId || 'undefined',
    isInitialized: this._isInitialized,
    currentTimestamp: new Date().toISOString(),
    hasUser: this._serviceName === 'auth' ? !!this._currentUser : 'N/A',
    userId: this._serviceName === 'auth' && this._currentUser ? this._currentUser.uid : 'N/A'
  };
}
// Modificar a função _registerInServiceInitializer para ser mais inteligente
_registerInServiceInitializer() {
  // Verificar se já existe flag para prevenir auto-registro
  if (this._metadata?.noAutoRegister) {
    this._log('info', {
      message: 'Auto-registration skipped per metadata configuration',
      serviceName: this._serviceName
    });
    return;
  }

  // Verificar se o serviço já está registrado no ServiceInitializer
  if (serviceInitializer && 
      typeof serviceInitializer.registeredServices === 'object' &&
      serviceInitializer.registeredServices.has(this._serviceName)) {
    this._log('info', {
      message: 'Service already registered in ServiceInitializer',
      serviceName: this._serviceName
    });
    return;
  }

  if (!serviceInitializer || typeof serviceInitializer.registerService !== 'function') {
    this._log('warning', {
      message: 'ServiceInitializer not available for auto-registration',
      serviceName: this._serviceName
    });
    return;
  }

  try {
    // Extrair metadados relevantes
    const {
      dependencies = [],
      criticalPath = false,
      phase = 'FEATURES', 
      lazy = false,
      category = 'general',
      description = ''
    } = this._metadata || {};

    // Registrar o serviço
    serviceInitializer.registerService(this._serviceName, this, {
      dependencies,
      criticalPath,
      phase,
      lazy,
      category,
      description
    });

    this._log('info', {
      message: 'Service auto-registered in ServiceInitializer',
      serviceName: this._serviceName,
      dependencies,
      phase
    });
  } catch (error) {
    this._logError(error, 'service-registration');
  }
}

// Modificação do método initialize para maior robustez
async initialize() {
  if (this._isInitialized) {
    this._log('info', {
      message: 'Service already initialized, skipping',
      serviceName: this._serviceName
    });
    return this;
  }

  const startTime = performance.now();

  try {
    this._emitEvent(SERVICE_ACTIONS.SERVICE_INIT);
    
    // Validar dependências (garantir que estão prontas)
    for (const dependencyName of (this._metadata?.dependencies || [])) {
      // Obter a instância do serviço
      let dependencyService;
      try {
        dependencyService = serviceLocator.get(dependencyName);
      } catch (error) {
        throw new Error(`Dependency ${dependencyName} not found in ServiceLocator`);
      }
      
      // Garantir que a dependência está inicializada
      if (!dependencyService.isInitialized) {
        this._log('info', {
          message: `Initializing dependency ${dependencyName}`,
          serviceName: this._serviceName
        });
        
        try {
          await dependencyService.initialize();
        } catch (error) {
          throw new Error(`Failed to initialize dependency ${dependencyName}: ${error.message}`);
        }
      }
    }

    // Agora podemos inicializar este serviço
    // Implementado por classes filho
    
    const duration = performance.now() - startTime;
    this._isInitialized = true;
    
    this._log('initialized', { duration });
    
    this._emitEvent(SERVICE_ACTIONS.SERVICE_READY, {
      initializationTime: duration,
      dependencies: this._metadata?.dependencies || []
    });
    
    return this;
  } catch (error) {
    this._logError(error, 'initialization');
    this._emitEvent(SERVICE_ACTIONS.SERVICE_FAILED, {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

 /**
     * Emite um evento específico do serviço
     * @param {string} eventType - Tipo do evento
     * @param {*} data - Dados do evento
     */
// Correção para BaseService.js - método _emitEvent
_emitEvent(eventType, data = {}) {
  // Garantir que eventType é sempre uma string válida
  if (!eventType) {
    console.error('_emitEvent chamado sem eventType válido');
    return;
  }
  
  // Preparar um objeto de metadados básico
  const eventMetadata = {
    timestamp: Date.now(),
    sourceService: this._serviceName,
    eventOrigin: 'service'
  };
  
  // Preparar o payload do evento com metadados garantidos
  const eventPayload = {
    ...data,
    _metadata: {
      ...(data._metadata || {}),  // Preservar metadados existentes, se houver
      ...eventMetadata            // Garantir metadados básicos
    }
  };

  const cleanEventType = typeof eventType === 'string' 
    ? eventType 
    : String(eventType);
    
  serviceEventHub.emit(this._serviceName, cleanEventType, eventPayload);    
}

    /**
     * Registra um listener para eventos de um serviço específico
     * @param {string} serviceName - Nome do serviço a observar
     * @param {string} eventType - Tipo do evento
     * @param {Function} callback - Função callback
     */
    _onServiceEvent(serviceName, eventType, callback) {
      this._log(`Registrando listener para ${serviceName}:${eventType}`);
      const unsubscribe = serviceEventHub.on(serviceName, eventType, callback);
      this._registeredListeners.push(unsubscribe); // Armazena a função de unsubscribe
      return unsubscribe;
  }

  /**
   * Registra um listener para eventos de qualquer serviço
   * @param {string} eventType - Tipo do evento
   * @param {Function} callback - Função callback
   */
  _onAnyServiceEvent(eventType, callback) {
      const unsubscribe = serviceEventHub.onAny(eventType, callback);
      this._registeredListeners.push(unsubscribe); // Armazena a função de unsubscribe
      return unsubscribe;
  }

  /**
   * Cancela o registro de todos os listeners
   */
  _unregisterAllListeners() {
      this._registeredListeners.forEach(unsubscribe => {
          if (typeof unsubscribe === 'function') {
              unsubscribe(); // Chama a função para cancelar a inscrição
          } else {
              console.warn('Tentativa de cancelar uma inscrição que não é uma função.');
          }
      });
      this._registeredListeners = []; // Limpa o array de listeners
  }

    // Métodos protegidos para uso dos serviços filhos
    async _executeWithRetry(operation, context) {
        this._log(`[BaseService] Starting retry for ${this._serviceName}:${context}`);
        this._log('RETRY_ATTEMPT', {
          service: this._serviceName,
          context,
          attempts: this._retryAttempts,
          maxAttempts: this._maxRetryAttempts
        });
        return retryManager.retryWithBackoff(
            this._serviceName,

            async () => {
                const startTime = performance.now();
                try {
                    coreLogger.log(`[BaseService] Executing operation for ${this._serviceName}:${context}`);
                    const result = await operation();
                    coreLogger.log(`[BaseService] Operation completed for ${this._serviceName}:${context}`);
                    return result;
                } catch (error) {
                    coreLogger.log(`[BaseService] Operation failed for ${this._serviceName}:${context}:`, error);
                    throw error;
                }
            }
        );
    }

    // Métodos privados
    async _initializeWithRetry() {
        return this._executeWithRetry(async () => {
            if (!this._isInitialized) {
                await this.initialize();
            }
        }, 'initialization');
    }

    async _validateDependencies() {
        const serviceInitializer = (await import('../initialization/ServiceInitializer')).serviceInitializer;
        
        for (const dep of this._metadata.dependencies || []) {
            const isReady = await serviceInitializer.isServiceReady(dep);
            if (!isReady) {
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
    _log() {
        coreLogger.logServiceState(this._serviceName, this, this._metadata);
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

    _logEnv() {
       const env = process.env.NODE_ENV;
       return env;
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