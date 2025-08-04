import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    OAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import {auth as firebaseAuth} from '../../firebaseConfig';
import {BaseService, serviceLocator, serviceEventHub} from '../../core/services/BaseService';
import {AUTH_EVENTS} from '../../core/constants/events.js';
import {LOG_LEVELS} from '../../core/constants/config.js';
import {AUTH_ACTIONS, SERVICE_ACTIONS} from '../../core/constants/actions.js';

const MODULE_NAME = 'auth';

class AuthService extends BaseService {
    constructor() {
        super(MODULE_NAME);
        console.log("Firebase auth disponível:", !!firebaseAuth);
        this.instanceId = Math
            .random()
            .toString(36)
            .substring(2, 10);

        this._authorization = null;
        this._refreshToken = null;
        this._tokenExpiry = null;
        this._isInitialized = false;

        this._metadata = {
            name: MODULE_NAME,
            phase: 'CORE', // Fase de inicialização (CORE, ESSENTIAL, etc.)
            criticalPath: true, // Indica se é um serviço crítico para a aplicação
            dependencies: ['apiService'], // Serviços que devem estar prontos antes deste
            category: 'initialization', // Categoria do serviço
            description: 'Gerencia estado de autenticacao e acesso a aplicacao' // Descrição
        };

        this.apiService = serviceLocator.get('apiService');
    }

    async initialize() {
        if (this.isInitialized) 
            return this;
        
        this._log(
            LOG_LEVELS.LIFECYCLE,
            MODULE_NAME,
            this.instanceId,
            'Initializing auth service specific logic'
        );

        // Configurar o listener para mudanças de estado de autenticação
        this._setupAuthStateListener();

        this._isInitialized = true;

        this._emitEvent(SERVICE_ACTIONS.SERVICE_READY, {
            serviceName: MODULE_NAME,
            timestamp: new Date().toISOString()
        });
        this._setupAuthStateListener()
        this._ensureConsistentState()
        return this; // Indica sucesso para BaseService
    }

    async healthCheck() {
        // BaseService handles start/stop loading
        return this
            ._executeWithRetry(async () => {
                const healthResponse = await this
                    .apiService
                    .get(`/api/health/service/${this.serviceName}`);
                if (
                    healthResponse.data
                        ?.status !== 'healthy'
                ) {
                    throw new Error(
                        `Backend service ${this.serviceName} reported unhealthy: ${healthResponse.data
                            ?.status}`
                    );
                }
                return {status: healthResponse.data.status, timestamp: Date.now()};
            }, 'healthCheck')
            .catch(error => {
                // Fallback logic moved inside catch block for clarity
                this._log(
                    MODULE_NAME,
                    LOG_LEVELS.WARNING,
                    'Health check failed, proceeding in degraded mode',
                    {error: error.message}
                );
                return {status: 'degraded', details: 'Health check failed or endpoint unavailable', timestamp: Date.now(), error: error.message};
            });
    }

