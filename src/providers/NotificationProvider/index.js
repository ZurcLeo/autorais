// src/providers/NotificationProvider/index.js
import React, {
    createContext,
    useReducer,
    useContext,
    useState,
    useCallback,
    useMemo,
    useEffect
} from 'react';
import { NOTIFICATION_ACTIONS } from '../../core/constants/actions';
import { NOTIFICATION_EVENTS } from '../../core/constants/events';
import { initialNotificationState } from '../../core/constants/initialState';
import { notificationReducer } from '../../reducers/notification/notificationReducer';
import { useNotificationPolling } from '../../hooks/notification/useNotificationPolling';
import { showToast, showPromiseToast } from '../../utils/toastUtils';
import { coreLogger } from '../../core/logging';
import { serviceEventHub, serviceLocator } from '../../core/services/BaseService';
import { LOG_LEVELS } from '../../core/constants/config';
import { globalCache } from '../../utils/cache/cacheManager';
import { NOTIFICATION_CACHE_CONFIG } from '../../core/constants/config';

const NotificationContext = createContext(null);

const MODULE_NAME = 'notifications';

// Intervalo de polling padrão: 30 segundos
const DEFAULT_POLLING_INTERVAL = 30 * 1000;

// Intervalo de polling quando o usuário está inativo: 2 minutos
const INACTIVE_POLLING_INTERVAL = 2 * 60 * 1000;

// Determina quanto tempo sem interação do usuário consideramos como "inativo"
const USER_INACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutos

