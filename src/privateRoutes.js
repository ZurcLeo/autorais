// src/privateRoutes.js - Simplificado para fonte única de autenticação
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSimpleAuth } from './hooks/useSimpleAuth';
import { Box, CircularProgress, Typography } from '@mui/material';

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
  const { isAuthenticated, currentUser, authLoading } = useSimpleAuth();
  const location = useLocation();

  console.log('[PRIVATE_ROUTE] Estado de autenticação:', {
    isAuthenticated,
    hasUser: !!currentUser,
    authLoading,
    path: location.pathname
  });

  // Se ainda está carregando
  if (authLoading) {
    return <LoadingScreen message="Verificando sessão..." />;
  }

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    console.log('[PRIVATE_ROUTE] User is not authenticated, redirecting to login...');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Se estiver autenticado, mas não tiver dados do usuário
  if (!currentUser) {
    return <LoadingScreen message="Carregando dados do usuário..." />;
  }

  // Sucesso: usuário autenticado e dados disponíveis
  console.log('[PRIVATE_ROUTE] Rendering protected content for user:', currentUser.uid);

  // Passar o usuário como prop para o componente filho
  return React.cloneElement(element, { userFromAuth: currentUser });
};