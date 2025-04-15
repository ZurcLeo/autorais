// ChatWindow.js - Com Integração de Status Online
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Box, TextField, Typography, Avatar, Paper, IconButton, Button, Badge } from '@mui/material';
import { Send as SendIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useValidation } from '../../providers/ValidationProvider';
import { useAuth } from '../../providers/AuthProvider';
import { useMessages } from '../../providers/MessageProvider';
import { useConnections } from '../../providers/ConnectionProvider';
import { usePresence } from '../../hooks/auth/usePresence'; // Importar o hook de presença
import { showToast } from '../../utils/toastUtils';
import socket from '../../services/socketService';
import { serviceLocator } from '../../core/services/BaseService';

const getOptimizedProfilePicture = (url) => {
  if (!url) return null;
  return url.includes('?') 
    ? `${url}&size=100` 
    : `${url}?size=100`;
};

// Componente para o indicador de online/offline
const OnlineStatusIndicator = ({ isOnline, status }) => {
  // Define as cores com base no status
  let color = 'grey';
  let statusText = 'Offline';
  
  if (isOnline) {
    switch (status) {
      case 'online':
        color = '#44b700';
        statusText = 'Online';
        break;
      case 'away':
        color = '#ff9800';
        statusText = 'Ausente';
        break;
      case 'busy':
        color = '#f44336';
        statusText = 'Ocupado';
        break;
      default:
        color = '#44b700';
        statusText = 'Online';
    }
  }
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: color,
          mr: 0.5
        }}
      />
      <Typography variant="caption" color="text.secondary">
        {statusText}
      </Typography>
    </Box>
  );
};

// Componente para o indicador de digitação
const TypingIndicator = ({ isTyping, userName }) => {
  if (!isTyping) return null;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', pl: 2, pb: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        {userName} está digitando...
      </Typography>
      <Box sx={{ display: 'flex', ml: 1 }}>
        <span className="typing-dot" style={{ animationDelay: '0s' }}>.</span>
        <span className="typing-dot" style={{ animationDelay: '0.2s' }}>.</span>
        <span className="typing-dot" style={{ animationDelay: '0.4s' }}>.</span>
      </Box>
    </Box>
  );
};

// Componente para bolhas de mensagem com indicadores de status
const MessageBubble = ({ message, isOwnMessage, senderName }) => {
  const getStatusIcon = () => {
    if (!isOwnMessage) return null;
    
    if (message.visto || message.status?.read) return '✓✓'; // Visto
    if (message.entregue || message.status?.delivered) return '✓'; // Entregue
    return '⌛'; // Enviado
  };
  
  const messageContent = message.deleted ? 
    <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.7 }}>
      Esta mensagem foi apagada
    </Typography> 
    : 
    <Typography variant="body2">{message.conteudo || message.content}</Typography>;
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      {!isOwnMessage && (
        <Avatar sx={{ mr: 1 }}>
          {senderName ? senderName[0] : '?'}
        </Avatar>
      )}
      <Paper
        elevation={1}
        sx={{
          p: 1,
          maxWidth: '70%',
          backgroundColor: isOwnMessage ? 'primary.light' : 'background.paper',
          color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
          position: 'relative',
          opacity: message.deleted ? 0.7 : 1,
        }}
      >
        {messageContent}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          mt: 0.5
        }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {getStatusIcon()}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

