// src/privateRoutes.js - Corrigido
import React, { useEffect, useState } from 'react';
import { LOG_LEVELS } from './core/constants/config';
import { Navigate, useLocation } from 'react-router-dom';
import { coreLogger } from './core/logging';
import { serviceLocator } from './core/services/BaseService';
import { Box, CircularProgress, Typography } from '@mui/material';

const MODULE_NAME = 'PrivateRoutes';

const LoadingScreen = ({ message = 'Carregando...' }) => (
  <Box 
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column'
    }}
  >
    <CircularProgress size={40} />
    <Typography variant="body1" sx={{ mt: 2 }}>
      {message}
    </Typography>
  </Box>
);

export const PrivateRoute = ({ element }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    currentUser: null,
    isLoading: true,
    isChecked: false
  });
  const location = useLocation();

  // Efeito para carregar o estado de autenticação diretamente do serviço
  useEffect(() => {
    const checkAuthState = () => {
      try {
        // Obter estado da store
        const storeState = serviceLocator.get('store').getState()?.auth;
        const { isAuthenticated, currentUser, authLoading } = storeState || {};

        // Obter usuário diretamente do serviço como fallback
        const serviceUser = serviceLocator.get('auth').getCurrentUser();
        
        // Determinar estado final de autenticação combinando ambas fontes
        const finalIsAuthenticated = isAuthenticated || Boolean(serviceUser);
        const finalUser = currentUser || serviceUser;
        
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Auth state checked', {
          isAuthenticatedFromStore: Boolean(isAuthenticated),
          isAuthenticatedFromService: Boolean(serviceUser),
          finalIsAuthenticated,
          hasUser: Boolean(finalUser),
          path: location.pathname
        });

        // Atualizar estado local
        setAuthState({
          isAuthenticated: finalIsAuthenticated,
          currentUser: finalUser,
          isLoading: authLoading === true,
          isChecked: true
        });
      } catch (error) {
        console.error('[PRIVATE_ROUTE] Erro ao verificar autenticação:', error);
        setAuthState({
          isAuthenticated: false,
          currentUser: null,
          isLoading: false,
          isChecked: true
        });
      }
    };

    // Verificar imediatamente
    checkAuthState();
    
    // Verificar novamente após breve delay para dar tempo aos serviços de inicializarem
    const timeoutId = setTimeout(checkAuthState, 300);
    
    // Cleanup
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  // Log para depuração
  useEffect(() => {
    console.log("[PRIVATE_ROUTE] Estado de autenticação:", authState);
  }, [authState]);

  // Se ainda está carregando ou não foi verificado
  if (authState.isLoading || !authState.isChecked) {
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Loading state active');
    return <LoadingScreen message="Verificando sessão..." />;
  }

  // Se não estiver autenticado, redirecionar para login
  if (!authState.isAuthenticated) {
    console.log('[PRIVATE_ROUTE] User is not authenticated, redirecting to login...');
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Redirecting to login', {
      path: location.pathname,
    });
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Se estiver autenticado, mas não tiver usuário (caso improvável)
  if (!authState.currentUser) {
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.WARNING, 'Authenticated but no user data', {
      path: location.pathname,
    });
    return <LoadingScreen message="Carregando dados do usuário..." />;
  }

  // Sucesso: usuário autenticado e dados disponíveis
  coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Rendering protected content', {
    userId: authState.currentUser?.uid,
    path: location.pathname
  });

  // Passar o usuário como prop para o componente filho
  return React.cloneElement(element, { userFromService: authState.currentUser });
};