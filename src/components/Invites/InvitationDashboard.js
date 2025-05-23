// InvitationDashboard.jsx - Refatorado com Material UI
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {InvitationCard} from './InvitationCard'; // Versão refatorada com MUI
import { 
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  Grid,
  Chip,
  Card,
  CardContent,
  Divider,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Sort as SortIcon,
  CheckCircle as SuccessIcon,
  Email as EmailIcon,
  AccessTime as AccessTimeIcon,
  SyncAlt as ConversionIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Componente de Tabs personalizado para adicionar contadores
const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 0,
  fontWeight: theme.typography.fontWeightRegular,
  padding: '12px 16px',
  '&.Mui-selected': {
    fontWeight: theme.typography.fontWeightMedium,
  },
}));

// Component para um contador de badge
const TabBadge = ({ value, color = "default" }) => (
  <Badge 
    badgeContent={value} 
    color={color}
    sx={{ ml: 1 }}
  />
);

// Componente para o cabeçalho de estatísticas
const StatsCard = ({ title, value, icon, highlight = false, color = "primary" }) => (
  <Card 
    sx={{ 
      minWidth: 150, 
      transition: 'all 0.3s',
      borderLeft: highlight ? 3 : 0,
      borderColor: highlight ? `${color}.main` : 'transparent',
      bgcolor: highlight ? `${color}.lighter` : 'background.paper',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 3
      }
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon}
        <Typography variant="body2" color="text.secondary" ml={1}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" color={highlight ? `${color}.main` : 'text.primary'}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

// Componente de conteúdo vazio
const EmptyState = ({ type, onAction }) => {
  const messages = {
    all: {
      title: "Sem convites ainda",
      description: "Convide seus amigos para a plataforma e veja-os aqui.",
      action: "Convidar amigo"
    },
    pending: {
      title: "Sem convites pendentes",
      description: "Todos os seus convites já foram respondidos ou você ainda não enviou nenhum.",
      action: "Convidar amigo"
    },
    used: {
      title: "Sem convites aceitos",
      description: "Seus convites ainda não foram aceitos por nenhum amigo.",
      action: "Lembrar amigos"
    },
    expired: {
      title: "Sem convites expirados",
      description: "Seus convites estão todos ativos ou já foram aceitos.",
      action: "Ver convites ativos"
    },
    canceled: {
      title: "Sem convites cancelados",
      description: "Você não cancelou nenhum convite.",
      action: "Ver convites ativos"
    },
    search: {
      title: "Nenhum resultado encontrado",
      description: "Tente buscar com outros termos ou filtros.",
      action: "Limpar busca"
    }
  };

  const info = messages[type] || messages.all;

  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 5,
        textAlign: 'center',
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: '1px dashed',
        borderColor: 'divider'
      }}
    >
      <EmailIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6">{info.title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, my: 2 }}>
        {info.description}
      </Typography>
      <Button variant="contained" startIcon={<AddIcon />} onClick={onAction}>
        {info.action}
      </Button>
    </Box>
  );
};

