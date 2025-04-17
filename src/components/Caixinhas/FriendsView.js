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
  CircularProgress 
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import {FriendListItem} from './FriendListItem';

export const FriendsView = ({ 
    friends, 
    selectedFriends, 
    onSelect, 
    onSearch, 
    searchQuery, 
    searchResults, 
    onBack, 
    onSend, 
    inviteStatus 
  }) => {
    const { t } = useTranslation();
    
    return (
      <>
        <DialogTitle>
          <IconButton 
            edge="start" 
            sx={{ mr: 2 }} 
            onClick={onBack}
            disabled={inviteStatus === 'sending'}
          >
            <ArrowBackIcon />
          </IconButton>
          {t('membersList.selectFriends')}
        </DialogTitle>
        
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            label={t('membersList.searchFriends')}
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            variant="outlined"
            margin="normal"
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
            }}
          />
          
          <Box sx={{ mt: 2, maxHeight: 300, overflowY: 'auto' }}>
            {searchQuery.length > 2 && searchResults.length > 0 ? (
              <List>
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
            ) : (
              friends.length > 0 ? (
                <List>
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
                </Box>
              )
            )}
          </Box>
          
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
            disabled={selectedFriends.length === 0 || inviteStatus === 'sending'}
            onClick={onSend}
            startIcon={inviteStatus === 'sending' ? <CircularProgress size={20} /> : null}
          >
            {inviteStatus === 'sending' 
              ? t('membersList.sending')
              : t('membersList.sendInvites', { count: selectedFriends.length })}
          </Button>
        </DialogActions>
      </>
    );
  };