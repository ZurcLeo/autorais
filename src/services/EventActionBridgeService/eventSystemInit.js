
import { serviceLocator } from '../../core/services/BaseService';
import { LOG_LEVELS } from '../../core/constants/config';
import { coreLogger } from '../../core/logging';

/**
 * Inicializa o sistema de rastreamento de eventos
 * Esta função deve ser chamada durante a inicialização da aplicação
 */
export const initEventTracing = (eventBridgeService) => {

  const eventActionBridgeService = eventBridgeService || 
  serviceLocator.get('eventActionBridge');
  
  // Inicializar o array global de rastreamento
  if (typeof globalThis !== 'undefined') {
    globalThis._eventTracing = [];
    
    // Adicionar ferramentas de diagnóstico
    const diagnosticTools = eventActionBridgeService.exportDiagnosticTools();
    
    // Registrar inicialização
    coreLogger.logEvent(
      'EventSystem', 
      LOG_LEVELS.INITIALIZATION, 
      'Sistema de rastreamento de eventos inicializado', 
      { timestamp: new Date().toISOString() }
    );
    
    return diagnosticTools;
  }
  
  coreLogger.logEvent(
    'EventSystem', 
    LOG_LEVELS.ERROR, 
    'Falha ao inicializar sistema de rastreamento de eventos: globalThis não disponível', 
    { timestamp: new Date().toISOString() }
  );
  
  return null;
};