const pendingOperations = {}; // Objeto para rastrear operações pendentes por id

export const syncStateUpdate = async (operation, options) => {
  if (!options || !options.id) {
    console.warn("syncStateUpdate chamada sem um id de operação. Isso pode levar a problemas de concorrência.");
    return operation(); // Se não tiver id, executa sem sincronização (cuidado!)
  }

  const { id } = options;

  if (pendingOperations[id]) {
    // Já existe uma operação pendente com este ID, espere ela terminar
    return pendingOperations[id].then(() => operation()); // Encadeia a nova operação após a anterior
  }

  // Inicia a operação e armazena a promessa
  const operationPromise = operation();
  pendingOperations[id] = operationPromise;

  try {
    const result = await operationPromise;
    return result;
  } catch (error) {
    throw error; // Re-lança o erro para ser tratado no contexto de uso
  } finally {
    delete pendingOperations[id]; // Remove a operação da lista de pendentes quando terminar (ou falhar)
  }
};