// src/components/Messages/ChatWindow.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Avatar, 
  Paper, 
  IconButton, 
  Button,
  CircularProgress,
  Badge,
  Tooltip,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  DeleteOutline as DeleteIcon,
  InfoOutlined as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useMessages } from '../../providers/MessageProvider';
import { serviceLocator } from '../../core/services/BaseService';
import ModernChatInput from './ModernChatInput';
import SupportButton from '../Support/SupportButton';
import EscalationStatus from '../Support/EscalationStatus';

/**
 * Helper function to optimize profile picture URLs
 * @param {string} url - Original profile picture URL
 * @returns {string|null} - Optimized URL or null if input is falsy
 */
const getOptimizedProfilePicture = (url) => {
  if (!url) return null;
  return url.includes('?') ? `${url}&size=100` : `${url}?size=100`;
};

/**
 * Typing indicator component
 * Memoized to prevent unnecessary re-renders
 */
const TypingIndicator = React.memo(({ isTyping, userName }) => {
  const theme = useTheme();
  
  if (!isTyping) return null;
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      pl: 2, 
      pb: 1,
      opacity: 0.8
    }}>
      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ 
          fontStyle: 'italic',
          color: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.7) : alpha(theme.palette.common.black, 0.7)
        }}
      >
        {userName} está digitando
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        ml: 1,
        '& .typing-dot': {
          width: '4px',
          height: '4px',
          margin: '0 1px',
          backgroundColor: 'primary.main',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'typingAnimation 1.4s infinite ease-in-out both',
        },
        '@keyframes typingAnimation': {
          '0%, 80%, 100%': {
            transform: 'scale(0)',
            opacity: 0.2
          },
          '40%': {
            transform: 'scale(1)',
            opacity: 1
          }
        }
      }}>
        <span className="typing-dot" style={{ animationDelay: '0s' }}></span>
        <span className="typing-dot" style={{ animationDelay: '0.2s' }}></span>
        <span className="typing-dot" style={{ animationDelay: '0.4s' }}></span>
      </Box>
    </Box>
  );
});

/**
 * Message bubble component
 * Memoized to prevent unnecessary re-renders
 */
const MessageBubble = React.memo(({ message, isOwnMessage, senderName, avatar, onDelete }) => {
  const theme = useTheme();
  
  const handleDeleteClick = useCallback(() => {
    onDelete && onDelete(message.id);
  }, [onDelete, message.id]);
  
  // Helper function to get status icon
  const getStatusIcon = () => {
    if (!isOwnMessage) return null;
    
    if (message.visto || message.status?.read) return '✓✓';
    if (message.entregue || message.status?.delivered) return '✓';
    return '⌛';
  };
  
  // Determine message content based on deletion status
  const messageContent = message.deleted ? (
    <Typography 
      variant="body2" 
      sx={{ 
        fontStyle: 'italic', 
        opacity: 0.7,
        color: theme.palette.text.secondary
      }}
    >
      Esta mensagem foi apagada
    </Typography>
  ) : (
    <Typography variant="body2">
      {message.conteudo || message.content}
    </Typography>
  );
  
  // Message timestamp
  const messageTime = message.timestamp ? 
    new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
    '';
  
  // Calculate background and text colors with glassmorphism
  const bubbleBgColor = isOwnMessage 
    ? `linear-gradient(135deg, 
        ${alpha(theme.palette.primary.main, 0.8)} 0%, 
        ${alpha(theme.palette.primary.main, 0.6)} 100%)`
    : `linear-gradient(135deg, 
        ${alpha(theme.palette.background.paper, 0.9)} 0%, 
        ${alpha(theme.palette.background.paper, 0.7)} 100%)`;
    
  const bubbleTextColor = isOwnMessage 
    ? (theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.primary.dark) 
    : theme.palette.text.primary;
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 2,
        mx: 1,
      }}
    >
      {!isOwnMessage && (
        <Avatar 
          src={avatar} 
          sx={{ 
            width: 36, 
            height: 36, 
            mr: 1,
            mt: 0.5,
            bgcolor: theme.palette.primary.light
          }}
        >
          {senderName ? senderName[0] : '?'}
        </Avatar>
      )}
      
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          px: 2,
          maxWidth: '70%',
          background: bubbleBgColor,
          backdropFilter: 'blur(15px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          color: bubbleTextColor,
          position: 'relative',
          borderRadius: isOwnMessage ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
          opacity: message.deleted ? 0.7 : 1,
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: 'translateY(0)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 6px 25px ${alpha(theme.palette.common.black, 0.15)}`,
            '& .message-actions': {
              opacity: 1,
              transform: 'translateX(0)',
              pointerEvents: 'auto'
            }
          }
        }}
      >
        {messageContent}
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          mt: 0.5,
          opacity: 0.7
        }}>
          <Typography 
            variant="caption" 
            color={isOwnMessage ? 'inherit' : 'text.secondary'} 
            sx={{ 
              fontSize: '0.65rem',
              mr: 0.5,
              opacity: 0.8 
            }}
          >
            {messageTime}
          </Typography>
          
          <Typography 
            variant="caption" 
            color={isOwnMessage ? 'inherit' : 'text.secondary'} 
            sx={{ 
              fontSize: '0.65rem',
              opacity: 0.9
            }}
          >
            {getStatusIcon()}
          </Typography>
        </Box>
        
        {/* Message actions menu */}
        {isOwnMessage && !message.deleted && (
          <IconButton 
            size="small"
            onClick={handleDeleteClick}
            className="message-actions"
            sx={{ 
              position: 'absolute',
              top: -10,
              right: -10,
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[2],
              color: theme.palette.error.main,
              opacity: 0,
              transform: 'translateX(10px)',
              transition: 'all 0.2s ease-in-out',
              pointerEvents: 'none',
              '&:hover': {
                backgroundColor: theme.palette.error.main,
                color: theme.palette.common.white
              }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Paper>
    </Box>
  );
});

/**
 * Empty state component
 */
const EmptyChatState = React.memo(({ friendName }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexGrow: 1,
      p: 3,
      opacity: 0.8
    }}>
      <Box sx={{ 
        width: 120, 
        height: 120, 
        borderRadius: '50%', 
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 2
      }}>
        <img 
          src="/assets/images/empty-chat.svg" 
          alt="Chat vazio" 
          width={60} 
          height={60}
          style={{ opacity: 0.7 }}
        />
      </Box>
      <Typography 
        variant="h6" 
        align="center" 
        color="text.secondary"
        sx={{ fontWeight: 'medium' }}
      >
        Nenhuma mensagem ainda
      </Typography>
      <Typography 
        variant="body2" 
        align="center" 
        color="text.secondary"
        sx={{ maxWidth: 300, mt: 1 }}
      >
        Diga olá para {friendName} e comece uma conversa!
      </Typography>
    </Box>
  );
});

