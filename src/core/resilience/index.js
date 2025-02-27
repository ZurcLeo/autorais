// src/core/resilience/index.js
import { RetryManager } from './RetryManager';
import { ResilienceConfig, validateResilienceConfig } from './ResilienceConfig';
import { CircuitState, ResilienceError } from './types';

// Criar a instância única do RetryManager
const retryManager = RetryManager.getInstance();

export {
    retryManager,
    ResilienceConfig,
    validateResilienceConfig,
    CircuitState,
    ResilienceError
};

// Helper functions
export const isResilienceError = (error) => {
    return Object.values(ResilienceError).includes(error.code);
};

export const createResilienceError = (type, message, metadata = {}) => {
    const error = new Error(message);
    error.code = type;
    error.metadata = metadata;
    return error;
};