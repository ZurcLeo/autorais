import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { Alert,
    AlertTitle,
    Box,
    IconButton,
    MenuItem,
    Select,
    TextField,
    Typography,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Collapse, // Import Collapse
    Divider } from '@mui/material';
import { Virtuoso } from 'react-virtuoso';
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DownloadIcon from '@mui/icons-material/Download';
import TuneIcon from '@mui/icons-material/Tune';
import TimelineIcon from '@mui/icons-material/Timeline';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close'; // Import CloseIcon

const ANIMATION_DURATION = 150;

// Cache de logs para melhorar performance
const LogCache = {
  data: new Map(),
  maxSize: 1000,
  add(key, value) {
    if (this.data.size >= this.maxSize) {
      const firstKey = this.data.keys().next().value;
      this.data.delete(firstKey);
    }
    this.data.set(key, value);
  },
  get(key) {
    return this.data.get(key);
  }
};

// Componente de feedback visual para notificações
const FeedbackOverlay = ({ message, type = 'info' }) => (
    <Alert variant={type} className="fixed top-4 right-4 animate-in fade-in slide-in-from-top-5">
      <AlertTitle>{type === 'error' ? 'Error' : 'Info'}</AlertTitle>
      <Typography>{message}</Typography>
    </Alert>
  );

const LogItem = ({ log, logLevelClassName, isExpanded, onToggleExpand }) => (
    <Accordion expanded={isExpanded} onChange={onToggleExpand} TransitionProps={{ unmountOnExit: true }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`log-content-${log.timestamp}`} id={`log-header-${log.timestamp}`}>
            <Typography variant="body2" fontFamily="monospace" color={logLevelClassName}>
                [{log.timestamp}] {log.message}
            </Typography>
        </AccordionSummary>
        <AccordionDetails>
            <Typography variant="caption" color="textSecondary">
                <strong>Type:</strong> {log.type} | <strong>Severity:</strong> {log.severity} | <strong>Component:</strong> {log.component}
            </Typography>
            {log.data && (
                <Typography variant="caption" color="textSecondary">
                    <strong>Data:</strong> <pre style={{ fontFamily: 'monospace', margin: 0 }}>{JSON.stringify(log.data, null, 2)}</pre>
                </Typography>
            )}
            {log.metadata && (
                <Typography variant="caption" color="textSecondary">
                    <strong>Metadata:</strong> <pre style={{ fontFamily: 'monospace', margin: 0 }}>{JSON.stringify(log.metadata, null, 2)}</pre>
                </Typography>
            )}
        </AccordionDetails>
    </Accordion>
);

