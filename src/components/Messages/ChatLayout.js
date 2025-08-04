// src/components/Messages/ChatLayout.js
import React, { useState, useEffect } from 'react';
import { Box, useMediaQuery, useTheme, alpha } from '@mui/material';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.9)} 0%, 
          ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: theme.shadows[8]
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
      background: `linear-gradient(135deg, 
        ${alpha(theme.palette.background.paper, 0.9)} 0%, 
        ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
      backdropFilter: 'blur(20px)',
      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: theme.shadows[8]
    }}>
      {/* Conversations list - fixed width */}
      <Box sx={{ 
        width: 320,
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
        backdropFilter: 'blur(10px)',
        background: `linear-gradient(180deg, 
          ${alpha(theme.palette.background.paper, 0.95)} 0%, 
          ${alpha(theme.palette.background.paper, 0.85)} 100%)`
      }}>
        <ConversationsList />
      </Box>
      
      {/* Chat area - flexible width */}
      <Box sx={{ 
        flexGrow: 1,
        display: 'flex',
        background: `linear-gradient(180deg, 
          ${alpha(theme.palette.background.default, 0.9)} 0%, 
          ${alpha(theme.palette.background.default, 0.8)} 100%)`,
        backdropFilter: 'blur(10px)'
      }}>
        {!uidDestinatario ? <SelectConversation /> : <Outlet />}
      </Box>
    </Box>
  );
};

export default ChatLayout;