// ChatLayout.js
import React from 'react';
import { Box } from '@mui/material';
import ConversationsList from './ConversationList';
import { Outlet } from 'react-router-dom';

const ChatLayout = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      width: '100%', 
      height: '100vh',
      bgcolor: 'background.default'
    }}>
      <ConversationsList />
      <Box sx={{ flexGrow: 1, height: '100vh' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default ChatLayout;