// src/services/user/UserService.js

import { BaseService } from '../../core/services/BaseService';
import { api } from '../apiService';
import { globalCache } from '../../utils/cache/cacheManager';

const USER_CACHE_KEYS = {
    USER_PROFILE: 'user:profile',
    USERS_LIST: 'users:list'
};

class UserService extends BaseService {
    constructor() {
        super('user'); // Nome do serviço conforme metadata
        this._currentProfile = null;
    }

    // Implementação obrigatória - Inicialização
    async initialize() {
        // Obtém perfil inicial se houver sessão ativa
        const profile = await this._getCurrentProfile();
        if (profile) {
            this._currentProfile = profile;
        }
        return true;
    }

    // Implementação obrigatória - Health Check
    async healthCheck() {
        const response = await api.get('/api/users/health');
        if (response.status !== 200) {
            throw new Error('User service health check failed');
        }
        return { status: 'healthy' };
    }

    // Implementação obrigatória - Shutdown
    async shutdown() {
        this._clearCache();
        this._currentProfile = null;
    }

    // API Pública
    async getUserProfile(userId) {
        return this._executeWithRetry(async () => {
            const cacheKey = `${USER_CACHE_KEYS.USER_PROFILE}:${userId}`;
            const cachedProfile = globalCache.getItem(cacheKey);
            
            if (cachedProfile) {
                return cachedProfile;
            }

            const response = await api.get(`/api/users/${userId}`);
            this._cacheUserProfile(userId, response.data);
            
            return response.data;
        }, 'getUserProfile');
    }

    async updateProfile(userId, data) {
        return this._executeWithRetry(async () => {
            const response = await api.put(`/api/users/${userId}`, data);
            this._invalidateUserCache(userId);
            
            if (userId === this._currentProfile?.id) {
                this._currentProfile = response.data;
            }
            
            return response.data;
        }, 'updateProfile');
    }

    async getCurrentProfile() {
        if (this._currentProfile) {
            return this._currentProfile;
        }
        return this._getCurrentProfile();
    }

    // Métodos Privados
    async _getCurrentProfile() {
        try {
            const response = await api.get('/api/users/me');
            this._currentProfile = response.data;
            return response.data;
        } catch (error) {
            this._logError(error, 'getCurrentProfile');
            return null;
        }
    }

    _cacheUserProfile(userId, profile) {
        if (!profile) return;

        const cacheKey = `${USER_CACHE_KEYS.USER_PROFILE}:${userId}`;
        globalCache.setItem(cacheKey, profile, {
            cacheTime: 5 * 60 * 1000, // 5 minutos
            staleTime: 1 * 60 * 1000  // 1 minuto
        });
    }

    _clearCache() {
        Object.values(USER_CACHE_KEYS).forEach(key => {
            globalCache.invalidate(key);
        });
    }

    _invalidateUserCache(userId) {
        const cacheKey = `${USER_CACHE_KEYS.USER_PROFILE}:${userId}`;
        globalCache.invalidate(cacheKey);
        globalCache.invalidate(USER_CACHE_KEYS.USERS_LIST);
    }
}

export const userService = new UserService();