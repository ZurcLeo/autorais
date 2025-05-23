// OpenSimulatorButton.jsx
import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import {
  CalculateOutlined,
  Close as CloseIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import CaixinhaSimulatorDialog from './CaixinhaCalculator';

const OpenSimulatorButton = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<CalculateOutlined />}
        onClick={handleOpen}
        sx={{
          mb: 3,
          borderRadius: 2,
          py: 1.2,
          px: 3,
          boxShadow: 3,
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: 6
          }
        }}
      >
        {t('openSimulator')} {/* Adicione esta chave de tradução */}
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 24
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" component="div" fontWeight="bold" color="secondary">
              {t('simulatorTitle')} {/* Adicione esta chave de tradução */}
            </Typography>
            <IconButton
              edge="end"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <CaixinhaSimulatorDialog onClose={handleClose} />

        <DialogActions sx={{ p: 2, justifyContent: 'flex-end' }}>
          <Button onClick={handleClose} color="primary">
            {t('close')} {/* Adicione esta chave de tradução */}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OpenSimulatorButton;