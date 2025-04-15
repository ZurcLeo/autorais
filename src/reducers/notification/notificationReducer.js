import { NOTIFICATION_ACTIONS } from "../../core/constants/actions";
import { initialNotificationState } from "../../core/constants/initialState";
import { NOTIFICATION_CACHE_CONFIG } from "../../core/constants/config";

// Reducer para gerenciar mudanças de estado de notificações
export const notificationReducer = (state = initialNotificationState, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.FETCH_START:
      return {
        ...state,
        notifLoading: true,
        error: null
      };
      
      case NOTIFICATION_ACTIONS.FETCH_SUCCESS:
        return {
          ...state,
          notifications: action.payload,
          unreadCount: action.unreadCount,
          notifLoading: false,
          error: null,
          lastUpdated: Date.now(),
          nextFetchTime: Date.now() + NOTIFICATION_CACHE_CONFIG.STALE_TIME,
          cacheExpiration: Date.now() + NOTIFICATION_CACHE_CONFIG.CACHE_TIME
        };
    
    case NOTIFICATION_ACTIONS.FETCH_FAILURE:
      return {
        ...state,
        notifLoading: false,
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
        notifLoading: action.payload
      };

    case NOTIFICATION_ACTIONS.CLEAR_STATE:
      return {
        ...initialNotificationState,
        notifLoading: false,
        lastUpdated: Date.now()
      };

    default:
      return state;
  }
};