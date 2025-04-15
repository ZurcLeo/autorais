// src/core/logging/index.js
/**
 * Sistema de Logging da Aplicação
 * 
 * Este módulo exporta os componentes principais do sistema de logging,
 * permitindo monitoramento, diagnóstico e depuração da aplicação.
 */

// Core Logger e constantes
export { coreLogger } from './CoreLogger';
export { TIME_RANGES, LOG_LEVELS, SEVERITY_LEVELS } from '../../core/constants/config';

// React Context para acesso ao logger
export { 
  CoreLoggerProvider,
  useCoreLogger,
  withCoreLogger,
  useComponentLifecycleLogger
} from './CoreLoggerContext';

// Componentes de interface para diagnóstico
export { default as ProviderDiagnostics } from './ProviderDiagnostics';
export { DiagnosticsView } from './DiagnosticsView';

// Utilitários de filtragem e formatação
export { 
  filterLogs, 
  extractUniqueComponents, 
  getLogLevelClassName,
  downloadLogs,
} from './logFilterUtils';

// Configurações
export { 
  LoggingConfig,
  validateLogConfig
} from './LoggingConfig';