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
  Paper,
  Alert,
  Stack,
  Tabs,
  Tooltip,
  Tab,
  Badge
} from '@mui/material';
import { 
  Sort as SortIcon,
  FilterList as FilterIcon,
  People as PeopleIcon,
  Star as StarIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { GiHealing } from "react-icons/gi";
import { useConnections } from '../../providers/ConnectionProvider';
import { useToast } from '../../providers/ToastProvider';
import FriendCard from './FriendCard';
import FriendSearch from './FriendSearch';
import InvitationSendModal from '../Invites/InvitationSendModal';
import ConnectionRequest from './ConnectionRequest';
import { useInvites } from '../../providers/InviteProvider';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { serviceLocator } from '../../core/services/BaseService';

/**
 * Página de gerenciamento de amigos e conexões
 * Implementando o novo design com sistema de temas simplificado
 */
const FriendsPage = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  
  // Obter dados do estado global via serviceLocator
  const connectionsStore = serviceLocator.get('store').getState()?.connections || {};
  const invitesStore = serviceLocator.get('store').getState()?.invites || {};

  // Obter dados dos providers
  const { friends, bestFriends } = connectionsStore;
  const { 
    createConnectionRequest,
    deleteConnection,
    addBestFriend, 
    removeBestFriend, 
    getPendingRequests,
    getPendingRequestsAsSender,
    refreshConnections
  } = useConnections();

  const {
    invitations: pendingInvitations,
    sendInvitation,
    resendInvitation, 
    cancelInvitation,
    checkingInvite
  } = useInvites();

  // Estados locais
  const [tabValue, setTabValue] = useState(0);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState({
    sent: {},     // Map de solicitações enviadas por friendId
    received: {}  // Map de solicitações recebidas por friendId
  });
  console.log('FriendCard e friendpage: ', friends)

  // Preparar dados
  const sentInvitations = invitesStore.invitations || [];
  const isLoading = connectionsStore.loading || invitesStore.isLoading || checkingInvite;

  // Controladores para UI
  const handleTabChange = (event, newValue) => setTabValue(newValue);
  const handleFilterChange = (event) => setFilter(event.target.value);
  const handleSortChange = (event) => setSort(event.target.value);
  const handleToggleSortDirection = () => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  // Carregar solicitações pendentes
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
    
    if (friends) {
      loadPendingRequests();
    }
  }, [friends, getPendingRequests, getPendingRequestsAsSender]);  

  // Tratamento de resultados de busca
  const handleSearchResults = useCallback((results) => {
    setSearchResults(results);
    if (results?.length === 0) {
      showToast(t('friendsPage.noResults'), { type: 'info' });
    }
  }, [t, showToast]);

  // Manipulação de solicitações e convites
  const handleAddFriend = async (friendId) => {
    try {
      await createConnectionRequest(friendId);
      showToast(t('friendsPage.requestSent'), { type: 'success' });
      
      // Atualizar o estado local para refletir a solicitação enviada
      setConnectionRequests(prev => ({
        ...prev,
        sent: {
          ...prev.sent,
          [friendId]: { friendId, status: 'pending' }
        }
      }));
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error.message);
      showToast(t('friendsPage.requestError'), { type: 'error' });
      throw error;
    }
  };

  const handleResendInvitation = async (inviteId) => {
    try {
      await resendInvitation(inviteId);
      showToast(t('friendsPage.inviteResent'), { type: 'success' });
      return true;
    } catch (error) {
      console.error('Erro ao reenviar convite:', error.message);
      showToast(t('friendsPage.inviteResendError'), { type: 'error' });
      throw error;
    }
  };

  const handleCancelInvitation = async (inviteId) => {
    try {
      await cancelInvitation(inviteId);
      showToast(t('friendsPage.inviteCancelled'), { type: 'success' });
      return true;
    } catch (error) {
      console.error('Erro ao cancelar convite:', error.message);
      showToast(t('friendsPage.inviteCancelError'), { type: 'error' });
      throw error;
    }
  };

  const handleDeleteConnection = async (friendId) => {
    try {
      await deleteConnection(friendId);
      showToast(t('friendsPage.connectionRemoved'), { type: 'success' });
      return true;
    } catch (error) {
      console.error('Erro ao remover conexão:', error.message);
      showToast(t('friendsPage.removeError'), { type: 'error' });
      throw error;
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
      return true;
    } catch (error) {
      console.error('Erro ao gerenciar melhor amigo:', error.message);
      showToast(t('friendsPage.bestFriendError'), { type: 'error' });
      throw error;
    }
  };

  // Função para atualizar interface após ações em solicitações
  const handleConnectionUpdate = async (data) => {
    if (data.success) {
      await refreshConnections();
      
      // Se for aceite ou rejeição, remover da lista de solicitações recebidas
      if (data.type === 'accept' || data.type === 'reject') {
        const userId = data.connection.solicitanteId || data.connection.senderId;
        
        setConnectionRequests(prev => {
          const { [userId]: removed, ...rest } = prev.received;
          return {
            ...prev,
            received: rest
          };
        });
      }
    }
  };

  // Deduplicar e unir amigos normais e melhores amigos
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


  // Filtrar amigos conforme o filtro e tab selecionados
  const getFilteredFriends = () => {
    // Primeiro aplicar filtro de tab
    let tabFiltered = [];
    if (tabValue === 0) {
      // Todos os amigos
      tabFiltered = uniqueFriends();
    } else if (tabValue === 1) {
      // Só melhores amigos
      tabFiltered = bestFriends || [];
    }
    
    // Depois aplicar filtro adicional
    return tabFiltered.filter((friend) => {
      if (filter === 'all') return true;
      if (filter === 'active' && friends?.some(f => f.id === friend.id)) return true;
      if (filter === 'bestFriends' && bestFriends?.some(f => f.id === friend.id)) return true;
      return false;
    });
  };

  // Ordenar amigos conforme o critério selecionado
  const getSortedFriends = () => {
    const filtered = getFilteredFriends();
    
    return [...filtered].sort((a, b) => {
      let result = 0;
      
      if (sort === 'name') {
        result = (a.nome || '').localeCompare(b.nome || '');
      } else if (sort === 'interests') {
        // Função para contar total de interesses
        const countInterests = (friend) => {
          if (!friend.interesses) return 0;
          
          return Object.values(friend.interesses).reduce((total, category) => {
            if (Array.isArray(category)) {
              return total + category.length;
            }
            return total;
          }, 0);
        };
        
        result = countInterests(b) - countInterests(a);
      }
      
      // Aplicar direção de ordenação
      return sortDirection === 'asc' ? result : -result;
    });
  };

  // Listas processadas para renderização
  const displayFriends = getSortedFriends();
  const receivedRequests = Object.values(connectionRequests.received);
  const requestsCount = receivedRequests.length;
  
  // Verificações para estados vazios
  const hasFriends = displayFriends.length > 0;
  const hasSentInvitations = sentInvitations.length > 0;
  const hasSearchResults = searchResults.length > 0;

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        {t('friendsPage.title')}
      </Typography>
      
      {/* Abas principais */}
      <Paper sx={{ mb: 3 }} elevation={1}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={t('friendsPage.allFriends')} 
            icon={<PeopleIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={t('friendsPage.bestFriends')} 
            icon={<StarIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={
              <Badge badgeContent={requestsCount} color="primary" max={99}>
                {t('friendsPage.requests')}
              </Badge>
            }
          />
        </Tabs>
      </Paper>
      
      {/* Seção de busca e controles - sempre visível */}
      <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={2} 
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          {/* Busca */}
          <Box sx={{ width: '100%', maxWidth: { md: '60%' } }}>
            <Typography variant="h6" gutterBottom>
              {t('friendsPage.findFriends')}
            </Typography>
            <FriendSearch onResults={handleSearchResults} />
          </Box>
          
          {/* Filtros */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            alignItems="center"
            mt={{ xs: 2, md: 0 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Select
                value={filter}
                onChange={handleFilterChange}
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
                size="small"
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="name">{t('friendsPage.name')}</MenuItem>
                <MenuItem value="interests">{t('friendsPage.interests')}</MenuItem>
              </Select>
              
              <Tooltip title={t('friendsPage.toggleSortDirection')}>
                <IconButton 
                  size="small" 
                  onClick={handleToggleSortDirection}
                  color={sortDirection === 'asc' ? 'primary' : 'secondary'}
                >
                  <SortIcon />
                </IconButton>
              </Tooltip>
            </Stack>
            
            <Button
              variant="contained"
              startIcon={<GiHealing />}
              onClick={handleModalOpen}
            >
              {t('friendsPage.inviteFriend')}
            </Button>
          </Stack>
        </Stack>
        
        {/* Resultados da busca */}
        {hasSearchResults && (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              {t('friendsPage.searchResults')} ({searchResults.length})
            </Typography>
            <Grid container spacing={3}>
              {searchResults.map((user) => {
                const isFriend = friends?.some(f => f.id === user.id);
                const isBestFriend = bestFriends?.some(f => f.id === user.id);
                const hasPendingRequest = connectionRequests.sent[user.id];
                
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={user.id || uuidv4()}>
                    <FriendCard 
                      friends={user}
                      isFriend={isFriend}
                      isBestFriend={isBestFriend}
                      hasPendingRequest={!!hasPendingRequest}
                      onAddFriend={() => handleAddFriend(user.id)}
                      onToggleBestFriend={() => handleToggleBestFriend(user.id, isBestFriend)}
                      onDelete={() => handleDeleteConnection(user.id)}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </Paper>
      
      {/* Conteúdo das abas */}
      {tabValue === 0 || tabValue === 1 ? (
        // Amigos e Melhores Amigos
        <Paper sx={{ p: 3 }} elevation={1}>
          <Typography variant="h5" gutterBottom>
            {tabValue === 0 
              ? t('friendsPage.myFriends') 
              : t('friendsPage.myBestFriends')
            }
          </Typography>
          
          {isLoading ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography>{t('common.loading')}</Typography>
            </Box>
          ) : hasFriends ? (
            <Grid container spacing={3}>
              {displayFriends.map((friend) => {
                const isFriend = friends?.some(f => f.id === friend.id);
                const isBestFriend = bestFriends?.some(f => f.id === friend.id);
                
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={friend.id || uuidv4()}>
                    <FriendCard 
                      friends={friend}
                      isFriend={isFriend}
                      isBestFriend={isBestFriend}
                      onToggleBestFriend={() => handleToggleBestFriend(friend.id, isBestFriend)}
                      onDelete={() => handleDeleteConnection(friend.id)}
                    />
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Alert severity="info" sx={{ bgcolor: 'background.paper' }}>
              {tabValue === 0 
                ? t('friendsPage.noFriendsFound') 
                : t('friendsPage.noBestFriendsFound')
              }
            </Alert>
          )}
        </Paper>
      ) : tabValue === 2 ? (
        // Solicitações
        <Paper sx={{ p: 3 }} elevation={1}>
          <Typography variant="h5" gutterBottom>
            {t('friendsPage.connectionRequests')}
          </Typography>
          
          {receivedRequests.length > 0 ? (
            <ConnectionRequest 
              connections={receivedRequests}
              onConnectionUpdate={handleConnectionUpdate}
            />
          ) : (
            <Alert severity="info" sx={{ bgcolor: 'background.paper' }}>
              {t('friendsPage.noPendingRequests')}
            </Alert>
          )}
          
          {/* Seção de Convites Enviados */}
          <Box mt={4}>
            <Typography variant="h5" gutterBottom>
              {t('friendsPage.sentInvitations')}
            </Typography>
            
            {hasSentInvitations ? (
              <Grid container spacing={3}>
                {sentInvitations.map(invitation => (
                  <Grid item xs={12} sm={6} md={4} key={invitation.id || uuidv4()}>
                    <Paper sx={{ p: 2, height: '100%' }} elevation={2}>
                      <Stack spacing={2}>
                        <Typography variant="h6">{invitation.email}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('friendsPage.invitationSentOn', { 
                            date: new Date(invitation.createdAt).toLocaleDateString() 
                          })}
                        </Typography>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button 
                            size="small" 
                            color="error" 
                            onClick={() => handleCancelInvitation(invitation.id)}
                          >
                            {t('common.cancel')}
                          </Button>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            onClick={() => handleResendInvitation(invitation.id)}
                          >
                            {t('friendsPage.resend')}
                          </Button>
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info" sx={{ bgcolor: 'background.paper' }}>
                {t('friendsPage.noSentInvitations')}
              </Alert>
            )}
          </Box>
        </Paper>
      ) : null}
      
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