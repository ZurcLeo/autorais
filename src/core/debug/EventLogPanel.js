// src/core/debug/EventLogPanel.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Divider,
  Tooltip,
  Collapse,
  Button,
  Menu,
  MenuItem,
  Badge,
  useTheme
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { serviceEventHub } from '../services/BaseService';
// Componente para exibir objetos JSON com formatação de sintaxe
const JsonView = ({ data }) => {
  const theme = useTheme();

  // Função para formatar JSON com destaques coloridos
  const formatJson = (obj) => {
    const jsonString = JSON.stringify(obj, null, 2);
    
    // Aplicar cores baseadas no tema atual
    return jsonString
      .replace(/"([^"]+)":/g, `<span style="color: ${theme.palette.primary.main}">"$1":</span>`)
      .replace(/"([^"]+)"/g, `<span style="color: ${theme.palette.success.main}">"$1"</span>`)
      .replace(/\b(true|false|null)\b/g, `<span style="color: ${theme.palette.warning.main}">$1</span>`)
      .replace(/\b(\d+)\b/g, `<span style="color: ${theme.palette.error.main}">$1</span>`);
  };

  return (
    <Box
      sx={{
        fontFamily: 'monospace',
        fontSize: '12px',
        padding: 1,
        backgroundColor: theme.palette.background.default,
        borderRadius: 1,
        overflowX: 'auto',
        whiteSpace: 'pre-wrap',
      }}
      dangerouslySetInnerHTML={{ __html: formatJson(data) }}
    />
  );
};

