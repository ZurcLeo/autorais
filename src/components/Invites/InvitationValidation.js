import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, CircularProgress, Card, CardContent, Avatar } from '@mui/material';
import inviteService from '../../services/inviteService';

const InvitationValidation = () => {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [inviterInfo, setInviterInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { inviteId } = useParams();

  const handleValidateInvite = async () => {
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!email || !nome || !inviteId) {
        setError('Por favor, preencha todos os campos.');
        setLoading(false);
        return;
      }

      const response = await inviteService.validateInvite(inviteId, email, nome);
      setInviterInfo(response.inviter);
      setSuccess(true);
      setLoading(false);

      setTimeout(() => navigate('/register', { state: { inviteId, email, nome } }), 2000);
    } catch (error) {
      setError('Erro ao validar convite. Verifique os dados inseridos.');
      setInviterInfo(null);
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', textAlign: 'center' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Validação de Convite
      </Typography>
      <TextField
        label="Email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Nome"
        fullWidth
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleValidateInvite}
        fullWidth
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Validar Convite'}
      </Button>

      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

      {success && (
        <Typography color="success" sx={{ mt: 2 }}>
          Convite validado com sucesso! Redirecionando...
        </Typography>
      )}

      {inviterInfo && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Avatar sx={{ margin: 'auto', mb: 2 }}>
              {inviterInfo.nome.charAt(0)}
            </Avatar>
            <Typography variant="h6">{inviterInfo.nome}</Typography>
            <Typography variant="body2" color="textSecondary">
              {inviterInfo.email}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default InvitationValidation;