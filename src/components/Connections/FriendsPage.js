// src/components/Connections/FriendsPage.jsx
import React, { useState, useCallback } from 'react';
import { Grid, Typography, Box, Select, MenuItem, IconButton, Button } from '@mui/material';
import { Sort as SortIcon } from '@mui/icons-material';
import { GiHealing } from "react-icons/gi";
import { useConnections } from '../../context/ConnectionContext';
import { showToast } from '../../utils/toastUtils';
import FriendCard from './FriendCard';
import FriendSearch from './FriendSearch';
import InvitationList from '../Invites/InvitationList';
import InvitationSendModal from '../Invites/InvitationSendModal';
import inviteService from '../../services/inviteService';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';

const FriendsPage = () => {
  const { t } = useTranslation();
  const { friends, bestFriends, invitations } = useConnections();
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('name');
  const [modalOpen, setModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleFilterChange = (event) => setFilter(event.target.value);
  const handleSortChange = (event) => setSort(event.target.value);

  const handleSearchResults = useCallback((results) => {
    setSearchResults(results);
    if (results?.length === 0) {
      showToast(t('friendsPage.noResults'), { type: 'info' });
    }
  }, [t]);

  const handleResendInvitation = async (inviteId, userId) => {
    console.log(inviteId)
    try {
      await inviteService.resendInvitation(inviteId, userId);
      console.log(`Convite ${inviteId} reenviado com sucesso pelo usuário ${userId}`);
    } catch (error) {
      console.error('Erro ao reenviar convite:', error.message);
    }
  };

  const handleCancelInvitation = async (inviteId) => {
    try {
      await inviteService.cancelInvitation(inviteId);
      console.log(`Convite ${inviteId} cancelado com sucesso`);
    } catch (error) {
      console.error('Erro ao cancelar convite:', error.message);
    }
  };


  // Deduplicar amigos combinando `friends` e `bestFriends`
  const uniqueFriends = useCallback(() => {
    const allFriends = [...friends, ...bestFriends];
    const seenIds = new Set();
    return allFriends.filter((friend) => {
      if (seenIds.has(friend.id)) {
        return false;
      }
      seenIds.add(friend.id);
      return true;
    });
  }, [friends, bestFriends]);

  const sortedFriends = uniqueFriends().sort((a, b) => {
    if (sort === 'name') {
      return a.nome.localeCompare(b.nome);
    } else if (sort === 'interests') {
      return a.interessesPessoais.length - b.interessesPessoais.length;
    }
    return 0;
  });

  const filteredFriends = sortedFriends.filter((friend) => {
    if (filter === 'all') return true;
    if (filter === 'active' && friends.includes(friend)) return true;
    if (filter === 'inactive' && bestFriends.includes(friend)) return true;
    return false;
  });

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  return (
    <>
      <Box p={3}>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          {t('friendsPage.instructions')}
        </Typography>

        <Typography variant="h4" component="h2" gutterBottom>
          {t('friendsPage.myFriends')}
        </Typography>

        {/* Search and Controls Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          {/* Search Component */}
          <Box sx={{ width: '100%', maxWidth: 600, mb: 3 }}>
            <FriendSearch onResults={handleSearchResults} />
          </Box>

          {/* Filters and Controls */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Select
              value={filter}
              onChange={handleFilterChange}
              displayEmpty
              size="small"
            >
              <MenuItem value="all">{t('friendsPage.all')}</MenuItem>
              <MenuItem value="active">{t('friendsPage.active')}</MenuItem>
              <MenuItem value="inactive">{t('friendsPage.inactive')}</MenuItem>
              <MenuItem value="invited">{t('friendsPage.invited')}</MenuItem>
            </Select>

            <Select
              value={sort}
              onChange={handleSortChange}
              displayEmpty
              size="small"
            >
              <MenuItem value="name">{t('friendsPage.name')}</MenuItem>
              <MenuItem value="interests">{t('friendsPage.interests')}</MenuItem>
            </Select>

            <IconButton size="small">
              <SortIcon />
            </IconButton>

            <Button
              variant="contained"
              startIcon={<GiHealing />}
              onClick={handleModalOpen}
            >
              {t('friendsPage.inviteFriend')}
            </Button>
          </Box>
        </Box>

        {/* Search Results Section */}
        {searchResults.length > 0 && (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              {t('friendsPage.searchResults')} ({searchResults.length})
            </Typography>
            <Grid container spacing={3}>
              {searchResults.map((user) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={user.id || uuidv4()}>
                  <FriendCard friends={user} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Friends List Section */}
        <Box mt={4}>
          <Grid container spacing={3}>
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={friend.id || uuidv4()}>
                  <FriendCard friends={friend} 
                        isFriend={friends.some(f => f.id === friend.id)}
                        isBestFriend={bestFriends.some(f => f.id === friend.id)}/>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="textSecondary">
                  {t('friendsPage.noFriendsFound')}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Invitations Section */}
        <Box mt={4}>
          <Typography variant="h5" component="h3" gutterBottom>
            {t('friendsPage.sentInvitations')}
          </Typography>
          <InvitationList
            invitations={invitations}
            onResend={handleResendInvitation}
            onCancel={handleCancelInvitation}
          />
        </Box>
      </Box>

      {/* Modal */}
      <InvitationSendModal open={modalOpen} handleClose={handleModalClose} />
    </>
  );
};

export default FriendsPage;