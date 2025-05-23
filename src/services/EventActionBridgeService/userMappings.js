// src/services/EventActionBridgeService/userMappings.js
import { serviceLocator } from '../../core/services/BaseService';
import { USER_EVENTS, AUTH_EVENTS } from '../../core/constants/events';
import { USER_ACTIONS, AUTH_ACTIONS } from '../../core/constants/actions';

export const setupUserMappings = (eventBridgeService) => {

  const eventActionBridgeService = eventBridgeService || 
  serviceLocator.get('eventActionBridge');

  eventActionBridgeService.registerMappings([
    // Mapeamento para quando o serviço começa a buscar dados do usuário
    {
      serviceName: 'auth',
      eventType: AUTH_EVENTS.USER_SIGNED_IN,
      actionType: USER_ACTIONS.USER_PROFILE_COMPLETE,
      transformer: (eventData) => {
        console.log('[EventActionBridge] USER_SIGNED_IN -> USER_PROFILE_COMPLETE transform', eventData);
        return {
          userId: eventData.userId || (eventData.user && eventData.user.uid),
          user: eventData.user,
          currentUser: eventData.user,
          email: eventData.email,
          isAuthenticated: true,
          needsProfileUpdate: false,
          needsProfileCompletion: false,
          authLoading: false,
          userLoading: false,
          recoveryAttempt: true,
          timestamp: eventData.timestamp || Date.now()
        };
      }
    },
    {
      serviceName: 'user',
      eventType: USER_EVENTS.PROFILE_UPDATE_NEEDED,
      actionType: USER_ACTIONS.SET_PROFILE_UPDATE_NEEDED,
      transformer: (eventData) => ({
        needsProfileUpdate: true,
        userId: eventData.userId,
        userLoading: false,
        reason: eventData.reason,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para conclusão de perfil
    {
      serviceName: 'user',
      eventType: USER_EVENTS.PROFILE_COMPLETED,
      actionType: USER_ACTIONS.USER_PROFILE_COMPLETE,
      transformer: (eventData) => ({
        needsProfileUpdate: false,
        userLoading: false,
        isProfileComplete: true,
        userId: eventData.userId,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    {
      serviceName: 'user',
      eventType: USER_EVENTS.USER_SESSION_READY,
      actionType: USER_ACTIONS.FETCH_USER_SUCCESS,
      transformer: (eventData) => ({
        user: eventData.user,  // <-- Adicionar dados em profile
        usersById: eventData.usersById || {}, 
        userLoading: false,
        isAuthenticated: true,
        error: null,  // <-- Adicionado
        lastUpdated: eventData.timestamp || Date.now()  // <-- Alterado de timestamp para lastUpdated
      })
    },
    
    // Mapeamento para usuário com perfil completo
    {
      serviceName: 'user',
      eventType: USER_EVENTS.USER_SIGN_IN,
      actionType: USER_ACTIONS.USER_PROFILE_COMPLETE,
      transformer: (eventData) => ({
        needsProfileUpdate: false,
        isProfileComplete: true,
        userLoading: false,
        user: eventData.user,
        userId: eventData.userId,
        isComplete: true,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento para usuário novo ou com perfil incompleto
    {
      serviceName: 'user',
      eventType: USER_EVENTS.NEW_USER_SIGN_IN,
      actionType: USER_ACTIONS.USER_PROFILE_INCOMPLETE,
      transformer: (eventData) => ({
        userId: eventData.userId,
        user: eventData.user,
        userLoading: false,
        isNewUser: eventData.isNewUser || true,
        needsProfileCompletion: eventData.needsProfileCompletion || true,
        timestamp: eventData.timestamp || Date.now()
      })
    },
  
    // Mapeamento quando um perfil é atualizado
    {
      serviceName: 'user',
      eventType: USER_EVENTS.PROFILE_UPDATED,
      actionType: USER_ACTIONS.UPDATE_SUCCESS,
      transformer: (eventData) => ({
        user: eventData.user,
        userId: eventData.userId,
        userLoading: false,
        updatedFields: eventData.updatedFields || Object.keys(eventData.user || {}),
        timestamp: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento quando uma imagem de perfil é atualizada
    {
      serviceName: 'user',
      eventType: USER_EVENTS.PROFILE_PICTURE_UPDATED,
      actionType: USER_ACTIONS.UPDATE_SUCCESS,
      transformer: (eventData) => ({
        userId: eventData.userId,
        userLoading: false,
        user: { fotoDoPerfil: eventData.pictureUrl },
        updatedFields: ['fotoDoPerfil'],
        timestamp: eventData.timestamp || Date.now()
      })
    },
    // Adicionar um novo mapeamento no setupUserMappings em userMappings.js
{
  serviceName: 'user',
  eventType: USER_EVENTS.PROFILE_FETCHED,
  actionType: USER_ACTIONS.FETCH_USER_SUCCESS,
  transformer: (eventData) => {
    const userId = eventData.userId || (eventData.user && (eventData.user.uid || eventData.user.id));
    const userData = eventData.user || eventData.payload;
    
    // Importante: Construir usersById corretamente
    const usersById = {};
    if (userId && userData) {
      usersById[userId] = userData;
    }
    
    return {
      user: userData,
      usersById: usersById,
      userLoading: false,
      isAuthenticated: true,
      error: null,
      lastUpdated: Date.now()
    };
  }
},
    // Mapeamento quando um usuário é excluído
    {
      serviceName: 'user',
      eventType: USER_EVENTS.USER_DELETED,
      actionType: USER_ACTIONS.DELETE_SUCCESS,
      transformer: (eventData) => ({
        userId: eventData.userId,
        userLoading: false,
        timestamp: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento quando um usuário é adicionado
    {
      serviceName: 'user',
      eventType: USER_EVENTS.USER_ADDED,
      actionType: USER_ACTIONS.FETCH_USER_SUCCESS,
      transformer: (eventData) => ({
        user: eventData.user,
        usersById: eventData.usersById || {},
        userLoading: false,
        isAuthenticated: true,
        error: null,
        lastUpdated: eventData.timestamp || Date.now()
      })
    },
    
    // Mapeamento quando o usuário faz logout
    {
      serviceName: 'auth',
      eventType: AUTH_EVENTS.USER_SIGNED_OUT,
      actionType: USER_ACTIONS.CLEAR_USER,
      transformer: (eventData) => ({
        timestamp: eventData.timestamp || Date.now(),
        userLoading: false,
      })
    },
    
    // Mapeamento para quando o auth envia LOGOUT (para compatibilidade)
    {
      serviceName: 'auth',
      eventType: AUTH_EVENTS.AUTH_LOGOUT_COMPLETED,
      actionType: USER_ACTIONS.CLEAR_USER,
      transformer: (eventData) => ({
        timestamp: eventData.timestamp || Date.now(),
        userLoading: false,
      })
    }
  ]);
  console.log('[UserMappings] User mappings registered successfully');
};