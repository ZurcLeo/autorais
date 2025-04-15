// stateManagementTokens.js
import { tokens } from './index';

// Tokens para gerenciamento de estado seguindo a mesma estrutura do Design System
export const stateManagementTokens = {
  timing: {
    retry: {
      initial: tokens.transitions.duration.slow,
      subsequent: tokens.transitions.duration.slower,
      maxAttempts: 3
    },
    debounce: tokens.transitions.duration.base,
    throttle: tokens.transitions.duration.slow
  },
  
  logging: {
    levels: {
      error: 'error',
      warning: 'warning',
      info: 'info',
      debug: 'debug'
    },
    contexts: {
      state: 'state',
      lifecycle: 'lifecycle',
      navigation: 'navigation',
      theme: 'theme'
    }
  },

  // Paleta de status seguindo as cores semânticas do tema
  status: {
    success: 'success.main',
    error: 'error.main',
    warning: 'warning.main',
    info: 'info.main'
  }
};

// Configurações padrão para retry baseadas nos tokens
export const retryDefaults = {
  maxAttempts: 3,
  delayMs: parseInt(tokens.transitions.duration.slow),
  backoffMultiplier: 1.5
};