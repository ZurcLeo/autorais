import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material';

export const MessagesSection = ({ data }) => {
  // Handle empty state
  if (!data || data.length === 0) {
    return (
      <Card className="w-full p-4">
        <Typography variant="h6">
          Nenhuma mensagem
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Comece uma conversa com seus amigos
        </Typography>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <Typography variant="h5" className="mb-4">
        Mensagens Recentes
      </Typography>
      <Card>
        <List>
          {data.map((message) => (
            <ListItem key={message.id}>
              <ListItemAvatar>
                <Avatar src={message.foto} alt={message.nome}>
                  {message.nome?.[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={message.nome}
                secondary={message.content}
              />
            </ListItem>
          ))}
        </List>
      </Card>
    </section>
  );
};