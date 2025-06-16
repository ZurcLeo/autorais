import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * @deprecated Este dashboard está sendo descontinuado em favor do EnhancedSupportDashboard.js
 * Use EnhancedSupportDashboard para novas implementações.
 * Este componente será removido em versões futuras.
 * 
 * Para migrar:
 * - Substitua <SupportDashboard /> por <EnhancedSupportDashboard />
 * - O Enhanced oferece melhor UX, responsividade e recursos avançados
 */
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge,
  Divider,
  Avatar
} from '@mui/material';
import {
  CheckCircle,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Assignment as AssignIcon,
  CheckCircle as ResolveIcon,
  Person as PersonIcon,
  Schedule as PendingIcon,
  Visibility as ViewIcon,
  Notes as NotesIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useSupport } from '../../providers/SupportProvider';
import { 
  TICKET_STATUS_CONFIG as TICKET_STATUS_LABELS, 
  PRIORITY_CONFIG as PRIORITY_LABELS, 
  CATEGORY_CONFIG as CATEGORY_LABELS,
  formatDate,
  formatRelativeTime,
  FILTER_OPTIONS
} from '../../core/constants/support';

const SupportDashboard = () => {
  const navigate = useNavigate();
  const supportContext = useSupport();
  const {
    fetchPendingTickets,
    fetchMyTickets,
    assignTicket,
    resolveTicket,
    addTicketNote,
    fetchSupportAnalytics,
    filterTickets,
    isLoading,
    isFetchingTickets,
    isAssigningTicket,
    isResolvingTicket,
    error,
    clearError,
    hasPermissions,
    pendingTickets = [],
    myTickets = []
  } = supportContext;


  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetailsOpen, setTicketDetailsOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  
  const [analytics, setAnalytics] = useState(null);

  // Calcular métricas localmente baseado nos tickets disponíveis
  const calculatedMetrics = useMemo(() => {
    const allTickets = [...pendingTickets, ...myTickets];
    
    const metrics = {
      totalTickets: allTickets.length,
      pendingTickets: pendingTickets.filter(t => t.status === 'pending').length,
      assignedTickets: allTickets.filter(t => t.status === 'assigned').length,
      resolvedTickets: allTickets.filter(t => t.status === 'resolved').length
    };
    
    return metrics;
  }, [pendingTickets, myTickets]);

  useEffect(() => {
    if (hasPermissions) {
      loadData();
    }
  }, [hasPermissions]);

  const loadData = async () => {
    try {
      clearError();
      
      await Promise.all([
        fetchPendingTickets(),
        fetchMyTickets(),
        loadAnalytics()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados do suporte:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData = await fetchSupportAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    }
  };

  const currentTickets = useMemo(() => {
    const sourceTickets = tabValue === 0 ? pendingTickets : myTickets;
    
    const filtered = filterTickets(sourceTickets, {
      searchQuery,
      status: statusFilter,
      category: categoryFilter,
      priority: priorityFilter
    });

    return filtered.sort((a, b) => {
      // Priority-based sorting
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [pendingTickets, myTickets, tabValue, searchQuery, statusFilter, categoryFilter, priorityFilter, filterTickets]);

  const handleAssignTicket = async (ticket) => {
    try {
      await assignTicket(ticket.id);
      setTabValue(1); // Switch to "My Tickets" tab
    } catch (error) {
      console.error('Erro ao atribuir ticket:', error);
    }
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket) return;

    try {
      await resolveTicket(selectedTicket.id, resolutionNotes);
      setResolveDialogOpen(false);
      setResolutionNotes('');
      setSelectedTicket(null);
    } catch (error) {
      console.error('Erro ao resolver ticket:', error);
    }
  };

  const handleAddNote = async () => {
    if (!selectedTicket || !noteText.trim()) return;

    try {
      await addTicketNote(selectedTicket.id, noteText.trim());
      setNoteDialogOpen(false);
      setNoteText('');
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusChip = (status) => {
    const statusInfo = TICKET_STATUS_LABELS[status] || { label: status, color: 'default' };
    return (
      <Chip
        label={statusInfo.label}
        color={statusInfo.color}
        size="small"
        variant="outlined"
      />
    );
  };

  const getPriorityChip = (priority) => {
    const priorityInfo = PRIORITY_LABELS[priority] || { label: priority, color: 'default' };
    return (
      <Chip
        label={priorityInfo.label}
        color={priorityInfo.color}
        size="small"
      />
    );
  };

  const getCategoryChip = (category) => {
    const categoryInfo = CATEGORY_LABELS[category] || { label: category, icon: '📋' };
    return (
      <Chip
        label={categoryInfo.label}
        icon={<span>{categoryInfo.icon}</span>}
        size="small"
        variant="outlined"
      />
    );
  };

  const getTicketAge = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffHours = Math.floor((now - created) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Há poucos minutos';
    if (diffHours < 24) return `${diffHours}h atrás`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d atrás`;
  };

  if (!hasPermissions) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="warning">
          Você não tem permissões para acessar o dashboard de suporte.
        </Alert>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button onClick={loadData} size="small">
            Tentar Novamente
          </Button>
        }>
          {error}
        </Alert>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Analytics Cards */}
      {(analytics || calculatedMetrics.totalTickets > 0) && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total de Tickets
                    </Typography>
                    <Typography variant="h4">
                      {analytics?.totalTickets || calculatedMetrics.totalTickets || 0}
                    </Typography>
                  </Box>
                  <TrendingIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Pendentes
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {analytics?.pendingTickets || calculatedMetrics.pendingTickets || 0}
                    </Typography>
                  </Box>
                  <Badge badgeContent={analytics?.pendingTickets || calculatedMetrics.pendingTickets || 0} color="warning">
                    <PendingIcon />
                  </Badge>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Em Atendimento
                    </Typography>
                    <Typography variant="h4" color="info.main">
                      {analytics?.assignedTickets || calculatedMetrics.assignedTickets || 0}
                    </Typography>
                  </Box>
                  <PersonIcon color="info" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Resolvidos
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {analytics?.resolvedTickets || calculatedMetrics.resolvedTickets || 0}
                    </Typography>
                  </Box>
                  <CheckCircle color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h1">
            Dashboard de Suporte
          </Typography>
          <Tooltip title="Atualizar">
            <IconButton onClick={loadData} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab 
            label={
              <Badge badgeContent={pendingTickets.length} color="warning">
                Tickets Pendentes
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={myTickets.length} color="info">
                Meus Tickets
              </Badge>
            } 
          />
        </Tabs>

        {/* Filters */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Buscar tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">Todos</MenuItem>
                {Object.entries(TICKET_STATUS_LABELS).map(([key, { label }]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Categoria</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Categoria"
              >
                <MenuItem value="all">Todas</MenuItem>
                {Object.entries(CATEGORY_LABELS).map(([key, { label, icon }]) => (
                  <MenuItem key={key} value={key}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <span>{icon}</span>
                      <span>{label}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Prioridade</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                label="Prioridade"
              >
                <MenuItem value="all">Todas</MenuItem>
                {Object.entries(PRIORITY_LABELS).map(([key, { label }]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Tickets List */}
        {isFetchingTickets && currentTickets.length === 0 ? (
          <Box>
            {[...Array(5)].map((_, index) => (
              <Box key={index} mb={2}>
                <Skeleton variant="rectangular" height={100} />
              </Box>
            ))}
          </Box>
        ) : currentTickets.length === 0 ? (
          <Box textAlign="center" py={4}>
            <AssignIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Nenhum ticket encontrado
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {tabValue === 0 
                ? 'Não há tickets pendentes no momento.'
                : 'Você não tem tickets atribuídos.'
              }
            </Typography>
          </Box>
        ) : (
          <List>
            {currentTickets.map((ticket, index) => (
              <React.Fragment key={ticket.id}>
                <ListItem
                  button
                  onClick={() => {
                    navigate(`/support/ticket/${ticket.id}`);
                  }}
                  sx={{
                    border: 1,
                    borderColor: ticket.priority === 'urgent' ? 'error.main' : 'grey.200',
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: ticket.priority === 'urgent' ? 'error.50' : 'transparent',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: ticket.priority === 'urgent' ? 'error.100' : 'grey.50',
                      transform: 'translateY(-1px)',
                      boxShadow: 2
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" mr={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      {ticket.userName?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                  </Box>
                  
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="subtitle1" component="span" fontWeight="medium">
                        {ticket.title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        #{ticket.id}
                      </Typography>
                      {ticket.priority === 'urgent' && (
                        <WarningIcon color="error" fontSize="small" />
                      )}
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      <strong>Usuário:</strong> {ticket.userName || 'Usuário Anônimo'}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {ticket.description?.substring(0, 120)}
                      {ticket.description?.length > 120 && '...'}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      {getStatusChip(ticket.status)}
                      {getPriorityChip(ticket.priority)}
                      {getCategoryChip(ticket.category)}
                      <Chip 
                        label={getTicketAge(ticket.createdAt)}
                        size="small"
                        variant="outlined"
                        color="default"
                      />
                    </Box>
                  </Box>
                  
                  <ListItemSecondaryAction>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Ver Detalhes">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/support/ticket/${ticket.id}`);
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Adicionar Nota">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicket(ticket);
                            setNoteDialogOpen(true);
                          }}
                        >
                          <NotesIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {tabValue === 0 && ticket.status === 'pending' && (
                        <Tooltip title="Atribuir para Mim">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignTicket(ticket);
                            }}
                            disabled={isAssigningTicket}
                            color="primary"
                          >
                            <AssignIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {tabValue === 1 && ticket.status === 'assigned' && (
                        <Tooltip title="Resolver Ticket">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTicket(ticket);
                              setResolveDialogOpen(true);
                            }}
                            disabled={isResolvingTicket}
                            color="success"
                          >
                            <ResolveIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < currentTickets.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Ticket Details Dialog */}
      <Dialog
        open={ticketDetailsOpen}
        onClose={() => setTicketDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTicket && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h6">
                  Detalhes do Ticket
                </Typography>
                <Chip 
                  label={`#${selectedTicket.id}`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {selectedTicket.title}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" gap={1} mb={2}>
                    {getStatusChip(selectedTicket.status)}
                    {getPriorityChip(selectedTicket.priority)}
                    {getCategoryChip(selectedTicket.category)}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1" paragraph>
                    {selectedTicket.description}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Usuário:
                  </Typography>
                  <Typography variant="body2">
                    {selectedTicket.userName || 'Usuário Anônimo'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Criado em:
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedTicket.createdAt)}
                  </Typography>
                </Grid>
                {selectedTicket.assignedTo && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Atribuído para:
                    </Typography>
                    <Typography variant="body2">
                      {selectedTicket.assignedTo}
                    </Typography>
                  </Grid>
                )}
                {selectedTicket.context && Object.keys(selectedTicket.context).length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Contexto:
                    </Typography>
                    <Box sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <pre style={{ fontSize: '0.75rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(selectedTicket.context, null, 2)}
                      </pre>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setTicketDetailsOpen(false)}>
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Resolve Ticket Dialog */}
      <Dialog
        open={resolveDialogOpen}
        onClose={() => setResolveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Resolver Ticket</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notas de Resolução"
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Descreva como o problema foi resolvido..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleResolveTicket}
            variant="contained"
            color="success"
            disabled={isResolvingTicket}
          >
            {isResolvingTicket ? 'Resolvendo...' : 'Resolver Ticket'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Adicionar Nota</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Nota"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Adicione uma nota sobre este ticket..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAddNote}
            variant="contained"
            disabled={!noteText.trim()}
          >
            Adicionar Nota
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupportDashboard;