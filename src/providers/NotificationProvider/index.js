// src/providers/NotificationProvider.js
import React, {
    createContext,
    useReducer,
    useContext,
    useState,
    useCallback,
    useMemo,
    useEffect
} from 'react';
import {NOTIFICATION_ACTIONS} from '../../core/constants/actions';
import {NOTIFICATION_EVENTS} from '../../core/constants/events';
import {initialNotificationState} from '../../core/constants/initialState';
import {notificationReducer} from '../../reducers/notification/notificationReducer'; // Ajuste o caminho
import {useNotificationPolling} from '../../hooks/notification/useNotificationPolling'; // Ajuste o caminho
import {showToast, showPromiseToast} from '../../utils/toastUtils'; // Ajuste o caminho
import {coreLogger} from '../../core/logging'; // Ajuste o caminho
import {serviceEventHub, serviceLocator} from '../../core/services/BaseService'; // Ajuste o caminho
import {LOG_LEVELS} from '../../core/constants/config'; // Import LOG_LEVELS

const NotificationContext = createContext(null);

const MODULE_NAME = 'notifications';

const POLLING_INTERVAL = 30 * 1000; // 30 segundos

export const NotificationProvider = ({children}) => {
    const [state, dispatch] = useReducer(notificationReducer, initialNotificationState);
    const [isInitialized, setIsInitialized] = useState(false);
    const [notifError, setNotifError] = useState(null);  

      let notificationService;
      let serviceStore;
      let serviceNot;
      try {
        notificationService = serviceLocator.get('notifications');
        serviceStore = serviceLocator.get('store').getState()?.auth;
        serviceNot = serviceLocator.get('store').getState()?.notifications;
    
      } catch (err) {
        console.notifError('Error accessing services:', err);
        setNotifError(err);
      }
    
      const { isAuthenticated, currentUser } = serviceStore || {};
      const userId = currentUser?.uid;

    useEffect(() => {

        async function initNotifications() {
            if (isAuthenticated && currentUser) {
                
                try {
                      await notificationService.fetchNotifications()

                    setIsInitialized(true);
                } catch (error) {
                    console.error('Failed to initialize invite service:', error);
                    setIsInitialized(true);
                }
            }
        }

        if (isAuthenticated && currentUser && !isInitialized) {
            initNotifications();
        }

        return() => {
            if (isInitialized) {
                notificationService.stop();
                setIsInitialized(false);
            }
        };
    }, [isAuthenticated, currentUser, isInitialized]);

    useEffect(() => {
        if (!isInitialized) 
            return;
        try {

            const notificationFetchedUnsubscribe = serviceEventHub.on(
                MODULE_NAME,
                NOTIFICATION_EVENTS.NOTIFICATIONS_FETCHED,
                (eventData) => {
                    dispatch(
                        {type: NOTIFICATION_ACTIONS.FETCH_SUCCESS, payload: eventData.notification}
                    );
                }
            );

            // Lidar com novas notificações via Event Hub
            const notificationCreatedUnsubscribe = serviceEventHub.on(
                MODULE_NAME,
                NOTIFICATION_EVENTS.NOTIFICATION_CREATED,
                (eventData) => {
                    dispatch(
                        {type: NOTIFICATION_ACTIONS.UPDATE_NOTIFICATIONS, payload: eventData.notification}
                    );
                    if (!eventData.notification.lida) {
                        dispatch({type: NOTIFICATION_ACTIONS.UPDATE_UNREAD_COUNT});
                    }
                }
            );

            // Lidar com notificações marcadas como lidas via Event Hub
            const notificationMarkedReadUnsubscribe = serviceEventHub.on(
                MODULE_NAME,
                NOTIFICATION_EVENTS.NOTIFICATION_MARKED_READ,
                (eventData) => {
                    dispatch(
                        {type: NOTIFICATION_ACTIONS.UPDATE_UNREAD_COUNT, payload: eventData.notificationId}
                    );
                }
            );

            // Lidar com todas as notificações sendo limpas via Event Hub
            const allNotificationsClearedUnsubscribe = serviceEventHub.on(
                MODULE_NAME,
                NOTIFICATION_EVENTS.ALL_NOTIFICATIONS_CLEARED,
                () => {
                    dispatch({type: NOTIFICATION_ACTIONS.CLEAR_STATE});
                }
            );

            setIsInitialized(true);
            coreLogger.logEvent(
                MODULE_NAME,
                LOG_LEVELS.INITIALIZATION,
                'Serviço de notificações inicializado com sucesso'
            );

            return() => {
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
    }); // Dependência no userId para refazer a inicialização se o usuário mudar

    // Função para buscar notificações (mantida, mas agora depende da inicialização)
    const fetchNotifications = useCallback(async () => {
        // const notificationService = serviceLocator.get('notifications');

        if (!isInitialized || !userId) {
            coreLogger.logEvent(
                MODULE_NAME,
                LOG_LEVELS.INFO,
                'Tentativa de buscar notificações antes da inicialização ou sem userId'
            );
            return;
        }

        serviceEventHub.emit(MODULE_NAME, NOTIFICATION_ACTIONS.FETCH_START, {});

        try {
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

            dispatch(
                {type: NOTIFICATION_ACTIONS.FETCH_SUCCESS, payload: notifications, unreadCount}
            );
            return {notifications, unreadCount};
        } catch (error) {
            coreLogger.logServiceError('notifications', error, {
                context: 'fetchNotifications',
                userId
            });
            serviceEventHub.emit(
                MODULE_NAME,
                NOTIFICATION_ACTIONS.FETCH_FAILURE,
                {payload: error.message}
            );

            if (!error.message.includes('Could not refresh token') && !error.message.includes('Session expired')) {
                coreLogger.logServiceError('notifications', error, {
                    context: 'fetchNotifications',
                    userId
                });
            }
            throw error;
        }
    }, [userId, dispatch, isInitialized]);

    // Configurar polling
    useNotificationPolling(
        userId, 
        fetchNotifications,
        POLLING_INTERVAL
    );
    
    // Marcar notificação como lida
    const markAsRead = useCallback(async (notificationId) => {
        // const notificationService = serviceLocator.get('notifications');

        if (!isInitialized || !userId || !notificationId) {
            showToast(
                'Dados de notificação inválidos ou serviço não inicializado',
                {type: 'error'}
            );
            coreLogger.logEvent(
                MODULE_NAME,
                LOG_LEVELS.WARNING,
                'Tentativa de marcar notificação como lida sem inicialização ou dados completos',
                {userId, notificationId}
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

                dispatch(
                    {type: NOTIFICATION_ACTIONS.UPDATE_NOTIFICATIONS, payload: updatedNotifications}
                );
                dispatch({
                    type: NOTIFICATION_ACTIONS.UPDATE_UNREAD_COUNT,
                    payload: Math.max(0, state.unreadCount - 1)
                });

                await notificationService.markAsRead(notificationId);
                coreLogger.logEvent(
                    MODULE_NAME,
                    LOG_LEVELS.API_REQUEST_SUCCESS,
                    'Notificação marcada como lida',
                    {notificationId}
                );
                return 'Notificação marcada como lida';
            } catch (error) {
                coreLogger.logServiceError('notifications', error, {
                    context: 'markAsRead',
                    userId,
                    notificationId
                });
                // Reverter o update otimista buscando novamente as notificações
                fetchNotifications().catch(() => {
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
        // const notificationService = serviceLocator.get('notifications');

        if (!isInitialized || !userId) {
            showToast(
                'Usuário não autenticado ou serviço não inicializado',
                {type: 'error'}
            );
            coreLogger.logEvent(
                MODULE_NAME,
                LOG_LEVELS.WARNING,
                'Tentativa de limpar notificações sem inicialização ou userId',
                {userId}
            );
            return;
        }

        return showPromiseToast((async () => {
            try {
                // Optimistic update
                dispatch({type: NOTIFICATION_ACTIONS.UPDATE_NOTIFICATIONS, payload: []});
                dispatch({type: NOTIFICATION_ACTIONS.UPDATE_UNREAD_COUNT, payload: 0});

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
                fetchNotifications().catch(() => {
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

    // Memoizar o valor do contexto
    const contextValue = useMemo(() => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        notifLoading: state.notifLoading,
        error: state.error,
        markAsRead,
        clearAllNotifications,
        refreshNotifications: fetchNotifications,
        isNotificationsInitialized: isInitialized, // Exponha o estado de inicialização
    }), [
        state.notifications,
        state.unreadCount,
        state.notifLoading,
        state.error,
        markAsRead,
        clearAllNotifications,
        fetchNotifications,
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