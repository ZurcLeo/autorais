// src/services/auth/AuthService.js
import { BaseService } from '../../core/services/BaseService';
import { auth } from '../../firebaseConfig';
import { tokenManager } from '../../tokenManager';
import { api } from '../apiService';
import { globalCache } from '../../utils/cache/cacheManager';
import { coreLogger } from '../../core/logging';

const AUTH_CACHE_KEYS = {
    USER_PROFILE: 'auth:userProfile',
    SESSION: 'auth:session'
};

class AuthService extends BaseService {
    constructor() {
        super('auth');
        console.log('[AuthService] Constructing with Firebase auth:', !!auth);
    }

    // Implementação obrigatória - Inicialização
    async initialize() {
        try {
            console.log('[AuthService] Starting initialization...');
            const currentUser = await this._getCurrentUser();
            console.log('[AuthService] Current user status:', !!currentUser);
            
            if (currentUser) {
                await this._refreshSession();
                this._currentUser = currentUser;
            }
            
            console.log('[AuthService] Initialization complete');
            return true;
        } catch (error) {
            console.error('[AuthService] Initialization failed:', error);
            throw error;
        }
    }

    // Implementação obrigatória - Health Check
    async healthCheck() {
        const response = await api.get('/api/auth/health');
        if (response.status !== 200) {
            throw new Error('Auth health check failed');
        }
        return { status: 'healthy' };
    }

    // Implementação obrigatória - Shutdown
    async shutdown() {
        this._clearCache();
        this._currentUser = null;
    }

    // API Pública do Serviço
    async login(credentials) {
        return this._executeWithRetry(async () => {
            const response = await api.post('/api/auth/login', credentials);
            tokenManager.setAccessToken(response.data.token); 
            this._cacheUserData(response.data);
            this._currentUser = response.data;
            return response.data;
        }, 'login');
    }

    async loginWithProvider(provider) {
        console.log('[AuthService] Starting loginWithProvider with provider:', provider);
        return this._executeWithRetry(async () => {
            try {
                console.log('[AuthService] Attempting signInWithPopup');
                const userCredential = await auth.signInWithPopup(provider);
                console.log('[AuthService] SignInWithPopup successful:', userCredential);
                
                const firebaseToken = await userCredential.user.getIdToken();
                console.log('[AuthService] Got Firebase token');
                
                console.log('[AuthService] Making API call');
                const response = await api.post('/api/auth/provider-login', {
                    providerId: provider.providerId,
                    firebaseToken
                });
                console.log('[AuthService] API call successful:', response);
    
                this._cacheUserData(response.data);
                this._currentUser = response.data;
                return response.data;
            } catch (error) {
                console.error('[AuthService] Error in loginWithProvider:', {
                    errorMessage: error.message,
                    errorCode: error.code,
                    errorStack: error.stack
                });
                throw error;
            }
        }, 'loginWithProvider');
    }

    async logout() {
        return this._executeWithRetry(async () => {
            await api.post('/api/auth/logout');
            await auth.signOut();
            this._clearCache();
            this._currentUser = null;
        }, 'logout');
    }

    async getSession() {
        if (!this._currentUser) {
            throw new Error('No active session');
        }
        return this._currentUser;
    }

    // Métodos Privados
    async _getCurrentUser() {
        try {
            const firebaseUser = auth.currentUser;
            if (!firebaseUser) {
                return null;
            }

            const firebaseToken = await firebaseUser.getIdToken(true);
            if (!firebaseToken) {
                throw new Error('Could not get Firebase token');
            }

            const tokenExchanged = await tokenManager.getFirebaseToken();
            if (!tokenExchanged) {
                throw new Error('Failed to exchange Firebase token');
            }

            const response = await api.get('/api/auth/me');
            return response.data;
        } catch (error) {
            this._logError(error, 'getCurrentUser');
            return null;
        }
    }

    async _refreshSession() {
        return this._executeWithRetry(async () => {
            const response = await api.post('/api/auth/refresh-token');
            this._cacheUserData(response.data);
            this._currentUser = response.data;
            return true;
        }, 'refreshSession');
    }

    _cacheUserData(userData) {
        if (!userData) return;

        globalCache.setItem(AUTH_CACHE_KEYS.USER_PROFILE, userData, {
            cacheTime: 5 * 60 * 1000, // 5 minutos
            staleTime: 1 * 60 * 1000  // 1 minuto
        });
    }

    _clearCache() {
        Object.values(AUTH_CACHE_KEYS).forEach(key => {
            globalCache.invalidate(key);
        });
    }
}

export const authService = new AuthService();