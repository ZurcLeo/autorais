// src/middleware/serviceEventMiddleware.js
import { serviceEventHub } from '../services/BaseService';
import { SERVICE_ACTIONS } from '../constants/actions';

export const createServiceEventMiddleware = (store) => {
  // Mapeamento de eventos para ações Redux
  const eventToActionMap = {
    'service/SERVICE_INIT': SERVICE_ACTIONS.SERVICE_INIT,
    'service/SERVICE_READY': SERVICE_ACTIONS.SERVICE_READY,
    'service/SERVICE_ERROR': SERVICE_ACTIONS.SERVICE_ERROR,
    'service/SERVICE_STOPPED': SERVICE_ACTIONS.SERVICE_STOPPED,
    // adicione outros mapeamentos conforme necessário
  };

  // Registrar listener global para todos os eventos
  serviceEventHub.onAny('*', (serviceName, eventType, data) => {
    const actionType = eventToActionMap[eventType];
    if (actionType) {
      store.dispatch({
        type: actionType,
        payload: {
          ...data,
          serviceName
        }
      });
    }
  });

  // Middleware Redux vazio - a verdadeira lógica está acima
  return next => action => {
    return next(action);
  };
};