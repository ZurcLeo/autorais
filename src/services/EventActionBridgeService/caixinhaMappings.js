// src/services/EventActionBridgeService/caixinhaMappings.js
import { serviceLocator } from '../../core/services/BaseService';
import { CAIXINHA_EVENTS } from '../../core/constants/events';
import { CAIXINHA_ACTIONS } from '../../core/constants/actions';

export const setupCaixinhaMappings = (eventBridgeService) => {
  const eventActionBridgeService = eventBridgeService || 
  serviceLocator.get('eventActionBridge');

  eventActionBridgeService.registerMappings([
    // Mapeamento para quando as caixinhas são carregadas
    {
      serviceName: 'caixinhas',
      eventType: CAIXINHA_EVENTS.CAIXINHAS_FETCHED,
      actionType: CAIXINHA_ACTIONS.FETCH_SUCCESS,
      transformer: (eventData) => ({
        caixinhas: eventData.caixinhas || [],
        userId: eventData.userId,
        count: eventData.count,
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para quando uma caixinha específica é carregada
    {
      serviceName: 'caixinhas',
      eventType: CAIXINHA_EVENTS.CAIXINHA_FETCHED,
      actionType: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA,
      transformer: (eventData) => ({
        caixinha: eventData.caixinha,
        caixinhaId: eventData.caixinhaId,
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para quando uma caixinha é criada
    {
      serviceName: 'caixinhas',
      eventType: CAIXINHA_EVENTS.CAIXINHA_CREATED,
      actionType: CAIXINHA_ACTIONS.UPDATE_CAIXINHAS,
      transformer: (eventData) => ({
        caixinha: eventData.caixinha,
        caixinhaId: eventData.caixinhaId,
        adminId: eventData.adminId,
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para quando uma caixinha é atualizada
    {
      serviceName: 'caixinhas',
      eventType: CAIXINHA_EVENTS.CAIXINHA_UPDATED,
      actionType: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA,
      transformer: (eventData) => ({
        caixinha: eventData.caixinha,
        caixinhaId: eventData.caixinhaId,
        updatedFields: eventData.updatedFields || [],
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para quando uma caixinha é excluída
    {
      serviceName: 'caixinhas',
      eventType: CAIXINHA_EVENTS.CAIXINHA_DELETED,
      actionType: CAIXINHA_ACTIONS.UPDATE_CAIXINHAS,
      transformer: (eventData) => ({
        caixinhaId: eventData.caixinhaId,
        deleted: true,
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para quando uma contribuição é adicionada
    {
      serviceName: 'caixinhas',
      eventType: CAIXINHA_EVENTS.CONTRIBUICAO_ADDED,
      actionType: CAIXINHA_ACTIONS.UPDATE_CONTRIBUTIONS,
      transformer: (eventData) => ({
        contribuicao: eventData.contribuicao,
        caixinhaId: eventData.caixinhaId,
        userId: eventData.userId,
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para quando as contribuições são carregadas
    {
      serviceName: 'caixinhas',
      eventType: CAIXINHA_EVENTS.CONTRIBUICOES_FETCHED,
      actionType: CAIXINHA_ACTIONS.UPDATE_CONTRIBUTIONS,
      transformer: (eventData) => ({
        contribuicoes: eventData.contribuicoes,
        caixinhaId: eventData.caixinhaId,
        count: eventData.count,
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para quando um membro é convidado para uma caixinha
    {
      serviceName: 'caixinhas',
      eventType: CAIXINHA_EVENTS.MEMBER_INVITED,
      actionType: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA,
      transformer: (eventData) => ({
        caixinhaId: eventData.caixinhaId,
        inviteData: eventData.inviteData,
        result: eventData.result,
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para quando um membro sai de uma caixinha
    {
      serviceName: 'caixinhas',
      eventType: CAIXINHA_EVENTS.MEMBER_LEFT,
      actionType: CAIXINHA_ACTIONS.UPDATE_SINGLE_CAIXINHA,
      transformer: (eventData) => ({
        caixinhaId: eventData.caixinhaId,
        userId: eventData.userId,
        result: eventData.result,
        loading: false,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Estado de loading para ações que iniciam
    {
      serviceName: 'caixinhas',
      eventType: 'FETCH_START',
      actionType: CAIXINHA_ACTIONS.FETCH_START,
      transformer: (eventData) => ({
        loading: true,
        error: null,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para erros
    {
      serviceName: 'caixinhas',
      eventType: 'ERROR',
      actionType: CAIXINHA_ACTIONS.FETCH_FAILURE,
      transformer: (eventData) => ({
        error: eventData.error,
        errorDetails: eventData.errorDetails,
        loading: false,
        timestamp: eventData.timestamp || Date.now()
      })
    }
  ]);
  
  console.log('[CaixinhaMappings] Caixinha mappings registered successfully');
};