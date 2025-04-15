// import {api} from './apiService';

// // Função para processar mensagens do Firestore
// const processFirestoreMessage = (firestoreMessage) => {
//   // Se já for um objeto processado, retorne-o
//   if (!firestoreMessage._fieldsProto) {
//     return firestoreMessage;
//   }

//   const fields = firestoreMessage._fieldsProto;

//   return {
//     foto: fields.foto?.stringValue || '',
//     mensagem: fields.mensagem?.stringValue || '',
//     nome: fields.nome?.stringValue || '',
//     userId: fields.userId?.stringValue || '',
//     timestamp: new Date(
//       firestoreMessage._createTime._seconds * 1000
//     ).toISOString(),
//     id: firestoreMessage._ref?._path?.segments?.slice(-1)[0] || '',
//     lido: fields.lido?.booleanValue || false,
//     uidDestinatario: fields.uidDestinatario?.stringValue || ''
//   };
// };

// // Método para buscar todas as mensagens de um usuário
// const fetchAllMessages = async (userId) => {
//   console.debug(`Iniciando busca de todas as mensagens para o usuário com ID: ${userId}...`);
//   console.time(`fetchAllMessages-${userId}`); // Timer para medir o tempo de execução

//   try {
//     const response = await api.get(`/api/messages?userId=${userId}`);
//     const processedMessages = response.data.map(processFirestoreMessage);
//     console.info(`Mensagens processadas com sucesso para o usuário com ID: ${userId}. Total: ${processedMessages.length}`);
//     return processedMessages;
//   } catch (error) {
//     console.error(`Erro ao buscar todas as mensagens para o usuário com ID: ${userId}:`, error.message, error.stack);
//     throw new Error(`Falha ao buscar mensagens: ${error.message}`);
//   } finally {
//     console.timeEnd(`fetchAllMessages-${userId}`);
//   }
// };

// // Método para buscar mensagens de uma conversa específica
// const fetchMessagesByConversation = async (userId1, userId2) => {
//   const conversationId = [userId1, userId2].sort().join('_');
//   console.debug(`Iniciando busca de mensagens para a conversa com ID: ${conversationId}...`);
//   console.time(`fetchMessagesByConversation-${conversationId}`); // Timer para medir o tempo de execução

//   try {
//     const response = await api.get(`/api/messages/${conversationId}`);
//     const processedMessages = (response.data || []).map(processFirestoreMessage);
//     console.info(`Mensagens processadas com sucesso para a conversa com ID: ${conversationId}. Total: ${processedMessages.length}`);
//     return processedMessages;
//   } catch (error) {
//     console.error(`Erro ao buscar mensagens para a conversa com ID: ${conversationId}:`, error.message, error.stack);
//     return [];
//   } finally {
//     console.timeEnd(`fetchMessagesByConversation-${conversationId}`);
//   }
// };

// // Método para buscar uma mensagem específica por ID
// const fetchMessageById = async (uidRemetente, uidDestinatario, messageId) => {
//   console.debug(`Iniciando busca da mensagem com ID: ${messageId} entre ${uidRemetente} e ${uidDestinatario}...`);
//   console.time(`fetchMessageById-${messageId}`); // Timer para medir o tempo de execução

//   try {
//     const response = await api.get(`/api/messages/${uidRemetente}/${uidDestinatario}/${messageId}`);
//     const processedMessage = processFirestoreMessage(response.data);
//     console.info(`Mensagem com ID: ${messageId} processada com sucesso.`);
//     return processedMessage;
//   } catch (error) {
//     console.error(`Erro ao buscar mensagem com ID: ${messageId}:`, error.message, error.stack);
//     throw new Error(`Falha ao buscar mensagem: ${error.message}`);
//   } finally {
//     console.timeEnd(`fetchMessageById-${messageId}`);
//   }
// };

// // Método para enviar uma mensagem
// const sendMessage = async (messageData) => {
//   const conversationId = [messageData.uidRemetente, messageData.uidDestinatario].sort().join('_');
//   console.debug(`Iniciando envio de mensagem para a conversa com ID: ${conversationId}...`);
//   console.time(`sendMessage-${conversationId}`); // Timer para medir o tempo de execução

//   try {
//     const formattedMessage = {
//       conversationId,
//       ...messageData,
//       timestamp: Date.now()
//     };

//     console.info('Mensagem formatada para envio:', formattedMessage);

//     const response = await api.post('/api/messages', formattedMessage);

//     if (!response.data) {
//       throw new Error('Resposta inválida do servidor');
//     }

//     const processedMessage = processFirestoreMessage(response.data);
//     console.info(`Mensagem enviada com sucesso para a conversa com ID: ${conversationId}.`);
//     return processedMessage;
//   } catch (error) {
//     console.error('Erro detalhado ao enviar mensagem:', {
//       error: error.response?.data || error.message,
//       status: error.response?.status,
//       originalMessage: messageData
//     });

//     if (error.response?.data?.error) {
//       throw new Error(`Erro no servidor: ${error.response.data.error}`);
//     }
//     throw new Error('Erro ao enviar mensagem');
//   } finally {
//     console.timeEnd(`sendMessage-${conversationId}`);
//   }
// };

// // Método para marcar uma mensagem como lida
// const markMessageAsRead = async (userId, messageId, type) => {
//   console.debug(`Iniciando marcação da mensagem com ID: ${messageId} como lida para o usuário com ID: ${userId}...`);
//   console.time(`markMessageAsRead-${messageId}`); // Timer para medir o tempo de execução

//   try {
//     const response = await api.post(`/api/messages/${userId}/markAsRead`, {
//       userId,
//       messageId,
//       type
//     });

//     const processedResponse = response.data ? processFirestoreMessage(response.data) : response.data;
//     console.info(`Mensagem com ID: ${messageId} marcada como lida com sucesso.`);
//     return processedResponse;
//   } catch (error) {
//     console.error(`Erro ao marcar mensagem com ID: ${messageId} como lida:`, error.message, error.stack);
//     throw new Error(`Falha ao marcar mensagem como lida: ${error.message}`);
//   } finally {
//     console.timeEnd(`markMessageAsRead-${messageId}`);
//   }
// };

// // Método para deletar uma mensagem
// const deleteMessage = async (messageId, uidRemetente, uidDestinatario) => {
//   console.debug(`Iniciando exclusão da mensagem com ID: ${messageId} entre ${uidRemetente} e ${uidDestinatario}...`);
//   console.time(`deleteMessage-${messageId}`); // Timer para medir o tempo de execução

//   try {
//     const response = await api.delete(`/api/messages/${uidRemetente}/${uidDestinatario}/${messageId}`);
//     console.info(`Mensagem com ID: ${messageId} deletada com sucesso.`);
//     return response.data;
//   } catch (error) {
//     console.error(`Erro ao deletar mensagem com ID: ${messageId}:`, error.message, error.stack);
//     throw new Error(`Falha ao deletar mensagem: ${error.message}`);
//   } finally {
//     console.timeEnd(`deleteMessage-${messageId}`);
//   }
// };

// export default {
//   fetchAllMessages,
//   fetchMessagesByConversation,
//   fetchMessageById,
//   sendMessage,
//   markMessageAsRead,
//   deleteMessage
// };