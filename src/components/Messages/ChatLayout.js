// src/components/Messages/ChatLayout.js
import React, { useState, useEffect } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import ConversationsList from './ConversationList';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import SelectConversation from './SelectConversation';

/**
 * Chat layout component that handles responsive design for the messaging interface
 * Displays conversations list and active chat side by side on desktop
 * Shows either conversations list or active chat on mobile with automatic switching
 * 
 * @component
 * @returns {React.ReactElement} Responsive chat interface layout
 */
const ChatLayout = () => {
  // Use theme directly from MUI
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
  const { uidDestinatario } = useParams();
  const location = useLocation();
  
  // Control which view is active on mobile devices
  const [mobileView, setMobileView] = useState('list');
  
  // Update mobile view based on route changes
  useEffect(() => {
    if (isMobile) {
      setMobileView(uidDestinatario ? 'chat' : 'list');
    }
  }, [isMobile, uidDestinatario, location]);
  
  // Mobile layout - show either conversations list or chat
  if (isMobile) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 80px)',
        width: '100%',
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 1
      }}>
        {mobileView === 'list' ? <ConversationsList /> : <Outlet />}
      </Box>
    );
  }
  
  // Desktop layout - show conversations list and chat side by side
  return (
    <Box sx={{
      display: 'flex',
      height: 'calc(100vh - 80px)',
      width: '100%',
      bgcolor: 'background.paper',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: 1
    }}>
      {/* Conversations list - fixed width */}
      <Box sx={{ 
        width: 320,
        borderRight: 1,
        borderColor: 'divider'
      }}>
        <ConversationsList />
      </Box>
      
      {/* Chat area - flexible width */}
      <Box sx={{ 
        flexGrow: 1,
        display: 'flex'
      }}>
        {!uidDestinatario ? <SelectConversation /> : <Outlet />}
      </Box>
    </Box>
  );
};

export default ChatLayout;