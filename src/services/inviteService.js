import {api} from './apiService';

const inviteService = {
  // Método para buscar convites enviados por um usuário
  getSentInvitations: async (userId) => {
    console.debug(`Iniciando busca de convites enviados pelo usuário com ID: ${userId}...`);
    console.time(`getSentInvitations-${userId}`); // Timer para medir o tempo de execução

    if (!userId) {
      console.error('userId não fornecido.');
      throw new Error('userId é obrigatório para buscar convites.');
    }

    try {
      const response = await api.get(`/api/invite/sent/${userId}`);
      console.info(`Convites enviados pelo usuário com ID: ${userId} buscados com sucesso. Total: ${response.data.length}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar convites enviados pelo usuário com ID: ${userId}:`, error.message, error.stack);
      throw new Error(`Falha ao buscar convites: ${error.message}`);
    } finally {
      console.timeEnd(`getSentInvitations-${userId}`);
    }
  },

  // Método para buscar detalhes de um convite específico por ID
  getInviteById: async (inviteId) => {
    console.debug(`Iniciando busca do convite com ID: ${inviteId}...`);
    console.time(`getInviteById-${inviteId}`); // Timer para medir o tempo de execução

    try {
      const response = await api.get(`/api/invite/view/${inviteId}`);
      console.info(`Convite com ID: ${inviteId} encontrado com sucesso.`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar detalhes do convite com ID: ${inviteId}:`, error.message, error.stack);
      throw new Error(`Falha ao buscar convite: ${error.message}`);
    } finally {
      console.timeEnd(`getInviteById-${inviteId}`);
    }
  },

  // Método para validar um convite
  validateInvite: async (inviteId, email, nome) => {
    console.debug(`Iniciando validação do convite com ID: ${inviteId} para o email: ${email}...`);
    console.time(`validateInvite-${inviteId}`); // Timer para medir o tempo de execução

    try {
      const response = await api.post(`/api/invite/validate/${inviteId}`, {
        inviteId: inviteId,
        email: email,
        nome: nome
      });
      console.info(`Convite com ID: ${inviteId} validado com sucesso para o email: ${email}.`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao validar convite com ID: ${inviteId}:`, error.message, error.stack);
      throw new Error(`Falha ao validar convite: ${error.message}`);
    } finally {
      console.timeEnd(`validateInvite-${inviteId}`);
    }
  },

  // Método para cancelar um convite
  cancelInvitation: async (inviteId) => {
    console.debug(`Iniciando cancelamento do convite com ID: ${inviteId}...`);
    console.time(`cancelInvitation-${inviteId}`); // Timer para medir o tempo de execução

    try {
      const response = await api.put(`/api/invite/cancel/${inviteId}`, {});
      console.info(`Convite com ID: ${inviteId} cancelado com sucesso.`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao cancelar convite com ID: ${inviteId}:`, error.message, error.stack);
      throw new Error(`Falha ao cancelar convite: ${error.message}`);
    } finally {
      console.timeEnd(`cancelInvitation-${inviteId}`);
    }
  },

  // Método para invalidar um convite
  invalidateInvite: async (inviteId) => {
    console.debug(`Iniciando invalidação do convite com ID: ${inviteId}...`);
    console.time(`invalidateInvite-${inviteId}`); // Timer para medir o tempo de execução

    try {
      const response = await api.post('/api/invite/invalidate', { inviteId });
      console.info(`Convite com ID: ${inviteId} invalidado com sucesso.`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao invalidar convite com ID: ${inviteId}:`, error.message, error.stack);
      throw new Error(`Falha ao invalidar convite: ${error.message}`);
    } finally {
      console.timeEnd(`invalidateInvite-${inviteId}`);
    }
  },

  // Método para reenviar um convite
  resendInvitation: async (inviteId, userId) => {
    console.debug(`Iniciando reenvio do convite com ID: ${inviteId} para o usuário com ID: ${userId}...`);
    console.time(`resendInvitation-${inviteId}`); // Timer para medir o tempo de execução

    try {
      const response = await api.post(`/api/invite/resend/${inviteId}`, {
        body: {
          'userId': userId
        }
      });
      console.info(`Convite com ID: ${inviteId} reenviado com sucesso para o usuário com ID: ${userId}.`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao reenviar convite com ID: ${inviteId}:`, error.message, error.stack);
      throw new Error(`Falha ao reenviar convite: ${error.message}`);
    } finally {
      console.timeEnd(`resendInvitation-${inviteId}`);
    }
  },

  // Método para enviar um novo convite
  sendInvitation: async (invitationData) => {
    console.debug('Iniciando envio de novo convite...');
    console.time('sendInvitation'); // Timer para medir o tempo de execução

    try {
      const response = await api.post('/api/invite/generate', invitationData);
      console.info('Convite enviado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar convite:', {
        error: error.response?.data || error.message,
        status: error.response?.status,
        originalData: invitationData
      });
      throw new Error(`Falha ao enviar convite: ${error.message}`);
    } finally {
      console.timeEnd('sendInvitation');
    }
  }
};

export default inviteService;