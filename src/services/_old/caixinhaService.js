// import {api} from './apiService';

// // Função auxiliar para processar dados da caixinha
// const processCaixinhaData = (caixinhaData) => {
//   // Se já for um objeto processado, retorne-o
//   if (!caixinhaData._fieldsProto) {
//     return caixinhaData;
//   }

//   const fields = caixinhaData._fieldsProto;
  
//   return {
//     id: caixinhaData._ref?._path?.segments?.slice(-1)[0] || '',
//     nome: fields.nome?.stringValue || '',
//     descricao: fields.descricao?.stringValue || '',
//     adminId: fields.adminId?.stringValue || '',
//     membros: fields.membros?.arrayValue?.values?.map(v => v.stringValue) || [],
//     contribuicaoMensal: Number(fields.contribuicaoMensal?.doubleValue || 0),
//     diaVencimento: Number(fields.diaVencimento?.integerValue || 1),
//     valorMulta: Number(fields.valorMulta?.doubleValue || 0),
//     valorJuros: Number(fields.valorJuros?.doubleValue || 0),
//     distribuicaoTipo: fields.distribuicaoTipo?.stringValue || 'padrao',
//     duracaoMeses: Number(fields.duracaoMeses?.integerValue || 12),
//     dataCriacao: new Date(fields._createTime?._seconds * 1000).toISOString(),
//     status: fields.status?.stringValue || 'ativo'
//   };
// };

// const caixinhaService = {
//   // Buscar todas as Caixinhas do usuário logado
//   getCaixinhas: async (userId) => {
//     console.debug(`Iniciando busca de caixinhas para o usuário com ID: ${userId}...`);
//     console.time(`getCaixinhas-${userId}`);

//     if (!userId) {
//       console.error('userId não fornecido para busca de caixinhas.');
//       throw new Error('userID é obrigatório para buscar caixinhas.');
//     }

//     try {
//       const response = await api.get(`/api/caixinha/${userId}`);
//       const processedCaixinhas = Array.isArray(response.data) 
//         ? response.data.map(processCaixinhaData)
//         : [];
      
//       console.info(`Caixinhas processadas com sucesso para o usuário ${userId}. Total: ${processedCaixinhas.length}`);
//       return {
//         data: processedCaixinhas,
//         totalCount: processedCaixinhas.length
//       };
//     } catch (error) {
//       console.error(`Erro ao buscar caixinhas para usuário ${userId}:`, error.message, error.stack);
//       throw new Error(`Falha ao buscar caixinhas: ${error.message}`);
//     } finally {
//       console.timeEnd(`getCaixinhas-${userId}`);
//     }
//   },

//   // Buscar uma Caixinha específica por ID
//   getCaixinhaById: async (id) => {
//     console.debug(`Iniciando busca da caixinha com ID: ${id}...`);
//     console.time(`getCaixinhaById-${id}`);

//     try {
//       const response = await api.get(`/api/caixinha/${id}`);
//       const processedCaixinha = processCaixinhaData(response.data);
//       console.info(`Caixinha com ID ${id} processada com sucesso.`);
//       return processedCaixinha;
//     } catch (error) {
//       console.error(`Erro ao buscar caixinha com ID ${id}:`, error.message, error.stack);
//       throw new Error(`Falha ao buscar caixinha: ${error.message}`);
//     } finally {
//       console.timeEnd(`getCaixinhaById-${id}`);
//     }
//   },

//   // Criar uma nova Caixinha
//   createCaixinha: async (data) => {
//     console.debug('Iniciando criação de nova caixinha...');
//     console.time('createCaixinha');

//     try {
//       const response = await api.post('/api/caixinha', data);
//       const processedCaixinha = processCaixinhaData(response.data);
//       console.info(`Nova caixinha criada com sucesso. ID: ${processedCaixinha.id}`);
//       return processedCaixinha;
//     } catch (error) {
//       console.error('Erro ao criar caixinha:', error.message, error.stack);
//       throw new Error(`Falha ao criar caixinha: ${error.message}`);
//     } finally {
//       console.timeEnd('createCaixinha');
//     }
//   },

//   // Atualizar uma Caixinha existente
//   updateCaixinha: async (id, data) => {
//     console.debug(`Iniciando atualização da caixinha com ID: ${id}...`);
//     console.time(`updateCaixinha-${id}`);

