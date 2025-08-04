// src/core/initialization/registerServices.js
import { serviceInitializer } from './ServiceInitializer';
import { serviceLocator } from '../services/BaseService';
import { coreLogger } from '../logging';
import { LOG_LEVELS } from '../constants/config';

// Importação dos serviços
import { EventActionBridgeService } from '../../services/EventActionBridgeService';
import { StoreService } from '../../services/EventActionBridgeService/StoreService';
import { AuthTokenService } from '../../services/AuthTokenService';
import { ApiService } from '../../services/apiService';
import { AuthService } from '../../services/AuthService';
import { UserService } from '../../services/UserService';
import { InterestsService } from '../../services/InterestsService';
import { InviteService } from '../../services/InviteService';
import { UserPreferencesService } from '../../services/UserPreferencesService';
import { NotificationService } from '../../services/NotificationService';
import { ConnectionService } from '../../services/ConnectionService';
import { MessageService } from '../../services/MessageService';
import { CaixinhaService } from '../../services/CaixinhaService'
import { CaixinhaInviteService } from '../../services/CaixinhaInviteService';
import { LoanService } from '../../services/LoanService';
import { DisputeService } from '../../services/DisputeService';
import { BankingService } from '../../services/BankingService';
import { SupportService } from '../../services/SupportService';

// Definição de serviços por fase
const SERVICES_DEFINITION = {
  CORE: [
    { name: 'eventActionBridge', ServiceClass: EventActionBridgeService },
    { name: 'store', ServiceClass: StoreService },
    { name: 'authToken', ServiceClass: AuthTokenService },
    { name: 'apiService', ServiceClass: ApiService },
    { name: 'auth', ServiceClass: AuthService }
  ],
  ESSENTIAL: [
    { name: 'users', ServiceClass: UserService },
    { name: 'interests', ServiceClass: InterestsService },
    { name: 'invites', ServiceClass: InviteService },
    { name: 'userPreferences', ServiceClass: UserPreferencesService }
  ],
  COMMUNICATION: [
    { name: 'notifications', ServiceClass: NotificationService },
    { name: 'connections', ServiceClass: ConnectionService },
    { name: 'messages', ServiceClass: MessageService },
    { name: 'support', ServiceClass: SupportService }
  ],
  FEATURES: [
    { name: 'caixinhas', ServiceClass: CaixinhaService },
    { name: 'caixinhaInvite', ServiceClass: CaixinhaInviteService },
    { name: 'loans', ServiceClass: LoanService },
    { name: 'disputes', ServiceClass: DisputeService},
    { name: 'banking', ServiceClass: BankingService }
  ]
};

/**
 * Verifica se um serviço já está registrado no ServiceLocator
 * @param {string} serviceName Nome do serviço
 * @returns {boolean} True se o serviço já estiver registrado
 */
function isServiceRegistered(serviceName) {
  console.log(`Usando serviceLocator com ID: ${serviceLocator.id} em [isServiceRegistered - registerServices]`);

  return serviceLocator.registry && serviceLocator.registry.has(serviceName);
}

/**
 * Registra um serviço individual
 * @param {string} serviceName Nome do serviço
 * @param {class} ServiceClass Classe do serviço
 * @param {string} phase Fase de inicialização
 * @returns {Object} Instância do serviço registrado
 */
function registerSingleService(serviceName, ServiceClass, phase) {
  coreLogger.logEvent('RegisterServices', LOG_LEVELS.INFO, `Registrando serviço: ${serviceName}`, { phase });
  
  let serviceInstance;
  
  // Verificar se o serviço já está registrado
  if (isServiceRegistered(serviceName)) {
    coreLogger.logEvent('RegisterServices', LOG_LEVELS.INFO, `Serviço ${serviceName} já registrado, usando instância existente`);
    serviceInstance = serviceLocator.get(serviceName);
  } else {
    // Criar nova instância
    serviceInstance = new ServiceClass();
    
    // Evitar auto-registro para prevenir duplicação
    if (serviceInstance._metadata) {
      serviceInstance._metadata.noAutoRegister = true;
    }
    
    // Registrar no ServiceLocator
    serviceLocator.register(serviceName, serviceInstance);
    
    coreLogger.logEvent('RegisterServices', LOG_LEVELS.INFO, `Serviço ${serviceName} registrado com sucesso`);
  }
  console.log('Intancia: ', serviceInstance)
  return serviceInstance;
}

