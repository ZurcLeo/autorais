// src/services/EventActionBridgeService/index.js
import { BaseService, serviceEventHub } from '../../core/services/BaseService.js';
import { SERVICE_ACTIONS } from '../../core/constants/actions.js';
import { LOG_LEVELS } from '../../core/constants/config.js';

const MODULE_NAME = 'eventActionBridge';

class EventActionBridgeService extends BaseService {
  constructor() {
    super(MODULE_NAME);

    this.instanceId = Math.random().toString(36).substring(2, 10);

    this._metadata = {
      name: MODULE_NAME,
      phase: 'CORE',              // Fase de inicialização (CORE, ESSENTIAL, etc.)
      criticalPath: true,         // Indica se é um serviço crítico para a aplicação
      dependencies: [], // Serviços que devem estar prontos antes deste
      category: 'initialization',       // Categoria do serviço
      description: 'Cria mapeamentos e pontes entre acoes e eventos.' // Descrição
    };

    this.mappings = new Map();
    this.activeSubscriptions = new Map();
    this._store = null;
    this._isReady = false;

    this._log(`📊 Nova instância de EventActionBridge criada, instanceId: ${this.instanceId}`);
  }

  async initialize() {
    if (this.isInitialized) return this;
    
    this._log(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'EventActionBridge service initializing...');
    
    try {

      // Marcar como inicializado e emitir evento
      this._isInitialized = true;
      
      this._emitEvent(SERVICE_ACTIONS.SERVICE_READY, {
        serviceName: MODULE_NAME,
        timestamp: new Date().toISOString()
      });
      
      return this;
    } catch (error) {
      this._logError(error, 'initialization');
      
      this._emitEvent(SERVICE_ACTIONS.SERVICE_ERROR, {
        serviceName: MODULE_NAME,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }

  async healthCheck() {
    const activeSubscriptionsCount = this.activeSubscriptions.size;
    const registeredMappingsCount = this.mappings.size;
    
    return { 
      status: this._isReady ? 'healthy' : 'degraded', 
      mappingsCount: registeredMappingsCount,
      activeSubscriptions: activeSubscriptionsCount,
      isStoreAvailable: !!this._store
    };
  }

  async shutdown() {
    this._log(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'Desativando EventActionBridge');
    this._deactivateAllMappings();
    this._isReady = false;
    return true;
  }

  // Métodos específicos do serviço
  setStore(store) {
    if (!store || typeof store.dispatch !== 'function') {
      this._log('error', {
        message: 'Invalid store provided',
        hasDispatch: typeof store?.dispatch === 'function'
      });
      return false;
    }
  
    this._store = store;
    this._isReady = true;
    
    // Ativar mapeamentos
    this._activateAllMappings();
    
    // Resolver a promise se existir
    if (this._resolveStore) {
      this._resolveStore(store);
      this._resolveStore = null;
    }
    
    this._log('info', {
      message: 'Store set and mappings activated',
      mappingsCount: this.mappings.size
    });
    
    return true;
  }

  /**
   * Registra um mapeamento entre um evento e uma ação
   * @returns {string} ID do mapeamento
   */
  registerMapping(serviceName, eventType, actionType, transformer = data => data) {
    if (!serviceName || !eventType || !actionType) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Tentativa de registrar mapeamento com parâmetros inválidos', {
        serviceName, eventType, actionType
      });
      return null;
    }
    
    const mappingId = `${serviceName}:${eventType}->${actionType}`;
    
    this.mappings.set(mappingId, {
      serviceName,
      eventType,
      actionType,
      transformer
    });
    
    this._log(MODULE_NAME, LOG_LEVELS.STATE, `Mapeamento registrado: ${mappingId}`);
    
    // Ativar imediatamente se o serviço estiver pronto
    if (this._isReady && this._store) {
      this._activateMapping(mappingId);
    }
    
    return mappingId;
  }

  /**
   * Registra múltiplos mapeamentos de uma vez
   * @returns {number} Número de mapeamentos registrados
   */
  registerMappings(mappingsArray) {
    if (!Array.isArray(mappingsArray) || mappingsArray.length === 0) {
      this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Tentativa de registrar array de mapeamentos vazio ou inválido');
      return 0;
    }
    
    // this._startLoading();
    
    let registeredCount = 0;
    for (const mapping of mappingsArray) {
      const { serviceName, eventType, actionType, transformer } = mapping;
      
      if (this.registerMapping(serviceName, eventType, actionType, transformer)) {
        registeredCount++;
      }
    }
    
    this._log(MODULE_NAME, LOG_LEVELS.STATE, `${registeredCount} mapeamentos registrados em lote`);
    // this._stopLoading();
    
    return registeredCount;
  }

