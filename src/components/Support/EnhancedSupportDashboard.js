import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Drawer,
  IconButton,
  Toolbar,
  AppBar,
  useTheme,
  useMediaQuery,
  Fab,
  Badge,
  Button
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Support as SupportIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';

// Componentes aprimorados
import EnhancedTicketDetail from './EnhancedTicketDetail';
import SupportAnalyticsDashboard from './SupportAnalyticsDashboard';
import UserContextPanel from './UserContextPanel';
import AdvancedFilters from './AdvancedFilters';
import TicketList from './TicketList'; // Usar o componente existente

import { useSupport } from '../../providers/SupportProvider';

const DRAWER_WIDTH = 400;

/**
 * Dashboard de suporte completamente aprimorado
 * Integra todos os novos componentes para uma experiência de suporte superior
 */
const EnhancedSupportDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    pendingTickets,
    myTickets,
    fetchPendingTickets,
    fetchMyTickets,
    isLoading,
    error
  } = useSupport();

  const [activeTab, setActiveTab] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  const [showUserContext, setShowUserContext] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [savedFilters, setSavedFilters] = useState([
    {
      name: 'Urgentes Hoje',
      filters: { priority: 'urgent', dateRange: 'today' }
    },
    {
      name: 'Não Verificados',
      filters: { verified: 'unverified' }
    },
    {
      name: 'Com Empréstimos Vencidos',
      filters: { hasOverdueLoans: true }
    }
  ]);

  // Dados filtrados
  const filteredTickets = useMemo(() => {
    const allTickets = activeTab === 0 ? pendingTickets : myTickets;
    if (!allTickets) return [];

    let filtered = [...allTickets];

    // Aplicar busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ticket =>
        ticket.title?.toLowerCase().includes(query) ||
        ticket.description?.toLowerCase().includes(query) ||
        ticket.userName?.toLowerCase().includes(query) ||
        ticket.userEmail?.toLowerCase().includes(query) ||
        ticket.id?.toLowerCase().includes(query)
      );
    }

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value === 'all' || value === null || value === '') return;

      switch (key) {
        case 'status':
          if (value !== 'all') {
            filtered = filtered.filter(ticket => ticket.status === value);
          }
          break;
        case 'priority':
          if (value !== 'all') {
            filtered = filtered.filter(ticket => ticket.priority === value);
          }
          break;
        case 'category':
          if (value !== 'all') {
            filtered = filtered.filter(ticket => ticket.category === value);
          }
          break;
        case 'verified':
          if (value === 'verified') {
            filtered = filtered.filter(ticket => ticket.user?.isVerified === true);
          } else if (value === 'unverified') {
            filtered = filtered.filter(ticket => ticket.user?.isVerified === false);
          }
          break;
        case 'hasErrorLogs':
          if (value) {
            filtered = filtered.filter(ticket => 
              ticket.errorLogs && ticket.errorLogs.length > 0
            );
          }
          break;
        case 'hasOverdueLoans':
          if (value) {
            filtered = filtered.filter(ticket => 
              ticket.context?.loan?.loanSummary?.overdueLoans > 0
            );
          }
          break;
        case 'devicePlatform':
          if (value !== 'all') {
            filtered = filtered.filter(ticket => 
              ticket.deviceInfo?.platform === value
            );
          }
          break;
        case 'dateRange':
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

          switch (value) {
            case 'today':
              filtered = filtered.filter(ticket => 
                new Date(ticket.createdAt) >= today
              );
              break;
            case 'yesterday':
              filtered = filtered.filter(ticket => {
                const ticketDate = new Date(ticket.createdAt);
                return ticketDate >= yesterday && ticketDate < today;
              });
              break;
            case 'week':
              filtered = filtered.filter(ticket => 
                new Date(ticket.createdAt) >= weekAgo
              );
              break;
            case 'month':
              filtered = filtered.filter(ticket => 
                new Date(ticket.createdAt) >= monthAgo
              );
              break;
          }
          break;
      }
    });

    return filtered;
  }, [pendingTickets, myTickets, activeTab, searchQuery, filters]);

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketDetail(true);
    if (!isMobile) {
      setShowUserContext(true);
    }
  };

  const handleShowUserContext = (ticket) => {
    setSelectedTicket(ticket);
    setShowUserContext(true);
  };

  const handleSaveFilter = (filterConfig, search) => {
    const name = prompt('Nome para o filtro:');
    if (name) {
      setSavedFilters(prev => [...prev, {
        name,
        filters: filterConfig,
        search
      }]);
    }
  };

  const handleLoadFilter = (filterConfig) => {
    setFilters(filterConfig.filters || {});
    setSearchQuery(filterConfig.search || '');
  };

  const getTicketCountForUser = (userId) => {
    const allTickets = [...(pendingTickets || []), ...(myTickets || [])];
    return allTickets.filter(t => t.userId === userId).length;
  };

  const renderMainContent = () => {
    if (activeTab === 2) {
      return <SupportAnalyticsDashboard />;
    }

    return (
      <Box>
        {/* Filtros */}
        <AdvancedFilters
          onFiltersChange={setFilters}
          onSearchChange={setSearchQuery}
          tickets={[...(pendingTickets || []), ...(myTickets || [])]}
          initialFilters={filters}
          savedFilters={savedFilters}
          onSaveFilter={handleSaveFilter}
          onLoadFilter={handleLoadFilter}
        />

        {/* Lista de tickets */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                {activeTab === 0 ? 'Tickets Pendentes' : 'Meus Tickets'}
                <Badge 
                  badgeContent={filteredTickets.length} 
                  color="primary" 
                  sx={{ ml: 2 }}
                />
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                {isMobile && (
                  <IconButton 
                    onClick={() => setShowFilters(true)}
                    color="primary"
                  >
                    <FilterListIcon />
                  </IconButton>
                )}
              </Box>
            </Box>

            <TicketList
              type={activeTab === 0 ? 'pending' : 'my'}
              tickets={filteredTickets}
              onTicketSelect={handleTicketSelect}
              onShowUserContext={handleShowUserContext}
              showActions={true}
              maxHeight={600}
              emptyMessage={
                filteredTickets.length === 0 && (pendingTickets?.length > 0 || myTickets?.length > 0) 
                  ? "Nenhum ticket encontrado com os filtros aplicados"
                  : "Nenhum ticket disponível"
              }
            />
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Conteúdo principal */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          minWidth: 0 // Importante para evitar overflow
        }}
      >
        {/* Header */}
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            bgcolor: 'background.paper',
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Toolbar>
            <SupportIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
              Suporte Avançado
            </Typography>
            
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ ml: 'auto' }}
            >
              <Tab 
                label={
                  <Badge badgeContent={pendingTickets?.length || 0} color="warning">
                    Pendentes
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={myTickets?.length || 0} color="info">
                    Meus Tickets
                  </Badge>
                } 
              />
              <Tab 
                label="Analytics"
                icon={<AnalyticsIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Toolbar>
        </AppBar>

        {/* Conteúdo */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {renderMainContent()}
        </Box>
      </Box>

      {/* Drawer de contexto do usuário */}
      <Drawer
        anchor="right"
        open={showUserContext}
        onClose={() => setShowUserContext(false)}
        variant={isMobile ? "temporary" : "persistent"}
        sx={{
          width: showUserContext ? DRAWER_WIDTH : 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderLeft: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.default'
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Contexto do Usuário
          </Typography>
          <IconButton onClick={() => setShowUserContext(false)}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
        
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          {selectedTicket && (
            <UserContextPanel
              user={{
                ...selectedTicket.user,
                id: selectedTicket.userId,
                name: selectedTicket.userName,
                email: selectedTicket.userEmail,
                photoURL: selectedTicket.userPhotoURL,
                isVerified: selectedTicket.user?.isVerified,
                loanSummary: selectedTicket.context?.loan?.loanSummary,
                recentActivity: selectedTicket.recentActivity,
                roles: selectedTicket.user?.roles
              }}
              tickets={[...(pendingTickets || []), ...(myTickets || [])]
                .filter(t => t.userId === selectedTicket.userId)}
              onRefresh={() => {
                fetchPendingTickets();
                fetchMyTickets();
              }}
            />
          )}
        </Box>
      </Drawer>

      {/* FAB para mostrar contexto do usuário em mobile */}
      {isMobile && selectedTicket && (
        <Fab
          color="primary"
          aria-label="contexto do usuário"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: theme.zIndex.speedDial
          }}
          onClick={() => setShowUserContext(true)}
        >
          <PersonIcon />
        </Fab>
      )}

      {/* Drawer de filtros para mobile */}
      {isMobile && (
        <Drawer
          anchor="bottom"
          open={showFilters}
          onClose={() => setShowFilters(false)}
          PaperProps={{
            sx: {
              maxHeight: '80vh',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16
            }
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Filtros
              </Typography>
              <IconButton onClick={() => setShowFilters(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            <AdvancedFilters
              onFiltersChange={setFilters}
              onSearchChange={setSearchQuery}
              tickets={[...(pendingTickets || []), ...(myTickets || [])]}
              initialFilters={filters}
              savedFilters={savedFilters}
              onSaveFilter={handleSaveFilter}
              onLoadFilter={handleLoadFilter}
            />
          </Box>
        </Drawer>
      )}

      {/* Dialog de detalhes do ticket */}
      <EnhancedTicketDetail
        ticket={selectedTicket}
        open={showTicketDetail}
        onClose={() => {
          setShowTicketDetail(false);
          setSelectedTicket(null);
        }}
        onUpdate={(ticket) => {
          // Implementar atualização do ticket
          // Ticket updated successfully
        }}
      />
    </Box>
  );
};

export default EnhancedSupportDashboard;