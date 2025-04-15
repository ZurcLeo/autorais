// src/core/debug/StateInspector.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  TextField,
  InputAdornment,
  Paper,
  Tooltip,
  Button,
  Chip,
  Divider,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FileCopy as CopyIcon,
  Save as ExportIcon,
  Code as CodeIcon,
  Delete as ClearIcon
} from '@mui/icons-material';

// Componente para visualização recursiva de objetos
const JsonTreeView = ({ data, initialDepth = 1, maxInitialDepth = 2 }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState({});
  
  // Inicializa os nós expandidos com base na profundidade inicial
  useEffect(() => {
    const initialExpanded = {};
    
    const processNode = (obj, path = '', depth = 0) => {
      if (obj === null || typeof obj !== 'object') return;
      
      // Expandir nós até a profundidade especificada
      if (depth < maxInitialDepth) {
        initialExpanded[path] = true;
      }
      
      // Processar objetos filhos
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          processNode(item, path ? `${path}.${index}` : `${index}`, depth + 1);
        });
      } else {
        Object.entries(obj).forEach(([key, value]) => {
          processNode(value, path ? `${path}.${key}` : key, depth + 1);
        });
      }
    };
    
    processNode(data, '', initialDepth);
    setExpanded(initialExpanded);
  }, [data, initialDepth, maxInitialDepth]);
  
  // Alternar expansão de um nó
  const toggleExpand = (path) => {
    setExpanded(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };
  
  // Renderizar valor baseado no tipo
  const renderValue = (value, path = '') => {
    if (value === null || value === undefined) {
      return <Typography component="span" sx={{ color: theme.palette.text.disabled }}>null</Typography>;
    }
    
    if (typeof value !== 'object') {
      // Renderizar valores primitivos
      if (typeof value === 'string') {
        return <Typography component="span" sx={{ color: theme.palette.success.main, wordBreak: 'break-word' }}>"{value}"</Typography>;
      }
      if (typeof value === 'number') {
        return <Typography component="span" sx={{ color: theme.palette.error.main }}>{value}</Typography>;
      }
      if (typeof value === 'boolean') {
        return <Typography component="span" sx={{ color: theme.palette.warning.main }}>{value.toString()}</Typography>;
      }
      return <Typography component="span">{String(value)}</Typography>;
    }
    
    // Verificar se é um array ou objeto
    const isArray = Array.isArray(value);
    
    // Contar as entradas
    const entries = Object.entries(value);
    
    // Verificar se está vazio
    if (entries.length === 0) {
      return <Typography component="span">{isArray ? '[]' : '{}'}</Typography>;
    }
    
    // Renderizar objeto expansível
    return (
      <Box sx={{ ml: 1 }}>
        <Box 
          onClick={() => toggleExpand(path)} 
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <Typography component="span" sx={{ mr: 1 }}>
            {isArray ? '[' : '{'}
          </Typography>
          <Typography component="span" variant="caption" color="text.secondary">
            {entries.length} {entries.length === 1 ? 'item' : 'items'}
          </Typography>
          <Typography component="span" sx={{ ml: 1 }}>
            {expanded[path] ? '' : (isArray ? '...]' : '...')}
          </Typography>
        </Box>
        
        {expanded[path] && (
          <Box sx={{ 
            ml: 2, 
            borderLeft: `1px dashed ${theme.palette.divider}`, 
            pl: 1 
          }}>
            {entries.map(([key, val], index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}>
                <Typography 
                  component="span" 
                  sx={{ 
                    color: theme.palette.primary.main, 
                    fontWeight: 'medium',
                    minWidth: 50,
                    wordBreak: 'break-word'
                  }}
                >
                  {isArray ? `[${key}]` : key}:
                </Typography>
                <Box sx={{ ml: 1, flex: 1 }}>
                  {renderValue(val, path ? `${path}.${key}` : key)}
                </Box>
              </Box>
            ))}
            <Typography component="span" sx={{ ml: -1 }}>
              {isArray ? ']' : '}'}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };
  
  return renderValue(data);
};

// Métodos auxiliares para obter estado
const getReduxState = () => {
  if (window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__.getState) {
    return window.__REDUX_DEVTOOLS_EXTENSION__.getState();
  }
  if (window.__store && window.__store.getState) {
    return window.__store.getState();
  }
  return null;
};

const getLocalStorage = () => {
  const result = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        // Tentar fazer parse de JSON
        const value = localStorage.getItem(key);
        result[key] = JSON.parse(value);
      } catch (e) {
        result[key] = localStorage.getItem(key);
      }
    }
  } catch (e) {
    console.error('Error accessing localStorage:', e);
  }
  return result;
};

