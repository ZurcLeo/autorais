// Melhorias no componente FriendCard para melhor UX
import React, { useState, memo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Collapse,
  Chip,
  Button,
  Divider,
  Stack,
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
import { serviceLocator } from '../../core/services/BaseService';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMessages } from '../../providers/MessageProvider';
import { useConnections } from '../../providers/ConnectionProvider';

/**
 * Componente que exibe um cartão de amigo com status de conexão melhorado
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
  const authStore = serviceLocator.get('store').getState()?.auth || {};
  const { currentUser } = authStore;
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const navigate = useNavigate();
  const { setActiveChat } = useMessages();
  const { highlightedRequestId } = useConnections();
  
 const messageStore = serviceLocator.get('store').getState()?.messages || {};
// const invitesStore = serviceLocator.get('store').getState()?.invites || {};

console.log('setActiveChat check: ', messageStore)
  // Estados e propriedades
  const friendData = friends || {};
  const interesses = friendData.interesses || [];
  

  const mockFoto = process.env.REACT_APP_CLAUD_PROFILE_IMG;
  // Verificar se este cartão está destacado (para casos de solicitações)
  const isHighlighted = highlightedRequestId === friendData.id;
  
  // Efeito para animação de destaque
  useEffect(() => {
    if (isHighlighted) {
      // Adicionar classe para destaque visual
      const timer = setTimeout(() => {
        // Remover destaque após 3 segundos
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);
  
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

  const conversationId = [currentUser?.uid, friendData.id].sort().join('_');
  
  const handleStartChat = () => {
    setActiveChat(conversationId);
    navigate(`/messages/${friendData.id || friendData.uid}`);
  };
  
  const handleToggleBestFriend = () => {
    if (onToggleBestFriend) {
      setLoading(true);
      onToggleBestFriend(isBestFriend)
        .finally(() => setLoading(false));
    }
  };
  
  const handleDelete = () => {
    if (onDelete) {
      setLoading(true);
      onDelete()
        .finally(() => setLoading(false));
    }
  };
  
  const handleAddFriend = () => {
    if (onAddFriend) {
      setLoading(true);
      setActionError(null);
      
      onAddFriend()
        .catch(error => {
          setActionError(error.message);
        })
        .finally(() => setLoading(false));
    }
  };
  
  const handleAcceptRequest = () => {
    if (onAcceptRequest) {
      setLoading(true);
      onAcceptRequest()
        .finally(() => setLoading(false));
    }
  };
  
  // Renderizar o cartão com status visual melhorado
  return (
    <Card 
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        borderColor: isHighlighted ? 'primary.main' : 'transparent',
        borderWidth: isHighlighted ? 2 : 0,
        borderStyle: 'solid',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: 6
        }
      }}
    >
      {/* Badge para melhor amigo */}
      {isBestFriend && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1
          }}
        >
          <Badge 
            color="warning" 
            badgeContent={<StarIcon fontSize="small" />}
            overlap="circular"
          />
        </Box>
      )}
      
      {/* Badge para solicitação pendente */}
      {hasPendingRequest && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1
          }}
        >
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
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1
          }}
        >
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
            sx={{ 
              display: 'block', 
              mb: 2,
              fontSize: '0.75rem'
            }}
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
                    <StarIcon sx={{ color: isBestFriend ? 'gold' : 'inherit' }} />
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