/**
 * Date separator component
 */
const DateSeparator = React.memo(({ date }) => {
  const theme = useTheme();
  
  // Format date as "DD de Mês de AAAA" or "Hoje" or "Ontem"
  const formatDate = (dateString) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return messageDate.toLocaleDateString('pt-BR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    }
  };
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        my: 2 
      }}
    >
      <Divider sx={{ flexGrow: 1 }} />
      <Typography 
        variant="caption" 
        component="span" 
        sx={{ 
          mx: 2, 
          px: 1.5,
          py: 0.5,
          borderRadius: 10,
          backgroundColor: alpha(theme.palette.divider, 0.1),
          color: theme.palette.text.secondary,
          fontWeight: 'medium',
          fontSize: '0.7rem',
          textTransform: 'uppercase'
        }}
      >
        {formatDate(date)}
      </Typography>
      <Divider sx={{ flexGrow: 1 }} />
    </Box>
  );
});

/**
 * Main ChatWindow component
 */
const ChatWindow = ({ uidDestinatarioProps, friendName: propsFriendName }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Services and state
  const authStore = serviceLocator.get('store').getState()?.auth || {};
  const connectionsStore = serviceLocator.get('store').getState()?.connections || {};
  
  const { currentUser } = authStore;
  const userId = currentUser?.uid;
  const { friends } = connectionsStore;

  // Messages provider
  const { 
    messages, 
    activeChat,
    typingStatus, 
    fetchMessages, 
    createMessage, 
    deleteMessage,
    setActiveChat,
    updateTypingStatus,
    isLoading: messagesLoading
  } = useMessages();
  
  // Local state
  const [isLocalTyping, setIsLocalTyping] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  // Route params
  const { uidDestinatario: uidDestinatarioURL } = useParams();
  const uidDestinatario = uidDestinatarioProps || uidDestinatarioURL;
  
  // Memoize conversation ID
  const conversationId = useMemo(() => {
    if (!userId || !uidDestinatario) return null;
    return [userId, uidDestinatario].sort().join('_');
  }, [userId, uidDestinatario]);

  // Find friend data
  const friend = useMemo(() => {
    return friends.find(f => f.id === uidDestinatario);
  }, [friends, uidDestinatario]);
  
  // Get friend name from props or data
  const friendName = propsFriendName || (friend ? friend.nome : 'Contato');
  
  // Check remote typing status
  const remoteTyping = useMemo(() => {
    if (!conversationId || !uidDestinatario) return false;
    return typingStatus?.[conversationId]?.[uidDestinatario] || false;
  }, [conversationId, uidDestinatario, typingStatus]);
  
  // Set active chat when recipient changes
  useEffect(() => {
    if (conversationId) {
      setActiveChat(conversationId);
    }
    
    // Cleanup typing status when unmounting
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      
      if (isLocalTyping && conversationId) {
        updateTypingStatus(conversationId, false);
        setIsLocalTyping(false);
      }
    };
  }, [conversationId, setActiveChat, updateTypingStatus, isLocalTyping]);
  
  // Fetch messages when conversation changes
  useEffect(() => {
    if (userId && uidDestinatario && conversationId) {
      fetchMessages(uidDestinatario);
    }
  }, [userId, uidDestinatario, conversationId, fetchMessages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);
  
  // Filter messages for current conversation
  const chatHistory = useMemo(() => {
    if (!conversationId || !Array.isArray(messages) || messages.length === 0) return [];
    
    return messages
      .filter(msg => {
        // Check by conversationId
        if (msg.conversationId === conversationId) return true;
        
        // Check by sender/recipient
        return (
          (msg.uidRemetente === userId && msg.uidDestinatario === uidDestinatario) ||
          (msg.uidRemetente === uidDestinatario && msg.uidDestinatario === userId)
        );
      })
      .sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeA - timeB;
      });
  }, [messages, conversationId, userId, uidDestinatario]);
  
  // Group messages by date for display
  const groupedMessages = useMemo(() => {
    if (!chatHistory.length) return [];
    
    const groups = [];
    let currentDate = null;
    let currentGroup = null;
    
    chatHistory.forEach(message => {
      // Get date string without time
      const messageDate = new Date(message.timestamp);
      const dateString = messageDate.toISOString().split('T')[0];
      
      // If this is a new date, create a new group
      if (dateString !== currentDate) {
        currentDate = dateString;
        currentGroup = { date: messageDate, messages: [] };
        groups.push(currentGroup);
      }
      
      // Add message to current group
      currentGroup.messages.push(message);
    });
    
    return groups;
  }, [chatHistory]);
  
  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    } else if (conversationId) {
      setIsLocalTyping(true);
      updateTypingStatus(conversationId, true);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (conversationId) {
        setIsLocalTyping(false);
        updateTypingStatus(conversationId, false);
      }
      typingTimeoutRef.current = null;
    }, 2000);
  }, [conversationId, updateTypingStatus]);
  
  // Send message handler
  const handleSendMessage = useCallback(async (messageData) => {
    if (!currentUser?.uid || !uidDestinatario) {
      console.error('Destinatário inválido');
      return;
    }
    
    try {
      // Adapt message format
      const adaptedMessage = {
        conteudo: messageData.text,
        uidDestinatario,
        tipo: messageData.attachments.length > 0 ? 'media' : 'texto',
        anexos: messageData.attachments
      };
      
      // Send message using provider
      await createMessage(adaptedMessage);
      
      // Reset typing status
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      
      if (conversationId) {
        setIsLocalTyping(false);
        updateTypingStatus(conversationId, false);
      }
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  }, [uidDestinatario, createMessage, currentUser, conversationId, updateTypingStatus]);
  
  // Delete message handler
  const handleDeleteMessage = useCallback(async (messageId) => {
    if (!conversationId || !messageId) return;
    
    try {
      await deleteMessage(conversationId, messageId);
    } catch (error) {
      console.error('Erro ao apagar mensagem:', error);
    }
  }, [conversationId, deleteMessage]);
  
  // Toggle chat info panel
  const toggleInfo = useCallback(() => {
    setShowInfo(prev => !prev);
  }, []);
  
  // Redirect if no recipient
  if (!uidDestinatario) {
    return <Navigate to="/messages" />;
  }
  
  // Render friend-not-found state
  if (!friend && uidDestinatario) {
    return (
      <Box sx={{ 
        height: '100%',
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3
      }}>
        <Paper
          elevation={1}
          sx={{
            p: 4,
            maxWidth: 400,
            borderRadius: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Contato não encontrado
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Não conseguimos encontrar este contato. Ele pode ter sido removido ou você não tem mais acesso.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/messages')}
            sx={{ mt: 2 }}
          >
            Voltar para conversas
          </Button>
        </Paper>
      </Box>
    );
  }
  
  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex', 
      flexDirection: 'column',
      background: `linear-gradient(180deg, 
        ${alpha(theme.palette.background.default, 0.95)} 0%, 
        ${alpha(theme.palette.background.default, 0.85)} 100%)`,
      backdropFilter: 'blur(20px)',
      position: 'relative'
    }}>
      {/* Chat header */}
      <Box sx={{ 
        px: 2,
        py: 1.5,
        display: 'flex', 
        alignItems: 'center', 
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.95)} 0%, 
          ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
        backdropFilter: 'blur(20px)',
        boxShadow: `0 2px 20px ${alpha(theme.palette.common.black, 0.1)}`
      }}>
        <IconButton 
          onClick={() => navigate('/messages')} 
          sx={{ display: { sm: 'none' }, mr: 1 }}
          aria-label="Voltar para conversas"
        >
          <ArrowBackIcon />
        </IconButton>
        
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: friend?.online ? 'success.main' : 'text.disabled',
                border: `2px solid ${theme.palette.background.paper}`
              }}
            />
          }
        >
          <Avatar 
            src={friend ? getOptimizedProfilePicture(friend.fotoDoPerfil) : null} 
            sx={{ 
              width: 42, 
              height: 42,
              bgcolor: theme.palette.primary.main
            }}
          >
            {friend && friend.nome ? friend.nome[0] : '?'}
          </Avatar>
        </Badge>
        
        <Box sx={{ ml: 2, flexGrow: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium', lineHeight: 1.2 }}>
            {friend ? friend.nome : 'Carregando...'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {friend && friend.online ? 'Online' : 'Offline'}
          </Typography>
        </Box>
        
        <Tooltip title="Informações do contato">
          <IconButton onClick={toggleInfo} color={showInfo ? 'primary' : 'default'}>
            <InfoIcon />
          </IconButton>
        </Tooltip>
        
        <SupportButton 
          conversationId={conversationId}
          variant="icon"
          size="small"
        />
        
        <Tooltip title="Mais opções">
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Escalation Status */}
      <EscalationStatus 
        conversationId={conversationId}
        variant="banner"
        dismissible={true}
      />

      {/* Main chat area with messages */}
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {messagesLoading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}>
            <CircularProgress size={40} color="primary" />
          </Box>
        ) : !groupedMessages.length ? (
          <EmptyChatState friendName={friendName} />
        ) : (
          groupedMessages.map((group, groupIndex) => (
            <React.Fragment key={`group-${groupIndex}`}>
              <DateSeparator date={group.date} />
              
              {group.messages.map((msg, msgIndex) => {
                const isOwnMessage = (msg.uidRemetente === userId) || (msg.sender === userId);
                return (
                  <MessageBubble 
                    key={msg.id || `${groupIndex}-${msgIndex}`} 
                    message={msg} 
                    isOwnMessage={isOwnMessage}
                    senderName={friend ? friend.nome : ''}
                    avatar={getOptimizedProfilePicture(friend?.fotoDoPerfil)}
                    onDelete={isOwnMessage ? handleDeleteMessage : null}
                  />
                );
              })}
            </React.Fragment>
          ))
        )}
        
        <TypingIndicator isTyping={remoteTyping} userName={friendName} />
        <div ref={chatEndRef} />
      </Box>

      {/* Friend info panel (sliding from right) */}
      {showInfo && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 320,
            height: '100%',
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.background.paper, 0.95)} 0%, 
              ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
            backdropFilter: 'blur(25px)',
            borderLeft: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            boxShadow: `0 0 40px ${alpha(theme.palette.common.black, 0.2)}`,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease-in-out',
            transform: showInfo ? 'translateX(0)' : 'translateX(100%)'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="subtitle1" fontWeight="medium">
              Informações do contato
            </Typography>
            <IconButton onClick={toggleInfo}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={friend ? getOptimizedProfilePicture(friend.fotoDoPerfil) : null}
              sx={{ width: 100, height: 100, mb: 2 }}
            >
              {friend && friend.nome ? friend.nome[0] : '?'}
            </Avatar>
            
            <Typography variant="h6">{friend ? friend.nome : 'Carregando...'}</Typography>
            
            {friend?.email && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {friend.email}
              </Typography>
            )}
            
            <Box sx={{ mt: 4, width: '100%' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Informações adicionais
              </Typography>
              
              <Paper
                variant="outlined"
                sx={{ p: 2, borderRadius: 1, mt: 1 }}
              >
                <Typography variant="body2">
                  {friend?.descricao || 'Nenhuma descrição disponível.'}
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Box>
      )}

      {/* Input area */}
      <Box sx={{ 
        p: 2, 
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.95)} 0%, 
          ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
        backdropFilter: 'blur(20px)',
        boxShadow: `0 -2px 20px ${alpha(theme.palette.common.black, 0.1)}`
      }}>
        <ModernChatInput
          friendName={friendName}
          onSendMessage={handleSendMessage}
          isTyping={remoteTyping}
          disabled={!uidDestinatario || !currentUser?.uid}
          onTyping={handleTyping}
          mentions={friends.map(friend => ({
            id: friend.id,
            name: friend.nome,
            avatar: getOptimizedProfilePicture(friend.fotoDoPerfil)
          }))}
        />
      </Box>
    </Box>
  );
};

export default ChatWindow;