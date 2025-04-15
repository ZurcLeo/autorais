// src/privateRoutes.js
import React, { useEffect, useState } from 'react';
import { LOG_LEVELS } from './core/constants/config';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { coreLogger } from './core/logging';
import { serviceLocator } from './core/services/BaseService';
import { AUTH_ACTIONS } from './core/constants/actions';

const MODULE_NAME = 'PrivateRoutes';

export const PrivateRoute = ({ element }) => {
  const storeService = serviceLocator.get('store').getState()?.auth;
  const { isAuthenticated, currentUser, authLoading, isFirstAccess } = storeService;
  const location = useLocation();
  const navigate = useNavigate();
  // const [storeService, setstoreService] = useState({
  //   isAuthenticated: false,
  //   currentUser: null,
  //   isLoading: true
  // });

  // // Carregar o estado diretamente do serviço
  // useEffect(() => {
  //   const loadstoreService = () => {
  //     try {
  // const storeService = serviceLocator.get('store').getState()?.auth;
  // const { isAuthenticated, currentUser, authLoading } = storeService;

  //       // Obter usuário do serviço
        
  //       // Atualizar estado local com dados do serviço
  //       // setstoreService({
  //       //   isAuthenticated,
  //       //   currentUser,
  //       //   isLoading: false
  //       // });
        
  //       // Sincronizar a store com o serviço (opcional, mas recomendado)
  //       if (isAuthenticated && storeService && storeService.isInitialized) {
  //         // const storeState = storeService.getState()?.auth;
          
  //         // Sincronizar apenas se a store estiver inconsistente
  //         if (!storeService?.currentUser || storeService.currentUser?.uid !== serviceUser.uid) {
  //           console.warn('[PRIVATE_ROUTE] Sincronizando store com serviço');
  //           storeService.dispatch({
  //             type: AUTH_ACTIONS.LOGIN_SUCCESS,
  //             payload: {
  //               currentUser: serviceUser,
  //               isAuthenticated: true
  //             }
  //           });
  //         }
  //       }
  //     } catch (error) {
  //       console.error('[PRIVATE_ROUTE] Erro ao carregar estado de autenticação:', error);
  //       // setstoreService({
  //       //   isAuthenticated: false,
  //       //   currentUser: null,
  //       //   isLoading: false
  //       // });
  //     }
  //   };
    
  //   loadstoreService();
    
  //   // Opcional: estabelecer um intervalo para verificar consistência
  //   const intervalId = setInterval(loadstoreService, 5000);
  //   return () => clearInterval(intervalId);
  // }, [location.pathname]);

  // useEffect(() => {
  //   if (isAuthenticated && isFirstAccess) {
  //     navigate('/complete-profile', { replace: true });
  //   }
  // }, [storeService, navigate]);

  // Log para depuração
  useEffect(() => {
    console.log("[PRIVATE_ROUTE] Estado de autenticação do serviço:", storeService);
  }, [storeService]);

  // Registrar evento de ciclo de vida
  coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'Component rendered', {
    isAuthenticated: storeService.isAuthenticated,
    isLoading: storeService.isLoading,
    path: location.pathname,
  });

  // Se ainda está carregando
  if (storeService.isLoading) {
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Loading state active');
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Carregando...</div>
      </div>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  if (!storeService.isAuthenticated) {
    console.log('[PRIVATE_ROUTE] User is not authenticated, redirecting to login...');

    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Redirecting to login', {
      path: location.pathname,
    });
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Se estiver autenticado, mas não tiver usuário (caso improvável com esta abordagem)
  if (!storeService.currentUser) {
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.WARNING, 'Authenticated but no user data', {
      path: location.pathname,
    });
    
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Carregando dados do usuário...</div>
      </div>
    );
  }

  // Sucesso: usuário autenticado e dados disponíveis
  coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Rendering protected content', {
    userId: storeService.currentUser?.uid,
    path: location.pathname,
    source: 'direct-service'
  });

  // Passar o usuário como prop para o componente filho
  return React.cloneElement(element, { userFromService: storeService.currentUser });
};