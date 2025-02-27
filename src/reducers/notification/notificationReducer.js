// Action types para gerenciamento de estado das notificações
export const NOTIFICATION_ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  UPDATE_NOTIFICATIONS: 'UPDATE_NOTIFICATIONS',
  UPDATE_UNREAD_COUNT: 'UPDATE_UNREAD_COUNT',
  SET_ERROR: 'SET_ERROR',
  SET_LOADING: 'SET_LOADING',
  CLEAR_STATE: 'CLEAR_STATE'
};

// Estado inicial para o contexto de notificações
export const initialNotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: true,
  error: null,
  lastUpdated: null
};

// Reducer para gerenciar mudanças de estado de notificações
export const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.FETCH_START:
      return {
        ...state,
        loading: true,
        error: null
      };
      
    case NOTIFICATION_ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        notifications: action.payload.notifications,
        unreadCount: action.payload.unreadCount,
        loading: false,
        error: null,
        lastUpdated: Date.now()
      };
    
    case NOTIFICATION_ACTIONS.FETCH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        lastUpdated: Date.now()
      };

    case NOTIFICATION_ACTIONS.UPDATE_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload,
        lastUpdated: Date.now()
      };

    case NOTIFICATION_ACTIONS.UPDATE_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: action.payload,
        lastUpdated: Date.now()
      };

    case NOTIFICATION_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        lastUpdated: Date.now()
      };

    case NOTIFICATION_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case NOTIFICATION_ACTIONS.CLEAR_STATE:
      return {
        ...initialNotificationState,
        loading: false,
        lastUpdated: Date.now()
      };

    default:
      return state;
  }
};