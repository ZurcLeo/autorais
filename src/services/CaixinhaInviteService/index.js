// src/services/CaixinhaInviteService/index.js
import { CAIXINHA_INVITE_EVENTS } from '../../core/constants/events';
import { LOG_LEVELS } from '../../core/constants/config';
import { BaseService, serviceLocator, serviceEventHub } from '../../core/services/BaseService';
import { SERVICE_ACTIONS } from '../../core/constants/actions';

const MODULE_NAME = 'caixinhaInvites';

/**
 * Serviço para gerenciar convites para Caixinhas
 */
class CaixinhaInviteService extends BaseService {
  constructor() {
    super(MODULE_NAME);
    this.instanceId = Math.random().toString(36).substring(2, 10);
    this._currentUser = null;
    this._currentCaixinhaId = null;

    this._metadata = {
      name: MODULE_NAME,
      phase: 'FEATURES',
      criticalPath: false,
      dependencies: ['auth', 'users', 'caixinhas', 'messages'],
      category: 'finances',
      description: 'Gerencia convites para Caixinhas'
    };

    this._log(`📨 Nova instância de ${MODULE_NAME} criada, instanceId: ${this.instanceId}`);
    
    // Registrar os serviços necessários
    this._registerServices();
  }

  /**
   * Registra os serviços necessários
   * @private
   */
  _registerServices() {
    try {
      this.apiService = serviceLocator.get('apiService');
      this.authService = serviceLocator.get('auth');
      this.caixinhaService = serviceLocator.get('caixinhas');
      this.messageService = serviceLocator.get('messages');
    } catch (error) {
      this._log('error', 'Failed to register required services', error);
    }
  }

  /**
   * Obtém o usuário atual
   * @returns {Object|null} Usuário atual ou null
   */
  getCurrentUser() {
    return this._currentUser = this.authService?.getCurrentUser();
  }

  /**
   * Inicializa o serviço
   * @returns {Promise<boolean>} true se inicializado com sucesso
   */
  async initialize() {
    if (this.isInitialized) return this;

    this._log(LOG_LEVELS.LIFECYCLE, MODULE_NAME, this.instanceId, 'Initializing caixinha invites service');
    
    // Registrar listeners de eventos para quando convites forem enviados
    this._registerEventListeners();

    this._isInitialized = true;

    this._emitEvent(SERVICE_ACTIONS.SERVICE_READY, {
      serviceName: MODULE_NAME,
      timestamp: new Date().toISOString()
    });
    
    this.getCurrentUser();
    return this;
  }

  /**
   * Registra listeners para eventos relevantes
   * @private
   */
  _registerEventListeners() {
    // Escuta eventos de convites da caixinha
    this._onServiceEvent('caixinhaInvites', CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_SENT, (data) => {
      this._handleMemberInvited(data);
    });
  }

  /**
   * Verifica a saúde do serviço
   * @returns {Promise<Object>} Estado de saúde do serviço
   */
  async healthCheck() {
    try {
      // Tenta verificar a saúde via API
      const healthResponse = await this._executeWithRetry(
        async () => {
          return await this.apiService.get(`/api/health/service/${MODULE_NAME}`);
        },
        'healthCheck'
      );

      return { status: healthResponse.data.status, timestamp: Date.now() };
    } catch (error) {
      // Implementar fallback se o endpoint de saúde estiver indisponível
      this._log('warning', 'Health check endpoint unavailable, proceeding with degraded mode');
      
      // Ainda retornar healthy para não bloquear outras funcionalidades
      return { 
        status: 'degraded', 
        details: 'Operating in offline mode',
        timestamp: Date.now() 
      };
    }
  }

