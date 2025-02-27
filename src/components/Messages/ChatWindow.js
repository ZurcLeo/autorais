import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, TextField, Typography, Avatar, Paper, IconButton } from '@mui/material';
import { Send as SendIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/_AuthContext';
import { useMessages } from '../../context/MessageContext';
import { useConnections } from '../../context/ConnectionContext';
import { showToast } from '../../utils/toastUtils';

const getOptimizedProfilePicture = (url) => {
  if (!url) return null;
  return url.includes('?') 
    ? `${url}&size=100` 
    : `${url}?size=100`;
};

const MessageBubble = ({ message, isOwnMessage }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
      mb: 2,
    }}
  >
    {!isOwnMessage && (
      <Avatar sx={{ mr: 1 }}>
        {message.uidRemetente ? message.uidRemetente[0] : '?'}
      </Avatar>
    )}
    <Paper
      elevation={1}
      sx={{
        p: 1,
        maxWidth: '70%',
        backgroundColor: isOwnMessage ? 'primary.light' : 'background.paper',
        color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
      }}
    >
      <Typography variant="body2">{message.conteudo}</Typography>
      <Typography variant="caption" display="block" sx={{ mt: 0.5, textAlign: 'right' }}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Typography>
    </Paper>
  </Box>
);

const ChatWindow = () => {
  const { t } = useTranslation();
  const { uidDestinatario } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;
  const { messages, createMessage, markMessagesAsRead } = useMessages();
  const { friends } = useConnections();
  const [message, setMessage] = useState('');
  const chatEndRef = useRef(null);

  // Encontra o amigo atual usando o parâmetro da URL
  const friend = friends.find(f => f.id === uidDestinatario);

  // Filtra as mensagens para a conversa atual
  const chatHistory = React.useMemo(() => {
    return messages.filter(msg => 
      (msg.uidRemetente === userId && msg.uidDestinatario === uidDestinatario) ||
      (msg.uidRemetente === uidDestinatario && msg.uidDestinatario === userId)
    ).sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, userId, uidDestinatario]);

  // Marca mensagens como lidas quando visualizadas
  useEffect(() => {
    if (uidDestinatario) {
      const unreadMessages = chatHistory.filter(
        msg => !msg.lido && msg.uidRemetente === uidDestinatario
      );
      if (unreadMessages.length > 0) {
        markMessagesAsRead(unreadMessages.map(msg => msg.id));
      }
    }
  }, [chatHistory, uidDestinatario, markMessagesAsRead]);

// No componente que envia mensagens (ex: ChatWindow.js)
const handleSendMessage = async () => {
  if (!message.trim() || !currentUser?.uid || !uidDestinatario) return;

  try {
    const messageData = {
      conteudo: message.trim(),
      uidDestinatario,
      tipo: 'texto'
    };

    await createMessage(messageData);
    setMessage('');
    
  } catch (error) {
    console.error('Erro detalhado ao enviar mensagem:', error);
    
    // Feedback mais específico ao usuário
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Não foi possível enviar a mensagem. Tente novamente.';
    
    showToast(errorMessage, { 
      type: 'error',
      duration: 5000,
      action: {
        label: 'Tentar Novamente',
        onClick: () => handleSendMessage()
      }
    });
  }
};

const handleKeyPress = useCallback((event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSendMessage();
  }
}, [message, currentUser, uidDestinatario]); 

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  if (!friend) {
    return null;
  }

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column'
    }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        borderBottom: 1, 
        borderColor: 'divider' 
      }}>
        <IconButton 
          onClick={() => navigate('/chat')} 
          sx={{ display: { sm: 'none' } }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Avatar src={getOptimizedProfilePicture(friend.fotoDoPerfil)} sx={{ mr: 2 }}>{friend.nome[0]}</Avatar>
        <Typography variant="h6">{friend.nome}</Typography>
      </Box>

      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        p: 2,
        bgcolor: 'background.default' 
      }}>
        {chatHistory.map((msg, index) => (
          <MessageBubble 
            key={index} 
            message={msg} 
            isOwnMessage={msg.uidRemetente === userId} 
          />
        ))}
        <div ref={chatEndRef} />
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('chatWindow.typeYourMessage')}
          variant="outlined"
          InputProps={{
            endAdornment: (
              <IconButton 
                onClick={handleSendMessage} 
                disabled={!message.trim()}
                color="primary"
              >
                <SendIcon />
              </IconButton>
            ),
          }}
        />
      </Box>
    </Box>
  );
};

export default ChatWindow;