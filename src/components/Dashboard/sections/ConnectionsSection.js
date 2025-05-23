import React from 'react';
import { Card, CardContent, Typography, Grid, Avatar, Box } from '@mui/material';

const ConnectionCard = ({ connection }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar
        src={connection.fotoDoPerfil}
        alt={connection.nome}
        sx={{ width: 64, height: 64 }}
      >
        {connection.nome?.[0]}
      </Avatar>
      <Box>
        <Typography variant="h6">
          {connection.nome}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Conectado há {connection.connectionDuration}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export const ConnectionsSection = ({ data = { friends: [], bestFriends: [] } }) => {
  const { friends = [], bestFriends = [] } = data;

  // Handle empty state
  if ((!friends || friends.length === 0) && (!bestFriends || bestFriends.length === 0)) {
    return (
      <Card sx={{ width: '100%', p: 4 }}>
        <Typography variant="h6">
          Nenhuma conexão ainda
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Conecte-se com outros usuários para expandir sua rede
        </Typography>
      </Card>
    );
  }

  return (
    <Box component="section" sx={{ mb: 4 }}>
      {bestFriends.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Melhores Amigos
          </Typography>
          <Grid container spacing={3}>
            {bestFriends.map((friend) => (
              <Grid item xs={12} sm={6} md={4} key={friend.id}>
                <ConnectionCard connection={friend} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {friends.length > 0 && (
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Amigos
          </Typography>
          <Grid container spacing={3}>
            {friends.map((friend) => (
              <Grid item xs={12} sm={6} md={4} key={friend.id}>
                <ConnectionCard connection={friend} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};