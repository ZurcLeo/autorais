// src/components/Connections/FriendsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, 
  Typography, 
  Box, 
  Select, 
  MenuItem, 
  IconButton, 
  Button, 
  Divider,
  Paper,
  Alert
} from '@mui/material';
import { Sort as SortIcon } from '@mui/icons-material';
import { GiHealing } from "react-icons/gi";
import { useConnections } from '../../providers/ConnectionProvider';
import { useToast } from '../../providers/ToastProvider';
import FriendCard from './FriendCard';
import FriendSearch from './FriendSearch';
import { InvitationDashboard } from '../Invites/InvitationDashboard';
import InvitationSendModal from '../Invites/InvitationSendModal';
import ConnectionRequest from './ConnectionRequest';
import { useInvites } from '../../providers/InviteProvider';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { serviceLocator } from '../../core/services/BaseService';

const FriendsPage = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  
  // Obter dados do estado global via serviceLocator
  const connectionsStore = serviceLocator.get('store').getState()?.connections || {};
  const invitesStore = serviceLocator.get('store').getState()?.invites || {};

  console.log('connectionsStore state:', connectionsStore)
  console.log('connectionsStore state:', invitesStore)
  // Obter as ações dos providers
 const { friends, 
  bestFriends } = connectionsStore;

  const { 
    smartSearchUsers, 
    addBestFriend, 
    removeBestFriend, 
    createConnectionRequest,
    deleteConnection,
    getPendingRequests,
    getPendingRequestsAsSender,
    acceptConnectionRequest,
    rejectConnectionRequest,
    blockUser,
    refreshConnections
  } = useConnections();

  const {
    invitations: pendingInvitations,
    sendInvitation,
    resendInvitation, 
    cancelInvitation,
    checkingInvite
  } = useInvites();
  
  const [connectionRequests, setConnectionRequests] = useState({
    sent: {},     // Map de solicitações enviadas por friendId
    received: {}  // Map de solicitações recebidas por friendId
  });

  // Estados locais
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('name');
  const [modalOpen, setModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  // Calcular convites recebidos apenas uma vez, evitando re-renders
  // const receivedInvitations = Array.isArray(invitesStore.receivedInvitations) 
  //   ? invitesStore.receivedInvitations 
  //   : [];
    
  const sentInvitations = invitesStore.invitations || {}

  // Controladores para UI
  const handleFilterChange = (event) => setFilter(event.target.value);
  const handleSortChange = (event) => setSort(event.target.value);
  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  // Tratamento de resultados de busca
  const handleSearchResults = useCallback((results) => {
    setSearchResults(results);
    if (results?.length === 0) {
      showToast(t('friendsPage.noResults'), { type: 'info' });
    }
  }, [t, showToast]);

  // Handlers para gerenciamento de convites
  const handleResendInvitation = async (inviteId) => {
    try {
      await resendInvitation(inviteId);
      showToast(t('friendsPage.inviteResent'), { type: 'success' });
    } catch (error) {
      console.error('Erro ao reenviar convite:', error.message);
      showToast(t('friendsPage.inviteResendError'), { type: 'error' });
    }
  };

  const handleCancelInvitation = async (inviteId) => {
    try {
      await cancelInvitation(inviteId);
      showToast(t('friendsPage.inviteCancelled'), { type: 'success' });
    } catch (error) {
      console.error('Erro ao cancelar convite:', error.message);
      showToast(t('friendsPage.inviteCancelError'), { type: 'error' });
    }
  };
  
  const handleAddFriend = async (friendId) => {
    try {
      await createConnectionRequest(friendId);
      showToast(t('friendsPage.requestSent'), { type: 'success' });
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error.message);
      showToast(t('friendsPage.requestError'), { type: 'error' });
    }
  };

  useEffect(() => {
    const loadPendingRequests = async () => {
      try {
        // Obter solicitações enviadas e recebidas
        const sentRequests = await getPendingRequestsAsSender();
        const receivedRequests = await getPendingRequests();
        
        // Transformar arrays em maps para fácil consulta
        const sentMap = sentRequests.reduce((acc, request) => {
          acc[request.friendId] = request;
          return acc;
        }, {});
        
        const receivedMap = receivedRequests.reduce((acc, request) => {
          acc[request.userId] = request;
          return acc;
        }, {});
        
        setConnectionRequests({
          sent: sentMap,
          received: receivedMap
        });
      } catch (error) {
        console.error('Erro ao carregar solicitações pendentes:', error);
      }
    };
    
    if (friends) {  // Carregar apenas se o usuário estiver autenticado
      loadPendingRequests();
    }
  }, [friends]);  

  // Função para aceitar uma solicitação de amizade
