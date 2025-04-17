// src/hooks/notification/useNotificationPolling.js
import { useEffect, useRef } from 'react';
import { coreLogger } from '../../core/logging';
import { globalCache } from '../../utils/cache/cacheManager';
import { NOTIFICATION_CACHE_CONFIG } from '../../core/constants/config';
import { pollingService } from '../../utils/pollingService';

const MODULE_NAME = 'notifications-polling';

/**
 * Hook para gerenciar polling de notificações com gerenciamento inteligente de cache
 * @param {string} userId - ID do usuário para buscar notificações
 * @param {Function} fetchFunction - Função para buscar notificações
 * @param {number} interval - Intervalo de polling em milissegundos
 * @returns {void}
 */
export const useNotificationPolling = (userId, fetchFunction, interval = 30000) => {
  // Referência para manter o ID da tarefa de polling
  const pollingTaskRef = useRef(null);
  
  // Referência para armazenar o número de erros consecutivos
  const errorCountRef = useRef(0);
  
  // Constante para máximo de erros consecutivos
  const MAX_CONSECUTIVE_ERRORS = 5;
  
  // Referência para armazenar o intervalo atual
  const currentIntervalRef = useRef(interval);
  
  // Efeito para gerenciar o polling adaptativo
  useEffect(() => {
    // Atualizar o intervalo se mudar
    if (interval !== currentIntervalRef.current) {
      currentIntervalRef.current = interval;
      
      // Remover tarefa antiga se existir
      if (pollingTaskRef.current) {
        pollingService.removeTask(pollingTaskRef.current);
        pollingTaskRef.current = null;
      }
    }
    
    // Verificar se o usuário está autenticado
    if (!userId) {
      if (pollingTaskRef.current) {
        pollingService.removeTask(pollingTaskRef.current);
        pollingTaskRef.current = null;
      }
      return;
    }
    
    // Função de polling com backoff exponencial em caso de falha
    const pollNotifications = async () => {
      try {
        // Verificar se o cache ainda é fresco
        if (!globalCache.isStale(NOTIFICATION_CACHE_CONFIG.NOTIFICATIONS_KEY)) {
          coreLogger.logEvent(
            MODULE_NAME,
            'POLLING',
            'Pulando polling - cache ainda é fresco',
            { 
              userId,
              cacheAge: Date.now() - (globalCache.getItem(NOTIFICATION_CACHE_CONFIG.NOTIFICATIONS_KEY)?.timestamp || 0),
              staleTime: NOTIFICATION_CACHE_CONFIG.STALE_TIME
            }
          );
          return;
        }
        
        // Cache está obsoleto, buscar novos dados
        coreLogger.logEvent(
          MODULE_NAME,
          'POLLING',
          'Executando polling de notificações',
          { userId }
        );
        
        await fetchFunction();
        
        // Resetar contador de erros em caso de sucesso
        errorCountRef.current = 0;
      } catch (error) {
        // Incrementar contador de erros
        errorCountRef.current++;
        
        coreLogger.logEvent(
          MODULE_NAME,
          'ERROR',
          'Erro durante polling de notificações',
          { 
            userId,
            error: error.message,
            consecutiveErrors: errorCountRef.current
          }
        );
        
        // Se atingiu limite de erros, parar polling para evitar sobrecarga do servidor
        if (errorCountRef.current >= MAX_CONSECUTIVE_ERRORS) {
          coreLogger.logEvent(
            MODULE_NAME,
            'ERROR',
            'Máximo de erros consecutivos atingido, parando polling',
            { 
              userId,
              maxErrors: MAX_CONSECUTIVE_ERRORS
            }
          );
          
          // Remover tarefa de polling
          if (pollingTaskRef.current) {
            pollingService.removeTask(pollingTaskRef.current);
            pollingTaskRef.current = null;
          }
        }
      }
    };
    
    // Iniciar ou atualizar tarefa de polling
    if (!pollingTaskRef.current) {
      // Usar um ID previsível baseado no userId para evitar duplicação
      const taskId = `notifications-polling-${userId}`;
      pollingTaskRef.current = pollingService.addTask(pollNotifications, interval, taskId);
      
      coreLogger.logEvent(
        MODULE_NAME,
        'TASK_ADDED',
        'Tarefa de polling de notificações iniciada',
        { 
          userId,
          interval,
          taskId: pollingTaskRef.current
        }
      );
    }
    
    // Limpeza ao desmontar o componente
    return () => {
      if (pollingTaskRef.current) {
        pollingService.removeTask(pollingTaskRef.current);
        pollingTaskRef.current = null;
        
        coreLogger.logEvent(
          MODULE_NAME,
          'TASK_REMOVED',
          'Tarefa de polling de notificações removida',
          { userId }
        );
      }
    };
  }, [userId, fetchFunction, interval]);
  
  // Não retorna nada, apenas configura o polling
  return;
};