import React from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { Box, Typography } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { serviceLocator } from '../../core/services/BaseService';

const FriendsSection = (user, friends, bestFriends) => {
  const { t } = useTranslation();
    const serviceStore = serviceLocator.get('store').getState()?.auth;
    const { currentUser } = serviceStore;

console.log(user, friends, bestFriends)

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <PersonIcon color="primary" />
        <Typography variant="h5" component="div" ml={1}>
          {t('friends.title')}
        </Typography>
      </Box>
      <Typography variant="body1">
        {currentUser.amigos?.length || 0} {t('friends.friendCount')}
      </Typography>
    </Box>
  );
};

export default FriendsSection;