const handleAcceptRequest = async (requestId) => {
  try {
    await acceptConnectionRequest(requestId);
    
    // Encontrar a que friendId pertence este requestId
    const friendId = Object.keys(connectionRequests.received).find(
      key => connectionRequests.received[key].id === requestId
    );
    
    if (friendId) {
      // Remover da lista de solicitações
      setConnectionRequests(prev => {
        const { [friendId]: removed, ...rest } = prev.received;
        return {
          ...prev,
          received: rest
        };
      });
      
      // Atualizar a lista de amigos (ou esperar o próximo refresh)
      await refreshConnections();
    }
    
    showToast(t('friendsPage.requestAccepted'), { type: 'success' });
  } catch (error) {
    console.error('Erro ao aceitar solicitação:', error.message);
    showToast(t('friendsPage.acceptError'), { type: 'error' });
  }
};

  const handleDeleteConnection = async (friendId) => {
    try {
      await deleteConnection(friendId);
      showToast(t('friendsPage.connectionRemoved'), { type: 'success' });
    } catch (error) {
      console.error('Erro ao remover conexão:', error.message);
      showToast(t('friendsPage.removeError'), { type: 'error' });
    }
  };
  
  const handleToggleBestFriend = async (friendId, isBestFriend) => {
    try {
      if (isBestFriend) {
        await removeBestFriend(friendId);
        showToast(t('friendsPage.bestFriendRemoved'), { type: 'info' });
      } else {
        await addBestFriend(friendId);
        showToast(t('friendsPage.bestFriendAdded'), { type: 'success' });
      }
    } catch (error) {
      console.error('Erro ao gerenciar melhor amigo:', error.message);
      showToast(t('friendsPage.bestFriendError'), { type: 'error' });
    }
  };

  // Deduplicar amigos combinando `friends` e `bestFriends`
  const uniqueFriends = useCallback(() => {
    const allFriends = [...(friends || []), ...(bestFriends || [])];
    const seenIds = new Set();
    return allFriends.filter((friend) => {
      if (!friend?.id || seenIds.has(friend.id)) {
        return false;
      }
      seenIds.add(friend.id);
      return true;
    });
  }, [friends, bestFriends]);

