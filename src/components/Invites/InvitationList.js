// InvitationList.jsx refatorado com Material UI
import React, { useState, useCallback, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid, 
  Paper,
  InputAdornment,
  Divider,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { useInvites } from '../../providers/InviteProvider';
import InvitationCard from './InvitationCard'; // Versão refatorada com MUI
import { useTranslation } from 'react-i18next';

const InvitationList = ({ onCancel, onResend }) => {
  const { t } = useTranslation();
  const { invitations, sentInvitations, loading, error } = useInvites();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [tabValue, setTabValue] = useState(0);

  // Mostrar o estado de carregamento
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Mostrar o estado de erro
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {typeof error === 'string' ? error : 'Ocorreu um erro ao carregar os convites.'}
      </Alert>
    );
  }

  // Manipuladores de eventos
  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleStatusFilterChange = useCallback((event) => {
    setStatusFilter(event.target.value);
  }, []);

  const handleSortOrderChange = useCallback((event) => {
    setSortOrder(event.target.value);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Mapear tabValue para status
  const currentStatus = tabValue === 0 
    ? 'all'
    : tabValue === 1 
      ? 'pending' 
      : tabValue === 2 
        ? 'used' 
        : tabValue === 3 
          ? 'expired' 
          : 'canceled';

  // Se não houver convites para exibir
  if (!Array.isArray(invitations) || invitations.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        {t('invitationList.noInvitations')}
      </Alert>
    );
  }

  // Filtrar e ordenar convites
  const filteredAndSortedInvitations = useMemo(() => {
    // Verificar se invitations existe e é um array
    if (!Array.isArray(invitations)) return [];
    
    return invitations
      .filter((invitation) => {
        // Filtro de status da tab
        if (currentStatus !== 'all' && invitation.status !== currentStatus) {
          return false;
        }

        // Filtro de texto de busca
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
            invitation.email?.toLowerCase().includes(searchLower) ||
            invitation.friendName?.toLowerCase().includes(searchLower) ||
            invitation.senderName?.toLowerCase().includes(searchLower)
          );
        }
        
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [invitations, searchTerm, currentStatus, sortOrder]);

  // Agrupar convites por status
  const groupedInvitations = useMemo(() => {
    const groups = {
      pending: [],
      used: [],
      canceled: [],
      expired: []
    };

    filteredAndSortedInvitations.forEach((invitation) => {
      if (invitation.status && groups[invitation.status]) {
        groups[invitation.status].push(invitation);
      }
    });

    return groups;
  }, [filteredAndSortedInvitations]);

  // Calcular contadores para as tabs
  const counts = useMemo(() => {
    return {
      all: invitations.length,
      pending: invitations.filter(inv => inv.status === 'pending').length,
      used: invitations.filter(inv => inv.status === 'used').length,
      expired: invitations.filter(inv => inv.status === 'expired').length,
      canceled: invitations.filter(inv => inv.status === 'canceled').length
    };
  }, [invitations]);

  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        {/* Barra de ferramentas com filtros */}
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label={t('invitationList.searchByEmail')}
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>{t('invitationList.sortBy')}</InputLabel>
                <Select
                  value={sortOrder}
                  onChange={handleSortOrderChange}
                  label={t('invitationList.sortBy')}
                  startAdornment={
                    <InputAdornment position="start">
                      <SortIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="desc">{t('invitationList.mostRecentFirst')}</MenuItem>
                  <MenuItem value="asc">{t('invitationList.oldestFirst')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="textSecondary">
                {filteredAndSortedInvitations.length} {t('invitationList.invitationsFound')}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        
        <Divider />
        
        {/* Tabs para filtragem por status */}
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            label={`${t('invitationList.all')} (${counts.all})`} 
          />
          <Tab 
            label={`${t('invitationList.pending')} (${counts.pending})`} 
          />
          <Tab 
            label={`${t('invitationList.used')} (${counts.used})`} 
          />
          <Tab 
            label={`${t('invitationList.expired')} (${counts.expired})`} 
          />
          <Tab 
            label={`${t('invitationList.canceled')} (${counts.canceled})`} 
          />
        </Tabs>
      </Paper>

      {/* Verifica se há convites para mostrar após a filtragem */}
      {filteredAndSortedInvitations.length === 0 ? (
        <Alert severity="info">
          {t('invitationList.noMatchingInvitations')}
        </Alert>
      ) : (
        // Se estiver mostrando todos, agrupar por status
        currentStatus === 'all' ? (
          Object.entries(groupedInvitations).map(([status, statusInvitations]) => (
            statusInvitations.length > 0 && (
              <Box key={status} sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t(`invitationList.${status}`)} ({statusInvitations.length})
                </Typography>
                
                <Grid container spacing={2}>
                  {statusInvitations.map((invitation) => (
                    <Grid item xs={12} sm={6} md={4} key={invitation.inviteId}>
                      <InvitationCard
                        invitation={invitation}
                        onCancel={onCancel}
                        onResend={onResend}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )
          ))
        ) : (
          // Senão, mostrar os convites do status atual
          <Grid container spacing={2}>
            {filteredAndSortedInvitations.map((invitation) => (
              <Grid item xs={12} sm={6} md={4} key={invitation.inviteId}>
                <InvitationCard
                  invitation={invitation}
                  onCancel={onCancel}
                  onResend={onResend}
                />
              </Grid>
            ))}
          </Grid>
        )
      )}
    </Box>
  );
};

export default React.memo(InvitationList);