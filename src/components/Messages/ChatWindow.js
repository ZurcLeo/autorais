// ChatWindow.js - Versão Otimizada
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Box, TextField, Typography, Avatar, Paper, IconButton, Button } from '@mui/material';
import { Send as SendIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useMessages } from '../../providers/MessageProvider';
import { serviceLocator } from '../../core/services/BaseService';
import { showToast } from '../../utils/toastUtils';
import ModernChatInput from './ModernChatInput';

const getOptimizedProfilePicture = (url) => {
  if (!url) return null;
  return url.includes('?') 
    ? `${url}&size=100` 
    : `${url}?size=100`;
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
const MessageBubble = ({ message, isOwnMessage, senderName, onDelete }) => {
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
        {isOwnMessage && !message.deleted && (
          <IconButton 
            size="small"
            onClick={() => onDelete && onDelete(message.id)}
            sx={{ 
              position: 'absolute',
              top: -10,
              right: -10,
              opacity: 0,
              transition: '0.2s',
              '&:hover': { opacity: 1 }
            }}
          >
            ×
          </IconButton>
        )}
      </Paper>
    </Box>
  );
};

const ChatWindow = ({ uidDestinatarioProps, friendName }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const messageInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Serviços e estado
  const authStore = serviceLocator.get('store').getState()?.auth || {};
  const connectionsStore = serviceLocator.get('store').getState()?.connections || {};
  
  const { currentUser } = authStore;
  const userId = currentUser?.uid;
  const { friends } = connectionsStore;

  // Provider de mensagens centralizado
  const { 
    messages, 
    activeChat,
    typingStatus, 
    fetchMessages, 
    createMessage, 
    updateMessageStatus,
    deleteMessage,
    setActiveChat,
    updateTypingStatus
  } = useMessages();
  
  // Estado local para o controle do formulário
  const [message, setMessage] = useState('');
  const [isLocalTyping, setIsLocalTyping] = useState(false);
  
  // Parâmetros de rota e props
  const { uidDestinatario: uidDestinatarioURL } = useParams();
  const uidDestinatario = uidDestinatarioProps || uidDestinatarioURL;
  
  // Gerar o ID da conversa com base nos IDs dos participantes
  const conversationId = userId && uidDestinatario 
    ? [userId, uidDestinatario].sort().join('_') 
    : null;

  // Encontra o amigo atual usando o uidDestinatario
  const friend = friends.find(f => f.id === uidDestinatario);
  
  // Verificar se há digitação do outro usuário
  const remoteTyping = typingStatus?.[conversationId]?.[uidDestinatario] || false;
  
  // ---- Efeitos ----
  
  // Efeito 1: Atualizar o chat ativo quando mudar o destinatário
  useEffect(() => {
    if (conversationId) {
      console.log("[ChatWindow] Definindo chat ativo:", conversationId);
      setActiveChat(conversationId);
    }
    
    // Limpar timeout de digitação ao desmontar ou mudar de conversa
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Resetar estado de digitação local
      if (isLocalTyping) {
        updateTypingStatus(conversationId, false);
        setIsLocalTyping(false);
      }
    };
  }, [conversationId, setActiveChat]);
  
  // Efeito 2: Carregar mensagens quando conversa mudar
  useEffect(() => {
    if (userId && uidDestinatario && conversationId) {
      console.log("[ChatWindow] Carregando mensagens para:", uidDestinatario);
      fetchMessages(uidDestinatario);
    }
  }, [userId, uidDestinatario, conversationId, fetchMessages]);
  
  // Efeito 3: Scroll para o final quando novas mensagens chegam
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
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
  
  // Manipulação do estado de digitação
  const handleTyping = () => {
    // Se já estiver no estado de digitação, apenas atualizar o timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    } else {
      // Caso contrário, ativar o estado de digitação
      setIsLocalTyping(true);
      updateTypingStatus(conversationId, true);
    }
    
    // Configurar novo timeout para desativar o estado de digitação
    typingTimeoutRef.current = setTimeout(() => {
      setIsLocalTyping(false);
      updateTypingStatus(conversationId, false);
      typingTimeoutRef.current = null;
    }, 2000);
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
      };
      
      // Enviar a mensagem usando o provider centralizado
      await createMessage(messageData);
      
      // Limpar campo de mensagem
      setMessage('');
      
      // Parar o indicador de digitação
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      
      setIsLocalTyping(false);
      updateTypingStatus(conversationId, false);
      
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
  
  // Função para excluir mensagem
  const handleDeleteMessage = async (messageId) => {
    if (!conversationId || !messageId) return;
    
    try {
      await deleteMessage(conversationId, messageId);
      showToast('Mensagem apagada', { type: 'success' });
    } catch (error) {
      showToast('Não foi possível apagar a mensagem', { type: 'error' });
    }
  };
  
  // Lidar com tecla Enter para envio
  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }, [message]);
  
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
  
  // Renderização principal do chat
  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column'
    }}>
      {/* Cabeçalho do chat */}
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
        <Avatar 
          src={friend ? getOptimizedProfilePicture(friend.fotoDoPerfil) : null} 
          sx={{ mr: 2 }}
        >
          {friend && friend.nome ? friend.nome[0] : '?'}
        </Avatar>
        <Box>
          <Typography variant="h6">{friend ? friend.nome : 'Carregando...'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {friend && friend.online ? 'Online' : 'Offline'}
          </Typography>
        </Box>
      </Box>

      {/* Área de mensagens */}
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
                onDelete={isOwnMessage ? handleDeleteMessage : null}
              />
            );
          })
        )}
        <TypingIndicator isTyping={remoteTyping} userName={friend ? friend.nome : ''} />
        <div ref={chatEndRef} />
      </Box>

      {/* Área de entrada de mensagem */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
  <ModernChatInput
    friendName={friend ? friend.nome : ''}
    onSendMessage={async (messageData) => {
      if (!currentUser?.uid || !uidDestinatario) {
        showToast('Destinatário inválido', { type: 'error' });
        return;
      }
      
      try {
        // Adaptar formato da mensagem
        const adaptedMessage = {
          conteudo: messageData.text,
          uidDestinatario,
          tipo: messageData.attachments.length > 0 ? 'media' : 'texto',
          anexos: messageData.attachments
        };
        
        // Enviar a mensagem usando o provider centralizado
        await createMessage(adaptedMessage);
        
        // Parar o indicador de digitação
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        
        setIsLocalTyping(false);
        updateTypingStatus(conversationId, false);
        
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
    }}
    isTyping={remoteTyping}
    disabled={!uidDestinatario || !currentUser?.uid}
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