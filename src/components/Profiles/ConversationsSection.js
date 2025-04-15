import React from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { Box, Typography } from '@mui/material';
import { MessageSharp as MessageIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { serviceLocator } from '../../core/services/BaseService';

const ConversationsSection = () => {
  const { t } = useTranslation();
      const serviceStore = serviceLocator.get('store').getState()?.auth;
      const { currentUser } = serviceStore;

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <MessageIcon color="action" />
        <Typography variant="h5" component="div" ml={1}>
          {t('conversations.unreadConversationsTitle')}
        </Typography>
      </Box>
      <Typography variant="body1">
        {currentUser.conversasComMensagensNaoLidas?.length || 0} {t('conversations.unreadConversationsCount')}
      </Typography>
    </Box>
  );
};

export default ConversationsSection;