export const DiagnosticsView = ({
  logs,
  clearLogsHandler,
  togglePause,
  isPaused,
  filterLevel,
  setFilterLevel,
  searchTerm,
  setSearchTerm,
  logLevelsArray,
  getLogLevelClassName,
  downloadLogs,
  timeFilterRange,
  setTimeFilterRange,
  componentFilter,
  setComponentFilter,
  uniqueComponents,
  minSeverityLevel,
  setMinSeverityLevel
}) => {
  const virtuosoRef = useRef(null);
  const [feedback, setFeedback] = useState(null);
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const searchDebounceRef = useRef(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true); // Estado para controlar a visibilidade do painel

  // Gerenciador de feedback
  const showFeedback = useCallback((message, type = 'info') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  const handleClearLogs = useCallback(() => {
    clearLogsHandler();
    showFeedback('Logs cleared successfully');
  }, [clearLogsHandler, showFeedback]);

    // Handlers com feedback
    const handleDownload = useCallback(() => {
        downloadLogs();
        showFeedback('Preparing logs for download...');
      }, [downloadLogs, showFeedback]);
    
      const handleTogglePause = useCallback(() => {
        togglePause();
        showFeedback(isPaused ? 'Log tracking resumed' : 'Log tracking paused');
      }, [togglePause, isPaused, showFeedback]);
    
      const handleTogglePanel = useCallback(() => {
        setIsPanelOpen(prev => !prev);
      }, []);

  // Configuração de atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'l') {
        handleClearLogs();
      } else if (e.ctrlKey && e.key === 'p') {
        handleTogglePause();
      } else if (e.ctrlKey && e.key === 'd') {
        handleDownload();
      } else if (e.ctrlKey && e.key === 'o') { // Atalho para abrir/recolher (Ctrl+O)
        setIsPanelOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleClearLogs, handleTogglePause, handleDownload]); // Adicionado dependências relevantes


  // Otimização: Memoize logs filtrados
  const filteredLogs = useMemo(() => {
    const cacheKey = `${filterLevel}-${searchTerm}-${timeFilterRange}-${componentFilter}`;
    const cached = LogCache.get(cacheKey);

    if (cached) return cached;

    const filtered = logs.filter(log => {
      if (filterLevel !== 'ALL' && log.type !== filterLevel) return false;
      if (componentFilter !== 'ALL' && log.component !== componentFilter) return false;
      if (searchTerm && !JSON.stringify(log).toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

    LogCache.add(cacheKey, filtered);
    return filtered;
  }, [logs, filterLevel, searchTerm, timeFilterRange, componentFilter]);

  // Otimização: Throttle de pesquisa
  const handleSearchChange = useCallback((e) => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(() => {
      setSearchTerm(e.target.value);
    }, 300);
  }, [setSearchTerm]);

  // Handler para expansão de logs
  const handleLogExpand = useCallback((logId) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  }, []);

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: 500,
        transition: `all ${ANIMATION_DURATION}ms ease-in-out`,
        overflow: 'hidden', // Garante que o conteúdo dentro de Collapse não vaze para fora do Paper
        zIndex: 1300,
        ...(isPanelOpen ? { // Estilos quando o painel está aberto
          maxHeight: '80vh',
          p: 2,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 8
          }
        } : { // Estilos quando o painel está recolhido
          maxHeight: 'auto', // Altura automática para caber o cabeçalho
          p: 2,
          cursor: 'pointer', // Indica que é clicável para expandir
          '&:hover': {
            boxShadow: 4, // Menos destaque no hover quando recolhido
          },
        }),
      }}
      role="region"
      aria-label="Diagnostics Panel"
      onClick={!isPanelOpen ? handleTogglePanel : undefined} // Permite expandir ao clicar no Paper recolhido
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', userSelect: 'none' }}>
          <TuneIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Core Diagnostics Panel
        </Typography>
        <IconButton
          onClick={handleTogglePanel}
          aria-label={isPanelOpen ? 'Recolher Painel de Diagnóstico' : 'Expandir Painel de Diagnóstico'}
          title={isPanelOpen ? 'Recolher Painel de Diagnóstico' : 'Expandir Painel de Diagnóstico'}
        >
          {isPanelOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {feedback && <FeedbackOverlay {...feedback} />}

      <Collapse in={isPanelOpen} timeout={ANIMATION_DURATION} unmountOnExit>
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" gap={1} sx={{
              '& .MuiIconButton-root': {
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                }
              }
            }}>
              <IconButton color="error" onClick={handleClearLogs} aria-label="Limpar Logs" title="Limpar Logs">
                <DeleteIcon />
              </IconButton>
              <IconButton color={isPaused ? "warning" : "primary"} onClick={handleTogglePause} aria-label={isPaused ? 'Resumir Logs' : 'Pausar Logs'} title={isPaused ? 'Resumir Logs' : 'Pausar Logs'}>
                {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
              </IconButton>
              <IconButton color="info" onClick={handleDownload} aria-label="Download Logs" title="Download Logs">
                <DownloadIcon />
              </IconButton>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary" align="right">
                Displaying last {filteredLogs.length} logs
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Filters <FilterListIcon sx={{ ml: 0.5, verticalAlign: 'middle' }} /></Typography>
              <Select
                fullWidth
                size="small"
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                sx={{ mb: 1 }}
              >
                <MenuItem value="ALL">All Levels</MenuItem>
                {logLevelsArray.map(level => (
                  <MenuItem key={level} value={level}>{level}</MenuItem>
                ))}
              </Select>
              <Select
                fullWidth
                size="small"
                value={timeFilterRange}
                onChange={(e) => setTimeFilterRange(e.target.value)}
                sx={{ mb: 1 }}
              >
                <MenuItem value="ALL">All Time</MenuItem>
                <MenuItem value="LAST_MINUTE">Last Minute</MenuItem>
                <MenuItem value="LAST_5_MINUTES">Last 5 Minutes</MenuItem>
                <MenuItem value="LAST_HOUR">Last Hour</MenuItem>
              </Select>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Component <TimelineIcon sx={{ ml: 0.5, verticalAlign: 'middle' }} /></Typography>
              <Select
                fullWidth
                size="small"
                value={componentFilter}
                onChange={(e) => setComponentFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Components</MenuItem>
                {uniqueComponents.map(component => (
                  <MenuItem key={component} value={component}>{component}</MenuItem>
                ))}
              </Select>
            </Box>
          </Box>

          <TextField
            fullWidth
            size="small"
            label="Search Logs"
            variant="outlined"
            onChange={handleSearchChange}
            sx={{ mb: 2 }}
          />

          <Box sx={{ height: 400 }}>
            <Virtuoso
              ref={virtuosoRef}
              data={filteredLogs}
              itemContent={(index, log) => (
                <LogItem
                  log={log}
                  logLevelClassName={getLogLevelClassName(log.type)}
                  isExpanded={expandedLogs.has(log.timestamp)}
                  onToggleExpand={() => handleLogExpand(log.timestamp)}
                />
              )}
              followOutput={!isPaused}
              alignToBottom
            />
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};