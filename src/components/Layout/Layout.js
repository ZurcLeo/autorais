// src/components/Layout/Layout.js
import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, useMediaQuery, CssBaseline } from '@mui/material';
import { serviceLocator } from '../../core/services/BaseService';
import { useInterests } from '../../providers/InterestsProvider';
import TopNavBar from './TopNavBar';
import Sidebar from './Sidebar';
import { coreLogger } from '../../core/logging';
import { LOG_LEVELS } from '../../core/constants/config';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../providers/NotificationProvider';

const SIDEBAR_WIDTH = 300;
const SIDEBAR_WIDTH_COLLAPSED = 90;
const MODULE_NAME = 'Layout';

const Layout = ({ children }) => {
  const { t } = useTranslation();
    const serviceStore = serviceLocator.get('store').getState()?.auth;
    const { isAuthenticated, currentUser, authLoading } = serviceStore;
  // const { userLoading } = useUser();
  const { loading } = useInterests();
  const {notifLoading} = useNotifications
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));
  
  // Definir quando os dados estão prontos para exibição
  const isDataReady = !authLoading && !notifLoading &&
    ((!loading.userInterests && !loading.availableInterests) || 
    !isAuthenticated) && 
    (!!currentUser || !isAuthenticated);

  // Ajuste para o comportamento de dispositivos móveis
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // useEffect(() => {
  //   coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'Layout state changed', {
  //     isMobile,
  //     sidebarOpen,
  //     mobileOpen,
  //     path: location.pathname
  //   });
  // }, [isMobile, sidebarOpen, mobileOpen, location.pathname]);

  const toggleSidebar = useCallback(() => {
    console.log("toggleSidebar chamado", isMobile, mobileOpen, sidebarOpen);
    if (isMobile) {
      console.log("É mobile, setMobileOpen será chamado com:", !mobileOpen);
      setMobileOpen(!mobileOpen);
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Mobile sidebar toggled', {
        newState: !mobileOpen
      });
    } else {
      console.log("Não é mobile, setSidebarOpen será chamado com:", !sidebarOpen);
      setSidebarOpen(!sidebarOpen);
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Sidebar toggled', {
        newState: !sidebarOpen
      });
    }
  }, [sidebarOpen]);

  useEffect(() => {
    if (isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile, mobileOpen]);

  if (!isDataReady) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography ml={2}>Carregando seus dados...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Calcula a largura do conteúdo com base na visibilidade do Sidebar
  const contentWidth = isMobile 
    ? '100%' 
    : `calc(100% - ${sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_COLLAPSED}px)`;

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>  
      <CssBaseline />
      
      <TopNavBar 
        sidebarOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />
      
      <Sidebar 
        open={isMobile ? mobileOpen : sidebarOpen}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
        sidebarWidth={SIDEBAR_WIDTH}
        collapsedWidth={SIDEBAR_WIDTH_COLLAPSED}
      />
      
      <Box 
        component="main"
        sx={{
          flexGrow: 1,
          width: contentWidth,
          marginLeft: isMobile ? 0 : (sidebarOpen ? 0 : `${SIDEBAR_WIDTH_COLLAPSED - SIDEBAR_WIDTH}px`),
          marginTop: '64px',
          p: 3,
          transition: 'margin 225ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
          height: 'calc(100vh - 64px)',
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;