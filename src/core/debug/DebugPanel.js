// src/core/debug/DebugPanel.js
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Slide,
  Badge,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  BugReport as BugReportIcon,
  Notifications as EventsIcon,
  Error as ErrorIcon,
  Timeline as TimelineIcon,
  Storage as StorageIcon,
  Settings as SettingsIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon
} from '@mui/icons-material';
import { EventLogPanel } from './EventLogPanel';
import { ErrorsPanel } from './ErrorsPanel';
import { StateInspector } from './StateInspector';
import { PerformancePanel } from './PerformancePanel';
import { SettingsPanel } from './SettingsPanel';

const DEBUG_STORAGE_KEY = 'debugPanelSettings';

// Definição das abas disponíveis no painel
const tabs = [
  { id: 'events', label: 'Events', icon: <EventsIcon />, component: EventLogPanel },
  { id: 'errors', label: 'Errors', icon: <ErrorIcon />, component: ErrorsPanel },
  { id: 'state', label: 'State', icon: <StorageIcon />, component: StateInspector },
  { id: 'performance', label: 'Performance', icon: <TimelineIcon />, component: PerformancePanel },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon />, component: SettingsPanel },
  
];

const DebugPanel = ({ serviceEventHub, initiallyOpen = false }) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [activeTab, setActiveTab] = useState('events');
  const [compactMode, setCompactMode] = useState(false);
  const [notifications, setNotifications] = useState({
    events: 0,
    errors: 0,
    state: 0,
    performance: 0
  });
  
  // Carregar configurações salvas
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(DEBUG_STORAGE_KEY);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.compactMode !== undefined) {
          setCompactMode(settings.compactMode);
        }
        if (settings.activeTab && tabs.some(tab => tab.id === settings.activeTab)) {
          setActiveTab(settings.activeTab);
        }
      }
    } catch (error) {
      console.error('Error loading debug panel settings:', error);
    }
  }, []);
  
  // Auto-fechar em produção
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      setIsOpen(false);
    }
  }, []);
  
  // Salvar configurações quando alteradas
  useEffect(() => {
    try {
      localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify({
        compactMode,
        activeTab
      }));
    } catch (error) {
      console.error('Error saving debug panel settings:', error);
    }
  }, [compactMode, activeTab]);

  // Manipulador de alteração de aba
  const handleTabChange = useCallback((_, newValue) => {
    setActiveTab(newValue);
    
    // Limpar notificações da aba selecionada
    setNotifications(prev => ({
      ...prev,
      [newValue]: 0
    }));
  }, []);

  // Alternar abertura do painel
  const togglePanel = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);
  
  // Alternar modo compacto
  const toggleCompactMode = useCallback(() => {
    setCompactMode(prev => !prev);
  }, []);
  
  // Adicionar notificação a uma aba
  const addNotification = useCallback((tabId) => {
    if (activeTab !== tabId) {
      setNotifications(prev => ({
        ...prev,
        [tabId]: prev[tabId] + 1
      }));
    }
  }, [activeTab]);
  
  // Componente ativo para a aba atual
  const ActiveTabComponent = useMemo(() => {
    const tab = tabs.find(t => t.id === activeTab);
    return tab ? tab.component : null;
  }, [activeTab]);

  // Total de notificações para o badge
  const totalNotifications = useMemo(() => 
    Object.values(notifications).reduce((sum, count) => sum + count, 0),
  [notifications]);

  // Propriedades compartilhadas para os componentes das abas
  const sharedProps = useMemo(() => ({
    addNotification,
    compactMode
  }), [addNotification, compactMode]);

  return (
    <>
      {/* Botão flutuante para abrir/fechar */}
      <Tooltip title={isOpen ? "Fechar Debug Panel" : "Abrir Debug Panel"}>
        <IconButton
          onClick={togglePanel}
          color="primary"
          size="large"
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[3],
            border: `1px solid ${theme.palette.divider}`,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            transition: theme.transitions.create(['transform'], {
              duration: theme.transitions.duration.standard,
            }),
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          {isOpen ? (
            <CloseIcon />
          ) : (
            <Badge badgeContent={totalNotifications} color="error">
              <BugReportIcon />
            </Badge>
          )}
        </IconButton>
      </Tooltip>

      {/* Painel principal */}
      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            width: 400,
            height: 500,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: theme.shadows[15],
            border: `1px solid ${theme.palette.divider}`,
            borderBottom: 'none',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
        >
          {/* Cabeçalho */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${theme.palette.divider}`,
              px: 2,
              py: 1,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Debug Console
            </Typography>
            <Box>
              <Tooltip title="Modo Compacto">
                <IconButton 
                  size="small" 
                  onClick={toggleCompactMode}
                  sx={{ color: theme.palette.primary.contrastText }}
                >
                  {compactMode ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Fechar">
                <IconButton 
                  size="small" 
                  onClick={togglePanel}
                  sx={{ color: theme.palette.primary.contrastText }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Abas */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              minHeight: compactMode ? 40 : 48,
              borderBottom: 1, 
              borderColor: 'divider' 
            }}
          >
            {tabs.map(tab => (
              <Tab
                key={tab.id}
                value={tab.id}
                icon={
                  <Badge badgeContent={notifications[tab.id] || null} color="error">
                    {tab.icon}
                  </Badge>
                }
                label={compactMode ? undefined : tab.label}
                sx={{ minHeight: compactMode ? 40 : 48 }}
              />
            ))}
          </Tabs>

          {/* Conteúdo da aba ativa */}
          <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            {ActiveTabComponent && <ActiveTabComponent {...sharedProps} />}
          </Box>
        </Paper>
      </Slide>
    </>
  );
};

export default DebugPanel;