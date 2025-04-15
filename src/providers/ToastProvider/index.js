// src/providers/ToastProvider/index.js
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { toast as reactToastify, ToastContainer } from 'react-toastify';
import { useMediaQuery, useTheme } from '@mui/material';
import CustomToast from '../../components/Common/CustomToast';

const ToastContext = createContext(null);
const MODULE_NAME = 'ToastProvider';

// Número máximo de toasts visíveis simultaneamente
const MAX_VISIBLE_TOASTS = 3;

export const ToastProvider = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeToasts, setActiveToasts] = useState([]);

  // Configurações base adaptadas ao dispositivo
  const baseConfig = useMemo(() => ({
    position: isMobile ? 'bottom-center' : 'bottom-right',
    autoClose: isMobile ? 4000 : 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    limit: MAX_VISIBLE_TOASTS
  }), [isMobile]);

  // Cálculo de duração baseado no conteúdo
  const calculateDuration = useCallback((message, type) => {
    const baseTime = {
      error: 6000,
      warning: 5000,
      success: 4000,
      info: 5000
    }[type] || 5000;
    
    // Algoritmo simples: quanto mais texto, mais tempo (com limite máximo)
    const messageLength = typeof message === 'string' ? message.length : 0;
    const readingTime = Math.min(messageLength * 50, 5000);
    
    return baseTime + readingTime;
  }, []);

  // Função principal de exibição de toast
  const showToast = useCallback((message, options = {}) => {
    const {
      type = 'info',
      autoClose: optionAutoClose,
      onClose,
      priority = 1,
      groupKey,
      animation,
      action,
      ...restOptions
    } = options;

    // Determinar tempo de exibição
    const autoCloseTime = optionAutoClose !== undefined
      ? optionAutoClose
      : calculateDuration(message, type);

    // Criar o toast
    const toastId = reactToastify(
      ({ closeToast }) => (
        <CustomToast
          closeToast={() => {
            if (onClose) {
              onClose();
            }
            closeToast();
          }}
          toastProps={{ 
            message, 
            type, 
            action,
            animation,
            ariaLabel: options.ariaLabel,
            variant: options.variant
          }}
        />
      ),
      {
        ...baseConfig,
        autoClose: autoCloseTime,
        ...restOptions,
      }
    );

    // Gerenciar o estado dos toasts ativos
    setActiveToasts((prev) => {
      const newToast = { 
        id: toastId, 
        message, 
        type, 
        priority, 
        groupKey, 
        timestamp: Date.now() 
      };
      
      // Se houver uma chave de grupo, substituir toasts existentes do mesmo grupo
      const filteredToasts = groupKey ? 
        prev.filter(t => t.groupKey !== groupKey) : 
        prev;
        
      // Adicionar o novo toast e ordenar por prioridade
      return [...filteredToasts, newToast].sort((a, b) => b.priority - a.priority);
    });

    return toastId;
  }, [baseConfig, calculateDuration]);

  // Toast para notificações agrupadas
  const showGroupedToast = useCallback((messages, options = {}) => {
    const { groupKey, groupMax = 3 } = options;
    
    if (!groupKey) {
      return showToast(messages[0], options);
    }
    
    const existingToasts = activeToasts.filter(t => t.groupKey === groupKey);
    
    if (existingToasts.length > 0 && existingToasts.length >= groupMax) {
      // Atualizar o toast existente com contagem
      const firstToast = existingToasts[0];
      reactToastify.update(firstToast.id, {
        render: ({ closeToast }) => (
          <CustomToast
            closeToast={closeToast}
            toastProps={{
              type: options.type || 'info',
              message: `${messages.length} novas notificações`,
              action: {
                label: 'Ver todas',
                onClick: () => {
                  if (options.onViewAll) {
                    options.onViewAll();
                  }
                  closeToast();
                }
              }
            }}
          />
        ),
        autoClose: options.autoClose || baseConfig.autoClose
      });
      return firstToast.id;
    }
    
    // Caso contrário, criar um novo toast
    return showToast(messages[0], options);
  }, [showToast, activeToasts, baseConfig.autoClose]);

  // Toast para promises com estados de loading, sucesso e erro
  const showPromiseToast = useCallback(async (promise, messages, options = {}) => {
    const { type: initialType, ...initialOptions } = options;
    const id = showToast(messages.loading || 'Processando...', {
      type: initialType || 'info',
      isLoading: true,
      autoClose: false,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
      ...initialOptions,
    });

    try {
      const result = await promise;
      reactToastify.update(id, {
        render: ({ closeToast }) => (
          <CustomToast
            closeToast={closeToast}
            toastProps={{
              type: 'success',
              message: messages.success || 'Concluído com sucesso!',
              animation: 'success',
              ...options,
            }}
          />
        ),
        type: 'success',
        isLoading: false,
        autoClose: options.autoClose || calculateDuration(messages.success || 'Concluído com sucesso!', 'success'),
        closeOnClick: true,
      });
      return result;
    } catch (error) {
      const errorMessage = messages.error || error?.message || 'Ocorreu um erro.';
      
      reactToastify.update(id, {
        render: ({ closeToast }) => (
          <CustomToast
            closeToast={closeToast}
            toastProps={{
              type: 'error',
              message: errorMessage,
              animation: 'error',
              action: options.errorAction
                ? {
                    label: options.errorAction.label,
                    onClick: () => {
                      closeToast();
                      options.errorAction.onClick?.();
                    },
                  }
                : undefined,
            }}
          />
        ),
        type: 'error',
        isLoading: false,
        autoClose: options.autoClose || calculateDuration(errorMessage, 'error'),
        closeOnClick: true,
      });
      throw error;
    }
  }, [showToast, calculateDuration]);

  // Toast com informações contextuais
  const showContextualToast = useCallback((message, context, options = {}) => {
    const contextConfigs = {
      transactionSuccess: {
        type: 'success',
        duration: 7000,
        priority: 3,
        animation: 'success',
        variant: 'highlighted'
      },
      authError: {
        type: 'error',
        duration: 8000,
        priority: 4,
        animation: 'error',
        variant: 'critical'
      },
      notification: {
        type: 'info',
        duration: 5000,
        priority: 2,
        animation: 'pulse'
      },
      // Adicione mais contextos conforme necessário
    };
    
    const contextConfig = contextConfigs[context] || {};
    return showToast(message, { ...contextConfig, ...options });
  }, [showToast]);

  // Limitar o número de toasts ativos
  useEffect(() => {
    if (activeToasts.length > MAX_VISIBLE_TOASTS) {
      // Ordenar por prioridade (menor primeiro) e timestamp (mais antigo primeiro)
      const toastsToRemove = [...activeToasts]
        .sort((a, b) => {
          if (a.priority !== b.priority) return a.priority - b.priority;
          return a.timestamp - b.timestamp;
        })
        .slice(0, activeToasts.length - MAX_VISIBLE_TOASTS);
      
      // Remover os toasts excedentes
      toastsToRemove.forEach(toast => {
        reactToastify.dismiss(toast.id);
      });
      
      // Atualizar estado
      setActiveToasts(prev => prev.filter(
        toast => !toastsToRemove.some(t => t.id === toast.id)
      ));
    }
  }, [activeToasts]);

  // Expor todos os métodos e estados do contexto
  const contextValue = {
    showToast,
    showPromiseToast,
    showGroupedToast,
    showContextualToast,
    activeToasts,
    clearToast: reactToastify.dismiss,
    clearAllToasts: reactToastify.dismissAll,
    updateToast: reactToastify.update,
    isActive: reactToastify.isActive,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      <ToastContainer {...baseConfig} />
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};