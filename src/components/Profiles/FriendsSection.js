import React from 'react';
import { Box, Typography } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const FriendsSection = ({ user }) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <PersonIcon color="primary" />
        <Typography variant="h5" component="div" ml={1}>
          {t('friends.title')}
        </Typography>
      </Box>
      <Typography variant="body1">
        {user.amigos?.length || 0} {t('friends.friendCount')}
      </Typography>
    </Box>
  );
};

export default FriendsSection;