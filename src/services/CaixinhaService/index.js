import { CAIXINHA_EVENTS } from '../../core/constants/events.js';
import { LOG_LEVELS } from '../../core/constants/config.js';
import { BaseService, serviceLocator, serviceEventHub } from '../../core/services/BaseService';
import { SERVICE_ACTIONS } from '../../core/constants/actions.js';

const MODULE_NAME = 'caixinhas';

/**
 * Serviço para gerenciar Caixinhas (grupos de economia/investimento coletivo)
 */
class CaixinhaService extends BaseService {
  constructor() {
    super(MODULE_NAME);
    this.instanceId = Math.random().toString(36).substring(2, 10);
    this._currentUser = null;

    this._metadata = {
      name: MODULE_NAME,
      phase: 'FEATURES',              // Fase de inicialização (CORE, ESSENTIAL, etc.)
      criticalPath: true,         // Indica se é um serviço crítico para a aplicação
      dependencies: ['auth', 'users'], // Serviços que devem estar prontos antes deste
      category: 'finances',       // Categoria do serviço
      description: 'Gerencia Caixinhas.' // Descrição
    };

    this._log(`📊 Nova instância de ${MODULE_NAME} criada, instanceId: ${this.instanceId}`);
    this.apiService = serviceLocator.get('apiService');
    this.authService = serviceLocator.get('auth');

  }

    // Método para obter o usuário atual - mesma abordagem do InviteService
    getCurrentUser() {
      return this._currentUser = this.authService.getCurrentUser();
  }

  /**
   * Inicializa o serviço
   * @returns {Promise<boolean>} true se inicializado com sucesso
   */
  async initialize() {
    if (this.isInitialized) return this;

    this._log( LOG_LEVELS.LIFECYCLE, 
      MODULE_NAME,
      this.instanceId,
      'Initializing caixinhas service specific logic'
    );

    this._isInitialized = true;

    this._emitEvent(SERVICE_ACTIONS.SERVICE_READY, {
      serviceName: MODULE_NAME,
      timestamp: new Date().toISOString()
    });
    this.getCurrentUser()
    return this; // Indica sucesso para BaseService
  }

