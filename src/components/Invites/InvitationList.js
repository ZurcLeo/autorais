import React, { useState, useCallback, useMemo } from 'react';
import { Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Grid } from '@mui/material';
import InvitationCard from './InvitationCard';
import { useTranslation } from 'react-i18next';  // Importando o hook de tradução

const InvitationList = ({ invitations, onCancel, onResend }) => {
  const { t } = useTranslation(); // Função para acessar as traduções
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleStatusFilterChange = useCallback((event) => {
    setStatusFilter(event.target.value);
  }, []);

  const handleSortOrderChange = useCallback((event) => {
    setSortOrder(event.target.value);
  }, []);

  const filteredAndSortedInvitations = useMemo(() => {
    return invitations
      .filter((invitation) => {
        const matchesSearch = invitation.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [invitations, searchTerm, statusFilter, sortOrder]);

  const groupedInvitations = useMemo(() => {
    const groups = {
      pending: [],
      used: [],
      canceled: [],
      expired: []
    };

    filteredAndSortedInvitations.forEach((invitation) => {
      groups[invitation.status].push(invitation);
    });

    return groups;
  }, [filteredAndSortedInvitations]);

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label={t('invitationList.searchByEmail')}  // Tradução da label "Buscar por email"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>{t('invitationList.status')}</InputLabel> {/* Tradução da label "Status" */}
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label={t('invitationList.status')}
            >
              <MenuItem value="all">{t('invitationList.all')}</MenuItem>  {/* Tradução para "Todos" */}
              <MenuItem value="pending">{t('invitationList.pending')}</MenuItem>  {/* Tradução para "Pendentes" */}
              <MenuItem value="used">{t('invitationList.used')}</MenuItem>  {/* Tradução para "Aceitos" */}
              <MenuItem value="canceled">{t('invitationList.canceled')}</MenuItem>  {/* Tradução para "Cancelados" */}
              <MenuItem value="expired">{t('invitationList.expired')}</MenuItem>  {/* Tradução para "Expirados" */}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>{t('invitationList.sortBy')}</InputLabel> {/* Tradução da label "Ordenar por" */}
            <Select
              value={sortOrder}
              onChange={handleSortOrderChange}
              label={t('invitationList.sortBy')}
            >
              <MenuItem value="desc">{t('invitationList.mostRecentFirst')}</MenuItem> {/* Tradução para "Mais recentes primeiro" */}
              <MenuItem value="asc">{t('invitationList.oldestFirst')}</MenuItem> {/* Tradução para "Mais antigos primeiro" */}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {Object.entries(groupedInvitations).map(([status, invitations]) => (
        invitations.length > 0 && (
          <Box key={status} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t(status)} {/* Tradução do status (pendente, usado, cancelado, expirado) */}
            </Typography>
            {invitations.map((invitation) => (
              <InvitationCard
                key={invitation.inviteId}
                invitation={invitation}
                onCancel={onCancel}
                onResend={onResend}
              />
            ))}
          </Box>
        )
      ))}
    </Box>
  );
};

export default React.memo(InvitationList);