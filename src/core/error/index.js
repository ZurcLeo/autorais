//src/core/error/index.js
export { ErrorBoundary } from './ErrorBoundary';
export { ErrorBoundaryProvider } from './ErrorBoundaryProvider';
export { ErrorBoundaryContext } from './ErrorBoundaryContext';
export { useErrorBoundary } from '../../hooks/error/useErrorBoundary';
export { ErrorAlert } from './ErrorAlert';

// Novo componente para diagnóstico de erros
export { ErrorDiagnostics } from './ErrorDiagnostics';

// Função auxiliar para capturar e processar erros não gerenciados por ErrorBoundary
export const captureError = async (error, context = {}) => {
  console.error('[captureError] Erro não gerenciado:', error);
  
  try {
    // Tenta enviar para telemetria/logging
    if (window.coreLogger) {
      window.coreLogger.logServiceError(
        context.serviceName || 'global',
        error,
        context
      );
    }
    
    // Se disponível, envia para serviço de monitoramento de erros
    if (window.errorMonitoring && typeof window.errorMonitoring.captureException === 'function') {
      window.errorMonitoring.captureException(error, { extra: context });
    }
  } catch (loggingError) {
    console.error('[captureError] Falha ao registrar erro:', loggingError);
  }
  
  // Podemos retornar o erro para processamento adicional
  return error;
};