// src/services/EventActionBridgeService/connectionMappings.js
import { serviceLocator } from '../../core/services/BaseService';
import { CONNECTION_EVENTS } from '../../core/constants/events';
import { CONNECTION_ACTIONS } from '../../core/constants/actions';

export const setupConnectionMappings = (eventBridgeService) => {

  const eventActionBridgeService = eventBridgeService || 
  serviceLocator.get('eventActionBridge');

  eventActionBridgeService.registerMappings([
    // Mapeamento para busca de conexões
    {
      serviceName: 'connections',
      eventType: CONNECTION_EVENTS.CONNECTIONS_FETCHED,
      actionType: CONNECTION_ACTIONS.FETCH_SUCCESS,
      transformer: (eventData) => {
        console.log('Transformer sendo chamado para CONNECTIONS_FETCHED', eventData);
        
        // Verificar a estrutura dos dados
        if (!eventData || typeof eventData !== 'object') {
          console.error('Dados de evento inválidos:', eventData);
          return null;
        }
        
        const result = {
          friends: eventData.result.friends || {},
          bestFriends: eventData.result.bestFriends || {},
          sentRequests: eventData.result.sentRequests || {}
        };
        
        console.log('Resultado do transformer:', result);
        return result;
      }
    },
    
    // Mapeamento para falha na busca
    {
      serviceName: 'connections',
      eventType: CONNECTION_EVENTS.FETCH_FAILURE,
      actionType: CONNECTION_ACTIONS.FETCH_FAILURE,
      transformer: (eventData) => ({
        error: eventData.error || 'Falha ao carregar conexões'
      })
    },
    
    // Mapeamento para adição de melhor amigo
    {
      serviceName: 'connections',
      eventType: CONNECTION_EVENTS.BEST_FRIEND_ADDED,
      actionType: CONNECTION_ACTIONS.UPDATE_BEST_FRIENDS,
      transformer: (eventData) => {
        // Este transformer espera que o evento contenha a lista atualizada de melhores amigos
        // Se o evento contiver apenas o amigo adicionado, precisamos recuperar o estado atual do reducer
        if (Array.isArray(eventData)) {
          return eventData;
        } else {
          // Neste caso, a ação UPDATE_BEST_FRIENDS será tratada especialmente no reducer
          // para adicionar esta conexão específica à lista existente
          return {
            connection: eventData.connection,
            action: 'add',
            friendId: eventData.friendId
          };
        }
      }
    },
    
    // Mapeamento para remoção de melhor amigo
    {
      serviceName: 'connections',
      eventType: CONNECTION_EVENTS.BEST_FRIEND_REMOVED,
      actionType: CONNECTION_ACTIONS.UPDATE_BEST_FRIENDS,
      transformer: (eventData) => {
        if (Array.isArray(eventData)) {
          return eventData;
        } else {
          return {
            connection: eventData.connection,
            action: 'remove',
            friendId: eventData.friendId
          };
        }
      }
    },
    
    // Mapeamento para exclusão de conexão
    {
      serviceName: 'connections',
      eventType: CONNECTION_EVENTS.CONNECTION_DELETED,
      actionType: CONNECTION_ACTIONS.REMOVE_CONNECTION,
      transformer: (eventData) => ({
        connectionId: eventData.connectionId
      })
    },
    
    // Mapeamento para solicitação de conexão
// Correção para o mapeamento de CONNECTION_REQUESTED
{
  serviceName: 'connections',
  eventType: CONNECTION_EVENTS.CONNECTION_REQUESTED,
  actionType: CONNECTION_ACTIONS.UPDATE_CONNECTIONS,
  transformer: (eventData) => {
    console.log('Transformer para CONNECTION_REQUESTED:', eventData);
    
    // Verificar se os dados vêm no formato esperado
    if (eventData && eventData.newRequest) {
      return {
        type: 'sentRequests',
        sentRequests: [eventData.newRequest], // Adiciona à lista de solicitações enviadas
        action: 'add',
        request: eventData.newRequest
      };
    } else if (Array.isArray(eventData)) {
      return {
        type: 'sentRequests',
        sentRequests: eventData,
        action: 'add'
      };
    } else {
      console.error('Formato de dados inesperado para CONNECTION_REQUESTED:', eventData);
      return {
        type: 'sentRequests',
        sentRequests: [], 
        action: 'add',
        error: 'Formato de dados inválido'
      };
    }
  }
},
    // Mapeamentos adicionais
{
  serviceName: 'connections',
  eventType: CONNECTION_EVENTS.REQUESTED_CONNECTIONS_LOADED,
  actionType: CONNECTION_ACTIONS.UPDATE_CONNECTIONS,
  transformer: (eventData) => ({
    ...eventData,
    type: 'requestedConnections'
  })
},
{
  serviceName: 'connections',
  eventType: CONNECTION_EVENTS.CONNECTION_REQUEST_ACCEPTED,
  actionType: CONNECTION_ACTIONS.UPDATE_CONNECTIONS,
  transformer: (eventData) => ({
    ...eventData,
    type: 'acceptedRequest'
  })
},
{
  serviceName: 'connections',
  eventType: CONNECTION_EVENTS.CONNECTION_REQUEST_REJECTED,
  actionType: CONNECTION_ACTIONS.UPDATE_CONNECTIONS,
  transformer: (eventData) => ({
    ...eventData,
    type: 'rejectedRequest'
  })
},
{
  serviceName: 'connections',
  eventType: CONNECTION_EVENTS.SENT_REQUESTS_LOADED,
  actionType: CONNECTION_ACTIONS.UPDATE_CONNECTIONS,
  transformer: (eventData) => ({
    ...eventData,
    type: 'sentRequests'
  })
},
{
  serviceName: 'connections',
  eventType: CONNECTION_EVENTS.USER_BLOCKED,
  actionType: CONNECTION_ACTIONS.UPDATE_CONNECTIONS,
  transformer: (eventData) => ({
    ...eventData,
    type: 'blockedUser'
  })
},
{
  serviceName: 'connections',
  eventType: CONNECTION_EVENTS.SEARCH_COMPLETED,
  actionType: CONNECTION_ACTIONS.SET_SEARCH_RESULTS,
  transformer: (eventData) => eventData.results || []
},
    {
      serviceName: 'connections',
      eventType: CONNECTION_EVENTS.SEARCH_STARTED,
      actionType: CONNECTION_ACTIONS.SEARCH_START,
      transformer: (eventData) => ({
        query: eventData.query,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    // Mapeamento para resultados de busca de usuários
    {
      serviceName: 'connections',
      eventType: CONNECTION_EVENTS.USERS_SEARCH_COMPLETED,
      actionType: CONNECTION_ACTIONS.SET_SEARCH_RESULTS,
      transformer: (eventData) => eventData.results || []
    },
    
    // Mapeamento para limpeza de estado ao fazer logout
    {
      serviceName: 'connections',
      eventType: CONNECTION_EVENTS.CLEAR_STATE,
      actionType: CONNECTION_ACTIONS.CLEAR_STATE
    },
    {
      serviceName: 'connections',
      eventType: CONNECTION_EVENTS.SEARCH_ERROR,
      actionType: CONNECTION_ACTIONS.SEARCH_ERROR,
      transformer: (eventData) => eventData.error
    },
    // Mapeamento para atualização de amigos regulares 
    {
      serviceName: 'connections',
      eventType: CONNECTION_EVENTS.CONNECTION_UPDATED,
      actionType: CONNECTION_ACTIONS.UPDATE_FRIENDS,
      transformer: (eventData) => {
        if (eventData.type === 'bestFriend') {
          // Casos especiais para transformação de melhor amigo
          if (eventData.action === 'add') {
            // Este evento já será tratado por BEST_FRIEND_ADDED
            return null;
          } else if (eventData.action === 'remove') {
            // Quando um melhor amigo é "rebaixado" para amigo normal
            return {
              connection: { ...eventData.connection, isBestFriend: false },
              action: 'add'
            };
          }
        }
        
        // Para outras atualizações de amigos
        return eventData.connections || eventData;
      }
    }
  ]);
};