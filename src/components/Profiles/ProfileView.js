import React, { useState, useCallback } from 'react';
import { Container, Grid, Card, CardContent, Divider, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useInterests } from '../../providers/InterestsProvider';
import { useUser } from '../../providers/UserProvider';
import { useConnections } from '../../providers/ConnectionProvider';
import ProfileHeader from './ProfileHeader';
import ProfileInfo from './ProfileInfo';
import CompactInterestsDisplay from '../Interests/CompactInterestsDisplay';
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
    const { t } = useTranslation();
    const { friends, bestFriends } = useConnections();
    const [openDialog, setOpenDialog] = useState(null);
    const { updateUser, uploadProfilePicture } = useUser();
    const [shouldReloadInterests, setShouldReloadInterests] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isImageDialogOpen, setImageDialogOpen] = useState(false);
    const { updateUserInterests } = useInterests();
    const [transactions] = useState(sampleTransactions);

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
            await uploadProfilePicture(userData.uid, file);
            setImageDialogOpen(false);
            setShouldReloadInterests(true);
        } catch (error) {
            console.error(t('profile.failedToSaveImage'), error);
        }
    };

    const handleSave = async (field, updatedValue) => {
        if (!isOwnProfile || !userData?.uid) return;

        try {
            if (field === 'interesses') {
                // A atualização dos interesses é feita diretamente no InterestsSection
                console.log("Interesses salvos.");
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
                                onEditImage={isOwnProfile ? handleOpenImageEditor : undefined}
                            />
                            <Divider sx={{ my: 2 }} />
                            <ProfileInfo
                                onSave={isOwnProfile ? handleSave : undefined}
                                isEditable={isOwnProfile}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Card de estatísticas e interesses */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            {/* Seção de interesses compacta */}
                            <CompactInterestsDisplay
                                isOwnProfile={isOwnProfile}
                                onSave={isOwnProfile ? handleSave : undefined}
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
                                </Grid>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Outras seções em cards separados */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <ElosCoinsSection transactions={transactions} onBuyElosCoins={() => {}} />
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
                            />
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <ConversationsSection />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

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