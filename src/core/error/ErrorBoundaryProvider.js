import React, { useState, useCallback, useEffect } from 'react';
import { retryManager } from '../resilience/';
import { ResilienceError } from '../resilience/types';
import { ErrorBoundaryContext } from './ErrorBoundaryContext';
import { coreLogger } from '../logging';
import { LOG_LEVELS } from '../../reducers/metadata/metadataReducer';

export const ErrorBoundaryProvider = ({ children }) => {
    const [error, setError] = useState(null);

    const handleError = useCallback(async (error, context) => {
        if (error.code === ResilienceError.INFINITE_LOOP) {
            coreLogger.logEvent('ErrorBoundary', LOG_LEVELS.ERROR, 
                'Critical initialization error detected', {
                    serviceName: context?.serviceName || 'unknown',
                    error: error.message,
                    errorCode: error.code,
                    timestamp: new Date().toISOString()
                });
            
            setError(error);
            return;
        }
        
        try {
            await retryManager.retryWithBackoff(
                context?.serviceName || 'global',
                async () => {
                    if (context?.operation) {
                        await context.operation();
                        setError(null);
                        return;
                    }
                    throw error;
                }
            );
        } catch (finalError) {
            coreLogger.logEvent('ErrorBoundary', LOG_LEVELS.ERROR, 
                'Unrecoverable error', {
                    error: finalError.message,
                    originalError: error.message,
                    serviceName: context?.serviceName || 'global'
                });
            setError(finalError);
        }
    }, []);

    // ✅ Adicionando cleanup para evitar memory leaks
    useEffect(() => {
        const globalErrorListener = (event) => {
            handleError(event.error, { serviceName: 'global' });
        };

        window.addEventListener('error', globalErrorListener);
        window.addEventListener('unhandledrejection', globalErrorListener);

        return () => {
            window.removeEventListener('error', globalErrorListener);
            window.removeEventListener('unhandledrejection', globalErrorListener);
        };
    }, [handleError]);

    return (
        <ErrorBoundaryContext.Provider value={{ error, setError: handleError }}>
            {children}
        </ErrorBoundaryContext.Provider>
    );
};