// src/components/system/ResilienceMonitor.js
import React, { useState, useEffect, useMemo } from 'react';
import { Alert, Box, CircularProgress, Typography, Chip, Paper, Tooltip } from '@mui/material';
import { retryManager } from '../../core/resilience';
import { CircuitState } from '../../core/resilience/types';

// Atualiza os dados a cada 2 segundos
const REFRESH_INTERVAL = 2000;

export const ResilienceMonitor = ({ showDetails = false }) => {
  const [state, setState] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para atualizar os dados
  const refreshData = () => {
    try {
      const resilience = retryManager.getState();
      setState(resilience.services);
      setMetrics(resilience.metrics);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Efeito para atualizar dados periodicamente
  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  // Status geral do sistema
  const systemStatus = useMemo(() => {
    if (!state) return 'unknown';
    
    // Verificar se algum circuito está aberto
    const hasOpenCircuit = Object.values(state).some(
      service => service.circuitState === CircuitState.OPEN
    );
    
    if (hasOpenCircuit) return 'degraded';
    
    // Verificar alta taxa de tentativas
    if (metrics && metrics.failedRetries > 0 && 
        metrics.failedRetries / metrics.totalOperations > 0.1) {
      return 'warning';
    }
    
    return 'healthy';
  }, [state, metrics]);
  
  // Status color
  const statusColor = {
    healthy: 'success.main',
    warning: 'warning.main',
    degraded: 'error.main',
    unknown: 'text.disabled'
  };
  
  // Renderizar estado de carregamento
  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <CircularProgress size={20} sx={{ mr: 2 }} />
        <Typography>Carregando estado do sistema...</Typography>
      </Box>
    );
  }
  
  // Renderizar erro
  if (error) {
    return (
      <Alert severity="error">
        <Typography>Erro ao carregar estado do sistema: {error}</Typography>
      </Alert>
    );
  }
  
  // Versão resumida (para monitoramento constante)
  if (!showDetails) {
    return (
      <Tooltip title={`Status do sistema: ${systemStatus}`}>
        <Box 
          sx={{ 
            width: 16, 
            height: 16, 
            borderRadius: '50%', 
            bgcolor: statusColor[systemStatus],
            boxShadow: 1,
            cursor: 'help'
          }}
        />
      </Tooltip>
    );
  }
  
  // Versão completa com detalhes
  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h5" gutterBottom>
        Estado do Sistema de Resiliência
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box 
          sx={{ 
            width: 24, 
            height: 24, 
            borderRadius: '50%', 
            bgcolor: statusColor[systemStatus], 
            mr: 2 
          }}
        />
        <Typography variant="h6">
          Status: {systemStatus.charAt(0).toUpperCase() + systemStatus.slice(1)}
        </Typography>
      </Box>
      
      {/* Resumo de métricas */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Métricas Globais</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Chip label={`Total de operações: ${metrics?.totalOperations || 0}`} />
          <Chip 
            label={`Retentativas: ${metrics?.retryAttempts || 0}`} 
            color={metrics?.retryAttempts > 10 ? 'warning' : 'default'}
          />
          <Chip 
            label={`Sucessos: ${metrics?.successfulRetries || 0}`} 
            color="success" 
          />
          <Chip 
            label={`Falhas: ${metrics?.failedRetries || 0}`}
            color={metrics?.failedRetries > 0 ? 'error' : 'default'}
          />
          <Chip 
            label={`Circuit breaks: ${metrics?.circuitBreaks || 0}`}
            color={metrics?.circuitBreaks > 0 ? 'error' : 'default'}
          />
          <Chip 
            label={`Taxa de sucesso: ${metrics?.successRate?.toFixed(1) || 0}%`}
            color={
              metrics?.successRate > 90 ? 'success' : 
              metrics?.successRate > 75 ? 'warning' : 'error'
            }
          />
        </Box>
      </Box>
      
      {/* Lista de serviços */}
      <Typography variant="subtitle1" gutterBottom>Estado dos Serviços</Typography>
      {state && Object.entries(state).length > 0 ? (
        Object.entries(state).map(([serviceName, serviceState]) => (
          <Paper key={serviceName} variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2">{serviceName}</Typography>
              <Chip 
                size="small"
                label={serviceState.circuitState}
                color={
                  serviceState.circuitState === CircuitState.CLOSED ? 'success' :
                  serviceState.circuitState === CircuitState.HALF_OPEN ? 'warning' : 'error'
                }
              />
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, fontSize: 14 }}>
              <Chip 
                size="small" 
                variant="outlined"
                label={`Tentativas: ${serviceState.attempts || 0}`}
              />
              <Chip 
                size="small" 
                variant="outlined"
                label={`Total acumulado: ${serviceState.totalAttempts || 0}`}
              />
              {serviceState.rapidAttempts > 0 && (
                <Chip 
                  size="small"
                  variant="outlined" 
                  color="warning"
                  label={`Rápidas: ${serviceState.rapidAttempts}`}
                />
              )}
            </Box>
          </Paper>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          Nenhum serviço monitorado no momento.
        </Typography>
      )}
    </Paper>
  );
};