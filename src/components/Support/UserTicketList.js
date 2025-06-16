import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Skeleton,
  Alert,
  Tooltip,
  Fab,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Assignment as TicketIcon
} from '@mui/icons-material';
import { useSupport } from '../../providers/SupportProvider';
import CreateTicketForm from './CreateTicketForm';
import { 
  TICKET_STATUS_CONFIG as TICKET_STATUS_LABELS, 
  PRIORITY_CONFIG as PRIORITY_LABELS, 
  CATEGORY_CONFIG as CATEGORY_LABELS,
  formatDate,
  formatRelativeTime
} from '../../core/constants/support';

const UserTicketList = () => {
  const { 
    fetchUserTickets, 
    isLoading, 
    error, 
    clearError,
    userTickets = []
  } = useSupport();

  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetailsOpen, setTicketDetailsOpen] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    setTickets(userTickets);
  }, [userTickets]);

  const loadTickets = async () => {
    try {
      clearError();
      await fetchUserTickets();
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
    }
  };

  const filteredTickets = useMemo(() => {
    let filtered = tickets;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ticket =>
        ticket.title?.toLowerCase().includes(query) ||
        ticket.id?.toLowerCase().includes(query) ||
        ticket.description?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.category === categoryFilter);
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [tickets, searchQuery, statusFilter, categoryFilter]);

  const handleTicketDetails = (ticket) => {
    setSelectedTicket(ticket);
    setTicketDetailsOpen(true);
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

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button onClick={loadTickets} size="small">
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
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h1">
            Meus Tickets de Suporte
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Atualizar">
              <IconButton onClick={loadTickets} disabled={isLoading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateTicketOpen(true)}
            >
              Novo Ticket
            </Button>
          </Box>
        </Box>

        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={4}>
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
        </Grid>

        {isLoading && tickets.length === 0 ? (
          <Box>
            {[...Array(3)].map((_, index) => (
              <Box key={index} mb={2}>
                <Skeleton variant="rectangular" height={80} />
              </Box>
            ))}
          </Box>
        ) : filteredTickets.length === 0 ? (
          <Box textAlign="center" py={4}>
            <TicketIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {tickets.length === 0 ? 'Nenhum ticket encontrado' : 'Nenhum ticket corresponde aos filtros'}
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {tickets.length === 0 
                ? 'Você ainda não criou nenhum ticket de suporte.'
                : 'Tente ajustar os filtros para encontrar seus tickets.'
              }
            </Typography>
            {tickets.length === 0 && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateTicketOpen(true)}
              >
                Criar Primeiro Ticket
              </Button>
            )}
          </Box>
        ) : (
          <List>
            {filteredTickets.map((ticket, index) => (
              <React.Fragment key={ticket.id}>
                <ListItem
                  sx={{
                    border: 1,
                    borderColor: 'grey.200',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'grey.50'
                    }
                  }}
                >
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="subtitle1" component="span" fontWeight="medium">
                        {ticket.title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        #{ticket.id}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {ticket.description?.substring(0, 150)}
                      {ticket.description?.length > 150 && '...'}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      {getStatusChip(ticket.status)}
                      {getPriorityChip(ticket.priority)}
                      {getCategoryChip(ticket.category)}
                      <Typography variant="caption" color="textSecondary">
                        Criado em {formatDate(ticket.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  <ListItemSecondaryAction>
                    <Tooltip title="Ver Detalhes">
                      <IconButton
                        edge="end"
                        onClick={() => handleTicketDetails(ticket)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < filteredTickets.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      <CreateTicketForm
        open={createTicketOpen}
        onClose={() => setCreateTicketOpen(false)}
      />

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
                    Criado em:
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedTicket.createdAt)}
                  </Typography>
                </Grid>
                {selectedTicket.updatedAt && selectedTicket.updatedAt !== selectedTicket.createdAt && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Última atualização:
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(selectedTicket.updatedAt)}
                    </Typography>
                  </Grid>
                )}
                {selectedTicket.assignedTo && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Atribuído para:
                    </Typography>
                    <Typography variant="body2">
                      {selectedTicket.assignedTo}
                    </Typography>
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

      <Fab
        color="primary"
        aria-label="criar ticket"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateTicketOpen(true)}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default UserTicketList;