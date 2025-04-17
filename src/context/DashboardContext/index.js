// src/context/DashboardContext.js
import React, { createContext, useEffect, useContext, useReducer, useCallback, useMemo } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { DASHBOARD_ACTIONS } from '../../core/constants/actions';
import { dashboardReducer } from '../../reducers/_features/dashboardReducer';
import { initialDashboardState } from '../../core/constants/initialState';
import { serviceLocator } from '../../core/services/BaseService';
import { showToast } from '../../utils/toastUtils';
import { coreLogger } from '../../core/logging/CoreLogger';
import { LOG_LEVELS } from '../../core/constants/config';

const DashboardContext = createContext(null); // Inicializa com null

export const DashboardProvider = ({ children }) => {
    const [state, dispatch] = useReducer(dashboardReducer, initialDashboardState);
    const serviceStore = serviceLocator.get('store').getState()?.auth;
    const messageStore = serviceLocator.get('store').getState()?.messages;
    const notificationStore = serviceLocator.get('store').getState()?.notifications;
    const connectionsStore = serviceLocator.get('store').getState()?.connections;
    const caixinhaStore = serviceLocator.get('store').getState()?.caixinhas;

    const { currentUser } = serviceStore;
    const userId = currentUser?.uid; // Obtém o userId de forma segura

    // Função para buscar os dados do dashboard, agora memoizada
    const fetchDashboardData = useCallback(async () => {
        if (!userId) {
            return; // Não faz nada se não houver usuário logado
        }

        dispatch({ type: DASHBOARD_ACTIONS.FETCH_START });
        try {
            console.log('...EM OBRAS... serviceStore', serviceStore)
            console.log('...EM OBRAS... messageStore', messageStore)
            console.log('...EM OBRAS... notificationStore', notificationStore)
            console.log('...EM OBRAS... connectionsStore', connectionsStore)
            console.log('...EM OBRAS... caixinhaStore', caixinhaStore)

            // const data = await dashboardService.getDashboardData(userId);
            // dispatch({ type: DASHBOARD_ACTIONS.FETCH_SUCCESS, payload: data });
        } catch (error) {
            dispatch({ type: DASHBOARD_ACTIONS.FETCH_FAILURE, error: error.message });
            coreLogger.logEvent('DashboardProvider', LOG_LEVELS.ERROR, 'Failed to fetch dashboard data', { error: error.message, userId });
            showToast('Erro ao carregar dados do dashboard', { type: 'error' });
        }
    }, [userId, dispatch]); // Dependências corretas

    // Busca os dados quando o componente monta e quando o userId muda
    useEffect(() => {
        console.log('DashboardProvider - userId:', userId);
        if (userId) {
            fetchDashboardData();
        } else {
             // Limpa o estado se o usuário fizer logout
            dispatch({ type: DASHBOARD_ACTIONS.CLEAR_STATE });
        }
    }, [userId, fetchDashboardData]);


    // Funções para atualizar partes específicas do dashboard (opcional, mas útil)
    const updateMessages = useCallback((messages) => {
        dispatch({ type: DASHBOARD_ACTIONS.UPDATE_MESSAGES, payload: messages });
    }, [dispatch]);

    const updateNotifications = useCallback((notifications) => {
        dispatch({ type: DASHBOARD_ACTIONS.UPDATE_NOTIFICATIONS, payload: notifications });
    }, [dispatch]);

    const updateConnections = useCallback((connections) => {
        dispatch({ type: DASHBOARD_ACTIONS.UPDATE_CONNECTIONS, payload: connections });
    }, [dispatch]);

    const updateCaixinhas = useCallback((caixinhas) => {
        dispatch({ type: DASHBOARD_ACTIONS.UPDATE_CAIXINHAS, payload: caixinhas });
    }, [dispatch]);


    // Cria o valor do contexto usando useMemo para otimização
    const contextValue = useMemo(() => ({
        ...state, // Inclui o estado atual
        fetchDashboardData, // Permite que os componentes disparem uma nova busca
        updateMessages,       // Funções para atualizar partes específicas
        updateNotifications,
        updateConnections,
        updateCaixinhas
    }), [state, fetchDashboardData, updateMessages, updateNotifications, updateConnections, updateCaixinhas]);


    return (
        <DashboardContext.Provider value={contextValue}>
            {children}
        </DashboardContext.Provider>
    );
};


export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};