// src/core/logging/logFilterUtils.js
import { TIME_RANGES } from "../constants/config";
  /**
   * Cache de resultados de filtragem para otimização de performance
   */
  class LogFilterCache {
    constructor(maxSize = 20) {
      this.cache = new Map();
      this.maxSize = maxSize;
    }
  
    /**
     * Gera uma chave única para o cache com base nos parâmetros de filtragem
     * @param {Object} filterParams - Parâmetros de filtragem
     * @param {Number} logsLength - Tamanho do array de logs (para invalidação)
     * @returns {String} - Chave para o cache
     */
    generateKey(filterParams, logsLength) {
      return `${filterParams.filterLevel}-${filterParams.searchTerm}-${filterParams.timeFilterRange}-${filterParams.componentFilter}-${logsLength}`;
    }
  
    /**
     * Verifica se o resultado está em cache
     * @param {Object} filterParams - Parâmetros de filtragem
     * @param {Number} logsLength - Tamanho do array de logs
     * @returns {Boolean} - true se existe no cache
     */
    has(filterParams, logsLength) {
      const key = this.generateKey(filterParams, logsLength);
      return this.cache.has(key);
    }
  
    /**
     * Obtém resultado do cache
     * @param {Object} filterParams - Parâmetros de filtragem
     * @param {Number} logsLength - Tamanho do array de logs
     * @returns {Array|undefined} - Resultado em cache ou undefined
     */
    get(filterParams, logsLength) {
      const key = this.generateKey(filterParams, logsLength);
      return this.cache.get(key);
    }
  
    /**
     * Armazena resultado no cache
     * @param {Object} filterParams - Parâmetros de filtragem
     * @param {Number} logsLength - Tamanho do array de logs
     * @param {Array} result - Resultado da filtragem
     */
    set(filterParams, logsLength, result) {
      // Limpa o cache se exceder o tamanho máximo
      if (this.cache.size >= this.maxSize) {
        const oldestKey = this.cache.keys().next().value;
        this.cache.delete(oldestKey);
      }
  
      const key = this.generateKey(filterParams, logsLength);
      this.cache.set(key, result);
    }
  
    /**
     * Limpa o cache
     */
    clear() {
      this.cache.clear();
    }
  }
  
  // Instância singleton do cache
  export const logFilterCache = new LogFilterCache();
  
  /**
   * Filtra logs com base em vários critérios
   * @param {Array} logs - Array de objetos de log
   * @param {Object} options - Opções de filtragem
   * @param {String} options.filterLevel - Filtro por nível de log
   * @param {String} options.searchTerm - Termo de busca
   * @param {String} options.timeFilterRange - Filtro de intervalo de tempo
   * @param {String} options.componentFilter - Filtro por componente
   * @returns {Array} - Logs filtrados
   */
  export const filterLogs = (logs, options) => {
    // Validação de entrada
    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      return [];
    }
  
    // Validação e normalização das opções
    const {
      filterLevel = 'ALL',
      searchTerm = '',
      timeFilterRange = 'ALL',
      componentFilter = 'ALL'
    } = options || {};
  
    // Verificar cache para evitar reprocessamento
    if (logFilterCache.has(options, logs.length)) {
      return logFilterCache.get(options, logs.length);
    }
  
    // Se não há filtros ativos, retorna todos os logs
    if (
      filterLevel === 'ALL' &&
      !searchTerm &&
      timeFilterRange === 'ALL' &&
      componentFilter === 'ALL'
    ) {
      return logs;
    }
  
    // Filtrar logs
    const filteredLogs = logs.filter((log) => {
      // Verificar filtro de nível
      if (filterLevel !== 'ALL' && log.type !== filterLevel) {
        return false;
      }
  
      // Verificar filtro de componente
      if (componentFilter !== 'ALL' && log.component !== componentFilter) {
        return false;
      }
  
      // Verificar filtro de tempo
      if (timeFilterRange !== 'ALL') {
        const timeWindow = TIME_RANGES[timeFilterRange];
        if (timeWindow) {
          const cutoffTime = Date.now() - timeWindow;
          const logTime = log.timestamp ? new Date(log.timestamp).getTime() : 0;
          if (logTime < cutoffTime) {
            return false;
          }
        }
      }
  
      // Verificar termo de busca
      if (searchTerm) {
        // Busca no objeto log inteiro, convertido para string
        const logStr = JSON.stringify(log).toLowerCase();
        return logStr.includes(searchTerm.toLowerCase());
      }
  
      return true;
    });
  
    // Armazenar resultado em cache
    logFilterCache.set(options, logs.length, filteredLogs);
  
    return filteredLogs;
  };
  
  /**
   * Extrai componentes únicos dos logs para uso em filtros
   * @param {Array} logs - Array de objetos de log
   * @returns {Array} - Array de nomes de componentes únicos
   */
  export const extractUniqueComponents = (logs) => {
    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      return [];
    }
  
    // Set para garantir valores únicos
    const componentsSet = new Set();
  
    // Adiciona 'ALL' como primeira opção
    componentsSet.add('ALL');
  
    // Extrai componentes únicos
    logs.forEach((log) => {
      if (log.component) {
        componentsSet.add(log.component);
      }
    });
  
    // Converte para array
    return Array.from(componentsSet);
  };
  
  /**
   * Aplica formatação visual para exibição do log
   * @param {String} logType - Tipo de log
   * @returns {String} - Nome da classe CSS ou cor
   */
  export const getLogLevelClassName = (logType) => {
    const colorMap = {
      ERROR: 'error',
      WARNING: 'warning',
      INFO: 'primary',
      DEBUG: 'success',
      LIFECYCLE: 'secondary',
      INIT: 'info',
      PERF: 'warning',
      STATE: 'secondary',
      NETWORK: 'info',
      default: 'textSecondary'
    };
  
    return colorMap[logType] || colorMap.default;
  };
  
  /**
   * Preparar logs para download
   * @param {Array} logs - Array de logs a serem exportados
   * @returns {Blob} - Blob contendo JSON formatado
   */
  export const prepareLogsForDownload = (logs) => {
    const logsData = JSON.stringify(logs, null, 2);
    return new Blob([logsData], { type: 'application/json' });
  };
  
  /**
   * Iniciar download de logs como arquivo JSON
   * @param {Array} logs - Array de logs a serem baixados
   * @param {String} filename - Nome do arquivo (padrão: 'logs.json')
   */
  export const downloadLogs = (logs, filename = 'core-diagnostics-logs.json') => {
    const blob = prepareLogsForDownload(logs);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    
    // Anexar ao documento, clicar e remover
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Liberar o URL para evitar memory leak
    URL.revokeObjectURL(url);
  };