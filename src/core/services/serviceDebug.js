// src/core/debug/serviceDebug.js
import { serviceLocator } from "./BaseService";

export const debugServiceInstance = (serviceName) => {
  try {
    const service = serviceLocator.get(serviceName);
    
    // Verificar se o serviço tem o método _debugInstanceInfo
    const debugInfo = typeof service._debugInstanceInfo === 'function' 
      ? service._debugInstanceInfo()
      : {
          serviceName,
          id: serviceLocator.id,
          warning: 'Serviço não tem método _debugInstanceInfo'
        };
    
    console.group(`🔍 Debug do serviço: ${serviceName}`);
    console.log('ID do ServiceLocator:', serviceLocator.id);
    console.log('Informações da instância:', debugInfo);
    
    // Se for o serviço de autenticação, mostrar informações adicionais
    // Service specific info
    if (serviceName === 'auth') {
        const currentUser = service.getCurrentUser();
        console.log('Current user:', currentUser);
        
        // Check auth state in store
        try {
          const storeService = serviceLocator.get('store');
          console.log('Auth state in store:', storeService.getState()?.auth);
        } catch (e) {
          console.log('Store not available:', e.message);
        }
      }
      
      // Get service metadata if available
      if (service._metadata) {
        console.log('Service metadata:', service._metadata);
      }
      
      // Log registered event listeners if available
      if (service._registeredListeners) {
        console.log('Registered event listeners:', service._registeredListeners.length);
      }
    
    console.groupEnd();
    
    return debugInfo;
  } catch (error) {
    console.error(`Erro ao depurar serviço ${serviceName}:`, error);
    return { error: error.message };
  }
};

// Método para comparar duas instâncias
export const compareServiceInstances = (serviceName, context1, context2) => {
  try {
    const service = serviceLocator.get(serviceName);
    
    console.group(`🔄 Comparação de contextos para ${serviceName}`);
    console.log('Context 1:', context1);
    console.log('Context 2:', context2);
    console.log('ServiceLocator ID:', serviceLocator.id);
    console.log('Service instanceId:', service.instanceId);
    console.groupEnd();
    
    return {
      serviceName,
      serviceLocatorId: serviceLocator.id,
      serviceInstanceId: service.instanceId,
      context1,
      context2,
      areEqual: serviceLocator.id === service.instanceId
    };
  } catch (error) {
    console.error(`Erro ao comparar contextos para ${serviceName}:`, error);
    return { error: error.message };
  }
};

/**
 * Utility to dump the current auth state for debugging
 */
export const dumpAuthState = () => {
    try {
      const store = serviceLocator.get('store');
      const authService = serviceLocator.get('auth');
      
      console.group('🔐 Auth State Dump');
      console.log('Store auth state:', store.getState()?.auth);
      console.log('Auth service user:', authService.getCurrentUser());
      
      // Compare the two
      const storeUser = store.getState()?.auth?.currentUser;
      const serviceUser = authService.getCurrentUser();
      
      if (storeUser && serviceUser) {
        if (storeUser.uid === serviceUser.uid) {
          console.log('✅ Store and service users match!');
        } else {
          console.warn('⚠️ Store and service users do NOT match!');
          console.log('Store user ID:', storeUser.uid);
          console.log('Service user ID:', serviceUser.uid);
        }
      } else if (storeUser) {
        console.warn('⚠️ User exists in store but not in service!');
      } else if (serviceUser) {
        console.warn('⚠️ User exists in service but not in store!');
      } else {
        console.log('ℹ️ No user in either store or service');
      }
      
      console.groupEnd();
      
      return {
        storeAuth: store.getState()?.auth,
        serviceUser: authService.getCurrentUser()
      };
    } catch (error) {
      console.error('❌ Error dumping auth state:', error);
      return null;
    }
  };

// Método global para monitorar todos os serviços registrados
export const debugAllServices = () => {
  const services = serviceLocator.getServices ? serviceLocator.getServices() : {};
  
  console.group('📊 Depuração de todos os serviços');
  console.log('ServiceLocator ID:', serviceLocator.id);
  
  Object.entries(services).forEach(([name, service]) => {
    console.group(`Serviço: ${name}`);
    console.log('instanceId:', service.instanceId || 'undefined');
    console.log('isInitialized:', service.isInitialized);
    console.groupEnd();
  });
  
  console.groupEnd();
  
  return {
    serviceLocatorId: serviceLocator.id,
    services: Object.keys(services).map(name => ({
      name,
      instanceId: services[name].instanceId || 'undefined',
      isInitialized: services[name].isInitialized
    }))
  };
};

// Adicionar ao objeto global para uso no console
if (typeof window !== 'undefined') {
  window.debugService = debugServiceInstance;
  window.compareServiceContexts = compareServiceInstances;
  window.debugAllServices = debugAllServices;
  window.dumpAuthState = dumpAuthState;

}