import React, { useState } from 'react';
import { Modal, Box, IconButton, Typography, TextField, Button, Switch, FormControlLabel } from '@mui/material';
import inviteService from '../../services/inviteService';
import { GiPassport } from "react-icons/gi";
import { showToast, showPromiseToast } from '../../utils/toastUtils';
import { useTranslation } from 'react-i18next'; // Importando a função de tradução

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const InvitationSendModal = ({ open, handleClose }) => {
  const { t } = useTranslation(); // Usando a função de tradução
  const [email, setEmail] = useState('');
  const [friendName, setFriendName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [shareProfile, setShareProfile] = useState(false);

  const handleSendInvite = async () => {
    if (agreeTerms && shareProfile) {
      const invitationData = {
        email: email,
        friendName: friendName,
      };

      const sendInvitePromise = inviteService.sendInvitation(invitationData);

      showPromiseToast(sendInvitePromise, {
        loading: t('invitationSendModal.sending'), // Texto de carregamento traduzido
        success: t('invitationSendModal.success'), // Texto de sucesso traduzido
        error: t('invitationSendModal.error'), // Texto de erro traduzido
      });

      sendInvitePromise
        .then((result) => {
          if (!result) {
            showToast(t('invitationSendModal.problem'), { type: 'info' }); // Texto de aviso traduzido
          }
          handleClose();
        })
        .catch((error) => {
          console.error('Erro ao enviar convite:', error.message);
        });
    } else {
      showToast(t('invitationSendModal.termsError'), { type: 'warning' }); // Texto de aviso sobre termos
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-title" variant="h6" component="h2">
          <IconButton size="large">
            <GiPassport />
          </IconButton>
          {t('invitationSendModal.title')} 
        </Typography>
        <Typography variant="body1" paragraph>
          {t('invitationSendModal.rules')} 
          <ul>
            <li>{t('invitationSendModal.rule1')}</li>
            <li>{t('invitationSendModal.rule2')}</li>
            <li>{t('invitationSendModal.rule3')}</li>
          </ul>
        </Typography>
        <TextField
          fullWidth
          label={t('invitationSendModal.friendName')} 
          variant="outlined"
          margin="normal"
          value={friendName}
          onChange={(e) => setFriendName(e.target.value)}
        />
        <TextField
          fullWidth
          label={t('invitationSendModal.friendEmail')} 
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormControlLabel
          style={{ marginTop: 30 }}
          control={<Switch checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />}
          label={t('invitationSendModal.agreeTerms')} 
        />
        <FormControlLabel
          control={<Switch checked={shareProfile} onChange={(e) => setShareProfile(e.target.checked)} />}
          label={t('invitationSendModal.shareProfile')} 
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendInvite}
          style={{ marginTop: 30 }}
          disabled={!agreeTerms || !shareProfile}
        >
          {t('invitationSendModal.sendInvite')}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleClose}
          style={{ marginTop: 30 }}
        >
          {t('invitationSendModal.cancel')} 
        </Button>
        <Button
          variant="text"
          color="primary"
          href="/termos-de-uso"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('invitationSendModal.viewTerms')}
        </Button>
        <Button
          variant="text"
          color="primary"
          href="/politica-de-privacidade"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('invitationSendModal.viewPrivacy')} 
        </Button>
        <Typography variant="body2" color="textSecondary" align="center">
          © 2023 ElosCloud. {t('invitationSendModal.allRightsReserved')}
        </Typography>
      </Box>
    </Modal>
  );
};

export default InvitationSendModal;