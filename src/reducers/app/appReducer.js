// src/reducers/appReducer.js
import { APP_ACTIONS } from '../../core/constants/actions';
import {initialAppState} from '../../core/constants/initialState'

export const appReducer = (state = initialAppState, action) => {
  switch (action.type) {
    case APP_ACTIONS.LOADING_STARTED:
      return {
        ...state,
        appLoading: true
      };
    case APP_ACTIONS.LOADING_FINISHED:
      return {
        ...state,
        appLoading: false
      };
    default:
      return state;
  }
};

