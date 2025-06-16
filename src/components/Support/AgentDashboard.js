// src/components/Support/AgentDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Badge,
  useTheme,
  alpha,
  Fade,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Support as SupportIcon
} from '@mui/icons-material';
import { useSupport } from '../../providers/SupportProvider';
import TicketList from './TicketList';
import { useNavigate } from 'react-router-dom';

/**
 * Painel completo para agentes de suporte
 * Interface moderna com métricas, filtros e gestão de tickets
 */
const AgentDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { 
    pendingTickets,
    myTickets,
    metrics,
    searchQuery,
    filters,
    isLoading,
    isFetchingTickets,
    hasPermissions,
    error,
    fetchPendingTickets,
    fetchMyTickets,
    setSearchQuery,
    setFilters,
    clearError
  } = useSupport();

  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Verificação de permissões
  useEffect(() => {
    if (!hasPermissions) {
      // Redirecionar ou mostrar mensagem de erro
    }
  }, [hasPermissions]);

  // Buscar dados iniciais
  useEffect(() => {
    if (hasPermissions) {
      fetchPendingTickets();
      fetchMyTickets();
    }
  }, [hasPermissions, fetchPendingTickets, fetchMyTickets]);

  // Handler para refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchPendingTickets(),
        fetchMyTickets()
      ]);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [fetchPendingTickets, fetchMyTickets]);

  // Handler para mudança de aba
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handler para busca
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handler para filtros
  const handleFilterChange = (filterType, value) => {
    setFilters({ [filterType]: value });
  };

  // Componente de métricas
  const MetricsCards = () => {
    const metricsData = [
      {
        title: 'Tickets Pendentes',
        value: metrics.pendingTickets || 0,
        icon: <ScheduleIcon />,
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, 0.1)
      },
      {
        title: 'Meus Tickets',
        value: metrics.assignedTickets || 0,
        icon: <AssignmentIcon />,
        color: theme.palette.info.main,
        bgColor: alpha(theme.palette.info.main, 0.1)
      },
      {
        title: 'Resolvidos Hoje',
        value: metrics.resolvedTickets || 0,
        icon: <CheckCircleIcon />,
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.1)
      },
      {
        title: 'Tempo Médio',
        value: `${Math.round(metrics.averageResponseTime || 0)}m`,
        icon: <TrendingUpIcon />,
        color: theme.palette.primary.main,
        bgColor: alpha(theme.palette.primary.main, 0.1)
      }
    ];

    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {metricsData.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Fade in={true} style={{ transitionDelay: `${index * 100}ms` }}>
              <Card
                sx={{
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                    ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(metric.color, 0.3)}`,
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {metric.title}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: metric.color }}>
                        {metric.value}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        backgroundColor: metric.bgColor,
                        color: metric.color
                      }}
                    >
                      {metric.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Componente de controles
  const Controls = () => (
    <Card
      sx={{
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.9)} 0%, 
          ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        borderRadius: 3,
        mb: 3
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Gerenciamento de Tickets
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2)
                }
              }}
            >
              {refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Busca */}
          <TextField
            placeholder="Buscar tickets..."
            value={searchQuery}
            onChange={handleSearchChange}
            size="small"
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />

          {/* Filtros */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {/* Filtro de Status */}
            <Chip
              label={`Status: ${filters.status === 'all' ? 'Todos' : filters.status}`}
              variant={filters.status !== 'all' ? 'filled' : 'outlined'}
              onClick={() => {
                const nextStatus = filters.status === 'all' ? 'pending' : 
                                 filters.status === 'pending' ? 'assigned' :
                                 filters.status === 'assigned' ? 'resolved' : 'all';
                handleFilterChange('status', nextStatus);
              }}
              sx={{
                backgroundColor: filters.status !== 'all' ? alpha(theme.palette.primary.main, 0.1) : undefined,
                color: filters.status !== 'all' ? theme.palette.primary.main : undefined
              }}
            />

            {/* Filtro de Prioridade */}
            <Chip
              label={`Prioridade: ${filters.priority === 'all' ? 'Todas' : filters.priority}`}
              variant={filters.priority !== 'all' ? 'filled' : 'outlined'}
              onClick={() => {
                const nextPriority = filters.priority === 'all' ? 'high' : 
                                    filters.priority === 'high' ? 'medium' :
                                    filters.priority === 'medium' ? 'low' : 'all';
                handleFilterChange('priority', nextPriority);
              }}
              sx={{
                backgroundColor: filters.priority !== 'all' ? alpha(theme.palette.secondary.main, 0.1) : undefined,
                color: filters.priority !== 'all' ? theme.palette.secondary.main : undefined
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  // Se não tem permissões
  if (!hasPermissions) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Você não tem permissões para acessar o painel de suporte.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              backgroundColor: theme.palette.primary.main
            }}
          >
            <SupportIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Painel de Suporte
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gerencie tickets e atenda usuários
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Erro */}
      {error && (
        <Alert 
          severity="error" 
          onClose={clearError}
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* Métricas */}
      <MetricsCards />

      {/* Controles */}
      <Controls />

      {/* Tabs */}
      <Card
        sx={{
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.9)} 0%, 
            ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          borderRadius: 3
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 'medium'
              }
            }}
          >
            <Tab 
              label={
                <Badge badgeContent={metrics.pendingTickets} color="warning">
                  Tickets Pendentes
                </Badge>
              } 
              icon={<ScheduleIcon />}
              iconPosition="start"
            />
            <Tab 
              label={
                <Badge badgeContent={metrics.assignedTickets} color="info">
                  Meus Tickets
                </Badge>
              } 
              icon={<AssignmentIcon />}
              iconPosition="start"
            />
            <Tab 
              label="Dashboard"
              icon={<DashboardIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {/* Conteúdo das abas */}
          {activeTab === 0 && (
            <TicketList
              type="pending"
              title="Tickets Aguardando Atribuição"
              showActions={true}
              maxHeight={500}
              emptyMessage="Não há tickets pendentes no momento"
              onTicketClick={(ticket) => {
                // Navegar para detalhes do ticket
                navigate(`/support/ticket/${ticket.id}`);
              }}
              onAssignTicket={(ticket) => {
                fetchMyTickets();
              }}
              onResolveTicket={(ticket) => {
                fetchPendingTickets();
                fetchMyTickets();
              }}
            />
          )}

          {activeTab === 1 && (
            <TicketList
              type="my"
              title="Meus Tickets Atribuídos"
              showActions={true}
              maxHeight={500}
              emptyMessage="Você não tem tickets atribuídos"
              onTicketClick={(ticket) => {
                // Navegar para detalhes do ticket
                // TODO: Implementar navegação para /support/ticket/:id
              }}
              onAssignTicket={(ticket) => {
                fetchMyTickets();
              }}
              onResolveTicket={(ticket) => {
                fetchPendingTickets();
                fetchMyTickets();
              }}
            />
          )}

          {activeTab === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Relatórios e Métricas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dashboard de métricas em desenvolvimento...
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AgentDashboard;