// src/core/debug/index.js
import React from 'react';
import DebugPanel from './DebugPanel';
import { EventLogPanel } from './EventLogPanel';
import { ErrorsPanel } from './ErrorsPanel';
import { StateInspector } from './StateInspector';
import { PerformancePanel } from './PerformancePanel';
import { SettingsPanel } from './SettingsPanel';
import { serviceEventHub } from '../services/BaseService';

// Chave para armazenar configurações no localStorage
const DEBUG_SETTINGS_KEY = 'debugPanelSettings';
const TEST_EVENT = 'TEST_EVENT';

/**
 * Verifica se o modo de debug está ativado
 * Pode ser ativado de várias maneiras:
 * 1. Parâmetro de URL: ?debug=true
 * 2. Cookie: debug_enabled=true
 * 3. localStorage: debugPanelSettings.general.enabled
 * 4. Ambiente de desenvolvimento
 * 
 * @returns {boolean} Se o debug está ativado
 */
export const isDebugEnabled = () => {
  // Verificar ambiente de desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // Verificar parâmetro de URL
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('debug') && urlParams.get('debug') === 'true') {
      return true;
    }
    
    // Verificar cookie
    if (document.cookie.split(';').some(item => item.trim().startsWith('debug_enabled=true'))) {
      return true;
    }
    
    // Verificar localStorage
    try {
      const settings = JSON.parse(localStorage.getItem(DEBUG_SETTINGS_KEY));
      if (settings?.general?.enabled) {
        return true;
      }
    } catch (e) {
      // Ignorar erros de parsing
    }
  }
  
  return false;
};

/**
 * Ativa ou desativa o modo de debug
 * 
 * @param {boolean} enabled Se o debug deve ser ativado
 */
export const setDebugEnabled = (enabled) => {
  try {
    // Atualizar configurações no localStorage
    const settings = JSON.parse(localStorage.getItem(DEBUG_SETTINGS_KEY) || '{}');
    settings.general = settings.general || {};
    settings.general.enabled = enabled;
    localStorage.setItem(DEBUG_SETTINGS_KEY, JSON.stringify(settings));
    
    // Definir cookie para comunicação com o backend PHP
    document.cookie = `debug_enabled=${enabled ? 'true' : 'false'}; path=/; max-age=${enabled ? 86400 : 0}`;
    
    // Atualizar URL se estiver habilitando
    if (enabled && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('debug', 'true');
      window.history.replaceState({}, '', url);
    }
    
    return true;
  } catch (e) {
    console.error('Erro ao configurar modo de debug:', e);
    return false;
  }
};

/**
 * Configura o monitoramento de erros não capturados
 */
