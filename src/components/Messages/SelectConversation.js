// src/components/Messages/SelectConversation.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { useNavigate } from 'react-router-dom';

const SelectConversation = () => {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'text.secondary',
        p: 3
      }}
    >
      <ChatBubbleOutlineIcon sx={{ fontSize: 64, mb: 2, color: 'primary.light' }} />
      <Typography variant="h5" gutterBottom align="center">
        Selecione uma conversa para começar
      </Typography>
      <Typography variant="body1" align="center" sx={{ maxWidth: 500, mb: 4 }}>
        Escolha um contato da lista ao lado para iniciar um chat ou encontre novos contatos.
      </Typography>
      
      <Button 
        variant="outlined" 
        color="primary" 
        startIcon={<PeopleOutlineIcon />}
        onClick={() => navigate('/connections')}
        sx={{ mt: 2 }}
      >
        Gerenciar contatos
      </Button>
    </Box>
  );
};

export default SelectConversation;