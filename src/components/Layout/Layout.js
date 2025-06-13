// Layout.js corrigido para resolver problema após login

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  useMediaQuery, 
  CssBaseline, 
  useTheme,
  Fade
} from '@mui/material';
import { useInterests } from '../../providers/InterestsProvider';
import ModernTopNavBar from './ModernTopNavBar';
import ModernSidebar from './ModernSidebar';
import { coreLogger } from '../../core/logging';
import { LOG_LEVELS } from '../../core/constants/config';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../providers/NotificationProvider';
import { useAuth } from '../../providers/AuthProvider';

// Configuration constants
const LAYOUT_CONFIG = {
  SIDEBAR_WIDTH: 280,
  SIDEBAR_WIDTH_COLLAPSED: 80,
  TOPBAR_HEIGHT: 64,
  MODULE_NAME: 'Layout',
  TRANSITION_DURATION: 225,
  DATA_READY_TIMEOUT: 2000 // Tempo máximo de espera para dados serem carregados (ms)
};

/**
 * Main application layout component
 * Handles responsive sidebar behavior and authentication state
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render in the main content area
 * @returns {React.ReactElement} The layout structure
 */
const Layout = ({ children }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isAuthenticated, currentUser, authLoading } = useAuth();
  const { loading: interestsLoading } = useInterests();
  const { notifLoading } = useNotifications();
  const location = useLocation();
  
  // Estado para sidebar behavior
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Estado para controlar timeout forçado
  const [forceRender, setForceRender] = useState(false);
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Check if data is ready for display - Lógica simplificada e mais resiliente
  const isDataReady = useMemo(() => {
    const authReady = !authLoading && (!!currentUser || !isAuthenticated);
    
    // Log para debugging
    console.log('Layout - Verificando estado de prontidão:', {
      authLoading,
      authReady,
      isAuthenticated,
      hasCurrentUser: !!currentUser,
      interestsLoading: interestsLoading || {},
      forceRender
    });
    
    // Simplificamos a verificação para torná-la mais resiliente
    return authReady || forceRender;
  }, [authLoading, interestsLoading, isAuthenticated, currentUser, forceRender]);

  // Implementamos um timeout para forçar renderização após um período
  useEffect(() => {
    // Se já está pronto, não precisamos do timeout
    if (isDataReady) return;
    
    // Timeout para forçar renderização após tempo limite
    const timeoutId = setTimeout(() => {
      console.log('Layout - Forçando renderização após timeout');
      setForceRender(true);
    }, LAYOUT_CONFIG.DATA_READY_TIMEOUT);
    
    return () => clearTimeout(timeoutId);
  }, [isDataReady]);

  // Calculate effective sidebar width based on state
  const sidebarWidth = useMemo(() => (
    isMobile ? 0 : (sidebarOpen ? LAYOUT_CONFIG.SIDEBAR_WIDTH : LAYOUT_CONFIG.SIDEBAR_WIDTH_COLLAPSED)
  ), [isMobile, sidebarOpen]);

  // Adjust sidebar state based on screen size
  useEffect(() => {
    setSidebarOpen(!isMobile);
    
    // coreLogger.logEvent(LAYOUT_CONFIG.MODULE_NAME, LOG_LEVELS.STATE, 'Sidebar state updated based on screen size', {
    //   isMobile,
    //   sidebarOpen: !isMobile
    // });
  }, [isMobile]);

  // Toggle sidebar state
  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileOpen(prevState => {
        const newState = !prevState;
        // coreLogger.logEvent(LAYOUT_CONFIG.MODULE_NAME, LOG_LEVELS.STATE, 'Mobile sidebar toggled', {
        //   newState
        // });
        return newState;
      });
    } else {
      setSidebarOpen(prevState => {
        const newState = !prevState;
        // coreLogger.logEvent(LAYOUT_CONFIG.MODULE_NAME, LOG_LEVELS.STATE, 'Sidebar toggled', {
        //   newState
        // });
        return newState;
      });
    }
  }, [isMobile]);

  // Close mobile sidebar on page navigation
  useEffect(() => {
    if (isMobile && mobileOpen) {
      setMobileOpen(false);
      // coreLogger.logEvent(LAYOUT_CONFIG.MODULE_NAME, LOG_LEVELS.STATE, 'Mobile sidebar auto-closed on navigation', {
      //   path: location.pathname
      // });
    }
  }, [isMobile, mobileOpen]);

  // Loading state
  if (!isDataReady) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: theme.palette.background.default
        }}
      >
        <CircularProgress size={48} thickness={4} />
        <Typography 
          variant="h6" 
          color="primary" 
          sx={{ 
            mt: 3, 
            fontWeight: 500,
            textAlign: 'center',
            maxWidth: '80%'
          }}
        >
          {t('layout.loading')}
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    coreLogger.logEvent(LAYOUT_CONFIG.MODULE_NAME, LOG_LEVELS.AUTH, 'Redirecting to login - not authenticated');
    return <Navigate to="/login" replace />;
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>  
      <CssBaseline />
      
      {/* Modern Top Navigation Bar */}
      <ModernTopNavBar 
        sidebarOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
        sidebarWidth={sidebarWidth}
      />
      
      {/* Modern Sidebar Navigation */}
      <ModernSidebar 
        open={isMobile ? mobileOpen : sidebarOpen}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
        sidebarWidth={LAYOUT_CONFIG.SIDEBAR_WIDTH}
        collapsedWidth={LAYOUT_CONFIG.SIDEBAR_WIDTH_COLLAPSED}
      />
      
      {/* Main Content Area */}
      <Fade in={isDataReady} timeout={300}>
        <Box 
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            marginTop: `${LAYOUT_CONFIG.TOPBAR_HEIGHT}px`,
            p: { xs: 2, sm: 3 }, // Responsive padding
            height: `calc(100vh - ${LAYOUT_CONFIG.TOPBAR_HEIGHT}px)`,
            overflow: 'auto',
            transition: theme.transitions.create(['width'], {
              easing: theme.transitions.easing.sharp,
              duration: LAYOUT_CONFIG.TRANSITION_DURATION,
            }),
            backgroundColor: theme.palette.background.default,
            position: 'relative',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
          }}
        >
          {children}
        </Box>
      </Fade>
    </Box>
  );
};

export default Layout;