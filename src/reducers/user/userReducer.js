export const USER_ACTIONS = {
    FETCH_START: 'FETCH_START',
    FETCH_SUCCESS: 'FETCH_SUCCESS',
    FETCH_FAILURE: 'FETCH_FAILURE',
    UPDATE_USER: 'UPDATE_USER',
    SET_ERROR: 'SET_ERROR',
    SET_LOADING: 'SET_LOADING',
    CLEAR_USER: 'CLEAR_USER'
  };
  
  export const initialUserState = {
    currentUser: null,
    usersList: [],
    isLoading: false,
    error: null,
    lastUpdated: null
  };
  
  export const userReducer = (state, action) => {
    switch (action.type) {
      case USER_ACTIONS.FETCH_START:
        return {
          ...state,
          isLoading: true,
          error: null
        };
        
      case USER_ACTIONS.FETCH_SUCCESS:
        return {
          ...state,
          currentUser: action.payload,
          isLoading: false,
          error: null,
          lastUpdated: Date.now()
        };
      
      case USER_ACTIONS.FETCH_FAILURE:
        return {
          ...state,
          isLoading: false,
          error: action.payload,
          lastUpdated: Date.now()
        };
  
      case USER_ACTIONS.UPDATE_USER:
        return {
          ...state,
          currentUser: {
            ...state.currentUser,
            ...action.payload
          },
          lastUpdated: Date.now()
        };
  
      case USER_ACTIONS.CLEAR_USER:
        return {
          ...initialUserState,
          isLoading: false,
          lastUpdated: Date.now()
        };
  
      default:
        return state;
    }
  };