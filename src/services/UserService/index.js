// src/services/user/UserService.js
import {BaseService, serviceLocator} from '../../core/services/BaseService';
import {USER_EVENTS, AUTH_EVENTS} from '../../core/constants/events.js';
import {LOG_LEVELS, USER_CACHE_KEYS} from '../../core/constants/config.js';
import {globalCache} from '../../utils/cache/cacheManager';
import { SERVICE_ACTIONS } from '../../core/constants/actions.js';

const MODULE_NAME = 'users';

/**
 * Serviço responsável pelo gerenciamento de usuários
 * Implementa operações CRUD e notifica mudanças via EventHub
 */
class UserService extends BaseService {
  constructor() {
    super(MODULE_NAME);
    this.instanceId = Math.random().toString(36).substring(2, 10);

    this._currentProfile = null;
    this._isInitialized = false;

    this._metadata = {
        name: MODULE_NAME,
        phase: 'ESSENTIAL',              // Fase de inicialização (CORE, ESSENTIAL, etc.)
        criticalPath: true,         // Indica se é um serviço crítico para a aplicação
        dependencies: ['auth'], // Serviços que devem estar prontos antes deste
        category: 'essentials',       // Categoria do serviço
        description: 'Gerencia Servico de Usuarios.' // Descrição
      };

    this._log(`📊 Nova instância de UserService criada, instanceId: ${this.instanceId}`);
    this.apiService = serviceLocator.get('apiService');
    this.authService = serviceLocator.get('auth');

  }

  getCurrentUser() {
    return this._currentUser = this.authService.getCurrentUser();
}

  /**
   * Inicializa o serviço
   * @returns {Promise<boolean>} true se inicializado com sucesso
   */
  async initialize() {
    if (this.isInitialized) return this;

    this._log(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'UserService initializing...', { timestamp: Date.now() });

    try {
      // Verificar estado de saúde do serviço
      // await this.healthCheck();

      // Configurar listeners para eventos do AuthService
    //   this._setupAuthEventListeners();

      this._log(MODULE_NAME, LOG_LEVELS.INITIALIZATION, 'UserService initialized successfully', { timestamp: Date.now() });

      // Atualiza o status de inicialização
    //   this.initializationStatus.set(MODULE_NAME, {
    //     status: 'ready',
    //     timestamp: new Date().toISOString()
    //   });

      this._isInitialized = true;

    //   // Emite evento de serviço pronto
    //   this._emitEvent('initialization', SERVICE_ACTIONS.SERVICE_READY, {
    //     serviceName: MODULE_NAME,
    //     timestamp: new Date().toISOString()
    //   });

    //   // Log de sucesso com coreLogger
    //   this._log(
    //     MODULE_NAME,
    //     LOG_LEVELS.INITIALIZATION,
    //     'UserService initialized successfully'
    //   );
    this._emitEvent(SERVICE_ACTIONS.SERVICE_READY, {
        serviceName: MODULE_NAME,
        timestamp: new Date().toISOString()
      });

      return this;
    } catch (error) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'UserService initialization failed', { timestamp: Date.now(), error: error.message });

    //   // Atualiza o status de inicialização para falha
    //   this.initializationStatus.set(MODULE_NAME, {
    //     status: 'failed',
    //     error: error.message, // ou error.toString()
    //     timestamp: new Date().toISOString()
    //   });

    //   // Emite evento de serviço falhou
    //   this._emitEvent('initialization', SERVICE_ACTIONS.SERVICE_ERROR, {
    //     serviceName: MODULE_NAME,
    //     error: error.message, // ou error.toString()
    //     timestamp: new Date().toISOString()
    //   });

    //   // Log de falha com coreLogger
    //   this._log(
    //     MODULE_NAME,
    //     error,
    //     {
    //       message: 'UserService initialization failed',
    //       timestamp: new Date().toISOString()
    //     }
    //   );

      throw error;
    }
  }

//     /**
//  * Configura os listeners para eventos do AuthService
//  * @private
//  */
//     _setupAuthEventListeners() {
//         // Importar AUTH_EVENTS se ainda não foi importado import { AUTH_EVENTS } from
//         // '../../core/constants/events'; Quando o AuthService indicar que o perfil
//         // precisa ser atualizado
//         this._onServiceEvent('auth', AUTH_EVENTS.PROFILE_UPDATE_NEEDED, (data) => {
//             this._markProfileUpdateNeeded(data.userId, data.reason);
//         });

