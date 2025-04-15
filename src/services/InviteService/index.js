// src/services/InviteService/index.js
import { BaseService, serviceLocator, serviceEventHub } from '../../core/services/BaseService';
import { LOG_LEVELS } from '../../core/constants/config';
import { coreLogger } from '../../core/logging';
import { INVITATION_ACTIONS, SERVICE_ACTIONS } from '../../core/constants/actions';
import { INVITATION_EVENTS } from '../../core/constants/events';

const MODULE_NAME = 'invites';

class InviteService extends BaseService {
  constructor() {
    super(MODULE_NAME);
    this.instanceId = Math.random().toString(36).substring(2, 10);

    this._currentUser = null;
    this._invitesCache = new Map();
    this._isInitialized = false;

    this._metadata = {
      name: MODULE_NAME,
      phase: 'ESSENTIAL',              // Fase de inicialização (CORE, ESSENTIAL, etc.)
      criticalPath: true,         // Indica se é um serviço crítico para a aplicação
      dependencies: ['auth', 'users'], // Serviços que devem estar prontos antes deste
      category: 'finances',       // Categoria do serviço
      description: 'Gerencia Convites.' // Descrição
    };

    this._log(`📊 Nova instância de ${MODULE_NAME} criada, instanceId: ${this.instanceId}`);

    this.apiService = serviceLocator.get('apiService');
    this.authService = serviceLocator.get('auth');

  }

  async initialize() {
    if (this.isInitialized) return this;

    this._log(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'InviteService initializing...', { timestamp: Date.now() });

    try {

      this._log(MODULE_NAME, LOG_LEVELS.INITIALIZATION, 'Inicializando serviço de convites');
      
      // Não tente obter convites durante a inicialização
      // Em vez disso, apenas configuramos o serviço e marcamos como inicializado
      
      this._isInitialized = true;
      
      this._emitEvent(SERVICE_ACTIONS.SERVICE_READY, {
        serviceName: MODULE_NAME,
        timestamp: new Date().toISOString()
      });

      return this;
    } catch (error) {
      this._logError(error, 'initialize');
      return true; // Mantendo o comportamento de retornar true em caso de erro
    }
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  async healthCheck() {
    try {
      // Tentar verificar a saúde via API
      const healthResponse = await this._executeWithRetry(
        async () => {
          return await this.apiService.get(`/api/health/service/${this.serviceName}`);
        },
        'healthCheck'
      );

      return { status: healthResponse.data.status, timestamp: Date.now() };
    } catch (error) {
      // Implementar fallback se o endpoint de saúde estiver indisponível
      this._log(
        MODULE_NAME,
        LOG_LEVELS.WARNING,
        'Health check endpoint unavailable, proceeding with degraded mode',
        { error: error.message }
      );

      // Ainda retornar healthy para não bloquear outras funcionalidades
      return {
        status: 'degraded',
        details: 'Operating in offline mode',
        timestamp: Date.now(),
        error: error.message
      };
    }
  }

  async getSentInvitations() {
    // Obter o usuário atual de forma segura
    const currentUser = this.getCurrentUser();

    // Verificar se o usuário está autenticado
    if (!currentUser) {
      this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'Tentativa de obter convites sem usuário autenticado');
      return []; // Retorna uma lista vazia em vez de lançar um erro
    }

    this._emitEvent(INVITATION_ACTIONS.FETCH_START);

    try {
      const userId = currentUser.uid;
      
      const response = await this._executeWithRetry(async () => {
        return await this.apiService.get(`/api/invite/sent/${userId}`);
      }, 'getSentInvitations');

      const invitations = response.data.invitations || [];
      console.log('verificar: ', response);
      // Armazenar em cache
      this._cacheSentInvitations(invitations);

      this._emitEvent(INVITATION_EVENTS.INVITATIONS_FETCHED, { invitations });
      return invitations;
    } catch (error) {
      this._logError(error, 'getSentInvitations');
      this._emitEvent(INVITATION_EVENTS.INVITATIONS_CLEARED, { error: error.message });
      return []; // Retornar uma lista vazia em caso de erro
    }
  }

  async getInviteById(inviteId) {
    try {
      // Verificar cache primeiro
      if (this._invitesCache.has(inviteId)) {
        const cachedInvite = this._invitesCache.get(inviteId);
        return cachedInvite;
      }
      
      const response = await this._executeWithRetry(async () => {
        return await this.apiService.get(`/api/invite/view/${inviteId}`);
      }, 'getInviteById');

      const invite = response.data;
      
      // Armazenar em cache
      this._invitesCache.set(inviteId, invite);
      
      return invite;
    } catch (error) {
      this._logError(error, 'getInviteById');
      throw error;
    }
  }

  async validateInvite(inviteId, email, nome) {
    try {
      const response = await this._executeWithRetry(async () => {
        return await this.apiService.post(`/api/invite/validate/${inviteId}`, {
          email,
          nome
        });
      }, 'validateInvite');

      const result = response.data;
      
      // Atualizar cache se o convite estiver armazenado
      if (this._invitesCache.has(inviteId)) {
        const cachedInvite = this._invitesCache.get(inviteId);
        this._invitesCache.set(inviteId, {
          ...cachedInvite,
          validated: true,
          validatedAt: new Date().toISOString()
        });
      }
      
      this._emitEvent(INVITATION_EVENTS.INVITATION_VALIDATED, { 
        inviteId, 
        email,
        result 
      });
      
      return result;
    } catch (error) {
      this._logError(error, 'validateInvite');
      throw error;
    }
  }