  /**
   * Remove um mapeamento existente
   * @returns {boolean} true se removido com sucesso
   */
  unregisterMapping(mappingId) {
    if (!mappingId) {
      this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Tentativa de remover mapeamento com ID vazio');
      return false;
    }
    
    if (this.activeSubscriptions.has(mappingId)) {
      const unsubscribe = this.activeSubscriptions.get(mappingId);
      unsubscribe();
      this.activeSubscriptions.delete(mappingId);
      this._log(MODULE_NAME, LOG_LEVELS.STATE, `Subscription removida: ${mappingId}`);
    }
    
    const result = this.mappings.delete(mappingId);
    if (result) {
      this._log(MODULE_NAME, LOG_LEVELS.STATE, `Mapeamento removido: ${mappingId}`);
    } else {
      this._log(MODULE_NAME, LOG_LEVELS.WARNING, `Tentativa de remover mapeamento inexistente: ${mappingId}`);
    }
    
    return result;
  }

  // Métodos privados
  /**
   * Ativa todos os mapeamentos registrados
   * @private
   */
  async _activateAllMappings() {
    if (!this._store) {
      this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Tentativa de ativar mapeamentos sem store disponível');
      return false;
    }
    
    if (!this._isReady) {
      this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Tentativa de ativar mapeamentos quando o serviço não está pronto');
      return false;
    }
    
    // this._startLoading();
    let activatedCount = 0;
    
    for (const mappingId of this.mappings.keys()) {
      if (this._activateMapping(mappingId)) {
        activatedCount++;
      }
    }
    
    this._log(MODULE_NAME, LOG_LEVELS.STATE, `${activatedCount} mapeamentos ativados`);
    // this._stopLoading();
    
    return true;
  }