// Componente principal
export const InvitationDashboard = ({ invitationsData, onResend, onCancel }) => {
  const safeInvitationsData = invitationsData || [];
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState('date'); // 'date', 'status', 'none'
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Mapear tabValue para status
  const tabToStatus = {
    0: 'all',
    1: 'pending',
    2: 'used',
    3: 'expired',
    4: 'canceled'
  };
  
  const currentTab = tabToStatus[tabValue];
  
  // Agrupar convites por data
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  
  const lastMonthStart = new Date(today);
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
  
  // Calcular estatísticas
  const stats = useMemo(() => {
    const total = safeInvitationsData.length;
    const used = safeInvitationsData.filter(inv => inv.status === 'used').length;
    const conversionRate = total > 0 ? Math.round((used / total) * 100) : 0;
    
    // Tempo médio de resposta
    const responseTimeMs = safeInvitationsData
      .filter(inv => inv.status === 'used' && inv.createdAt && inv.validatedBy)
      .map(inv => {
        const created = new Date(inv.createdAt);
        // Normalmente usaria inv.usedAt, mas usando createdAt + 2 dias aleatórios para simulação
        const used = new Date(created);
        used.setDate(used.getDate() + Math.floor(Math.random() * 5) + 1);
        return used - created;
      });
    
    const avgResponseTime = responseTimeMs.length > 0 
      ? responseTimeMs.reduce((sum, time) => sum + time, 0) / responseTimeMs.length 
      : 0;
    
    // Converte para dias
    const avgResponseDays = Math.round(avgResponseTime / (1000 * 60 * 60 * 24) * 10) / 10;
    
    return {
      total,
      used,
      pending: safeInvitationsData.filter(inv => inv.status === 'pending').length,
      expired: safeInvitationsData.filter(inv => inv.status === 'expired').length,
      canceled: safeInvitationsData.filter(inv => inv.status === 'canceled').length,
      conversionRate,
      avgResponseDays
    };
  }, [safeInvitationsData]);
  
  // Filtrar convites com base no tab e busca
  const filteredInvitations = useMemo(() => {
    return safeInvitationsData.filter(invitation => {
      // Filtro de tab
      if (currentTab !== 'all' && invitation.status !== currentTab) {
        return false;
      }
      
      // Filtro de busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          invitation.email.toLowerCase().includes(searchLower) ||
          invitation.friendName.toLowerCase().includes(searchLower) ||
          invitation.senderName.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  }, [safeInvitationsData, currentTab, searchTerm]);
  
  // Agrupar convites conforme necessário
  const groupedInvitations = useMemo(() => {
    if (groupBy === 'none') {
      return { 'Todos os Convites': filteredInvitations };
    }
    
    if (groupBy === 'status') {
      const groups = {};
      
      const statusLabels = {
        pending: 'Pendentes',
        used: 'Aceitos',
        expired: 'Expirados',
        canceled: 'Cancelados'
      };
      
      filteredInvitations.forEach(invitation => {
        const groupName = statusLabels[invitation.status] || 'Outros';
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push(invitation);
      });
      
      return groups;
    }
    
    // Agrupar por data (padrão)
    const groups = {
      'Hoje': [],
      'Ontem': [],
      'Esta Semana': [],
      'Este Mês': [],
      'Mais Antigos': []
    };
    
    filteredInvitations.forEach(invitation => {
      const createdAt = new Date(invitation.createdAt);
      
      if (createdAt >= today) {
        groups['Hoje'].push(invitation);
      } else if (createdAt >= yesterday) {
        groups['Ontem'].push(invitation);
      } else if (createdAt >= lastWeekStart) {
        groups['Esta Semana'].push(invitation);
      } else if (createdAt >= lastMonthStart) {
        groups['Este Mês'].push(invitation);
      } else {
        groups['Mais Antigos'].push(invitation);
      }
    });
    
    // Remover grupos vazios
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });
    
    return groups;
  }, [filteredInvitations, groupBy, today, yesterday, lastWeekStart, lastMonthStart]);
  
  // Manipuladores de eventos
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
  };
  
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedIds([]);
  };
  
  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedIds.length === filteredInvitations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInvitations.map(inv => inv.id));
    }
  };
  
  const handleBulkAction = (action) => {
    if (action === 'resend') {
      selectedIds.forEach(id => {
        const invitation = safeInvitationsData.find(inv => inv.id === id);
        if (invitation && (invitation.status === 'pending' || invitation.status === 'expired')) {
          onResend(invitation.inviteId);
        }
      });
    } else if (action === 'cancel') {
      selectedIds.forEach(id => {
        const invitation = safeInvitationsData.find(inv => inv.id === id);
        if (invitation && invitation.status === 'pending') {
          onCancel(invitation.inviteId);
        }
      });
    }
    
    setSelectedIds([]);
    setIsSelectMode(false);
  };
  
  const toggleGroupBy = () => {
    const options = ['date', 'status', 'none'];
    const currentIndex = options.indexOf(groupBy);
    const nextIndex = (currentIndex + 1) % options.length;
    setGroupBy(options[nextIndex]);
  };
  
  const getGroupByLabel = () => {
    switch (groupBy) {
      case 'date': return 'Data';
      case 'status': return 'Status';
      case 'none': return 'Nenhum';
      default: return 'Data';
    }
  };
  
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard 
            title="Total de Convites" 
            value={stats.total} 
            icon={<EmailIcon />} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard 
            title="Taxa de Conversão" 
            value={`${stats.conversionRate}%`} 
            icon={<ConversionIcon />} 
            highlight
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
        <StatsCard 
          title="Tempo Médio" 
          value={`${stats.avgResponseDays} dias`} 
          icon={<AccessTimeIcon />}
        />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard 
            title="Convites Aceitos" 
            value={stats.used} 
            icon={<SuccessIcon />} 
            color="success"
          />
        </Grid>
      </Grid>
      
      {/* Cabeçalho e controles */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography variant="h5" component="h2">
              Seus Convites
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={clearSearch}>
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ width: { xs: '100%', sm: 240 } }}
            />
            
            <Button 
              variant="outlined" 
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              size="small"
            >
              Filtros
            </Button>
            
            <Button 
              variant="outlined" 
              startIcon={<SortIcon />}
              onClick={toggleGroupBy}
              size="small"
            >
              Agrupar: {getGroupByLabel()}
            </Button>
            
            <Button 
              variant="outlined"
              onClick={toggleSelectMode}
              size="small"
            >
              {isSelectMode ? 'Cancelar' : 'Selecionar'}
            </Button>
            
          </Box>
        </Box>
        
        {/* Filtros avançados */}
        <Collapse in={showFilters}>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">Período:</Typography>
                  <TextField
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    label="Data inicial"
                  />
                  <Typography variant="body2">até</Typography>
                  <TextField
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    label="Data final"
                  />
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Button 
                  variant="contained" 
                  sx={{ float: 'right' }}
                  size="small"
                >
                  Aplicar filtros
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>
      
      {/* Ações em massa */}
      <Collapse in={isSelectMode && selectedIds.length > 0}>
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          action={
            <Stack direction="row" spacing={1}>
              <Button 
                size="small" 
                color="primary"
                onClick={() => handleBulkAction('resend')}
              >
                Reenviar
              </Button>
              <Button 
                size="small" 
                color="error"
                onClick={() => handleBulkAction('cancel')}
              >
                Cancelar
              </Button>
              <Button 
                size="small"
                onClick={() => setSelectedIds([])}
              >
                Limpar
              </Button>
            </Stack>
          }
        >
          <Typography variant="body2">
            {selectedIds.length} convites selecionados
          </Typography>
        </Alert>
      </Collapse>
      
      {/* Navegação por tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <StyledTab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Todos
                <TabBadge value={stats.total} />
              </Box>
            } 
          />
          <StyledTab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Pendentes
                <TabBadge value={stats.pending} color="warning" />
              </Box>
            } 
          />
          <StyledTab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Aceitos
                <TabBadge value={stats.used} color="success" />
              </Box>
            } 
          />
          <StyledTab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Expirados
                <TabBadge value={stats.expired} />
              </Box>
            } 
          />
          <StyledTab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Cancelados
                <TabBadge value={stats.canceled} color="error" />
              </Box>
            } 
          />
        </Tabs>
      </Paper>
      
      {/* Lista de convites agrupados */}
      <Box>
        {Object.keys(groupedInvitations).length === 0 ? (
          <EmptyState 
            type={searchTerm ? 'search' : currentTab} 
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          Object.entries(groupedInvitations).map(([groupName, invitations]) => (
            invitations.length > 0 && (
              <Box key={groupName} sx={{ mb: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    pb: 1, 
                    mb: 2, 
                    borderBottom: 1, 
                    borderColor: 'divider' 
                  }}
                >
                  {groupName} ({invitations.length})
                </Typography>
                
                <Grid container spacing={2}>
  {invitations.map(invitation => (
    <Grid item xs={12} sm={12} md={12} lg={6} key={invitation.id || invitation.inviteId}>
      <InvitationCard 
        invitation={invitation} 
        onResend={onResend}
        onCancel={onCancel}
        isSelectMode={isSelectMode}
        isSelected={selectedIds.includes(invitation.id)}
        onSelect={() => handleSelect(invitation.id)}
      />
    </Grid>
  ))}
</Grid>


              </Box>
            )
          ))
        )}
      </Box>
      
      {/* Modal para novos convites */}
      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Convidar Amigo
          <IconButton
            aria-label="close"
            onClick={() => setIsModalOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              label="Nome do Amigo"
              variant="outlined"
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Email do Amigo"
              variant="outlined"
              margin="normal"
              type="email"
            />
            
            <TextField
              fullWidth
              label="Mensagem Personalizada (opcional)"
              variant="outlined"
              margin="normal"
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button 
            variant="outlined" 
            onClick={() => setIsModalOpen(false)}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained"
            color="primary"
          >
            Enviar Convite
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};