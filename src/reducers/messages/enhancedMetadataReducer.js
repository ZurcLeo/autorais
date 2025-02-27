// enhancedMetadataReducer.js
import { stateManagementTokens, retryDefaults } from './stateManagementTokens';
import { diagnosticLogger } from '../utils/logger/DiagnosticLogger';

export class EnhancedMetadataReducer {
  constructor(initialState = SERVICE_METADATA) {
    this.state = initialState;
    this.retryConfig = retryDefaults;
  }

  logStateChange(action, prevState, nextState) {
    diagnosticLogger.log('State update', stateManagementTokens.logging.contexts.state, {
      action,
      changes: this.getDiff(prevState, nextState)
    });
  }

    getDiff(prevState, nextState) {
        const diff = {
          services: {},
          hasChanges: false
        };
      
        // Verifica serviços removidos
        Object.keys(prevState).forEach(serviceName => {
          if (!nextState[serviceName]) {
            diff.services[serviceName] = {
              type: 'removed',
              previous: prevState[serviceName]
            };
            diff.hasChanges = true;
          }
        });
      
        // Verifica serviços adicionados ou modificados
        Object.keys(nextState).forEach(serviceName => {
          const prevService = prevState[serviceName];
          const nextService = nextState[serviceName];
      
          // Novo serviço
          if (!prevService) {
            diff.services[serviceName] = {
              type: 'added',
              current: nextService
            };
            diff.hasChanges = true;
            return;
          }
      
          // Verifica mudanças em serviços existentes
          const serviceChanges = {
            type: 'modified',
            changes: {}
          };
      
          // Verifica timeout
          if (prevService.timeout !== nextService.timeout) {
            serviceChanges.changes.timeout = {
              previous: prevService.timeout,
              current: nextService.timeout
            };
          }
      
          // Verifica criticalPath
          if (prevService.criticalPath !== nextService.criticalPath) {
            serviceChanges.changes.criticalPath = {
              previous: prevService.criticalPath,
              current: nextService.criticalPath
            };
          }
      
          // Verifica descrição
          if (prevService.description !== nextService.description) {
            serviceChanges.changes.description = {
              previous: prevService.description,
              current: nextService.description
            };
          }
      
          // Verifica dependências
          const prevDeps = prevService.dependencies || [];
          const nextDeps = nextService.dependencies || [];
          
          if (prevDeps.length !== nextDeps.length || 
              !prevDeps.every(dep => nextDeps.includes(dep))) {
            serviceChanges.changes.dependencies = {
              previous: prevDeps,
              current: nextDeps,
              added: nextDeps.filter(dep => !prevDeps.includes(dep)),
              removed: prevDeps.filter(dep => !nextDeps.includes(dep))
            };
          }
      
          // Se houve alguma mudança no serviço, adiciona ao diff
          if (Object.keys(serviceChanges.changes).length > 0) {
            diff.services[serviceName] = serviceChanges;
            diff.hasChanges = true;
          }
        });
      
        // Verifica mudanças nos níveis de severidade (se existirem no estado)
        if (prevState.SEVERITY_LEVELS && nextState.SEVERITY_LEVELS) {
          const severityChanges = {};
          let hasSeverityChanges = false;
      
          Object.keys(prevState.SEVERITY_LEVELS).forEach(level => {
            if (prevState.SEVERITY_LEVELS[level] !== nextState.SEVERITY_LEVELS[level]) {
              severityChanges[level] = {
                previous: prevState.SEVERITY_LEVELS[level],
                current: nextState.SEVERITY_LEVELS[level]
              };
              hasSeverityChanges = true;
            }
          });
      
          if (hasSeverityChanges) {
            diff.severityLevels = severityChanges;
            diff.hasChanges = true;
          }
        }
      
        // Verifica mudanças na configuração de log (se existir no estado)
        if (prevState.LOG_CONFIG && nextState.LOG_CONFIG) {
          const logConfigChanges = {};
          let hasLogConfigChanges = false;
      
          Object.keys(prevState.LOG_CONFIG).forEach(config => {
            if (prevState.LOG_CONFIG[config] !== nextState.LOG_CONFIG[config]) {
              logConfigChanges[config] = {
                previous: prevState.LOG_CONFIG[config],
                current: nextState.LOG_CONFIG[config]
              };
              hasLogConfigChanges = true;
            }
          });
      
          if (hasLogConfigChanges) {
            diff.logConfig = logConfigChanges;
            diff.hasChanges = true;
          }
        }
        // Se não houver mudanças, retorna null para economizar memória
        return diff.hasChanges ? diff : null;
    }

  async processAction(action) {
    let attempts = 0;
    let delay = parseInt(stateManagementTokens.timing.retry.initial);

    while (attempts < this.retryConfig.maxAttempts) {
      try {
        const prevState = this.state;
        const nextState = await this.reducer(prevState, action);
        
        this.logStateChange(action, prevState, nextState);
        this.state = nextState;
        
        return nextState;
      } catch (error) {
        attempts++;
        
        if (attempts === this.retryConfig.maxAttempts) {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= this.retryConfig.backoffMultiplier;
      }
    }
  }
}