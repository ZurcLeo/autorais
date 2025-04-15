/**
 * Adapta um documento do Firestore para o formato de mensagem esperado pelo sistema
 * @param {Object} message - Documento do Firestore ou objeto de mensagem
 * @param {boolean} isTemporary - Indica se a mensagem é temporária (ainda não confirmada pelo servidor)
 * @returns {Object} Mensagem no formato normalizado
 */

/**
 * Cria um ID temporário para mensagens ainda não confirmadas pelo servidor
 * @param {string} uidRemetente - ID do usuário remetente
 * @param {string} uidDestinatario - ID do usuário destinatário
 * @param {number} timestamp - Timestamp da mensagem
 * @returns {string} ID temporário único
 */
export const createTemporaryMessageId = (uidRemetente, uidDestinatario, timestamp) => {
  return `temp-${uidRemetente}-${uidDestinatario}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Cria uma mensagem temporária para exibição imediata antes da confirmação do servidor
 * @param {Object} message - Dados básicos da mensagem
 * @returns {Object} Mensagem temporária formatada
 */
export const tempMessage = (message) => {
  // A sintaxe estava incorreta - precisa retornar um objeto
  return {
    id: createTemporaryMessageId(
      message.uidRemetente, 
      message.uidDestinatario, 
      message.timestamp || Date.now()
    ),
    conversationId: message.conversationId || [message.uidRemetente, message.uidDestinatario].sort().join('_'),
    uidRemetente: message.uidRemetente,
    uidDestinatario: message.uidDestinatario,
    conteudo: message.conteudo.trim(),
    foto: message.foto || '',
    nome: message.nome || '',
    timestamp: message.timestamp || Date.now(),
    lido: Boolean(message.lido) || false,
    entregue: Boolean(message.entregue) || false,
    visto: Boolean(message.visto) || false,
    tipo: message.tipo || 'texto',
    dataLeitura: null, // Mensagens temporárias sempre têm dataLeitura null
    temporaryId: true,
    sending: true
  };
};

export const adaptMessage = (message, isTemporary = false) => {
  if (!message) return null;
  
  // Se for mensagem temporária, usar a função auxiliar tempMessage
  if (isTemporary) {
    return tempMessage(message);
  }
  
  // Verificar se é um documento do Firestore
  const isFirestoreDoc = message._fieldsProto && typeof message.data === 'function';
  
  let adaptedMessage = {};
  
  if (isFirestoreDoc) {
    // Extrair os dados do documento do Firestore
    try {
      // Usar o método .data() para obter os campos do documento
      const data = message.data();
      const messageId = message.id || data.id; // Obter ID do documento
      
      adaptedMessage = {
        id: messageId,
        conversationId: [data.uidRemetente || data.userId, data.uidDestinatario || data.destinatarioId].sort().join('_'),
        conteudo: data.conteudo || data.mensagem || '',
        uidRemetente: data.uidRemetente || data.userId || '',
        uidDestinatario: data.uidDestinatario || data.destinatarioId || '',
        timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : 
                  data.timestamp instanceof Date ? data.timestamp.getTime() : 
                  data.timestamp || Date.now(),
        dataLeitura: data.dataLeitura?.toMillis ? data.dataLeitura.toMillis() : 
                    data.dataLeitura instanceof Date ? data.dataLeitura.getTime() : 
                    data.dataLeitura || null,
        lido: Boolean(data.lido),
        entregue: Boolean(data.entregue),
        visto: Boolean(data.visto),
        nome: data.nome || '',
        foto: data.foto || '',
        tipo: data.tipo || 'texto'
      };
    } catch (error) {
      console.error('Erro ao adaptar documento do Firestore:', error);
      // Fallback para extração manual em caso de erro com .data()
      const fieldsProto = message._fieldsProto || {};
      const messageId = message.id;
      
      adaptedMessage = {
        id: messageId,
        conversationId: [
          fieldsProto.uidRemetente?.stringValue || fieldsProto.userId?.stringValue || '', 
          fieldsProto.uidDestinatario?.stringValue || fieldsProto.destinatarioId?.stringValue || ''
        ].sort().join('_'),
        conteudo: fieldsProto.conteudo?.stringValue || fieldsProto.mensagem?.stringValue || '',
        uidRemetente: fieldsProto.uidRemetente?.stringValue || fieldsProto.userId?.stringValue || '',
        uidDestinatario: fieldsProto.uidDestinatario?.stringValue || fieldsProto.destinatarioId?.stringValue || '',
        timestamp: fieldsProto.timestamp?.timestampValue ? 
                  new Date(fieldsProto.timestamp.timestampValue).getTime() : Date.now(),
        dataLeitura: fieldsProto.dataLeitura?.timestampValue ? 
                    new Date(fieldsProto.dataLeitura.timestampValue).getTime() : null,
        lido: Boolean(fieldsProto.lido?.booleanValue),
        entregue: Boolean(fieldsProto.entregue?.booleanValue),
        visto: Boolean(fieldsProto.visto?.booleanValue),
        nome: fieldsProto.nome?.stringValue || '',
        foto: fieldsProto.foto?.stringValue || '',
        tipo: fieldsProto.tipo?.stringValue || 'texto'
      };
    }
  } else {
    // Caso já seja um objeto comum (não um documento do Firestore)
    const messageId = message.id || 
                    `${message.uidRemetente || message.userId || ''}-${message.timestamp || Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const uidRemetente = message.uidRemetente || message.userId || '';
    const uidDestinatario = message.uidDestinatario || message.destinatarioId || '';
    
    adaptedMessage = {
      id: messageId,
      conversationId: message.conversationId || [uidRemetente, uidDestinatario].sort().join('_'),
      conteudo: message.conteudo || message.mensagem || '',
      uidRemetente: uidRemetente,
      uidDestinatario: uidDestinatario,
      timestamp: typeof message.timestamp === 'string' 
        ? new Date(message.timestamp).getTime() 
        : message.timestamp || Date.now(),
      dataLeitura: message.dataLeitura 
        ? (typeof message.dataLeitura === 'string' 
            ? new Date(message.dataLeitura).getTime() 
            : message.dataLeitura instanceof Date 
              ? message.dataLeitura.getTime() 
              : typeof message.dataLeitura === 'number'
                ? message.dataLeitura
                : null) 
        : null,
      lido: Boolean(message.lido),
      entregue: Boolean(message.entregue),
      visto: Boolean(message.visto),
      nome: message.nome || '',
      foto: message.foto || '',
      tipo: message.tipo || 'texto'
    };
  }
  
  return adaptedMessage;
};

/**
 * Adapta uma lista de mensagens para o formato normalizado
 * @param {Array} messages - Lista de mensagens
 * @returns {Array} Lista de mensagens adaptadas
 */
export const adaptMessages = (messages) => {
  if (!Array.isArray(messages)) return [];
  return messages.map(msg => adaptMessage(msg)).filter(Boolean);
};