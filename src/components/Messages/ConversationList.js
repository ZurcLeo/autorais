// ConversationList.js - Versão Otimizada com Atualização Automática
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Typography, 
  Badge, 
  Skeleton, 
  Divider 
} from '@mui/material';
import { useMessages } from '../../providers/MessageProvider';
import { serviceLocator } from '../../core/services/BaseService';

const ConversationsList = () => {
  const navigate = useNavigate();
  const { uidDestinatario } = useParams();
  
  // Obter estado do store (sem implementar lógica duplicada)
  const authStore = serviceLocator.get('store').getState()?.auth || {};
  const connectionsStore = serviceLocator.get('store').getState()?.connections || {};
  
  // Obter dados do provider de mensagens centralizado
  const { 
    conversations, 
    messages,
    isLoading,
    activeChat
  } = useMessages();
  
  const { currentUser } = authStore;
  const { friends } = connectionsStore;
    
  // Função auxiliar para otimizar URLs de imagens
  const getOptimizedProfilePicture = (url) => {
    if (!url) return null;
    return url.includes('?') 
      ? `${url}&size=100` 
      : `${url}?size=100`;
  };

  // Função auxiliar para truncar texto
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Formatar data de forma mais amigável
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Menos de um minuto
    if (diff < 60000) {
      return 'agora';
    }
    
    // Menos de uma hora
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m atrás`;
    }
    
    // Menos de um dia
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h atrás`;
    }
    
    // Menos de uma semana
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d atrás`;
    }
    
    // Formato de data padrão
    return date.toLocaleDateString();
  };

  // Renderizar esqueletos de carregamento
  const renderSkeletons = () => {
    return Array(5).fill(0).map((_, index) => (
      <ListItem key={`skeleton-${index}`}>
        <ListItemAvatar>
          <Skeleton variant="circular" width={40} height={40} />
        </ListItemAvatar>
        <ListItemText
          primary={<Skeleton width="70%" />}
          secondary={<Skeleton width="40%" />}
        />
      </ListItem>
    ));
  };

  // Este é o useMemo otimizado que agora procurará mensagens existentes
  // quando as conversações não tiverem informações completas
  const conversationData = React.useMemo(() => {
    // Se não temos dados de conversas, usar amigos como fallback
    if (!conversations || conversations.length === 0) {
      return friends.map(friend => {
        // ID da conversa
        const convId = [currentUser?.uid, friend.id].sort().join('_');
        
        // Importante: Verificar se existem mensagens entre estes usuários,
        // mesmo que a conversa não esteja listada
        const existingMessages = messages.filter(msg => 
          (msg.uidRemetente === currentUser?.uid && msg.uidDestinatario === friend.id) ||
          (msg.uidRemetente === friend.id && msg.uidDestinatario === currentUser?.uid)
        );
        
        // Ordenar por timestamp e pegar a mais recente (se existir)
        let lastMessage = null;
        if (existingMessages.length > 0) {
          const sortedMessages = [...existingMessages].sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
          });
          
          lastMessage = {
            text: sortedMessages[0].conteudo || sortedMessages[0].content,
            sender: sortedMessages[0].uidRemetente,
            timestamp: sortedMessages[0].timestamp
          };
        }
        
        return {
          id: convId,
          otherUserId: friend.id,
          otherUserName: friend.nome,
          otherUserPhoto: friend.fotoDoPerfil,
          lastMessage: lastMessage || {
            text: '',
            timestamp: null
          },
          // Contar mensagens não lidas
          unreadCount: existingMessages.filter(msg => 
            msg.uidRemetente === friend.id && !msg.lido && !msg.visto
          ).length
        };
      });
    }

    // Caso contrário, usar dados das conversas e enriquecer com dados mais recentes
    return conversations.map(conv => {
      // Encontrar dados do amigo para enriquecer informações
      const friend = friends.find(f => f.id === conv.otherUserId || f.id === conv.with);
      
      // Verificar se temos mensagens mais recentes que as informadas pela conversa
      const existingMessages = messages.filter(msg => 
        msg.conversationId === conv.id ||
        ((msg.uidRemetente === currentUser?.uid && msg.uidDestinatario === conv.otherUserId) ||
         (msg.uidRemetente === conv.otherUserId && msg.uidDestinatario === currentUser?.uid))
      );
      
      let lastMessage = conv.lastMessage;
      
      // Se houver mensagens, verificar se alguma é mais recente que a última conhecida
      if (existingMessages.length > 0) {
        const sortedMessages = [...existingMessages].sort((a, b) => {
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        const convLastMessageTime = conv.lastMessage?.timestamp 
          ? new Date(conv.lastMessage.timestamp) 
          : new Date(0);
          
        const newestMessageTime = new Date(sortedMessages[0].timestamp);
        
        // Se a mensagem mais recente for mais nova que a da conversa, usá-la
        if (newestMessageTime > convLastMessageTime) {
          lastMessage = {
            text: sortedMessages[0].conteudo || sortedMessages[0].content,
            sender: sortedMessages[0].uidRemetente,
            timestamp: sortedMessages[0].timestamp
          };
        }
      }
      
      return {
        ...conv,
        otherUserId: conv.otherUserId || conv.with,
        otherUserName: conv.otherUserName || conv.withName || (friend ? friend.nome : 'Usuário'),
        otherUserPhoto: conv.otherUserPhoto || conv.withPhoto || (friend ? friend.fotoDoPerfil : null),
        lastMessage
      };
    }).sort((a, b) => {
      // Ordenar por timestamp da última mensagem (mais recentes primeiro)
      const timeA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const timeB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
      return timeB - timeA;
    });
  }, [conversations, friends, currentUser, messages]);

  return (
    <Box sx={{ 
      width: 300, 
      borderRight: 1, 
      borderColor: 'divider', 
      height: '100vh',
      backgroundColor: 'background.paper'
    }}>
      <Typography variant="h6" sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        fontWeight: 'medium'
      }}>
        Conversas
      </Typography>
      
      <List sx={{ 
        overflow: 'auto', 
        maxHeight: 'calc(100vh - 64px)',
        '& .MuiListItem-root:hover': {
          backgroundColor: 'action.hover',
          cursor: 'pointer'
        }
      }}>
        {isLoading ? (
          renderSkeletons()
        ) : conversationData.length > 0 ? (
          conversationData.map(conversation => {
            // Determinar ID de destino para a navegação e seleção
            const targetId = conversation.otherUserId;
            const isSelected = targetId === uidDestinatario;
            const unreadCount = conversation.unreadCount || 0;
            
            return (
              <React.Fragment key={conversation.id}>
                <ListItem 
                  onClick={() => navigate(`/messages/${targetId}`)}
                  selected={isSelected}
                  sx={{ 
                    bgcolor: isSelected ? 'action.selected' : 'inherit',
                    py: 1.5
                  }}
                >
                  <ListItemAvatar>
                    <Badge 
                      badgeContent={unreadCount} 
                      color="primary"
                      invisible={unreadCount === 0}
                      overlap="circular"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.7rem',
                          height: 20,
                          minWidth: 20,
                          fontWeight: 'bold'
                        }
                      }}
                    >
                      <Avatar 
                        src={getOptimizedProfilePicture(conversation.otherUserPhoto)}
                        sx={{
                          width: 48,
                          height: 48,
                          border: isSelected ? '2px solid' : 'none',
                          borderColor: 'primary.main'
                        }}
                      >
                        {conversation.otherUserName ? conversation.otherUserName[0].toUpperCase() : '?'}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center'
                      }}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: unreadCount > 0 ? 'bold' : 'normal',
                            color: unreadCount > 0 ? 'text.primary' : 'inherit'
                          }}
                          noWrap
                        >
                          {conversation.otherUserName}
                        </Typography>
                        {conversation.lastMessage?.timestamp && (
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ fontSize: '0.7rem' }}
                          >
                            {formatTimeAgo(conversation.lastMessage.timestamp)}
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        noWrap
                        sx={{ 
                          fontWeight: unreadCount > 0 ? 'medium' : 'normal',
                          color: unreadCount > 0 ? 'text.primary' : 'inherit',
                          fontSize: '0.85rem'
                        }}
                      >
                        {conversation.lastMessage?.text ? 
                          truncateText(conversation.lastMessage.text, 30) : 
                          'Nenhuma mensagem'}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider component="li" variant="inset" />
              </React.Fragment>
            );
          })
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 3,
            height: 'calc(100vh - 200px)'
          }}>
            <Typography 
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ fontStyle: 'italic', mb: 2 }}
            >
              Nenhuma conversa encontrada.
            </Typography>
            <Typography 
              variant="body2"
              color="text.secondary"
              align="center"
            >
              Comece a enviar mensagens para seus amigos para iniciar conversas.
            </Typography>
          </Box>
        )}
      </List>
    </Box>
  );
};

export default ConversationsList;