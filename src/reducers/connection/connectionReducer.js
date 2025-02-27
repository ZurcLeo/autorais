// Action types para gerenciamento de estado das conexões
export const CONNECTION_ACTIONS = {
    FETCH_START: 'FETCH_START',
    FETCH_SUCCESS: 'FETCH_SUCCESS',
    FETCH_FAILURE: 'FETCH_FAILURE',
    UPDATE_FRIENDS: 'UPDATE_FRIENDS',
    UPDATE_BEST_FRIENDS: 'UPDATE_BEST_FRIENDS',
    UPDATE_INVITATIONS: 'UPDATE_INVITATIONS',
    SET_ERROR: 'SET_ERROR',
    SET_LOADING: 'SET_LOADING',
    CLEAR_STATE: 'CLEAR_STATE',
    SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
    CLEAR_SEARCH_RESULTS: 'CLEAR_SEARCH_RESULTS'
  };
  
  // Estado inicial para o contexto de conexões
  export const initialConnectionState = {
    friends: [],
    bestFriends: [],
    invitations: [],
    searchResults: [],
    loading: true,
    searching: false,
    error: null,
    lastUpdated: null
  };
  
  // Reducer para gerenciar mudanças de estado de conexões
  export const connectionReducer = (state, action) => {
    switch (action.type) {
      case CONNECTION_ACTIONS.FETCH_START:
        return {
          ...state,
          loading: true,
          error: null
        };
        
      case CONNECTION_ACTIONS.FETCH_SUCCESS:
        return {
          ...state,
          friends: action.payload.friends || [],
          bestFriends: action.payload.bestFriends || [],
          invitations: action.payload.invitations || [],
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
  
      case CONNECTION_ACTIONS.UPDATE_INVITATIONS:
        return {
          ...state,
          invitations: action.payload,
          lastUpdated: Date.now()
        };
        
      case CONNECTION_ACTIONS.SET_SEARCH_RESULTS:
        return {
          ...state,
          searchResults: action.payload,
          searching: false
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
          loading: action.payload
        };
  
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