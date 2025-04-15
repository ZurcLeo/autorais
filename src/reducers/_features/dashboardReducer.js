import { DASHBOARD_ACTIONS } from '../../core/constants/actions';
import { initialDashboardState } from '../../core/constants/initialState';

/**
 * Reducer do DashboardService
 * @enum {string}
 */
export const dashboardReducer = (state, action) => {
    switch (action.type) {
        case DASHBOARD_ACTIONS.FETCH_START:
            return { ...state, loading: true, error: null };
        case DASHBOARD_ACTIONS.FETCH_SUCCESS:
            return { ...state, loading: false, error: null, ...action.payload };
        case DASHBOARD_ACTIONS.FETCH_FAILURE:
            return { ...state, loading: false, error: action.payload };
        case DASHBOARD_ACTIONS.UPDATE_MESSAGES:
            return { ...state, messages: action.payload };
        case DASHBOARD_ACTIONS.UPDATE_NOTIFICATIONS:
            return { ...state, notifications: action.payload };
        case DASHBOARD_ACTIONS.UPDATE_CONNECTIONS:
            return { ...state, connections: action.payload };
        case DASHBOARD_ACTIONS.UPDATE_CAIXINHAS:
            return { ...state, caixinhas: action.payload };
        case DASHBOARD_ACTIONS.CLEAR_STATE:
            return { ...initialDashboardState };
        default:
            return state;
    }
};