// src/components/Profile/OwnProfileView.jsx
import React, { useState } from 'react';
import { Container, Grid, Card, CardContent, Divider, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useInterests } from '../../providers/InterestsProvider';
import { useUser } from '../../providers/UserProvider';
import { useConnections } from '../../providers/ConnectionProvider';
import { useMessages } from '../../providers/MessageProvider';
import ProfileHeader from './ProfileHeader';
import ProfileInfo from './ProfileInfo';
import CompactInterestsDisplay from '../Interests/CompactInterestsDisplay';
import ElosCoinsSection from './ElosCoinsSection';
import FriendsSection from './FriendsSection';
import ConversationsSection from './ConversationsSection';
import ImageUploadAndCrop from '../../utils/ImageUploadAndCrop';

const OwnProfileView = ({ userData }) => {
  const { t } = useTranslation();
  const { friends, bestFriends } = useConnections();
  const { updateUser, uploadProfilePicture } = useUser();
  const { conversations, stats: messageStats } = useMessages();
  const { updateUserInterests } = useInterests();
  
  const [openDialog, setOpenDialog] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageDialogOpen, setImageDialogOpen] = useState(false);
  const [transactions] = useState([
    { date: '2023-08-10', time: '14:30', cost: '-50', action: 'Compra de Item A' },
    { date: '2023-08-09', time: '09:15', cost: '+100', action: 'Venda de Item B' },
    { date: '2023-08-08', time: '17:45', cost: '-30', action: 'Doação' },
    { date: '2023-08-07', time: '12:00', cost: '+200', action: 'Pagamento Recebido' },
    { date: '2023-08-06', time: '10:25', cost: '-70', action: 'Compra de Item C' },
  ]);

  const handleOpenImageEditor = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      setSelectedImage(e.target.files[0]);
      setImageDialogOpen(true);
    };
    input.click();
  };

  const handleSaveImage = async (file) => {
    if (!userData?.uid) return;
    
    try {
      await uploadProfilePicture(userData.uid, file);
      setImageDialogOpen(false);
    } catch (error) {
      console.error(t('profile.failedToSaveImage'), error);
    }
  };

  const handleSave = async (field, updatedValue) => {
    if (!userData?.uid) return;

    try {
      if (field === 'interesses') {
        await updateUserInterests(userData.uid, updatedValue);
        console.log("Interesses salvos com sucesso.");
      } else {
        const updatedUser = {
          ...userData,
          [field]: updatedValue,
          dataCriacao: userData.dataCriacao || new Date(),
        };
        await updateUser(userData.uid, updatedUser);
      }
      handleCloseDialog();
    } catch (error) {
      console.error(t('profile.failedToSave'), error);
    }
  };

  const handleCloseDialog = () => setOpenDialog(null);

  return (
    <Container>
      <Grid container spacing={3}>
        {/* Card de perfil principal */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <ProfileHeader
                userData={userData}
                onEditImage={handleOpenImageEditor}
              />
              <Divider sx={{ my: 2 }} />
              <ProfileInfo
                userData={userData}
                onSave={handleSave}
                isEditable={true}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Card de estatísticas e interesses */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              {/* Seção de interesses com edição */}
              <CompactInterestsDisplay
                userData={userData}
                isEditable={true}
                onSave={handleSave}
                openDialog={openDialog}
                setOpenDialog={setOpenDialog}
                maxVisible={7}
              />

              {/* Estatísticas do usuário */}
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
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('profile.accountType')}
                    </Typography>
                    <Typography variant="body1">
                      {userData?.tipoDeConta || t('common.regular')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('profile.messagesExchanged')}
                    </Typography>
                    <Typography variant="body1">
                      {messageStats?.totalMessages || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('profile.activeConversations')}
                    </Typography>
                    <Typography variant="body1">
                      {messageStats?.totalConversations || 0}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Seções adicionais */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <ElosCoinsSection 
                coins={userData?.saldoElosCoins || 0}
                transactions={transactions} 
                onBuyElosCoins={() => {}} 
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <FriendsSection 
                user={userData}
                friends={friends}
                bestFriends={bestFriends}
                canManageFriends={true}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <ConversationsSection 
                conversations={conversations}
                userId={userData.uid}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ImageUploadAndCrop
        open={isImageDialogOpen}
        image={selectedImage}
        onClose={() => setImageDialogOpen(false)}
        onSave={handleSaveImage}
      />
    </Container>
  );
};

export default OwnProfileView;