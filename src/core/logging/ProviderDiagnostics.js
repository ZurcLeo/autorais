// src/core/logging/ProviderDiagnostics.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LOG_LEVELS, LOG_CONFIG, SEVERITY_LEVELS, SEVERITY_TO_LOG_LEVEL } from '../../core/constants/config';
import { coreLogger } from './CoreLogger';
import { DiagnosticsView } from './DiagnosticsView';
import { 
  filterLogs, 
  extractUniqueComponents, 
  getLogLevelClassName, 
  downloadLogs as downloadLogsUtil
} from './logFilterUtils';

export const ProviderDiagnostics = () => {
    // Estado para armazenar logs
    const [logs, setLogs] = useState(() => {
        try {
            const initialLogs = coreLogger.getSnapshot();
            console.debug('Initial logs from snapshot:', initialLogs?.length || 0);
            return initialLogs || [];
        } catch (error) {
            console.error('Error getting initial logs:', error);
            return [];
        }
    });

    // Estados para filtros
    const [filterLevel, setFilterLevel] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [isPaused, setIsPaused] = useState(false);
    const [timeFilterRange, setTimeFilterRange] = useState('ALL');
    const [componentFilter, setComponentFilter] = useState('ALL');
    
    // Estado para nível de severidade mínimo
    const initialSeverityLevel = SEVERITY_TO_LOG_LEVEL[LOG_CONFIG.minSeverity] || LOG_LEVELS.DEBUG;
    const [minSeverityLevel, setMinSeverityLevel] = useState(initialSeverityLevel);

    // Array de níveis de log disponíveis
    const logLevelsArray = useMemo(() => Object.values(LOG_LEVELS), []);

    // Handler para limpar logs
    const clearLogsHandler = useCallback(() => {
        try {
            coreLogger.clear();
            setLogs([]);
        } catch (error) {
            console.error('Error clearing logs:', error);
        }
    }, []);

    // Handler para alteração do nível de severidade mínimo
    const setMinSeverityLevelHandler = useCallback((level) => {
        setMinSeverityLevel(level);
        const severityValue = SEVERITY_LEVELS[level];
        
        if (severityValue !== undefined) {
            LOG_CONFIG.minSeverity = severityValue;
            coreLogger.logEvent('ProviderDiagnostics', LOG_LEVELS.INFO, 
                `Minimum severity level changed to: ${level} (Severity: ${severityValue})`);
        } else {
            console.warn('Invalid log level selected:', level);
        }
    }, []);

    // Effect para subscrição aos logs
    useEffect(() => {
        // Flag para controlar se o componente está montado
        let isMounted = true;
        
        // Não subscrever se estiver pausado
        if (isPaused) {
            return () => { isMounted = false; };
        }
        
        // Inicializar logger
        const initializeLogger = async () => {
            if(!coreLogger.initialize()) {
            try {
                await coreLogger.initialize();
            } catch (error) {
                throw 'Failed to initialize logger:', error;
            }}
        };
        
        // Chamar inicialização
        initializeLogger();
        
        // Subscriber para atualizar logs
        const unsubscribe = coreLogger.subscribe((newLogs) => {
            if (isMounted) {
                setLogs(newLogs);
            }
        });
        
        // Cleanup da subscription
        return () => {
            isMounted = false;
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, [isPaused]);

    // Logs filtrados com memoização
    const filteredLogs = useMemo(() => {
        return filterLogs(logs, {
            filterLevel,
            searchTerm,
            timeFilterRange,
            componentFilter
        });
    }, [logs, filterLevel, searchTerm, timeFilterRange, componentFilter]);

    // Componentes únicos para o filtro
    const uniqueComponents = useMemo(() => {
        return extractUniqueComponents(logs);
    }, [logs]);

    // Handler para alternar pausa
    const togglePause = useCallback(() => {
        setIsPaused(prev => {
            const newState = !prev;
            coreLogger.logEvent('ProviderDiagnostics', LOG_LEVELS.INFO, 
                `Log display ${newState ? 'paused' : 'resumed'}`);
            return newState;
        });
    }, []);

    // Handler para download de logs
    const handleDownloadLogs = useCallback(() => {
        try {
            downloadLogsUtil(filteredLogs);
            coreLogger.logEvent('ProviderDiagnostics', LOG_LEVELS.INFO, 
                'Logs downloaded', { count: filteredLogs.length });
        } catch (error) {
            console.error('Error downloading logs:', error);
            coreLogger.logServiceError('ProviderDiagnostics', error, 
                { action: 'downloadLogs' });
        }
    }, [filteredLogs]);

    // Renderização do componente DiagnosticsView
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
            downloadLogs={handleDownloadLogs}
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

export default ProviderDiagnostics;