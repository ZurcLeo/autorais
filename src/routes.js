import React, { useEffect } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { LOG_LEVELS } from './reducers/metadata/metadataReducer';
import { coreLogger } from './core/logging/CoreLogger';
import { ThemeControls } from './ThemeControls.js';
import HomePage from './components/Pages/HomePage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Profile from './components/Profiles/Profile';
import NotificationHistory from './components/Notification/NotificationHistory';
import PrivateRoute from './privateRoutes';
import FriendsPage from './components/Connections/FriendsPage';
import ChatWindow from './components/Messages/ChatWindow';
import ChatLayout from './components/Messages/ChatLayout';
import SelectConversation from './components/Messages/SelectConversation';
import InvitationValidation from './components/Invites/InvitationValidation';
import Layout from './components/Layout/Layout';
import CaixinhaPage from './components/Caixinhas/CaixinhaPage';
import SellerDashboard from './components/Dashboard/SellerDashboard';
import PrivacyPolicy from './components/Pages/Privacy';
import TermsOfUse from './components/Pages/Terms';
import DocHome from './coreDocs/components/DocHome.tsx';
import AppInitializationDoc from './coreDocs/DocViewer/AppInitialization.docs.tsx';
import ResilienceSystemDoc from './coreDocs/DocViewer/ResilienceSystem.docs.tsx';
import AuthenticationDoc from './coreDocs/DocViewer/AuthenticationDoc.tsx';
import StateManagementDoc from './coreDocs/DocViewer/StateManagementDoc.tsx';
import ThemeDoc from './coreDocs/DocViewer/ThemeDoc.tsx';
import LoggingSystemDoc from './coreDocs/DocViewer/LoggingSystemDoc.tsx';
import ErrorHandlingDoc from './coreDocs/DocViewer/ErrorHandlingDoc.tsx';
import DocViewer from './coreDocs/DocViewer/index.tsx';

const AuthenticatedLayout = () => {
  const location = useLocation();
  const startTime = performance.now();

  useEffect(() => {
    coreLogger.logServiceInitStart('AuthenticatedLayout', LOG_LEVELS.LIFECYCLE, 'Layout initialization', {
      path: location.pathname,
      startTimestamp: new Date().toISOString()
    });

    return () => {
      coreLogger.logServiceInitComplete('AuthenticatedLayout', LOG_LEVELS.LIFECYCLE, 'Layout cleanup', {
        path: location.pathname,
        duration: `${Math.round(performance.now() - startTime)}ms`,
        endTimestamp: new Date().toISOString()
      });
    };
  }, []);

  // Log de mudanças de rota no layout autenticado
  useEffect(() => {
    coreLogger.logEvent('AuthenticatedLayout', LOG_LEVELS.STATE, 'Authenticated route change', {
      path: location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [location]);

  return (
    <Layout>
      <ThemeControls />
      <Outlet />
    </Layout>
  );
};

const AppRoutes = () => {
  const location = useLocation();
  const startTime = performance.now();

  // Log de ciclo de vida do componente principal de rotas
  useEffect(() => {
    coreLogger.logServiceInitStart('AppRoutes', LOG_LEVELS.LIFECYCLE, 'Routes initialization', {
      startTimestamp: new Date().toISOString(),
      initialPath: location.pathname
    });

    // Registrar métricas de performance inicial
    const initialLoadTime = performance.now() - startTime;
    coreLogger.logServicePerformance('AppRoutes', LOG_LEVELS.PERFORMANCE, 'Initial routes load', {
      duration: `${Math.round(initialLoadTime)}ms`,
      path: location.pathname
    });

    return () => {
      const totalLifetime = performance.now() - startTime;
      coreLogger.logServiceInitComplete('AppRoutes', LOG_LEVELS.LIFECYCLE, 'Routes cleanup', {
        duration: `${Math.round(totalLifetime)}ms`,
        endTimestamp: new Date().toISOString(),
        finalPath: location.pathname
      });
    };
  }, []);

  // Log detalhado de mudanças de rota
  useEffect(() => {
    coreLogger.logEvent('AppRoutes', LOG_LEVELS.STATE, 'Route navigation', {
      path: location.pathname,
      search: location.search,
      timestamp: new Date().toISOString(),
      referrer: document.referrer || 'direct',
      hasAuthenticatedLayout: location.pathname !== '/login' && 
                             location.pathname !== '/register' &&
                             location.pathname !== '/'
    });
  }, [location]);

  // Função auxiliar para logging de erros de rota
  const handleRouteError = (error) => {
    coreLogger.logServiceError('AppRoutes', LOG_LEVELS.ERROR, 'Route error', {
      error: error.message,
      path: location.pathname,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  };

  try {
    return (
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/docs/*" element={<DocViewer />}>
        <Route index element={<DocHome />} />
        <Route path="initialization" element={<AppInitializationDoc />} />
        <Route path="resilience" element={<ResilienceSystemDoc />} />
        <Route path="auth" element={<AuthenticationDoc />} />
        <Route path="state" element={<StateManagementDoc />} />
        <Route path="theme" element={<ThemeDoc />} />

        <Route path="logging" element={<LoggingSystemDoc />} />
        <Route path="errors" element={<ErrorHandlingDoc />} />
      </Route>
   {/* <Route path="/auth/callback" element={<AuthCallback />} /> */}

        {/* Rotas autenticadas */}
        <Route 
          element={<PrivateRoute element={<AuthenticatedLayout />} />}
          errorElement={handleRouteError}
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notifications" element={<NotificationHistory />} />
          <Route path="/profile/:uid" element={<Profile />} />
          <Route path="/connections" element={<FriendsPage />} />
          <Route path="/caixinha" element={<CaixinhaPage />} />
          <Route path="/vendedor" element={<SellerDashboard />} />
          <Route path="/chat" element={<ChatLayout />}>
            <Route index element={<SelectConversation />} />
            <Route path=":uidDestinatario" element={<ChatWindow />} />
          </Route>
        </Route>

        {/* Rotas especiais */}
        <Route path="/" element={<HomePage />} />
        <Route path="/invite/validate/:inviteId" element={<InvitationValidation />} />
      </Routes>
    );
  } catch (error) {
    handleRouteError(error);
    throw error; // Re-throw para error boundary
  }
};

export default AppRoutes;