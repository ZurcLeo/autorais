//src/core/error/ErrorBoundaryProvider.js
import React, { useState, useCallback, useEffect } from 'react';
import { LOG_LEVELS } from '../../core/constants/config';
import { retryManager } from '../resilience/index.js';
import { ResilienceError } from '../constants/config.js';
import { ErrorBoundaryContext } from './ErrorBoundaryContext';
import { coreLogger } from '../logging/CoreLogger';

/**
 * Provedor de contexto para gerenciamento centralizado de erros
 * Implementa políticas de resiliência, retentativas e captura de erros globais
 */
export const ErrorBoundaryProvider = ({ children }) => {
    // Estado para armazenar o erro atual
    const [error, setErrorState] = useState(null);
    // Estado para rastrear tentativas de retentativa
    const [retryCount, setRetryCount] = useState(0);
    // Limite máximo de retentativas para evitar loops
    const MAX_RETRY_COUNT = 3;

    /**
     * Função principal para tratamento de erros
     * Implementa lógica de retentativa com backoff exponencial para erros recuperáveis
     */
    const handleError = useCallback(async (error, context = {}) => {
        const { serviceName = 'global', operation = null } = context;
        
        // Log do erro recebido
        coreLogger.logEvent('ErrorBoundary', LOG_LEVELS.ERROR, 
            'Erro capturado', {
                serviceName,
                errorMessage: error?.message,
                errorCode: error?.code,
                errorStack: error?.stack,
                timestamp: new Date().toISOString()
            });
        
        // Tratamento especial para erros críticos ou de loop infinito
        if (error.code === ResilienceError.INFINITE_LOOP || retryCount >= MAX_RETRY_COUNT) {
            coreLogger.logEvent('ErrorBoundary', LOG_LEVELS.ERROR, 
                'Erro crítico ou limite de retentativas atingido', {
                    serviceName,
                    error: error.message,
                    errorCode: error.code,
                    retryCount,
                    timestamp: new Date().toISOString()
                });
            
            setErrorState(error);
            return;
        }
        
        // Se temos uma operação para retry, tentamos novamente com backoff
        if (operation && typeof operation === 'function') {
            try {
                await retryManager.retryWithBackoff(
                    serviceName,
                    async () => {
                        await operation();
                        // Se a operação for bem-sucedida, limpamos o erro
                        setErrorState(null);
                        setRetryCount(0);
                        return;
                    }
                );
            } catch (finalError) {
                // Incrementa contador de retentativas
                setRetryCount(prev => prev + 1);
                
                coreLogger.logEvent('ErrorBoundary', LOG_LEVELS.ERROR, 
                    'Erro não recuperável após retentativas', {
                        error: finalError.message,
                        originalError: error.message,
                        serviceName,
                        retryCount: retryCount + 1
                    });
                
                setErrorState(finalError);
            }
        } else {
            // Sem operação de retentativa, apenas definimos o erro
            setErrorState(error);
        }
    }, [retryCount]);

    /**
     * Limpa o erro atual e reseta o contador de retentativas
     */
    const clearError = useCallback(() => {
        setErrorState(null);
        setRetryCount(0);
    }, []);

    // Configuração de listeners globais para captura de erros não tratados
    useEffect(() => {
        const globalErrorListener = (event) => {
            // Evita processar o mesmo erro múltiplas vezes
            if (error && error.message === event.error?.message) {
                return;
            }
            
            handleError(event.error || new Error('Erro desconhecido'), { 
                serviceName: 'global' 
            });
        };

        // Listener para erros síncronos
        window.addEventListener('error', globalErrorListener);
        // Listener para promessas não tratadas
        window.addEventListener('unhandledrejection', (event) => {
            globalErrorListener({ 
                error: event.reason instanceof Error ? 
                    event.reason : 
                    new Error(String(event.reason)) 
            });
        });

        return () => {
            window.removeEventListener('error', globalErrorListener);
            window.removeEventListener('unhandledrejection', globalErrorListener);
        };
    }, [handleError, error]);

    // Valor do contexto que será fornecido aos componentes filhos
    const contextValue = {
        error,
        setError: handleError,
        clearError
    };

    return (
        <ErrorBoundaryContext.Provider value={contextValue}>
            {children}
        </ErrorBoundaryContext.Provider>
    );
};