  async cancelInvitation(inviteId) {
    // Obter o usuário atual de forma segura
    const currentUser = this.getCurrentUser();

    // Verificar se o usuário está autenticado
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const response = await this._executeWithRetry(async () => {
        return await this.apiService.put(`/api/invite/cancel/${inviteId}`, {});
      }, 'cancelInvitation');

      const result = response.data;
      
      // Atualizar cache
      if (this._invitesCache.has(inviteId)) {
        const cachedInvite = this._invitesCache.get(inviteId);
        this._invitesCache.set(inviteId, {
          ...cachedInvite,
          status: 'canceled',
          canceledAt: new Date().toISOString()
        });
      }
      
      // Emitir evento
      this._emitEvent(INVITATION_EVENTS.INVITATION_CANCELED, { 
        inviteId,
        result 
      });
      
      return result;
    } catch (error) {
      this._logError(error, 'cancelInvitation');
      throw error;
    }
  }

  async invalidateInvite(inviteId) {
    try {
      const response = await this._executeWithRetry(async () => {
        return await this.apiService.post('/api/invite/invalidate', { inviteId });
      }, 'invalidateInvite');

      const result = response.data;
      
      // Atualizar cache
      if (this._invitesCache.has(inviteId)) {
        const cachedInvite = this._invitesCache.get(inviteId);
        this._invitesCache.set(inviteId, {
          ...cachedInvite,
          status: 'invalid',
          invalidatedAt: new Date().toISOString()
        });
      }
      
      // Emitir evento
      this._emitEvent(INVITATION_EVENTS.INVITATION_INVALIDATED, { 
        inviteId,
        result 
      });
      
      return result;
    } catch (error) {
      this._logError(error, 'invalidateInvite');
      throw error;
    }
  }

  async resendInvitation(inviteId) {
    // Obter o usuário atual de forma segura
    const currentUser = this.getCurrentUser();

    // Verificar se o usuário está autenticado
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const userId = currentUser.uid;
      
      const response = await this._executeWithRetry(async () => {
        return await this.apiService.post(`/api/invite/resend/${inviteId}`, {
          body: {
            'userId': userId
          }
        });
      }, 'resendInvitation');

      const result = response.data;
      
      // Atualizar cache
      if (this._invitesCache.has(inviteId)) {
        const cachedInvite = this._invitesCache.get(inviteId);
        this._invitesCache.set(inviteId, {
          ...cachedInvite,
          resent: true,
          resentAt: new Date().toISOString()
        });
      }
      
      // Emitir evento
      this._emitEvent(INVITATION_EVENTS.INVITATION_RESENT, { 
        inviteId,
        result 
      });
      
      return result;
    } catch (error) {
      this._logError(error, 'resendInvitation');
      throw error;
    }
  }

  async checkInvite(inviteId) {
    try {
      const response = await this._executeWithRetry(async () => {
        return await this.apiService.get(`/api/invite/check/${inviteId}`);
      }, 'checkInvite');
      
      const result = response.data;
      return result;
    } catch (error) {
      this._logError(error, 'checkInvite');
      throw error;
    }
  }

  async sendInvitation(invitationData) {
    // Obter o usuário atual de forma segura
    const currentUser = this.getCurrentUser();

    // Verificar se o usuário está autenticado
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    this._emitEvent(INVITATION_ACTIONS.SEND_START);

    try {
      // Adicionar dados do usuário remetente, se não fornecidos
      const enhancedData = {
        ...invitationData,
        userId: invitationData.senderUid || currentUser.uid,
        senderName: invitationData.senderName || currentUser.displayName,
        senderEmail: invitationData.senderEmail || currentUser.email
      };
      
      const response = await this._executeWithRetry(async () => {
        return await this.apiService.post('/api/invite/generate', enhancedData);
      }, 'sendInvitation');

      const invitation = response.data;
      
      // Atualizar a lista de convites enviados
      this.getSentInvitations();

      // Armazenar em cache
      if (invitation.id) {
        this._invitesCache.set(invitation.id, invitation);
      }
      
      // Emitir evento
      this._emitEvent(INVITATION_ACTIONS.SEND_SUCCESS, { invitation });
      return invitation;
    } catch (error) {
      this._logError(error, 'sendInvitation');
      this._emitEvent(INVITATION_ACTIONS.SEND_FAILURE, { error: error.message });
      throw error;
    }
  }

  // Métodos auxiliares privados
  _cacheSentInvitations(invitations) {
    if (!Array.isArray(invitations)) return;

    invitations.forEach(invite => {
      if (invite.id) {
        this._invitesCache.set(invite.id, invite);
      }
    });
  }

  _clearCache() {
    this._invitesCache.clear();
  }
}

export { InviteService };