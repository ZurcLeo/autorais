// src/components/Profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, CircularProgress } from '@mui/material';
import ProfileView from './ProfileView';
import OwnProfileView from './OwnProfileView';
import { serviceLocator } from '../../core/services/BaseService';
import { useUser } from '../../providers/UserProvider';
import { useInterests } from '../../providers/InterestsProvider';
import { useConnections } from '../../providers/ConnectionProvider';

const Profile = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const serviceStore = serviceLocator.get('store').getState()?.auth;
  const { currentUser } = serviceStore;
  const { getUserById } = useUser();
  const { availableInterests } = useInterests();
  const { isConnected } = useConnections();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canViewProfile, setCanViewProfile] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!uid) return;
      setIsLoading(true);

      try {
        // Verificar se é o próprio perfil do usuário
        const isOwnProfile = uid === currentUser?.uid;
        
        // Se for o próprio perfil, carregar do estado atual
        if (isOwnProfile) {
          setUser(currentUser);
          setCanViewProfile(true);
        } else {
          // Se for perfil de outro usuário, buscar do backend
          const profileData = await getUserById(uid);
          
          // Verificar se tem permissão para visualizar (perfil público ou é amigo)
          const hasPermission = profileData.perfilPublico || isConnected(uid);
          
          setUser(profileData);
          setCanViewProfile(hasPermission);
          
          // Se não tiver permissão, exibir mensagem apropriada
          if (!hasPermission) {
            setError("Você não tem permissão para visualizar este perfil.");
          }
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [uid, currentUser, getUserById, isConnected]);

  // Redirecionamento ao meu próprio perfil se tentar acessar perfil próprio com outro ID
  useEffect(() => {
    // Se usuário está logado mas está tentando acessar o próprio perfil com outro URL
    if (currentUser && uid !== currentUser.uid && uid === localStorage.getItem('uid')) {
      navigate(`/profile/${currentUser.uid}`);
    }
  }, [currentUser, uid, navigate]);

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!user) return <Alert severity="warning">Usuário não encontrado</Alert>;
  if (!canViewProfile) return <Alert severity="info">Este perfil é privado. Você precisa ser amigo para visualizá-lo.</Alert>;

  // Renderizar componente apropriado com base em quem é o usuário
  const isOwnProfile = uid === currentUser?.uid;
  const userData = user;
  return isOwnProfile ? (
    <OwnProfileView userData={userData} />
  ) : (
    <ProfileView userData={userData} />
  );
};

export default Profile;