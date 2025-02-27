//frontend/src/Connections/
import React, { useState, lazy, Suspense, memo } from 'react';
import {
  Card, CardContent, CardMedia, Typography, IconButton, Box, Tooltip, CircularProgress, Grid, Drawer,
  Chip, Button, Collapse
} from '@mui/material';
import { GiStarFormation, GiTelepathy, GiConversation, GiTrashCan, GiPresent } from "react-icons/gi";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '../../context/_AuthContext';
import { useConnections } from '../../context/ConnectionContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 

const ChatWindow = lazy(() => import('../Messages/ChatWindow'));

const FriendActions = memo(({ onDelete, onToggleChat, onToggleBestFriend, isBestFriend, onAddFriend, isActiveConnection, t  }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
    {isActiveConnection ? (
      <Tooltip title={t('friendCard.viewFriendship')}>
        <IconButton color="primary" size="small">
          <GiTelepathy />
        </IconButton>
      </Tooltip>
    ) : (
      <Tooltip title={t('friendCard.addFriend')}>
        <IconButton 
          color="primary" 
          size="small"
          onClick={onAddFriend}
        >
          <GiTelepathy />
        </IconButton>
      </Tooltip>
    )}
    <Tooltip title={t('friendCard.deleteFriendship')}>
      <IconButton color="secondary" size="small" onClick={onDelete}>
        <GiTrashCan />
      </IconButton>
    </Tooltip>
    <Tooltip title={t('friendCard.startConversation')}>
      <IconButton color="default" size="small" onClick={onToggleChat}>
        <GiConversation />
      </IconButton>
    </Tooltip>
    <Tooltip title={t('friendCard.sendGift')}>
      <IconButton color="primary" size="small">
        <GiPresent />
      </IconButton>
    </Tooltip>
    <Tooltip title={isBestFriend ? t('friendCard.removeBestFriend') : t('friendCard.addBestFriend')}>
      <IconButton
        color={isBestFriend ? "secondary" : "default"}
        size="small"
        onClick={onToggleBestFriend}
      >
        <GiStarFormation style={{ color: isBestFriend ? 'gold' : 'inherit' }} />
      </IconButton>
    </Tooltip>
  </Box>
));

const InterestChips = ({ interests = [], maxDisplay = 3 }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
    {interests?.slice(0, maxDisplay).map((interest, index) => (
      <Chip key={index} label={interest} size="small" />
    ))}
    {interests?.length > maxDisplay && (
      <Chip label={`+${interests.length - maxDisplay}`} size="small" />
    )}
  </Box>
);

const FriendCard = memo(({ friends }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;
  const { deleteConnection, addBestFriend, removeBestFriend, createRequestConnection } = useConnections();
  const [isBestFriend, setIsBestFriend] = useState(friends.isBestFriend);
  const [chatOpen, setChatOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleToggleChat = () => setChatOpen(!chatOpen);
  const handleDelete = async () => await deleteConnection(friends.id);

const handleAddFriend = async () => {
  const friendId = friends.id
  try {
    await createRequestConnection(userId, friendId);
  } catch (error) {
    console.error('Error adding friend:', error);
  }
};

  const handleToggleBestFriend = async () => {
    if (isBestFriend) {
      await removeBestFriend(friends.id);
    } else {
      await addBestFriend(friends.id);
    }
    setIsBestFriend(!isBestFriend);
  };

  const handleExpandClick = () => setExpanded(!expanded);

  const isActiveConnection = friends.isActiveConnection || false;

 
console.log(friends)
  return (
    <Card variant="outlined" sx={{ height: 450, display: 'flex', flexDirection: 'column' }}>
    <CardMedia
  component="img"
  height="200"
  image={friends.fotoDoPerfil || 'fallback-image-url.png'}
  alt={friends.nome || 'Amigo'}
/>
<Typography variant="h6" component="div" gutterBottom noWrap>
  {friends.nome || 'Amigo Desconhecido'}
</Typography>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <Typography variant="h6" component="div" gutterBottom noWrap>
          {friends.nome}
        </Typography>
        <Box sx={{ mb: 2, minHeight: 80 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('friendCard.personalInterests')}:
          </Typography>
          <InterestChips interests={friends.interessesPessoais} />
        </Box>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('friendCard.businessInterests')}:
            </Typography>
            <InterestChips interests={friends.interessesNegocios} />
          </Box>
        </Collapse>
        <Box sx={{ mt: 'auto' }}>
          <Button
            size="small"
            onClick={handleExpandClick}
            endIcon={<ExpandMoreIcon style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />}
          >
            {expanded ? t('friendCard.seeLess') : t('friendCard.seeMore')}
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate(`/profile/${friends.id}`)}
            sx={{ mb: 1 }}
          >
            {t('friendCard.viewProfile')}
          </Button>
          <FriendActions
        onDelete={handleDelete}
        onToggleChat={handleToggleChat}
        onToggleBestFriend={handleToggleBestFriend}
        onAddFriend={handleAddFriend}
        isBestFriend={isBestFriend}
        isActiveConnection={isActiveConnection}
        t={t}
      />
        </Box>
      </CardContent>

      {/* Drawer para o chat */}
      <Drawer anchor="right" open={chatOpen} onClose={handleToggleChat}>
        <Suspense fallback={<CircularProgress />}>
          <ChatWindow friendId={friends.id} friendName={friends.nome} />
        </Suspense>
      </Drawer>
    </Card>
  );
});

export default FriendCard;