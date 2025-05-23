// src/reducers/loan/loanReducer.js
import { LOAN_ACTIONS } from "../../core/constants/actions";
import { initialLoanState } from "../../core/constants/initialState";

export const loanReducer = (state = initialLoanState, action) => {
  switch (action.type) {
    case LOAN_ACTIONS.FETCH_START:
      return {
        ...state,
        loading: true,
        error: null
      };
        
    case LOAN_ACTIONS.FETCH_SUCCESS:
      // Verificação de segurança: garantir que loans é sempre um array
      const loans = Array.isArray(action.payload.loans) ? action.payload.loans : [];
      
      return {
        ...state,
        loans: loans,
        caixinhaId: action.payload.caixinhaId || state.caixinhaId,
        loading: false,
        error: null,
        lastUpdated: Date.now()
      };
      
    case LOAN_ACTIONS.FETCH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        lastUpdated: Date.now()
      };
      
    case LOAN_ACTIONS.UPDATE_LOANS:
      const loan = action.payload.loan;
      // Verificação de segurança para garantir que temos um array válido
      const currentLoans = Array.isArray(state.loans) ? state.loans : [];
      const updatedLoans = loan ? [...currentLoans, loan] : currentLoans;
        
      return {
        ...state,
        loans: updatedLoans,
        caixinhaId: action.payload.caixinhaId || state.caixinhaId,
        lastUpdated: Date.now()
      };
      
    case LOAN_ACTIONS.UPDATE_LOAN_DETAILS:
      // Garantir que temos um array válido antes de usar map
      const currentLoansList = Array.isArray(state.loans) ? state.loans : [];
      
      // Atualiza um empréstimo específico na lista
      const updatedLoansList = currentLoansList.map(loan => 
        loan.id === action.payload.loanId ? action.payload.loan : loan
      );
      
      return {
        ...state,
        loans: updatedLoansList,
        loanDetails: action.payload.loan,
        caixinhaId: action.payload.caixinhaId || state.caixinhaId,
        lastUpdated: Date.now()
      };
      
    case LOAN_ACTIONS.UPDATE_LOAN_STATISTICS:
      return {
        ...state,
        loanStatistics: {
          ...state.loanStatistics,
          ...action.payload.statistics
        },
        lastUpdated: Date.now()
      };
      
    case LOAN_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        lastUpdated: Date.now()
      };
      
    case LOAN_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    case LOAN_ACTIONS.CLEAR_STATE:
      return {
        ...initialLoanState,
        lastUpdated: Date.now()
      };
      
    default:
      return state;
  }
};