// src/utils/serviceRegistration.js

import { serviceInitializer } from '../core/initialization/ServiceInitializer';
import { SERVICE_METADATA } from '../reducers/metadata/metadataReducer';

/**
 * Registra um serviço no ServiceInitializer
 * @param {string} serviceName - Nome do serviço
 * @param {Object} serviceInstance - Instância do serviço
 * @param {Object} options - Opções de configuração
 */
export function registerService(serviceName, serviceInstance, options = {}) {
  // Obter metadados existentes, se houver
  const existingMetadata = SERVICE_METADATA[serviceName] || {};
  
  // Mesclar opções
  const mergedOptions = {
    ...existingMetadata,
    ...options
  };
  
  // Registrar no ServiceInitializer
  serviceInitializer.registerService(serviceName, serviceInstance, mergedOptions);
  
  return serviceInstance;
}