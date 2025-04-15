// src/core/debug/SettingsPanel.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Divider,
  Paper,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Delete as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Code as CodeIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

// Constante para chave de armazenamento das configurações
const DEBUG_SETTINGS_KEY = 'debugPanelSettings';

// Configurações padrão
const defaultSettings = {
  general: {
    enabled: true,
    theme: 'system',
    compactMode: false,
    persistSettings: true,
    defaultTab: 'events'
  },
  events: {
    maxEvents: 1000,
    autoCapture: true,
    captureConsole: true,
    eventFilters: []
  },
  performance: {
    autoRefreshInterval: 5,
    enableAutoRefresh: false,
    showPhpMetrics: true,
    captureResourceTimings: true
  },
  backend: {
    phpMetricsEndpoint: '/api/debug/php-metrics',
    enablePhpDebug: true,
    logLevel: 'info',
    apiTimeout: 5000
  },
  advanced: {
    enableVerboseMode: false,
    captureNetworkRequests: true,
    injectDebugInfoToAjax: true,
    exportToServerEnabled: false,
    serverExportEndpoint: '/api/debug/export-logs'
  }
};

export const SettingsPanel = ({ onSettingsChange }) => {
  const theme = useTheme();
  const [settings, setSettings] = useState(defaultSettings);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeSection, setActiveSection] = useState('general');
  
  // Carregar configurações salvas do localStorage no início
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(DEBUG_SETTINGS_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        // Mesclagem profunda com as configurações padrão para garantir que todas as propriedades existam
        const mergedSettings = {
          ...defaultSettings,
          general: { ...defaultSettings.general, ...parsedSettings.general },
          events: { ...defaultSettings.events, ...parsedSettings.events },
          performance: { ...defaultSettings.performance, ...parsedSettings.performance },
          backend: { ...defaultSettings.backend, ...parsedSettings.backend },
          advanced: { ...defaultSettings.advanced, ...parsedSettings.advanced }
        };
        setSettings(mergedSettings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do Debug Panel:', error);
    }
  }, []);
  
  // Atualizar um valor de configuração específico
  const handleSettingChange = useCallback((section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    
    // Limpar notificação de salvamento se existir
    setSettingsSaved(false);
  }, []);
  
  // Salvar todas as configurações
  const handleSaveSettings = useCallback(() => {
    try {
      if (settings.general.persistSettings) {
        localStorage.setItem(DEBUG_SETTINGS_KEY, JSON.stringify(settings));
      }
      
      setSettingsSaved(true);
      
      // Notificar sobre mudanças nas configurações, se fornecido
      if (typeof onSettingsChange === 'function') {
        onSettingsChange(settings);
      }
      
      // Esconder notificação após 3 segundos
      setTimeout(() => {
        setSettingsSaved(false);
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações do Debug Panel:', error);
    }
  }, [settings, onSettingsChange]);
  
  // Restaurar configurações padrão
  const handleResetSettings = useCallback(() => {
    setSettings(defaultSettings);
    setSettingsSaved(false);
    localStorage.removeItem(DEBUG_SETTINGS_KEY);
  }, []);
  
  // Exportar configurações para o console
  const handleExportSettings = useCallback(() => {
    console.group('Debug Panel Settings');
    console.log(settings);
    console.groupEnd();
  }, [settings]);
  
  // Alternar exibição de configurações avançadas
  const toggleAdvancedSettings = useCallback(() => {
    setShowAdvanced(prev => !prev);
  }, []);
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Cabeçalho */}
      <Box sx={{ 
        p: 1, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="subtitle2">
          Configurações do Debug Panel
        </Typography>
        <Box>
          <Tooltip title="Exportar Configurações">
            <IconButton size="small" onClick={handleExportSettings} sx={{ mr: 1 }}>
              <CodeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button 
            size="small" 
            variant="outlined" 
            color="secondary"
            onClick={handleResetSettings}
            startIcon={<RefreshIcon />}
            sx={{ mr: 1 }}
          >
            Resetar
          </Button>
          <Button 
            size="small" 
            variant="contained" 
            color="primary"
            onClick={handleSaveSettings}
            startIcon={<SaveIcon />}
          >
            Salvar
          </Button>
        </Box>
      </Box>
      
      {/* Alerta de salvamento */}
      {settingsSaved && (
        <Alert 
          severity="success"
          sx={{ 
            borderRadius: 0,
            py: 0
          }}
        >
          Configurações salvas com sucesso
        </Alert>
      )}
      
      {/* Navegação de seções */}
      <Box sx={{ 
        display: 'flex',
        borderBottom: `1px solid ${theme.palette.divider}`,
        px: 1
      }}>
        <Box 
          onClick={() => setActiveSection('general')}
          sx={{ 
            py: 1,
            px: 2,
            cursor: 'pointer',
            borderBottom: `2px solid ${activeSection === 'general' ? theme.palette.primary.main : 'transparent'}`,
            color: activeSection === 'general' ? theme.palette.primary.main : theme.palette.text.primary
          }}
        >
          <Typography variant="body2" fontWeight={activeSection === 'general' ? 'bold' : 'normal'}>
            Geral
          </Typography>
        </Box>
        <Box 
          onClick={() => setActiveSection('events')}
          sx={{ 
            py: 1,
            px: 2,
            cursor: 'pointer',
            borderBottom: `2px solid ${activeSection === 'events' ? theme.palette.primary.main : 'transparent'}`,
            color: activeSection === 'events' ? theme.palette.primary.main : theme.palette.text.primary
          }}
        >
          <Typography variant="body2" fontWeight={activeSection === 'events' ? 'bold' : 'normal'}>
            Eventos
          </Typography>
        </Box>
        <Box 
          onClick={() => setActiveSection('performance')}
          sx={{ 
            py: 1,
            px: 2,
            cursor: 'pointer',
            borderBottom: `2px solid ${activeSection === 'performance' ? theme.palette.primary.main : 'transparent'}`,
            color: activeSection === 'performance' ? theme.palette.primary.main : theme.palette.text.primary
          }}
        >
          <Typography variant="body2" fontWeight={activeSection === 'performance' ? 'bold' : 'normal'}>
            Performance
          </Typography>
        </Box>
        <Box 
          onClick={() => setActiveSection('backend')}
          sx={{ 
            py: 1,
            px: 2,
            cursor: 'pointer',
            borderBottom: `2px solid ${activeSection === 'backend' ? theme.palette.primary.main : 'transparent'}`,
            color: activeSection === 'backend' ? theme.palette.primary.main : theme.palette.text.primary
          }}
        >
          <Typography variant="body2" fontWeight={activeSection === 'backend' ? 'bold' : 'normal'}>
            PHP Backend
          </Typography>
        </Box>
        <Box 
          onClick={() => setActiveSection('advanced')}
          sx={{ 
            py: 1,
            px: 2,
            cursor: 'pointer',
            borderBottom: `2px solid ${activeSection === 'advanced' ? theme.palette.primary.main : 'transparent'}`,
            color: activeSection === 'advanced' ? theme.palette.primary.main : theme.palette.text.primary
          }}
        >
          <Typography variant="body2" fontWeight={activeSection === 'advanced' ? 'bold' : 'normal'}>
            Avançado
          </Typography>
        </Box>
      </Box>
      
      {/* Conteúdo das configurações */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Configurações Gerais */}
        {activeSection === 'general' && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Configurações Gerais
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.general.enabled}
                  onChange={(e) => handleSettingChange('general', 'enabled', e.target.checked)}
                />
              }
              label="Habilitar Debug Panel"
              sx={{ display: 'block', mb: 2 }}
            />
            
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel id="theme-select-label">Tema</InputLabel>
              <Select
                labelId="theme-select-label"
                value={settings.general.theme}
                label="Tema"
                onChange={(e) => handleSettingChange('general', 'theme', e.target.value)}
              >
                <MenuItem value="light">Claro</MenuItem>
                <MenuItem value="dark">Escuro</MenuItem>
                <MenuItem value="system">Sistema</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.general.compactMode}
                  onChange={(e) => handleSettingChange('general', 'compactMode', e.target.checked)}
                />
              }
              label="Modo Compacto"
              sx={{ display: 'block', my: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.general.persistSettings}
                  onChange={(e) => handleSettingChange('general', 'persistSettings', e.target.checked)}
                />
              }
              label="Persistir Configurações no LocalStorage"
              sx={{ display: 'block', mb: 2 }}
            />
            
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel id="default-tab-label">Aba Padrão</InputLabel>
              <Select
                labelId="default-tab-label"
                value={settings.general.defaultTab}
                label="Aba Padrão"
                onChange={(e) => handleSettingChange('general', 'defaultTab', e.target.value)}
              >
                <MenuItem value="events">Eventos</MenuItem>
                <MenuItem value="errors">Erros</MenuItem>
                <MenuItem value="state">Estado</MenuItem>
                <MenuItem value="performance">Performance</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
        
        {/* Configurações de Eventos */}
        {activeSection === 'events' && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Configurações de Eventos
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.events.autoCapture}
                  onChange={(e) => handleSettingChange('events', 'autoCapture', e.target.checked)}
                />
              }
              label="Captura Automática de Eventos"
              sx={{ display: 'block', mb: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.events.captureConsole}
                  onChange={(e) => handleSettingChange('events', 'captureConsole', e.target.checked)}
                />
              }
              label="Capturar Saídas do Console"
              sx={{ display: 'block', mb: 2 }}
            />
            
            <Typography id="max-events-slider" gutterBottom>
              Máximo de Eventos Armazenados: {settings.events.maxEvents}
            </Typography>
            <Slider
              aria-labelledby="max-events-slider"
              value={settings.events.maxEvents}
              onChange={(_, value) => handleSettingChange('events', 'maxEvents', value)}
              step={100}
              marks={[
                { value: 100, label: '100' },
                { value: 500, label: '500' },
                { value: 1000, label: '1000' },
                { value: 2000, label: '2000' }
              ]}
              min={100}
              max={2000}
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />
            
            <Typography gutterBottom>
              Filtros de Eventos (opcional)
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Ex: auth,api,user (separados por vírgula)"
              value={settings.events.eventFilters.join(',')}
              onChange={(e) => handleSettingChange(
                'events', 
                'eventFilters', 
                e.target.value.split(',').map(f => f.trim()).filter(f => f)
              )}
              helperText="Eventos apenas destes serviços serão capturados. Deixe em branco para capturar todos."
              sx={{ mb: 2 }}
            />
          </Box>
        )}
        
        {/* Configurações de Performance */}
        {activeSection === 'performance' && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Configurações de Performance
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.performance.enableAutoRefresh}
                  onChange={(e) => handleSettingChange('performance', 'enableAutoRefresh', e.target.checked)}
                />
              }
              label="Atualização Automática"
              sx={{ display: 'block', mb: 2 }}
            />
            
            {settings.performance.enableAutoRefresh && (
              <Box sx={{ mb: 3 }}>
                <Typography id="auto-refresh-slider" gutterBottom>
                  Intervalo de Atualização: {settings.performance.autoRefreshInterval} segundos
                </Typography>
                <Slider
                  aria-labelledby="auto-refresh-slider"
                  value={settings.performance.autoRefreshInterval}
                  onChange={(_, value) => handleSettingChange('performance', 'autoRefreshInterval', value)}
                  step={1}
                  marks={[
                    { value: 2, label: '2s' },
                    { value: 5, label: '5s' },
                    { value: 10, label: '10s' },
                    { value: 30, label: '30s' }
                  ]}
                  min={2}
                  max={30}
                  valueLabelDisplay="auto"
                />
              </Box>
            )}
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.performance.showPhpMetrics}
                  onChange={(e) => handleSettingChange('performance', 'showPhpMetrics', e.target.checked)}
                />
              }
              label="Mostrar Métricas do PHP"
              sx={{ display: 'block', mb: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.performance.captureResourceTimings}
                  onChange={(e) => handleSettingChange('performance', 'captureResourceTimings', e.target.checked)}
                />
              }
              label="Capturar Tempos de Recursos"
              sx={{ display: 'block', mb: 2 }}
            />
          </Box>
        )}
        
        {/* Configurações de Backend */}
        {activeSection === 'backend' && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Configurações de PHP Backend
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.backend.enablePhpDebug}
                  onChange={(e) => handleSettingChange('backend', 'enablePhpDebug', e.target.checked)}
                />
              }
              label="Habilitar Debug PHP"
              sx={{ display: 'block', mb: 2 }}
            />
            
            <FormControl fullWidth margin="normal" size="small" sx={{ mb: 2 }}>
              <InputLabel id="log-level-label">Nível de Log</InputLabel>
              <Select
                labelId="log-level-label"
                value={settings.backend.logLevel}
                label="Nível de Log"
                onChange={(e) => handleSettingChange('backend', 'logLevel', e.target.value)}
              >
                <MenuItem value="debug">Debug</MenuItem>
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Endpoint de Métricas PHP"
              size="small"
              value={settings.backend.phpMetricsEndpoint}
              onChange={(e) => handleSettingChange('backend', 'phpMetricsEndpoint', e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <Typography id="api-timeout-slider" gutterBottom>
              Timeout da API: {settings.backend.apiTimeout} ms
            </Typography>
            <Slider
              aria-labelledby="api-timeout-slider"
              value={settings.backend.apiTimeout}
              onChange={(_, value) => handleSettingChange('backend', 'apiTimeout', value)}
              step={500}
              marks={[
                { value: 1000, label: '1s' },
                { value: 5000, label: '5s' },
                { value: 10000, label: '10s' },
                { value: 30000, label: '30s' }
              ]}
              min={1000}
              max={30000}
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />
            
            <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: theme.palette.background.default }}>
              <Typography variant="subtitle2" gutterBottom>
                Código para Adicionar ao seu Backend PHP
              </Typography>
              <Box 
                component="pre" 
                sx={{ 
                  overflow: 'auto',
                  fontSize: '12px',
                  p: 1,
                  backgroundColor: theme.palette.grey[900],
                  color: theme.palette.common.white,
                  borderRadius: 1
                }}
              >
{`<?php
// Adicione no início do seu arquivo bootstrap.php ou index.php
declare(strict_types=1);

// Verificar se o debug está ativado
if (isset($_GET['debug']) || isset($_COOKIE['debug_enabled'])) {
    // Iniciar timer de performance
    $debugStartTime = microtime(true);
    
    // Registrar handler para enviar métricas no final da execução
    register_shutdown_function(function() use ($debugStartTime) {
        $metrics = [
            'version' => PHP_VERSION,
            'executionTime' => (microtime(true) - $debugStartTime) * 1000,
            'memoryUsage' => memory_get_usage(),
            'peakMemoryUsage' => memory_get_peak_usage(),
            'dbQueries' => \$GLOBALS['dbQueryCount'] ?? 0,
            'dbTime' => \$GLOBALS['dbQueryTime'] ?? 0,
            'renderTime' => \$GLOBALS['renderTime'] ?? 0
        ];
        
        header('Content-Type: application/json');
        echo json_encode($metrics);
    });
    
    // Habilitar todos os erros em modo debug
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
}`}
              </Box>
              <Button 
                variant="text" 
                size="small" 
                startIcon={<CodeIcon />}
                onClick={() => {
                  navigator.clipboard.writeText(`<?php
// Adicione no início do seu arquivo bootstrap.php ou index.php
declare(strict_types=1);

// Verificar se o debug está ativado
if (isset($_GET['debug']) || isset($_COOKIE['debug_enabled'])) {
    // Iniciar timer de performance
    $debugStartTime = microtime(true);
    
    // Registrar handler para enviar métricas no final da execução
    register_shutdown_function(function() use ($debugStartTime) {
        $metrics = [
            'version' => PHP_VERSION,
            'executionTime' => (microtime(true) - $debugStartTime) * 1000,
            'memoryUsage' => memory_get_usage(),
            'peakMemoryUsage' => memory_get_peak_usage(),
            'dbQueries' => \$GLOBALS['dbQueryCount'] ?? 0,
            'dbTime' => \$GLOBALS['dbQueryTime'] ?? 0,
            'renderTime' => \$GLOBALS['renderTime'] ?? 0
        ];
        
        header('Content-Type: application/json');
        echo json_encode($metrics);
    });
    
    // Habilitar todos os erros em modo debug
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
}`);
                }}
                sx={{ mt: 1 }}
              >
                Copiar Código
              </Button>
            </Paper>
          </Box>
        )}
        
        {/* Configurações Avançadas */}
        {activeSection === 'advanced' && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Configurações Avançadas
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 2 }}>
              Estas configurações são destinadas a usuários avançados e podem afetar a performance da aplicação.
            </Alert>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.advanced.enableVerboseMode}
                  onChange={(e) => handleSettingChange('advanced', 'enableVerboseMode', e.target.checked)}
                />
              }
              label="Modo Verboso"
              sx={{ display: 'block', mb: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.advanced.captureNetworkRequests}
                  onChange={(e) => handleSettingChange('advanced', 'captureNetworkRequests', e.target.checked)}
                />
              }
              label="Capturar Requisições de Rede (XHR/Fetch)"
              sx={{ display: 'block', mb: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.advanced.injectDebugInfoToAjax}
                  onChange={(e) => handleSettingChange('advanced', 'injectDebugInfoToAjax', e.target.checked)}
                />
              }
              label="Injetar Informações de Debug em Requisições AJAX"
              sx={{ display: 'block', mb: 2 }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Exportação para Servidor
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.advanced.exportToServerEnabled}
                  onChange={(e) => handleSettingChange('advanced', 'exportToServerEnabled', e.target.checked)}
                />
              }
              label="Habilitar Exportação de Logs para Servidor"
              sx={{ display: 'block', mb: 2 }}
            />
            
            {settings.advanced.exportToServerEnabled && (
              <TextField
                fullWidth
                label="Endpoint de Exportação"
                size="small"
                value={settings.advanced.serverExportEndpoint}
                onChange={(e) => handleSettingChange('advanced', 'serverExportEndpoint', e.target.value)}
                sx={{ mb: 2 }}
              />
            )}
            
            <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: theme.palette.background.default }}>
              <Typography variant="subtitle2" gutterBottom>
                Código jQuery para Interceptar Requisições AJAX
              </Typography>
              <Box 
                component="pre" 
                sx={{ 
                  overflow: 'auto',
                  fontSize: '12px',
                  p: 1,
                  backgroundColor: theme.palette.grey[900],
                  color: theme.palette.common.white,
                  borderRadius: 1
                }}
              >
{`// Adicione esta configuração no seu arquivo principal jQuery
$(document).ready(function() {
    // Interceptar todas as requisições AJAX para adicionar informações de debug
    if (localStorage.getItem('debugPanelSettings')) {
        const settings = JSON.parse(localStorage.getItem('debugPanelSettings'));
        
        if (settings.advanced.injectDebugInfoToAjax) {
            $.ajaxSetup({
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('X-Debug-Enabled', 'true');
                    
                    // Adicionar performance mark
                    if (window.performance && window.performance.mark) {
                        const requestId = 'ajax-' + Date.now();
                        xhr._debugRequestId = requestId;
                        window.performance.mark('ajax-start-' + requestId);
                    }
                },
                complete: function(xhr, status) {
                    // Medir performance da requisição
                    if (window.performance && window.performance.mark && xhr._debugRequestId) {
                        const requestId = xhr._debugRequestId;
                        window.performance.mark('ajax-end-' + requestId);
                        window.performance.measure(
                            'ajax-duration-' + requestId,
                            'ajax-start-' + requestId,
                            'ajax-end-' + requestId
                        );
                    }
                }
            });
        }
    }
});`}
              </Box>
              <Button 
                variant="text" 
                size="small" 
                startIcon={<CodeIcon />}
                onClick={() => {
                  navigator.clipboard.writeText(`// Adicione esta configuração no seu arquivo principal jQuery
$(document).ready(function() {
    // Interceptar todas as requisições AJAX para adicionar informações de debug
    if (localStorage.getItem('debugPanelSettings')) {
        const settings = JSON.parse(localStorage.getItem('debugPanelSettings'));
        
        if (settings.advanced.injectDebugInfoToAjax) {
            $.ajaxSetup({
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('X-Debug-Enabled', 'true');
                    
                    // Adicionar performance mark
                    if (window.performance && window.performance.mark) {
                        const requestId = 'ajax-' + Date.now();
                        xhr._debugRequestId = requestId;
                        window.performance.mark('ajax-start-' + requestId);
                    }
                },
                complete: function(xhr, status) {
                    // Medir performance da requisição
                    if (window.performance && window.performance.mark && xhr._debugRequestId) {
                        const requestId = xhr._debugRequestId;
                        window.performance.mark('ajax-end-' + requestId);
                        window.performance.measure(
                            'ajax-duration-' + requestId,
                            'ajax-start-' + requestId,
                            'ajax-end-' + requestId
                        );
                    }
                }
            });
        }
    }
});`);
                }}
                sx={{ mt: 1 }}
              >
                Copiar Código
              </Button>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
};