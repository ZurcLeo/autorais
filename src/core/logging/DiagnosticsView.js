import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { 
  Alert,
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
  Collapse,
  Divider,
  Tooltip 
} from '@mui/material';
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
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';

// Configurações de Animação
const ANIMATION_DURATION = 150;

/**
 * Componente de sobreposição para feedback visual
 */
const FeedbackOverlay = ({ message, type = 'info', onClose }) => (
  <Alert 
    variant={type} 
    sx={{
      position: 'fixed', 
      top: '1rem', 
      right: '1rem', 
      zIndex: 9996,
      animation: 'fadeInDown 0.3s ease-out'
    }}
    action={
      <IconButton 
        color="inherit" 
        size="small" 
        onClick={onClose}
      >
        <CloseIcon fontSize="inherit" />
      </IconButton>
    }
  >
    <AlertTitle>{type === 'error' ? 'Erro' : 'Informação'}</AlertTitle>
    <Typography>{message}</Typography>
  </Alert>
);

/**
 * Componente de item de log para uso na lista virtualizada
 */
const LogItem = ({ log, logLevelClassName, isExpanded, onToggleExpand }) => (
  <Accordion 
    expanded={isExpanded} 
    onChange={onToggleExpand} 
    TransitionProps={{ unmountOnExit: true }}
    sx={{ mb: 1 }}
  >
    <AccordionSummary 
      expandIcon={<ExpandMoreIcon />} 
      aria-controls={`log-content-${log.timestamp}`} 
      id={`log-header-${log.timestamp}`}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        width: '100%', 
        overflow: 'hidden' 
      }}>
        <Typography 
          variant="body2" 
          fontFamily="monospace" 
          color={logLevelClassName}
          sx={{ 
            flexShrink: 0, 
            mr: 1, 
            p: '2px 6px', 
            borderRadius: '4px', 
            bgcolor: `${logLevelClassName}.light`,
            color: `${logLevelClassName}.contrastText`,
            width: '80px',
            textAlign: 'center'
          }}
        >
          {log.type}
        </Typography>
        <Typography 
          variant="body2" 
          noWrap
          sx={{ 
            flexGrow: 1, 
            overflow: 'hidden', 
            textOverflow: 'ellipsis' 
          }}
        >
          {log.message}
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            ml: 1, 
            flexShrink: 0, 
            fontSize: '0.75rem' 
          }}
        >
          {new Date(log.timestamp).toLocaleTimeString()}
        </Typography>
      </Box>
    </AccordionSummary>
    
    <AccordionDetails>
      <Box sx={{ pl: 2 }}>
        <Typography variant="body2" gutterBottom>
          <strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Type:</strong> {log.type} | <strong>Severity:</strong> {log.severity}
        </Typography>
        {log.component && (
          <Typography variant="body2" gutterBottom>
            <strong>Component:</strong> {log.component}
          </Typography>
        )}
        
        {log.data && (
  <Box sx={{ mt: 1 }}>
    <Typography variant="body2" fontWeight="bold" gutterBottom>
      Data:
    </Typography>
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 1, 
        maxHeight: '200px', 
        overflow: 'auto', 
        bgcolor: 'background.default' 
      }}
    >
      <pre style={{ 
        fontFamily: 'monospace', 
        margin: 0, 
        fontSize: '0.8rem',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {/* Garantir que o conteúdo seja sempre uma string */}
        {typeof log.data === 'object' 
          ? JSON.stringify(log.data, null, 2) 
          : String(log.data)}
      </pre>
    </Paper>
  </Box>
)}
        
        {log.metadata && Object.keys(log.metadata).length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Metadata:
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 1, 
                maxHeight: '200px', 
                overflow: 'auto', 
                bgcolor: 'background.default' 
              }}
            >
              <pre style={{ 
                fontFamily: 'monospace', 
                margin: 0, 
                fontSize: '0.8rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </Paper>
          </Box>
        )}
      </Box>
    </AccordionDetails>
  </Accordion>
);

