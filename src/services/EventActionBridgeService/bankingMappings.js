// src/services/EventActionBridgeService/bankingMappings.js
import { serviceLocator } from '../../core/services/BaseService';
import { BANKING_EVENTS } from '../../core/constants/events';
import { BANKING_ACTIONS } from '../../core/constants/actions';

export const setupBankingMappings = (eventBridgeService) => {
  const eventActionBridgeService = eventBridgeService || 
    serviceLocator.get('eventActionBridge');

  eventActionBridgeService.registerMappings([
    // Mapeamento para eventos de busca
    {
      serviceName: 'banking',
      eventType: BANKING_EVENTS.FETCH_START,
      actionType: BANKING_ACTIONS.FETCH_START,
      transformer: () => ({})
    },
    {
      serviceName: 'banking',
      eventType: BANKING_EVENTS.BANKING_INFO_FETCHED,
      actionType: BANKING_ACTIONS.FETCH_SUCCESS,
      transformer: (eventData) => ({
        bankingInfo: eventData.bankingInfo || null
      })
    },
    {
      serviceName: 'banking',
      eventType: BANKING_EVENTS.BANKING_HISTORY_FETCHED,
      actionType: BANKING_ACTIONS.UPDATE_BANKING_HISTORY,
      transformer: (eventData) => ({
        history: eventData.history || []
      })
    },
    {
      serviceName: 'banking',
      eventType: BANKING_EVENTS.FETCH_FAILURE,
      actionType: BANKING_ACTIONS.FETCH_FAILURE,
      transformer: (eventData) => ({
        error: eventData.error || 'Erro desconhecido ao buscar dados bancários'
      })
    },
    
    // Mapeamento para eventos de registro
    {
      serviceName: 'banking',
      eventType: BANKING_EVENTS.REGISTER_START,
      actionType: BANKING_ACTIONS.REGISTER_START,
      transformer: () => ({})
    },
    {
      serviceName: 'banking',
      eventType: BANKING_EVENTS.ACCOUNT_REGISTERED,
      actionType: BANKING_ACTIONS.REGISTER_SUCCESS,
      transformer: (eventData) => ({
        accountData: eventData.accountData || null
      })
    },
    {
      serviceName: 'banking',
      eventType: BANKING_EVENTS.REGISTER_FAILURE,
      actionType: BANKING_ACTIONS.REGISTER_FAILURE,
      transformer: (eventData) => ({
        error: eventData.error || 'Erro desconhecido ao registrar conta bancária'
      })
    },
    
    // Mapeamento para eventos de validação
    {
      serviceName: 'banking',
      eventType: BANKING_EVENTS.VALIDATE_START,
      actionType: BANKING_ACTIONS.VALIDATE_START,
      transformer: () => ({})
    },
    {
      serviceName: 'banking',
      eventType: BANKING_EVENTS.ACCOUNT_VALIDATED,
      actionType: BANKING_ACTIONS.VALIDATE_SUCCESS,
      transformer: (eventData) => ({
        result: eventData.result || {}
      })
    },
    {
      serviceName: 'banking',
      eventType: BANKING_EVENTS.VALIDATE_FAILURE,
      actionType: BANKING_ACTIONS.VALIDATE_FAILURE,
      transformer: (eventData) => ({
        error: eventData.error || 'Erro desconhecido ao validar conta bancária'
      })
    },
    
    // Mapeamento para eventos de transferência
    {
      serviceName: 'banking',
      eventType: BANKING_EVENTS.TRANSFER_START,
      actionType: BANKING_ACTIONS.TRANSFER_START,
      transformer: () => ({})
    },
    {
      serviceName: 'banking',
      eventType: BANKING_EVENTS.FUNDS_TRANSFERRED,
      actionType: BANKING_ACTIONS.TRANSFER_SUCCESS,
      transformer: (eventData) => ({
        result: eventData.result || {}
      })
    },
    {
      serviceName: 'banking',
      eventType: BANKING_EVENTS.TRANSFER_FAILURE,
      actionType: BANKING_ACTIONS.TRANSFER_FAILURE,
      transformer: (eventData) => ({
        error: eventData.error || 'Erro desconhecido ao transferir fundos'
      })
    },
    
    // Mapeamento para eventos de cancelamento
    {
      serviceName: 'banking',
      eventType: BANKING_EVENTS.CANCEL_START,
      actionType: BANKING_ACTIONS.CANCEL_START,
      transformer: () => ({})
    },
    {
      serviceName: 'banking',
      eventType: BANKING_EVENTS.TRANSACTION_CANCELED,
      actionType: BANKING_ACTIONS.CANCEL_SUCCESS,
      transformer: (eventData) => ({
        result: eventData.result || {}
      })
    },
    {
      serviceName: 'banking',
      eventType: BANKING_EVENTS.CANCEL_FAILURE,
      actionType: BANKING_ACTIONS.CANCEL_FAILURE,
      transformer: (eventData) => ({
        error: eventData.error || 'Erro desconhecido ao cancelar transação'
      })
    },
    
    // Mapeamento para limpeza de estado
    {
      serviceName: 'banking',
      eventType: BANKING_EVENTS.CLEAR_BANKING_DATA,
      actionType: BANKING_ACTIONS.CLEAR_STATE,
      transformer: () => ({})
    },
    
    // Mapeamento para obtenção de detalhes de transação
    {
      serviceName: 'banking',
      eventType: 'TRANSACTION_DETAILS_FETCHED',
      actionType: 'banking/TRANSACTION_DETAILS_FETCHED',
      transformer: (eventData) => ({
        transactionDetails: eventData.details || {}
      })
    },
    
    // Mapeamento para atualização de status de transação
    {
      serviceName: 'banking',
      eventType: 'TRANSACTION_STATUS_UPDATED',
      actionType: 'banking/TRANSACTION_STATUS_UPDATED',
      transformer: (eventData) => ({
        transactionId: eventData.transactionId,
        status: eventData.status,
        updatedAt: eventData.updatedAt || new Date().toISOString()
      })
    },
    
    // Mapeamento para saldo atualizado
    {
      serviceName: 'banking',
      eventType: 'BALANCE_UPDATED',
      actionType: 'banking/BALANCE_UPDATED',
      transformer: (eventData) => ({
        accountId: eventData.accountId,
        previousBalance: eventData.previousBalance,
        currentBalance: eventData.currentBalance,
        updatedAt: eventData.updatedAt || new Date().toISOString()
      })
    },
    
    // Mapeamento para erros de transação específicos
    {
      serviceName: 'banking',
      eventType: 'INSUFFICIENT_FUNDS_ERROR',
      actionType: 'banking/TRANSACTION_ERROR',
      transformer: (eventData) => ({
        errorType: 'INSUFFICIENT_FUNDS',
        message: eventData.message || 'Fundos insuficientes para completar a transação',
        transactionId: eventData.transactionId
      })
    },
    
    // Mapeamento para notificações bancárias
    {
      serviceName: 'banking',
      eventType: 'BANKING_NOTIFICATION_RECEIVED',
      actionType: 'banking/NOTIFICATION_RECEIVED',
      transformer: (eventData) => ({
        notificationType: eventData.type,
        message: eventData.message,
        priority: eventData.priority || 'normal',
        timestamp: eventData.timestamp || new Date().toISOString()
      })
    }
  ]);
};