  /**
   * Ativa um mapeamento específico
   * @private
   */
  _activateMapping(mappingId) {
    if (!this._store) {
      this._log(MODULE_NAME, LOG_LEVELS.WARNING, `Cannot activate mapping ${mappingId}: store not available`);
      return false;
    }

    if (!this._isReady) {
      this._log(MODULE_NAME, LOG_LEVELS.WARNING, `Cannot activate mapping ${mappingId}: service not ready`);
      return false;
    }

    const mapping = this.mappings.get(mappingId);
    if (!mapping) {
      this._log(MODULE_NAME, LOG_LEVELS.WARNING, `Cannot activate mapping ${mappingId}: mapping not found`);
      return false;
    }
    
    // Cancelar qualquer inscrição existente
    if (this.activeSubscriptions.has(mappingId)) {
      this.activeSubscriptions.get(mappingId)();
      this.activeSubscriptions.delete(mappingId);
    }
    
    // Criar novo listener
    const unsubscribe = serviceEventHub.on(
      mapping.serviceName,
      mapping.eventType,
      (eventData) => {
        try {
          // Gerar um ID de rastreamento se ainda não existir
          const traceId = eventData._metadata?.traceId || 
                         `trace-${mapping.serviceName}-${mapping.eventType}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
          
          if (process.env.NODE_ENV !== 'production') {
            console.group(`🔄 EventActionBridge: ${mapping.serviceName}:${mapping.eventType} → ${mapping.actionType}`);
            console.log('📥 Evento original:', eventData);
          }
          
          // Adicionar ao rastreamento de eventos
          if (typeof window !== 'undefined' && window._eventTracing) {
            window._eventTracing.push({
              type: 'EVENT_MAPPED',
              traceId,
              mappingId,
              serviceName: mapping.serviceName,
              eventType: mapping.eventType,
              actionType: mapping.actionType,
              timestamp: Date.now()
            });
          }

          try {
            // Aplicar transformação com verificação de erro
            const transformedData = mapping.transformer ? mapping.transformer(eventData) : eventData;
            
            if (process.env.NODE_ENV !== 'production') {
              console.log('⚙️ Dados transformados:', transformedData);
            }

            // Despachar a ação com segurança
            if (transformedData !== null && this._store && typeof this._store.dispatch === 'function') {
              this._store.dispatch({
                type: mapping.actionType,
                payload: transformedData
              });
              
              if (process.env.NODE_ENV !== 'production') {
                console.log('📤 Ação despachada');
              }
            } else {
              if (process.env.NODE_ENV !== 'production') {
                console.log('⏭️ Despachamento ignorado', { 
                  reason: transformedData === null ? 'transformer retornou null' : 'store indisponível' 
                });
              }
            }
          } catch (transformError) {
            this._log(MODULE_NAME, LOG_LEVELS.ERROR, `Erro ao transformar dados do evento: ${transformError.message}`, {
              mappingId,
              error: transformError.stack
            });
          }
          
          if (process.env.NODE_ENV !== 'production') {
            console.groupEnd();
          }
        } catch (error) {
          this._log(MODULE_NAME, LOG_LEVELS.ERROR, `❌ Erro no mapeamento ${mapping.serviceName}:${mapping.eventType}`, {
            error: error.stack,
            eventData
          });
        }
      }
    );
    
    // Armazenar a função de cancelamento
    this.activeSubscriptions.set(mappingId, unsubscribe);
    return true;
  }

  /**
   * Desativa todos os mapeamentos
   * @private
   */
  _deactivateAllMappings() {
    // this._startLoading();
    let deactivatedCount = 0;
    
    for (const [mappingId, unsubscribe] of this.activeSubscriptions.entries()) {
      unsubscribe();
      this.activeSubscriptions.delete(mappingId);
      deactivatedCount++;
    }
    
    this._log(MODULE_NAME, LOG_LEVELS.STATE, `${deactivatedCount} mapeamentos desativados`);
    // this._stopLoading();
    return deactivatedCount;
  }

  /**
   * Função para debug e exibição do estado atual dos mapeamentos
   */
  debugMappings() {
    console.group('🔍 EventActionBridge Mappings Debug');
    console.log('Total de mapeamentos registrados:', this.mappings.size);
    console.log('Mapeamentos ativos:', this.activeSubscriptions.size);
    
    console.group('📋 Mapeamentos registrados:');
    for (const [mappingId, mapping] of this.mappings.entries()) {
      console.log(`${mappingId}:`, mapping);
    }
    console.groupEnd();
    
    console.group('🔌 Subscriptions ativas:');
    for (const mappingId of this.activeSubscriptions.keys()) {
      console.log(mappingId);
    }
    console.groupEnd();
    
    console.log('🔄 Store disponível:', !!this._store);
    console.log('🚦 Serviço inicializado:', this._isInitialized);
    console.log('🚦 Serviço pronto:', this._isReady);
    console.groupEnd();
    
    return {
      mappingsCount: this.mappings.size,
      activeSubscriptions: this.activeSubscriptions.size,
      hasStore: !!this._store,
      isInitialized: this._isInitialized,
      isReady: this._isReady
    };
  }
  
  /**
   * Exporta ferramentas de diagnóstico para o objeto window
   */
  exportDebugTools() {
    // Não fazer nada em produção
    if (process.env.NODE_ENV === 'production') {
      return null;
    }
    
    // Criar ferramentas de diagnóstico
    const debugTools = {
      // Diagnóstico do sistema de eventos
      debugEventSystem: () => {
        console.group('🔄 Sistema de Eventos - Diagnóstico');
        
        // Verificar ServiceEventHub
        console.log('ServiceEventHub:', {
          listeners: serviceEventHub.listeners ? serviceEventHub.listeners.size : 'N/A',
          globalListeners: serviceEventHub.globalListeners ? serviceEventHub.globalListeners.size : 'N/A'
        });
        
        // Verificar EventActionBridgeService
        console.log('EventActionBridgeService:', this.debugMappings());
        
        // Verificar tracing
        console.log('Eventos capturados:', window._eventTracing?.length || 0);
        
        console.groupEnd();
        
        return {
          serviceEventHub: {
            listeners: serviceEventHub.listeners ? serviceEventHub.listeners.size : 'N/A',
            globalListeners: serviceEventHub.globalListeners ? serviceEventHub.globalListeners.size : 'N/A'
          },
          eventActionBridge: {
            mappingsCount: this.mappings.size,
            activeSubscriptions: this.activeSubscriptions.size,
            isReady: this._isReady
          },
          eventTracingCount: window._eventTracing?.length || 0
        };
      },
      
      // Teste de emissão de eventos
      testEventEmission: (serviceName = 'test', eventType = 'TEST_EVENT', data = {}) => {
        console.log(`🧪 Emitindo evento de teste: ${serviceName}:${eventType}`);
        const testData = { 
          ...data, 
          _testId: Math.random().toString(36).substring(2, 10),
          testTimestamp: new Date().toISOString() 
        };
        this._emitEvent(serviceName, eventType, testData);
        console.log('✅ Evento de teste emitido', testData);
        return true;
      },
      
      // Listar todos os eventos capturados
      listTracedEvents: () => {
        if (!window._eventTracing || window._eventTracing.length === 0) {
          console.log('Nenhum evento rastreado ainda');
          return [];
        }
        
        // Agrupar eventos por tipo e contá-los
        const eventCounts = {};
        window._eventTracing.forEach(event => {
          const key = `${event.serviceName || 'unknown'}:${event.eventType || 'unknown'}`;
          eventCounts[key] = (eventCounts[key] || 0) + 1;
        });
        
        console.table(eventCounts);
        return eventCounts;
      }
    };
    
    // Exportar para o objeto window para uso no console
    if (typeof window !== 'undefined') {
      window.eventDiagnostics = debugTools;
      console.log('🔧 Ferramentas de diagnóstico de eventos disponíveis via "eventDiagnostics"');
    }
    
    return debugTools;
  }
}

export { EventActionBridgeService };