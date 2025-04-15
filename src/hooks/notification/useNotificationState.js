import { useReducer } from 'react';
import { notificationReducer } from '../../../reducers/notification/notificationReducer';
import { initialNotificationState } from '../../core/constants/initialState';

export const useNotificationState = () => {
  const [state, dispatch] = useReducer(notificationReducer, initialNotificationState);
  
  return {
    state,
    dispatch
  };
};