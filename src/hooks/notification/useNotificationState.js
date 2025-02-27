import { useReducer } from 'react';
import { NOTIFICATION_ACTIONS, initialNotificationState, notificationReducer } from '../../../reducers/notification/notificationState';

export const useNotificationState = () => {
  const [state, dispatch] = useReducer(notificationReducer, initialNotificationState);
  
  return {
    state,
    dispatch
  };
};