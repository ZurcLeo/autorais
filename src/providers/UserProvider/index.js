// src/providers/UserProvider/index.js - Versão corrigida
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useReducer,
    useCallback,
    useRef
} from 'react';
import {LOG_LEVELS} from '../../core/constants/config.js';
import {AUTH_ACTIONS, USER_ACTIONS} from '../../core/constants/actions.js';
import {AUTH_EVENTS, USER_EVENTS} from '../../core/constants/events.js';
import {coreLogger} from '../../core/logging';
import {useAuth} from '../AuthProvider';
import {initialUserState} from '../../core/constants/initialState.js';
import {userReducer} from '../../reducers/user/userReducer';
import {serviceEventHub, serviceLocator} from '../../core/services/BaseService';
import {showToast} from '../../utils/toastUtils';

const UserContext = createContext(null);
const MODULE_NAME = 'user';

export const UserProvider = ({children}) => {
    const {isAuthenticated, currentUser} = useAuth();
    const [state, dispatch] = useReducer(userReducer, initialUserState);
    const {userLoading} = state;
    const [isInitialized, setIsInitialized] = useState(false);

    // Ref para controlar tentativas de carregamento e evitar loops
    const loadingRef = useRef(
        {isLoading: false, hasAttempted: false, lastUserId: null, pendingLoadRequest: null}
    );

    // Inicializar o serviço de usuário
    useEffect(() => {

        async function initUserService() {

            if (isInitialized) 
                return;
            
            // await userService.initialize();
            try {
                setIsInitialized(true);

                // Configurar listeners para eventos
                return setupEventListeners();
            } catch (error) {
                console.error('Failed to initialize user service:', error);
                serviceEventHub.emit(MODULE_NAME, USER_EVENTS.USER_ERROR, {
                    error: error.message,
                    code: error.code || 'init_failed'
                });
                setIsInitialized(true);
            }
        }

        initUserService();

    }, []);

    // Extrair userId de forma defensiva
    const extractUserId = () => {
        if (!currentUser) 
            return null;
        
        console.log('[UserProvider] Verificando userId em currentUser:', currentUser);

        // Primeiro, tente o caminho direto
        if (currentUser.uid) {
            return currentUser.uid;
        }

        // Então, verifique o objeto user interno
        if (currentUser.user && currentUser.user.uid) {
            return currentUser.user.uid;
        }

        // Por último, verifique outras possibilidades
        if (currentUser.userId) {
            return currentUser.userId;
        }

        return null;
    };

    // Effect específico para carregamento de perfil após autenticação
    useEffect(() => {

        // Evitar carregar se não estiver autenticado ou ainda não inicializado
        if (!isAuthenticated || !isInitialized) {
            return;
        }

        const userId = extractUserId();

        // Se não temos um ID válido, não podemos carregar o perfil
        if (!userId) {
            console.warn(
                '[UserProvider] Não foi possível obter um userId válido do currentUser:',
                currentUser
            );
            return;
        }

        // Evitar carregamentos duplicados
        if (loadingRef.current.isLoading) {
            console.log(
                '[UserProvider] Já existe uma operação de carregamento em andamento para:',
                loadingRef.current.lastUserId
            );
            return;
        }

        // Se já carregamos o perfil deste usuário, não precisamos fazer novamente
        if (loadingRef.current.lastUserId === userId && loadingRef.current.hasAttempted) {
            console.log(
                '[UserProvider] Perfil já foi carregado anteriormente para:',
                userId
            );
            return;
        }

        console.log('[UserProvider] Iniciando carregamento de perfil para:', userId);

        // Atualizar referências de carregamento
        loadingRef.current.isLoading = true;
        loadingRef.current.lastUserId = userId;

        // Chamar a função loadUserProfile com bloqueio de corrida
        const loadProfile = async () => {
            try {
                await loadUserProfile(userId);
                loadingRef.current.hasAttempted = true;
            } catch (error) {
                console.error('[UserProvider] Erro ao carregar perfil:', error);
            } finally {
                loadingRef.current.isLoading = false;
            }
        };

        // Cancelar requisições pendentes
        if (loadingRef.current.pendingLoadRequest) {
            clearTimeout(loadingRef.current.pendingLoadRequest);
        }

        // Agendar a carga do perfil com pequeno delay para evitar corridas
        loadingRef.current.pendingLoadRequest = setTimeout(loadProfile, 50);

        return() => {
            if (loadingRef.current.pendingLoadRequest) {
                clearTimeout(loadingRef.current.pendingLoadRequest);
            }
        };
    }, [isAuthenticated, currentUser, isInitialized]);

    // Monitorar estado de loading para depuração
    useEffect(() => {
        console.log("[UserProvider] UserLoading state: ", state);
    }, [userLoading]);

    // Função para configurar listeners de eventos
    const setupEventListeners = useCallback(() => {

        // Listener para eventos de logout
        const authLogoutListener = serviceEventHub.on(
            'auth',
            'AUTH_LOGOUT_COMPLETED',
            () => {
                console.log('[UserProvider] Auth logout event received');

                // Limpar dados do usuário
                dispatch({type: USER_ACTIONS.CLEAR_USER});

                // Resetar flags de carregamento
                loadingRef.current.isLoading = false;
                loadingRef.current.hasAttempted = false;
                loadingRef.current.lastUserId = null;

                if (loadingRef.current.pendingLoadRequest) {
                    clearTimeout(loadingRef.current.pendingLoadRequest);
                    loadingRef.current.pendingLoadRequest = null;
                }
            }
        );

        const authStartListener = serviceEventHub.on(
            'auth',
            'USER_SIGNED_IN',
            (data) => {
                console.log('UserProvider received USER_SIGNED_IN event:', data);
                // Extrair os dados corretamente independente da estrutura
                const userData = data.user || data.profile || data;
                
                dispatch({
                    type: USER_ACTIONS.USER_PROFILE_COMPLETE,
                   
                        userId: userData.uid || userData.id,
                        email: userData.email,
                        user: data,
                        userLoading: false,
                        timestamp: Date.now()
                    
                });
            }
        );

        const authSessionListener = serviceEventHub.on(
            'auth',
            'AUTH_SESSION_VALID',
            (data) => {
                console.log('UserProvider received AUTH_SESSION_VALID event:', data);
                const userData = data.user || data;
                
                // Iniciar carregamento do perfil do usuário
                if (userData && (userData.uid || userData.id)) {
                    const userId = userData.uid || userData.id;
                    
                    // Usar uma função setTimeout para evitar chamadas duplicadas
                    if (loadingRef.current.pendingLoadRequest) {
                        clearTimeout(loadingRef.current.pendingLoadRequest);
                    }
                    
                    loadingRef.current.pendingLoadRequest = setTimeout(() => {
                        loadUserProfile(userId);
                    }, 100);
                }
            }
        );

        // Retornar função para limpar listeners
        return() => {
            authLogoutListener();
            authStartListener();
            authSessionListener();
        };
    }, []);

    // Função para carregar o perfil do usuário
    const loadUserProfile = useCallback(async (userId) => {
        const userService = serviceLocator.get('users');

        // Evitar corrida de condições definindo uma flag de loading
        if (loadingRef.current.isLoading && loadingRef.current.lastUserId === userId) {
            console.log('[UserProvider] Já existe carregamento em andamento para:', userId);
            return;
        }

        try {
            loadingRef.current.isLoading = true;
            loadingRef.current.lastUserId = userId;

            // dispatch({type: USER_ACTIONS.FETCH_START, payload: {
            //         userId
            //     }});

            const userData = await userService.getUserProfile(userId);

            // Despachar ação apenas APÓS os dados serem recebidos com sucesso
            // dispatch({type: AUTH_ACTIONS.LOGIN_SUCCESS, userData});

            return userData;
        } catch (error) {
            console.error('[UserProvider] Error loading profile', error);
            dispatch({
                type: USER_ACTIONS.FETCH_FAILURE,
                    error: error.message
            });
            throw error;
        } finally {
            loadingRef.current.isLoading = false;
            loadingRef.current.hasAttempted = true;
        }
    }, [dispatch]);

    // Service wrapper methods
    const getUserById = useCallback(async (userId) => {
        const userService = serviceLocator.get('users');

        try {
            dispatch({type: USER_ACTIONS.FETCH_START,
                    userId
                });
            const userData = await userService.getUserProfile(userId);
            // serviceEventHub.emit(MODULE_NAME, USER_EVENTS.PROFILE_FETCHED, {payload:
            // userData})
            dispatch({type: USER_ACTIONS.FETCH_USER_SUCCESS, userData});
            return userData;
        } catch (error) {
            coreLogger.logEvent(
                'UserProvider',
                LOG_LEVELS.ERROR,
                'Error fetching user data',
                {userId, error: error.message}
            );
            dispatch({
                type: USER_ACTIONS.FETCH_FAILURE,
                
                    error: error.message
                
            });
            throw error;
        }
    }, [dispatch]);

    const updateUser = useCallback(async (userId, updates) => {
        const userService = serviceLocator.get('users');

        try {
            dispatch({type: USER_ACTIONS.FETCH_START, 
                    userId
                });
            const updatedUser = await userService.updateUserProfile(userId, updates);
            dispatch({type: USER_ACTIONS.UPDATE_SUCCESS, updatedUser});
            showToast('User updated successfully', {type: 'success'});
            return updatedUser;
        } catch (error) {
            coreLogger.logEvent(
                'UserProvider',
                LOG_LEVELS.ERROR,
                'Error updating user',
                {userId, error: error.message}
            );
            dispatch({
                type: USER_ACTIONS.FETCH_FAILURE,
                
                    error: error.message
                
            });
            showToast('Error updating user', {type: 'error'});
            throw error;
        }
    }, [dispatch]);

    const uploadProfilePicture = useCallback(async (userId, profilePicture) => {
        const userService = serviceLocator.get('users');

        try {
            serviceEventHub.emit(MODULE_NAME, USER_ACTIONS.FETCH_START, {});
            const result = await userService.uploadProfilePicture(userId, profilePicture);
            serviceEventHub.emit(
                MODULE_NAME,
                USER_ACTIONS.UPDATE_SUCCESS,
                {fotoDoPerfil: result.publicUrl}
            );
            showToast('Profile picture updated successfully', {type: 'success'});
            return result;
        } catch (error) {
            coreLogger.logEvent(
                'UserProvider',
                LOG_LEVELS.ERROR,
                'Error uploading profile picture',
                {userId, error: error.message}
            );
            serviceEventHub.emit(MODULE_NAME, USER_ACTIONS.FETCH_FAILURE, error.message);
            showToast('Error uploading profile picture', {type: 'error'});
            throw error;
        }
    }, []);

    const deleteAccount = useCallback(async (userId) => {
        const userService = serviceLocator.get('users');

        try {
            await userService.deleteUser(userId);
            serviceEventHub.emit(MODULE_NAME, USER_ACTIONS.CLEAR_USER, {});
            showToast('Account deleted successfully', {type: 'success'});
        } catch (error) {
            coreLogger.logEvent(
                'UserProvider',
                LOG_LEVELS.ERROR,
                'Error deleting account',
                {userId, error: error.message}
            );
            serviceEventHub.emit(MODULE_NAME, USER_ACTIONS.FETCH_FAILURE, error.message);
            showToast('Error deleting account', {type: 'error'});
            throw error;
        }
    }, []);

    const addUser = useCallback(async (userData) => {
        const userService = serviceLocator.get('users');

        try {
            serviceEventHub.emit(MODULE_NAME, USER_ACTIONS.FETCH_START, {});
            const newUser = await userService.addUser(userData);
            serviceEventHub.emit(MODULE_NAME, USER_ACTIONS.FETCH_USER_SUCCESS, newUser);
            showToast('User added successfully', {type: 'success'});
            return newUser;
        } catch (error) {
            coreLogger.logEvent(
                'UserProvider',
                LOG_LEVELS.ERROR,
                'Error adding user',
                {error: error.message}
            );
            serviceEventHub.emit(
                MODULE_NAME,
                USER_ACTIONS.FETCH_FAILURE,
                error.message
            );
            showToast('Error adding user', {type: 'error'});
            throw error;
        }
    }, []);

    const getUsers = useCallback(async () => {
        const userService = serviceLocator.get('users');

        try {
            serviceEventHub.emit(MODULE_NAME, USER_ACTIONS.FETCH_START, {});
            const users = await userService.getUsers();
            // You might want to add a specific action for users list if needed
            return users;
        } catch (error) {
            coreLogger.logEvent(
                'UserProvider',
                LOG_LEVELS.ERROR,
                'Error fetching users',
                {error: error.message}
            );
            serviceEventHub.emit(MODULE_NAME, USER_ACTIONS.FETCH_FAILURE, error.message);
            throw error;
        }
    }, []);

    // Context value
    const value = {
        ...state,
        isInitialized,
        getUserById,
        updateUser,
        uploadProfilePicture,
        deleteAccount,
        addUser,
        getUsers
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }
    return context;
};