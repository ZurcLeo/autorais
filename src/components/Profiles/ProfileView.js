// src/components/Profile/ProfileView.jsx
import React from 'react';
import { Container, Grid, Card, CardContent, Divider, Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useConnections } from '../../providers/ConnectionProvider';
import { useMessages } from '../../providers/MessageProvider';
import ProfileHeader from './ProfileHeader';
import ProfileInfo from './ProfileInfo';
import CompactInterestsDisplay from '../Interests/CompactInterestsDisplay';
import FriendsSection from './FriendsSection';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MessageIcon from '@mui/icons-material/Message';
import { useNavigate } from 'react-router-dom';

const ProfileView = ({ userData }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { friends, bestFriends, addConnection, removeConnection, isConnected } = useConnections();
  const { createConversation } = useMessages();
  console.log('conectados? ', isConnected)
  const isFriend = isConnected(userData.uid);

  const handleSendMessage = async () => {
    try {
      const conversationId = await createConversation(userData.uid);
      navigate(`/messages/${conversationId}`);
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
    }
  };

  const handleConnectToggle = async () => {
    try {
      if (isFriend) {
        await removeConnection(userData.uid);
      } else {
        await addConnection(userData.uid);
      }
    } catch (error) {
      console.error('Erro ao gerenciar conexão:', error);
    }
  };

  return (
    <Container  sx={{
      display: 'flex',
      flexDirection: 'column', // Organiza os itens em coluna
      width: '100%', // Ocupa a largura disponível
      padding: 2,
    }}>
      <Grid container spacing={3}>
        {/* Card de perfil principal */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <ProfileHeader userData={userData} />
              <Divider sx={{ my: 2 }} />
              <ProfileInfo userData={userData} isEditable={false} />
              
              {/* Botões de ação */}
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button 
                  variant={isFriend ? "outlined" : "contained"} 
                  color={isFriend ? "warning" : "primary"}
                  startIcon={<PersonAddIcon />}
                  onClick={handleConnectToggle}
                >
                  {isFriend ? t('profile.removeFriend') : t('profile.addFriend')}
                </Button>
                
                <Button 
                  variant="contained" 
                  color="success"
                  startIcon={<MessageIcon />}
                  onClick={handleSendMessage}
                >
                  {t('profile.sendMessage')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card de interesses */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              {/* Seção de interesses somente leitura */}
              <CompactInterestsDisplay
                userData={userData}
                isEditable={false}
                maxVisible={7}
              />

              {/* Estatísticas visíveis do usuário */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" component="div" gutterBottom>
                  {t('profile.statistics')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('profile.memberSince')}
                    </Typography>
                    <Typography variant="body1">
                      {userData?.dataCriacao 
                        ? new Date(userData.dataCriacao).toLocaleDateString() 
                        : t('common.notAvailable')}
                    </Typography>
                  </Grid>
                  {userData.perfilPublico && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        {t('profile.accountType')}
                      </Typography>
                      <Typography variant="body1">
                        {userData?.tipoDeConta || t('common.regular')}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Amigos - visíveis apenas se for amigo ou perfil público */}
        {(isFriend || userData.perfilPublico) && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <FriendsSection 
                  user={userData}
                  friends={friends.filter(friend => friend.perfilPublico || isConnected(friend.uid))}
                  bestFriends={bestFriends.filter(friend => friend.perfilPublico || isConnected(friend.uid))}
                  canManageFriends={false}
                />
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default ProfileView;