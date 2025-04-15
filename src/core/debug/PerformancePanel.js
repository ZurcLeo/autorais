// src/core/debug/PerformancePanel.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  FormControlLabel,
  Switch,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  BarChart as ChartIcon,
  Refresh as RefreshIcon,
  Delete as ClearIcon,
  FileCopy as CopyIcon,
  AddCircleOutline as AddMarkIcon,
  Code as CodeIcon
} from '@mui/icons-material';

// Utilitário para formatar bytes em unidades legíveis
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Componente para exibir métricas de backend PHP
const PhpMetricsPanel = ({ phpMetrics, isLoading }) => {
  const theme = useTheme();
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }
  
  if (!phpMetrics) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Métricas do PHP não disponíveis. Verifique se a API de métricas está configurada no backend.
        </Typography>
      </Box>
    );
  }
  
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Métrica</TableCell>
            <TableCell align="right">Valor</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Versão do PHP</TableCell>
            <TableCell align="right">{phpMetrics.version || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Tempo de Execução</TableCell>
            <TableCell align="right">{phpMetrics.executionTime ? `${phpMetrics.executionTime} ms` : 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Uso de Memória</TableCell>
            <TableCell align="right">{phpMetrics.memoryUsage ? formatBytes(phpMetrics.memoryUsage) : 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Pico de Uso de Memória</TableCell>
            <TableCell align="right">{phpMetrics.peakMemoryUsage ? formatBytes(phpMetrics.peakMemoryUsage) : 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Consultas ao Banco de Dados</TableCell>
            <TableCell align="right">{phpMetrics.dbQueries || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Tempo do Banco de Dados</TableCell>
            <TableCell align="right">{phpMetrics.dbTime ? `${phpMetrics.dbTime} ms` : 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Tempo de Renderização</TableCell>
            <TableCell align="right">{phpMetrics.renderTime ? `${phpMetrics.renderTime} ms` : 'N/A'}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export const PerformancePanel = ({ addNotification }) => {
  const theme = useTheme();
  const [performanceData, setPerformanceData] = useState(null);
  const [phpMetrics, setPhpMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [newMarkName, setNewMarkName] = useState('');
  const [markModalOpen, setMarkModalOpen] = useState(false);
  const intervalRef = useRef(null);
  
  // Carregar dados de performance
  const loadPerformanceData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Obter métricas de navegação e recursos
      const navigationData = window.performance.getEntriesByType('navigation')[0];
      const resourcesData = window.performance.getEntriesByType('resource');
      const marksData = window.performance.getEntriesByType('mark');
      const measuresData = window.performance.getEntriesByType('measure');
      
      // Dados de memória (quando disponível)
      let memoryData = null;
      if (window.performance.memory) {
        memoryData = {
          totalJSHeapSize: window.performance.memory.totalJSHeapSize,
          usedJSHeapSize: window.performance.memory.usedJSHeapSize,
          jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit
        };
      }
      
      // Classificar recursos por duração
      const topResources = [...resourcesData]
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10)
        .map(resource => ({
          name: resource.name.split('/').pop() || resource.name,
          fullName: resource.name,
          duration: Math.round(resource.duration),
          size: resource.decodedBodySize || resource.encodedBodySize || 0,
          type: resource.initiatorType
        }));
      
      // Obter métricas de backend
      try {
        // Tentar buscar métricas PHP de uma API
        // Em produção, você substituiria isso por uma chamada real à sua API PHP
        const phpResponse = await fetch('/api/health/full');
        if (phpResponse.ok) {
          const data = await phpResponse.json();
          setPhpMetrics(data);
        }
      } catch (e) {
        console.log('Erro ao buscar métricas PHP:', e);
        // Simular dados para desenvolvimento
        setPhpMetrics({
          version: '8.4.0',
          executionTime: Math.round(Math.random() * 100 + 50),
          memoryUsage: Math.round(Math.random() * 10000000 + 1000000),
          peakMemoryUsage: Math.round(Math.random() * 20000000 + 15000000),
          dbQueries: Math.round(Math.random() * 20 + 5),
          dbTime: Math.round(Math.random() * 50 + 10),
          renderTime: Math.round(Math.random() * 30 + 5)
        });
      }
      
      setPerformanceData({
        navigation: {
          domComplete: Math.round(navigationData.domComplete),
          domInteractive: Math.round(navigationData.domInteractive),
          loadEventEnd: Math.round(navigationData.loadEventEnd),
          responseEnd: Math.round(navigationData.responseEnd),
          responseStart: Math.round(navigationData.responseStart),
          domContentLoadedEventEnd: Math.round(navigationData.domContentLoadedEventEnd)
        },
        topResources,
        memory: memoryData,
        marks: marksData,
        measures: measuresData
      });
      
    } catch (error) {
      console.error('Erro ao carregar dados de performance:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Carregar dados iniciais
  useEffect(() => {
    loadPerformanceData();
    
    // Configurar marcador de inicialização
    window.performance.mark('debug-panel-mounted');
    
    return () => {
      window.performance.mark('debug-panel-unmounted');
      try {
        window.performance.measure(
          'debug-panel-lifecycle',
          'debug-panel-mounted',
          'debug-panel-unmounted'
        );
      } catch (e) {
        // Ignorar erro se as marcas não existirem
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadPerformanceData]);
  
  // Configurar auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(loadPerformanceData, refreshInterval * 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, loadPerformanceData]);
  
  // Alternar auto-refresh
  const handleToggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };
  
  // Limpar métricas de performance
  const handleClearPerformance = () => {
    try {
      window.performance.clearMarks();
      window.performance.clearMeasures();
      window.performance.clearResourceTimings();
      loadPerformanceData();
    } catch (e) {
      console.error('Erro ao limpar métricas de performance:', e);
    }
  };
  
  // Adicionar marcador personalizado
  const handleAddMark = () => {
    if (newMarkName.trim()) {
      try {
        window.performance.mark(newMarkName.trim());
        loadPerformanceData();
        setNewMarkName('');
      } catch (e) {
        console.error('Erro ao adicionar marcador:', e);
      }
    }
  };
  
  // Adicionar marcador de teste
  const handleAddTestMark = () => {
    const testMarkName = `teste-${new Date().toISOString()}`;
    window.performance.mark(testMarkName);
    loadPerformanceData();
  };
  
  // Criar medição entre marcadores
  const handleCreateMeasure = (startMark, endMark) => {
    try {
      const measureName = `${startMark}_até_${endMark}`;
      window.performance.measure(measureName, startMark, endMark);
      loadPerformanceData();
    } catch (e) {
      console.error('Erro ao criar medição:', e);
    }
  };
  
  // Exportar dados para console
  const handleExportToConsole = () => {
    console.group('Debug Performance Data');
    console.log('Navigation Timing:', performanceData.navigation);
    console.log('Top Resources:', performanceData.topResources);
    console.log('Performance Marks:', performanceData.marks);
    console.log('Performance Measures:', performanceData.measures);
    console.log('Memory Data:', performanceData.memory);
    console.log('PHP Metrics:', phpMetrics);
    console.groupEnd();
  };
  
  // Mostrar placeholder durante carregamento
  if (isLoading && !performanceData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Barra de controles */}
      <Box sx={{ 
        p: 1, 
        display: 'flex', 
        justifyContent: 'space-between',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ mr: 2 }}>
            Métricas de Performance
          </Typography>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={autoRefresh}
                onChange={handleToggleAutoRefresh}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ mr: 1 }}>Auto-atualizar</Typography>
                {autoRefresh && (
                  <FormControl size="small" variant="outlined" sx={{ minWidth: 80 }}>
                    <Select
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(e.target.value)}
                      size="small"
                    >
                      <MenuItem value={2}>2s</MenuItem>
                      <MenuItem value={5}>5s</MenuItem>
                      <MenuItem value={10}>10s</MenuItem>
                      <MenuItem value={30}>30s</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Box>
            }
            sx={{ m: 0 }}
          />
        </Box>
        <Box>
          <Tooltip title="Atualizar">
            <IconButton 
              size="small" 
              onClick={loadPerformanceData}
              sx={{ mr: 1 }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Limpar">
            <IconButton 
              size="small" 
              onClick={handleClearPerformance}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Conteúdo principal - área scrollável */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Métricas do PHP */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <CodeIcon fontSize="small" sx={{ mr: 1 }} />
            Métricas do PHP
          </Typography>
          <PhpMetricsPanel phpMetrics={phpMetrics} isLoading={isLoading} />
        </Box>
        
        {/* Métricas de Navegação */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <TimelineIcon fontSize="small" sx={{ mr: 1 }} />
            Métricas de Navegação
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Métrica</TableCell>
                  <TableCell align="right">Tempo (ms)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>DOM Interativo</TableCell>
                  <TableCell align="right">{performanceData.navigation.domInteractive}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>DOM Content Loaded</TableCell>
                  <TableCell align="right">{performanceData.navigation.domContentLoadedEventEnd}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>DOM Completo</TableCell>
                  <TableCell align="right">{performanceData.navigation.domComplete}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Evento de Carregamento</TableCell>
                  <TableCell align="right">{performanceData.navigation.loadEventEnd}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Tempo de Resposta</TableCell>
                  <TableCell align="right">
                    {performanceData.navigation.responseEnd - performanceData.navigation.responseStart}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        
        {/* Top Recursos */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ChartIcon fontSize="small" sx={{ mr: 1 }} />
            Top Recursos por Tempo de Carregamento
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Recurso</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Tamanho</TableCell>
                  <TableCell align="right">Duração (ms)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {performanceData.topResources.map((resource, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Tooltip title={resource.fullName} arrow>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                          {resource.name}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{resource.type}</TableCell>
                    <TableCell align="right">{formatBytes(resource.size)}</TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        color: resource.duration > 500 
                          ? theme.palette.error.main 
                          : resource.duration > 200 
                            ? theme.palette.warning.main 
                            : 'inherit'
                      }}
                    >
                      {resource.duration}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        
        {/* Uso de Memória */}
        {performanceData.memory && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Uso de Memória JavaScript
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>JS Heap Usado</TableCell>
                    <TableCell align="right">{formatBytes(performanceData.memory.usedJSHeapSize)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>JS Heap Total</TableCell>
                    <TableCell align="right">{formatBytes(performanceData.memory.totalJSHeapSize)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Limite de JS Heap</TableCell>
                    <TableCell align="right">{formatBytes(performanceData.memory.jsHeapSizeLimit)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
        
        {/* Marcadores & Medições Personalizados */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2">
              Marcadores e Medições Personalizados
            </Typography>
            <Box>
              <Button 
                size="small" 
                variant="outlined" 
                startIcon={<AddMarkIcon />} 
                onClick={handleAddTestMark}
                sx={{ mr: 1 }}
              >
                Adicionar Marca
              </Button>
              
              <Button 
                size="small" 
                variant="outlined" 
                startIcon={<CodeIcon />} 
                onClick={handleExportToConsole}
              >
                Ver no Console
              </Button>
            </Box>
          </Box>
          
          {/* Painel de marcadores */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* Marcadores */}
            <Paper variant="outlined" sx={{ p: 2, flexGrow: 1, minWidth: '45%' }}>
              <Typography variant="subtitle2" gutterBottom>
                Marcadores
              </Typography>
              
              {performanceData.marks.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                  Sem marcadores registrados
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nome</TableCell>
                        <TableCell align="right">Timestamp (ms)</TableCell>
                        <TableCell align="right">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {performanceData.marks.map((mark, index) => (
                        <TableRow key={index}>
                          <TableCell>{mark.name}</TableCell>
                          <TableCell align="right">{Math.round(mark.startTime)}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Criar Medição">
                              <span>
                                <IconButton 
                                  size="small" 
                                  disabled={performanceData.marks.length < 2}
                                  onClick={() => {
                                    // Abrir modal para selecionar o fim da medição
                                    // Simplificado neste exemplo
                                    if (index < performanceData.marks.length - 1) {
                                      handleCreateMeasure(
                                        mark.name, 
                                        performanceData.marks[index + 1].name
                                      );
                                    }
                                  }}
                                >
                                  <TimelineIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
            
            {/* Medições */}
            <Paper variant="outlined" sx={{ p: 2, flexGrow: 1, minWidth: '45%' }}>
              <Typography variant="subtitle2" gutterBottom>
                Medições
              </Typography>
              
              {performanceData.measures.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                  Sem medições registradas
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nome</TableCell>
                        <TableCell>Início</TableCell>
                        <TableCell>Fim</TableCell>
                        <TableCell align="right">Duração (ms)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {performanceData.measures.map((measure, index) => (
                        <TableRow key={index}>
                          <TableCell>{measure.name}</TableCell>
                          <TableCell>{measure.startMark || 'N/A'}</TableCell>
                          <TableCell>{measure.endMark || 'N/A'}</TableCell>
                          <TableCell 
                            align="right"
                            sx={{ 
                              color: measure.duration > 1000 
                                ? theme.palette.error.main 
                                : measure.duration > 300 
                                  ? theme.palette.warning.main 
                                  : theme.palette.success.main
                            }}
                          >
                            {Math.round(measure.duration)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Box>
        </Box>
        
        {/* Dicas de uso */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Dicas de Uso
          </Typography>
          
          <Typography variant="body2" paragraph>
            Para adicionar marcadores e medições em seu código:
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            backgroundColor: theme.palette.background.default,
            borderRadius: 1,
            fontFamily: 'monospace',
            fontSize: '12px',
            mb: 2
          }}>
            <pre>{`// Adicionar um marcador
performance.mark('inicio-operacao');

// Realizar operação...

// Adicionar outro marcador
performance.mark('fim-operacao');

// Criar uma medição entre marcadores
performance.measure('duracao-operacao', 'inicio-operacao', 'fim-operacao');`}</pre>
          </Box>
          
          <Typography variant="body2">
            Em seu código PHP, você pode adicionar métricas de performance enviando um objeto JSON para a API de métricas:
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            backgroundColor: theme.palette.background.default,
            borderRadius: 1,
            fontFamily: 'monospace',
            fontSize: '12px',
            mt: 1
          }}>
            <pre>{`<?php
// No seu back-end PHP
$startTime = microtime(true);

// Sua lógica de negócio...
$dbStartTime = microtime(true);
// Operações de banco de dados...
$dbTime = (microtime(true) - $dbStartTime) * 1000;

// Renderização...
$renderStartTime = microtime(true);
// Lógica de renderização...
$renderTime = (microtime(true) - $renderStartTime) * 1000;

$metrics = [
    'version' => PHP_VERSION,
    'executionTime' => (microtime(true) - $startTime) * 1000,
    'memoryUsage' => memory_get_usage(),
    'peakMemoryUsage' => memory_get_peak_usage(),
    'dbQueries' => $totalQueries,
    'dbTime' => $dbTime,
    'renderTime' => $renderTime
];

// Adicionar métricas ao cabeçalho ou armazenar para acesso via API
header('X-PHP-Metrics: ' . json_encode($metrics));`}</pre>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};