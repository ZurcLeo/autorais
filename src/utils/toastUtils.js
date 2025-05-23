// src/utils/toastUtils.js
import { toast } from 'react-toastify';
import CustomToast from '../components/Common/CustomToast';

// Configurações base para diferentes dispositivos
const getBaseConfig = () => {
  const isMobile = window.innerWidth < 600;
  
  return {
    position: isMobile ? 'bottom-center' : 'bottom-right',
    autoClose: isMobile ? 4000 : 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    limit: 3 // Limita o número de toasts visíveis simultaneamente
  };
};

// Cálculo de duração baseado no conteúdo
const calculateDuration = (message, type) => {
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
};

// Toast básico
export const showToast = (message, options = {}) => {

  const {
    type = 'info',
    autoClose,
    animation,
    action,
    variant,
    onClose,
    ...restOptions
  } = options;
  console.log("Mensagem recebida pelo CustomToast:", message);

  // Determinar tempo de exibição
  const autoCloseTime = autoClose !== undefined
    ? autoClose
    : calculateDuration(message, type);

  // Criar o toast
  return toast(
    ({ closeToast }) => (
      <CustomToast
        closeToast={() => {
          if (onClose) onClose();
          closeToast();
        }}
        toastProps={{ 
          message, 
          type, 
          action,
          animation,
          variant
        }}
      />
    ),
    {
      ...getBaseConfig(),
      type,
      autoClose: autoCloseTime,
      ...restOptions
    }
  );
};

// Toast para promises (carregamento, sucesso e erro)
export const showPromiseToast = async (promise, messages, options = {}) => {
  const { type: initialType, ...initialOptions } = options;
  
  // Toast de loading
  const id = showToast(messages.loading || "Processando...", {
    type: initialType || 'info',
    isLoading: true,
    autoClose: false,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false,
    ...initialOptions
  });

  try {
    // Aguardar a promise
    const result = await promise;
    
    // Atualizar para toast de sucesso
    toast.update(id, {
      render: ({ closeToast }) => (
        <CustomToast
          closeToast={closeToast}
          toastProps={{
            type: 'success',
            message: messages.success || 'Concluído com sucesso!',
            animation: 'success',
            ...options
          }}
        />
      ),
      type: 'success',
      isLoading: false,
      autoClose: options.autoClose || calculateDuration(messages.success || 'Concluído com sucesso!', 'success'),
      closeOnClick: true,
      hideProgressBar: false,
      draggable: true
    });
    
    return result;
  } catch (error) {
    // Capturar a mensagem de erro
    const errorMessage = messages.error || error?.message || 'Ocorreu um erro.';
    
    // Atualizar para toast de erro
    toast.update(id, {
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
                  }
                }
              : undefined
          }}
        />
      ),
      type: 'error',
      isLoading: false,
      autoClose: options.autoClose || calculateDuration(errorMessage, 'error'),
      closeOnClick: true,
      hideProgressBar: false,
      draggable: true
    });
    
    throw error;
  }
};

// Toast contextual para casos específicos
export const showContextualToast = (message, context, options = {}) => {
  const contextConfigs = {
    transactionSuccess: {
      type: 'success',
      autoClose: 7000,
      animation: 'success',
      variant: 'highlighted'
    },
    authError: {
      type: 'error',
      autoClose: 8000,
      animation: 'error',
      variant: 'critical'
    },
    notification: {
      type: 'info',
      autoClose: 5000,
      animation: 'pulse'
    },
    invitationSuccess: {
      type: 'success',
      autoClose: 6000,
      animation: 'success',
      variant: 'highlighted'
    },
    invitationError: {
      type: 'error',
      autoClose: 7000,
      animation: 'error'
    },
    // Adicione mais contextos conforme necessário
  };
  
  const contextConfig = contextConfigs[context] || {};
  return showToast(message, { ...contextConfig, ...options });
};

// Utilitários para gerenciar toasts ativos
export const dismissToast = toast.dismiss;
export const dismissAllToasts = toast.dismissAll;
export const updateToast = toast.update;
export const isActive = toast.isActive;