import React, { useState } from 'react';
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Box,
  Divider,
  Badge,
  IconButton,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  OpenInNew as OpenInNewIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
// import { formatDistanceToNow } from 'date-fns'; // Se usar timestamps

export const NotificationsSection = ({ data, maxInitialNotifications = 3 }) => {
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  if (!data || data.length === 0) {
    return (
      <Card sx={{ width: '100%', p: 4 }}>
        <Typography variant="h6">
          Nenhuma notificação pendente
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Você está em dia com todas as suas atividades
        </Typography>
      </Card>
    );
  }

  const displayedNotifications = showAll
    ? data
    : data.slice(0, maxInitialNotifications);

  const hiddenCount = data.length - maxInitialNotifications;

  const goToNotificationsPage = () => {
    navigate('/notifications');
  };

  // Função de exemplo para marcar como lida (adapte à sua lógica)
  const handleMarkAsRead = (id) => {
    console.log(`Notificação ${id} marcada como lida`);
    // Implemente a lógica para atualizar o estado da notificação
  };

  return (
    <Box component="section" sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" color="text.secondary">
          Notificações
        </Typography>
        <Button
          variant="text"
          endIcon={<OpenInNewIcon />}
          onClick={goToNotificationsPage}
        >
          Ver todas as Notificações
        </Button>
      </Box>

      <Card sx={{ borderRadius: 2 }}>
        <List sx={{ p: 0 }}>
          {displayedNotifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem
                alignItems="flex-start"
                sx={{
                  borderRadius: 1,
                  bgcolor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.05)',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    boxShadow: 1,
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon sx={{ mr: 1 }}>
                  {!notification.read && (
                    <Badge color="primary" variant="dot" sx={{ mr: 1 }}>
                      <NotificationIcon color="primary" />
                    </Badge>
                  )}
                  {notification.read && <NotificationIcon color="disabled" />}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {notification.content}
                      {/* {notification.timestamp && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: ptBR })}
                        </Typography>
                      )} */}
                    </Typography>
                  }
                />
                {/* Exemplo de ação direta na notificação */}
                {/* <IconButton 
                  aria-label="marcar como lida" 
                  onClick={() => handleMarkAsRead(notification.id)}
                  size="small"
                >
                  <CloseIcon fontSize="small" />
                </IconButton> */}
              </ListItem>
              {index < displayedNotifications.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>

        {data.length > maxInitialNotifications && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Button
              onClick={() => setShowAll(!showAll)}
              endIcon={showAll ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              sx={{ textTransform: 'none', borderRadius: 1 }}
            >
              {showAll
                ? 'Mostrar menos'
                : `Mostrar mais ${hiddenCount} notificações`}
            </Button>
          </Box>
        )}
      </Card>
    </Box>
  );
};