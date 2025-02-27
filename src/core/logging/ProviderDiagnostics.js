// ProviderDiagnostics.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { LOG_LEVELS, LOG_CONFIG, SEVERITY_LEVELS, SEVERITY_TO_LOG_LEVEL } from '../../reducers/metadata/metadataReducer';
import { coreLogger } from './CoreLogger';
import { DiagnosticsView } from './DiagnosticsView';

export const ProviderDiagnostics = () => {
    // Garantir inicialização do estado com logs existentes
    const [logs, setLogs] = useState(() => {
        const initialLogs = coreLogger.getSnapshot();
        console.debug('Initial logs from snapshot:', initialLogs?.length || 0);
        return initialLogs || [];
    });
    const [filterLevel, setFilterLevel] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [isPaused, setIsPaused] = useState(false);
    const [timeFilterRange, setTimeFilterRange] = useState('ALL');
    const [componentFilter, setComponentFilter] = useState('ALL');
    const initialSeverityLevel = SEVERITY_TO_LOG_LEVEL[LOG_CONFIG.minSeverity] || LOG_LEVELS.DEBUG;
    const [minSeverityLevel, setMinSeverityLevel] = useState(initialSeverityLevel);

    const setMinSeverityLevelHandler = (level) => {
        setMinSeverityLevel(level);
        const severityValue = SEVERITY_LEVELS[level];
        if (severityValue !== undefined) {
            LOG_CONFIG.minSeverity = severityValue;
            coreLogger.logEvent('ProviderDiagnostics', LOG_LEVELS.INFO, 
                `Minimum severity level changed to: ${level} (Severity: ${severityValue})`);
        } else {
            console.warn('Invalid log level selected:', level);
        }
    };

    const logLevelsArray = Object.values(LOG_LEVELS);
    const timeRanges = {
        LAST_MINUTE: 60 * 1000,
        LAST_5_MINUTES: 5 * 60 * 1000,
        LAST_HOUR: 60 * 60 * 1000,
    };

    const clearLogsHandler = useCallback(() => {
        coreLogger.clear();
        setLogs([]);
    }, []);

    useEffect(() => {
      let mounted = true;
      let unsubscribe; // Ref para a função de unsubscribe
  
      const initialize = async () => {
          try {
              await coreLogger.initialize();
              if (!mounted) return;
  
              // Configurar subscriber
              unsubscribe = coreLogger.subscribe((newLogs) => { /* ... */ });
          } catch (error) { /* ... */ }
      };
  
      initialize();
  
      return () => {
          mounted = false;
          if (unsubscribe) { // ✅ Chama a função de unsubscribe diretamente
              unsubscribe();
          }
      };
  }, [isPaused]);

    const getFilteredLogs = useCallback(() => {
        const totalLogs = logs?.length || 0;
        console.debug('Filtering logs:', {
            totalLogs,
            filterLevel,
            timeFilterRange,
            componentFilter,
            hasSearchTerm: !!searchTerm
        });
        
        // Garantir que temos logs para filtrar
        if (!logs || totalLogs === 0) {
            console.debug('No logs available to filter');
            return [];
        }
        
        // Se não há filtros ativos, retornar todos os logs
        if (filterLevel === 'ALL' && 
            timeFilterRange === 'ALL' && 
            componentFilter === 'ALL' && 
            !searchTerm) {
            console.debug('Returning all logs without filtering');
            return logs;
        }
        
        return logs.filter(log => {
            // Verificar filtro de tempo
            if (timeFilterRange !== 'ALL') {
                const timeWindow = timeRanges[timeFilterRange];
                if (timeWindow) {
                    const cutoffTime = Date.now() - timeWindow;
                    if (new Date(log.timestamp).getTime() <= cutoffTime) {
                        return false;
                    }
                }
            }

            // Verificar filtro de componente
            if (componentFilter !== 'ALL' && log.component !== componentFilter) {
                return false;
            }

            // Verificar filtro de nível
            if (filterLevel !== 'ALL' && log.type !== filterLevel) {
                return false;
            }

            // Verificar termo de busca
            if (searchTerm) {
                const searchString = String(log.message).toLowerCase();
                if (!searchString.includes(searchTerm.toLowerCase())) {
                    return false;
                }
            }

            return true;
        });
    }, [logs, timeFilterRange, componentFilter, filterLevel, searchTerm, timeRanges]);

    const filteredLogs = getFilteredLogs();
    const uniqueComponents = ['ALL', ...[...new Set(logs.map(log => log.component).filter(Boolean))]];

    const togglePause = () => {
        setIsPaused(!isPaused);
        coreLogger.logEvent('ProviderDiagnostics', LOG_LEVELS.INFO, 
            `Log display ${isPaused ? 'resumed' : 'paused'}`);
    };

    const getLogLevelClassName = useCallback((logType) => {
        const colorMap = {
            [LOG_LEVELS.ERROR]: 'error',
            [LOG_LEVELS.WARNING]: 'warning',
            [LOG_LEVELS.INFO]: 'primary',
            [LOG_LEVELS.DEBUG]: 'success',
            [LOG_LEVELS.LIFECYCLE]: 'secondary',
            [LOG_LEVELS.INITIALIZATION]: 'info',
            [LOG_LEVELS.PERFORMANCE]: 'warning',
            [LOG_LEVELS.STATE]: 'secondary',
            default: 'textSecondary'
        };
        return colorMap[logType] || colorMap.default;
    }, []);

    const downloadLogs = useCallback(() => {
        const logsData = JSON.stringify(filteredLogs, null, 2);
        const blob = new Blob([logsData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'core-diagnostics-logs.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [filteredLogs]);

    return (
        <DiagnosticsView
            logs={filteredLogs}
            clearLogsHandler={clearLogsHandler}
            togglePause={togglePause}
            isPaused={isPaused}
            filterLevel={filterLevel}
            setFilterLevel={setFilterLevel}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            logLevelsArray={logLevelsArray}
            getLogLevelClassName={getLogLevelClassName}
            downloadLogs={downloadLogs}
            timeFilterRange={timeFilterRange}
            setTimeFilterRange={setTimeFilterRange}
            componentFilter={componentFilter}
            setComponentFilter={setComponentFilter}
            uniqueComponents={uniqueComponents}
            minSeverityLevel={minSeverityLevel}
            setMinSeverityLevel={setMinSeverityLevelHandler}
        />
    );
};