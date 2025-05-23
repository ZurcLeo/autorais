import { CONNECTION_ACTIONS } from '../../core/constants/actions';
import { initialConnectionState } from '../../core/constants/initialState';

  // Reducer para gerenciar mudanças de estado de conexões
  export const connectionReducer = (state = initialConnectionState, action) => {
    console.log(`[connectionReducer] Recebendo ação: ${action.type}`, {
      payload: action.payload,
      currentState: {...state}
    });
    switch (action.type) {
      case CONNECTION_ACTIONS.FETCH_START:
        return {
          ...state,
          loading: true,
          error: null
        };
        
      case CONNECTION_ACTIONS.FETCH_CONNECTION_SUCCESS:
        return {
          ...state,
          friends: action.payload.friends || [],
          bestFriends: action.payload.bestFriends || [],
          sentRequests: action.payload || [],
          // receivedRequests: action.payload || [],
          loading: false,
          error: null,
          lastUpdated: Date.now()
        };
      
      case CONNECTION_ACTIONS.FETCH_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload,
          lastUpdated: Date.now()
        };
  
      case CONNECTION_ACTIONS.UPDATE_FRIENDS:
        return {
          ...state,
          friends: action.payload,
          lastUpdated: Date.now()
        };
  
      case CONNECTION_ACTIONS.UPDATE_BEST_FRIENDS:
        return {
          ...state,
          bestFriends: action.payload,
          lastUpdated: Date.now()
        };
  
        case CONNECTION_ACTIONS.UPDATE_CONNECTIONS:
          // Handler inteligente baseado no payload type
          switch(action.payload.type) {
            case 'requestedConnections':
              return {
                ...state,
                requestedConnections: action.payload.requestedConnections,
                lastUpdated: Date.now()
              };
              case 'sentRequests':
                // Verificar se estamos recebendo uma lista completa ou apenas uma atualização
                if (action.payload.action === 'add' && action.payload.request) {
                  // Adicionar uma nova solicitação à lista existente
                  return {
                    ...state,
                    sentRequests: [
                      ...(state.sentRequests || []),
                      action.payload.request
                    ],
                    lastUpdated: Date.now()
                  };
                } else {
                  // Substituir a lista completa
                  return {
                    ...state,
                    sentRequests: action.payload.sentRequests || [],
                    lastUpdated: Date.now()
                  };
                }
              case 'acceptedRequest':
                // Lógica específica para solicitação aceita
                return {
                  ...state,
                  // Remover a solicitação da lista de solicitações pendentes
                  sentRequests: state.sentRequests.filter(req => 
                    req.id !== action.payload.requestId && 
                    req.solicitanteId !== action.payload.senderId
                  ),
                  // Se o connection object vier na response, adicione-o à lista de amigos
                  // (apenas se já não estiver na lista)
                  friends: action.payload.connection ? 
                    [...state.friends.filter(f => f.id !== action.payload.senderId), 
                     action.payload.connection] : 
                    state.friends,
                  lastUpdated: Date.now()
                };
            case 'rejectedRequest':
              // Lógica específica para solicitação rejeitada
              return {
                ...state,
                lastUpdated: Date.now()
              };
            case 'blockedUser':
              // Lógica para lidar com usuário bloqueado
              return {
                ...state,
                // Talvez adicionar à lista de bloqueados
                lastUpdated: Date.now()
              };
            default:
              // Caso genérico
              return {
                ...state,
                connections: action.payload.connections,
                friends: action.payload.friends || state.friends,
                bestFriends: action.payload.bestFriends || state.bestFriends,
                lastUpdated: Date.now()
              };
          }
        
        case CONNECTION_ACTIONS.SET_SEARCH_RESULTS:
          return {
            ...state,
            search: {
              ...state.search,
              searchResults: action.payload,
              status: 'success',
              error: null,
              lastUpdated: Date.now()
            }
          };

          // No caso de CONNECTION_ACTIONS.SEARCH_START
case CONNECTION_ACTIONS.SEARCH_START:
  return {
    ...state,
    search: {
      ...state.search,
      query: action.payload.query,
      status: 'loading',
      error: null
    }
  };

  // No caso de CONNECTION_ACTIONS.SEARCH_ERROR
case CONNECTION_ACTIONS.SEARCH_ERROR:
  return {
    ...state,
    search: {
      ...state.search,
      status: 'error',
      error: action.payload
    }
  };
        
      case CONNECTION_ACTIONS.CLEAR_SEARCH_RESULTS:
        return {
          ...state,
          searchResults: [],
          searching: false
        };
  
      case CONNECTION_ACTIONS.SET_ERROR:
        return {
          ...state,
          error: action.payload,
          loading: false,
          searching: false,
          lastUpdated: Date.now()
        };
  
      case CONNECTION_ACTIONS.SET_LOADING:
        return {
          ...state,
          loading: {
            ...state.loading,
            ...action.payload
          }
        };

        case CONNECTION_ACTIONS.REMOVE_CONNECTION:
          return {
            ...state,
            friends: action.payload,
            loading: action.payload,
            error: action.payload,
            lastUpdated: Date.now()
          }
  
      case CONNECTION_ACTIONS.CLEAR_STATE:
        return {
          ...initialConnectionState,
          loading: false,
          lastUpdated: Date.now()
        };
  
      default:
        return state;
    }
  };