// src/components/Messages/SelectConversation.js
import React from 'react';
import { Box, Typography } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const SelectConversation = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'text.secondary'
      }}
    >
      <ChatBubbleOutlineIcon sx={{ fontSize: 64, mb: 2 }} />
      <Typography variant="h6">
        Selecione uma conversa para começar
      </Typography>
      <Typography variant="body2">
        Escolha um amigo da lista ao lado para iniciar um chat
      </Typography>
    </Box>
  );
};

export default SelectConversation;