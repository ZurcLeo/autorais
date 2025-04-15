import React, { useState } from 'react';
import { Modal, Box, IconButton, Typography, TextField, Button, Switch, FormControlLabel, Grid } from '@mui/material';
import { useInvites } from './../../providers/InviteProvider'
import { GiPassport } from "react-icons/gi";
import { showToast, showPromiseToast, showContextualToast } from '../../utils/toastUtils';
import { useTranslation } from 'react-i18next';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800, // Aumentando a largura do modal
  bgcolor: 'background.paper',
  border: '1px solid #ccc', // Tornando a borda mais sutil
  boxShadow: 24,
  p: 4,
  borderRadius: 4, // Aumentando o border radius para um visual mais moderno
};

const InvitationSendModal = ({ open, handleClose }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const { sendInvitation } = useInvites();
  const [friendName, setFriendName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [shareProfile, setShareProfile] = useState(false);

  const handleSendInvite = async () => {
    // Validar entradas
    if (!email.trim()) {
      showToast(t('invitationSendModal.emailRequired'), {
        type: 'warning',
        animation: 'pulse'
      });
      return;
    }

    if (!friendName.trim()) {
      showToast(t('invitationSendModal.nameRequired'), {
        type: 'warning',
        animation: 'pulse'
      });
      return;
    }

    if (agreeTerms && shareProfile) {
      const invitationData = {
        email: email.trim(),
        friendName: friendName.trim(),
      };

      try {
        // Uso do toast de promise aprimorado
        await showPromiseToast(
          sendInvitation(invitationData),
          {
            loading: t('invitationSendModal.sending'),
            success: t('invitationSendModal.success'),
            error: t('invitationSendModal.error')
          },
          {
            // Configurações extras
            errorAction: {
              label: t('common.tryAgain'),
              onClick: () => handleSendInvite()
            },
            // Animação para feedback visual aprimorado
            animation: 'success'
          }
        );

        // Fechar o modal após envio bem-sucedido
        handleClose();

        // Mostrar mensagem de acompanhamento com instruções
        setTimeout(() => {
          showContextualToast(
            t('invitationSendModal.followUp', { email: email.trim() }),
            'invitationSuccess',
            {
              action: {
                label: t('invitationSendModal.viewInvitations'),
                onClick: () => {
                  // Navegar para a lista de convites (você pode adicionar navegação aqui)
                  console.log('Navegar para lista de convites');
                }
              }
            }
          );
        }, 1000);
      } catch (error) {
        console.error('Erro ao enviar convite:', error.message);
        showContextualToast(
          t('invitationSendModal.problem'),
          'invitationError',
          {
            action: {
              label: t('common.tryAgain'),
              onClick: () => handleSendInvite()
            }
          }
        );
      }
    } else {
      // Mensagem de erro quando termos não foram aceitos
      showToast(t('invitationSendModal.termsError'), {
        type: 'warning',
        animation: 'error',
        variant: 'highlighted',
        // Aumentar tempo para garantir que o usuário leia
        autoClose: 8000
      });
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
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography id="modal-title" variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconButton size="large" sx={{ mr: 1 }}>
                <GiPassport />
              </IconButton>
              {t('invitationSendModal.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('invitationSendModal.rules')}
            </Typography>
            <ul>
              <li>
                <Typography variant="body2">
                  {t('invitationSendModal.rule1')}
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  {t('invitationSendModal.rule2')}
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  {t('invitationSendModal.rule3')}
                </Typography>
              </li>
            </ul>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('invitationSendModal.friendName')}
              variant="outlined"
              margin="normal"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('invitationSendModal.friendEmail')}
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />}
              label={t('invitationSendModal.agreeTerms')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch checked={shareProfile} onChange={(e) => setShareProfile(e.target.checked)} />}
              label={t('invitationSendModal.shareProfile')}
            />
          </Grid>
          <Grid item xs={12} sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendInvite}
              disabled={!agreeTerms || !shareProfile}
              fullWidth
            >
              {t('invitationSendModal.sendInvite')}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleClose}
              fullWidth
            >
              {t('invitationSendModal.cancel')}
            </Button>
          </Grid>
          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="text"
              color="primary"
              href="/termos-de-uso"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
            >
              {t('invitationSendModal.viewTerms')}
            </Button>
            <Button
              variant="text"
              color="primary"
              href="/politica-de-privacidade"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
            >
              {t('invitationSendModal.viewPrivacy')}
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
              © 2025 ElosCloud. {t('invitationSendModal.allRightsReserved')}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default InvitationSendModal;