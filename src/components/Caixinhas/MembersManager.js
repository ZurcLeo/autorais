import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  CircularProgress,
  Alert
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useConnections } from '../../providers/ConnectionProvider';
import { useInvites } from '../../providers/InviteProvider';
import { useCaixinha } from '../../providers/CaixinhaProvider';
import {MembersList} from './MembersList';
import {OptionsView} from './OptionsView';
import {FriendsView} from './FriendsView';
import {EmailView} from './EmailView';

const MembersManager = ({ caixinha }) => {
    // Estados
    const [modalState, setModalState] = useState('closed'); // 'closed', 'options', 'friends', 'email'
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [emailForm, setEmailForm] = useState({ email: '', message: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [inviteStatus, setInviteStatus] = useState(null);
    
    // Hooks de contexto
    const { t } = useTranslation();
    const { 
      friends, 
      bestFriends, 
      smartSearchUsers,
      createConnectionRequest 
    } = useConnections();
    
    const { 
      sendInvitation,
      sentInvitations 
    } = useInvites();
    
    const { addMember } = useCaixinha();
    
    // Lista combinada de amigos
    const allFriends = useMemo(() => {
      return [...bestFriends, ...friends].filter((friend, index, self) => 
        index === self.findIndex((f) => f.id === friend.id)
      );
    }, [friends, bestFriends]);
    
    // Filtragem de amigos já convidados ou membros
    const eligibleFriends = useMemo(() => {
      return allFriends.filter(friend => {
        const isMember = caixinha.members?.some(member => member.id === friend.id);
        const isInvited = sentInvitations.some(inv => 
          inv.targetId === friend.id && 
          inv.caixinhaId === caixinha.id &&
          inv.status === 'pending'
        );
        return !isMember && !isInvited;
      });
    }, [allFriends, caixinha, sentInvitations]);
    
    // Handlers
    const handleOpenModal = () => setModalState('options');
    const handleCloseModal = () => {
      setModalState('closed');
      setSelectedFriends([]);
      setEmailForm({ email: '', message: '' });
      setSearchQuery('');
      setSearchResults([]);
      setInviteStatus(null);
    };
    
    const handleSelectFriend = (friendId) => {
      setSelectedFriends(prev => {
        if (prev.includes(friendId)) {
          return prev.filter(id => id !== friendId);
        } else {
          return [...prev, friendId];
        }
      });
    };
    
    const handleSearch = async (query) => {
      setSearchQuery(query);
      if (query.trim().length > 2) {
        const results = await smartSearchUsers(query);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };
    
    const handleSendFriendInvites = async () => {
      setInviteStatus('sending');
      try {
        const promises = selectedFriends.map(friendId => {
          return sendInvitation({
            type: 'caixinha_invite',
            targetId: friendId,
            caixinhaId: caixinha.id,
            message: t('invites.defaultCaixinhaMessage', { caixinhaName: caixinha.name })
          });
        });
        
        await Promise.all(promises);
        setInviteStatus('success');
        setTimeout(() => {
          handleCloseModal();
        }, 2000);
      } catch (error) {
        setInviteStatus('error');
        console.error("Error sending invites:", error);
      }
    };
    
    const handleSendEmailInvite = async () => {
      setInviteStatus('sending');
      try {
        await sendInvitation({
          type: 'caixinha_email_invite',
          email: emailForm.email,
          caixinhaId: caixinha.id,
          message: emailForm.message || t('invites.defaultCaixinhaMessage', { caixinhaName: caixinha.name })
        });
        
        setInviteStatus('success');
        setTimeout(() => {
          handleCloseModal();
        }, 2000);
      } catch (error) {
        setInviteStatus('error');
        console.error("Error sending email invite:", error);
      }
    };
    
    // Renderização dos diferentes estados do modal
    const renderModalContent = () => {
      switch (modalState) {
        case 'options':
          return (
            <OptionsView 
              onSelectFriends={() => setModalState('friends')}
              onSelectEmail={() => setModalState('email')}
              onClose={handleCloseModal}
            />
          );
        
        case 'friends':
          return (
            <FriendsView 
              friends={eligibleFriends}
              selectedFriends={selectedFriends}
              onSelect={handleSelectFriend}
              onSearch={handleSearch}
              searchQuery={searchQuery}
              searchResults={searchResults}
              onBack={() => setModalState('options')}
              onSend={handleSendFriendInvites}
              inviteStatus={inviteStatus}
            />
          );
        
        case 'email':
          return (
            <EmailView 
              formData={emailForm}
              onChange={(field, value) => setEmailForm(prev => ({ ...prev, [field]: value }))}
              onBack={() => setModalState('options')}
              onSend={handleSendEmailInvite}
              inviteStatus={inviteStatus}
            />
          );
        
        default:
          return null;
      }
    };
    
    // Componente principal
    return (
      <>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {t('membersList.members', { count: caixinha.members?.length || 0 })}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={handleOpenModal}
          >
            {t('membersList.addMember')}
          </Button>
        </Box>
  
        <MembersList members={caixinha.members} />
        
        {/* Modal principal para adicionar membros */}
        <Dialog 
          open={modalState !== 'closed'} 
          onClose={handleCloseModal}
          maxWidth={modalState === 'friends' ? 'md' : 'sm'}
          fullWidth
        >
          <DialogContent>
            {renderModalContent()}
          </DialogContent>
        </Dialog>
      </>
    );
};

export default MembersManager;