// src/services/EventActionBridgeService/authMappings.js
import { serviceLocator } from '../../core/services/BaseService';
import { AUTH_EVENTS } from '../../core/constants/events';
import { AUTH_ACTIONS } from '../../core/constants/actions';

export const setupAuthMappings = (eventBridgeService) => {

  const eventActionBridgeService = eventBridgeService || 
  serviceLocator.get('eventActionBridge');

  eventActionBridgeService.registerMappings([
    // Mapeamento para autenticação bem-sucedida
    {
      serviceName: 'auth',
      eventType: AUTH_EVENTS.FIRST_ACCESS_DETECTED,
      actionType: AUTH_ACTIONS.SET_FIRST_ACCESS,
      transformer: (eventData) => ({
        isFirstAccess: true,
        user: eventData.user,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    {
      serviceName: 'auth',
      eventType: AUTH_EVENTS.FIRST_ACCESS_NEEDED,
      actionType: AUTH_ACTIONS.SET_PROFILE_UPDATE_NEEDED,
      transformer: (eventData) => ({
        needsProfileUpdate: true,
        reason: eventData.reason,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    {
      serviceName: 'auth',
      eventType: AUTH_EVENTS.AUTH_SESSION_VALID,
      actionType: AUTH_ACTIONS.LOGIN_SUCCESS,
      transformer: (eventData) => ({
        success: true,
        user: eventData.user,
        isAuthenticated: true,
        authLoading: false,
        userId: eventData.userId,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    // Mapeamento alternativo para eventos AUTH_LOGIN_COMPLETED
    {
      serviceName: 'auth',
      eventType: AUTH_EVENTS.AUTH_LOGIN_COMPLETED,
      actionType: AUTH_ACTIONS.LOGIN_SUCCESS,
      transformer: (eventData) => ({
        success: eventData.success || true,
        user: eventData.user,
        isAuthenticated: true,
        authLoading: false,
        // userLoading: false,
        userId: eventData.userId,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    // Mapeamento para logout
    {
      serviceName: 'auth',
      eventType: AUTH_EVENTS.USER_SIGNED_OUT,
      actionType: AUTH_ACTIONS.LOGOUT,
      transformer: (eventData) => ({
        previousUserId: eventData.previousUserId,
        reason: eventData.reason || 'user_initiated',
        isAuthenticated: false,
        authLoading: false,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    // Mapeamento alternativo para logout completado
    {
      serviceName: 'auth',
      eventType: AUTH_EVENTS.AUTH_LOGOUT_COMPLETED,
      actionType: AUTH_ACTIONS.LOGOUT,
      transformer: (eventData) => ({
        previousUserId: eventData.previousUserId,
        reason: eventData.reason || 'user_initiated',
        isAuthenticated: false,
        authLoading: false,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    // Mapeamento para erro de autenticação
    {
      serviceName: 'auth',
      eventType: AUTH_EVENTS.AUTH_ERROR,
      actionType: AUTH_ACTIONS.LOGIN_FAILURE,
      transformer: (eventData) => ({
        error: eventData.error || 'Unknown authentication error',
        code: eventData.code || 'unknown',
        isAuthenticated: false,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    // Mapeamento para sessão expirada
    {
      serviceName: 'auth',
      eventType: AUTH_EVENTS.SESSION_EXPIRED,
      actionType: AUTH_ACTIONS.LOGIN_EXPIRED,
      transformer: (eventData) => ({
        reason: 'session_expired',
        isAuthenticated: false,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    // Mapeamento para sessão inválida
    {
      serviceName: 'auth',
      eventType: AUTH_EVENTS.AUTH_SESSION_INVALID,
      actionType: AUTH_ACTIONS.LOGIN_EXPIRED,
      transformer: (eventData) => ({
        reason: eventData.reason || 'session_invalid',
        isAuthenticated: false,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    // Mapeamento para início do login
    {
      serviceName: 'auth',
      eventType: AUTH_EVENTS.AUTH_LOGIN_START,
      actionType: AUTH_ACTIONS.LOGIN_START,
      transformer: (eventData) => ({
        payload: eventData,
        timestamp: eventData.timestamp || Date.now()
      })
    }
  ]);
};