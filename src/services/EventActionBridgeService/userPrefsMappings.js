// src/services/EventActionBridgeService/userPrefsMappings.js
import { serviceLocator } from '../../core/services/BaseService';
import { USER_PREFS_EVENTS } from '../../core/constants/events';
import { USER_PREFS_ACTIONS } from '../../core/constants/actions';

/**
 * Configura os mapeamentos entre eventos e ações para o serviço de preferências do usuário
 * Esta função será chamada pelo StoreService durante a inicialização
 */
export const setupUserPrefsMappings = (eventBridgeService) => {
  const eventActionBridgeService = eventBridgeService || 
  serviceLocator.get('eventActionBridge');
  eventActionBridgeService.registerMappings([
    // Mapeamento para inicialização de preferências
    {
      serviceName: 'userPreferences',
      eventType: USER_PREFS_EVENTS.PREFS_INITIALIZED,
      actionType: USER_PREFS_ACTIONS.INITIALIZE_SUCCESS,
      transformer: (eventData) => ({
        preferences: eventData.preferences,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para carregamento de preferências
    {
      serviceName: 'userPreferences',
      eventType: USER_PREFS_EVENTS.PREFS_LOADED,
      actionType: USER_PREFS_ACTIONS.LOAD_SUCCESS,
      transformer: (eventData) => ({
        preferences: eventData.preferences,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para atualização de preferências
    {
      serviceName: 'userPreferences',
      eventType: USER_PREFS_EVENTS.PREFS_UPDATED,
      actionType: USER_PREFS_ACTIONS.UPDATE_SUCCESS,
      transformer: (eventData, currentState) => ({
        category: eventData.category,
        values: eventData.values,
        changes: eventData.changes,
        // Preservar dados do usuário
        preserveUserData: true,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para redefinição de preferências
    {
      serviceName: 'userPreferences',
      eventType: USER_PREFS_EVENTS.PREFS_RESET,
      actionType: USER_PREFS_ACTIONS.RESET_SUCCESS,
      transformer: (eventData) => ({
        preferences: eventData.preferences,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para importação de preferências
    {
      serviceName: 'userPreferences',
      eventType: USER_PREFS_EVENTS.PREFS_IMPORTED,
      actionType: USER_PREFS_ACTIONS.IMPORT_SUCCESS,
      transformer: (eventData) => ({
        preferences: eventData.preferences,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para falha em operações de preferências
    {
      serviceName: 'userPreferences',
      eventType: USER_PREFS_EVENTS.PREFS_ERROR,
      actionType: USER_PREFS_ACTIONS.OPERATION_FAILURE,
      transformer: (eventData) => ({
        operation: eventData.operation,
        error: eventData.error,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento específico para consentimento de cookies
    {
      serviceName: 'userPreferences',
      eventType: USER_PREFS_EVENTS.COOKIE_CONSENT_UPDATED,
      actionType: USER_PREFS_ACTIONS.COOKIE_CONSENT_SET,
      transformer: (eventData) => ({
        cookiePreferences: eventData.cookiePreferences,
        consentTimestamp: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento específico para mudança de tema
    {
      serviceName: 'userPreferences',
      eventType: USER_PREFS_EVENTS.THEME_UPDATED,
      actionType: USER_PREFS_ACTIONS.THEME_CHANGED,
      transformer: (eventData) => ({
        themePreferences: eventData.values,
        previousTheme: eventData.previousValues,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento específico para mudança de idioma
    {
      serviceName: 'userPreferences',
      eventType: USER_PREFS_EVENTS.LANGUAGE_UPDATED,
      actionType: USER_PREFS_ACTIONS.LANGUAGE_CHANGED,
      transformer: (eventData) => ({
        languagePreferences: eventData.values,
        previousLanguage: eventData.previousValues,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento específico para mudança de acessibilidade
    {
      serviceName: 'userPreferences',
      eventType: USER_PREFS_EVENTS.ACCESSIBILITY_UPDATED,
      actionType: USER_PREFS_ACTIONS.ACCESSIBILITY_CHANGED,
      transformer: (eventData) => ({
        accessibilityPreferences: eventData.values,
        previousSettings: eventData.previousValues,
        timestamp: eventData.timestamp || Date.now()
      })
    }
  ]);
};