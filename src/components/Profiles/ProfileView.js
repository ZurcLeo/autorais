import React, { useState } from 'react';
import { Container, Grid, Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useInterests } from '../../context/InterestsContext';
import { useUser } from '../../context/UserContext';
import ProfileHeader from './ProfileHeader';
import ProfileInfo from './ProfileInfo';
import InterestsSection from './InterestsSection';
import ElosCoinsSection from './ElosCoinsSection';
import FriendsSection from './FriendsSection';
import ConversationsSection from './ConversationsSection';
import ImageUploadAndCrop from '../../utils/ImageUploadAndCrop';

const sampleTransactions = [
    { date: '2023-08-10', time: '14:30', cost: '-50', action: 'Compra de Item A' },
    { date: '2023-08-09', time: '09:15', cost: '+100', action: 'Venda de Item B' },
    { date: '2023-08-08', time: '17:45', cost: '-30', action: 'Doação' },
    { date: '2023-08-07', time: '12:00', cost: '+200', action: 'Pagamento Recebido' },
    { date: '2023-08-06', time: '10:25', cost: '-70', action: 'Compra de Item C' },
  ];

const ProfileView = ({ userData, isOwnProfile = false }) => {
  // 1. Hooks declarations
  const { t } = useTranslation();
  const [openDialog, setOpenDialog] = useState(null);
  const { uploadProfilePicture } = useUser();
  const [shouldReloadInterests, setShouldReloadInterests] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageDialogOpen, setImageDialogOpen] = useState(false);
  const interests = useInterests();
  const [user, setUser] = useState({
    interessesPessoais: [],
    interessesNegocios: [],
    dataCriacao: null,
  });  const [transactions] = useState(sampleTransactions);

  // 2. Event handlers
  const handleOpenImageEditor = () => {
    if (!isOwnProfile) return;
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
    if (!isOwnProfile || !userData?.uid) return;
    
    try {
      const updatedUser = await uploadProfilePicture(userData.uid, file);
      setUser(updatedUser);
      setImageDialogOpen(false);
      setShouldReloadInterests(true);
    } catch (error) {
      console.error(t('profile.failedToSaveImage'), error);
    }
  };

  const handleSave = async (field, updatedInterests) => {
    if (!isOwnProfile || !userData?.uid) return;
    
    try {
      const updatedUser = {
        ...userData,
        [field]: updatedInterests,
        dataCriacao: userData.dataCriacao || new Date(),
      };
      // Implemente a lógica de salvamento aqui
      handleCloseDialog();
    } catch (error) {
      console.error(t('profile.failedToSave'), error);
    }
  };

  const handleCloseDialog = () => setOpenDialog(null);

  // 3. Render principal - Combinando os dois blocos return em um único retorno
  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <ProfileHeader 
                user={userData}  
                onEditImage={isOwnProfile ? handleOpenImageEditor : undefined} 
              />
              <ProfileInfo 
                user={userData} 
                onSave={isOwnProfile ? handleSave : undefined}
                isEditable={isOwnProfile}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <InterestsSection
                user={userData} // Corrigido: usar userData em vez de user
                // interestsList={interests}
                onSave={isOwnProfile ? handleSave : undefined}
                openDialog={openDialog}
                setOpenDialog={setOpenDialog}
                shouldReloadInterests={shouldReloadInterests}
                setShouldReloadInterests={setShouldReloadInterests}
                isEditable={isOwnProfile}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <ElosCoinsSection user={userData} transactions={transactions} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <FriendsSection user={userData} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <ConversationsSection user={userData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Componente de upload de imagem */}
      {isOwnProfile && (
        <ImageUploadAndCrop
          open={isImageDialogOpen}
          image={selectedImage}
          onClose={() => setImageDialogOpen(false)}
          onSave={handleSaveImage}
        />
      )}
    </Container>
  );
};

export default ProfileView;