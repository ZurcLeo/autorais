// ValidateInvite.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import axios from 'axios';

const ValidateInvite = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [inviteId, setInviteId] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const inviteIdParam = searchParams.get('inviteId');
    setInviteId(inviteIdParam);

    if (!inviteIdParam) {
      toast.error('Convite inválido.');
    }
  }, [location.search]);

  const handleValidateInvite = async () => {
    if (!userEmail) {
      toast.error('Por favor, insira o email que recebeu o convite.');
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/invite/validate`, { inviteId, userEmail });

      if (response.data.success) {
        toast.success('Convite validado com sucesso! Você recebeu 5.000 ElosCoins.');
        localStorage.setItem('validatedInvite', JSON.stringify({ inviteId, userEmail }));
        navigate('/Registro');
      } else {
        toast.error('Falha ao validar o convite.');
      }
    } catch (error) {
      console.error('Erro ao validar o convite:', error);
      toast.error('Erro ao validar o convite.');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Validar Convite
      </Typography>
      <Box component="form">
        <TextField
          id="email-invite"
          label="Email que recebeu o convite"
          variant="outlined"
          fullWidth
          margin="normal"
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          required
        />
        <Button variant="contained" onClick={handleValidateInvite} fullWidth sx={{ mt: 3 }}>
          Validar Convite
        </Button>
      </Box>
    </Container>
  );
};

export default ValidateInvite;
