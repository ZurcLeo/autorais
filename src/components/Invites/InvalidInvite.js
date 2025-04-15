// src/components/Invites/InvalidInvite.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const InvalidInvite = () => {
  const navigate = useNavigate();
  
  return (
    <Box sx={{ textAlign: 'center', maxWidth: 500, mx: 'auto', mt: 8, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Convite Inválido
      </Typography>
      <Typography variant="body1" paragraph>
        O convite que você tentou acessar é inválido, expirou ou já foi utilizado.
      </Typography>
      <Typography variant="body2" paragraph color="text.secondary">
        Se você acredita que isso é um erro, entre em contato com a pessoa que enviou o convite 
        e peça um novo link.
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => navigate('/login')}
        sx={{ mt: 2 }}
      >
        Ir para a página de login
      </Button>
    </Box>
  );
};

export default InvalidInvite;