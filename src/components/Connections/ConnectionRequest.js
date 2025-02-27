// src/components/Connections/ConnectionRequest.js
import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { CheckCircle as AcceptIcon, Cancel as RejectIcon } from '@mui/icons-material';
import { useConnections } from '../../context/ConnectionContext';
import { showToast } from '../../utils/toastUtils';

const ConnectionRequest = () => {
  const { invitations, loading, error } = useConnections();

  const handleAccept = async (inviteId) => {
    try {
      await connectionService.acceptConnectionRequest(inviteId);
      showToast('Solicitação de amizade aceita!', { type: 'success' });
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
      showToast('Erro ao aceitar solicitação de amizade.', { type: 'error' });
    }
  };

  const handleReject = async (inviteId) => {
    try {
      await connectionService.rejectConnectionRequest(inviteId);
      showToast('Solicitação de amizade rejeitada.', { type: 'info' });
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
      showToast('Erro ao rejeitar solicitação de amizade.', { type: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error">Erro ao carregar solicitações de conexão.</Typography>
      </Box>
    );
  }

  if (!invitations || invitations.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography>Não há solicitações de amizade pendentes.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Solicitações de Amizade
      </Typography>
      <List>
        {invitations.map((invitation) => (
          <ListItem key={invitation.id} sx={{ display: 'flex', alignItems: 'center' }}>
            <ListItemAvatar>
              <Avatar src={invitation.senderProfilePicture} alt={invitation.senderName}>
                {invitation.senderName?.[0]}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={invitation.senderName}
              secondary={invitation.senderMessage || 'Solicitação de amizade'}
            />
            <IconButton
              color="success"
              onClick={() => handleAccept(invitation.id)}
              title="Aceitar"
            >
              <AcceptIcon />
            </IconButton>
            <IconButton
              color="error"
              onClick={() => handleReject(invitation.id)}
              title="Rejeitar"
            >
              <RejectIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ConnectionRequest;