    async shutdown() {
        // Specific cleanup for this service
        if (this._authUnsubscribe) {
            this._authUnsubscribe();
            this._authUnsubscribe = null;
        }
        // BaseService.stop handles SERVICE_STOPPED emission and listener cleanup
    }

async registerWithEmail(email, password, displayName, inviteId, profileData) {
  try {
      this._log(MODULE_NAME, LOG_LEVELS.STATE, 'Iniciando registro de usuário', 
          {email, inviteId});

      // 1. Criar usuário no Firebase
      const userCredential = await this._executeWithRetry(
          () => createUserWithEmailAndPassword(firebaseAuth, email, password),
          'registerWithEmailFirebase'
      );

      // 2. Obter token para autenticação no backend
      const idToken = await userCredential.user.getIdToken();

      // 3. Enviar dados completos para o backend em uma única chamada
      try {
          const response = await this.apiService.post('/api/auth/register', {
              uid: userCredential.user.uid,
              email,
              nome: displayName,
              inviteId,
              profileData // Dados completos do perfil
          }, {
              headers: {
                  Authorization: `Bearer ${idToken}`
              }
          });
          
          // 4. Processar resposta do backend se necessário
          const backendData = response.data;
          
          // 5. Mapear e retornar dados do usuário
          const userData = {
              ...this._mapFirebaseUser(userCredential.user),
              ...profileData, // Incluir dados do perfil
              ...backendData.user // Sobrescrever com dados do backend se houver
          };
          
          this._currentUser = userData;

          // 6. Emitir evento de autenticação bem-sucedida
          this._emitEvent(AUTH_EVENTS.AUTH_SESSION_VALID, {
              userId: userData.uid,
              email: userData.email,
              user: userData,
              isAuthenticated: true,
              timestamp: Date.now()
          });

          // 7. Emitir evento de primeiro acesso
          this._emitEvent(AUTH_EVENTS.FIRST_ACCESS_DETECTED, {
              user: userData,
              inviteId: inviteId,
              timestamp: Date.now()
          });

          return userData;
          
      } catch (backendError) {
          this._log(
              MODULE_NAME,
              LOG_LEVELS.ERROR,
              'Erro ao registrar no backend',
              {error: backendError.message}
          );
          
          // Se falhar no backend, ainda temos o usuário no Firebase
          // Devemos decidir se continuamos ou não
          throw backendError; // Propagar erro para tratamento no nível superior
      }
  } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Registro falhou', {
          error: error.message,
          code: error.code
      });

      this._emitEvent(AUTH_EVENTS.AUTH_ERROR, {
          error: error.message,
          code: error.code,
          context: 'registerWithEmail'
      });

      throw error;
  }
}

