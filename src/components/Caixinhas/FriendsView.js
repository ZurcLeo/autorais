import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Button, 
  TextField, 
  IconButton, 
  DialogTitle, 
  DialogActions, 
  Typography, 
  List, 
  Alert, 
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { FriendListItem } from './FriendListItem';

/**
 * Componente para visualização e seleção de amigos a serem convidados
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.friends - Lista de amigos disponíveis
 * @param {Array} props.selectedFriends - IDs dos amigos selecionados
 * @param {Function} props.onSelect - Função para selecionar/desselecionar um amigo
 * @param {Function} props.onSearch - Função para buscar amigos
 * @param {string} props.searchQuery - Termo de busca
 * @param {Array} props.searchResults - Resultados da busca de amigos
 * @param {Function} props.onBack - Função para voltar à tela anterior
 * @param {Function} props.onSend - Função para enviar convites
 * @param {string} props.inviteStatus - Status do envio de convites (null, 'sending', 'success', 'error')
 * @param {string} props.caixinhaId - ID da caixinha para a qual os convites serão enviados
 * @returns {React.ReactElement} Componente renderizado
 */
export const FriendsView = ({ 
  friends, 
  selectedFriends, 
  onSelect, 
  onSearch, 
  searchQuery, 
  searchResults, 
  onBack, 
  onSend, 
  inviteStatus,
  caixinhaId
}) => {
  const { t } = useTranslation();
  
  // Calcula se o botão de enviar deve estar habilitado
  const canSend = selectedFriends.length > 0 && inviteStatus !== 'sending';
  
  return (
    <>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            edge="start" 
            sx={{ mr: 2 }} 
            onClick={onBack}
            disabled={inviteStatus === 'sending'}
          >
            <ArrowBackIcon />
          </IconButton>
          {t('membersList.selectFriends')}
        </Box>
      </DialogTitle>
      
      <Box sx={{ p: 2 }}>
        {/* Explicação da seleção de amigos */}
        <Box
          sx={{ 
            mb: 2, 
            p: 1.5, 
            bgcolor: 'background.default', 
            borderRadius: 1,
            display: 'flex',
            alignItems: 'flex-start'
          }}
        >
          <InfoIcon color="info" sx={{ mr: 1, mt: 0.5 }} />
          <Typography variant="body2" component="h2" gutterBottom>
            {t('membersList.inviteInstructions')}
          </Typography>
        </Box>
        
        {/* Campo de busca */}
        <TextField
          fullWidth
          placeholder={t('membersList.searchFriends')}
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
          }}
        />
        
        {/* Contador de amigos selecionados */}
        {selectedFriends.length > 0 && (
          <Box sx={{ mt: 1.5, mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip 
              label={t('membersList.selectedCount', { count: selectedFriends.length })}
              color="primary"
              size="small"
              variant="outlined"
            />
            
            <Button 
              size="small" 
              onClick={() => selectedFriends.forEach(id => onSelect(id))}
              disabled={inviteStatus === 'sending'}
            >
              {t('membersList.clearSelection')}
            </Button>
          </Box>
        )}
        
        <Divider sx={{ my: 1.5 }} />
        
        {/* Lista de amigos */}
        <Box sx={{ mt: 2, maxHeight: 300, overflowY: 'auto' }}>
          {searchQuery.length > 2 && searchResults.length > 0 ? (
            <List disablePadding>
              {searchResults.map(friend => (
                <FriendListItem 
                  key={friend.id}
                  friend={friend}
                  isSelected={selectedFriends.includes(friend.id)}
                  onSelect={() => onSelect(friend.id)}
                  disabled={inviteStatus === 'sending'}
                />
              ))}
            </List>
          ) : searchQuery.length > 2 && searchResults.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography component="h2" gutterBottom>
                {t('membersList.noSearchResults')}
              </Typography>
            </Box>
          ) : friends.length > 0 ? (
            <List disablePadding>
              {friends.map(friend => (
                <FriendListItem 
                  key={friend.id}
                  friend={friend}
                  isSelected={selectedFriends.includes(friend.id)}
                  onSelect={() => onSelect(friend.id)}
                  disabled={inviteStatus === 'sending'}
                />
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                {t('membersList.noFriendsAvailable')}
              </Typography>
              <Button 
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
                onClick={onBack}
              >
                {t('membersList.tryEmailInvite')}
              </Button>
            </Box>
          )}
        </Box>
        
        {/* Status de envio */}
        {inviteStatus === 'success' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {t('membersList.invitesSentSuccess')}
          </Alert>
        )}
        
        {inviteStatus === 'error' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {t('membersList.invitesSentError')}
          </Alert>
        )}
      </Box>
      
      <DialogActions>
        <Button 
          onClick={onBack}
          disabled={inviteStatus === 'sending'}
        >
          {t('common.back')}
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          disabled={!canSend}
          onClick={onSend}
          startIcon={inviteStatus === 'sending' ? 
            <CircularProgress size={20} /> : 
            <PersonAddIcon />
          }
        >
          {inviteStatus === 'sending' 
            ? t('membersList.sending')
            : t('membersList.sendInvites', { count: selectedFriends.length })}
        </Button>
      </DialogActions>
    </>
  );
};