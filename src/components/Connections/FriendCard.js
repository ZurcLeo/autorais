import React, { useState, memo } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Chip,
  Button,
  Divider,
  Avatar,
  Badge,
  CircularProgress
} from '@mui/material';
import { 
  Star as StarIcon,
  Chat as ChatIcon,
  Delete as DeleteIcon,
  PersonAdd as AddIcon,
  CardGiftcard as GiftIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  HourglassTop as PendingIcon,
  CheckCircle as AcceptIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMessages } from '../../providers/MessageProvider';

/**
 * Componente de cartão de amigo adaptado para o novo sistema de temas
 */
const FriendCard = memo(({ 
  friends, 
  isFriend = false, 
  isBestFriend = false,
  hasPendingRequest = false,
  hasIncomingRequest = false,
  onAddFriend,
  onToggleBestFriend,
  onDelete,
  onAcceptRequest
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const navigate = useNavigate();
  const { setActiveChat } = useMessages();
  
  // Estados e propriedades
  const friendData = friends || {};
  const interesses = friendData.interesses || [];
  const mockFoto = process.env.REACT_APP_CLAUD_PROFILE_IMG;
  console.log('friend data no friend card:', friendData)
  // Processar interesses para exibição
  const flattenedInterests = Array.isArray(interesses) 
    ? interesses 
    : Object.values(interesses || {}).flat();
    
  // Limitar a quantidade de interesses mostrados
  const visibleInterests = flattenedInterests.slice(0, expanded ? 10 : 3);
  const hasMoreInterests = flattenedInterests.length > visibleInterests.length;
  
  // Handlers e funções
  const handleExpandClick = () => setExpanded(!expanded);
  
  const handleViewProfile = () => {
    navigate(`/profile/${friendData.id || friendData.uid}`);
  };

  const handleStartChat = () => {
    // Usar ID do usuário atual do provider de autenticação
    const currentUser = { uid: 'current-user-id' }; // Exemplo - substituir pela lógica real
    const conversationId = [currentUser?.uid, friendData.id].sort().join('_');
    setActiveChat(conversationId);
    navigate(`/messages/${friendData.id || friendData.uid}`);
  };
  
  const handleToggleBestFriend = async () => {
    if (onToggleBestFriend) {
      try {
        setLoading(true);
        await onToggleBestFriend(isBestFriend);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleDelete = async () => {
    if (onDelete) {
      try {
        setLoading(true);
        await onDelete();
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleAddFriend = async () => {
    if (onAddFriend) {
      try {
        setLoading(true);
        setActionError(null);
        await onAddFriend();
      } catch (error) {
        setActionError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleAcceptRequest = async () => {
    if (onAcceptRequest) {
      try {
        setLoading(true);
        await onAcceptRequest();
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s ease',
      position: 'relative',
      borderRadius: 2,
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: 3
      }
    }}>
      {/* Badge para melhor amigo */}
      {isBestFriend && (
        <Box sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1
        }}>
          <Badge 
            color="warning" 
            badgeContent={<StarIcon fontSize="small" />}
            overlap="circular"
          />
        </Box>
      )}
      
      {/* Badge para solicitação pendente */}
      {hasPendingRequest && (
        <Box sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1
        }}>
          <Chip 
            icon={<PendingIcon />}
            label={t('friendCard.pendingRequest')}
            color="info"
            size="small"
          />
        </Box>
      )}
      
      {/* Badge para solicitação recebida */}
      {hasIncomingRequest && (
        <Box sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1
        }}>
          <Chip 
            icon={<AcceptIcon />}
            label={t('friendCard.incomingRequest')}
            color="success"
            size="small"
          />
        </Box>
      )}
      
      {/* Imagem do perfil */}
      <CardMedia
        component="img"
        height="140"
        image={friendData.fotoDoPerfil || mockFoto}
        alt={friendData.nome || t('friendCard.unknown')}
        sx={{ objectFit: 'cover' }}
      />
      
      {/* Conteúdo principal */}
      <CardContent sx={{ flexGrow: 1, pt: 2 }}>
        <Typography 
          variant="h6" 
          component="h3" 
          gutterBottom 
          noWrap 
          sx={{ fontWeight: 'bold' }}
        >
          {friendData.nome || t('friendCard.unknown')}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          paragraph
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 2,
            height: '2.5em'
          }}
        >
          {friendData.descricao || t('friendCard.noDescription')}
        </Typography>
        
        {/* Mensagem de erro */}
        {actionError && (
          <Typography 
            variant="caption" 
            color="error" 
            sx={{ display: 'block', mb: 2 }}
          >
            {actionError}
          </Typography>
        )}
        
        {/* Seção de interesses */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('friendCard.interests')}:
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {visibleInterests.length > 0 ? (
              visibleInterests.map((interest, index) => (
                <Chip
                  key={index}
                  label={interest}
                  size="small"
                  sx={{ mb: 0.5 }}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('friendCard.noInterests')}
              </Typography>
            )}
          </Box>
          
          {hasMoreInterests && (
            <Button 
              size="small" 
              onClick={handleExpandClick}
              endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ mt: 1 }}
            >
              {expanded ? t('friendCard.showLess') : t('friendCard.showMore')}
            </Button>
          )}
        </Box>
      </CardContent>
      
      <Divider />
      
      {/* Ações com estados de loading */}
      <CardActions sx={{ p: 1, justifyContent: 'space-between' }}>
        <Box>
          <Tooltip title={t('friendCard.viewProfile')}>
            <IconButton size="small" onClick={handleViewProfile}>
              <PersonIcon />
            </IconButton>
          </Tooltip>
          
          {isFriend ? (
            <>
              <Tooltip title={t('friendCard.message')}>
                <IconButton size="small" onClick={handleStartChat}>
                  <ChatIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={isBestFriend ? t('friendCard.removeBestFriend') : t('friendCard.addBestFriend')}>
                <IconButton 
                  size="small" 
                  color={isBestFriend ? "warning" : "default"}
                  onClick={handleToggleBestFriend}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <StarIcon sx={{ color: isBestFriend ? 'warning.main' : 'inherit' }} />
                  )}
                </IconButton>
              </Tooltip>
              
              <Tooltip title={t('friendCard.removeFriend')}>
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <DeleteIcon />
                  )}
                </IconButton>
              </Tooltip>
            </>
          ) : hasIncomingRequest ? (
            <Tooltip title={t('friendCard.acceptRequest')}>
              <IconButton 
                size="small" 
                color="success" 
                onClick={handleAcceptRequest}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={20} />
                ) : (
                  <AcceptIcon />
                )}
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title={hasPendingRequest ? t('friendCard.requestPending') : t('friendCard.addFriend')}>
              <span>
                <IconButton 
                  size="small" 
                  color="primary" 
                  onClick={handleAddFriend}
                  disabled={loading || hasPendingRequest}
                >
                  {loading ? (
                    <CircularProgress size={20} />
                  ) : hasPendingRequest ? (
                    <PendingIcon />
                  ) : (
                    <AddIcon />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Box>
        
        <Tooltip title={t('friendCard.sendGift')}>
          <IconButton size="small" color="secondary">
            <GiftIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
});

export default FriendCard;