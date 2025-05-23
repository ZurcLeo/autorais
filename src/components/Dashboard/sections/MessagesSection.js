import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText,
  Box,
  Button,
  Badge,
  Divider,
  Chip,
} from '@mui/material';
import { 
  OpenInNew as OpenInNewIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Circle as CircleIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const MessagesSection = ({ data, maxInitialMessages = 3 }) => {
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  
  // Handle empty state
  if (!data || data.length === 0) {
    return (
      <Card sx={{ width: '100%', p: 4, mb: 4 }}>
        <Typography variant="h6">
          Nenhuma mensagem
        </Typography>
        <Typography variant="body2">
          Comece uma conversa com seus amigos
        </Typography>
      </Card>
    );
  }

  const goToChatPage = () => {
    navigate('/messages');
  };

  // Formata a data da mensagem de forma relativa
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, "'Hoje,' HH:mm", { locale: ptBR });
    } else if (isYesterday(date)) {
      return format(date, "'Ontem,' HH:mm", { locale: ptBR });
    } else {
      return format(date, "dd/MM/yyyy, HH:mm", { locale: ptBR });
    }
  };

  // Trunca o texto da mensagem se for muito longo
  const truncateMessage = (text, maxLength = 60) => {
    if (!text) return '';
    return text.length > maxLength 
      ? `${text.substring(0, maxLength)}...` 
      : text;
  };

  // Controle de quais mensagens exibir
  const displayedMessages = showAll 
    ? data 
    : data.slice(0, maxInitialMessages);
  
  const hiddenCount = data.length - maxInitialMessages;
  
  // Navega para a página de mensagens
  const goToMessagesPage = () => {
    navigate('/messages');
  };
  
  // Abre uma conversa específica
  const openConversation = (userId) => {
    navigate(`/messages/${userId}`);
  };

  return (
    <Box component="section" sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" color="text.secondary">
                Mensagens
              </Typography>
              <Button
                variant="text"
                endIcon={<OpenInNewIcon />}
                onClick={goToChatPage}
              >
                Ver todas as Mensagens
              </Button>
            </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" color="text.secondary">
          Mensagens Recentes
        </Typography>
        <Button 
          variant="text" 
          endIcon={<OpenInNewIcon />}
          onClick={goToMessagesPage}
        >
          Ver todas
        </Button>
      </Box>
      
      <Card>
        <List sx={{ p: 0 }}>
          {displayedMessages.map((message, index) => (
            <React.Fragment key={message.id}>
              <ListItem 
                alignItems="flex-start"
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  px: 2,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                onClick={() => openConversation(message.userId)}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    color={message.online ? "success" : "default"}
                  >
                    <Avatar 
                      src={message.foto} 
                      alt={message.nome}
                      sx={{ 
                        width: 48, 
                        height: 48,
                        border: message.unread ? `2px solid` : 'none',
                        borderColor: message.unread ? 'info.main' : 'transparent'
                      }}
                    >
                      {message.nome?.[0]}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: message.unread ? 700 : 400 }}>
                        {message.nome}
                      </Typography>
                      <Typography variant="caption">
                        {formatMessageTime(message.timestamp)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      {message.unread && (
                        <CircleIcon 
                          sx={{ 
                            color: 'primary.main', 
                            fontSize: 10, 
                            mr: 0.5, 
                            flexShrink: 0 
                          }}
                        />
                      )}
                      <Typography 
                        variant="body2" 
                        color={message.unread ? 'text.primary' : 'text.secondary'}
                        sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontWeight: message.unread ? 500 : 400
                        }}
                      >
                        {message.sender === 'me' && 'Você: '}
                        {truncateMessage(message.content)}
                      </Typography>
                    </Box>
                  }
                />
                
                {message.unreadCount > 0 && (
                  <Chip 
                    label={message.unreadCount} 
                    color="primary" 
                    size="small"
                    sx={{ 
                      height: 22, 
                      minWidth: 22, 
                      fontSize: 12,
                      position: 'absolute',
                      right: 16,
                      bottom: 16
                    }}
                  />
                )}
              </ListItem>
              {index < displayedMessages.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
        
        {data.length > maxInitialMessages && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Button
              onClick={() => setShowAll(!showAll)}
              endIcon={showAll ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              sx={{ textTransform: 'none' }}
            >
              {showAll 
                ? 'Mostrar menos' 
                : `Ver mais ${hiddenCount} conversas`}
            </Button>
          </Box>
        )}
        
        <Box 
          sx={{ 
            p: 2, 
            bgcolor: 'primary.light', 
            display: 'flex', 
            justifyContent: 'center',
            borderRadius: '0 0 4px 4px'
          }}
        >
          <Button
            variant="contained"
            startIcon={<ChatIcon />}
            onClick={goToMessagesPage}
            sx={{ 
              borderRadius: 20,
              px: 3,
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              }
            }}
          >
            Nova conversa
          </Button>
        </Box>
      </Card>
    </Box>
  );
};