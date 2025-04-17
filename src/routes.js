import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {   Box,
  Avatar,
  Typography,
  Button,
  Stack,
  Grid,
  Divider,
  Tooltip,
  Card,
  Modal,
  Tabs,
  Tab,
  LinearProgress } from '@mui/material';
import { useAuth } from './providers/AuthProvider';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Layout from './components/Layout/Layout';
import { Dashboard } from './components/Dashboard/Dashboard';
import NotificationHistory from './components/Notification/NotificationHistory';
import Profile from './components/Profiles/Profile';
import FriendsPage from './components/Connections/FriendsPage';
import CaixinhaOverview from './components/Caixinhas/CaixinhaOverview';
import PrivacyPolicy from './components/Pages/Privacy';
import CookiePolicy from './components/Pages/Cookies';
import TermsOfUse from './components/Pages/Terms';
import HomePage from './components/Pages/HomePage';
import SellerDashboard from './components/Dashboard/SellerDashboard';
import AdminInterestsPanel from './components/Admin/Interests';
import { LOG_LEVELS } from './core/constants/config';
import { coreLogger } from './core/logging';
import { AccountCircleOutlined, DashboardCustomizeSharp } from '@mui/icons-material';
import ChatWindow from './components/Messages/ChatWindow';
import ChatLayout from './components/Messages/ChatLayout';
import SelectConversation from './components/Messages/SelectConversation';
import { useToast } from './providers/ToastProvider';
import { PrivateRoute } from './privateRoutes';
import InvalidInvite from './components/Invites/InvalidInvite';
import { serviceLocator } from './core/services/BaseService';
import RBACPanel from './components/Admin/RBAC/RBACPanel';
import Shop from './components/shop/Shop';
import CaixinhaWelcome from './components/Caixinhas/CaixinhaWelcome';
const MODULE_NAME = 'AppRoutes';

const AdminRoute = ({ children }) => {
  const serviceStore = serviceLocator.get('store').getState()?.auth;
  
  const { currentUser, isAuthenticated } = serviceStore;

  console.log('[ROUTES] AdminRoute', serviceStore);
  // Renderizar apenas se for admin ou proprietário
  if (!currentUser?.isOwnerOrAdmin) {
    return null;
  }

  return children;
};

const LoginRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();
  
  // Verificação pelo contexto/provider
  if (isAuthenticated) {
    return <AccountConfirmation />;
  }
  
  const serviceStore = serviceLocator.get('store').getState()?.auth;
  const serviceUser = serviceLocator.get('auth').getCurrentUser();

  // const serviceUser = authService.getCurrentUser();
  // const serviceStore = storeService
  if (serviceUser) {
    console.warn('Redirecionando diretamente pelo serviço!');
    console.warn('Estado do ServiceStore: ', serviceStore);
    console.warn('Estado do authService: ', serviceUser);


    return <AccountConfirmation userFromService={serviceStore} />;
  }
  
  return element;
};

const AccountConfirmation = ({ userFromService }) => {

  const { switchAccount, currentUser } = useAuth();
  // Priorizar usuário do contexto, com fallback para o usuário do serviço
  // const {  } = userFromService;
  
  const navigate = useNavigate();
  const location = useLocation();
  const intendedPath = location.state?.from || '/dashboard';
  const { showToast } = useToast();
  
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminTabValue, setAdminTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  // Extrair dados do usuário de forma segura
  const userEmail = currentUser?.email || 'Usuário Conectado';
  const fotoDoPerfil = currentUser?.fotoDoPerfil || currentUser?.fotoDoPerfil || process.env.REACT_APP_PLACE_HOLDER_IMG;
  const displayName = currentUser?.name || currentUser?.displayName || 'Usuário Conectado';

  console.log('[ACCOUNTCONFIRMATION] Current user data', {
    userEmail,
    displayName,
    fotoDoPerfil,
    currentUser,
    intendedPath,
    userFromService
  });

  const handleAdminModalOpen = () => setAdminModalOpen(true);
  const handleAdminModalClose = () => setAdminModalOpen(false);

  const handleAdminTabChange = (event, newValue) => {
    setAdminTabValue(newValue);
  };

  const handleButtonClick = async (action) => {
    setLoading(true);
    try {
      if (action === 'continue') {
        console.log('[ACCOUNTCONFIRMATION] Navigating to intended path:', intendedPath);
        navigate(intendedPath, { replace: true });
      } else if (action === 'otherAccount') {
        console.log('[ACCOUNTCONFIRMATION] Switching account...');
        await switchAccount();
      }
    } catch (error) {
      console.error('[ACCOUNTCONFIRMATION] Error during action:', error);
      showToast(error.message || 'Ocorreu um erro', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminInterests = () => {
    console.log('[ACCOUNTCONFIRMATION] Admin interests button clicked');
    navigate('/admin/interests', { replace: true });
    handleAdminModalClose();
  };

  const handleAdminRBAC = () => {
    console.log('[ACCOUNTCONFIRMATION] Admin RBAC button clicked');
    navigate('/admin/rbac', { replace: true });
    handleAdminModalClose();
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        margin: 'auto',
        padding: 3,
        borderRadius: 2,
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
      }}
    >
      <Grid container direction="column" spacing={2}>
        <Grid item xs={12}>
          <Avatar
            src={fotoDoPerfil}
            alt={displayName}
            sx={{
              width: 60,
              height: 60,
              margin: 'auto',
              backgroundColor: 'primary.main',
            }}
          >
            {userEmail.charAt(0).toUpperCase()}
          </Avatar>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" component="h5" gutterBottom>
            {displayName}
          </Typography>
          <Typography variant="h6" component="h5" gutterBottom>
            Você já entrou!
          </Typography>
          <Typography variant="body1" color="text.secondary" marginBottom={1}>
            Conta conectada:
          </Typography>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {userEmail}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Button onClick={() => showToast('Teste!', { type: 'info' })}>
            Testar Toast
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Stack spacing={2} direction="column" width="100%">
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => handleButtonClick('continue')}
              startIcon={<AccountCircleOutlined />}
              disabled={loading}
            >
              Continuar com esta conta
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => handleButtonClick('otherAccount')}
              disabled={loading}
            >
              Usar outra conta
            </Button>
            {loading && <LinearProgress />}
          </Stack>
        </Grid>

        {currentUser?.isOwnerOrAdmin && (
          <Grid item xs={12} mt={2}>
            <Divider sx={{ marginBottom: 2 }} />
            <Tooltip title="Administrar Interesses (Admin)">
              <Card>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={handleAdminModalOpen}
                  startIcon={<DashboardCustomizeSharp />}
                >
                  Administrar
                </Button>
              </Card>
            </Tooltip>
          </Grid>
        )}
      </Grid>

      <Modal open={adminModalOpen} onClose={handleAdminModalClose}>
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 400,
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 4,
    }}
  >
    <Tabs value={adminTabValue} onChange={handleAdminTabChange}>
      <Tab label="Interesses" />
      <Tab label="Usuarios" />
      <Tab label="RBAC" /> {/* Nova aba para RBAC */}
    </Tabs>
    {adminTabValue === 0 && (
      <Box mt={2}>
        <Typography>Administrar Interesses</Typography>
        <Button onClick={handleAdminInterests}>Gerenciar</Button>
      </Box>
    )}
    {adminTabValue === 1 && (
      <Box mt={2}>
        <Typography>Administrar Usuarios</Typography>
      </Box>
    )}
    {adminTabValue === 2 && ( // Nova seção para RBAC
      <Box mt={2}>
        <Typography>Controle de Acesso Baseado em Roles (RBAC)</Typography>
        <Button onClick={handleAdminRBAC}>Gerenciar</Button>
      </Box>
    )}
  </Box>
