import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { Notifications as NotificationIcon } from '@mui/icons-material';

export const NotificationsSection = ({ data }) => {
  // Handle empty state
  if (!data || data.length === 0) {
    return (
      <Card className="w-full p-4">
        <Typography variant="h6">
          Nenhuma notificação pendente
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Você está em dia com todas as suas atividades
        </Typography>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <Typography variant="h5" className="mb-4">
        Notificações
      </Typography>
      <Card>
        <List>
          {data.map((notification) => (
            <ListItem key={notification.id}>
              <ListItemIcon>
                <NotificationIcon color={notification.read ? 'disabled' : 'primary'} />
              </ListItemIcon>
              <ListItemText
                primary={notification.title}
                secondary={notification.content}
              />
            </ListItem>
          ))}
        </List>
      </Card>
    </section>
  );
};