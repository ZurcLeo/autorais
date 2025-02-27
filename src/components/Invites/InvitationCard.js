import React, { useState, useCallback } from 'react';
import moment from 'moment';
import { Typography, Tooltip, IconButton, Card, CardContent, Menu, MenuItem, Box, Chip } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next'; // Importando a função de tradução

const InvitationCard = ({ invitation, onCancel, onResend }) => {
  const { t } = useTranslation(); // Usando a função de tradução
  const [anchorEl, setAnchorEl] = useState(null);
  const [showCode, setShowCode] = useState(false);

  const handleMenuOpen = useCallback((event) => setAnchorEl(event.currentTarget), []);
  const handleMenuClose = useCallback(() => setAnchorEl(null), []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'used': return 'success';
      case 'canceled': return 'error';
      case 'expired': return 'default';
      default: return 'default';
    }
  }, []);

  const getStatusMessage = useCallback((status, date, email) => {
    switch (status) {
      case 'pending':
        return t('invitationCard.status.pending');
      case 'used':
        return t('invitationCard.status.used', { date: moment(date).format('DD/MM/YYYY') });
      case 'canceled':
        return t('invitationCard.status.canceled', { date: moment(date).format('DD/MM/YYYY') });
      case 'expired':
        return t('invitationCard.status.expired', { email });
      default:
        return '';
    }
  }, [t]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body1">
              {invitation.email}
            </Typography>
            <Chip 
              label={t(`invitationCard.status.${invitation.status}`)} // Tradução da label de status
              color={getStatusColor(invitation.status)}
              size="small"
            />
            <IconButton 
              size="small" 
              onClick={handleMenuOpen}
              aria-label={t('invitationCard.options')} // Traduzindo o texto alternativo
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
          <Typography variant="body2" color="textSecondary">
            {t('invitationCard.sentAt', { date: moment(invitation.createdAt).format('DD/MM/YYYY') })} 
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {getStatusMessage(invitation.status, invitation.createdAt, invitation.email)}
          </Typography>
          {showCode && (
            <Typography variant="body2" color="textPrimary">
              {t('invitationCard.inviteCode')}: {invitation.inviteId}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Menu 
        anchorEl={anchorEl} 
        open={Boolean(anchorEl)} 
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {invitation.status === 'pending' && (
          [
            <MenuItem key="showCode" onClick={() => { setShowCode(!showCode); handleMenuClose(); }}>
              {showCode ? t('invitationCard.hideCode') : t('invitationCard.showCode')} 
            </MenuItem>,
            <MenuItem key="resend" onClick={() => { onResend(invitation.inviteId); handleMenuClose(); }}>
              {t('invitationCard.resendInvite')}
            </MenuItem>,
            <MenuItem key="cancel" onClick={() => { onCancel(invitation.inviteId); handleMenuClose(); }}>
              {t('invitationCard.cancelInvite')}
            </MenuItem>
          ]
        )}
        {invitation.status === 'expired' && (
          <MenuItem onClick={() => { onResend(invitation.inviteId); handleMenuClose(); }}>
            {t('invitationCard.resendInvite')}
          </MenuItem>
        )}
        {invitation.status === 'used' && (
          <MenuItem disabled>{t('invitationCard.inviteAccepted')}</MenuItem>
        )}
      </Menu>
    </motion.div>
  );
};

export default React.memo(InvitationCard);