  /**
   * Convida um membro existente para uma caixinha
   * @param {Object} data - Dados do convite
   * @returns {Promise<Object>} - Resultado do convite
   */
  async inviteExistingMember(data) {
    this.getCurrentUser();
    const currentUser = this._currentUser;
    
    if (!currentUser) {
      throw new Error('Usuário deve estar autenticado para enviar convites');
    }
  
    // Validar parâmetros
    if (!data.caixinhaId || !data.targetId) {
      throw new Error('Dados de convite incompletos');
    }
  
    this._log(LOG_LEVELS.INFO, 'Inviting existing member to caixinha', {
      caixinhaId: data.caixinhaId,
      targetId: data.targetId,
      targetName: data.targetName, // Incluir o nome no log
      senderId: currentUser.uid
    });
  
    try {
      // 1. Obter dados da caixinha para incluir no convite
      const caixinhaResponse = await this.caixinhaService.getCaixinhas(currentUser.uid);
      
      // Store the current caixinha ID for use in _userCanInvite
      this._currentCaixinhaId = data.caixinhaId;
      
      // 2. Verificar se o usuário tem permissão (admin ou membro)
      if (!this._userCanInvite(currentUser.uid, caixinhaResponse)) {
        throw new Error('Você não tem permissão para convidar membros para esta caixinha');
      }
      
      // Find the specific caixinha for later use
      const caixinha = caixinhaResponse.data.find(c => c.id === data.caixinhaId);
      if (!caixinha) {
        throw new Error('Caixinha não encontrada');
      }
      
      // 3. Enviar convite através da API da caixinha
      const inviteResponse = await this.apiService.post(`/api/caixinha/membros/${data.caixinhaId}/convite`, {
        targetId: data.targetId,
        targetName: data.targetName, // Adicionar o nome do amigo no payload
        senderId: currentUser.uid,
        senderName: currentUser.name || currentUser.displayName, // Também incluir o nome do remetente
        caixinhaId: data.caixinhaId,
        message: data.message || `${currentUser.name || currentUser.displayName} está convidando você para participar da Caixinha "${caixinha.nome}"`,
        type: 'caixinha_invite' 
      });
      
      // 4. Enviar mensagem ao usuário (opcional)
      if (data.sendMessage) {
        await this._sendInviteMessage(data.targetId, {
          caixinhaId: data.caixinhaId,
          caixinhaDetails: {
            nome: caixinha.nome,
            descricao: caixinha.descricao,
            contribuicaoMensal: caixinha.contribuicaoMensal
          },
          message: data.message || `${currentUser.name || currentUser.displayName} está convidando você para participar da Caixinha "${caixinha.nome}"`,
          caxinhaInviteId: inviteResponse.data.caxinhaInviteId
        });
      }
      
      return {
        success: true,
        caixinhaInviteId: inviteResponse.data.caxinhaInviteId,
        message: 'Convite enviado com sucesso'
      };
    } catch (error) {
      this._logError(error, 'inviteExistingMember');
      throw error;
    }
  }

  /**
   * Convida um novo usuário para uma caixinha via e-mail
   * @param {Object} data - Dados do convite
   * @returns {Promise<Object>} - Resultado do convite
   */
  async inviteNewMember(data) {
    this.getCurrentUser();
    const currentUser = this._currentUser;
    
    if (!currentUser) {
      throw new Error('Usuário deve estar autenticado para enviar convites');
    }

    // Validar parâmetros
    if (!data.caixinhaId || !data.email) {
      throw new Error('Dados de convite incompletos');
    }

    this._log(LOG_LEVELS.INFO, 'Inviting new member to caixinha via email', {
      caixinhaId: data.caixinhaId,
      email: data.email,
      senderId: currentUser.uid
    });

    try {
      // 1. Obter dados da caixinha para incluir no convite
      const caixinha = await this.caixinhaService.getCaixinhaById(data.caixinhaId);
      
      // 2. Verificar se o usuário tem permissão (admin ou membro)
      if (!this._userCanInvite(currentUser.uid, caixinha)) {
        throw new Error('Você não tem permissão para convidar membros para esta caixinha');
      }
      
      // 3. Enviar convite através da API da caixinha
      const inviteResponse = await this.apiService.post(`/api/caixinha/${data.caixinhaId}/membros/convite-email`, {
        email: data.email,
        senderId: currentUser.uid,
        message: data.message || `${currentUser.name || currentUser.displayName} está convidando você para participar da Caixinha "${caixinha.nome}"`
      });

      // 4. Emitir evento de convite enviado
      this._emitEvent(MODULE_NAME, CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_SENT, {
        caixinhaId: data.caixinhaId,
        email: data.email,
        senderId: currentUser.uid,
        invite: inviteResponse.data,
        timestamp: Date.now()
      });
      
      return {
        success: true,
        caixinhaInviteId: inviteResponse.data.caxinhaInviteId,
        message: 'Convite enviado com sucesso'
      };
    } catch (error) {
      // Emitir evento de erro
      this._emitEvent(MODULE_NAME, CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_ERROR, {
        error: error.message,
        errorDetails: error,
        context: 'inviteNewMember'
      });
      
      this._logError(error, 'inviteNewMember');
      throw error;
    }
  }