//         // Quando o usuário for autenticado, carregar perfil
//         this._onServiceEvent('auth', AUTH_EVENTS.AUTH_SESSION_VALID, (data) => {
//             if (data.user) {
//                 this._loadUserProfile(data.user.uid);
//             }
//         });

//         // Adicionar outros listeners conforme necessário
//         this._onServiceEvent('auth', AUTH_EVENTS.FIRST_ACCESS_DETECTED, (data) => {
//             this._emitEvent(USER_EVENTS.PROFILE_UPDATE_NEEDED, {
//                 userId: data.user.uid,
//                 reason: 'first_access',
//                 timestamp: Date.now()
//             });
//         });

//         this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Auth event listeners configured');
//     }

    /**
 * Marca perfil para atualização
 * @param {string} userId ID do usuário
 * @param {string} reason Motivo para atualização
 * @private
 */
    _markProfileUpdateNeeded(userId, reason) {
        if (!userId) 
            return;
        
        this._log(
            MODULE_NAME,
            LOG_LEVELS.INFO,
            'Profile update needed',
            {userId, reason}
        );

        // Armazenar estado interno (opcional)
        this._profileUpdateNeeded = {
            userId,
            reason
        };

        // Emitir evento para notificar o sistema
        this._emitEvent(
            USER_EVENTS.PROFILE_UPDATE_NEEDED,
            {userId, reason, timestamp: Date.now()}
        );
    }

    /**
 * Carrega perfil do usuário
 * @param {string} userId ID do usuário
 * @private
 */
    async _loadUserProfile(userId) {
        if (!userId) 
            return;
        
        this._log(MODULE_NAME, LOG_LEVELS.INFO, 'Loading user profile', {userId});

        try {
            const profile = await this._fetchUserProfile(userId);

            // Emitir evento com perfil carregado
            this._emitEvent(
                USER_EVENTS.PROFILE_FETCHED,
                {userId, profile, timestamp: Date.now()}
            );

            // Verificar se perfil está completo
            if (!profile.isProfileComplete) {
                this._markProfileUpdateNeeded(userId, 'incomplete_profile');
            }

            return profile;
        } catch (error) {
            this._logError(error, '_loadUserProfile');

            // Emitir evento de erro
            this._emitEvent(USER_EVENTS.USER_ERROR, {
                userId,
                error: error.message,
                timestamp: Date.now()
            });

            return null;
        }
    }
    /**
   * Verifica a saúde do serviço
   * @returns {Promise<Object>} Estado de saúde do serviço
   */
    async healthCheck() {
        try {
            // this._startLoading() Tentar verificar a saúde via API
            const healthResponse = await this._executeWithRetry(async () => {
                return await this.apiService.get(`/api/health/service/${this.serviceName}`);
            }, 'healthCheck');

            console.log('checando resposta', healthResponse.data.status)

            return {status: healthResponse.data.status, timestamp: Date.now()};
        } catch (error) {

            // Implementar fallback se o endpoint de saúde estiver indisponível
            this._log(
                'warning',
                'Health check endpoint unavailable, proceeding with degraded mode'
            );

            // Ainda retornar healthy para não bloquear outras funcionalidades
            return {status: 'degraded', details: 'Operating in offline mode', timestamp: Date.now()};
        }
    }

    /**
   * Desliga o serviço e libera recursos
   * @returns {Promise<boolean>} true se desligado com sucesso
   */
    async shutdown() {
        this._log('shutting down', {timestamp: Date.now()});
        this._clearCache();
        this._currentProfile = null;
        this._isInitialized = false;
        return true;
    }

    // === API Pública ===

    /**
   * Obtém o perfil de um usuário pelo ID
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Dados do perfil do usuário
   */
    async getUserProfile(userId) {
        console.log('[UserService] getUserProfile INICIADO com userId:', userId);

        //
        return this._executeWithRetry(async () => {
            console.log(
                '[UserService] Fazendo requisição API para:',
                `/api/users/${userId}`
            );
            // const startTime = performance.now();

            try {
                const response = await this.apiService.get(`/api/users/${userId}`);
                const profileData = response.data;
                console.log(
                    '[UserService] getUserProfile successful, returning data:',
                    response
                );

                // Log para verificar _isProfileComplete
                const isComplete = this._isProfileComplete(profileData);
                console.log('[UserService] Perfil completo?', isComplete);

                // Emitir evento de perfil obtido (básico)
                this._emitEvent(USER_EVENTS.PROFILE_FETCHED, {
                    userId,
                    user: profileData,
                    fromCache: false
                });

                // Verificar se o perfil está completo e emitir o evento adequado
                if (isComplete) {
                    // console.log('[UserService] Emitindo USER_SIGN_IN e USER_SESSION_READY');
                    // this._emitEvent(USER_EVENTS.USER_SIGN_IN, {
                    //     userId,
                    //     user: profileData,
                    //     timestamp: Date.now()
                    // });

                    // Sinalizar que a sessão está pronta
                    this._emitEvent(USER_EVENTS.USER_SESSION_READY, {
                        userId,
                        user: profileData,
                        timestamp: Date.now()
                    });

                } else {
                    console.log('[UserService] Emitindo NEW_USER_SIGN_IN');
                    this._emitEvent(USER_EVENTS.NEW_USER_SIGN_IN, {
                        userId,
                        user: profileData,
                        isNewUser: !profileData.hasOwnProperty('dataCriacao'),
                        needsProfileCompletion: true,
                        timestamp: Date.now()
                    });
                }

                //
                return profileData;
            } catch (error) {
                console.log('[UserService] getUserProfile failed, error:', error);
                //
                this._logError(error, 'getUserProfile');

                // Em ambiente de desenvolvimento, use um perfil mock
                if (process.env.NODE_ENV !== 'production') {
                    console.log('[UserService] Returning mock profile data for development');
                    const mockProfileData = {
                        id: userId,
                        uid: userId,
                        nome: 'Usuário Teste',
                        email: 'teste@exemplo.com',
                        isOwnerOrAdmin: true
                    };

                    // Emitir evento de perfil mesmo em modo de desenvolvimento
                    this._emitEvent(USER_EVENTS.PROFILE_FETCHED, {
                        userId,
                        payload: mockProfileData,
                        fromCache: false,
                        isMock: true
                    });

                    // Sinalizar que a sessão está pronta (modo desenvolvimento)
                    this._emitEvent(USER_EVENTS.USER_SESSION_READY, {
                        userId,
                        user: mockProfileData,
                        isMock: true,
                        timestamp: Date.now()
                    });

                    return mockProfileData;
                }
                throw error;
            }
        }, 'getUserProfile');
    }

    // Adicionar este método à classe UserService
    _isProfileComplete(profile) {
        // Verificação básica de que temos um perfil válido
        if (!profile || typeof profile !== 'object') {
            console.log('[UserService] Perfil inválido:', profile);
            return false;
        }

        // Se tivermos nome e email, consideramos o perfil completo o suficiente
        const hasName = !!profile.nome;
        const hasEmail = !!profile.email;

        console.log('[UserService] Verificação do perfil:', {hasName, hasEmail});

        return hasName && hasEmail;
    }

    /**
   * Atualiza o perfil de um usuário
   * @param {string} userId - ID do usuário
   * @param {Object} data - Dados a serem atualizados
   * @returns {Promise<Object>} Perfil atualizado
   */
    async updateUserProfile(userId, data) {
        // this._startLoading()
        return this._executeWithRetry(async () => {
            const startTime = performance.now();

            try {
                // this._startLoading()
                this._log('updating user profile', {userId, updatedFields: Object.keys(data)});
                const updateData = data
                const response = await this.apiService.put(
                    `/api/users/update-user/${userId}`,
                    updateData
                );
                const updatedProfile = response.data;

                // Invalidar cache
                this._invalidateUserCache(userId);

                // Atualizar referência local se for o usuário atual
                if (
                    userId === this._currentProfile
                        ?.id
                ) {
                    this._currentProfile = updatedProfile;
                }

                const duration = performance.now() - startTime;
                this._logPerformance(
                    'updateUserProfile',
                    duration,
                    {userId, updatedFields: Object.keys(data)}
                );

                // Emitir evento de perfil atualizado
                this._emitEvent(USER_EVENTS.PROFILE_UPDATED, {
                    userId,
                    updatedFields: Object.keys(data),
                    payload: updatedProfile
                });

                const profileData = this.getCurrentProfile(userId)

                if (profileData.isProfileComplete) {
                    this._emitEvent(USER_EVENTS.PROFILE_COMPLETED, {
                        userId: this._currentUser.uid,
                        timestamp: Date.now()
                    });
                }
                return updatedProfile;
            } catch (error) {

                // const duration = performance.now() - startTime; this._logError(error,
                // 'updateUserProfile', duration);
                throw error;
            }
        }, 'updateUserProfile');
    }

    /**
   * Obtém o perfil do usuário atual
   * @returns {Promise<Object>} Perfil do usuário atual
   */
    async getCurrentProfile() {
        // this._startLoading()
        if (this._fetchCurrentProfile) {
            this._log('returning cached current profile', {
                userId: this._currentProfile.uid || this._currentProfile.id
            });
            return this._currentProfile;
        }

        return this._executeWithRetry(async () => {
            try {
                // this._startLoading()
                const userId = this._currentProfile;
                const response = await this.apiService.get(`/api/users/${userId}`);
                const profileData = response.data;

                this._currentProfile = profileData;

                // Emitir evento de perfil obtido
                this._emitEvent(USER_EVENTS.PROFILE_FETCHED, {
                    userId: profileData.uid || profileData.id,
                    payload: profileData,
                    isCurrent: true
                });

                return profileData;
            } catch (error) {

                this._logError(error, 'getCurrentProfile');
                throw error;
            }
        }, 'getCurrentProfile');
    }


