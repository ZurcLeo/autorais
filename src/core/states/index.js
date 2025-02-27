// src/core/state/index.js
import { CoreStateProvider, useCoreState } from './CoreStateManager';

// Estados possíveis de um serviço
export const ServiceStatus = {
  INITIALIZING: 'initializing',
  READY: 'ready',
  ERROR: 'error',
  FAILED: 'failed',
  BLOCKED: 'blocked'
};

// Tipos de ações que podem ser despachadas
export const StateActions = {
  SERVICE_INIT: 'SERVICE_INIT',
  SERVICE_READY: 'SERVICE_READY',
  SERVICE_ERROR: 'SERVICE_ERROR',
  CORE_READY: 'CORE_READY'
};

// Helper para criar ações
export const createStateAction = (type, payload) => ({
  type,
  ...payload,
  timestamp: Date.now()
});

// Helper para verificar se um serviço está pronto
export const isServiceReady = (state, serviceName) => 
  state.services[serviceName]?.status === ServiceStatus.READY;

// Helper para verificar se as dependências estão prontas
export const areDependenciesReady = (state, serviceName) => {
  const dependencies = state.dependencies[serviceName] || [];
  return dependencies.every(dep => isServiceReady(state, dep));
};

export {
  CoreStateProvider,
  useCoreState
};