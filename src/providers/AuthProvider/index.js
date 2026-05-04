import React, { createContext, useContext, useEffect, useReducer, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceEventHub, serviceLocator } from '../../core/services/BaseService.js';
import { debugServiceInstance } from '../../core/services/serviceDebug.js';
import { authReducer } from '../../reducers/auth/authReducer';
import { initialAuthState } from '../../core/constants/initialState.js';
import { AUTH_ACTIONS } from '../../core/constants/actions.js';
import { coreLogger } from '../../core/logging';
import { LOG_LEVELS } from '../../core/constants/config.js';
import { useServiceInitialization } from '../../core/initialization/ServiceInitializationProvider.js';

const AuthContext = createContext(null);
const MODULE_NAME = 'AuthProvider';

export const setupAuthEventMonitoring = () => {
  const unsubscribeAuthEvents = serviceEventHub.onAny('*', (serviceName, eventType, data) => {
    if (serviceName === 'auth') {
      console.group(`🔔 Evento de Auth detectado: ${eventType}`);
      console.log('Dados:', data);
      debugServiceInstance('auth');
      console.groupEnd();
    }
  });
  
  return unsubscribeAuthEvents;
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const { currentUser, error, isAuthenticated } = state;
  const navigate = useNavigate();
  const pendingActions = useRef([]);
  
  // Usar o hook de inicialização para verificar o estado do serviço
  const { isServiceReady, getServiceError } = useServiceInitialization();

  // Verificar se o serviço de autenticação está pronto
  const authServiceReady = isServiceReady('auth');
  const authServiceError = getServiceError('auth');
  const eventBridgeReady = isServiceReady('eventActionBridge');
  const storeServiceReady = isServiceReady('store');

  // Estado para rastrear se estamos no meio de uma transição de autenticação
  const [authTransition, setAuthTransition] = useState(false);

  // Adicionar um ref para rastrear a última ação de login
  const lastAuthAction = useRef(null);

  useEffect(() => {
    coreLogger.logEvent(
      MODULE_NAME,
      LOG_LEVELS.INFO,
      '[AuthProvider] Estado atualizado',
      {
        currentUser: state.currentUser,
        authLoading: state.authLoading,
        isAuthenticated: state.isAuthenticated,
        hasUser: !!currentUser,
        userId: currentUser?.uid || currentUser?.id,
        authServiceReady,
        eventBridgeReady,
        storeServiceReady,
        error: error || authServiceError,
        timestamp: Date.now()
      }
    );
  }, [state]);

  // Este efeito é crítico - ouve os eventos de autenticação do serviço
  useEffect(() => {
    console.log("Setting up AUTH_SESSION_VALID event listener");
    
    // Verify serviceEventHub is available
    if (!serviceEventHub) {
      console.error("serviceEventHub is not available!");
      return;
    }
    
    // Event listener para AUTH_SESSION_VALID
    const authSessionValidUnsubscribe = serviceEventHub.on(
      'auth', 
      'AUTH_SESSION_VALID', 
      (data) => {
        console.log('AuthProvider received AUTH_SESSION_VALID event:', data);
        
        // Dispatch para o reducer com payload consistente
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: data.user,
            isAuthenticated: true,
            userId: data.userId || data.user.uid,
            timestamp: data.timestamp || Date.now()
          }
        });

        // Se estivermos em transição de auth, considere navegar para dashboard
        if (authTransition) {
          setAuthTransition(false);
          // Só navegar se não estamos já navegando do login/auth
          if (lastAuthAction.current === 'login' || lastAuthAction.current === 'register') {
            console.log('Navegando para dashboard após AUTH_SESSION_VALID');
            navigate('/dashboard', { replace: true });
          }
        }
      }
    );

    // Event listener para AUTH_ERROR
    const authErrorUnsubscribe = serviceEventHub.on(
      'auth', 
      'AUTH_ERROR', 
      (data) => {
        console.log('AuthProvider received AUTH_ERROR event:', data);
        
        dispatch({
          type: AUTH_ACTIONS.AUTH_ERROR,
          payload: {
            error: data.error || 'Erro de autenticação',
            code: data.code,
            timestamp: data.timestamp || Date.now()
          }
        });

        setAuthTransition(false);
      }
    );
    
    // Event listener para USER_SIGNED_OUT
    const userSignedOutUnsubscribe = serviceEventHub.on(
      'auth', 
      'USER_SIGNED_OUT', 
      (data) => {
        console.log('AuthProvider received USER_SIGNED_OUT event:', data);
        
        dispatch({
          type: AUTH_ACTIONS.LOGOUT_SUCCESS,
          payload: {
            timestamp: data.timestamp || Date.now()
          }
        });

        setAuthTransition(false);
        navigate('/login', { replace: true });
      }
    );
    
    return () => {
      if (typeof authSessionValidUnsubscribe === 'function') {
        authSessionValidUnsubscribe();
      }
      if (typeof authErrorUnsubscribe === 'function') {
        authErrorUnsubscribe();
      }
      if (typeof userSignedOutUnsubscribe === 'function') {
        userSignedOutUnsubscribe();
      }
    };
  }, [navigate, authTransition]);

  useEffect(() => {
    // Se o serviço de autenticação estiver pronto, sincronizar o estado local com o serviço
    if (authServiceReady && !authTransition) {
      const authService = serviceLocator.get('auth');
      const serviceUser = authService.getCurrentUser();
      
      // Se o serviço tiver um usuário mas nosso estado não, sincronizar
      if (serviceUser && (!currentUser || serviceUser.uid !== currentUser.uid)) {
        console.log('Sincronizando estado AuthProvider com serviço de auth:', serviceUser);
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: serviceUser,
            isAuthenticated: true,
            userId: serviceUser.uid,
            timestamp: Date.now()
          }
        });
      }
      // Se o serviço não tiver usuário mas nosso estado sim, considerar logout
      else if (!serviceUser && currentUser) {
        console.log('Serviço de auth não tem usuário mas AuthProvider sim, resetando estado');
        
        dispatch({
          type: AUTH_ACTIONS.LOGOUT_SUCCESS,
          payload: {
            timestamp: Date.now()
          }
        });
      }
    }
  }, [authServiceReady, currentUser, authTransition]);

  useEffect(() => {
    if (authServiceReady && pendingActions.current.length > 0) {
      coreLogger.logEvent(
        MODULE_NAME,
        LOG_LEVELS.INFO,
        `Processando ${pendingActions.current.length} ações pendentes`
      );

      const actions = [...pendingActions.current];
      pendingActions.current = [];

      actions.forEach(async ({ actionName, action, resolve, reject }) => {
        try {
          const result = await action();
          resolve(result);
          coreLogger.logEvent(
            MODULE_NAME,
            LOG_LEVELS.INFO,
            `Ação pendente ${actionName} processada com sucesso`
          );
        } catch (error) {
          reject(error);
          coreLogger.logEvent(
            MODULE_NAME,
            LOG_LEVELS.ERROR,
            `Ação pendente ${actionName} falhou`,
            { error: error.message }
          );
        }
      });
    }
  }, [authServiceReady]);

  const executeIfReady = async (actionName, action) => {
    if (!authServiceReady) {
      coreLogger.logEvent(
        MODULE_NAME,
        LOG_LEVELS.WARNING,
        `${actionName} chamado antes do serviço estar pronto. Colocando na fila.`
      );

      return new Promise((resolve, reject) => {
        pendingActions.current.push({
          actionName,
          action,
          resolve,
          reject
        });
      });
    }

    try {
      return await action();
    } catch (error) {
      coreLogger.logEvent(
        MODULE_NAME,
        LOG_LEVELS.ERROR,
        `Erro ao executar ${actionName}`,
        { error: error.message }
      );
      throw error;
    }
  };

  const login = async (email, password) => {
    const authService = serviceLocator.get('auth');

    // Marcamos que estamos em transição de autenticação
    setAuthTransition(true);
    lastAuthAction.current = 'login';
    
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const result = await executeIfReady('login', () => 
        authService.signInWithEmail(email, password)
      );
      
      // Verificar se o resultado contém um usuário
      if (result && (result.uid || result.user?.uid)) {
        // Dispatch de LOGIN_SUCCESS deve vir do evento AUTH_SESSION_VALID
        // mas fazemos um dispatch aqui como fallback
        setTimeout(() => {
          // Se ainda estamos em transição após 2 segundos, forçar navegação
          if (authTransition) {
            console.log('Forçando navegação para dashboard após timeout');
            setAuthTransition(false);
            navigate('/dashboard', { replace: true });
          }
        }, 2000);
      }
      
      return result;
    } catch (error) {
      // Em caso de erro, resetar o estado de transição
      setAuthTransition(false);
      // O dispatch de LOGIN_FAILURE ocorrerá no authReducer
      throw error;
    }
  };

  const register = async (email, password, additionalData = {}) => {
    const authService = serviceLocator.get('auth');

    // Marcamos que estamos em transição de autenticação
    setAuthTransition(true);
    lastAuthAction.current = 'register';
    
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    
    try {
      const result = await executeIfReady('register', () =>
        authService.registerWithEmail(
          email,
          password,
          additionalData.displayName || additionalData.nome,
          additionalData.inviteId
        )
      );
      
      // Verificar se o resultado contém um usuário
      if (result && (result.uid || result.user?.uid)) {
        // Dispatch de REGISTER_SUCCESS deve vir do evento AUTH_SESSION_VALID
        // mas fazemos um dispatch aqui como fallback
        setTimeout(() => {
          // Se ainda estamos em transição após 2 segundos, forçar navegação
          if (authTransition) {
            console.log('Forçando navegação para dashboard após timeout');
            setAuthTransition(false);
            navigate('/dashboard', { replace: true });
          }
        }, 2000);
      }
      
      return result;
    } catch (error) {
      // Em caso de erro, resetar o estado de transição
      setAuthTransition(false);
      // O dispatch de REGISTER_FAILURE ocorrerá no authReducer
      throw error;
    }
  };

  const registerWithProvider = async (provider, inviteId, registrationToken) => {
    const authService = serviceLocator.get('auth');
  
    // Marcamos que estamos em transição de autenticação
    setAuthTransition(true);
    lastAuthAction.current = 'registerWithProvider';
    
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    
    try {
      const result = await executeIfReady('registerWithProvider', () =>
        authService.registerWithProvider(
          provider,
          inviteId,
          registrationToken
        )
      );
      
      // Verificar se o resultado contém um usuário
      if (result && (result.uid || result.user?.uid)) {
        // Dispatch de REGISTER_SUCCESS deve vir do evento AUTH_SESSION_VALID
        // mas fazemos um dispatch aqui como fallback
        setTimeout(() => {
          // Se ainda estamos em transição após 2 segundos, forçar navegação
          if (authTransition) {
            console.log('Forçando navegação para dashboard após timeout');
            setAuthTransition(false);
            navigate('/dashboard', { replace: true });
          }
        }, 2000);
      }
      
      return result;
    } catch (error) {
      // Em caso de erro, resetar o estado de transição
      setAuthTransition(false);
      // O dispatch de REGISTER_FAILURE ocorrerá no authReducer
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    const authService = serviceLocator.get('auth');

    // Marcamos que estamos em transição de autenticação
    setAuthTransition(true);
    lastAuthAction.current = 'loginWithGoogle';
    
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const result = await executeIfReady('loginWithGoogle', () => 
        authService.signInWithGoogle()
      );
      
      // Verificar se o resultado contém um usuário
      if (result && (result.uid || result.user?.uid)) {
        // Dispatch de LOGIN_SUCCESS deve vir do evento AUTH_SESSION_VALID
        // mas fazemos um dispatch aqui como fallback
        setTimeout(() => {
          // Se ainda estamos em transição após 2 segundos, forçar navegação
          if (authTransition) {
            console.log('Forçando navegação para dashboard após timeout');
            setAuthTransition(false);
            navigate('/dashboard', { replace: true });
          }
        }, 2000);
      }
      
      return result;
    } catch (error) {
      // Em caso de erro, resetar o estado de transição
      setAuthTransition(false);
      // O dispatch de LOGIN_FAILURE ocorrerá no authReducer
      throw error;
    }
  };

  const loginWithMicrosoft = async () => {
    const authService = serviceLocator.get('auth');

    // Marcamos que estamos em transição de autenticação
    setAuthTransition(true);
    lastAuthAction.current = 'loginWithMicrosoft';
    
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const result = await executeIfReady('loginWithMicrosoft', () => 
        authService.signInWithMicrosoft()
      );
      
      // Verificar se o resultado contém um usuário
      if (result && (result.uid || result.user?.uid)) {
        // Dispatch de LOGIN_SUCCESS deve vir do evento AUTH_SESSION_VALID
        // mas fazemos um dispatch aqui como fallback
        setTimeout(() => {
          // Se ainda estamos em transição após 2 segundos, forçar navegação
          if (authTransition) {
            console.log('Forçando navegação para dashboard após timeout');
            setAuthTransition(false);
            navigate('/dashboard', { replace: true });
          }
        }, 2000);
      }
      
      return result;
    } catch (error) {
      // Em caso de erro, resetar o estado de transição
      setAuthTransition(false);
      // O dispatch de LOGIN_FAILURE ocorrerá no authReducer
      throw error;
    }
  };

  const logout = async () => {
    const authService = serviceLocator.get('auth');

    return executeIfReady('logout', async () => {
      try {
        await authService.logoutAndClearSession();
        navigate('/login', { replace: true });
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Logout concluído e navegação realizada.');
        return true;
      } catch (err) {
        console.error('Erro durante o processo de logout:', err);
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Logout falhou', { error: err.message });
        navigate('/login', { replace: true });
        return false;
      }
    });
  };

  const switchAccount = async () => {
    const authService = serviceLocator.get('auth');

    return executeIfReady('switchAccount', async () => {
      try {
        await authService.logoutAndClearSession();
        const urlParams = new URLSearchParams();
        urlParams.set('explicitLogout', 'true');
        navigate('/login?' + urlParams.toString());
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Troca de conta iniciada (via logout).');
        return true;
      } catch (err) {
        console.error('Erro ao tentar trocar de conta:', err);
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Falha ao trocar de conta', { error: err.message });
        navigate('/login?explicitLogout=true');
        return false;
      }
    });
  };

  // Se o serviço auth tiver falhado na inicialização, mostrar erro
  if (authServiceError) {
    return (
      <div className="auth-error-container">
        <h2>Erro no serviço de autenticação</h2>
        <p>{authServiceError}</p>
      </div>
    );
  }

  const value = {
    ...state,
    isInitialized: authServiceReady, // Usar o status do serviço
    serviceReady: authServiceReady,  // Para compatibilidade
    login,
    register,
    registerWithProvider,
    loginWithGoogle,
    loginWithMicrosoft,
    logout,
    switchAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
export { AuthContext };