</Modal>
    </Box>
  );
};

export default AccountConfirmation;

export const AppRoutes = () => {
  const serviceStore = serviceLocator.get('store').getState()?.auth;
  const { isAuthenticated, currentUser, authLoading } = serviceStore;
  const location = useLocation();
  const navigate = useNavigate();
  const startTime = performance.now();

  useEffect(() => {
    // if (authLoading) return;

    coreLogger.log(MODULE_NAME, LOG_LEVELS.INITIALIZATION, 'Routes initialization', {
      startTimestamp: new Date().toISOString(),
      initialPath: location.pathname,
    });


    console.log('LoginRoute render:', { 
      isAuthenticated, 
      hasCurrentUser: !!currentUser,
      currentUserData: currentUser,
      authLoading
    });

    const initialLoadTime = performance.now() - startTime;
    coreLogger.log(MODULE_NAME, LOG_LEVELS.PERFORMANCE, 'Initial routes load', {
      duration: `${Math.round(initialLoadTime)}ms`,
      path: location.pathname,
    });

    return () => {
      const totalLifetime = performance.now() - startTime;
      coreLogger.log(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'Routes cleanup', {
        duration: `${Math.round(totalLifetime)}ms`,
        endTimestamp: new Date().toISOString(),
        finalPath: location.pathname,
      });
    };
  }, [currentUser, location.pathname]);

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<LoginRoute element={<Login />} />} />
      {/* <Route path="/register" element={<Register />} /> */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/cookies" element={<CookiePolicy />} />
      <Route path="/terms" element={<TermsOfUse />} />
      <Route path="invite/validate/:inviteId" element={<Register />} />
      <Route path="/invalid-invite" element={<InvalidInvite />} />
      <Route path="/shop" element={<Shop />} />

      {/* <Route path="/complete-profile" element={<CompleteProfile />} /> */}

      <Route index element={<HomePage />} />

      {/* Rotas protegidas */}
      <Route path="/" element={<Layout><Outlet /></Layout>}>
        <Route path="dashboard" element={<PrivateRoute element={<Dashboard />} />} />
        
        <Route path="notifications" element={<PrivateRoute element={<NotificationHistory />} />} />
        <Route path="profile/:uid" element={<PrivateRoute element={<Profile />} />} />
        <Route path="connections" element={<PrivateRoute element={<FriendsPage />} />} />
        <Route path="messages" element={<PrivateRoute element={<ChatLayout />} />}>

          <Route index element={<SelectConversation />} />
          <Route path=":uidDestinatario" element={<ChatWindow />} />
      </Route>
        <Route path="caixinha" element={<PrivateRoute element={<CaixinhaWelcome />} />} />

        <Route path="vendedor" element={<PrivateRoute element={<SellerDashboard />} />} />
        {/* Rotas de Administração */}
        <Route path="admin">
          <Route path="interests" element={
            <AdminRoute>
              <AdminInterestsPanel />
            </AdminRoute>
          } />
          <Route path="rbac" element={
            <AdminRoute>
              <RBACPanel />
            </AdminRoute>
          } />
        </Route>
        
      </Route>

      {/* Rota de fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}