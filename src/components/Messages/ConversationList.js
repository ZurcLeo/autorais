// ConversationsList.js
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography, Badge } from '@mui/material';
import { useConnections } from '../../context/ConnectionContext';
import { useMessages } from '../../context/MessageContext';
import { useAuth } from '../../context/_AuthContext';

const ConversationsList = () => {
  const navigate = useNavigate();
  const { uidDestinatario } = useParams();
  const { friends } = useConnections();
  const { messages } = useMessages();
  const { currentUser } = useAuth();

  const getOptimizedProfilePicture = (url) => {
    if (!url) return null;
    // Add a smaller size parameter to the URL if it's from your storage
    return url.includes('?') 
      ? `${url}&size=100` 
      : `${url}?size=100`;
  };

// Função auxiliar para truncar texto
const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Agrupa as mensagens por usuário e encontra a última mensagem de cada conversa
  const lastMessages = React.useMemo(() => {
    // Garantir que messages é um array
    const messagesList = Array.isArray(messages) ? messages : [];
    
    // Log para debug
    console.log('Messages recebidas:', messages);
    console.log('Messages processadas:', messagesList);

    const messagesByUser = {};
    
    messagesList.forEach(message => {
      if (!message) return; // Pula mensagens inválidas
      
      const otherUserId = message.uidRemetente === currentUser?.uid 
        ? message.uidDestinatario 
        : message.uidRemetente;
      
      if (!messagesByUser[otherUserId] || 
          message.timestamp > messagesByUser[otherUserId].timestamp) {
        messagesByUser[otherUserId] = message;
      }
    });
    
    return messagesByUser;
  }, [messages, currentUser]);

  // Conta mensagens não lidas por usuário
  const unreadCount = React.useMemo(() => {
    // Garantir que messages é um array
    const messagesList = Array.isArray(messages) ? messages : [];
    
    const counts = {};
    messagesList.forEach(message => {
      if (!message) return; // Pula mensagens inválidas
      
      if (!message.lido && message.uidRemetente !== currentUser?.uid) {
        counts[message.uidRemetente] = (counts[message.uidRemetente] || 0) + 1;
      }
    });
    
    return counts;
  }, [messages, currentUser]);

  // Renderização condicional baseada no estado dos dados
  if (!Array.isArray(messages)) {
    return (
      <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider', height: '100vh' }}>
        <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          Conversas
        </Typography>
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Carregando conversas...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider', height: '100vh' }}>
      <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        Conversas
      </Typography>
      <List sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 64px)' }}>
        {friends.map(friend => {
          const lastMessage = lastMessages[friend.id];
          const unreadMessages = unreadCount[friend.id] || 0;
          
          return (
            <ListItem 
              button 
              key={friend.id}
              selected={friend.id === uidDestinatario}
              onClick={() => navigate(`/chat/${friend.id}`)}
              sx={{ 
                bgcolor: friend.id === uidDestinatario ? 'action.selected' : 'inherit',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ListItemAvatar>
                <Badge 
                  badgeContent={unreadMessages} 
                  color="primary"
                  invisible={unreadMessages === 0}
                >
                  <Avatar src={getOptimizedProfilePicture(friend.fotoDoPerfil)}>{friend.nome[0]}</Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText 
                primary={friend.nome}
                secondary={
                  lastMessage 
                    ? truncateText(lastMessage.conteudo, 30)
                    : 'Nenhuma mensagem'
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default ConversationsList;