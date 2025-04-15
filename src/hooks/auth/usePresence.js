// src/hooks/usePresence.js
import { useState, useEffect, useCallback } from 'react';
import socket from '../../services/socketService';
import { serviceLocator } from '../../core/services/BaseService';

/**
 * Hook para gerenciar status de presença dos usuários
 * @returns {Object} Métodos e estado para trabalhar com presença
 */
export const usePresence = () => {
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Obter o usuário atual do serviço auth
  const authStore = serviceLocator.get('store').getState()?.auth || {};
  const { currentUser } = authStore;
  
  // Inicializar os listeners do socket para status de presença
  useEffect(() => {
    if (!socket || !currentUser?.uid) return;
    
    const handleUserOnline = (data) => {
      if (!data || !data.userId) return;
      
      setOnlineUsers(prevUsers => {
        const newUsers = new Map(prevUsers);
        newUsers.set(data.userId, {
          online: true,
          status: data.status || 'online',
          lastActivity: data.lastActivity || Date.now(),
          timestamp: data.timestamp || Date.now()
        });
        return newUsers;
      });
    };
    
    const handleUserOffline = (data) => {
      if (!data || !data.userId) return;
      
      setOnlineUsers(prevUsers => {
        const newUsers = new Map(prevUsers);
        newUsers.set(data.userId, {
          online: false,
          status: 'offline',
          lastActivity: data.lastActivity,
          lastSeen: data.timestamp || Date.now()
        });
        return newUsers;
      });
    };
    
    const handleStatusChange = (data) => {
      if (!data || !data.userId) return;
      
      setOnlineUsers(prevUsers => {
        const newUsers = new Map(prevUsers);
        const currentStatus = newUsers.get(data.userId) || {};
        
        newUsers.set(data.userId, {
          ...currentStatus,
          status: data.status,
          online: data.status !== 'offline',
          lastActivity: Date.now()
        });
        return newUsers;
      });
    };
    
    const handleOnlineUsersList = (data) => {
      if (!data || !Array.isArray(data.users)) return;
      
      const newOnlineUsers = new Map();
      
      // Processar a lista recebida do servidor
      data.users.forEach(user => {
        if (user && user.userId) {
          newOnlineUsers.set(user.userId, {
            online: true,
            status: user.status || 'online',
            lastActivity: user.lastActivity || Date.now()
          });
        }
      });
      
      setOnlineUsers(newOnlineUsers);
      setIsInitialized(true);
    };
    
    // Registrar listeners
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('user_status_change', handleStatusChange);
    socket.on('online_users_list', handleOnlineUsersList);
    
    // Solicitar lista inicial de usuários online
    socket.emit('get_online_users');
    
    // Cleanup
    return () => {
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      socket.off('user_status_change', handleStatusChange);
      socket.off('online_users_list', handleOnlineUsersList);
    };
  }, [currentUser]);
  
  // Função para verificar se um usuário está online
  const isUserOnline = useCallback((userId) => {
    if (!userId) return false;
    const userStatus = onlineUsers.get(userId);
    return Boolean(userStatus?.online);
  }, [onlineUsers]);
  
  // Função para obter o status completo de um usuário
  const getUserStatus = useCallback((userId) => {
    if (!userId) return null;
    return onlineUsers.get(userId) || null;
  }, [onlineUsers]);
  
  // Função para atualizar seu próprio status
  const updateMyStatus = useCallback((newStatus) => {
    if (!socket || !currentUser?.uid) return false;
    
    // Validar status permitidos
    const allowedStatuses = ['online', 'away', 'busy', 'invisible', 'offline'];
    if (!allowedStatuses.includes(newStatus)) {
      console.warn('Status inválido:', newStatus);
      return false;
    }
    
    // Enviar atualização para o servidor
    socket.emit('user_status_change', { status: newStatus });
    
    // Atualizar também localmente
    setOnlineUsers(prevUsers => {
      const newUsers = new Map(prevUsers);
      const currentStatus = newUsers.get(currentUser.uid) || {};
      
      newUsers.set(currentUser.uid, {
        ...currentStatus,
        status: newStatus,
        online: newStatus !== 'offline',
        lastActivity: Date.now()
      });
      return newUsers;
    });
    
    return true;
  }, [currentUser, socket]);
  
  // Função para solicitar a lista de usuários online
  const refreshOnlineUsers = useCallback((specificUserIds = null) => {
    if (!socket) return;
    
    if (specificUserIds && Array.isArray(specificUserIds)) {
      socket.emit('get_online_users', { userIds: specificUserIds });
    } else {
      socket.emit('get_online_users');
    }
  }, []);
  
  return {
    onlineUsers,
    isUserOnline,
    getUserStatus,
    updateMyStatus,
    refreshOnlineUsers,
    isInitialized
  };
};