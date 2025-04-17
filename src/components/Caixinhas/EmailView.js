import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useValidation } from '../../providers/ValidationProvider';
import { 
  Box, 
  Button, 
  TextField, 
  IconButton, 
  DialogTitle, 
  DialogActions, 
  Alert, 
  CircularProgress 
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

export const EmailView = ({ formData, onChange, onBack, onSend, inviteStatus }) => {
    const { t } = useTranslation();
    const { validateField } = useValidation();
    
    const [emailError, setEmailError] = useState('');
    
    const handleEmailChange = (e) => {
      const value = e.target.value;
      onChange('email', value);
      
      // Validação em tempo real
      const error = validateField(value, 'email', { required: true });
      setEmailError(error);
    };
    
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
          {t('membersList.inviteByEmail')}
        </DialogTitle>
        
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            label={t('common.email')}
            type="email"
            value={formData.email}
            onChange={handleEmailChange}
            variant="outlined"
            margin="normal"
            error={!!emailError}
            helperText={emailError}
            disabled={inviteStatus === 'sending'}
            required
          />
          
          <TextField
            fullWidth
            label={t('membersList.personalMessage')}
            value={formData.message}
            onChange={(e) => onChange('message', e.target.value)}
            variant="outlined"
            margin="normal"
            multiline
            rows={4}
            placeholder={t('membersList.personalMessagePlaceholder')}
            disabled={inviteStatus === 'sending'}
          />
          
          {inviteStatus === 'success' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {t('membersList.inviteSentSuccess')}
            </Alert>
          )}
          
          {inviteStatus === 'error' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {t('membersList.inviteSentError')}
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
            disabled={!formData.email || !!emailError || inviteStatus === 'sending'}
            onClick={onSend}
            startIcon={inviteStatus === 'sending' ? <CircularProgress size={20} /> : null}
          >
            {inviteStatus === 'sending' 
              ? t('membersList.sending')
              : t('membersList.sendInvite')}
          </Button>
        </DialogActions>
      </>
    );
  };