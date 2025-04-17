import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Button, 
  Card, 
  Grid, 
  Typography, 
  Avatar, 
  DialogTitle, 
  DialogActions 
} from '@mui/material';
import { 
  Group as GroupIcon,
  Email as EmailIcon
} from '@mui/icons-material';

export const OptionsView = ({ onSelectFriends, onSelectEmail, onClose }) => {
    const { t } = useTranslation();
    
    return (
      <>
        <DialogTitle>
          {t('membersList.addMember')}
        </DialogTitle>
        
        <Box sx={{ p: 2 }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {t('membersList.chooseInviteMethod')}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  p: 3, 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                }}
                onClick={onSelectFriends}
              >
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Avatar sx={{ width: 64, height: 64, mx: 'auto', bgcolor: 'primary.light' }}>
                    <GroupIcon fontSize="large" />
                  </Avatar>
                </Box>
                <Typography variant="h6" align="center" gutterBottom>
                  {t('membersList.inviteFromFriends')}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {t('membersList.inviteFromFriendsDesc')}
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  p: 3, 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                }}
                onClick={onSelectEmail}
              >
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Avatar sx={{ width: 64, height: 64, mx: 'auto', bgcolor: 'secondary.light' }}>
                    <EmailIcon fontSize="large" />
                  </Avatar>
                </Box>
                <Typography variant="h6" align="center" gutterBottom>
                  {t('membersList.inviteByEmail')}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {t('membersList.inviteByEmailDesc')}
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
        
        <DialogActions>
          <Button onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </DialogActions>
      </>
    );
  };