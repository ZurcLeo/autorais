import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  IconButton,
  Grid,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  InputAdornment,
  Tooltip,
  Badge,
  Switch,
  FormControlLabel,
  Slider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  SavedSearch as SavedSearchIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Priority as PriorityIcon,
  Computer as ComputerIcon,
  Language as LanguageIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
// import { LocalizationProvider, DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { ptBR } from 'date-fns/locale';

/**
 * Componente de filtros avançados e busca inteligente
 * Oferece múltiplas opções de filtragem e busca semântica
 */
const AdvancedFilters = ({ 
  onFiltersChange, 
  onSearchChange, 
  tickets = [], 
  initialFilters = {},
  savedFilters = [],
  onSaveFilter,
  onLoadFilter 
}) => {
  const theme = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [quickSearch, setQuickSearch] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [savedSearch, setSavedSearch] = useState(false);
  
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    assignedTo: 'all',
    dateRange: 'all',
    customDateStart: null,
    customDateEnd: null,
    devicePlatform: 'all',
    browser: 'all',
    verified: 'all',
    hasErrorLogs: false,
    hasOverdueLoans: false,
    isFrequentUser: false,
    responseTimeRange: [0, 48], // em horas
    ...initialFilters
  });

  // Extrair opções únicas dos tickets
  const getUniqueValues = useCallback((field) => {
    const values = tickets
      .map(ticket => {
        if (field.includes('.')) {
          const keys = field.split('.');
          let value = ticket;
          for (const key of keys) {
            value = value?.[key];
          }
          return value;
        }
        return ticket[field];
      })
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    
    return values.sort();
  }, [tickets]);

  const categories = getUniqueValues('category');
  const assignees = getUniqueValues('assignedTo');
  const platforms = getUniqueValues('deviceInfo.platform');
  const browsers = tickets
    .map(t => {
      if (t.deviceInfo?.userAgent) {
        if (t.deviceInfo.userAgent.includes('Chrome')) return 'Chrome';
        if (t.deviceInfo.userAgent.includes('Safari')) return 'Safari';
        if (t.deviceInfo.userAgent.includes('Firefox')) return 'Firefox';
        if (t.deviceInfo.userAgent.includes('Edge')) return 'Edge';
      }
      return null;
    })
    .filter(Boolean)
    .filter((value, index, self) => self.indexOf(value) === index);

  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchChange?.(searchQuery);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, onSearchChange]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleQuickFilter = (filterType, value) => {
    const newFilters = { ...filters };
    
    if (filterType === 'urgent') {
      newFilters.priority = 'urgent';
    } else if (filterType === 'unassigned') {
      newFilters.status = 'pending';
    } else if (filterType === 'today') {
      newFilters.dateRange = 'today';
    } else if (filterType === 'overdue') {
      newFilters.hasOverdueLoans = true;
    }
    
    setFilters(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      category: 'all',
      assignedTo: 'all',
      dateRange: 'all',
      customDateStart: null,
      customDateEnd: null,
      devicePlatform: 'all',
      browser: 'all',
      verified: 'all',
      hasErrorLogs: false,
      hasOverdueLoans: false,
      isFrequentUser: false,
      responseTimeRange: [0, 48]
    });
    setSearchQuery('');
    setQuickSearch('');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'responseTimeRange') {
        if (value[0] !== 0 || value[1] !== 48) count++;
      } else if (typeof value === 'boolean' && value) {
        count++;
      } else if (value !== 'all' && value !== null && value !== '') {
        count++;
      }
    });
    if (searchQuery) count++;
    return count;
  };

  const renderQuickFilters = () => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Filtros Rápidos
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          label="Urgentes"
          onClick={() => handleQuickFilter('urgent')}
          variant={filters.priority === 'urgent' ? 'filled' : 'outlined'}
          color="error"
          size="small"
        />
        <Chip
          label="Não Atribuídos"
          onClick={() => handleQuickFilter('unassigned')}
          variant={filters.status === 'pending' ? 'filled' : 'outlined'}
          color="warning"
          size="small"
        />
        <Chip
          label="Hoje"
          onClick={() => handleQuickFilter('today')}
          variant={filters.dateRange === 'today' ? 'filled' : 'outlined'}
          color="info"
          size="small"
        />
        <Chip
          label="Empréstimos Vencidos"
          onClick={() => handleQuickFilter('overdue')}
          variant={filters.hasOverdueLoans ? 'filled' : 'outlined'}
          color="error"
          size="small"
        />
      </Box>
    </Box>
  );

  const renderBasicFilters = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            label="Status"
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="pending">Pendente</MenuItem>
            <MenuItem value="assigned">Atribuído</MenuItem>
            <MenuItem value="resolved">Resolvido</MenuItem>
            <MenuItem value="closed">Fechado</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth size="small">
          <InputLabel>Prioridade</InputLabel>
          <Select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            label="Prioridade"
          >
            <MenuItem value="all">Todas</MenuItem>
            <MenuItem value="low">Baixa</MenuItem>
            <MenuItem value="medium">Média</MenuItem>
            <MenuItem value="high">Alta</MenuItem>
            <MenuItem value="urgent">Urgente</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth size="small">
          <InputLabel>Categoria</InputLabel>
          <Select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            label="Categoria"
          >
            <MenuItem value="all">Todas</MenuItem>
            {categories.map(category => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth size="small">
          <InputLabel>Período</InputLabel>
          <Select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            label="Período"
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="today">Hoje</MenuItem>
            <MenuItem value="yesterday">Ontem</MenuItem>
            <MenuItem value="week">Última Semana</MenuItem>
            <MenuItem value="month">Último Mês</MenuItem>
            <MenuItem value="custom">Personalizado</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  const renderAdvancedFilters = () => (
    <Accordion 
      expanded={expanded}
      onChange={(e, isExpanded) => setExpanded(isExpanded)}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TuneIcon />
          <Typography variant="subtitle1">Filtros Avançados</Typography>
          {getActiveFiltersCount() > 4 && (
            <Badge badgeContent={getActiveFiltersCount() - 4} color="primary" />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Atribuído para</InputLabel>
              <Select
                value={filters.assignedTo}
                onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                label="Atribuído para"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="me">Meus Tickets</MenuItem>
                {assignees.map(assignee => (
                  <MenuItem key={assignee} value={assignee}>
                    {assignee.substring(0, 8)}...
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Plataforma</InputLabel>
              <Select
                value={filters.devicePlatform}
                onChange={(e) => handleFilterChange('devicePlatform', e.target.value)}
                label="Plataforma"
              >
                <MenuItem value="all">Todas</MenuItem>
                {platforms.map(platform => (
                  <MenuItem key={platform} value={platform}>
                    {platform}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Navegador</InputLabel>
              <Select
                value={filters.browser}
                onChange={(e) => handleFilterChange('browser', e.target.value)}
                label="Navegador"
              >
                <MenuItem value="all">Todos</MenuItem>
                {browsers.map(browser => (
                  <MenuItem key={browser} value={browser}>
                    {browser}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Usuário Verificado</InputLabel>
              <Select
                value={filters.verified}
                onChange={(e) => handleFilterChange('verified', e.target.value)}
                label="Usuário Verificado"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="verified">Verificados</MenuItem>
                <MenuItem value="unverified">Não Verificados</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={8}>
            <Typography gutterBottom>
              Tempo de Resposta (horas): {filters.responseTimeRange[0]} - {filters.responseTimeRange[1]}
            </Typography>
            <Slider
              value={filters.responseTimeRange}
              onChange={(e, newValue) => handleFilterChange('responseTimeRange', newValue)}
              valueLabelDisplay="auto"
              min={0}
              max={168} // 7 dias
              marks={[
                { value: 0, label: '0h' },
                { value: 24, label: '1d' },
                { value: 72, label: '3d' },
                { value: 168, label: '7d' }
              ]}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.hasErrorLogs}
                    onChange={(e) => handleFilterChange('hasErrorLogs', e.target.checked)}
                  />
                }
                label="Com logs de erro"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.hasOverdueLoans}
                    onChange={(e) => handleFilterChange('hasOverdueLoans', e.target.checked)}
                  />
                }
                label="Empréstimos vencidos"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.isFrequentUser}
                    onChange={(e) => handleFilterChange('isFrequentUser', e.target.checked)}
                  />
                }
                label="Usuário frequente"
              />
            </Box>
          </Grid>

          {filters.dateRange === 'custom' && (
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Data inicial"
                    type="date"
                    value={filters.customDateStart ? new Date(filters.customDateStart).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleFilterChange('customDateStart', e.target.value ? new Date(e.target.value) : null)}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Data final"
                    type="date"
                    value={filters.customDateEnd ? new Date(filters.customDateEnd).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleFilterChange('customDateEnd', e.target.value ? new Date(e.target.value) : null)}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  const renderSavedFilters = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Filtros Salvos
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {savedFilters.map((saved, index) => (
          <Chip
            key={index}
            label={saved.name}
            onClick={() => onLoadFilter?.(saved.filters)}
            variant="outlined"
            size="small"
            icon={<SavedSearchIcon />}
          />
        ))}
        {savedSearch && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => onSaveFilter?.(filters, searchQuery)}
            startIcon={<SavedSearchIcon />}
          >
            Salvar Busca
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* Busca principal */}
        <TextField
          fullWidth
          placeholder="Buscar por título, descrição, usuário, ID do ticket..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchQuery('')}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {/* Filtros rápidos */}
        {renderQuickFilters()}

        {/* Filtros básicos */}
        {renderBasicFilters()}

        {/* Filtros avançados */}
        {renderAdvancedFilters()}

        {/* Ações */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={clearAllFilters}
              startIcon={<ClearIcon />}
              size="small"
              disabled={getActiveFiltersCount() === 0}
            >
              Limpar Filtros
            </Button>
            <FormControlLabel
              control={
                <Switch
                  checked={savedSearch}
                  onChange={(e) => setSavedSearch(e.target.checked)}
                  size="small"
                />
              }
              label="Salvar busca"
            />
          </Box>
          
          <Chip
            label={`${getActiveFiltersCount()} filtros ativos`}
            color={getActiveFiltersCount() > 0 ? 'primary' : 'default'}
            size="small"
            variant="outlined"
          />
        </Box>

        {/* Filtros salvos */}
        {savedFilters.length > 0 && renderSavedFilters()}
      </CardContent>
    </Card>
  );
};

export default AdvancedFilters;