// export const uploadProfilePicture = async (userId, file) => {
//   console.debug(`Iniciando upload da foto de perfil para o usuário com ID: ${userId}...`);
//   console.time('uploadProfilePicture');
//   try {
//     const formData = new FormData();
//     formData.append('profilePicture', file);
//     const response = await apiService.apiUpload.put(`/api/users/upload-profile-picture/${userId}`, formData);
//     console.info(`Foto de perfil do usuário com ID ${userId} atualizada com sucesso.`);
//     return response.data;
//   } catch (error) {
//     console.error(`Erro ao fazer upload da foto de perfil para o usuário com ID ${userId}:`, error.message, error.stack);
//     throw new Error(`Falha ao fazer upload da foto de perfil para o usuário com ID ${userId}: ` + error.message);
//   } finally {
//     console.timeEnd('uploadProfilePicture');
//   }
// };

    /**
   * Faz upload da foto de perfil de um usuário
   * @param {string} userId - ID do usuário
   * @param {File} file - Arquivo de imagem
   * @returns {Promise<Object>} Resultado do upload
   */
    async uploadProfilePicture(userId, file) {
        // this._startLoading()
        return this._executeWithRetry(async () => {
            const startTime = performance.now();

            try {
                this._log('uploading profile picture', {
                    userId,
                    fileType: file.type,
                    fileSize: file.size
                });

                const formData = new FormData();
                formData.append('profilePicture', file);

                const response = await this.apiService.upload(
                    `/api/users/upload-profile-picture/${userId}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                // Invalidar cache
                this._invalidateUserCache(userId);

                const duration = performance.now() - startTime;
                this._logPerformance(
                    'uploadProfilePicture',
                    duration,
                    {userId, fileSize: file.size}
                );

                // Emitir evento de foto de perfil atualizada
                this._emitEvent(USER_EVENTS.PROFILE_PICTURE_UPDATED, {
                    userId,
                    pictureUrl: response.data.publicUrl || response.data.fotoDoPerfil
                });

                return response.data;
            } catch (error) {

                const duration = performance.now() - startTime;
                this._logError(error, 'uploadProfilePicture', duration);
                throw error;
            }
        }, 'uploadProfilePicture');
    }

    /**
   * Exclui um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Resultado da exclusão
   */
    async deleteUser(userId) {
        // this._startLoading()
        return this._executeWithRetry(async () => {
            const startTime = performance.now();

            try {
                this._log('deleting user', {userId});

                const response = await this.apiService.delete(`/api/users/delete-user/${userId}`);

                // Invalidar cache
                this._invalidateUserCache(userId);

                // Limpar referência local se for o usuário atual
                if (
                    userId === this._currentProfile
                        ?.id
                ) {
                    this._currentProfile = null;
                }

                const duration = performance.now() - startTime;
                this._logPerformance('deleteUser', duration, {userId});

                // Emitir evento de usuário excluído
                this._emitEvent(USER_EVENTS.USER_DELETED, {userId});

                return response.data;
            } catch (error) {

                const duration = performance.now() - startTime;
                this._logError(error, 'deleteUser', duration);
                throw error;
            }
        }, 'deleteUser');
    }

    /**
   * Adiciona um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Usuário criado
   */
    async addUser(userData) {
        // this._startLoading()
        return this._executeWithRetry(async () => {
            const startTime = performance.now();

            try {
                this._log('adding new user', {
                    email: userData.email,
                    fields: Object.keys(userData)
                });

                const response = await this.apiService.post('/api/users/add-user', userData);
                const newUser = response.data;

                const duration = performance.now() - startTime;
                this._logPerformance('addUser', duration, {
                    userId: newUser.id || newUser.uid,
                    dataSize: JSON
                        .stringify(newUser)
                        .length
                });

                // Emitir evento de usuário adicionado
                this._emitEvent(USER_EVENTS.USER_ADDED, {
                    userId: newUser.id || newUser.uid,
                    user: newUser
                });

                return newUser;
            } catch (error) {

                const duration = performance.now() - startTime;
                this._logError(error, 'addUser', duration);
                throw error;
            }
        }, 'addUser');
    }

    /**
   * Obtém a lista de usuários
   * @returns {Promise<Array>} Lista de usuários
   */
    async getUsers() {
        // this._startLoading()
        return this._executeWithRetry(async () => {
            const startTime = performance.now();

            try {
                // Verificar cache primeiro
                const cachedUsers = globalCache.getItem(USER_CACHE_KEYS.USERS_LIST);

                if (cachedUsers) {
                    this._log('users list found in cache', {
                        count: cachedUsers.length,
                        fromCache: true
                    });

                    // Mesmo para dados em cache, emitimos o evento
                    this._emitEvent(USER_EVENTS.USERS_LIST_FETCHED, {
                        users: cachedUsers,
                        count: cachedUsers.length,
                        fromCache: true
                    });

                    return cachedUsers;
                }

                const response = await this.apiService.get('/api/users');
                const users = response.data;

                // Armazenar em cache
                globalCache.setItem(USER_CACHE_KEYS.USERS_LIST, users, {
                    cacheTime: 5 * 60 * 1000, // 5 minutos
                    staleTime: 1 * 60 * 1000 // 1 minuto
                });

                const duration = performance.now() - startTime;
                this._logPerformance('getUsers', duration, {
                    count: users.length,
                    dataSize: JSON
                        .stringify(users)
                        .length
                });

                // Emitir evento de lista de usuários obtida
                this._emitEvent(USER_EVENTS.USERS_LIST_FETCHED, {
                    users,
                    count: users.length,
                    fromCache: false
                });

                return users;
            } catch (error) {

                const duration = performance.now() - startTime;
                this._logError(error, 'getUsers', duration);
                throw error;
            }
        }, 'getUsers');
    }

    // === Métodos Privados ===

    /**
   * Busca o perfil atual do usuário do backend
   * @private
   * @returns {Promise<Object>} Perfil do usuário atual
   */
    async _fetchCurrentProfile() {
        // this._startLoading()
        return this._executeWithRetry(async () => {
            try {
                const response = await this.apiService.get('/api/auth/me');
                const profileData = response.data;

                this._currentProfile = profileData;

                // Emitir evento de perfil obtido
                this._emitEvent(USER_EVENTS.PROFILE_FETCHED, {
                    userId: profileData.uid || profileData.id,
                    payload: profileData,
                    isCurrent: true
                });

                return profileData;
            } catch (error) {

                this._logError(error, '_fetchCurrentProfile');
                throw error;
            }
        }, '_fetchCurrentProfile');
    }

    /**
   * Armazena o perfil do usuário em cache
   * @private
   * @param {string} userId - ID do usuário
   * @param {Object} profile - Perfil do usuário
   */
    _cacheUserProfile(userId, profile) {

        if (!profile) 
            return;
        
        const cacheKey = `${USER_CACHE_KEYS.USER_PROFILE}:${userId}`;
        globalCache.setItem(cacheKey, profile, {
            cacheTime: 5 * 60 * 1000, // 5 minutos
            staleTime: 1 * 60 * 1000 // 1 minuto
        });

        this._log('profile cached', {userId, cacheKey});
    }

    /**
   * Limpa todo o cache do serviço
   * @private
   */
    _clearCache() {
        Object
            .values(USER_CACHE_KEYS)
            .forEach(key => {
                globalCache.invalidate(key);
            });

        this._log('cache cleared');
    }

    /**
   * Invalida o cache de um usuário específico
   * @private
   * @param {string} userId - ID do usuário
   */
    _invalidateUserCache(userId) {
        const cacheKey = `${USER_CACHE_KEYS.USER_PROFILE}:${userId}`;
        globalCache.invalidate(cacheKey);
        globalCache.invalidate(USER_CACHE_KEYS.USERS_LIST);

        this._log('cache invalidated', {userId, cacheKey});
    }
}

export {UserService};