// Ordenar amigos conforme o critério selecionado
const sortedFriends = uniqueFriends().sort((a, b) => {
  if (sort === 'name') {
    return (a.nome || '').localeCompare(b.nome || '');
  } else if (sort === 'interests') {
    // Função para contar o total de interesses em todas as categorias
    const countTotalInterests = (friend) => {
      if (!friend.interesses) return 0;
      
      // Contar interesses em todas as categorias
      return Object.values(friend.interesses).reduce((total, category) => {
        // Se a categoria for um array, adicionar seu tamanho ao total
        if (Array.isArray(category)) {
          return total + category.length;
        }
        return total;
      }, 0);
    };
    
    const aInterestsCount = countTotalInterests(a);
    const bInterestsCount = countTotalInterests(b);
    
    // Ordenar por número total de interesses (decrescente)
    return bInterestsCount - aInterestsCount;
  }
  return 0;
});

  // Filtrar amigos conforme o filtro selecionado
  const filteredFriends = sortedFriends.filter((friend) => {
    if (filter === 'all') return true;
    if (filter === 'active' && friends?.some(f => f.id === friend.id)) return true;
    if (filter === 'bestFriends' && bestFriends?.some(f => f.id === friend.id)) return true;
    return false;
  });

  // Verificar se existem dados a serem exibidos
  const hasFriends = filteredFriends.length > 0;
  // const hasReceivedInvitations = receivedInvitations.length > 0;
  const hasSentInvitations = sentInvitations.length > 0;
  const isLoading = connectionsStore.loading || invitesStore.isLoading || checkingInvite;

  console.log('friends array:', friends);
  console.log('bestFriends array:', bestFriends);
  console.log('filteredFriends:', filteredFriends);

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('friendsPage.title')}
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        {t('friendsPage.instructions')}
      </Typography>
      
      {/* Seção de Solicitações de Amizade Pendentes */}
      {/* <Paper sx={{ p: 2, mb: 4 }} elevation={2}>
        <Typography variant="h5" component="h2" gutterBottom>
          {t('friendsPage.pendingRequests')}
        </Typography>
        
        {hasReceivedInvitations ? (
          <ConnectionRequest invitations={receivedInvitations} />
        ) : (
          <Typography variant="body2" color="textSecondary">
            {t('friendsPage.noPendingRequests')}
          </Typography>
        )}
      </Paper> */}
      
      {/* Seção de Busca e Controles */}
      <Paper sx={{ p: 2, mb: 4 }} elevation={2}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          {/* Componente de Busca */}
          <Box sx={{ width: '100%', maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              {t('friendsPage.findFriends')}
            </Typography>
            <FriendSearch onResults={handleSearchResults} />
          </Box>

          {/* Filtros e Controles */}
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
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">{t('friendsPage.all')}</MenuItem>
              <MenuItem value="active">{t('friendsPage.active')}</MenuItem>
              <MenuItem value="bestFriends">{t('friendsPage.bestFriends')}</MenuItem>
            </Select>

            <Select
              value={sort}
              onChange={handleSortChange}
              displayEmpty
              size="small"
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="name">{t('friendsPage.name')}</MenuItem>
              <MenuItem value="interests">{t('friendsPage.interests')}</MenuItem>
            </Select>

            <IconButton size="small" title={t('friendsPage.sortDirection')}>
              <SortIcon />
            </IconButton>

            <Button
              variant="contained"
              color="primary"
              startIcon={<GiHealing />}
              onClick={handleModalOpen}
            >
              {t('friendsPage.inviteFriend')}
            </Button>
          </Box>
        </Box>
        
        {/* Resultados da Busca */}
        {searchResults.length > 0 && (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              {t('friendsPage.searchResults')} ({searchResults.length})
            </Typography>
            <Grid container spacing={3}>
              {searchResults.map((user) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={user.id || uuidv4()}>
                  <FriendCard 
                    friends={user}
                    isFriend={friends?.some(f => f.id === user.id)}
                    isBestFriend={bestFriends?.some(f => f.id === user.id)}
                    onAddFriend={() => handleAddFriend(user.id)}
                    onToggleBestFriend={(isBF) => handleToggleBestFriend(user.id, isBF)}
                    onDelete={() => handleDeleteConnection(user.id)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>
      
      {/* Lista de Amigos */}
      <Paper sx={{ p: 2, mb: 4 }} elevation={2}>
        <Typography variant="h5" component="h2" gutterBottom>
          {t('friendsPage.myFriends')}
        </Typography>
        <ConnectionRequest 
  connections={Object.values(connectionRequests.received)}
  onConnectionUpdate={async (data) => {
    // Recarregar conexões após aceitar/rejeitar solicitação
    if (data.success) {
      await refreshConnections();
    }
  }}
/>
        {isLoading ? (
          <Typography variant="body2">{t('common.loading')}</Typography>
        ) : hasFriends ? (
          <Grid container spacing={3}>
            {filteredFriends.map((friend) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={friend.id || uuidv4()}>
                <FriendCard 
                  friends={friend}
                  isFriend={friends?.some(f => f.id === friend.id)}
                  isBestFriend={bestFriends?.some(f => f.id === friend.id)}
                  onToggleBestFriend={(isBF) => handleToggleBestFriend(friend.id, isBF)}
                  onDelete={() => handleDeleteConnection(friend.id)}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info" sx={{ backgroundColor: 'lightblue', color: 'darkblue' }}>

              {t('friendsPage.noFriendsFound')}
          </Alert>
        )}
      </Paper>

      {/* Seção de Convites Enviados */}
      <Paper sx={{ p: 2 }} elevation={2}>
        <Typography variant="h5" component="h2" gutterBottom>
          {t('friendsPage.sentInvitations')}
        </Typography>
        
        {hasSentInvitations ? (
          <InvitationDashboard 
            invitationsData={sentInvitations}
            onResend={handleResendInvitation}
            onCancel={handleCancelInvitation}
          />
        ) : (
          <Typography variant="body2" color="textSecondary">
            {t('friendsPage.noSentInvitations')}
          </Typography>
        )}
      </Paper>

      {/* Modal de Envio de Convite */}
      <InvitationSendModal 
        open={modalOpen} 
        handleClose={handleModalClose} 
        onSend={sendInvitation}
      />
    </Box>
  );
};

export default FriendsPage;