export const EventLogPanel = ({ addNotification, compactMode }) => {
  const theme = useTheme();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [serviceFilters, setServiceFilters] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const listRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // Carregar filtros salvos do localStorage
  useEffect(() => {
    try {
      const savedFilters = localStorage.getItem('debugPanelEventFilters');
      if (savedFilters) {
        setActiveFilters(JSON.parse(savedFilters));
      }
    } catch (error) {
      console.error('Error loading event filters:', error);
    }
  }, []);

  // Salvar filtros no localStorage quando alterados
  useEffect(() => {
    try {
      localStorage.setItem('debugPanelEventFilters', JSON.stringify(activeFilters));
    } catch (error) {
      console.error('Error saving event filters:', error);
    }
  }, [activeFilters]);

  // Filtrar eventos quando a lista ou filtros mudam
  useEffect(() => {
    let filtered = events;

    if (activeFilters.length > 0) {
        filtered = filtered.filter(event => activeFilters.includes(event.serviceName));
    }

    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(event =>
            event.serviceName.toLowerCase().includes(term) ||
            event.eventType.toLowerCase().includes(term) ||
            JSON.stringify(event.data).toLowerCase().includes(term)
        );
    }
    console.log("Filtered events: ", filtered);
    setFilteredEvents(filtered);
}, [events, searchTerm, activeFilters]);

  // Escutar eventos do serviceEventHub
  useEffect(() => {
    if (isPaused) return;

    console.log('EventLogPanel: Configurando listener para serviceEventHub');
    console.log('serviceEventHub disponível:', !!serviceEventHub);

// No handleEvent onde você adiciona eventos ao estado:
const handleEvent = (serviceName, eventType, data) => {
  // Validar e limpar dados para garantir que sejam serializáveis
  let safeData = {};
  try {
    // Tenta criar uma cópia limpa dos dados
    JSON.stringify(data); // Se isso falhar, o dado não é serializável
    safeData = {...data};
  } catch (e) {
    console.warn('Dados de evento não serializáveis:', e);
    safeData = { warning: 'Dados não serializáveis', partial: String(data) };
  }
  
  const newEvent = {
    id: Date.now(),
    serviceName: String(serviceName),
    eventType: String(eventType),
    data: safeData,
    timestamp: new Date()
  };
  
  setEvents(prev => [newEvent, ...prev.slice(0, 999)]);
};
    
    try {
      unsubscribeRef.current = serviceEventHub.onAny('*', handleEvent);
      console.log('Listener global registrado com sucesso');
    } catch (error) {
      console.error('Erro ao registrar listener para eventos:', error);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        console.log('Listener global removido');
      }
    };
  }, [isPaused, addNotification]);

  // Atualizar lista de serviços disponíveis para filtragem
  useEffect(() => {
    const services = [...new Set(events.map(event => event.serviceName))];
    setServiceFilters(services);
  }, [events]);


  
  // Limpar todos os eventos
  const handleClearEvents = useCallback(() => {
    setEvents([]);
    setSelectedEventId(null);
  }, []);

  // Atualizar termo de busca
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Pausar/resumir captura de eventos
  const handleTogglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Abrir menu de filtros
  const handleMenuOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  // Fechar menu de filtros
  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Alternar filtro de serviço
  const handleToggleFilter = useCallback((service) => {
    setActiveFilters(prev => 
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  }, []);

  // Limpar todos os filtros
  const handleClearFilters = useCallback(() => {
    setActiveFilters([]);
    setSearchTerm('');
  }, []);

  // Selecionar/deselecionar evento para visualização detalhada
  const handleSelectEvent = useCallback((eventId) => {
    setSelectedEventId(prev => prev === eventId ? null : eventId);
  }, []);

  // Exportar evento para o console
  const handleLogEventToConsole = useCallback((event) => {
    console.group(`Debug Event: ${event.serviceName}:${event.eventType}`);
    console.log('Timestamp:', format(event.timestamp, 'yyyy-MM-dd HH:mm:ss.SSS'));
    console.log('Service:', event.serviceName);
    console.log('Event Type:', event.eventType);
    console.log('Data:', event.data);
    console.groupEnd();
  }, []);

  // Evento selecionado
  const selectedEvent = events.find(e => e.id === selectedEventId);
  console.log('Estado dos eventos:', events);

// Função para criar evento de teste
const createTestEvent = () => {
  console.log('Criando evento de teste');
  const testEvent = {
    id: Date.now(),
    serviceName: 'test',
    eventType: 'TEST_EVENT',
    data: { test: true, timestamp: new Date().toISOString() },
    timestamp: new Date()
  };
  setEvents(prev => [testEvent, ...prev]);
  
  // Notificar o DebugPanel sobre um novo evento
  if (typeof addNotification === 'function') {
    addNotification('events');
  }
  
  console.log('Evento de teste criado:', testEvent);
  console.log('Estado atual dos eventos:', events);
};

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Toolbar com controles */}
      <Box 
        sx={{ 
          p: 1, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <TextField
          size="small"
          placeholder="Filtrar eventos..."
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
        
        <Tooltip title="Filtros">
          <IconButton size="small" onClick={handleMenuOpen}>
            <Badge
              badgeContent={activeFilters.length}
              color="primary"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <FilterIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>
        
        <Tooltip title={isPaused ? "Continuar" : "Pausar"}>
          <IconButton 
            size="small" 
            onClick={handleTogglePause}
            color={isPaused ? "error" : "default"}
          >
            {isPaused ? <PlayIcon fontSize="small" /> : <PauseIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Limpar">
          <IconButton size="small" onClick={handleClearEvents}>
            <ClearIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Menu de filtros */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { maxHeight: 300, width: 200 } }}
      >
        <MenuItem dense onClick={handleClearFilters}>
          <ListItemText primary="Limpar Filtros" />
        </MenuItem>
        <Divider />
        {serviceFilters.map(service => (
          <MenuItem 
            key={service} 
            dense 
            onClick={() => handleToggleFilter(service)}
            selected={activeFilters.includes(service)}
          >
            <ListItemText primary={service} />
          </MenuItem>
        ))}
      </Menu>
      
      {/* Exibir filtros ativos como chips */}
      {activeFilters.length > 0 && (
        <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {activeFilters.map(filter => (
            <Chip
              key={filter}
              label={filter}
              size="small"
              onDelete={() => handleToggleFilter(filter)}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      )}
      
      {/* Alerta quando a captura está pausada */}
      {isPaused && (
        <Box 
          sx={{ 
            p: 0.5, 
            bgcolor: theme.palette.warning.light, 
            color: theme.palette.warning.contrastText,
            textAlign: 'center' 
          }}
        >
          <Typography variant="caption">Captura de eventos pausada</Typography>
        </Box>
      )}
      
      {/* Layout flexível para lista de eventos e detalhes */}
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Lista de eventos - tamanho ajustável dependendo se há detalhes */}
        <Box 
          ref={listRef}
          sx={{ 
            flex: selectedEvent ? 0.6 : 1,
            overflow: 'auto',
            transition: theme.transitions.create(['flex'], {
              duration: theme.transitions.duration.standard,
            }),
          }}
        >
          {filteredEvents.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Nenhum evento capturado. Aguardando atividade...
              </Typography>
            </Box>
          ) : (
            <List dense disablePadding>
              {filteredEvents.map(event => (
                <ListItem 
                  key={event.id}
                  divider
                  button
                  selected={event.id === selectedEventId}
                  onClick={() => handleSelectEvent(event.id)}
                  sx={{ 
                    py: 0.75,
                    '&:hover': {
                      bgcolor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight="medium" noWrap>
                          {event.serviceName}:{event.eventType}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
  {typeof event.timestamp === 'object' && event.timestamp !== null && 'timestamp' in event.timestamp
    ? typeof event.timestamp.timestamp === 'number'
      ? format(new Date(event.timestamp.timestamp), 'HH:mm:ss.SSS')
      : event.timestamp.timestamp instanceof Date
        ? format(event.timestamp.timestamp, 'HH:mm:ss.SSS')
        : String(event.timestamp.timestamp)
    : typeof event.timestamp === 'number'
      ? format(new Date(event.timestamp), 'HH:mm:ss.SSS')
      : event.timestamp instanceof Date
        ? format(event.timestamp, 'HH:mm:ss.SSS')
        : String(event.timestamp)}
</Typography>
                      </Box>
                    }
                    secondary={
<Typography variant="caption" color="text.secondary">
  {event.timestamp instanceof Date
    ? format(event.timestamp, 'HH:mm:ss.SSS')
    : String(event.timestamp)}
</Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}




<Button
  variant="contained"
  onClick={() => {
    if (serviceEventHub.getBufferedEvents) {
      let bufferedEvents = serviceEventHub.getBufferedEvents();
      bufferedEvents = bufferedEvents.map((bufferedEvent, index) => {
        let normalizedTimestamp = bufferedEvent.timestamp;
        if (typeof bufferedEvent.timestamp === 'object' && bufferedEvent.timestamp !== null && 'timestamp' in bufferedEvent.timestamp) {
          normalizedTimestamp = bufferedEvent.timestamp.timestamp;
        }
        const finalTimestamp = typeof normalizedTimestamp === 'number' ? new Date(normalizedTimestamp) : normalizedTimestamp;
        return {
          id: bufferedEvent.id !== undefined ? bufferedEvent.id : `${finalTimestamp.getTime()}-${index}`,
          serviceName: bufferedEvent.service || bufferedEvent.serviceName || undefined,
          eventType: bufferedEvent.type || bufferedEvent.eventType || null,
          data: bufferedEvent.data || {},
          timestamp: finalTimestamp,
        };
      });
      console.log("Normalized Buffered Events:", bufferedEvents);
      setEvents(prev => [...bufferedEvents, ...prev]);
    }
  }}
>
  Carregar Eventos de Inicialização
</Button>




        </Box>
        
        {/* Detalhes do evento selecionado */}
        <Collapse 
          in={!!selectedEvent} 
          sx={{ 
            flex: selectedEvent ? 0.4 : 0,
            overflow: 'auto',
            borderTop: selectedEvent ? `1px solid ${theme.palette.divider}` : 'none',
          }}
        >
          {selectedEvent && (
            <Box sx={{ p: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2">Detalhes do Evento</Typography>
                <Typography variant="caption">
                  {format(selectedEvent.timestamp, 'yyyy-MM-dd HH:mm:ss.SSS')}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 1 }}>
                <Chip 
                  label={selectedEvent.serviceName} 
                  size="small" 
                  color="primary" 
                  sx={{ mr: 1 }}
                />
                <Chip 
                  label={selectedEvent.eventType} 
                  size="small" 
                  variant="outlined"
                />
              </Box>
              
              <Typography variant="caption">
  {selectedEvent.timestamp instanceof Date
    ? format(selectedEvent.timestamp, 'yyyy-MM-dd HH:mm:ss.SSS')
    : String(selectedEvent.timestamp)}
</Typography>
              <JsonView data={selectedEvent.data} />
              
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  size="small" 
                  startIcon={<CodeIcon />}
                  variant="outlined"
                  onClick={() => handleLogEventToConsole(selectedEvent)}
                >
                  Exibir no Console
                </Button>
              </Box>
            </Box>
          )}
        </Collapse>
      </Box>
    </Box>
  );
};