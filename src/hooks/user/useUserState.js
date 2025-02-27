import { useReducer, useCallback } from 'react';
import { userReducer, initialUserState } from '../../reducers/user/userReducer';

export const useUserState = () => {
  const [state, dispatch] = useReducer(userReducer, initialUserState);

  const dispatchAction = useCallback((action) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[User] Action:', action.type, action.payload);
    }
    dispatch(action);
  }, []);

  return { state, dispatch: dispatchAction };
};