  /**
   * Verifica a saúde do serviço
   * @returns {Promise<Object>} Estado de saúde do serviço
   */
  async healthCheck() {
    try {
      // this._startLoading()
      // Tentar verificar a saúde via API
      const healthResponse = await this._executeWithRetry(
        async () => {
          return await this.apiService.get(`/api/health/service/${MODULE_NAME}`);
        },
        'healthCheck'
      );
      // this._stopLoading()
      // console.log('checando resposta', healthResponse.data.status)

      return { status: healthResponse.data.status, timestamp: Date.now() };
    } catch (error) {
      // this._stopLoading()
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
   * Desliga o serviço e libera recursos
   * @returns {Promise<boolean>} true se desligado com sucesso
   */
  async shutdown() {
    this._log('shutting down', { timestamp: Date.now() });
    this._isInitialized = false;
    return true;
  }

  /**
   * Obtém as caixinhas de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Lista de caixinhas e contagem total
   */
  async getCaixinhas(userId) {
    this.getCurrentUser()
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        if (!userId) {
          const error = new Error('userID é obrigatório para buscar caixinhas');
          this._logError(error, 'getCaixinhas');
          throw error;
        }

        try {
          this._log('fetching caixinhas', { userId });
          
          const response = await this.apiService.get(`/api/caixinha/${userId}`);
          const processedCaixinhas = response.data.data
          // Array.isArray(response.data.data)
          //   ? response.data.data.map(this._processCaixinhaData)
          //   : [];

          const duration = performance.now() - startTime;
          this._logPerformance('getCaixinhas', duration, {
            userId,
            count: processedCaixinhas.length
          });
          this._log('fetching caixotes', response);

          // Emitir evento de caixinhas obtidas
          this._emitEvent(this.serviceName, CAIXINHA_EVENTS.CAIXINHAS_FETCHED, {
            userId,
            caixinhas: processedCaixinhas,
            count: processedCaixinhas.length
          });

          return {
            data: processedCaixinhas,
            totalCount: processedCaixinhas.length
          };
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'getCaixinhas', duration);
          throw error;
        }
      },
      'getCaixinhas'
    );
  }

  /**
   * Obtém uma caixinha específica pelo ID
   * @param {string} id - ID da caixinha
   * @returns {Promise<Object>} Dados da caixinha
   */
  async getCaixinhaById(id) {
    this.getCurrentUser()
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        try {
          this._log('fetching caixinha by id', { id });
          
          const response = await this.apiService.get(`/api/caixinha/${id}`);
          const processedCaixinha = this._processCaixinhaData(response.data);

          const duration = performance.now() - startTime;
          this._logPerformance('getCaixinhaById', duration, { id });

          // Emitir evento de caixinha obtida
          this._emitEvent(this.serviceName, CAIXINHA_EVENTS.CAIXINHA_FETCHED, {
            caixinhaId: id,
            caixinha: processedCaixinha
          });

          return processedCaixinha;
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'getCaixinhaById', duration);
          throw error;
        }
      },
      'getCaixinhaById'
    );
  }

  /**
   * Cria uma nova caixinha
   * @param {Object} data - Dados da caixinha a ser criada
   * @returns {Promise<Object>} Caixinha criada
   */
  async createCaixinha(data) {
    this.getCurrentUser()
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        try {
          this._log('creating caixinha', { 
            adminId: data.adminId,
            nome: data.nome,
            contribuicaoMensal: data.contribuicaoMensal
          });
          
          const response = await this.apiService.post('/api/caixinha', data);
          const processedCaixinha = this._processCaixinhaData(response.data);

          const duration = performance.now() - startTime;
          this._logPerformance('createCaixinha', duration, {
            caixinhaId: processedCaixinha.id,
            adminId: data.adminId
          });

          // Emitir evento de caixinha criada
          this._emitEvent(this.serviceName, CAIXINHA_EVENTS.CAIXINHA_CREATED, {
            caixinhaId: processedCaixinha.id,
            adminId: data.adminId,
            caixinha: processedCaixinha
          });

          return processedCaixinha;
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'createCaixinha', duration);
          throw error;
        }
      },
      'createCaixinha'
    );
  }

  /**
   * Atualiza uma caixinha existente
   * @param {string} id - ID da caixinha
   * @param {Object} data - Dados a serem atualizados
   * @returns {Promise<Object>} Caixinha atualizada
   */
  async updateCaixinha(id, data) {
    this.getCurrentUser()
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        try {
          this._log('updating caixinha', { 
            id, 
            updatedFields: Object.keys(data)
          });
          
          const response = await this.apiService.put(`/api/caixinha/${id}`, data);
          const processedCaixinha = this._processCaixinhaData(response.data);

          const duration = performance.now() - startTime;
          this._logPerformance('updateCaixinha', duration, {
            id,
            updatedFields: Object.keys(data)
          });

          // Emitir evento de caixinha atualizada
          this._emitEvent(this.serviceName, CAIXINHA_EVENTS.CAIXINHA_UPDATED, {
            caixinhaId: id,
            updatedFields: Object.keys(data),
            caixinha: processedCaixinha
          });

          return processedCaixinha;
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'updateCaixinha', duration);
          throw error;
        }
      },
      'updateCaixinha'
    );
  }

  /**
   * Exclui uma caixinha
   * @param {string} id - ID da caixinha
   * @returns {Promise<Object>} Resultado da exclusão
   */
  async deleteCaixinha(id) {
    this.getCurrentUser()
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        try {
          this._log('deleting caixinha', { id });
          
          const response = await this.apiService.delete(`/api/caixinha/${id}`);

          const duration = performance.now() - startTime;
          this._logPerformance('deleteCaixinha', duration, { id });

          // Emitir evento de caixinha excluída
          this._emitEvent(this.serviceName, CAIXINHA_EVENTS.CAIXINHA_DELETED, {
            caixinhaId: id
          });

          return response.data;
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'deleteCaixinha', duration);
          throw error;
        }
      },
      'deleteCaixinha'
    );
  }

  /**
   * Adiciona uma contribuição a uma caixinha
   * @param {Object} data - Dados da contribuição
   * @returns {Promise<Object>} Resultado da adição
   */
  async addContribuicao(data) {
    this.getCurrentUser()
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        try {
          this._log('adding contribuicao', { 
            caixinhaId: data.caixinhaId,
            userId: data.userId,
            valor: data.valor
          });
          
          const response = await this.apiService.post('/api/caixinha/contribuicao', data);

          const duration = performance.now() - startTime;
          this._logPerformance('addContribuicao', duration, {
            caixinhaId: data.caixinhaId,
            userId: data.userId
          });

          // Emitir evento de contribuição adicionada
          this._emitEvent(this.serviceName, CAIXINHA_EVENTS.CONTRIBUICAO_ADDED, {
            caixinhaId: data.caixinhaId,
            userId: data.userId,
            contribuicao: response.data
          });

          return response.data;
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'addContribuicao', duration);
          throw error;
        }
      },
      'addContribuicao'
    );
  }

  /**
   * Obtém as contribuições de uma caixinha
   * @param {string} id - ID da caixinha
   * @returns {Promise<Array>} Lista de contribuições
   */
  async getContribuicoes(id) {
    this.getCurrentUser()
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        try {
          this._log('fetching contribuicoes', { caixinhaId: id });
          
          const response = await this.apiService.get(`/api/caixinha/${id}/contribuicoes`);
          const contribuicoes = response.data;

          const duration = performance.now() - startTime;
          this._logPerformance('getContribuicoes', duration, {
            caixinhaId: id,
            count: contribuicoes.length
          });

          // Emitir evento de contribuições obtidas
          this._emitEvent(this.serviceName, CAIXINHA_EVENTS.CONTRIBUICOES_FETCHED, {
            caixinhaId: id,
            contribuicoes,
            count: contribuicoes.length
          });

          return contribuicoes;
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'getContribuicoes', duration);
          throw error;
        }
      },
      'getContribuicoes'
    );
  }

  /**
   * Convida um membro para uma caixinha
   * @param {string} caixinhaId - ID da caixinha
   * @param {Object} inviteData - Dados do convite
   * @returns {Promise<Object>} Resultado do convite
   */
  async inviteMember(caixinhaId, inviteData) {
    this.getCurrentUser()
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        try {
          this._log('inviting member', { 
            caixinhaId, 
            email: inviteData.email 
          });
          
          const response = await this.apiService.post(`/api/caixinha/${caixinhaId}/invite`, inviteData);

          const duration = performance.now() - startTime;
          this._logPerformance('inviteMember', duration, {
            caixinhaId,
            email: inviteData.email
          });

          // Emitir evento de membro convidado
          this._emitEvent(this.serviceName, CAIXINHA_EVENTS.MEMBER_INVITED, {
            caixinhaId,
            inviteData,
            result: response.data
          });

          return response.data;
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'inviteMember', duration);
          throw error;
        }
      },
      'inviteMember'
    );
  }

  /**
   * Registra a saída de um membro de uma caixinha
   * @param {string} caixinhaId - ID da caixinha
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Resultado da saída
   */
  async leaveCaixinha(caixinhaId, userId) {
    this.getCurrentUser()
    return this._executeWithRetry(
      async () => {
        const startTime = performance.now();
        
        try {
          this._log('member leaving caixinha', { caixinhaId, userId });
          
          const response = await this.apiService.post(`/api/caixinha/${caixinhaId}/leave`, { userId });

          const duration = performance.now() - startTime;
          this._logPerformance('leaveCaixinha', duration, {
            caixinhaId,
            userId
          });

          // Emitir evento de membro saindo
          this._emitEvent(this.serviceName, CAIXINHA_EVENTS.MEMBER_LEFT, {
            caixinhaId,
            userId,
            result: response.data
          });

          return response.data;
        } catch (error) {
          const duration = performance.now() - startTime;
          this._logError(error, 'leaveCaixinha', duration);
          throw error;
        }
      },
      'leaveCaixinha'
    );
  }

  /**
   * Processa dados brutos de caixinha para um formato normalizado
   * @private
   * @param {Object} caixinhaData - Dados brutos da caixinha
   * @returns {Object} Dados processados da caixinha
   */
  _processCaixinhaData = (caixinhaData) => {
    this.getCurrentUser()
    // Se já for um objeto processado, retorne-o
    if (!caixinhaData._fieldsProto) {
      return caixinhaData;
    }

    const fields = caixinhaData._fieldsProto;

    return {
      id: caixinhaData._ref?._path?.segments?.slice(-1)[0] || '',
      nome: fields.nome?.stringValue || '',
      descricao: fields.descricao?.stringValue || '',
      adminId: fields.adminId?.stringValue || '',
      membros: fields.membros?.arrayValue?.values?.map(v => v.stringValue) || [],
      contribuicaoMensal: Number(fields.contribuicaoMensal?.doubleValue || 0),
      diaVencimento: Number(fields.diaVencimento?.integerValue || 1),
      valorMulta: Number(fields.valorMulta?.doubleValue || 0),
      valorJuros: Number(fields.valorJuros?.doubleValue || 0),
      distribuicaoTipo: fields.distribuicaoTipo?.stringValue || 'padrao',
      duracaoMeses: Number(fields.duracaoMeses?.integerValue || 12),
      dataCriacao: new Date(fields._createTime?._seconds * 1000).toISOString(),
      status: fields.status?.stringValue || 'ativo'
    };
  };
}

export { CaixinhaService };