  /**
   * Aceita um convite de caixinha
   * @param {string} caixinhaInviteId - ID do convite
   * @returns {Promise<Object>} - Resultado da aceitação
   */
  async acceptInvite(caixinhaInviteId) {
    this.getCurrentUser();
    const currentUser = this._currentUser;
    
    if (!currentUser) {
      throw new Error('Usuário deve estar autenticado para aceitar convites');
    }

    this._log(LOG_LEVELS.INFO, 'Accepting caixinha invite', {
      caixinhaInviteId,
      userId: currentUser.uid
    });

    try {
      // Aceitar o convite através da API da caixinha
      const response = await this.apiService.post(`/api/caixinha/membros/convite/${caixinhaInviteId}/aceitar`, {
        userId: currentUser.uid
      });

      // Emitir evento de convite aceito
      this._emitEvent(MODULE_NAME, CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_ACCEPTED, {
        caxinhaInviteId: caixinhaInviteId,
        caixinhaId: response.data.caixinhaId,
        userId: currentUser.uid,
        timestamp: Date.now()
      });
      
      return {
        success: true,
        caixinhaId: response.data.caixinhaId,
        message: 'Convite aceito com sucesso'
      };
    } catch (error) {
      // Emitir evento de erro
      this._emitEvent(MODULE_NAME, CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_ERROR, {
        error: error.message,
        errorDetails: error,
        context: 'acceptInvite'
      });
      
      this._logError(error, 'acceptInvite');
      throw error;
    }
  }

  /**
   * Rejeita um convite de caixinha
   * @param {string} caixinhaInviteId - ID do convite
   * @returns {Promise<Object>} - Resultado da rejeição
   */
  async rejectInvite(caixinhaInviteId) {
    this.getCurrentUser();
    const currentUser = this._currentUser;
    
    if (!currentUser) {
      throw new Error('Usuário deve estar autenticado para rejeitar convites');
    }

    this._log(LOG_LEVELS.INFO, 'Rejecting caixinha invite', {
      caixinhaInviteId,
      userId: currentUser.uid
    });

    try {
      // Rejeitar o convite através da API da caixinha
      await this.apiService.post(`/api/caixinha/membros/convite/${caixinhaInviteId}/rejeitar`, {
        userId: currentUser.uid
      });

      // Emitir evento de convite rejeitado
      this._emitEvent(MODULE_NAME, CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_REJECTED, {
        caxinhaInviteId: caixinhaInviteId,
        userId: currentUser.uid,
        timestamp: Date.now()
      });
      
      return {
        success: true,
        message: 'Convite rejeitado com sucesso'
      };
    } catch (error) {
      // Emitir evento de erro
      this._emitEvent(MODULE_NAME, CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITE_ERROR, {
        error: error.message,
        errorDetails: error,
        context: 'rejectInvite'
      });
      
      this._logError(error, 'rejectInvite');
      throw error;
    }
  }

  /**
   * Obtém todos os convites por tipo
   * @param {string} userId - ID do usuário
   * @param {Array} types - Tipos de convites
   * @param {string} direction - 'received' ou 'sent'
   * @param {string} status - Status dos convites
   * @returns {Promise<Array>} - Lista de convites
   */
  async getInvitationsByType(userId, types, direction, status) {
    this._log(LOG_LEVELS.INFO, 'Getting invitations by type', {
      userId,
      types,
      direction,
      status
    });

    try {
      // Obter convites pendentes do usuário através da API da caixinha
      let response;
      
      if (direction === 'received') {
        response = await this.apiService.get(`/api/caixinha/membros/${userId}/convites-recebidos`, {
          params: { status }
        });
        console.log('verificando recebidos na caixinha:', response)
      } else {
        response = await this.apiService.get(`/api/caixinha/membros/${userId}/convites-enviados`, {
          params: { status }
        });
        console.log('verificando recebidos na caixinha:', response)
      }
      
      // Filtrar apenas os tipos solicitados
      const filteredInvites = response.data.filter(invite => types.includes(invite.type));

      // Emitir evento de convites obtidos
      this._emitEvent(MODULE_NAME, CAIXINHA_INVITE_EVENTS.CAIXINHA_INVITES_FETCHED, {
        userId,
        invites: filteredInvites,
        count: filteredInvites.length,
        isReceivedInvites: direction === 'received',
        types,
        status,
        timestamp: Date.now()
      });

      return filteredInvites;
    } catch (error) {
      // Emitir evento de erro
      this._emitEvent(MODULE_NAME, CAIXINHA_INVITE_EVENTS.CAIXINHA_FETCH_FAILURE, {
        error: error.message,
        errorDetails: error,
        userId,
        context: 'getInvitationsByType'
      });
      
      this._logError(error, 'getInvitationsByType');
      return [];
    }
  }

