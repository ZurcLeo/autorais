// src/hooks/notification/useNotificationPolling.js
import { useEffect, useRef } from 'react';
import { coreLogger } from '../../core/logging';
import { pollingService } from '../../utils/pollingService';

const MODULE_NAME = 'notifications';

/**
 * Hook para gerenciar o polling de notificações
 * @param {string} userId - ID do usuário
 * @param {Function} fetchNotifications - Função para buscar notificações
 * @param {number} pollingInterval - Intervalo de polling em milissegundos
 */
export const useNotificationPolling = (userId, fetchNotifications, pollingInterval = 30000) => {
  const pollingServiceRef = useRef(pollingService);
  const lastPollRef = useRef(0);
  
  useEffect(() => {
    // Não iniciar polling sem userId
    if (!userId || !fetchNotifications) {
      return;
    }

    // Função que executa o polling
    const poll = async () => {
      // Não executar polling se a página não estiver visível
      if (document.visibilityState !== 'visible') {
        return;
      }
      
      // Verificar se já se passou pelo menos meio intervalo desde o último poll
      const now = Date.now();
      if (now - lastPollRef.current < pollingInterval / 2) {
        return;
      }
      
      try {
        coreLogger.logEvent(
          MODULE_NAME,
          'POLLING',
          'Executando polling de notificações',
          { userId, timestamp: now }
        );
        
        await fetchNotifications();
        lastPollRef.current = now;
      } catch (error) {
        coreLogger.logEvent(
          MODULE_NAME,
          'ERROR',
          'Erro no polling de notificações',
          { userId, error: error.message }
        );
        // Não interromper o polling em caso de erro
      }
    };

    // Executar imediatamente na primeira vez
    poll();

    // Adicionar a tarefa ao polling service
    const taskId = pollingServiceRef.current.addTask(poll, pollingInterval, `notifications-${userId}`);
    
    // Lidar com a visibilidade da página para executar imediatamente quando a aba ficar visível
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        poll();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Limpeza ao desmontar
    return () => {
      pollingServiceRef.current.removeTask(taskId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      coreLogger.logEvent(
        MODULE_NAME,
        'LIFECYCLE',
        'Polling de notificações interrompido',
        { userId }
      );
    };
  }, [userId, fetchNotifications, pollingInterval]);
};