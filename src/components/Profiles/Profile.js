// src/components/Profile/Profile.jsx - Completamente revisado
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, CircularProgress, Box, Button } from '@mui/material';
import ProfileView from './ProfileView';
import OwnProfileView from './OwnProfileView';
import { serviceLocator } from '../../core/services/BaseService';
import { useUser } from '../../providers/UserProvider';
import { useConnections } from '../../providers/ConnectionProvider';

const Profile = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const serviceStore = serviceLocator.get('store').getState()?.auth;
  const { currentUser } = serviceStore || {};
  const { getUserById, user, usersById } = useUser();
  const { friends, bestFriends } = useConnections();
  
  // Estado simplificado
  const [state, setState] = useState({
    user: null,
    isLoading: true,
    error: null,
    canViewProfile: false,
    dataSource: null // 'cache', 'server' ou 'local'
  });

  // Debug log para ajudar a diagnosticar o problema
  console.log("[Profile] Renderizando com:", { 
    uid, 
    currentUserUid: currentUser?.uid,
    stateLoading: state.isLoading,
    stateUser: state.user?.uid,
    canView: state.canViewProfile,
    dataSource: state.dataSource,
    usersById: usersById ? Object.keys(usersById) : []
  });

  // Função para verificar manualmente se um usuário é amigo
  const isConnected = useCallback((targetUserId) => {
    if (!targetUserId) return false;
    
    // Verificar diretamente no array de amigos do usuário atual
    if (currentUser?.amigos && Array.isArray(currentUser.amigos)) {
      if (currentUser.amigos.includes(targetUserId)) {
        console.log("[Profile] Usuário encontrado na lista de amigos");
        return true;
      }
    }
    
    // Verificar nas listas de amigos e melhores amigos do provider
    const foundInFriends = friends && Array.isArray(friends) && 
                           friends.some(friend => 
                             (friend.id === targetUserId || friend.uid === targetUserId));
    
    const foundInBestFriends = bestFriends && Array.isArray(bestFriends) && 
                               bestFriends.some(friend => 
                                 (friend.id === targetUserId || friend.uid === targetUserId));
    
    console.log("[Profile] Verificação de amizade via provider:", { 
      foundInFriends, 
      foundInBestFriends,
      friendsCount: friends?.length,
      bestFriendsCount: bestFriends?.length
    });
    
    return foundInFriends || foundInBestFriends;
  }, [currentUser, friends, bestFriends]);

  // Função para buscar perfil em amigos
  const findUserInFriendLists = useCallback((targetUserId) => {
    if (!targetUserId) return null;
    
    // Procurar em friends
    const foundInFriends = friends && Array.isArray(friends) && 
                          friends.find(friend => 
                            (friend.id === targetUserId || friend.uid === targetUserId));
    
    // Procurar em bestFriends
    const foundInBestFriends = bestFriends && Array.isArray(bestFriends) && 
                              bestFriends.find(friend => 
                                (friend.id === targetUserId || friend.uid === targetUserId));
    
    return foundInFriends || foundInBestFriends || null;
  }, [friends, bestFriends]);

  // Efeito para carregar os dados do perfil
  useEffect(() => {
    let isMounted = true;
    
    const loadProfileData = async () => {
      if (!uid) {
        if (isMounted) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: "ID de usuário não especificado" 
          }));
        }
        return;
      }

      if (isMounted) {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
      }
      
      try {
        console.log("[Profile] Iniciando carregamento de dados para uid:", uid);
        
        // Verificar se é o próprio perfil
        const isOwnProfile = uid === currentUser?.uid;
        
        if (isOwnProfile) {
          console.log("[Profile] É o próprio perfil, usando dados locais");
          if (isMounted) {
            setState({
              user: currentUser,
              isLoading: false,
              error: null,
              canViewProfile: true,
              dataSource: 'local'
            });
          }
          return;
        }

        // ESTRATÉGIA 1: Verificar no cache de userById
        if (usersById && usersById[uid]) {
          console.log("[Profile] Perfil encontrado no cache usersById:", usersById[uid]);
          const userData = usersById[uid];
          
          // Verificar permissão
          const hasPublicProfile = userData?.perfilPublico === true;
          const isFriend = isConnected(uid);
          const canView = isOwnProfile || hasPublicProfile || isFriend;
          
          if (isMounted) {
            setState({
              user: userData,
              isLoading: false,
              error: canView ? null : "Você não tem permissão para visualizar este perfil.",
              canViewProfile: canView,
              dataSource: 'cache'
            });
          }
          return;
        }
        
        // ESTRATÉGIA 2: Verificar nas listas de amigos
        const userFromFriendLists = findUserInFriendLists(uid);
        if (userFromFriendLists) {
          console.log("[Profile] Perfil encontrado na lista de amigos:", userFromFriendLists);
          
          // Se encontrarmos nas listas de amigos, já sabemos que pode visualizar
          if (isMounted) {
            setState({
              user: userFromFriendLists,
              isLoading: false,
              error: null,
              canViewProfile: true,
              dataSource: 'friends'
            });
          }
          return;
        }
        
        // ESTRATÉGIA 3: Buscar do servidor
        console.log("[Profile] Buscando dados do usuário do servidor");
        const userData = await getUserById(uid);
        console.log("[Profile] Dados recebidos do servidor:", userData);
        
        // Verificar permissão
        const hasPublicProfile = userData?.perfilPublico === true;
        const isFriend = isConnected(uid);
        const canView = isOwnProfile || hasPublicProfile || isFriend;
        
        console.log("[Profile] Análise de permissão:", { 
          isOwnProfile, 
          hasPublicProfile: userData?.perfilPublico,
          isFriend,
          canView,
          amigos: currentUser?.amigos
        });
        
        if (isMounted) {
          setState({
            user: userData,
            isLoading: false,
            error: canView ? null : "Você não tem permissão para visualizar este perfil.",
            canViewProfile: canView,
            dataSource: 'server'
          });
        }
      } catch (error) {
        console.error("[Profile] Erro ao carregar perfil:", error);
        if (isMounted) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: error.message || "Erro ao carregar dados do perfil" 
          }));
        }
      }
    };

    loadProfileData();
    
    return () => {
      isMounted = false;
    };
  }, [uid, currentUser, getUserById, isConnected, usersById, findUserInFriendLists]);

  // Feedback durante o carregamento
  if (state.isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <CircularProgress size={60} />
        <Box sx={{ mt: 2 }}>Carregando dados do perfil...</Box>
      </Box>
    );
  }
  
  // Mensagem de erro se algo falhou
  if (state.error) {
    return (
      <Box sx={{ m: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{state.error}</Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate(-1)}
        >
          Voltar
        </Button>
      </Box>
    );
  }
  
  // Usuário não encontrado
  if (!state.user) {
    return (
      <Box sx={{ m: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>Usuário não encontrado</Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate(-1)}
        >
          Voltar
        </Button>
      </Box>
    );
  }
  
  // Sem permissão para visualizar
  if (!state.canViewProfile) {
    return (
      <Box sx={{ m: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Este perfil é privado. Você precisa ser amigo para visualizá-lo.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate(-1)}
        >
          Voltar
        </Button>
      </Box>
    );
  }

  // Renderização do perfil apropriado
  const isOwnProfile = uid === currentUser?.uid;
  
  // Decidir o componente a renderizar baseado em se é o próprio perfil
  const profileComponent = isOwnProfile ? (
    <OwnProfileView userData={state.user} />
  ) : (
    <>
      {state.dataSource !== 'server' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Usando dados em cache. Alguns detalhes podem não estar atualizados.
        </Alert>
      )}
      <ProfileView userData={state.user} />
    </>
  );
  
  return profileComponent;
};

export default Profile;