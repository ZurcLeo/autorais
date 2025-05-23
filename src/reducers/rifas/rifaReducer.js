// Reducer para gerenciar o estado

export const rifaReducer = (state, action) => {
    switch (action.type) {
      case 'FETCH_START':
        return { ...state, loading: true, error: null };
      case 'FETCH_SUCCESS':
        return {
          ...state,
          rifas: action.payload,
          loading: false,
          error: null,
          lastUpdated: new Date()
        };
      case 'FETCH_SINGLE_SUCCESS':
        return {
          ...state,
          selectedRifa: action.payload,
          loading: false,
          error: null
        };
      case 'FETCH_ERROR':
        return { ...state, loading: false, error: action.payload };
      case 'UPDATE_RIFA_SUCCESS':
        return {
          ...state,
          rifas: state.rifas.map(rifa =>
            rifa.id === action.payload.id ? action.payload : rifa
          ),
          selectedRifa: state.selectedRifa?.id === action.payload.id
            ? action.payload
            : state.selectedRifa,
          loading: false,
          error: null,
          lastUpdated: new Date()
        };
      case 'CREATE_RIFA_SUCCESS':
        return {
          ...state,
          rifas: [...state.rifas, action.payload],
          loading: false,
          error: null,
          lastUpdated: new Date()
        };
      default:
        return state;
    }
  };