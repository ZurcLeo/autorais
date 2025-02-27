import React from 'react';
import { Card, CardContent, Typography, Grid, Avatar } from '@mui/material';

const ConnectionCard = ({ connection }) => (
  <Card className="h-full">
    <CardContent className="flex items-center space-x-4">
      <Avatar
        src={connection.fotoDoPerfil}
        alt={connection.nome}
        className="w-16 h-16"
      >
        {connection.nome?.[0]}
      </Avatar>
      <div>
        <Typography variant="h6">
          {connection.nome}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Conectado há {connection.connectionDuration}
        </Typography>
      </div>
    </CardContent>
  </Card>
);

export const ConnectionsSection = ({ data = { friends: [], bestFriends: [] } }) => {
    const { friends = [], bestFriends = [] } = data;

  // Handle empty state
  if ((!friends || friends.length === 0) && (!bestFriends || bestFriends.length === 0)) {
    return (
      <Card className="w-full p-4">
        <Typography variant="h6">
          Nenhuma conexão ainda
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Conecte-se com outros usuários para expandir sua rede
        </Typography>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      {bestFriends.length > 0 && (
        <div className="mb-6">
          <Typography variant="h5" className="mb-4">
            Melhores Amigos
          </Typography>
          <Grid container spacing={3}>
            {bestFriends.map((friend) => (
              <Grid item xs={12} sm={6} md={4} key={friend.id}>
                <ConnectionCard connection={friend} />
              </Grid>
            ))}
          </Grid>
        </div>
      )}

      {friends.length > 0 && (
        <div>
          <Typography variant="h5" className="mb-4">
            Amigos
          </Typography>
          <Grid container spacing={3}>
            {friends.map((friend) => (
              <Grid item xs={12} sm={6} md={4} key={friend.id}>
                <ConnectionCard connection={friend} />
              </Grid>
            ))}
          </Grid>
        </div>
      )}
    </section>
  );
};