export const NotificationProvider = ({children}) => {
    const [state, dispatch] = useReducer(notificationReducer, initialNotificationState);
    const [isInitialized, setIsInitialized] = useState(false);
    const [notifError, setNotifError] = useState(null);
    const [pollingInterval, setPollingInterval] = useState(DEFAULT_POLLING_INTERVAL);
    const [lastUserActivity, setLastUserActivity] = useState(Date.now());
    
    // Referências aos serviços
    let notificationService;
    let serviceStore;
    let serviceNot;
    
    try {
        notificationService = serviceLocator.get('notifications');
        serviceStore = serviceLocator.get('store').getState()?.auth;
        serviceNot = serviceLocator.get('store').getState()?.notifications;
    } catch (err) {
        console.error('Error accessing services:', err);
        setNotifError(err);
    }
    
    const { isAuthenticated, currentUser } = serviceStore || {};
    const userId = currentUser?.uid;

    // Monitor de atividade do usuário
    useEffect(() => {
        const updateLastActivity = () => {
            setLastUserActivity(Date.now());
            
            // Se estava usando intervalo de inatividade, voltar ao intervalo normal
            if (pollingInterval === INACTIVE_POLLING_INTERVAL) {
                setPollingInterval(DEFAULT_POLLING_INTERVAL);
                coreLogger.logEvent(
                    MODULE_NAME,
                    LOG_LEVELS.INFO,
                    'Usuário ativo detectado, reduzindo intervalo de polling'
                );
            }
        };
        
        // Eventos que indicam atividade do usuário
        window.addEventListener('mousemove', updateLastActivity);
        window.addEventListener('keydown', updateLastActivity);
        window.addEventListener('click', updateLastActivity);
        window.addEventListener('touchstart', updateLastActivity);
        window.addEventListener('scroll', updateLastActivity);
        
        return () => {
            window.removeEventListener('mousemove', updateLastActivity);
            window.removeEventListener('keydown', updateLastActivity);
            window.removeEventListener('click', updateLastActivity);
            window.removeEventListener('touchstart', updateLastActivity);
            window.removeEventListener('scroll', updateLastActivity);
        };
    }, [pollingInterval]);
    
    // Verificador de inatividade para ajustar polling
    useEffect(() => {
        const checkInactivity = () => {
            const now = Date.now();
            const inactiveTime = now - lastUserActivity;
            
            if (inactiveTime > USER_INACTIVITY_THRESHOLD && pollingInterval !== INACTIVE_POLLING_INTERVAL) {
                setPollingInterval(INACTIVE_POLLING_INTERVAL);
                coreLogger.logEvent(
                    MODULE_NAME,
                    LOG_LEVELS.INFO,
                    'Usuário inativo detectado, aumentando intervalo de polling',
                    { inactiveTime, threshold: USER_INACTIVITY_THRESHOLD }
                );
            }
        };
        
        const intervalId = setInterval(checkInactivity, 60000); // Verificar a cada minuto
        
        return () => clearInterval(intervalId);
    }, [lastUserActivity, pollingInterval]);

    // Carregar dados do cache ao inicializar
    useEffect(() => {
        const loadCachedData = () => {
            try {
                // Verificar se há dados em cache
                const cachedData = globalCache.getItem(NOTIFICATION_CACHE_CONFIG.NOTIFICATIONS_KEY);
                const cachedUnreadCount = globalCache.getItem(NOTIFICATION_CACHE_CONFIG.UNREAD_KEY);
                
                if (cachedData) {
                    // Usar dados em cache enquanto carrega dados novos
                    dispatch({
                        type: NOTIFICATION_ACTIONS.FETCH_NOTIFICATION_SUCCESS, 
                        payload: cachedData,
                        unreadCount: cachedUnreadCount || 0
                    });
                    
                    coreLogger.logEvent(
                        MODULE_NAME,
                        LOG_LEVELS.INFO,
                        'Dados de notificação carregados do cache',
                        { 
                            count: cachedData.length,
                            unreadCount: cachedUnreadCount || 0
                        }
                    );
                    
                    // Se o cache está fresco, não precisamos buscar imediatamente
                    if (!globalCache.isStale(NOTIFICATION_CACHE_CONFIG.NOTIFICATIONS_KEY)) {
                        dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: false });
                        return true;
                    }
                    
                    return false; // Cache existe mas está obsoleto, precisa buscar novos dados
                }
                
                return false; // Não há cache, precisa buscar dados
            } catch (error) {
                coreLogger.logEvent(
                    MODULE_NAME, 
                    LOG_LEVELS.ERROR,
                    'Erro ao carregar dados do cache',
                    { error: error.message }
                );
                return false;
            }
        };
        
        // Tentar carregar do cache primeiro
        const cacheIsFresh = loadCachedData();
        
        async function initNotifications() {
            if (isAuthenticated && currentUser) {
                try {
                    // Se o cache não é fresco ou não existe, buscar do servidor
                    if (!cacheIsFresh) {
                        dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true });
                        await notificationService.fetchNotifications();
                    }
                    
                    setIsInitialized(true);
                } catch (error) {
                    console.error('Failed to initialize notification service:', error);
                    setIsInitialized(true);
                    // Mesmo com erro, definimos como inicializado para evitar múltiplas tentativas
                }
            }
        }

        if (isAuthenticated && currentUser && !isInitialized) {
            initNotifications();
        }

        return () => {
            // Só parar o serviço se estivermos realmente desmontando ou mudando de usuário
            if (isInitialized && notificationService?.stop && !isAuthenticated) {
                notificationService.stop();
                setIsInitialized(false);
            }
        };
    }, [isAuthenticated, currentUser, isInitialized]);

    // Configurar handlers de eventos
    useEffect(() => {
        if (!isInitialized) 
            return;
        
        try {
            const notificationFetchedUnsubscribe = serviceEventHub.on(
                'notifications',
                NOTIFICATION_EVENTS.NOTIFICATIONS_FETCHED,
                (eventData) => {
                    dispatch({
                        type: NOTIFICATION_ACTIONS.FETCH_NOTIFICATION_SUCCESS, 
                        userId,
                        notifications: eventData.notifications, // Certifique-se de que este campo esteja correto
                        count: eventData.notifications?.length || 0,
                        timestamp: Date.now()
                    });
                    
                    // Atualizar cache com novos dados
                    if (eventData.notification && Array.isArray(eventData.notification)) {
                        globalCache.setItem(
                            NOTIFICATION_CACHE_CONFIG.NOTIFICATIONS_KEY,
                            eventData.notification,
                            { 
                                cacheTime: NOTIFICATION_CACHE_CONFIG.CACHE_TIME,
                                staleTime: NOTIFICATION_CACHE_CONFIG.STALE_TIME
                            }
                        );
                        
                        const unreadCount = eventData.notification.filter(notif => !notif.read).length;
                        globalCache.setItem(
                            NOTIFICATION_CACHE_CONFIG.UNREAD_KEY,
                            unreadCount,
                            { 
                                cacheTime: NOTIFICATION_CACHE_CONFIG.CACHE_TIME,
                                staleTime: NOTIFICATION_CACHE_CONFIG.STALE_TIME
                            }
                        );
                    }
                }
            );

            // Lidar com novas notificações via Event Hub
            const notificationCreatedUnsubscribe = serviceEventHub.on(
                'notifications',
                NOTIFICATION_EVENTS.NOTIFICATION_CREATED,
                (eventData) => {
                    dispatch({
                        type: NOTIFICATION_ACTIONS.UPDATE_NOTIFICATIONS, 
                        payload: eventData.notification
                    });
                    
                    if (!eventData.notification.lida) {
                        dispatch({type: NOTIFICATION_ACTIONS.UPDATE_UNREAD_COUNT});
                    }
                    
                    // Atualizar cache com nova notificação
                    const cachedData = globalCache.getItem(NOTIFICATION_CACHE_CONFIG.NOTIFICATIONS_KEY) || [];
                    const updatedCache = [eventData.notification, ...cachedData];
                    
                    globalCache.setItem(
                        NOTIFICATION_CACHE_CONFIG.NOTIFICATIONS_KEY,
                        updatedCache,
                        { 
                            cacheTime: NOTIFICATION_CACHE_CONFIG.CACHE_TIME,
                            staleTime: NOTIFICATION_CACHE_CONFIG.STALE_TIME
                        }
                    );
                    
                    const unreadCount = updatedCache.filter(notif => !notif.read).length;
                    globalCache.setItem(
                        NOTIFICATION_CACHE_CONFIG.UNREAD_KEY,
                        unreadCount,
                        { 
                            cacheTime: NOTIFICATION_CACHE_CONFIG.CACHE_TIME,
                            staleTime: NOTIFICATION_CACHE_CONFIG.STALE_TIME
                        }
                    );
                }
            );

            // Lidar com notificações marcadas como lidas via Event Hub
            const notificationMarkedReadUnsubscribe = serviceEventHub.on(
                'notifications',
                NOTIFICATION_EVENTS.NOTIFICATION_MARKED_READ,
                (eventData) => {
                    dispatch({
                        type: NOTIFICATION_ACTIONS.UPDATE_UNREAD_COUNT, 
                        payload: eventData.notificationId
                    });
                    
                    // Atualizar cache para marcar notificação como lida
                    const cachedData = globalCache.getItem(NOTIFICATION_CACHE_CONFIG.NOTIFICATIONS_KEY);
                    if (cachedData && Array.isArray(cachedData)) {
                        const updatedCache = cachedData.map(notif => 
                            notif.id === eventData.notificationId ? {...notif, read: true} : notif
                        );
                        
                        globalCache.setItem(
                            NOTIFICATION_CACHE_CONFIG.NOTIFICATIONS_KEY,
                            updatedCache,
                            { 
                                cacheTime: NOTIFICATION_CACHE_CONFIG.CACHE_TIME,
                                staleTime: NOTIFICATION_CACHE_CONFIG.STALE_TIME
                            }
                        );
                        
                        const unreadCount = updatedCache.filter(notif => !notif.read).length;
                        globalCache.setItem(
                            NOTIFICATION_CACHE_CONFIG.UNREAD_KEY,
                            unreadCount,
                            { 
                                cacheTime: NOTIFICATION_CACHE_CONFIG.CACHE_TIME,
                                staleTime: NOTIFICATION_CACHE_CONFIG.STALE_TIME
                            }
                        );
                    }
                }
            );

            // Lidar com todas as notificações sendo limpas via Event Hub
            const allNotificationsClearedUnsubscribe = serviceEventHub.on(
                'notifications',
                NOTIFICATION_EVENTS.ALL_NOTIFICATIONS_CLEARED,
                () => {
                    dispatch({type: NOTIFICATION_ACTIONS.CLEAR_STATE});
                    
                    // Limpar cache
                    globalCache.invalidate(NOTIFICATION_CACHE_CONFIG.NOTIFICATIONS_KEY);
                    globalCache.invalidate(NOTIFICATION_CACHE_CONFIG.UNREAD_KEY);
                    
                    coreLogger.logEvent(
                        MODULE_NAME,
                        LOG_LEVELS.INFO,
                        'Cache de notificações limpo'
                    );
                }
            );

            setIsInitialized(true);
            coreLogger.logEvent(
                MODULE_NAME,
                LOG_LEVELS.INITIALIZATION,
                'Serviço de notificações inicializado com sucesso'
            );

            return () => {
                notificationCreatedUnsubscribe();
                notificationFetchedUnsubscribe();
                notificationMarkedReadUnsubscribe();
                allNotificationsClearedUnsubscribe();
                coreLogger.logEvent(
                    MODULE_NAME,
                    LOG_LEVELS.LIFECYCLE,
                    'Serviço de notificações finalizado'
                );
            };
        } catch (error) {
            coreLogger.logEvent(
                MODULE_NAME,
                LOG_LEVELS.ERROR,
                'Falha ao inicializar o serviço de notificações',
                {
                    error: error.message,
                    code: error.code || 'init_failed'
                }
            );
            console.error('Falha ao inicializar o serviço de notificações:', error);
            serviceEventHub.emit(MODULE_NAME, NOTIFICATION_EVENTS.NOTIFICATION_ERROR, {
                error: error.message,
                code: error.code || 'init_failed'
            });
            setIsInitialized(true); // Mesmo em caso de erro, marcamos como "tentou inicializar"
        }
    }, [isInitialized]); // Dependência apenas em isInitialized para configurar os listeners uma vez

    // Função para buscar notificações com uso inteligente de cache
    const fetchNotifications = useCallback(async (forceRefresh = false) => {
        if (!isInitialized || !userId) {
            coreLogger.logEvent(
                MODULE_NAME,
                LOG_LEVELS.INFO,
                'Tentativa de buscar notificações antes da inicialização ou sem userId'
            );
            return;
        }

        serviceEventHub.emit(MODULE_NAME, NOTIFICATION_ACTIONS.FETCH_START, {});
        
        // Verificar se cache está fresco e não estamos forçando atualização
        if (!forceRefresh && !globalCache.isStale(NOTIFICATION_CACHE_CONFIG.NOTIFICATIONS_KEY)) {
            coreLogger.logEvent(
                MODULE_NAME,
                LOG_LEVELS.INFO,
                'Usando cache fresco para notificações',
                { userId }
            );
            
            // Usar dados em cache
            const cachedData = globalCache.getItem(NOTIFICATION_CACHE_CONFIG.NOTIFICATIONS_KEY);
            const cachedUnreadCount = globalCache.getItem(NOTIFICATION_CACHE_CONFIG.UNREAD_KEY);
            
            if (cachedData) {
                dispatch({
                    type: NOTIFICATION_ACTIONS.FETCH_NOTIFICATION_SUCCESS, 
                    payload: cachedData,
                    unreadCount: cachedUnreadCount || 0
                });
                
                return { notifications: cachedData, unreadCount: cachedUnreadCount || 0 };
            }
        }

        try {
            // Se cache está obsoleto ou foi solicitada atualização, buscar do servidor
            dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true });
            const notifications = await notificationService.fetchNotifications(userId);
            const unreadCount = notifications
                .filter((notification) => !notification.lida)
                .length;

            coreLogger.logEvent(
                MODULE_NAME,
                LOG_LEVELS.NETWORK,
                'Notificações buscadas com sucesso',
                {
                    count: notifications.length,
                    unread: unreadCount
                }
            );

            // Atualizar cache com dados novos
            globalCache.setItem(
                NOTIFICATION_CACHE_CONFIG.NOTIFICATIONS_KEY,
                notifications,
                { 
                    cacheTime: NOTIFICATION_CACHE_CONFIG.CACHE_TIME,
                    staleTime: NOTIFICATION_CACHE_CONFIG.STALE_TIME
                }
            );
            
            globalCache.setItem(
                NOTIFICATION_CACHE_CONFIG.UNREAD_KEY,
                unreadCount,
                { 
                    cacheTime: NOTIFICATION_CACHE_CONFIG.CACHE_TIME,
                    staleTime: NOTIFICATION_CACHE_CONFIG.STALE_TIME
                }
            );

            dispatch({
                type: NOTIFICATION_ACTIONS.FETCH_NOTIFICATION_SUCCESS, 
                payload: notifications, 
                unreadCount
            });
            
            return { notifications, unreadCount };
        } catch (error) {
            coreLogger.logServiceError('notifications', error, {
                context: 'fetchNotifications',
                userId
            });
            
            serviceEventHub.emit(
                MODULE_NAME,
                NOTIFICATION_ACTIONS.FETCH_FAILURE,
                { payload: error.message }
            );
            
            // Em caso de erro, definir loading como false
            dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: false });

            if (!error.message.includes('Could not refresh token') && !error.message.includes('Session expired')) {
                coreLogger.logServiceError('notifications', error, {
                    context: 'fetchNotifications',
                    userId
                });
            }
            
            throw error;
        }
    }, [userId, dispatch, isInitialized]);

    // Configurar polling adaptativo
    useNotificationPolling(
        userId, 
        fetchNotifications,
        pollingInterval
    );
    
    // Marcar notificação como lida
    const markAsRead = useCallback(async (notificationId) => {
        if (!isInitialized || !userId || !notificationId) {
            showToast(
                'Dados de notificação inválidos ou serviço não inicializado',
                { type: 'error' }
            );
            coreLogger.logEvent(
                MODULE_NAME,
                LOG_LEVELS.WARNING,
                'Tentativa de marcar notificação como lida sem inicialização ou dados completos',
                { userId, notificationId }
            );
            return;
        }

        return showPromiseToast((async () => {
            try {
                // Otimistic update
                const updatedNotifications = state
                    .notifications
                    .map(
                        (notification) => notification.id === notificationId
                            ? {
                                ...notification,
                                lida: true
                            }
                            : notification
                    );

                dispatch({
                    type: NOTIFICATION_ACTIONS.UPDATE_NOTIFICATIONS, 
                    payload: updatedNotifications
                });
                
                dispatch({
                    type: NOTIFICATION_ACTIONS.UPDATE_UNREAD_COUNT,
                    payload: Math.max(0, state.unreadCount - 1)
                });
                
                // Atualizar cache imediatamente (update otimista)
                globalCache.setItem(
                    NOTIFICATION_CACHE_CONFIG.NOTIFICATIONS_KEY,
                    updatedNotifications,
                    { 
                        cacheTime: NOTIFICATION_CACHE_CONFIG.CACHE_TIME,
                        staleTime: NOTIFICATION_CACHE_CONFIG.STALE_TIME
                    }
                );
                
                globalCache.setItem(
                    NOTIFICATION_CACHE_CONFIG.UNREAD_KEY,
                    Math.max(0, state.unreadCount - 1),
                    { 
                        cacheTime: NOTIFICATION_CACHE_CONFIG.CACHE_TIME,
                        staleTime: NOTIFICATION_CACHE_CONFIG.STALE_TIME
                    }
                );

                await notificationService.markAsRead(notificationId);
                
                coreLogger.logEvent(
                    MODULE_NAME,
                    LOG_LEVELS.API_REQUEST_SUCCESS,
                    'Notificação marcada como lida',
                    { notificationId }
                );
                
                return 'Notificação marcada como lida';
            } catch (error) {
                coreLogger.logServiceError('notifications', error, {
                    context: 'markAsRead',
                    userId,
                    notificationId
                });
                
                // Reverter o update otimista buscando novamente as notificações
                fetchNotifications(true).catch(() => {
                    coreLogger.logServiceError('notifications', error, {
                        context: 'markAsRead.revert',
                        userId,
                        notificationId
                    });
                });

                throw new Error('Falha ao marcar notificação como lida');
            }
        })(), {
            notifLoading: 'Marcando como lida...',
            success: 'Notificação marcada como lida',
            error: 'Falha ao marcar como lida'
        });
    }, [
        userId,
        state.notifications,
        state.unreadCount,
        fetchNotifications,
        dispatch,
        isInitialized
    ]);

    // Limpar todas as notificações
    const clearAllNotifications = useCallback(async () => {
        if (!isInitialized || !userId) {
            showToast(
                'Usuário não autenticado ou serviço não inicializado',
                { type: 'error' }
            );
            
            coreLogger.logEvent(
                MODULE_NAME,
                LOG_LEVELS.WARNING,
                'Tentativa de limpar notificações sem inicialização ou userId',
                { userId }
            );
            
            return;
        }

        return showPromiseToast((async () => {
            try {
                // Optimistic update
                dispatch({ type: NOTIFICATION_ACTIONS.UPDATE_NOTIFICATIONS, payload: [] });
                dispatch({ type: NOTIFICATION_ACTIONS.UPDATE_UNREAD_COUNT, payload: 0 });
                
                // Limpar cache imediatamente
                globalCache.invalidate(NOTIFICATION_CACHE_CONFIG.NOTIFICATIONS_KEY);
                globalCache.invalidate(NOTIFICATION_CACHE_CONFIG.UNREAD_KEY);

                await notificationService.clearAllNotifications(userId);
                
                coreLogger.logEvent(
                    MODULE_NAME,
                    LOG_LEVELS.API_REQUEST_SUCCESS,
                    'Todas as notificações limpas'
                );
                
                return 'Todas as notificações limpas';
            } catch (error) {
                coreLogger.logServiceError('notifications', error, {
                    context: 'clearAllNotifications',
                    userId
                });
                
                // Reverter atualizando com dados do servidor
                fetchNotifications(true).catch(() => {
                    coreLogger.logServiceError('notifications', error, {
                        context: 'clearAllNotifications.revert',
                        userId
                    });
                });

                throw new Error('Falha ao limpar as notificações');
            }
        })(), {
            notifLoading: 'Limpando notificações...',
            success: 'Todas as notificações limpas',
            error: 'Falha ao limpar as notificações'
        });
    }, [userId, fetchNotifications, dispatch, isInitialized]);

    // Função para forçar atualização
    const refreshNotifications = useCallback(() => {
        return fetchNotifications(true); // Forçar refresh, ignorando cache
    }, [fetchNotifications]);

    // Memoizar o valor do contexto
    const contextValue = useMemo(() => ({
        cacheExpiration: state.cacheExpiration,
        error: state.error,
        lastUpdated: state.lastUpdated,
        nextFetchTime: state.nextFetchTime,
        notifLoading: state.notifLoading,
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        markAsRead,
        clearAllNotifications,
        refreshNotifications,
        isNotificationsInitialized: isInitialized,
    }), [
        state.cacheExpiration,
        state.error,
        state.lastUpdated,
        state.nextFetchTime,
        state.notifLoading,
        state.notifications,
        state.unreadCount,
        markAsRead,
        clearAllNotifications,
        refreshNotifications,
        isInitialized
    ]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error(
            'useNotifications deve ser usado dentro de um NotificationProvider'
        );
    }

    return context;
};