async registerWithProvider(provider, profileData, inviteId, registrationToken) {
  try {
      this._log(
          MODULE_NAME,
          LOG_LEVELS.STATE,
          'Provider registration initiated',
          {provider, inviteId}
      );

      // 1. Resolver o provedor adequado
      let authProvider;
      if (provider === 'google') {
          authProvider = new GoogleAuthProvider();
          authProvider.setCustomParameters({
              'prompt': 'select_account',
              'hd': 'eloscloud.com' // Opcional: restringir a domínios específicos
          });
      } else if (provider === 'microsoft') {
          authProvider = new OAuthProvider('microsoft.com');
          authProvider.setCustomParameters({prompt: 'select_account'});
      // } else if (provider === 'github') {
      //     authProvider = new GithubAuthProvider();
      } else {
          throw new Error('Provedor inválido');
      }

      // 2. Autenticar com o provedor
      const userCredential = await signInWithPopup(firebaseAuth, authProvider);
      
      // 3. Obter token para autenticação no backend
      const firebaseToken = await userCredential.user.getIdToken();

      // 4. Enviar dados completos para o backend em uma única chamada
      try {
          const response = await this.apiService.post('/api/auth/register', {
              uid: userCredential.user.uid,
              provider,
              inviteId,
              registrationToken,
              profileData, // Dados completos do perfil
              firebaseToken
          });
          
          // 5. Processar resposta do backend
          const backendData = response.data;
          
          // 6. Mapear e retornar dados do usuário
          const userData = {
              ...this._mapFirebaseUser(userCredential.user),
              ...profileData, // Dados do perfil
              ...backendData.user // Sobrescrever com dados do backend se houver
          };
          
          this._currentUser = userData;

          // 7. Emitir eventos relevantes
          this._emitEvent(AUTH_EVENTS.AUTH_SESSION_VALID, {
              userId: userData.uid,
              email: userData.email,
              user: userData,
              isAuthenticated: true,
              timestamp: Date.now()
          });

          this._emitEvent(AUTH_EVENTS.FIRST_ACCESS_DETECTED, {
              user: userData,
              inviteId: inviteId,
              timestamp: Date.now()
          });

          return userData;
          
      } catch (backendError) {
          this._log(
              MODULE_NAME,
              LOG_LEVELS.ERROR,
              'Erro ao registrar com provedor no backend',
              {error: backendError.message}
          );
          throw backendError;
      }
  } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Registro com provedor falhou', {
          error: error.message,
          code: error.code
      });

      this._emitEvent(AUTH_EVENTS.AUTH_ERROR, {
          error: error.message,
          code: error.code,
          context: 'registerWithProvider'
      });

      throw error;
  }
}

    async signInWithEmail(email, password) {

        try {
            this._log(MODULE_NAME, LOG_LEVELS.STATE, 'Email sign-in initiated', {email});
            const userCredential = await this._executeWithRetry(
                // Add retry
                        () => signInWithEmailAndPassword(firebaseAuth, email, password),
                'signInWithEmailFirebase'
            );
            // *** NO event emission here *** _onAuthStateChanged will handle the flow after
            // Firebase confirms user
            const user = this._mapFirebaseUser(userCredential.user);
            return user; // Map basic info immediately
        } catch (error) {

            this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Email sign-in failed', {
                error: error.message,
                code: error.code
            });
            this._emitEvent(AUTH_EVENTS.AUTH_ERROR, { // Emit standard error event

                error: error.message,
                code: error.code,
                context: 'signInWithEmail'

            });
            throw error; // Rethrow for AuthProvider
        }
    }

    async signInWithGoogle() {

        try {
            this._log(MODULE_NAME, LOG_LEVELS.STATE, 'Google sign-in initiated');
            const provider = new GoogleAuthProvider();
            
            // Configurar parâmetros personalizados para melhorar a experiência do usuário
            provider.setCustomParameters({
                'prompt': 'select_account',
                'hd': 'eloscloud.com' // Opcional: restringir a domínios específicos
            });
            
            const userCredential = await signInWithPopup(firebaseAuth, provider);
            // const userData = userCredential.user; Optional: Emit a simple USER_SIGNED_IN
            // immediately if needed for quick UI feedback before backend validation, but
            // AUTH_SESSION_VALID from onAuthStateChanged is primary.
            // this._emitEvent(AUTH_EVENTS.USER_SIGNED_IN, {     userId: userData.uid,
            // email: userData.email,     user: userData,  Full user data from backend
            // isAuthenticated: true,     authSource: 'microsoft',     timestamp: Date.now()
            // });   this._emitEvent(AUTH_EVENTS.AUTH_SESSION_VALID, {     userId:
            // userData.uid,     email: userData.email,     user: userData,
            // isAuthenticated: true,     authSource: 'microsoft',     timestamp: Date.now()
            // });

            return this._mapFirebaseUser(userCredential.user); // Return basic info
        } catch (error) {

            this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Google sign-in failed', {
                error: error.message,
                code: error.code
            });
            this._emitEvent(AUTH_EVENTS.AUTH_ERROR, { // Emit standard error event
                error: error.message,
                code: error.code,
                context: 'signInWithGoogle'
            });
            throw error;
        }
    }

    async signInWithMicrosoft() {

        try {
            this._log(MODULE_NAME, LOG_LEVELS.STATE, 'Microsoft sign-in initiated');
            const provider = new OAuthProvider('microsoft.com');
            provider.setCustomParameters({prompt: 'select_account', tenant: 'common'});
            const userCredential = await signInWithPopup(firebaseAuth, provider);
            // const firebaseUser = userCredential.user; Explicitly trigger token exchange
            // immediately after successful popup because onAuthStateChanged might not fire
            // reliably or quickly enough for popups? This bypasses waiting for
            // onAuthStateChanged.  const firebaseToken = await firebaseUser.getIdToken();
            // const userData = await this._exchangeToken(firebaseToken, firebaseUser);
            // Includes setting this._currentUser *** Emit AUTH_SESSION_VALID after explicit
            // backend exchange ***  this._emitEvent(AUTH_EVENTS.USER_SIGNED_IN, {
            // userId: userData.uid,          email: userData.email,          user:
            // userData,  Full user data from backend          isAuthenticated: true,
            // authSource: 'microsoft',          timestamp: Date.now()  });
            // this._emitEvent(AUTH_EVENTS.AUTH_SESSION_VALID, {     userId: userData.uid,
            // email: userData.email,     user: userData,     isAuthenticated: true,
            // authSource: 'microsoft',     timestamp: Date.now() });

            return this._mapFirebaseUser(userCredential.user);
        } catch (error) { // Catches errors from signInWithPopup OR _exchangeToken

            this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Microsoft sign-in failed', {
                error: error.message,
                code: error.code
            });
            this._emitEvent(AUTH_EVENTS.AUTH_ERROR, { // Emit standard error event

                error: error.message,
                code: error.code,
                context: 'signInWithMicrosoft'

            });
            throw error;
        }
    }

    async logoutAndClearSession() {

        this._log(
            MODULE_NAME,
            LOG_LEVELS.STATE,
            'Logout process initiated: Clear session'
        );
        const wasLoggedIn = !!this._currentUser; // Check *before* clearing
        const previousUserId = this._currentUser
            ?.uid;

        // Clear local state immediately
        this._currentUser = null;
        this._clearAuthCookies(); // Clear cookies/storage

        // Attempt backend logout (best effort)
        if (firebaseAuth.currentUser) { // Check if Firebase still has user before trying backend logout
            try {
                await Promise.race([
                    this
                        .apiService
                        .post('/api/auth/logout'),
                    new Promise(
                        (_, reject) => setTimeout(() => reject(new Error('Logout request timeout')), 3000)
                    )
                ]);
                this._log(
                    MODULE_NAME,
                    LOG_LEVELS.STATE,
                    'Backend logout successful during clear session'
                );
            } catch (backendError) {
                this._log(
                    MODULE_NAME,
                    LOG_LEVELS.WARNING,
                    'Backend logout failed during clear session, proceeding',
                    {error: backendError.message}
                );
            }
        }

        // Trigger Firebase sign out - this will cause _onAuthStateChanged to fire with
        // null
        try {
            await signOut(firebaseAuth);
            this._log(
                MODULE_NAME,
                LOG_LEVELS.STATE,
                'Firebase signOut called successfully.'
            );
            // *** NO event emission here *** Rely on _onAuthStateChanged(null) to emit
            // USER_SIGNED_OUT
        } catch (firebaseError) {
            this._log(
                MODULE_NAME,
                LOG_LEVELS.ERROR,
                'Firebase signOut failed',
                {error: firebaseError.message}
            );
            // Even if Firebase signOut fails, local state is cleared. Should we emit
            // USER_SIGNED_OUT manually here as a fallback? Let's try relying on
            // onAuthStateChanged first. If it doesn't fire, this is a problem. As a
            // fallback, maybe emit here IF we were previously logged in:
            if (wasLoggedIn) {
                this._log(
                    MODULE_NAME,
                    LOG_LEVELS.WARNING,
                    'Firebase signOut failed, emitting USER_SIGNED_OUT manually as fallback.'
                );
                this._emitEvent(AUTH_EVENTS.USER_SIGNED_OUT, {
                    previousUserId,
                    isAuthenticated: false,
                    timestamp: Date.now()
                });
            }

            throw firebaseError; // Rethrow the Firebase error
        }

        return true;
    }

    async logout() {

        try {
            this._log(
                MODULE_NAME,
                LOG_LEVELS.STATE,
                'Simple logout initiated (calling signOut)'
            );
            await signOut(firebaseAuth); // Trigger Firebase sign out
            // *** NO event emission here *** rely on _onAuthStateChanged

            return true;
        } catch (error) {

            this._log(
                MODULE_NAME,
                LOG_LEVELS.ERROR,
                'Simple logout (signOut) failed',
                {error: error.message}
            );
            this._emitEvent(AUTH_EVENTS.AUTH_ERROR, { // Emit standard error event

                error: 'Firebase sign out failed: ' + error.message,
                code: error.code,
                context: 'logout'

            });
            throw error;
        }
    }

    async checkSession() {
        // Start loading at the beginning
        try {
            this._log(MODULE_NAME, LOG_LEVELS.STATE, 'Checking session status...');

            // --- 1. Check for explicit logout flags (URL, localStorage) ---
            const urlParams = new URLSearchParams(window.location.search);
            const isLoginPage = window.location.pathname === '/login';
            const hasLogoutParam = urlParams.get('logout') === 'true';
            const hasSessionExpiredParam = urlParams.get('reason') === 'session_expired';
            const explicitLogoutStorage = localStorage.getItem('explicit_logout') === 'true';

            if (isLoginPage && (hasLogoutParam || hasSessionExpiredParam || explicitLogoutStorage)) {
                this._log(
                    MODULE_NAME,
                    LOG_LEVELS.STATE,
                    'Skipping session check on login page due to logout/expiry flags.'
                );
                if (explicitLogoutStorage) 
                    localStorage.removeItem('explicit_logout'); // Clear flag
                this._currentUser = null; // Ensure local state is clear

                return null; // Definitely no session
            }

            // --- 2. Reliably get current Firebase user ---
            const firebaseUser = await new Promise((resolve) => {
                const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
                    unsubscribe();
                    resolve(user);
                });
            });

            if (!firebaseUser) {
                this._log(
                    MODULE_NAME,
                    LOG_LEVELS.STATE,
                    'checkSession: No Firebase user found.'
                );
                if (this._currentUser) { // If we previously thought someone was logged in
                    this._log(
                        MODULE_NAME,
                        LOG_LEVELS.WARNING,
                        'checkSession: Firebase reports no user, but local state had one. Clearing stat' +
                                'e.'
                    );
                    // Emit USER_SIGNED_OUT if consistency needed, but onAuthStateChanged should
                    // handle this primary flow.
                }
                this._currentUser = null;

                return null; // No session
            }

            // --- 3. Firebase user exists, attempt backend validation ---
            this._log(
                MODULE_NAME,
                LOG_LEVELS.STATE,
                'checkSession: Firebase user exists, validating with backend.',
                {uid: firebaseUser.uid}
            );
            try {
                // Use _exchangeToken for consistency as it handles API call, mapping, and
                // setting _currentUser Don't force refresh initially (getIdToken(false))
                const idToken = await firebaseUser.getIdToken(false);
                // Use a timeout for the backend call
                const userData = await Promise.race([
                    this._exchangeToken(idToken, firebaseUser), // Attempts backend validation and sets _currentUser
                    new Promise(
                        (_, reject) => setTimeout(() => reject(new Error('Session check timeout')), 5000)
                    ) // 5s timeout
                ]);

                // If _exchangeToken succeeded:
                this._log(
                    MODULE_NAME,
                    LOG_LEVELS.STATE,
                    'checkSession: Backend validation successful (via _exchangeToken).'
                );
                // *** Emit AUTH_SESSION_VALID ***
                // this._emitEvent(AUTH_EVENTS.AUTH_SESSION_VALID, {         userId:
                // userData.uid,         email: userData.email,         user: userData,  Full
                // data including backend info          isAuthenticated: true,
                // timestamp: Date.now() });

                return userData; // Valid session

            } catch (error) {
                // Handle errors from _exchangeToken or the timeout
                if (
                    error.message
                        ?.includes('Failed to authenticate with backend') && error.message
                            ?.includes('401')
                ) {
                    // Explicit 401 from backend during token exchange
                    this._log(
                        MODULE_NAME,
                        LOG_LEVELS.WARNING,
                        'checkSession: Backend token exchange returned 401, attempting refresh.'
                    );
                    // _refreshAndVerify will attempt refresh, emit AUTH_SESSION_VALID on success,
                    // or emit AUTH_ERROR and trigger logout on failure. Stop loading handled inside
                    // or by caller.
                    return await this._refreshAndVerify(firebaseUser); // Let _refreshAndVerify handle outcome

                } else if (error.message === 'Session check timeout' || error.code === 'ECONNABORTED' || !navigator.onLine) {
                    // Backend unreachable
                    this._log(
                        MODULE_NAME,
                        LOG_LEVELS.WARNING,
                        'checkSession: Backend unreachable, using Firebase auth in offline mode.',
                        {error: error.message}
                    );
                    const offlineUserData = this._mapFirebaseUser(firebaseUser); // Use only Firebase data
                    if (!offlineUserData) 
                        throw new Error("Failed to map Firebase user in offline mode."); // Guard against mapping errors
                    
                    this._currentUser = offlineUserData; // Set local user (offline)
                    // *** Emit AUTH_SESSION_VALID (offline) ***
                    // this._emitEvent(AUTH_EVENTS.AUTH_SESSION_VALID, {         userId:
                    // offlineUserData.uid,         email: offlineUserData.email,         user: {
                    // ...offlineUserData, offlineMode: true },  Add offline flag
                    // isAuthenticated: true,         offlineMode: true,         timestamp:
                    // Date.now() });

                    return offlineUserData; // Return offline user data

                } else {
                    // Other errors during backend validation (_exchangeToken failed for other
                    // reasons)
                    this._log(
                        MODULE_NAME,
                        LOG_LEVELS.ERROR,
                        'checkSession: Backend validation failed',
                        {error: error.message}
                    );
                    this._emitEvent(AUTH_EVENTS.AUTH_ERROR, {

                        error: 'Session validation failed: ' + error.message,
                        code: 'session-check-backend-failed'

                    });
                    // Invalidate local state and return null (implies no valid session)
                    this._currentUser = null;

                    return null;
                }
            }
        } catch (criticalError) {
            // Catch errors from getting Firebase user or other unexpected issues
            this._log(
                MODULE_NAME,
                LOG_LEVELS.ERROR,
                'checkSession: Critical error during process',
                {
                    error: criticalError.message,
                    stack: criticalError.stack
                }
            );
            this._emitEvent(AUTH_EVENTS.AUTH_ERROR, {

                error: 'Critical session check error: ' + criticalError.message,
                code: 'session-check-critical'

            });
            this._currentUser = null;
            // Ensure loading stops
            return null; // Indicate failure
        }
        // Note: _stopLoading() should be called on all return paths or handled by a
        // finally block if preferred. Added to each path here.
    }

    _setupAuthStateListener() {
        // Remover listener anterior se existir
        if (this._authUnsubscribe) {
            this._authUnsubscribe();
        }

        // Configurar o novo listener
        this._authUnsubscribe = onAuthStateChanged(
            firebaseAuth,
            this._onAuthStateChanged.bind(this)
        );

        this._log(
            MODULE_NAME,
            LOG_LEVELS.INFO,
            'Firebase auth state listener configurado'
        );
    }

    async _ensureConsistentState() {
        const storeService = serviceLocator.get('store');
        const storeState = storeService
            .getState()
            .auth;

        if (this._currentUser && (!storeState.currentUser || storeState.currentUser.uid !== this._currentUser.uid)) {
            console.warn(
                'Detectada inconsistência entre AuthService e Redux Store. Sincronizando...'
            );
            storeService.dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: {
                    currentUser: this._currentUser,
                    isAuthenticated: true
                }
            });
        }
    }

    async _onAuthStateChanged(firebaseUser) {

        console.group('🔄 AuthStateChanged');
        console.log('Firebase user:', firebaseUser);
        if (firebaseUser) {
            // User is signed in (or token refreshed) according to Firebase
            try {
                this._log(
                    MODULE_NAME,
                    LOG_LEVELS.STATE,
                    'Firebase user detected, attempting token exchange',
                    {uid: firebaseUser.uid}
                );
                const firebaseToken = await firebaseUser.getIdToken(true); // Force refresh might be needed
                const userData = await this._exchangeToken(firebaseToken, firebaseUser); // Validates with backend

                this._log(
                    MODULE_NAME,
                    LOG_LEVELS.STATE,
                    'Auth session validated with backend',
                    {uid: userData.uid}
                );

                // Garantir um formato consistente de dados no evento
                this._emitEvent(AUTH_EVENTS.AUTH_SESSION_VALID, {
                    userId: userData.uid,
                    email: userData.email,
                    user: userData, // Objeto completo do usuário
                    isAuthenticated: true,
                    timestamp: Date.now()
                });

            } catch (error) {
                // Token exchange failed
                this._log(
                    MODULE_NAME,
                    LOG_LEVELS.ERROR,
                    'Token exchange failed',
                    {error: error.message}
                );
                this._emitEvent(AUTH_EVENTS.AUTH_ERROR, { // Emit standard error event
                    error: 'Failed to validate session with backend: ' + error.message,
                    code: error.code || 'token-exchange-failed'
                });
                // Consider attempting logout if token exchange fails consistently? await
                // this.logoutAndClearSession();  Optionally force logout on severe error
            } finally {}
        } else {
            // User is signed out according to Firebase
            if (this._currentUser) { // Only emit if we previously thought a user was logged in
                const previousUserId = this._currentUser.uid;
                this._log(
                    MODULE_NAME,
                    LOG_LEVELS.STATE,
                    'Firebase user logged out',
                    {previousUserId}
                );
                this._currentUser = null; // Clear local user state

                // Try backend logout, but don't let failure block the event emission
                try {
                    await this
                        .apiService
                        .post('/api/auth/logout');
                } catch (error) {
                    this._log(
                        MODULE_NAME,
                        LOG_LEVELS.WARNING,
                        'Backend logout call failed during Firebase sign out',
                        {error: error.message}
                    );
                }

                // *** Emit USER_SIGNED_OUT event ***
                this._emitEvent(AUTH_EVENTS.USER_SIGNED_OUT, {

                    previousUserId: previousUserId,
                    isAuthenticated: false,
                    timestamp: Date.now()

                });
            } else {
                this._log(
                    MODULE_NAME,
                    LOG_LEVELS.STATE,
                    'Firebase reports no user, and no local user was set.'
                );
            }
            // Ensure loading stops
        }
    }

    async _exchangeToken(firebaseToken, firebaseUser) {
        try {
            this._log(
                MODULE_NAME,
                LOG_LEVELS.STATE,
                'Enviando token do Firebase para troca',
                {uid: firebaseUser.uid}
            );

            // Log para diagnóstico
            console.log('Token enviado:', firebaseToken.substring(0, 10) + '...');

            const response = await this
                .apiService
                .post('/api/auth/token', {
                    firebaseToken: firebaseToken
                }, {
                    withCredentials: true // Garantir que os cookies sejam aceitos
                });

            // Verificar resposta completa para diagnóstico
            console.log('Resposta do backend:', response.data);

            if (response.data.isAuthenticated) {
                // Armazenar tokens usando o AuthTokenService
                const authTokenService = serviceLocator.get('authToken');
                if (authTokenService && authTokenService.isInitialized && response.data.tokens) {
                    authTokenService.setTokens(
                        response.data.tokens.accessToken,
                        response.data.tokens.refreshToken,
                        response.data.tokens.expiresIn || 3600
                    );
                    this._log(
                        MODULE_NAME,
                        LOG_LEVELS.INFO,
                        'Tokens armazenados via AuthTokenService'
                    );
                }

                // Mapear e armazenar usuário
                const user = this._mapFirebaseUser(response.data.user);
                this._currentUser = user;
                console.log('Resposta do backend _mapFirebaseUser:', response)
                // Emitir evento de autenticação bem-sucedida aqui
                this._emitEvent(AUTH_EVENTS.AUTH_SESSION_VALID, {
                    userId: user.uid,
                    email: user.email,
                    user: user,
                    isAuthenticated: true,
                    timestamp: Date.now()
                });

                return user;
            } else {
                throw new Error('Backend não autenticou: ' + response.data.message);
            }
        } catch (error) {
            console.error('Erro na troca de token:', error);

            // Emitir evento de erro de autenticação
            this._emitEvent(AUTH_EVENTS.AUTH_ERROR, {

                error: error.message,
                code: error.code || 'exchange_token_error',
                context: 'exchangeToken'

            });

            throw error;
        }
    }

    async _refreshAndVerify(firebaseUser) {
        try {
            this._log(
                MODULE_NAME,
                LOG_LEVELS.STATE,
                'Attempting token refresh for verification',
                {uid: firebaseUser.uid}
            );
            const idToken = await firebaseUser.getIdToken(true); // Force refresh
            const userData = await this._exchangeToken(idToken, firebaseUser); // Will set _currentUser

            // *** Emit AUTH_SESSION_VALID ***
            // this._emitEvent(AUTH_EVENTS.AUTH_SESSION_VALID, { userId: userData.uid,
            // email: userData.email, user: userData, isAuthenticated: true, timestamp:
            // Date.now() });
            this._log(
                MODULE_NAME,
                LOG_LEVELS.STATE,
                'Token refresh successful',
                {uid: userData.uid}
            );
            // Don't stop loading here, let the caller (_onAuthStateChanged or checkSession)
            // handle it.
            return userData;
        } catch (tokenError) {
            this._log(
                MODULE_NAME,
                LOG_LEVELS.ERROR,
                'Failed to refresh token and verify session',
                {error: tokenError.message}
            );
            // Emit error AND force logout
            this._emitEvent(AUTH_EVENTS.AUTH_ERROR, {
                error: 'Session refresh failed: ' + tokenError.message,
                code: 'refresh-failed'
            });
            await this.logoutAndClearSession(); // Force clear inconsistent state
            // Don't stop loading here, let the caller handle it.
            return null; // Indicate failure
        }
    }

    _clearAuthCookies() {
        try {

            // 1. Limpar cookies relacionados à autenticação
            const domains = [
                'localhost', '.localhost', window.location.hostname, '.' + window.location.hostname
            ];
            const paths = ['/', '/api', '/auth', ''];
            const cookiesToClear = [
                'authorization',
                'refreshToken',
                'accessToken',
                'idToken',
                'auth',
                'session'
            ];

            // Limpar todas as combinações possíveis de cookies, caminhos e domínios
            domains.forEach(domain => {
                paths.forEach(path => {
                    cookiesToClear.forEach(cookieName => {
                        document.cookie = `${cookieName}=; Max-Age=0; path=${path}; domain=${domain}; secure`;
                    });
                });
            });

            // 2. Limpar todas as chaves de autenticação no localStorage
            const localStorageKeysToRemove = [
                'authUser',
                'auth_access_token',
                'auth_refresh_token',
                'auth_token_expiry',
                'backend_access_token',
                'firebase:authUser',
                'firebase:token'
            ];

            localStorageKeysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });

            // 3. Limpar sessionStorage também
            const sessionStorageKeysToRemove = ['authUser', 'auth_session', 'firebase:authUser', 'firebase:token'];

            sessionStorageKeysToRemove.forEach(key => {
                sessionStorage.removeItem(key);
            });

            // 4. Flag para indicar logout explícito - ajuda a evitar redirecionamentos
            // automáticos
            localStorage.setItem('explicit_logout', 'true');

            this._log(MODULE_NAME, LOG_LEVELS.STATE, 'Auth cookies and storage cleared');

            return true;
        } catch (error) {

            this._log(
                MODULE_NAME,
                LOG_LEVELS.ERROR,
                'Error clearing auth cookies',
                {error: error.message}
            );
            return false;
        }
    }

    _mapFirebaseUser(response) {
        const sourceUser = response
            ?.data
                ?.user || response;
        const userId = response
            ?.data
                ?.userId || response.userId || sourceUser.uid || sourceUser.id;

        console.log('Resposta do backend 2:', sourceUser);

        if (!sourceUser) {
            this._log(
                MODULE_NAME,
                LOG_LEVELS.WARNING,
                'Attempted to map invalid user object',
                {response}
            );
            return null;
        }

        // Processar roles do usuário
        const userRoles = sourceUser.roles || {};
        const rolesArray = Object.keys(userRoles);
        const permissions = [];
        
        // Extrair permissões das roles
        Object.values(userRoles).forEach(roleData => {
            if (roleData.permissions) {
                permissions.push(...roleData.permissions);
            }
        });

        console.log('🔐 [AuthService] Processando roles do usuário:', {
            userRoles,
            rolesArray,
            permissions,
            isAdmin: rolesArray.includes('admin') || sourceUser.isOwnerOrAdmin
        });

        // Apenas mapeia e retorna o usuário
        return {
            uid: userId,
            email: sourceUser.email,
            name: sourceUser.nome || sourceUser.displayName,
            fotoDoPerfil: sourceUser.fotoDoPerfil || sourceUser.photoURL,
            // emailVerified: sourceUser.emailVerified,
            descricao: sourceUser.descricao,
            tipoDeConta: sourceUser.tipoDeConta || 'Cliente',
            amigos: sourceUser.amigos || [],
            amigosAutorizados: sourceUser.amigosAutorizados || [],
            conversasComMensagensNaoLidas: sourceUser.conversasComMensagensNaoLidas || [],
            interesses: sourceUser.interesses || {},
            saldoElosCoins: sourceUser.saldoElosCoins || 0,
            isOwnerOrAdmin: sourceUser.isOwnerOrAdmin || false,
            perfilPublico: sourceUser.perfilPublico || false,
            // Incluir dados de roles e permissões
            roles: rolesArray,
            rolesData: userRoles,
            permissions: permissions,
            isAdmin: rolesArray.includes('admin') || sourceUser.isOwnerOrAdmin,
            role: rolesArray.includes('admin') ? 'admin' : (rolesArray.includes('support') ? 'support' : 'cliente'),
            ...(
                response
                    ?.data
                        ?.user || {}
            )
        };
    }

    getCurrentUser() {
        return this._currentUser;
    }
    getAuth() {
        return firebaseAuth;
    }
    // dispose() is handled by BaseService calling shutdown()
}

export {
    AuthService
};