  /**
   * Manipulador para eventos de membro convidado
   * @private
   * @param {Object} data - Dados do evento
   */
  async _handleMemberInvited(data) {
    this._log(LOG_LEVELS.INFO, 'Handling member invited event', {
      caixinhaId: data.caixinhaId,
      inviteData: data.inviteData
    });
    
    try {
      // Se houver um ID de alvo, enviar mensagem de convite
      if (data.inviteData.targetId) {
        await this._sendInviteMessage(data.inviteData.targetId, {
          caixinhaId: data.caixinhaId,
          message: data.inviteData.message,
          caxinhaInviteId: data.inviteData.caxinhaInviteId,
          caixinhaDetails: data.caixinhaDetails || {}
        });
      }
    } catch (error) {
      this._logError(error, '_handleMemberInvited');
    }
  }

  /**
   * Verifica se um usuário pode convidar membros para uma caixinha
   * @private
   * @param {string} userId - ID do usuário
   * @param {Object} caixinha - Dados da caixinha
   * @returns {boolean} - True se o usuário pode convidar
   */
  _userCanInvite(userId, caixinhaData) {
    // Log for debugging
    console.log('Checking permissions for user:', userId);
    console.log('Caixinha ID being checked:', this._currentCaixinhaId);
    
    // Handle different possible response formats
    let caixinhaToCheck = null;
    
    // Case 1: We received the full API response with success property
    if (caixinhaData && caixinhaData.success && Array.isArray(caixinhaData.data)) {
      console.log('Processing API response with data array');
      caixinhaToCheck = caixinhaData.data.find(c => 
        c.id === this._currentCaixinhaId || 
        c.caixinhaId === this._currentCaixinhaId
      );
    }
    // Case 2: We received a direct caixinha object
    else if (caixinhaData && (caixinhaData.data?.id === this._currentCaixinhaId)) {
      console.log('Processing direct caixinha object');
      caixinhaToCheck = caixinhaData.data;
    }
    // Case 3: We received an array of caixinhas
    else if (Array.isArray(caixinhaData.data)) {
      console.log('Processing array of caixinhas');
      caixinhaToCheck = caixinhaData.data.find(c => 
        c.id === this._currentCaixinhaId || 
        c.caixinhaId === this._currentCaixinhaId
      );
    }
    
    // If we couldn't find the caixinha at all
    if (!caixinhaToCheck) {
      console.error('Caixinha not found in provided data');
      return false;
    }
    
    // Admin check
    if (caixinhaToCheck.adminId === userId) {
      console.log('User is admin of this caixinha');
      return true;
    }
    
    // Member check
    if (Array.isArray(caixinhaToCheck.members) && caixinhaToCheck.members.includes(userId)) {
      console.log('User is member of this caixinha');
      return true;
    }
    
    console.log('User is not authorized for this caixinha');
    return false;
  }

  /**
   * Envia mensagem com detalhes do convite
   * @private
   * @param {string} targetId - ID do destinatário
   * @param {Object} inviteData - Dados do convite
   */
  async _sendInviteMessage(targetId, inviteData) {
    try {
      const message = {
        to: targetId,
        type: 'caixinha_invite',
        content: inviteData.message,
        metadata: {
          caixinhaId: inviteData.caixinhaId,
          caixinhaNome: inviteData.caixinhaDetails.nome,
          contribuicaoMensal: inviteData.caixinhaDetails.contribuicaoMensal,
          caixinhaInviteId: inviteData.caxinhaInviteId
        }
      };
      
      await this.messageService.sendMessage(message);
    } catch (error) {
      this._logError(error, '_sendInviteMessage');
      // Não propaga o erro para não interromper o fluxo principal
    }
  }
}

export { CaixinhaInviteService };