import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Alert, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ProfileHeader from './ProfileHeader';
import ProfileInfo from './ProfileInfo';
import InterestsSection from './InterestsSection';
import ElosCoinsSection from './ElosCoinsSection';
import FriendsSection from './FriendsSection';
import ConversationsSection from './ConversationsSection';
import ImageUploadAndCrop from '../../utils/ImageUploadAndCrop';
import { useAuth } from '../../context/AuthContext';
import { useUserContext } from '../../context/UserContext';
import { useInterests } from '../../context/InterestsContext';

// Sample transaction data - In a real app, this would come from an API
const sampleTransactions = [
  { date: '2023-08-10', time: '14:30', cost: '-50', action: 'Compra de Item A' },
  { date: '2023-08-09', time: '09:15', cost: '+100', action: 'Venda de Item B' },
  { date: '2023-08-08', time: '17:45', cost: '-30', action: 'Doação' },
  { date: '2023-08-07', time: '12:00', cost: '+200', action: 'Pagamento Recebido' },
  { date: '2023-08-06', time: '10:25', cost: '-70', action: 'Compra de Item C' },
];

const Profile = () => {
  // 1. Hook declarations - All hooks must be at the top level
  const { t } = useTranslation();
  const { uid } = useParams();
  const { currentUser } = useAuth();
  const { updateUser, uploadProfilePicture, getUserById, setUserById } = useUserContext();
  const interests = useInterests();

  // 2. State declarations - Group related state together
  const [user, setUser] = useState({
    interessesPessoais: [],
    interessesNegocios: [],
    dataCriacao: null,
  });  const [transactions] = useState(sampleTransactions);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageDialogOpen, setImageDialogOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(null);
  const [shouldReloadInterests, setShouldReloadInterests] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. Effect hooks - Handle data fetching and updates
  useEffect(() => {
    const loadProfileData = async () => {
      if (!uid) return;

      setIsLoading(true);
      try {
        if (currentUser && uid === currentUser.uid) {
          setUser(currentUser);
          setIsOwnProfile(true);
        } else {
          const profileData = await getUserById(uid);
          console.log(profileData)

          if (!profileData) {
            throw new Error(t('profile.notFound'));
          }
          setUser(profileData);
          setIsOwnProfile(false);
        }
      } catch (error) {
        setError(error.message);
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [uid, currentUser, getUserById, t]);

  // Effect for periodic updates of user interests
  useEffect(() => {
    if (!user?.uid || !isOwnProfile || !currentUser) return;

    const checkForUpdates = async () => {
      try {
        const latestUser = await setUserById(user.uid);
        if (!latestUser) return;

        const hasInterestsChanged = 
          JSON.stringify(latestUser.interessesPessoais) !== JSON.stringify(user.interessesPessoais) ||
          JSON.stringify(latestUser.interessesNegocios) !== JSON.stringify(user.interessesNegocios);
        
        if (hasInterestsChanged) {
          setUser(latestUser);
          setShouldReloadInterests(true);
        }
      } catch (error) {
        console.error(t('profile.errorCheckingUpdates'), error);
      }
    };

    const intervalId = setInterval(checkForUpdates, 60000);
    return () => clearInterval(intervalId);
  }, [user?.uid, user.interessesPessoais, user.interessesNegocios, setUserById, t, isOwnProfile, currentUser]);

  // 4. Event Handlers
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
    if (!isOwnProfile || !currentUser?.uid) return;
    
    try {
      const updatedUser = await uploadProfilePicture(currentUser.uid, file);
      setUser(updatedUser);
      setImageDialogOpen(false);
      setShouldReloadInterests(true);
    } catch (error) {
      console.error(t('profile.failedToSaveImage'), error);
    }
  };

  const handleSave = async (field, updatedInterests) => {
    if (!isOwnProfile || !currentUser?.uid) return;
    
    try {
      const updatedUser = {
        ...user,
        [field]: updatedInterests,
        dataCriacao: user.dataCriacao || new Date(),
      };
      const updatedUserFromBackend = await updateUser(currentUser.uid, updatedUser);
      setUser(updatedUserFromBackend);
      handleCloseDialog();
    } catch (error) {
      console.error(t('profile.failedToSave'), error);
    }
  };

  const handleCloseDialog = () => setOpenDialog(null);

  // 5. Render helpers - Handle conditional rendering
  const renderContent = () => {
    if (isLoading) {
      return (
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Container>
      );
    }

    if (error) {
      return (
        <Container>
          <Alert severity="error">{error}</Alert>
        </Container>
      );
    }

    if (!user) {
      return (
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Container>
      );
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <ProfileHeader 
                user={user} 
                onEditImage={isOwnProfile ? handleOpenImageEditor : undefined} 
              />
              <ProfileInfo 
                user={user} 
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
                user={user}
                interestsList={interests}
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
              <ElosCoinsSection user={user} transactions={transactions} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <FriendsSection user={user} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <ConversationsSection user={user} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // 6. Main render
  return (
    <Container>
      {renderContent()}
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

export default Profile;