// src/core/initialization/AppBootstrap.js

import { serviceInitializer } from './ServiceInitializer';
import { coreLogger } from '../logging/CoreLogger';
import { InitializationPhase, LOG_LEVELS } from '../constants/config';

/**
 * Serviços essenciais que devem ser inicializados antes da renderização
 */
const ESSENTIAL_SERVICES = [
  ...InitializationPhase.CORE.services,
  ...InitializationPhase.ESSENTIAL.services.filter(s => 
    s === 'auth' || s === 'user' || s === 'store'
  )
];

export class AppBootstrap {
  /**
   * Inicializa serviços essenciais de forma síncrona
   */
  static async bootstrapEssentialServices() {
    const startTime = performance.now();
    
    try {

        registerCoreServices();
      
        // Inicializar EventActionBridge primeiro
        await serviceInitializer.getService('eventActionBridge');
        
        // Inicializar Store
        const store = await serviceInitializer.getService('store');
        
        // Conectar EventActionBridge ao Store
        const eventBridge = await serviceInitializer.getService('eventActionBridge');
        eventBridge.setStore(store);
        
      coreLogger.logEvent('AppBootstrap', LOG_LEVELS.INITIALIZATION, 
        'Starting essential services bootstrap');
      
      // Inicializar serviços core um por um
      for (const serviceName of ESSENTIAL_SERVICES) {
        try {
          await serviceInitializer.getService(serviceName);
          coreLogger.logEvent('AppBootstrap', LOG_LEVELS.INITIALIZATION, 
            `Essential service ${serviceName} initialized`);
        } catch (error) {
          coreLogger.logServiceError('AppBootstrap', error, {
            serviceName,
            phase: 'bootstrap'
          });
          
          // Falhar rápido para serviços essenciais
          throw error;
        }
      }
      
      const duration = performance.now() - startTime;
      coreLogger.logEvent('AppBootstrap', LOG_LEVELS.PERFORMANCE, 
        `Essential services bootstrap completed in ${duration.toFixed(2)}ms`);
      
      return { success: true, duration };
    } catch (error) {
      const duration = performance.now() - startTime;
      
      coreLogger.logServiceError('AppBootstrap', error, {
        phase: 'bootstrap',
        duration: duration.toFixed(2)
      });
      
      return { success: false, error, duration };
    }
  }


  
  /**
   * Inicia a inicialização dos serviços não-essenciais em background
   */
  static initializeNonEssentialServices() {
    // Iniciar em background sem aguardar
    serviceInitializer.initializeAllServices()
      .then(() => {
        coreLogger.logEvent('AppBootstrap', LOG_LEVELS.INITIALIZATION, 
          'All services initialized successfully');
      })
      .catch(error => {
        coreLogger.logServiceError('AppBootstrap', error, {
          phase: 'non-essential-initialization'
        });
      });
  }
}