export const setupErrorMonitoring = () => {
  if (typeof window !== 'undefined') {
    // Capturar erros não tratados
    window.addEventListener('error', (event) => {
      console.error('Debug: Erro não tratado capturado', event);
      
      // Armazenar em localStorage para análise posterior
      try {
        const errors = JSON.parse(localStorage.getItem('debugPanelErrors') || '[]');
        errors.push({
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('debugPanelErrors', JSON.stringify(errors.slice(-50)));
      } catch (e) {
        // Ignorar erros de armazenamento
      }
    });
    
    // Capturar rejeições de promessas não tratadas
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Debug: Rejeição de promessa não tratada', event);
      
      // Armazenar em localStorage para análise posterior
      try {
        const errors = JSON.parse(localStorage.getItem('debugPanelErrors') || '[]');
        errors.push({
          type: 'unhandledrejection',
          message: event.reason?.message || String(event.reason),
          stack: event.reason?.stack,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('debugPanelErrors', JSON.stringify(errors.slice(-50)));
      } catch (e) {
        // Ignorar erros de armazenamento
      }
    });
  }
};

/**
 * Configura interceptadores de AJAX para jQuery
 */
export const setupAjaxInterceptors = () => {
  if (typeof window !== 'undefined' && window.$ && window.$.ajaxSetup) {
    // Verificar se a interceptação está ativada nas configurações
    let shouldIntercept = false;
    try {
      const settings = JSON.parse(localStorage.getItem(DEBUG_SETTINGS_KEY) || '{}');
      shouldIntercept = settings?.advanced?.injectDebugInfoToAjax;
    } catch (e) {
      // Ignorar erros de parsing
    }
    
    if (shouldIntercept) {
      window.$.ajaxSetup({
        beforeSend: function(xhr) {
          // Adicionar cabeçalho de debug
          xhr.setRequestHeader('X-Debug-Enabled', 'true');
          
          // Adicionar marcador de performance
          if (window.performance && window.performance.mark) {
            const requestId = 'ajax-' + Date.now();
            xhr._debugRequestId = requestId;
            window.performance.mark('ajax-start-' + requestId);
          }
          
          // Armazenar informações da requisição
          try {
            const requests = JSON.parse(sessionStorage.getItem('debugPanelRequests') || '[]');
            requests.push({
              id: xhr._debugRequestId,
              url: this.url,
              method: this.type,
              data: this.data,
              timestamp: new Date().toISOString(),
              startTime: Date.now()
            });
            sessionStorage.setItem('debugPanelRequests', JSON.stringify(requests.slice(-100)));
          } catch (e) {
            // Ignorar erros de armazenamento
          }
        },
        complete: function(xhr, status) {
          // Registrar resposta
          try {
            const requests = JSON.parse(sessionStorage.getItem('debugPanelRequests') || '[]');
            const index = requests.findIndex(r => r.id === xhr._debugRequestId);
            
            if (index !== -1) {
              requests[index].status = xhr.status;
              requests[index].statusText = status;
              requests[index].endTime = Date.now();
              requests[index].duration = requests[index].endTime - requests[index].startTime;
              
              // Tentar capturar resposta se for JSON
              try {
                if (xhr.responseText && xhr.getResponseHeader('content-type')?.includes('application/json')) {
                  requests[index].response = JSON.parse(xhr.responseText);
                }
              } catch (e) {
                requests[index].responseError = e.message;
              }
              
              sessionStorage.setItem('debugPanelRequests', JSON.stringify(requests));
            }
          } catch (e) {
            // Ignorar erros de armazenamento
          }
          
          // Medir performance da requisição
          if (window.performance && window.performance.mark && xhr._debugRequestId) {
            const requestId = xhr._debugRequestId;
            window.performance.mark('ajax-end-' + requestId);
            
            try {
              window.performance.measure(
                'ajax-duration-' + requestId,
                'ajax-start-' + requestId,
                'ajax-end-' + requestId
              );
            } catch (e) {
              // Ignorar erros de medição
            }
          }
        }
      });
    }
  }
};

/**
 * Configura monitoramento de performance PHP
 * @param {string} endpoint - Endpoint para buscar métricas PHP
 */
export const setupPhpMetricsMonitoring = (endpoint = '/api/debug/php-metrics') => {
  if (typeof window !== 'undefined' && window.$ && isDebugEnabled()) {
    // Verificar se o monitoramento está ativado nas configurações
    let shouldMonitor = false;
    try {
      const settings = JSON.parse(localStorage.getItem(DEBUG_SETTINGS_KEY) || '{}');
      shouldMonitor = settings?.backend?.enablePhpDebug;
      
      if (settings?.backend?.phpMetricsEndpoint) {
        endpoint = settings.backend.phpMetricsEndpoint;
      }
    } catch (e) {
      // Ignorar erros de parsing
    }
    
    if (shouldMonitor) {
      // Configurar polling para métricas PHP
      const pollPhpMetrics = () => {
        window.$.ajax({
          url: endpoint,
          method: 'GET',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
          },
          success: function(data) {
            try {
              sessionStorage.setItem('debugPanelPhpMetrics', JSON.stringify({
                data,
                timestamp: new Date().toISOString()
              }));
            } catch (e) {
              // Ignorar erros de armazenamento
            }
          },
          error: function(xhr, status, error) {
            console.warn('Erro ao buscar métricas PHP:', error);
          }
        });
      };
      
      // Executar imediatamente e configurar intervalo
      pollPhpMetrics();
      setInterval(pollPhpMetrics, 30000); // A cada 30 segundos
    }
  }
};

/**
 * Inicializa o sistema de debug
 * Esta função deve ser chamada no início da aplicação
 */
export const initializeDebug = () => {
  if (isDebugEnabled()) {
    setupErrorMonitoring();
    setupAjaxInterceptors();
    setupPhpMetricsMonitoring();
    
    // Log inicial
    console.info('Debug Panel inicializado', {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      browserInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    });
  }
};

/**
 * API para marcar e medir performance
 */
export const debugPerformance = {
  /**
   * Adiciona um marcador de tempo para medição de performance
   * @param {string} name - Nome do marcador
   */
  mark: (name) => {
    if (window.performance && window.performance.mark) {
      window.performance.mark(name);
    }
  },
  
  /**
   * Cria uma medição entre dois marcadores
   * @param {string} name - Nome da medição
   * @param {string} startMark - Marcador de início
   * @param {string} endMark - Marcador de fim
   * @returns {number|null} Duração em ms ou null se falhar
   */
  measure: (name, startMark, endMark) => {
    if (window.performance && window.performance.measure) {
      try {
        window.performance.measure(name, startMark, endMark);
        const measures = window.performance.getEntriesByName(name, 'measure');
        return measures.length > 0 ? measures[0].duration : null;
      } catch (e) {
        console.warn('Erro ao medir performance:', e);
        return null;
      }
    }
    return null;
  },
  
  /**
   * Limpa os marcadores e medições
   */
  clear: () => {
    if (window.performance) {
      if (window.performance.clearMarks) window.performance.clearMarks();
      if (window.performance.clearMeasures) window.performance.clearMeasures();
    }
  }
};

/**
 * API para logging via Debug Panel
 */
export const debugLogger = {
  /**
   * Registra uma mensagem de informação
   * @param {string} message - Mensagem a ser registrada
   * @param {Object} data - Dados adicionais
   */
  info: (message, data = {}) => {
    console.info(`[DEBUG] ${message}`, data);
    
    // Armazenar para o panel
    try {
      const logs = JSON.parse(sessionStorage.getItem('debugPanelLogs') || '[]');
      logs.push({
        level: 'info',
        message,
        data,
        timestamp: new Date().toISOString()
      });
      sessionStorage.setItem('debugPanelLogs', JSON.stringify(logs.slice(-200)));
    } catch (e) {
      // Ignorar erros de armazenamento
    }
  },
  
  /**
   * Registra uma mensagem de aviso
   * @param {string} message - Mensagem a ser registrada
   * @param {Object} data - Dados adicionais
   */
  warn: (message, data = {}) => {
    console.warn(`[DEBUG] ${message}`, data);
    
    // Armazenar para o panel
    try {
      const logs = JSON.parse(sessionStorage.getItem('debugPanelLogs') || '[]');
      logs.push({
        level: 'warn',
        message,
        data,
        timestamp: new Date().toISOString()
      });
      sessionStorage.setItem('debugPanelLogs', JSON.stringify(logs.slice(-200)));
    } catch (e) {
      // Ignorar erros de armazenamento
    }
  },
  
  /**
   * Registra uma mensagem de erro
   * @param {string} message - Mensagem a ser registrada
   * @param {Object} data - Dados adicionais
   */
  error: (message, data = {}) => {
    console.error(`[DEBUG] ${message}`, data);
    
    // Armazenar para o panel
    try {
      const logs = JSON.parse(sessionStorage.getItem('debugPanelLogs') || '[]');
      logs.push({
        level: 'error',
        message,
        data,
        timestamp: new Date().toISOString(),
        stack: new Error().stack
      });
      sessionStorage.setItem('debugPanelLogs', JSON.stringify(logs.slice(-200)));
    } catch (e) {
      // Ignorar erros de armazenamento
    }
  }
};

/**
 * Componente Provider para incluir o Debug Panel na aplicação
 */
export const DebugProvider = ({ children }) => {
  // Inicializar sistema de debug na montagem do componente
  React.useEffect(() => {
    if (isDebugEnabled()) {
      initializeDebug();
    }
  }, []);
  
  // Renderizar o Debug Panel apenas se o debug estiver ativado
  return (
    <>
      {children}
      {isDebugEnabled() && <DebugPanel initiallyOpen={false} />}
    </>
  );
};

      serviceEventHub.emit(TEST_EVENT.TEST_DEBUG, {
                timestamp: Date.now()
              });  

// Exportar componentes individuais para uso direto, se necessário
export {
  DebugPanel,
  EventLogPanel,
  ErrorsPanel,
  StateInspector,
  PerformancePanel,
  SettingsPanel
};

// Exportar uma função para integração com jQuery para uso no Tabler.io
export const initializeJQueryDebug = () => {
  if (typeof window !== 'undefined' && window.$) {
    window.$.debugPanel = {
      isEnabled: isDebugEnabled,
      enable: () => setDebugEnabled(true),
      disable: () => setDebugEnabled(false),
      performance: debugPerformance,
      log: debugLogger,
      
      // Método para abrir o painel via jQuery
      open: () => {
        const event = new CustomEvent('debugpanel:open');
        document.dispatchEvent(event);
      },
      
      // Método para fechar o painel via jQuery
      close: () => {
        const event = new CustomEvent('debugpanel:close');
        document.dispatchEvent(event);
      }
    };
    
    console.info('Debug Panel inicializado e disponível via $.debugPanel');
  }
};

// Exportação padrão
export default {
  isDebugEnabled,
  setDebugEnabled,
  initializeDebug,
  DebugProvider,
  debugPerformance,
  debugLogger
};