/**
 * Componente principal para visualização e interação com logs de diagnóstico
 * @param {Object} props - Props do componente
 * @param {Array} props.logs - Array de logs a serem exibidos
 * @param {Function} props.clearLogsHandler - Função para limpar logs
 * @param {Function} props.togglePause - Função para pausar/retomar logs
 * @param {Boolean} props.isPaused - Estado atual de pausa
 * @param {String} props.filterLevel - Filtro atual por nível
 * @param {Function} props.setFilterLevel - Função para alterar filtro por nível
 * @param {String} props.searchTerm - Termo de busca atual
 * @param {Function} props.setSearchTerm - Função para alterar termo de busca
 * @param {Array} props.logLevelsArray - Array com níveis de log disponíveis
 * @param {Function} props.getLogLevelClassName - Função para obter classe CSS por nível
 * @param {Function} props.downloadLogs - Função para baixar logs
 * @param {String} props.timeFilterRange - Filtro de intervalo de tempo
 * @param {Function} props.setTimeFilterRange - Função para alterar filtro de tempo
 * @param {String} props.componentFilter - Filtro atual por componente
 * @param {Function} props.setComponentFilter - Função para alterar filtro por componente
 * @param {Array} props.uniqueComponents - Array de componentes únicos
 * @param {String} props.minSeverityLevel - Nível mínimo de severidade
 * @param {Function} props.setMinSeverityLevel - Função para alterar nível mínimo
 */
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
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [searchValue, setSearchValue] = useState('');

  // Função para mostrar feedback temporário
  const showFeedback = useCallback((message, type = 'info') => {
    setFeedback({ message, type });
    // Feedback desaparece após 3 segundos
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  // Handler para limpar logs
  const handleClearLogs = useCallback(() => {
    clearLogsHandler();
    showFeedback('Logs limpos com sucesso');
  }, [clearLogsHandler, showFeedback]);

  // Handler para download dos logs
  const handleDownload = useCallback(() => {
    try {
      downloadLogs();
      showFeedback('Preparando logs para download...');
    } catch (error) {
      console.error('Error downloading logs:', error);
      showFeedback(`Erro ao baixar logs: ${error.message}`, 'error');
    }
  }, [downloadLogs, showFeedback]);

  // Handler para alternar pausa
  const handleTogglePause = useCallback(() => {
    togglePause();
    showFeedback(isPaused ? 'Monitoramento de logs retomado' : 'Monitoramento de logs pausado');
  }, [togglePause, isPaused, showFeedback]);

  // Handler para alternar visibilidade do painel
  const handleTogglePanel = useCallback(() => {
    setIsPanelOpen(prev => !prev);
  }, []);

  // Configuração de atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Só processa quando o foco não está em um campo de entrada
      const activeElement = document.activeElement;
      const isInputFocused = activeElement.tagName === 'INPUT' || 
                             activeElement.tagName === 'TEXTAREA' || 
                             activeElement.isContentEditable;
      
      if (isInputFocused) return;
      
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        handleClearLogs();
      } else if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        handleTogglePause();
      } else if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        handleDownload();
      } else if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        setIsPanelOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleClearLogs, handleTogglePause, handleDownload]);

  // Handler para atualizar o termo de busca com debounce
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchValue(value);
    
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    searchDebounceRef.current = setTimeout(() => {
      setSearchTerm(value);
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

  // Contadores de logs por tipo
  const logCounts = useMemo(() => {
    const counts = { ALL: logs.length };
    
    logs.forEach(log => {
      const type = log.type || 'UNKNOWN';
      counts[type] = (counts[type] || 0) + 1;
    });
    
    return counts;
  }, [logs]);

  // Fechar feedback manualmente
  const handleCloseFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  // Componente principal a ser renderizado
  return (
    <Paper
      elevation={4}
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: 500,
        transition: `all ${ANIMATION_DURATION}ms ease-in-out`,
        overflow: 'hidden',
        zIndex: 1300,
        ...(isPanelOpen ? {
          maxHeight: '80vh',
          p: 2,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 8
          }
        } : {
          maxHeight: 'auto',
          p: 2,
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 4,
          },
        }),
      }}
      role="region"
      aria-label="Diagnostics Panel"
      onClick={!isPanelOpen ? handleTogglePanel : undefined}
    >
      {feedback && <FeedbackOverlay {...feedback} onClose={handleCloseFeedback} />}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', userSelect: 'none', display: 'flex', alignItems: 'center' }}>
          <TuneIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> 
          Core Diagnostics
          <Tooltip title="Atalhos: Ctrl+L (Limpar), Ctrl+P (Pausar), Ctrl+D (Download), Ctrl+O (Abrir/Fechar)">
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
        
        <IconButton
          onClick={handleTogglePanel}
          aria-label={isPanelOpen ? 'Recolher Painel de Diagnóstico' : 'Expandir Painel de Diagnóstico'}
          title={isPanelOpen ? 'Recolher Painel de Diagnóstico' : 'Expandir Painel de Diagnóstico'}
        >
          {isPanelOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

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
              <Tooltip title="Limpar logs (Ctrl+L)">
                <IconButton color="error" onClick={handleClearLogs} aria-label="Limpar Logs">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={isPaused ? "Retomar logs (Ctrl+P)" : "Pausar logs (Ctrl+P)"}>
                <IconButton color={isPaused ? "warning" : "primary"} onClick={handleTogglePause} aria-label={isPaused ? 'Resumir Logs' : 'Pausar Logs'}>
                  {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Download logs (Ctrl+D)">
                <IconButton color="info" onClick={handleDownload} aria-label="Download Logs">
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="textSecondary" align="right">
                {logs.length === 0 ? (
                  "Nenhum log disponível"
                ) : (
                  `${logs.length} logs disponíveis`
                )}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                Filtros <FilterListIcon sx={{ ml: 0.5, verticalAlign: 'middle', fontSize: 'small' }} />
              </Typography>
              
              <Select
                fullWidth
                size="small"
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                sx={{ mb: 1 }}
              >
                <MenuItem value="ALL">Todos os níveis ({logCounts.ALL || 0})</MenuItem>
                {logLevelsArray.map(level => (
                  <MenuItem key={level} value={level}>
                    {level} ({logCounts[level] || 0})
                  </MenuItem>
                ))}
              </Select>
              
              <Select
                fullWidth
                size="small"
                value={timeFilterRange}
                onChange={(e) => setTimeFilterRange(e.target.value)}
                sx={{ mb: 1 }}
              >
                <MenuItem value="ALL">Todo o período</MenuItem>
                <MenuItem value="LAST_MINUTE">Último minuto</MenuItem>
                <MenuItem value="LAST_5_MINUTES">Últimos 5 minutos</MenuItem>
                <MenuItem value="LAST_HOUR">Última hora</MenuItem>
              </Select>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                Componente <TimelineIcon sx={{ ml: 0.5, verticalAlign: 'middle', fontSize: 'small' }} />
              </Typography>
              
              <Select
                fullWidth
                size="small"
                value={componentFilter}
                onChange={(e) => setComponentFilter(e.target.value)}
              >
                <MenuItem value="ALL">Todos os componentes</MenuItem>
                {uniqueComponents.filter(comp => comp !== 'ALL').map(component => (
                  <MenuItem key={component} value={component}>{component}</MenuItem>
                ))}
              </Select>
              
              <TextField
                fullWidth
                size="small"
                label="Pesquisar logs"
                variant="outlined"
                value={searchValue}
                onChange={handleSearchChange}
                sx={{ mt: 1 }}
                InputProps={{
                  endAdornment: searchValue ? (
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setSearchValue('');
                        setSearchTerm('');
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ) : null
                }}
              />
            </Box>
          </Box>

          <Box sx={{ height: 400, mt: 2 }}>
            {logs.length === 0 ? (
              <Box 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexDirection: 'column',
                  p: 2,
                  textAlign: 'center'
                }}
              >
                <Typography color="text.secondary" gutterBottom>
                  Nenhum log disponível
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Os logs aparecerão aqui conforme são gerados pela aplicação
                </Typography>
              </Box>
            ) : (
              <Virtuoso
                ref={virtuosoRef}
                data={logs}
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
                overscan={200}
              />
            )}
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default DiagnosticsView;