// src/core/debug/ErrorsPanel.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  IconButton,
  Divider,
  Collapse,
  Paper,
  Switch,
  FormControlLabel,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Delete as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  BugReport as SimulateIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useErrorBoundary } from '../../hooks/error/useErrorBoundary';

// Componente para exibir formatação de stack trace
const StackTraceView = ({ stack }) => {
  const theme = useTheme();
  
  if (!stack) return null;
  
  const lines = stack.split('\n');
  
  return (
    <Box 
      sx={{ 
        fontFamily: 'monospace',
        fontSize: '12px',
        maxHeight: 200,
        overflow: 'auto',
        backgroundColor: theme.palette.background.default,
        p: 1,
        borderRadius: 1
      }}
    >
      {lines.map((line, index) => (
        <Box 
          key={index} 
          sx={{ 
            color: index === 0 ? theme.palette.error.main : theme.palette.text.secondary,
            fontWeight: index === 0 ? 'bold' : 'normal',
            pl: index === 0 ? 0 : 2,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {line}
        </Box>
      ))}
    </Box>
  );
};

// Componente para exibir metadados de erro
const ErrorMetadata = ({ metadata }) => {
  const theme = useTheme();
  
  if (!metadata || Object.keys(metadata).length === 0) return null;
  
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary">Metadados:</Typography>
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 1, 
          mt: 0.5,
          backgroundColor: theme.palette.background.default
        }}
      >
        {Object.entries(metadata).map(([key, value]) => (
          <Box key={key} sx={{ display: 'flex', mb: 0.5 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.info.main,
                fontFamily: 'monospace',
                fontWeight: 'bold', 
                width: 100
              }}
            >
              {key}:
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                fontFamily: 'monospace',
                wordBreak: 'break-word'
              }}
            >
              {typeof value === 'object' 
                ? JSON.stringify(value, null, 2) 
                : String(value)
              }
            </Typography>
          </Box>
        ))}
      </Paper>
    </Box>
  );
};

