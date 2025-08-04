import React, { useEffect, useState, useMemo } from 'react';
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
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  useMediaQuery,
  useTheme,
  Fab,
  Paper,
  Button,
  alpha
} from '@mui/material';
import { 
  Search as SearchIcon,
  Add as AddIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  PeopleOutline as PeopleOutlineIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useMessages } from '../../providers/MessageProvider';
import { serviceLocator } from '../../core/services/BaseService';

const ConversationsList = () => {
  const navigate = useNavigate();
  const { uidDestinatario } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchText, setSearchText] = useState('');
  
  // Get state from store
  const authStore = serviceLocator.get('store').getState()?.auth || {};
  const connectionsStore = serviceLocator.get('store').getState()?.connections || {};
  
  // Get data from message provider
  const { 
    conversations, 
    messages,
    isLoading
  } = useMessages();
  
  const { currentUser } = authStore;
  const { friends = [] } = connectionsStore;
  
  // Helper function to optimize profile picture URLs
  const getOptimizedProfilePicture = (url) => {
    if (!url) return null;
    return url.includes('?') 
      ? `${url}&size=100` 
      : `${url}?size=100`;
  };

  // Helper function to truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Format time in a user-friendly way
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Less than a minute
    if (diff < 60000) {
      return 'now';
    }
    
    // Less than an hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m`;
    }
    
    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h`;
    }
    
    // Less than a week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d`;
    }
    
    // Format date for older messages
    return date.toLocaleDateString();
  };

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(5).fill(0).map((_, index) => (
      <ListItem key={`skeleton-${index}`} sx={{ py: 1.5 }}>
        <ListItemAvatar>
          <Box 
            sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '50%',
              bgcolor: 'action.hover'
            }} 
          />
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ width: '70%', height: 16, bgcolor: 'action.hover', borderRadius: 1, mb: 1 }} />
          }
          secondary={
            <Box sx={{ width: '40%', height: 12, bgcolor: 'action.hover', borderRadius: 1 }} />
          }
        />
      </ListItem>
    ));
  };

  // Process conversation data from providers
  const conversationData = useMemo(() => {
    // If no conversations, use friends as fallback
    if (!conversations || conversations.length === 0) {
      return friends.map(friend => {
        // Conversation ID
        const convId = [currentUser?.uid, friend.id].sort().join('_');
        
        // Check for existing messages
        const existingMessages = messages.filter(msg => 
          (msg.uidRemetente === currentUser?.uid && msg.uidDestinatario === friend.id) ||
          (msg.uidRemetente === friend.id && msg.uidDestinatario === currentUser?.uid)
        );
        
        // Get the most recent message
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
          // Count unread messages
          unreadCount: existingMessages.filter(msg => 
            msg.uidRemetente === friend.id && !msg.lido && !msg.visto
          ).length,
          // Online status - TODO: implementar status real do usuário
          isOnline: false
        };
      });
    }

    // Use conversation data
    return conversations.map(conv => {
      // Find friend data to enrich information
      const friend = friends.find(f => f.id === conv.otherUserId || f.id === conv.with);
      
      // Check for more recent messages
      const existingMessages = messages.filter(msg => 
        msg.conversationId === conv.id ||
        ((msg.uidRemetente === currentUser?.uid && msg.uidDestinatario === conv.otherUserId) ||
         (msg.uidRemetente === conv.otherUserId && msg.uidDestinatario === currentUser?.uid))
      );
      
      let lastMessage = conv.lastMessage;
      
      // If there are messages, check if any are more recent
      if (existingMessages.length > 0) {
        const sortedMessages = [...existingMessages].sort((a, b) => {
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        const convLastMessageTime = conv.lastMessage?.timestamp 
          ? new Date(conv.lastMessage.timestamp) 
          : new Date(0);
          
        const newestMessageTime = new Date(sortedMessages[0].timestamp);
        
        // If the newest message is more recent, use it
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
        otherUserName: conv.otherUserName || conv.withName || (friend ? friend.nome : 'User'),
        otherUserPhoto: conv.otherUserPhoto || conv.withPhoto || (friend ? friend.fotoDoPerfil : null),
        lastMessage,
        isOnline: friend?.online || false // Simplified
      };
    }).sort((a, b) => {
      // Sort by timestamp (most recent first)
      const timeA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const timeB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
      return timeB - timeA;
    });
  }, [conversations, friends, currentUser, messages]);

  // Filter conversations based on search
  const filteredConversations = useMemo(() => {
    if (!searchText) return conversationData;
    
    const searchLower = searchText.toLowerCase();
    return conversationData.filter(conv => 
      conv.otherUserName.toLowerCase().includes(searchLower) || 
      (conv.lastMessage?.text && conv.lastMessage.text.toLowerCase().includes(searchLower))
    );
  }, [conversationData, searchText]);

  // Render header
  const renderHeader = () => (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.95)} 0%, 
          ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
        backdropFilter: 'blur(20px)',
        color: 'text.primary',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56 }, px: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Conversations
        </Typography>
        <IconButton color="primary" size="medium">
          <SettingsIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );

  // Render search bar
  const renderSearchBar = () => (
    <Box sx={{ 
      p: 1, 
      position: 'sticky', 
      top: 0, 
      zIndex: 10, 
      background: `linear-gradient(180deg, 
        ${alpha(theme.palette.background.paper, 0.95)} 0%, 
        ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
      backdropFilter: 'blur(10px)'
    }}>
      <Paper
        elevation={0}
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: 20,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.8)} 0%, 
            ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
          transition: 'all 0.3s ease',
          '&:focus-within': {
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.background.paper, 0.95)} 0%, 
              ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
            borderColor: alpha(theme.palette.primary.main, 0.5),
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
          }
        }}
      >
        <IconButton sx={{ p: '10px', color: 'action.active' }}>
          <SearchIcon />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search conversations..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        {searchText && (
          <IconButton 
            sx={{ p: '10px' }} 
            onClick={() => setSearchText('')}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Paper>
    </Box>
  );

  // Render new message button (mobile only)
  const renderFloatingButton = () => {
    if (!isMobile) return null;
    
    return (
      <Fab
        color="primary"
        aria-label="New message"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000
        }}
        onClick={() => navigate('/connections')}
      >
        <MessageIcon />
      </Fab>
    );
  };

  // Main structure
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      height: isMobile ? '100%' : '80vh',
      width: '100%',
      background: 'transparent'
    }}>
      {/* Header */}
      {renderHeader()}
      
      {/* Search bar */}
      {renderSearchBar()}
      
      {/* Conversation list */}
      <List sx={{ 
        overflow: 'auto', 
        flexGrow: 1,
        pb: isMobile ? 8 : 0 // Space for floating button on mobile
      }}>
        {isLoading ? (
          renderSkeletons()
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map(conversation => {
            // Target ID for navigation and selection
            const targetId = conversation.otherUserId;
            const isSelected = targetId === uidDestinatario;
            const unreadCount = conversation.unreadCount || 0;
            
            return (
              <React.Fragment key={conversation.id}>
                <ListItem 
                  onClick={() => navigate(`/messages/${targetId}`)}
                  selected={isSelected}
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2,
                    my: 0.5,
                    mx: 0.5,
                    background: isSelected 
                      ? `linear-gradient(135deg, 
                          ${alpha(theme.palette.primary.main, 0.2)} 0%, 
                          ${alpha(theme.palette.primary.main, 0.1)} 100%)`
                      : 'transparent',
                    backdropFilter: isSelected ? 'blur(10px)' : 'none',
                    border: isSelected 
                      ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                      : `1px solid transparent`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'translateX(0)',
                    '&.Mui-selected': {
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.primary.main, 0.25)} 0%, 
                        ${alpha(theme.palette.primary.main, 0.15)} 100%)`,
                      backdropFilter: 'blur(15px)',
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                      '&:hover': {
                        background: `linear-gradient(135deg, 
                          ${alpha(theme.palette.primary.main, 0.3)} 0%, 
                          ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
                        transform: 'translateX(4px) translateY(-2px)',
                        boxShadow: `0 6px 25px ${alpha(theme.palette.primary.main, 0.25)}`
                      }
                    },
                    '&:hover': {
                      background: !isSelected 
                        ? `linear-gradient(135deg, 
                            ${alpha(theme.palette.action.hover, 0.8)} 0%, 
                            ${alpha(theme.palette.action.hover, 0.6)} 100%)`
                        : undefined,
                      backdropFilter: 'blur(10px)',
                      transform: 'translateX(4px) translateY(-1px)',
                      boxShadow: `0 4px 15px ${alpha(theme.palette.common.black, 0.1)}`,
                      cursor: 'pointer',
                      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Badge 
                      badgeContent={unreadCount} 
                      color="primary"
                      invisible={unreadCount === 0}
                      overlap="circular"
                    >
                      <Box sx={{ position: 'relative' }}>
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
                        
                        {/* Status indicator */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: conversation.isOnline ? 'success.main' : 'text.disabled',
                            border: '2px solid',
                            borderColor: 'background.paper'
                          }}
                        />
                      </Box>
                    </Badge>
                  </ListItemAvatar>
                  
                  <ListItemText 
                    primaryTypographyProps={{
                      sx: { 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center'
                      }
                    }}
                    primary={
                      <>
                        <span
                          style={{
                            fontWeight: unreadCount > 0 ? 'bold' : 'normal',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {conversation.otherUserName}
                        </span>
                        
                        {conversation.lastMessage?.timestamp && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: 'gray'
                            }}
                          >
                            {formatTimeAgo(conversation.lastMessage.timestamp)}
                          </span>
                        )}
                      </>
                    }
                    secondaryTypographyProps={{
                      component: 'div'
                    }}
                    secondary={
                      <>
                        <span
                          style={{
                            fontSize: '0.875rem',
                            color: unreadCount > 0 ? 'inherit' : 'gray',
                            fontWeight: unreadCount > 0 ? '500' : 'normal',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block'
                          }}
                        >
                          {conversation.lastMessage?.text ? 
                            truncateText(conversation.lastMessage.text, 30) : 
                            'No messages yet'}
                        </span>
                        
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: conversation.isOnline ? 'green' : 'gray',
                            display: 'block',
                            marginTop: '4px'
                          }}
                        >
                          {conversation.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
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
            height: '100%'
          }}>
            {searchText ? (
              <>
                <Typography 
                  variant="body1"
                  color="text.secondary"
                  align="center"
                  sx={{ mb: 2 }}
                >
                  No results found for "{searchText}"
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => setSearchText('')}
                >
                  Clear search
                </Button>
              </>
            ) : (
              <>
                <PeopleOutlineIcon 
                  sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} 
                />
                <Typography 
                  variant="h6"
                  align="center"
                  gutterBottom
                >
                  No conversations yet
                </Typography>
                <Typography 
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mb: 2 }}
                >
                  Start messaging your friends to begin conversations.
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<PeopleOutlineIcon />}
                  onClick={() => navigate('/connections')}
                >
                  Find friends
                </Button>
              </>
            )}
          </Box>
        )}
      </List>

      {/* Floating action button (mobile only) */}
      {renderFloatingButton()}
    </Box>
  );
};

export default ConversationsList;