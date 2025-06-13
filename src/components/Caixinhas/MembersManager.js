import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import { useCaixinhaInvite } from '../../providers/CaixinhaInviteProvider';
import { useCaixinha } from '../../providers/CaixinhaProvider';
import { MembersList } from './MembersList';
import { OptionsView } from './OptionsView';
import { FriendsView } from './FriendsView';
import { EmailView } from './EmailView';
import { coreLogger } from '../../core/logging';
import { LOG_LEVELS } from '../../core/constants/config';

const MODULE_NAME = 'MembersManager';

const MembersManager = ({ caixinha }) => {
  // Estados locais
  const [modalState, setModalState] = useState('closed'); // 'closed', 'options', 'friends', 'email'
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [emailForm, setEmailForm] = useState({ email: '', message: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [localInviteStatus, setLocalInviteStatus] = useState(null); // 'sending', 'success', 'error', null

  // Hooks de contexto
  const { t } = useTranslation();
  const { friends, bestFriends, smartSearchUsers } = useConnections();
  const { getMembers, members } = useCaixinha();
  
  // Usar o novo provider de convites
  const { 
    pendingInvites, 
    sentInvites,
    loading: inviteLoading,
    error: inviteError,
    isServiceAvailable,
    loadPendingInvites,
    loadSentInvites,
    inviteFriend,
    inviteByEmail
  } = useCaixinhaInvite();

  // Logging para debugging
  useEffect(() => {
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'MembersManager component state', {
      caixinhaId: caixinha?.id,
      isServiceAvailable,
      pendingInvitesCount: pendingInvites?.length || 0,
      sentInvitesCount: sentInvites?.length || 0,
      membersCount: members?.length || 0
    });
  }, [caixinha, isServiceAvailable, pendingInvites, sentInvites, members]);

  // Carregar convites quando o componente é montado ou quando o caixinha muda
  useEffect(() => {
    if (isServiceAvailable && caixinha?.id) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Loading invites and members', { caixinhaId: caixinha.id });
      
      // Carregar convites pendentes e enviados
      loadPendingInvites();
      loadSentInvites();
      // Carregar membros da caixinha
      getMembers(caixinha.id);

    }
  }, [isServiceAvailable, caixinha?.id, loadPendingInvites, loadSentInvites, getMembers]);

  // Sincronizar estado local de convite com o provider
  useEffect(() => {
    if (inviteLoading) {
      setLocalInviteStatus('sending');
    } else if (inviteError) {
      setLocalInviteStatus('error');
    }
  }, [inviteLoading, inviteError]);

  // Processar membros para o formato correto
  const processedMembers = useMemo(() => {
    if (!members) return [];

    return members.map(member => ({
      id: member.id || member.userId,
      nome: member.nome || member.name || member.displayName,
      email: member.email,
      isAdmin: Boolean(member.isAdmin || member.role === 'admin'),
      status: member.status || 'active',
      fotoPerfil: member.fotoPerfil || member.fotoDoPerfil || member.photoURL,
      joinedAt: member.joinedAt || member.createdAt || new Date().toISOString()
    }));
  }, [members]);
  
  // Lista combinada de amigos
  const allFriends = useMemo(() => {
    return [...bestFriends, ...friends].filter((friend, index, self) => 
      index === self.findIndex((f) => f.id === friend.id)
    );
  }, [friends, bestFriends]);
  
  // Filtragem de amigos já convidados ou membros
  const eligibleFriends = useMemo(() => {
    return allFriends.filter(friend => {

      // Verificar se o amigo já é membro
      const isMember = processedMembers.some(member => member.id === friend.id);
      
      // Verificar se já existe um convite pendente para este amigo
      const isInvited = sentInvites.some(invite => 
        invite.targetId === friend.id && 
        invite.caixinhaId === caixinha?.id &&
        invite.status === 'pending'
      );
      
      return !isMember && !isInvited;
    });
  }, [allFriends, processedMembers, sentInvites, caixinha]);

  // Combinar membros e convites para exibição
  const combinedMembersAndInvites = useMemo(() => {
    if (!caixinha) {
      return [];
    }

    // Garantir que processedMembers é um array
    const members = Array.isArray(processedMembers) ? processedMembers : [];
    
    // Garantir que sentInvites é um array
    const invites = Array.isArray(sentInvites) ? sentInvites : [];

    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Combining members and invites', {
      membersCount: members.length,
      sentInvitesCount: invites.length,
      caixinhaId: caixinha.id
    });
    
    // Obter IDs dos membros existentes para evitar duplicação
    const existingMemberIds = members.map(member => member.id);
    
    // Transformar convites pendentes para um formato compatível com o MembersList
    // Filtrar apenas convites pendentes que não correspondem a membros existentes
    const pendingInvitesAsMembers = invites
      .filter(invite => {
        // Só incluir convites pendentes para esta caixinha
        const isPendingForThisCaixinha = invite.status === 'pending' && invite.caixinhaId === caixinha.id;
        
        // Verificar se o convite não corresponde a um membro existente
        const isNotExistingMember = invite.targetId ? !existingMemberIds.includes(invite.targetId) : true;
        
        return isPendingForThisCaixinha && isNotExistingMember;
      })
      .map(invite => {
        // Obter timestamp como número de milissegundos se estiver no formato Firestore
        const timestamp = invite.createdAt && invite.createdAt._seconds 
          ? invite.createdAt._seconds * 1000 
          : invite.createdAt;
          
        return {
          id: `invite-${invite.id}`,
          nome: invite.targetName || 'Usuário Convidado',
          email: invite.email || '',
          isAdmin: false,
          status: 'pending',
          type: 'caixinha_invite',
          caxinhaInviteId: invite.id,
          senderId: invite.senderId,
          // Converter para timestamp numérico para facilitar o processamento
          createdAt: timestamp,
          invitedAt: timestamp
        };
      });

    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.DEBUG, 'Combined members and invites result', {
      membersCount: members.length,
      pendingInvitesCount: pendingInvitesAsMembers.length,
      existingMemberIds,
      totalCombined: members.length + pendingInvitesAsMembers.length
    });

    return [...members, ...pendingInvitesAsMembers];
  }, [processedMembers, sentInvites, caixinha]);

  // Handlers
  const handleOpenModal = () => {
    setModalState('options');
    // Resetar estados
    setSelectedFriends([]);
    setEmailForm({ email: '', message: '' });
    setSearchQuery('');
    setSearchResults([]);
    setLocalInviteStatus(null);
  };
  
  const handleCloseModal = () => {
    setModalState('closed');
    // Resetar estados
    setSelectedFriends([]);
    setEmailForm({ email: '', message: '' });
    setSearchQuery('');
    setSearchResults([]);
    setLocalInviteStatus(null);
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
      try {
        const results = await smartSearchUsers(query);
        setSearchResults(results);
      } catch (error) {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Error searching users', {
          query,
          error: error.message
        });
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };
  
  // Enviar convites para amigos usando o serviço de convites
  const handleSendFriendInvites = async () => {
    if (!caixinha?.id || selectedFriends.length === 0) {
      return;
    }
    
    setLocalInviteStatus('sending');
    
    try {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Sending friend invites', {
        caixinhaId: caixinha.id,
        friendsCount: selectedFriends.length
      });
      // Usar Promise.all para enviar convites em paralelo
      const promises = selectedFriends.map(friendId => {
        return inviteFriend(
          caixinha.id, 
          friendId, 
          t('invites.defaultCaixinhaMessage', { caixinhaName: caixinha.nome || caixinha.name })
        );
      });
      
      await Promise.all(promises);
      
      // Recarregar a lista de convites enviados
      await loadSentInvites();
      
      setLocalInviteStatus('success');
      // Fechar o modal após um atraso
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Error sending friend invites', {
        caixinhaId: caixinha.id,
        error: error.message
      });
      
      setLocalInviteStatus('error');
    }
  };

  // Enviar convite por email usando o serviço de convites
  const handleSendEmailInvite = async () => {
    if (!caixinha?.id || !emailForm.email) {
      return;
    }
    
    setLocalInviteStatus('sending');
    
    try {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Sending email invite', {
        caixinhaId: caixinha.id,
        email: emailForm.email
      });
      
      await inviteByEmail(
        caixinha.id, 
        emailForm.email, 
        emailForm.message || t('invites.defaultCaixinhaMessage', { caixinhaName: caixinha.nome || caixinha.name })
      );
      
      // Recarregar a lista de convites enviados
      await loadSentInvites();
      
      setLocalInviteStatus('success');
      // Fechar o modal após um atraso
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Error sending email invite', {
        caixinhaId: caixinha.id,
        email: emailForm.email,
        error: error.message
      });
      
      setLocalInviteStatus('error');
    }
  };

  // Reenviar convite
  const handleResendInvite = useCallback(async (caixinhaInviteId) => {
    if (!caixinhaInviteId || !caixinha?.id) return;
    
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Resending invite', {
      caixinhaId: caixinha.id,
      caixinhaInviteId
    });
    
    try {
      // Implementar função para reenviar convite
      // Esta funcionalidade precisa ser implementada no serviço
      alert("Reenvio de convite não implementado");
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Error resending invite', {
        caixinhaInviteId,
        error: error.message
      });
    }
  }, [caixinha]);

  // Cancelar convite
  const handleCancelInvite = useCallback(async (caixinhaInviteId) => {
    if (!caixinhaInviteId || !caixinha?.id) return;
    
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Canceling invite', {
      caixinhaId: caixinha.id,
      caixinhaInviteId
    });
    
    try {
      // Implementar função para cancelar convite
      // Esta funcionalidade precisa ser implementada no serviço
      alert("Cancelamento de convite não implementado");
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Error canceling invite', {
        caixinhaInviteId,
        error: error.message
      });
    }
  }, [caixinha]);
  
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
            inviteStatus={localInviteStatus}
            caixinhaId={caixinha?.id}
          />
        );
      
      case 'email':
        return (
          <EmailView 
            formData={emailForm}
            onChange={(field, value) => setEmailForm(prev => ({ ...prev, [field]: value }))}
            onBack={() => setModalState('options')}
            onSend={handleSendEmailInvite}
            inviteStatus={localInviteStatus}
          />
        );
      
      default:
        return null;
    }
  };
  
  // Mostra carregamento se não houver informações de membros ainda
  if (!processedMembers && !sentInvites) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {t('membersList.members', { count: processedMembers.length || 0 })}
          {sentInvites.length > 0 && (
            <Typography component="span" variant="body2" color="text.secondary" ml={1}>
              ({t('membersList.pendingInvites', { count: sentInvites.filter(i => i.status === 'pending').length })})
            </Typography>
          )}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenModal}
          disabled={!isServiceAvailable}
        >
          {t('membersList.addMember')}
        </Button>
      </Box>

      {/* Exibir alerta se o serviço não estiver disponível */}
      {!isServiceAvailable && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t('membersList.serviceUnavailable')}
        </Alert>
      )}

      {/* Exibir MembersList com os membros e convites combinados */}
      <MembersList 
        members={combinedMembersAndInvites} 
        caixinhaId={caixinha?.id}
        isAdmin={processedMembers.some(member => 
          member.isAdmin && member.id === localStorage.getItem('userId')
        )}
        currentUserId={localStorage.getItem('userId')}
        onCancelInvite={handleCancelInvite}
        onSendReminder={handleResendInvite}
        onPromote={(memberId) => {
          // Implementar função para promover membro
          console.log('Promover membro', memberId);
        }}
        onRemove={(memberId) => {
          // Implementar função para remover membro
          console.log('Remover membro', memberId);
        }}
      />
        
      {/* Modal principal para adicionar membros */}
      <Dialog 
        open={modalState !== 'closed'} 
        onClose={handleCloseModal}
        maxWidth={modalState === 'friends' ? 'md' : 'sm'}
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          {renderModalContent()}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MembersManager;