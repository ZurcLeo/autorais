// src/hooks/messages/useMessageState.js
import { useReducer } from 'react';
import { messageReducer, initialMessageState } from '../../reducers/messages/messageReducer';

export const useMessageState = () => {
  return useReducer(messageReducer, initialMessageState);
};