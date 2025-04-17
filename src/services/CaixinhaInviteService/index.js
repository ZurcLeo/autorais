// src/services/CaixinhaInviteService.js
import { CAIXINHA_EVENTS } from '../../core/constants/events';
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

    this._metadata = {
      name: MODULE_NAME,
      phase: 'FEATURES',
      criticalPath: false,
      dependencies: ['auth', 'users', 'caixinhas', 'invites', 'messages', 'connections'],
      category: 'finances',
      description: 'Gerencia convites para Caixinhas'
    };

    this._log(`📨 Nova instância de ${MODULE_NAME} criada, instanceId: ${this.instanceId}`);
    this.apiService = serviceLocator.get('apiService');
    this.authService = serviceLocator.get('auth');
    this.inviteService = serviceLocator.get('invites');
    this.caixinhaService = serviceLocator.get('caixinhas');
    this.connectionService = serviceLocator.get('connections');
    this.messageService = serviceLocator.get('messages');
    this.notificationService = serviceLocator.get('notifications');
  }

  // Método para obter o usuário atual
  getCurrentUser() {
    return this._currentUser = this.authService.getCurrentUser();
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
    serviceEventHub.on('caixinhas', CAIXINHA_EVENTS.MEMBER_INVITED, (data) => {
      this._handleMemberInvited(data);
    });

    // Escuta eventos de convites aceitos
    serviceEventHub.on('invites', 'INVITE_ACCEPTED', (data) => {
      if (data.type === 'caixinha_invite' || data.type === 'caixinha_email_invite') {
        this._handleInviteAccepted(data);
      }
    });

    // Escuta eventos de convites rejeitados
    serviceEventHub.on('invites', 'INVITE_REJECTED', (data) => {
      if (data.type === 'caixinha_invite' || data.type === 'caixinha_email_invite') {
        this._handleInviteRejected(data);
      }
    });
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
      senderId: currentUser.uid
    });

    try {
      // 1. Obter dados da caixinha para incluir no convite
      const caixinha = await this.caixinhaService.getCaixinhaById(data.caixinhaId);
      
      // 2. Verificar se o usuário tem permissão (admin ou membro)
      if (!this._userCanInvite(currentUser.uid, caixinha)) {
        throw new Error('Você não tem permissão para convidar membros para esta caixinha');
      }
      
      // 3. Enviar convite através do serviço de convites
      const inviteData = {
        type: 'caixinha_invite',
        caixinhaId: data.caixinhaId,
        targetId: data.targetId,
        senderId: currentUser.uid,
        message: data.message || `${currentUser.name || currentUser.displayName} está convidando você para participar da Caixinha "${caixinha.nome}"`,
        caixinhaDetails: {
          nome: caixinha.nome,
          descricao: caixinha.descricao,
          contribuicaoMensal: caixinha.contribuicaoMensal
        }
      };
      
      const invite = await this.inviteService.sendInvitation(inviteData);
      
      // 4. Adicionar o usuário à lista de convidados da caixinha
      await this._addToInvitedList(data.caixinhaId, data.targetId);
      
      // 5. Enviar mensagem ao usuário (opcional)
      if (data.sendMessage) {
        await this._sendInviteMessage(data.targetId, inviteData);
      }
      
      // 6. Criar notificação para o usuário
      await this._createInviteNotification(data.targetId, inviteData);
      
      return {
        success: true,
        inviteId: invite.id,
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
      
      // 3. Enviar convite através do serviço de convites
      const inviteData = {
        type: 'caixinha_email_invite',
        caixinhaId: data.caixinhaId,
        email: data.email,
        senderId: currentUser.uid,
        message: data.message || `${currentUser.name || currentUser.displayName} está convidando você para participar da Caixinha "${caixinha.nome}"`,
        caixinhaDetails: {
          nome: caixinha.nome,
          descricao: caixinha.descricao,
          contribuicaoMensal: caixinha.contribuicaoMensal
        }
      };
      
      const invite = await this.inviteService.sendInvitation(inviteData);
      
      // 4. Registrar na lista de convites pendentes
      await this._addToEmailInvitedList(data.caixinhaId, data.email);
      
      return {
        success: true,
        inviteId: invite.id,
        message: 'Convite enviado com sucesso'
      };
    } catch (error) {
      this._logError(error, 'inviteNewMember');
      throw error;
    }
  }

  /**
   * Aceita um convite de caixinha
   * @param {string} inviteId - ID do convite
   * @returns {Promise<Object>} - Resultado da aceitação
   */
  async acceptInvite(inviteId) {
    this.getCurrentUser();
    const currentUser = this._currentUser;
    
    if (!currentUser) {
      throw new Error('Usuário deve estar autenticado para aceitar convites');
    }

    this._log(LOG_LEVELS.INFO, 'Accepting caixinha invite', {
      inviteId,
      userId: currentUser.uid
    });

    try {
      // 1. Obter dados do convite
      const invite = await this.inviteService.getInvitation(inviteId);
      
      if (!invite) {
        throw new Error('Convite não encontrado');
      }
      
      // 2. Verificar se o convite é para o usuário atual
      if (invite.targetId && invite.targetId !== currentUser.uid) {
        throw new Error('Este convite não é para você');
      }
      
      // 3. Verificar se o convite é do tipo caixinha
      if (invite.type !== 'caixinha_invite' && invite.type !== 'caixinha_email_invite') {
        throw new Error('Tipo de convite inválido');
      }
      
      // 4. Aceitar o convite no serviço de convites
      await this.inviteService.acceptInvitation(inviteId);
      
      // 5. Adicionar o usuário como membro da caixinha
      await this.caixinhaService.joinCaixinha(invite.caixinhaId, {
        userId: currentUser.uid
      });
      
      // 6. Remover da lista de convidados pendentes
      await this._removeFromInvitedList(invite.caixinhaId, currentUser.uid);
      
      // 7. Criar conexão com o remetente se ainda não existir
      if (invite.senderId) {
        await this._ensureConnectionExists(invite.senderId, currentUser.uid);
      }
      
      // 8. Notificar o remetente do convite
      await this._notifyInviteSender(invite, 'accepted');
      
      return {
        success: true,
        caixinhaId: invite.caixinhaId,
        message: 'Convite aceito com sucesso'
      };
    } catch (error) {
      this._logError(error, 'acceptInvite');
      throw error;
    }
  }

  /**
   * Rejeita um convite de caixinha
   * @param {string} inviteId - ID do convite
   * @returns {Promise<Object>} - Resultado da rejeição
   */
  async rejectInvite(inviteId) {
    this.getCurrentUser();
    const currentUser = this._currentUser;
    
    if (!currentUser) {
      throw new Error('Usuário deve estar autenticado para rejeitar convites');
    }

    this._log(LOG_LEVELS.INFO, 'Rejecting caixinha invite', {
      inviteId,
      userId: currentUser.uid
    });

    try {
      // 1. Obter dados do convite
      const invite = await this.inviteService.getInvitation(inviteId);
      
      if (!invite) {
        throw new Error('Convite não encontrado');
      }
      
      // 2. Verificar se o convite é para o usuário atual
      if (invite.targetId && invite.targetId !== currentUser.uid) {
        throw new Error('Este convite não é para você');
      }
      
      // 3. Verificar se o convite é do tipo caixinha
      if (invite.type !== 'caixinha_invite' && invite.type !== 'caixinha_email_invite') {
        throw new Error('Tipo de convite inválido');
      }
      
      // 4. Rejeitar o convite no serviço de convites
      await this.inviteService.rejectInvitation(inviteId);
      
      // 5. Remover da lista de convidados pendentes
      await this._removeFromInvitedList(invite.caixinhaId, currentUser.uid);
      
      // 6. Notificar o remetente do convite
      await this._notifyInviteSender(invite, 'rejected');
      
      return {
        success: true,
        message: 'Convite rejeitado com sucesso'
      };
    } catch (error) {
      this._logError(error, 'rejectInvite');
      throw error;
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
      // Se for convite por email, não há userId
      if (data.inviteData.email) {
        await this._addToEmailInvitedList(data.caixinhaId, data.inviteData.email);
      } else if (data.inviteData.targetId) {
        await this._addToInvitedList(data.caixinhaId, data.inviteData.targetId);
        await this._createInviteNotification(data.inviteData.targetId, {
          type: 'caixinha_invite',
          caixinhaId: data.caixinhaId,
          senderId: data.inviteData.senderId
        });
      }
    } catch (error) {
      this._logError(error, '_handleMemberInvited');
    }
  }

  /**
   * Manipulador para eventos de convite aceito
   * @private
   * @param {Object} data - Dados do evento
   */
  async _handleInviteAccepted(data) {
    this._log(LOG_LEVELS.INFO, 'Handling invite accepted event', {
      inviteId: data.inviteId,
      caixinhaId: data.caixinhaId,
      userId: data.userId
    });
    
    try {
      // Notificar remetente do convite
      await this._notifyInviteSender(data, 'accepted');
      
      // Remover da lista de convidados pendentes
      await this._removeFromInvitedList(data.caixinhaId, data.userId);
    } catch (error) {
      this._logError(error, '_handleInviteAccepted');
    }
  }

  /**
   * Manipulador para eventos de convite rejeitado
   * @private
   * @param {Object} data - Dados do evento
   */
  async _handleInviteRejected(data) {
    this._log(LOG_LEVELS.INFO, 'Handling invite rejected event', {
      inviteId: data.inviteId,
      caixinhaId: data.caixinhaId,
      userId: data.userId
    });
    
    try {
      // Notificar remetente do convite
      await this._notifyInviteSender(data, 'rejected');
      
      // Remover da lista de convidados pendentes
      await this._removeFromInvitedList(data.caixinhaId, data.userId);
    } catch (error) {
      this._logError(error, '_handleInviteRejected');
    }
  }

  /**
   * Verifica se um usuário pode convidar membros para uma caixinha
   * @private
   * @param {string} userId - ID do usuário
   * @param {Object} caixinha - Dados da caixinha
   * @returns {boolean} - True se o usuário pode convidar
   */
  _userCanInvite(userId, caixinha) {
    // Admin pode sempre convidar
    if (caixinha.adminId === userId) {
      return true;
    }
    
    // Verificar se é membro
    if (caixinha.membros && caixinha.membros.includes(userId)) {
      return true;
    }
    
    return false;
  }

  /**
   * Adiciona um usuário à lista de convidados de uma caixinha
   * @private
   * @param {string} caixinhaId - ID da caixinha
   * @param {string} userId - ID do usuário
   */
  async _addToInvitedList(caixinhaId, userId) {
    try {
      await this.apiService.post(`/api/caixinha/${caixinhaId}/invited`, {
        userId,
        status: 'pending'
      });
    } catch (error) {
      this._logError(error, '_addToInvitedList');
      throw error;
    }
  }

  /**
   * Adiciona um email à lista de convidados de uma caixinha
   * @private
   * @param {string} caixinhaId - ID da caixinha
   * @param {string} email - Email do convidado
   */
  async _addToEmailInvitedList(caixinhaId, email) {
    try {
      await this.apiService.post(`/api/caixinha/${caixinhaId}/email-invited`, {
        email,
        status: 'pending'
      });
    } catch (error) {
      this._logError(error, '_addToEmailInvitedList');
      throw error;
    }
  }

  /**
   * Remove um usuário da lista de convidados de uma caixinha
   * @private
   * @param {string} caixinhaId - ID da caixinha
   * @param {string} userId - ID do usuário
   */
  async _removeFromInvitedList(caixinhaId, userId) {
    try {
      await this.apiService.delete(`/api/caixinha/${caixinhaId}/invited/${userId}`);
    } catch (error) {
      this._logError(error, '_removeFromInvitedList');
      // Não propaga o erro para não interromper o fluxo principal
    }
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
          inviteId: inviteData.id
        }
      };
      
      await this.messageService.sendMessage(message);
    } catch (error) {
      this._logError(error, '_sendInviteMessage');
      // Não propaga o erro para não interromper o fluxo principal
    }
  }

  /**
   * Cria notificação para o usuário convidado
   * @private
   * @param {string} targetId - ID do destinatário
   * @param {Object} inviteData - Dados do convite
   */
  async _createInviteNotification(targetId, inviteData) {
    try {
      const notification = {
        userId: targetId,
        type: 'caixinha_invite',
        title: 'Novo convite para Caixinha',
        message: inviteData.message,
        data: {
          caixinhaId: inviteData.caixinhaId,
          senderId: inviteData.senderId,
          inviteId: inviteData.id
        },
        read: false
      };
      
      await this.notificationService.createNotification(notification);
    } catch (error) {
      this._logError(error, '_createInviteNotification');
      // Não propaga o erro para não interromper o fluxo principal
    }
  }

  /**
   * Garante que existe uma conexão entre os usuários
   * @private
   * @param {string} user1 - ID do primeiro usuário
   * @param {string} user2 - ID do segundo usuário
   */
  async _ensureConnectionExists(user1, user2) {
    try {
      // Verificar se já existe conexão
      const connections = await this.connectionService.getConnections(user1);
      const isConnected = connections.some(conn => conn.id === user2);
      
      if (!isConnected) {
        // Criar solicitação de conexão (automaticamente aceita no contexto de um convite)
        await this.connectionService.createConnectionRequest({
          fromUserId: user1,
          toUserId: user2,
          status: 'accepted',
          message: 'Conexão criada através de convite para Caixinha',
          autoAccept: true
        });
      }
    } catch (error) {
      this._logError(error, '_ensureConnectionExists');
      // Não propaga o erro para não interromper o fluxo principal
    }
  }

  /**
   * Notifica o remetente sobre o status do convite
   * @private
   * @param {Object} invite - Dados do convite
   * @param {string} status - Status ('accepted' ou 'rejected')
   */
  async _notifyInviteSender(invite, status) {
    try {
      // Obter dados do destinatário
      const targetUser = await this.authService.getUserProfile(invite.targetId);
      
      const notification = {
        userId: invite.senderId,
        type: 'caixinha_invite_response',
        title: status === 'accepted' ? 'Convite aceito' : 'Convite recusado',
        message: status === 'accepted' 
          ? `${targetUser.name || targetUser.displayName || 'Usuário'} aceitou seu convite para a Caixinha` 
          : `${targetUser.name || targetUser.displayName || 'Usuário'} recusou seu convite para a Caixinha`,
        data: {
          caixinhaId: invite.caixinhaId,
          targetId: invite.targetId,
          status
        },
        read: false
      };
      
      await this.notificationService.createNotification(notification);
    } catch (error) {
      this._logError(error, '_notifyInviteSender');
      // Não propaga o erro para não interromper o fluxo principal
    }
  }
}

export { CaixinhaInviteService };