//     try {
//       const response = await api.put(`/api/caixinha/${id}`, data);
//       const processedCaixinha = processCaixinhaData(response.data);
//       console.info(`Caixinha com ID ${id} atualizada com sucesso.`);
//       return processedCaixinha;
//     } catch (error) {
//       console.error(`Erro ao atualizar caixinha com ID ${id}:`, error.message, error.stack);
//       throw new Error(`Falha ao atualizar caixinha: ${error.message}`);
//     } finally {
//       console.timeEnd(`updateCaixinha-${id}`);
//     }
//   },

//   // Deletar uma Caixinha
//   deleteCaixinha: async (id) => {
//     console.debug(`Iniciando exclusão da caixinha com ID: ${id}...`);
//     console.time(`deleteCaixinha-${id}`);

//     try {
//       const response = await api.delete(`/api/caixinha/${id}`);
//       console.info(`Caixinha com ID ${id} excluída com sucesso.`);
//       return response.data;
//     } catch (error) {
//       console.error(`Erro ao deletar caixinha com ID ${id}:`, error.message, error.stack);
//       throw new Error(`Falha ao deletar caixinha: ${error.message}`);
//     } finally {
//       console.timeEnd(`deleteCaixinha-${id}`);
//     }
//   },

//   // Adicionar uma contribuição a uma Caixinha
//   addContribuicao: async (data) => {
//     console.debug(`Iniciando adição de contribuição para a caixinha com ID: ${data.caixinhaId}...`);
//     console.time(`addContribuicao-${data.caixinhaId}`);

//     try {
//       const response = await api.post('/api/caixinha/contribuicao', data);
//       console.info(`Contribuição adicionada com sucesso à caixinha ${data.caixinhaId}.`);
//       return response.data;
//     } catch (error) {
//       console.error('Erro ao adicionar contribuição:', error.message, error.stack);
//       throw new Error(`Falha ao adicionar contribuição: ${error.message}`);
//     } finally {
//       console.timeEnd(`addContribuicao-${data.caixinhaId}`);
//     }
//   },

//   // Buscar todas as contribuições de uma Caixinha específica
//   getContribuicoes: async (id) => {
//     console.debug(`Iniciando busca de contribuições para a caixinha com ID: ${id}...`);
//     console.time(`getContribuicoes-${id}`);

//     try {
//       const response = await api.get(`/api/caixinha/${id}/contribuicoes`);
//       console.info(`Contribuições da caixinha ${id} obtidas com sucesso. Total: ${response.data.length}`);
//       return response.data;
//     } catch (error) {
//       console.error(`Erro ao buscar contribuições para caixinha ${id}:`, error.message, error.stack);
//       throw new Error(`Falha ao buscar contribuições: ${error.message}`);
//     } finally {
//       console.timeEnd(`getContribuicoes-${id}`);
//     }
//   },

//   // Convidar membro para uma Caixinha
//   inviteMember: async (caixinhaId, inviteData) => {
//     console.debug(`Iniciando convite de membro para a caixinha com ID: ${caixinhaId}...`);
//     console.time(`inviteMember-${caixinhaId}`);

//     try {
//       const response = await api.post(`/api/caixinha/${caixinhaId}/invite`, inviteData);
//       console.info(`Convite enviado com sucesso para a caixinha ${caixinhaId}.`);
//       return response.data;
//     } catch (error) {
//       console.error(`Erro ao enviar convite para caixinha ${caixinhaId}:`, error.message, error.stack);
//       throw new Error(`Falha ao enviar convite: ${error.message}`);
//     } finally {
//       console.timeEnd(`inviteMember-${caixinhaId}`);
//     }
//   },

//   // Sair de uma Caixinha
//   leaveCaixinha: async (caixinhaId, userId) => {
//     console.debug(`Iniciando processo de saída da caixinha com ID: ${caixinhaId} para usuário ${userId}...`);
//     console.time(`leaveCaixinha-${caixinhaId}`);

//     try {
//       const response = await api.post(`/api/caixinha/${caixinhaId}/leave`, { userId });
//       console.info(`Usuário ${userId} saiu com sucesso da caixinha ${caixinhaId}.`);
//       return response.data;
//     } catch (error) {
//       console.error(`Erro ao sair da caixinha ${caixinhaId}:`, error.message, error.stack);
//       throw new Error(`Falha ao sair da caixinha: ${error.message}`);
//     } finally {
//       console.timeEnd(`leaveCaixinha-${caixinhaId}`);
//     }
//   }
// };

// export default caixinhaService;