const getSessionStorage = () => {
  const result = {};
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      try {
        // Tentar fazer parse de JSON
        const value = sessionStorage.getItem(key);
        result[key] = JSON.parse(value);
      } catch (e) {
        result[key] = sessionStorage.getItem(key);
      }
    }
  } catch (e) {
    console.error('Error accessing sessionStorage:', e);
  }
  return result;
};

const getCookies = () => {
  const result = {};
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const parts = cookie.split('=');
      const name = parts[0].trim();
      if (name) {
        const value = parts.slice(1).join('=');
        result[name] = value;
      }
    }
  } catch (e) {
    console.error('Error accessing cookies:', e);
  }
  return result;
};

// Componente principal StateInspector
export const StateInspector = ({ addNotification }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('localStorage');
  const [searchTerm, setSearchTerm] = useState('');
  const [stateData, setStateData] = useState({
    redux: null,
    localStorage: null,
    sessionStorage: null,
    cookies: null
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Função para atualizar dados do estado
  const refreshState = useCallback(() => {
    setIsLoading(true);
    
    try {
      setStateData({
        redux: getReduxState(),
        localStorage: getLocalStorage(),
        sessionStorage: getSessionStorage(),
        cookies: getCookies()
      });
    } catch (error) {
      console.error('Error refreshing state data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Carregar dados iniciais
  useEffect(() => {
    refreshState();
    
    // Atualizar periodicamente os dados (a cada 5 segundos)
    const interval = setInterval(refreshState, 5000);
    
    return () => clearInterval(interval);
  }, [refreshState]);
  
  // Mudar aba ativa
  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };
  
  // Atualizar termo de busca
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Copiar dados para clipboard
  const handleCopyToClipboard = () => {
    const currentData = stateData[activeTab];
    if (currentData) {
      navigator.clipboard.writeText(JSON.stringify(currentData, null, 2))
        .then(() => {
          console.log('State copied to clipboard');
        })
        .catch(err => {
          console.error('Failed to copy state:', err);
        });
    }
  };
  
  // Exportar dados para arquivo JSON
  const handleExportToFile = () => {
    const currentData = stateData[activeTab];
    if (currentData) {
      const blob = new Blob([JSON.stringify(currentData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
  
  // Limpar storage atual
  const handleClearStorage = () => {
    if (activeTab === 'localStorage') {
      localStorage.clear();
      refreshState();
    } else if (activeTab === 'sessionStorage') {
      sessionStorage.clear();
      refreshState();
    }
  };
  
  // Logar dados no console
  const handleLogToConsole = () => {
    const currentData = stateData[activeTab];
    if (currentData) {
      console.group(`Debug State: ${activeTab}`);
      console.log(currentData);
      console.groupEnd();
    }
  };
  
  // Dados filtrados com base no termo de busca
  const filteredData = useMemo(() => {
    const currentData = stateData[activeTab];
    
    if (!currentData || !searchTerm) {
      return currentData;
    }
    
    // Filtrar o objeto com base no termo de busca
    const filter = (obj, path = '') => {
      if (typeof obj !== 'object' || obj === null) {
        return null;
      }
      
      const result = Array.isArray(obj) ? [] : {};
      let hasMatch = false;
      
      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        
        // Verificar se o caminho atual ou valor corresponde à busca
        const matchesSearch = 
          currentPath.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (typeof value === 'number' && value.toString().includes(searchTerm));
        
        if (typeof value === 'object' && value !== null) {
          // Recursivamente filtrar objetos aninhados
          const filteredChild = filter(value, currentPath);
          
          if (filteredChild !== null && (Object.keys(filteredChild).length > 0 || matchesSearch)) {
            result[key] = filteredChild;
            hasMatch = true;
          } else if (matchesSearch) {
            result[key] = value;
            hasMatch = true;
          }
        } else if (matchesSearch) {
          result[key] = value;
          hasMatch = true;
        }
      });
      
      return hasMatch ? result : null;
    };
    
    return filter(currentData) || {};
  }, [stateData, activeTab, searchTerm]);
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Tabs */}
      <Box sx={{ px: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 40 }}
        >
          {stateData.redux && (
            <Tab 
              value="redux" 
              label="Redux" 
              sx={{ minHeight: 40, px: 2 }} 
            />
          )}
          <Tab 
            value="localStorage" 
            label="Local Storage" 
            sx={{ minHeight: 40, px: 2 }} 
          />
          <Tab 
            value="sessionStorage" 
            label="Session Storage" 
            sx={{ minHeight: 40, px: 2 }} 
          />
          <Tab 
            value="cookies" 
            label="Cookies" 
            sx={{ minHeight: 40, px: 2 }} 
          />
        </Tabs>
      </Box>
      
      {/* Controls */}
      <Box sx={{ 
        p: 1, 
        display: 'flex', 
        alignItems: 'center', 
        borderBottom: `1px solid ${theme.palette.divider}`,
        gap: 1
      }}>
        <TextField
          size="small"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={handleSearch}
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        
        <Tooltip title="Atualizar">
          <IconButton size="small" onClick={refreshState}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Copiar para Clipboard">
          <span> {/* Adicionado span aqui */}
            <IconButton
              size="small"
              onClick={handleCopyToClipboard}
              disabled={!stateData[activeTab] || Object.keys(stateData[activeTab] || {}).length === 0}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        
        <Tooltip title="Exportar para Arquivo">
          <span> {/* Adicionado span aqui */}
            <IconButton
              size="small"
              onClick={handleExportToFile}
              disabled={!stateData[activeTab] || Object.keys(stateData[activeTab] || {}).length === 0}
            >
              <ExportIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        
        {(activeTab === 'localStorage' || activeTab === 'sessionStorage') && (
          <Tooltip title="Limpar Storage">
            <span> {/* Adicionado span aqui */}
              <IconButton
                size="small"
                onClick={handleClearStorage}
                disabled={!stateData[activeTab] || Object.keys(stateData[activeTab] || {}).length === 0}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>
      
      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            {(!stateData[activeTab] || Object.keys(stateData[activeTab] || {}).length === 0) ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {activeTab === 'redux' 
                    ? 'Estado do Redux não disponível. Verifique se o Redux DevTools está ativado ou se a store está exposta globalmente.' 
                    : `Nenhum dado disponível em ${activeTab}.`}
                </Typography>
              </Box>
            ) : (
              <>
                {/* Storage info */}
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      {activeTab === 'redux' ? 'Redux Store' : 
                       activeTab === 'localStorage' ? 'Local Storage' : 
                       activeTab === 'sessionStorage' ? 'Session Storage' : 'Cookies'}
                    </Typography>
                    <Chip 
                      label={`${Object.keys(stateData[activeTab] || {}).length} itens`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                  <Button
                    size="small"
                    startIcon={<CodeIcon />}
                    onClick={handleLogToConsole}
                  >
                    Ver no Console
                  </Button>
                </Box>
                
                {searchTerm && (
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={`Filtrando por: "${searchTerm}"`} 
                      size="small" 
                      onDelete={() => setSearchTerm('')}
                      color="primary"
                    />
                  </Box>
                )}
                
                {/* JSON tree view */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1,
                    backgroundColor: theme.palette.background.default,
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }}
                >
                  <JsonTreeView 
                    data={filteredData} 
                    initialDepth={1}
                    maxInitialDepth={searchTerm ? 10 : 2}
                  />
                </Paper>
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};