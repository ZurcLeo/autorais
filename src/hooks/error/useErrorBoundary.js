// src/hooks/error/useErrorBoundary.js
import { useContext, useCallback } from 'react';
import { ErrorBoundaryContext } from '../../core/error/ErrorBoundaryContext';
import { ErrorBoundary } from '../../core/error/ErrorBoundary';
import { ErrorAlert } from '../../core/error/ErrorAlert';
import { coreLogger } from '../../core/logging';
import { LOG_LEVELS } from '../../core/constants/config';

/**
 * Hook para acesso ao sistema de tratamento de erros da aplicação
 *
 * @returns {Object} Objeto contendo:
 * - ErrorBoundary: Componente para capturar erros de renderização
 * - ErrorAlert: Componente para exibir alertas de erro
 * - error: Estado atual do erro no contexto
 * - errors: Histórico de erros registrados
 * - setError: Função para definir um erro no contexto
 * - clearError: Função para limpar o erro atual
 * - clearAllErrors: Função para limpar todos os erros registrados
 * - captureError: Função auxiliar para capturar e tratar erros em operações assíncronas
 */
export function useErrorBoundary() {
  const context = useContext(ErrorBoundaryContext);

  if (!context) {
    throw new Error('useErrorBoundary deve ser usado dentro de ErrorBoundaryProvider');
  }

  const { 
    error, 
    errorHistory, // Obtendo o histórico de erros do contexto
    setError, 
    clearError: contextClearError, 
    clearAllErrors: contextClearAllErrors 
  } = context;

  /**
   * Limpa o erro atual do contexto
   */
  const clearError = useCallback(() => {
    if (contextClearError) {
      contextClearError();
      coreLogger.logEvent('ErrorBoundary', LOG_LEVELS.STATE, 'Error cleared', {
        timestamp: new Date().toISOString()
      });
    } else {
      // Fallback caso o contexto não forneça a função clearError
      setError(null);
      console.warn('ErrorBoundary: Using fallback error clearing mechanism');
    }
  }, [contextClearError, setError]);

  /**
   * Limpa todos os erros registrados no histórico
   */
  const clearAllErrors = useCallback(() => {
    if (contextClearAllErrors) {
      contextClearAllErrors();
      coreLogger.logEvent('ErrorBoundary', LOG_LEVELS.STATE, 'All errors cleared', {
        timestamp: new Date().toISOString()
      });
    } else {
      // Fallback caso o contexto não forneça a função clearAllErrors
      setError(null);
      console.warn('ErrorBoundary: No error history to clear, using fallback');
    }
  }, [contextClearAllErrors, setError]);

  /**
   * Função auxiliar para capturar e processar erros em operações assíncronas
   *
   * @param {Function} asyncOperation - Operação assíncrona que pode gerar erro
   * @param {Object} options - Opções de configuração
   * @param {string} options.serviceName - Nome do serviço/componente que originou o erro
   * @param {Function} options.retryOperation - Função para tentar novamente a operação (opcional)
   * @param {Function} options.onError - Callback para tratar o erro (opcional)
   * @returns {Promise} Resultado da operação ou erro capturado
   */
  const captureError = useCallback(async (asyncOperation, options = {}) => {
    const {
      serviceName = 'unknown',
      retryOperation = null,
      onError = null
    } = options;

    try {
      return await asyncOperation();
    } catch (error) {
      // Registra o erro no console (em desenvolvimento) ou no logger (em produção)
      coreLogger.logEvent(serviceName, LOG_LEVELS.ERROR, 'Error captured', {
        error: error.message,
        stack: error.stack,
        code: error.code || 'unknown',
        timestamp: new Date().toISOString()
      });

      // Executa callback personalizado se fornecido
      if (onError && typeof onError === 'function') {
        onError(error);
      }

      // Propaga o erro para o sistema centralizado
      setError(error, {
        serviceName,
        operation: retryOperation
      });

      // Re-lança o erro para permitir tratamento adicional se necessário
      throw error;
    }
  }, [setError]);

  return {
    ErrorBoundary,
    ErrorAlert,
    error,
    errors: errorHistory || [], // Exponha o histórico de erros como 'errors'
    setError,
    clearError,
    clearAllErrors,
    captureError
  };
}