export const ErrorsPanel = ({ addNotification }) => {
  const theme = useTheme();
  const { errors, clearError, clearAllErrors, setError } = useErrorBoundary();
  const [expanded, setExpanded] = useState({});
  const [showControls, setShowControls] = useState(false);
  const [errorType, setErrorType] = useState('rendering');
  const [errorMessage, setErrorMessage] = useState('Erro simulado');
  
  // Notificar quando novos erros forem adicionados
  useEffect(() => {
    if (errors.length > 0 && typeof addNotification === 'function') {
      addNotification('errors');
    }
  }, [errors, addNotification]);
  
  // Expandir/colapsar detalhes de um erro
  const handleToggleExpand = useCallback((id) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);
  
  // Limpar todos os erros
  const handleClearAll = useCallback(() => {
    clearAllErrors();
  }, [clearAllErrors]);
  
  // Remover um erro específico
  const handleRemoveError = useCallback((id) => {
    clearError(id);
  }, [clearError]);
  
  // Mostrar/esconder controles de simulação
  const toggleControls = useCallback(() => {
    setShowControls(prev => !prev);
  }, []);
  
  // Simular um erro para testes
  const handleSimulateError = useCallback(() => {
    switch (errorType) {
      case 'rendering':
        try {
          throw new Error(errorMessage || 'Erro de renderização simulado');
        } catch (err) {
          setError(err, { source: 'ErrorsPanel' });
        }
        break;
        
      case 'async':
        setTimeout(() => {
          try {
            throw new Error(errorMessage || 'Erro assíncrono simulado');
          } catch (err) {
            setError(err, { source: 'ErrorsPanel' });
          }
        }, 100);
        break;
        
      case 'network':
        const networkError = new Error(errorMessage || 'Erro de rede simulado');
        networkError.name = 'NetworkError';
        setError(networkError, { 
          source: 'ErrorsPanel',
          metadata: { 
            status: 500, 
            endpoint: '/api/example', 
            method: 'GET'
          }
        });
        break;
        
      case 'validation':
        const validationError = new Error(errorMessage || 'Erro de validação simulado');
        validationError.name = 'ValidationError';
        setError(validationError, { 
          source: 'ErrorsPanel',
          metadata: { 
            fields: ['email', 'password'],
            messages: {
              email: 'Formato de email inválido',
              password: 'Senha muito curta'
            }
          }
        });
        break;
        
      default:
        setError(new Error(errorMessage || 'Erro genérico'), { source: 'ErrorsPanel' });
    }
  }, [errorType, errorMessage, setError]);
  
  // Exportar erro para o console
  const handleLogErrorToConsole = useCallback((error) => {
    console.group(`Debug Error: ${error.name || 'Error'}`);
    console.log('Message:', error.message);
    console.log('Timestamp:', format(new Date(error.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS'));
    console.log('Source:', error.source || 'Unknown');
    
    if (error.metadata) {
      console.log('Metadata:', error.metadata);
    }
    
    if (error.stack) {
      console.log('Stack trace:');
      console.log(error.stack);
    }
    
    console.groupEnd();
  }, []);
  
  // Ícone apropriado para o tipo de erro
  const getSeverityIcon = useCallback((severity) => {
    switch (severity) {
      case 'error':
        return <ErrorIcon color="error" fontSize="small" />;
      case 'warning':
        return <WarningIcon color="warning" fontSize="small" />;
      default:
        return <InfoIcon color="info" fontSize="small" />;
    }
  }, []);
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Controls header */}
      <Box sx={{ 
        p: 1, 
        display: 'flex', 
        justifyContent: 'space-between',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="subtitle2">
        {errors ? (errors.length === 0 ? 'Sem erros' : `Erros (${errors.length})`) : 'Sem erros'}
        </Typography>
        <Box>
          <IconButton 
            size="small" 
            onClick={toggleControls}
            title="Simular Erro"
          >
            <SimulateIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={handleClearAll}
            disabled={errors.length === 0}
            title="Limpar Todos"
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      {/* Error simulation controls */}
      <Collapse in={showControls}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, zIndex: 9999, }}>
          <Typography variant="subtitle2" gutterBottom>
            Simular Erro
          </Typography>
          
          <FormControl fullWidth size="small" sx={{ mb: 1 }}>
            <InputLabel id="error-type-label">Tipo de Erro</InputLabel>
            <Select
              labelId="error-type-label"
              value={errorType}
              label="Tipo de Erro"
              onChange={(e) => setErrorType(e.target.value)}
            >
              <MenuItem value="rendering">Erro de Renderização</MenuItem>
              <MenuItem value="async">Erro Assíncrono</MenuItem>
              <MenuItem value="network">Erro de Rede</MenuItem>
              <MenuItem value="validation">Erro de Validação</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            size="small"
            label="Mensagem de Erro"
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Button 
            variant="contained" 
            color="error" 
            size="small"
            onClick={handleSimulateError}
            fullWidth
          >
            Disparar Erro
          </Button>
        </Box>
      </Collapse>
      
      {/* Error list */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {errors.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Nenhum erro capturado.
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
              Use o botão acima para simular erros para teste.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {errors.map(err => (
              <React.Fragment key={err.id}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{
                    borderLeft: `4px solid ${
                      err.severity === 'warning' 
                        ? theme.palette.warning.main 
                        : theme.palette.error.main
                    }`,
                    m: 1,
                    borderRadius: 1,
                    boxShadow: 1
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, zIndex: 9994 }}>
                    {getSeverityIcon(err.severity || 'error')}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" component="span" fontWeight="bold">
                          {err.name || 'Error'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(err.timestamp), 'HH:mm:ss')}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography 
                        variant="body2" 
                        color="text.primary"
                        sx={{ wordBreak: 'break-word' }}
                      >
                        {err.message}
                        {err.source && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Origem: {err.source}
                          </Typography>
                        )}
                      </Typography>
                    }
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleRemoveError(err.id)}
                      title="Remover"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => handleToggleExpand(err.id)}
                      title={expanded[err.id] ? "Ocultar Detalhes" : "Mostrar Detalhes"}
                    >
                      {expanded[err.id] ? (
                        <ExpandLessIcon fontSize="small" />
                      ) : (
                        <ExpandMoreIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Box>
                </ListItem>
                
                <Collapse in={expanded[err.id]} timeout="auto" unmountOnExit>
                  <Box sx={{ ml: 6, mr: 2, mb: 2 }}>
                    {err.stack && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">Stack trace:</Typography>
                        <StackTraceView stack={err.stack} />
                      </Box>
                    )}
                    
                    {err.metadata && <ErrorMetadata metadata={err.metadata} />}
                    
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        startIcon={<CodeIcon />}
                        onClick={() => handleLogErrorToConsole(err)}
                      >
                        Ver no Console
                      </Button>
                      
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="error"
                        startIcon={<ClearIcon />}
                        onClick={() => handleRemoveError(err.id)}
                      >
                        Descartar
                      </Button>
                    </Box>
                  </Box>
                </Collapse>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};