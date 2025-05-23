import React from 'react';
import { Box, Typography, Avatar, Grid } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const FriendsSection = ({ user, friends, bestFriends }) => {
  const { t } = useTranslation();
  
  // Garantir que temos user corretamente
  const userData = user || {};
  const amigosCount = userData.amigos?.length || 0;

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <PersonIcon color="primary" />
        <Typography variant="h5" component="div" ml={1}>
          {t('friends.title')}
        </Typography>
      </Box>
      <Typography variant="body1">
        {amigosCount} {t('friends.friendCount')}
      </Typography>
      
      {/* Mostrar amigos se houver dados disponíveis */}
      {friends && friends.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {friends.slice(0, 6).map((friend) => (
            <Grid item xs={4} sm={2} key={friend.uid}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <Avatar 
                  src={friend.fotoDoPerfil} 
                  sx={{ width: 50, height: 50, mb: 1 }}
                />
                <Typography variant="body2" noWrap>
                  {friend.nome || friend.displayName}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default FriendsSection;