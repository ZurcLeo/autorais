import React from "react";
import { Container } from 'react-bootstrap';
import useUserProfile from './hooks/useUserProfile';
import useImageUpload from './hooks/useImageUpload';
import ProfileCard from './ProfileCard';
import EditProfileForm from './EditProfileForm';

const Profile = () => {
    const { currentUser, userData, isLoading, isEditing, setIsEditing, setUserData, updateProfileData } = useUserProfile();
    const { profileImage, isPhotoSelected, avatarEditorRef, handleImageChange, uploadSelectedImage } = useImageUpload(currentUser);

    const handleSave = async () => {
        const imageUrl = await uploadSelectedImage();
        const updatedData = { ...userData, fotoDoPerfil: imageUrl };
        await updateProfileData(updatedData);
    };

    const toggleEdit = () => setIsEditing(!isEditing);

    if (isLoading) return <Container>Carregando...</Container>;
    if (!currentUser) return <Container>Usuário não autenticado.</Container>;

    return (
        <Container className="profile-container">
            {isEditing ? (
                <EditProfileForm
                    userData={userData}
                    setUserData={setUserData}
                    profileImage={profileImage}
                    isPhotoSelected={isPhotoSelected}
                    avatarEditorRef={avatarEditorRef}
                    handleImageChange={handleImageChange}
                    uploadSelectedImage={handleSave}
                    handleSave={handleSave}
                    toggleEdit={toggleEdit}
                />
            ) : (
                <ProfileCard
                    userData={userData}
                    toggleEdit={toggleEdit}
                />
            )}
        </Container>
    );
};

export default Profile;