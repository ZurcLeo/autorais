import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, CircularProgress } from '@mui/material';
import ProfileView from './ProfileView';
import { serviceLocator } from '../../core/services/BaseService';
import { useUser } from '../../providers/UserProvider';
import { useInterests } from '../../providers/InterestsProvider';

const Profile = () => {
    const { uid } = useParams();
    const serviceStore = serviceLocator.get('store').getState()?.auth;
    const { currentUser } = serviceStore;
    const { getUserById } = useUser();
    const {availableInterests} = useInterests();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const loadProfileData = async () => {
        if (!uid) return;
        setIsLoading(true);
        try {
          const profileData = uid === currentUser?.uid ? 
            currentUser : 
            await getUserById(uid);
          setUser(profileData);
        } catch (error) {
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      };
  
      loadProfileData();
    }, [uid, currentUser]);
  
    if (isLoading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!user) return <Alert severity="warning">User not found</Alert>;
  
    return <ProfileView 
      userData={user} 
      isOwnProfile={uid === currentUser?.uid}
      interests={currentUser.interesses} 
    />;
  };

  export default Profile;