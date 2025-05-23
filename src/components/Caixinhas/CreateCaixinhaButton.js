// CreateCaixinhaButton.jsx
import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import CreateCaixinhaForm from './CreateCaixinhaForm';

const CreateCaixinhaButton = ({ onCreateSuccess }) => {
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
        color="primary"
        startIcon={<AddIcon />}
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
        {t('newCaixinha')}
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
            <Typography variant="h5" component="div" fontWeight="bold" color="primary">
              {t('dialogTitle')}
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
        
        <CreateCaixinhaForm 
          onClose={handleClose} 
          onCreateSuccess={onCreateSuccess} 
        />
      </Dialog>
    </>
  );
};

export default CreateCaixinhaButton;