/**
 * Registra serviços no ServiceInitializer
 * @param {Object} servicesInstances Mapa de instâncias de serviços
 */
function registerWithInitializer(servicesInstances) {
  coreLogger.logEvent('RegisterServices', LOG_LEVELS.INFO, 'Registrando serviços no ServiceInitializer');
  
  Object.entries(servicesInstances).forEach(([serviceName, instance]) => {
    if (instance.registerWithInitializer && typeof instance.registerWithInitializer === 'function') {
      instance.registerWithInitializer(serviceInitializer);
    } else {
      // Fallback para serviços que não implementam registerWithInitializer
      const metadata = instance._metadata || {};
      serviceInitializer.registerService(serviceName, instance, metadata);
    }
  });
}

/**
 * Registra todos os serviços na aplicação
 * @returns {Object} Mapa de serviços registrados
 */
export function registerAllServices() {
  coreLogger.logEvent('RegisterServices', LOG_LEVELS.INITIALIZATION, '=== INICIANDO REGISTRO DE SERVIÇOS ===');
  
  // Rastreamos as instâncias de serviço criadas
  const serviceInstances = {};
  
  try {
    // Registrar serviços por fase
    Object.entries(SERVICES_DEFINITION).forEach(([phase, services]) => {
      coreLogger.logEvent('RegisterServices', LOG_LEVELS.INFO, `\n=== SERVIÇOS ${phase} ===`);
      
      services.forEach(({ name, ServiceClass }) => {
        const instance = registerSingleService(name, ServiceClass, phase);
        serviceInstances[name] = instance;
      });
    });
    
    // Registrar todos os serviços no ServiceInitializer
    registerWithInitializer(serviceInstances);
    
    coreLogger.logEvent('RegisterServices', LOG_LEVELS.INFO, 'Reconstruindo grafo de dependências');
    
    // Reconstruir grafo de dependências
    serviceInitializer.buildDependencyGraph?.();
    
    coreLogger.logEvent('RegisterServices', LOG_LEVELS.INITIALIZATION, '=== REGISTRO DE SERVIÇOS CONCLUÍDO ===');
  } catch (error) {
    coreLogger.logServiceError('RegisterServices', error, { phase: 'registration' });
    throw error;
  }
  
  return serviceInstances;
}

/**
 * Registra apenas serviços core (mínimo necessário para funcionar)
 * @returns {Object} Mapa de serviços core registrados
 */
export function registerCoreServices() {
  coreLogger.logEvent('RegisterServices', LOG_LEVELS.INITIALIZATION, '=== INICIANDO REGISTRO DE SERVIÇOS CORE ===');
  
  const serviceInstances = {};
  
  try {
    // Registrar apenas serviços CORE
    const coreServices = SERVICES_DEFINITION.CORE || [];
    
    coreServices.forEach(({ name, ServiceClass }) => {
      const instance = registerSingleService(name, ServiceClass, 'CORE');
      serviceInstances[name] = instance;
    });
    
    // Registrar no ServiceInitializer
    registerWithInitializer(serviceInstances);
    
    coreLogger.logEvent('RegisterServices', LOG_LEVELS.INITIALIZATION, '=== REGISTRO DE SERVIÇOS CORE CONCLUÍDO ===');
  } catch (error) {
    coreLogger.logServiceError('RegisterServices', error, { phase: 'core-registration' });
    throw error;
  }
  
  return serviceInstances;
}

/**
 * Verifica se um serviço específico está registrado
 * @param {string} serviceName Nome do serviço
 * @returns {boolean} True se o serviço estiver registrado
 */
export function isServiceRegisteredAndReady(serviceName) {
  if (!isServiceRegistered(serviceName)) {
    return false;
  }
  
  try {
    const service = serviceLocator.get(serviceName);
    return service && service.isInitialized === true;
  } catch (error) {
    return false;
  }
}

/**
 * Obtém serviços registrados agrupados por fase
 * @returns {Object} Serviços agrupados por fase
 */
export function getRegisteredServicesByPhase() {
  const result = {};
  
  Object.entries(SERVICES_DEFINITION).forEach(([phase, services]) => {
    result[phase] = services
      .filter(({ name }) => isServiceRegistered(name))
      .map(({ name }) => name);
  });
  
  return result;
}