const ChatWindow = ({ uidDestinatarioProps, friendName }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const authStore = serviceLocator.get('store').getState()?.auth || {};
  const messagesStore = serviceLocator.get('store').getState()?.messages || {};
  const connectionsStore = serviceLocator.get('store').getState()?.connections || {};

  const { currentUser } = authStore;
  const userId = currentUser?.uid;

  const { 
    messages, 
    conversations,
    activeChat
  } = messagesStore;

  const {
    createMessage, 
    updateMessageStatus,
    deleteMessage,
    setActiveChat,
    fetchMessages
  } = useMessages();

  const { friends } = connectionsStore;
  
  // Utilizar o hook de presença
  const { 
    isUserOnline,
    getUserStatus,
    refreshOnlineUsers
  } = usePresence();

  const { validateField, validateForm, errors, setFieldDirty } = useValidation();
  const [messageText, setMessageText] = useState('');
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [remoteTyping, setRemoteTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const chatEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const { uidDestinatario: uidDestinatarioURL } = useParams();
  
  const uidDestinatario = uidDestinatarioProps || uidDestinatarioURL;
  
  // Gerar o ID da conversa com base nos IDs dos participantes
  const conversationId = userId && uidDestinatario 
    ? [userId, uidDestinatario].sort().join('_') 
    : null;

  // Encontra o amigo atual usando o parâmetro da URL
  const friend = friends.find(f => f.id === uidDestinatario);
  
  // Verificar status online do destinatário
  const isDestinationOnline = isUserOnline(uidDestinatario);
  const destinationStatus = getUserStatus(uidDestinatario);

  // Atualizar o chat ativo quando mudar o destinatário
  useEffect(() => {
    if (conversationId) {
      setActiveChat(conversationId);
    }
  }, [conversationId, setActiveChat]);

  // Carregar mensagens quando conversa mudar
  useEffect(() => {
    if (userId && uidDestinatario) {
      // Adicionado log para depuração
      console.log("Carregando mensagens para conversa com:", uidDestinatario);
      // Carregamos mensagens usando o ID do outro usuário
      fetchMessages(uidDestinatario);
      
      // Solicitar atualização de status para este usuário específico
      refreshOnlineUsers([uidDestinatario]);
    }
  }, [userId, uidDestinatario, fetchMessages, refreshOnlineUsers]);

  // Filtra as mensagens para a conversa atual
  const chatHistory = React.useMemo(() => {
    if (!conversationId || !Array.isArray(messages)) return [];
    
    // Filtrar mensagens para esta conversa específica
    return messages.filter(msg => {
      // Verificar pelo conversationId (novo sistema)
      if (msg.conversationId === conversationId) return true;
      
      // Verificar pela combinação de remetente/destinatário (compatibilidade)
      return (
        (msg.uidRemetente === userId && msg.uidDestinatario === uidDestinatario) ||
        (msg.uidRemetente === uidDestinatario && msg.uidDestinatario === userId)
      );
    }).sort((a, b) => {
      // Ordenar por timestamp
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeA - timeB;
    });
  }, [messages, conversationId, userId, uidDestinatario]);

// // Marca mensagens como lidas quando visualizadas
// useEffect(() => {
//   const markAsRead = async () => {
//     if (uidDestinatario && currentUser?.uid) {
//       try {
//         // Gerar ID da conversa ordenando os IDs dos usuários
//         const conversationId = [currentUser.uid, uidDestinatario].sort().join('_');
        
//         // Filtrar mensagens não lidas
//         const unreadMessages = chatHistory.filter(
//           msg => !msg.lido && msg.uidRemetente === uidDestinatario
//         );
        
//         // Se houver mensagens não lidas, marcá-las como lidas
//         if (unreadMessages.length > 0) {
//           console.log(`Marcando ${unreadMessages.length} mensagens como lidas`);
          
//           // O backend já cria a conversa se não existir
//           // CORREÇÃO: Passar o userId como segundo parâmetro
//           const result = await updateMessageStatus(conversationId, null, 'read');
          
//           // Notificar via socket apenas se algo foi atualizado
//           unreadMessages.forEach(msg => {
//             if (msg.id) {
//               socket.emit('message_status_update', {
//                 conversationId,
//                 messageId: msg.id,
//                 status: 'read',
//                 timestamp: Date.now()
//               });
//             }
//           });
//         }
//       } catch (error) {
//         // Apenas logar o erro, não mostrar ao usuário
//         console.log('Erro ao atualizar status de mensagem (não crítico):', error.message);
//       }
//     }
//   };
  
//   if (uidDestinatario && chatHistory.length > 0) {
//     markAsRead();
//   }
// }, [chatHistory, uidDestinatario, currentUser, updateMessageStatus]);

  // Inicializar socket e configurar listeners quando a conversa é carregada
  useEffect(() => {
    if (!userId || !uidDestinatario) return;

    // Entrar na sala de chat específica para este par de usuários
    socket.emit('join_chat', conversationId);

    // Escutar por novas mensagens
    socket.on('new_message', (newMessage) => {
      // A lista de mensagens será atualizada via context
      // Mas podemos usar isso para outras ações como notificações de som
      if (newMessage.sender === uidDestinatario) {
        const audio = new Audio('/message-notification.mp3');
        audio.play().catch(e => console.log('Erro ao reproduzir som:', e));
        
        // Marcar mensagem como entregue automaticamente
        if (newMessage.id && conversationId) {
          updateMessageStatus(conversationId, newMessage.id, 'delivered');
        }
      }
    });

    // Escutar por status de digitação
    socket.on('typing_status', (data) => {
      // Verificar se a atualização é para a conversa atual
      if (data.conversationId === conversationId) {
        // Se não for do usuário atual, é do outro usuário
        if (data.senderId !== userId) {
          setRemoteTyping(data.isTyping);
        }
      }
    });

    // Escutar por atualizações de status de mensagem
    socket.on('message_status_update', ({ conversationId: convId, messageId, status }) => {
      if (convId === conversationId && messageId) {
        updateMessageStatus(convId, messageId, status);
      }
    });

    // Limpar listeners ao desmontar
    return () => {
      socket.off('new_message');
      socket.off('typing_status');
      socket.off('message_status_update');
      socket.emit('leave_chat', conversationId);
    };
  }, [updateMessageStatus, userId, uidDestinatario, conversationId]);

  // Efeito para lidar com o status de digitação
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_status', {
        conversationId, // Usar o conversationId em vez de senderId/recipientId
        isTyping: true
      });
    }
    
    // Limpar o timeout anterior se existir
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Configurar novo timeout
    const timeout = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing_status', {
        conversationId,
        isTyping: false
      });
    }, 2000);
    
    setTypingTimeout(timeout);
  };

  // Função para enviar mensagem
  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser?.uid || !uidDestinatario) {
      showToast('Mensagem ou destinatário inválidos', { type: 'error' });
      return;
    }

    try {
      // Criar objeto de mensagem padronizado
      const messageData = {
        conteudo: message.trim(),
        uidDestinatario,
        tipo: 'texto'
      }

      // Já temos o socket implementado no MessageService
      // Não precisamos enviar novamente pelo socket aqui
      // O service cuidará de enviar pelo socket ou REST conforme disponibilidade
      await createMessage(messageData);
      
      setMessage('');
      
      // Parar o indicador de digitação
      setIsTyping(false);
      socket.emit('typing_status', {
        conversationId,  // Usar conversationId em vez de campos separados
        isTyping: false
      });
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Feedback ao usuário
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

  const handleDeleteMessage = async (messageId) => {
    if (!conversationId || !messageId) return;

    try {
      await deleteMessage(conversationId, messageId);
      showToast('Mensagem apagada', { type: 'success' });
    } catch (error) {
      showToast('Não foi possível apagar a mensagem', { type: 'error' });
    }
  };

  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }, [message, handleSendMessage]);

  // Scroll para o final quando novas mensagens chegam
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Se não encontrou o amigo e não temos um uidDestinatario, redirecionar para a lista de conversas
  if (!uidDestinatario) {
    return <Navigate to="/messages" />;
  }

  // Se não encontrou o amigo específico, mostrar mensagem amigável
  if (!friend && uidDestinatario) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3
      }}>
        <Typography variant="h6" gutterBottom>
          Contato não encontrado
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
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
      </Box>
    );
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
          onClick={() => navigate('/messages')} 
          sx={{ display: { sm: 'none' } }}
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
                backgroundColor: isDestinationOnline ? '#44b700' : 'grey',
                border: '2px solid white'
              }}
            />
          }
        >
          <Avatar 
            src={friend ? getOptimizedProfilePicture(friend.fotoDoPerfil) : null} 
            sx={{ mr: 2, width: 50, height: 50 }}
          >
            {friend && friend.nome ? friend.nome[0] : '?'}
          </Avatar>
        </Badge>
        <Box>
          <Typography variant="h6">{friend ? friend.nome : 'Carregando...'}</Typography>
          <OnlineStatusIndicator 
            isOnline={isDestinationOnline} 
            status={destinationStatus?.status || 'offline'} 
          />
        </Box>
      </Box>

      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        p: 2,
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {!chatHistory || chatHistory.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexGrow: 1,
            opacity: 0.5
          }}>
            <Typography variant="body1">
              Nenhuma mensagem ainda. Diga olá!
            </Typography>
            {isDestinationOnline ? (
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                {friend?.nome} está online agora!
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {friend?.nome} está offline. A mensagem será entregue quando estiver online.
              </Typography>
            )}
          </Box>
        ) : (
          chatHistory.map((msg, index) => {
            // Determina se é mensagem própria comparando o remetente com o userId atual
            const isOwnMessage = (msg.uidRemetente === userId) || (msg.sender === userId);
            return (
              <MessageBubble 
                key={msg.id || index} 
                message={msg} 
                isOwnMessage={isOwnMessage}
                senderName={friend ? friend.nome : ''}
                onDelete={isOwnMessage ? () => handleDeleteMessage(msg.id) : null}
              />
            );
          })
        )}
        <TypingIndicator isTyping={remoteTyping} userName={friend ? friend.nome : ''} />
        <div ref={chatEndRef} />
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setFieldDirty('conteudo'); // Marcar campo como "sujo" quando alterado
          }}        
          onKeyPress={handleKeyPress}
          onKeyDown={handleTyping}
          inputRef={messageInputRef}
          placeholder={
            isDestinationOnline 
              ? t('chatWindow.typeYourMessage') || 'Digite sua mensagem...'
              : `Enviar mensagem para ${friend?.nome} (offline)`
          }
          variant="outlined"
          error={!!errors.get('conteudo')}
          helperText={errors.get('conteudo')}
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