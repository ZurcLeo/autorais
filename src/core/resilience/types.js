// types.js
export const CircuitState = {
    CLOSED: 'CLOSED',
    OPEN: 'OPEN',
    HALF_OPEN: 'HALF_OPEN'
};

export const ResilienceError = {
    CIRCUIT_OPEN: 'CIRCUIT_OPEN',
    MAX_RETRIES: 'MAX_RETRIES',
    TIMEOUT: 'TIMEOUT',
    DEPENDENCY_FAILURE: 'DEPENDENCY_FAILURE',
    INFINITE_LOOP: 'INFINITE_LOOP'
};

export const InitializationState = {
    PENDING: 'pending',
    INITIALIZING: 'initializing',
    READY: 'ready',
    FAILED: 'failed',
    BLOCKED: 'blocked',
    RETRYING: 'retrying',
    TIMEOUT: 'timeout'
};