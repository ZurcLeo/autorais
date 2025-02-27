import { toast } from 'react-toastify';
import CustomToast from '../components/Common/CustomToast';

export const showToast = (message, options = {}) => {
  return toast(
    ({ closeToast }) => (
      <CustomToast
        closeToast={closeToast}
        toastProps={{ message, ...options }}
      />
    ),
    {
      position: "bottom-right",
      autoClose: 5000, // 5 segundos para fechar automaticamente
      hideProgressBar: false, 
      closeOnClick: true, 
      pauseOnHover: true, 
      draggable: true, 
      ...options, 
    }
  );
};

export const showPromiseToast = async (promise, messages) => {
  const stages = {
    initial: {
      progress: 0,
      message: messages.loading || "Iniciando...",
    },
    progress: {
      progress: 40,
      message: messages.progress || "Processando...",
    },
    almostDone: {
      progress: 80,
      message: messages.almostDone || "Quase lá...",
    }
  };

  const id = showToast(stages.initial.message, {
    isLoading: true,
    progress: stages.initial.progress,
    duration: null // Não fecha automaticamente
  });

  // Atualiza o progresso periodicamente
  const progressInterval = setInterval(() => {
    const currentProgress = toast.getToast(id)?.progress || 0;
    if (currentProgress < 80) {
      toast.update(id, {
        progress: currentProgress + 10
      });
    }
  }, 1000);

  try {
    const result = await promise;
    clearInterval(progressInterval);
    
    // Animação de sucesso
    toast.update(id, {
      render: ({ closeToast }) => (
        <CustomToast
          closeToast={closeToast}
          toastProps={{
            type: "success",
            message: messages.success || "Concluído com sucesso!",
            animation: "success"
          }}
        />
      ),
      type: "success",
      isLoading: false,
      autoClose: 5000,
      transition: 'Bounce'
    });

    return result;
  } catch (error) {
    clearInterval(progressInterval);
    
    // Animação de erro
    toast.update(id, {
      render: ({ closeToast }) => (
        <CustomToast
          closeToast={closeToast}
          toastProps={{
            type: "error",
            message: error.message,
            animation: "error",
            action: {
              label: "Tentar novamente",
              onClick: () => {
                closeToast();
                return showPromiseToast(promise, messages);
              }
            }
          }}
        />
      ),
      type: "error",
      isLoading: false,
      autoClose: 8000
    });

    throw error;
  }
};