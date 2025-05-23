import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  Box,
  CircularProgress,
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
  LinearProgress,
} from '@mui/material';
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

/**
 * AdminRoute component - Wrapper component that restricts access to admin users only
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if user has admin access
 * @returns {React.ReactNode|null} The admin components if user has admin access, null otherwise
 */
const AdminRoute = ({ children }) => {
  const serviceStore = serviceLocator.get('store').getState()?.auth;
  const { currentUser } = serviceStore || {};

  // Renderiza apenas se o usuário for admin ou owner
  if (!currentUser?.isOwnerOrAdmin) {
    return null;
  }

  return children;
};

/**
 * LoginRoute component - Special route handler for login page
 * Redirects to account confirmation if already authenticated
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactElement} props.element - Element to render if not authenticated
 * @returns {React.ReactElement} Either the login element or AccountConfirmation component
 */
const LoginRoute = ({ element }) => {
  const { isAuthenticated: authProviderAuthenticated } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Efeito para verificar autenticação de forma confiável
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        // Já temos isAuthenticated do provider, obtido fora do useEffect
        let isAuthFromProvider = authProviderAuthenticated;
        
        // Verificar autenticação pelo serviço (fallback)
        const authService = serviceLocator.get('auth');
        const serviceUser = authService.getCurrentUser();
        
        // Verificar autenticação pela store (outra fonte)
        const storeState = serviceLocator.get('store').getState()?.auth;
        const storeIsAuthenticated = storeState?.isAuthenticated;
        
        // Combinar resultados - é autenticado se qualquer fonte confirmar
        const finalIsAuthenticated = isAuthFromProvider || Boolean(serviceUser) || storeIsAuthenticated;
        
        console.log('LoginRoute - Verificação de autenticação:', {
          fromProvider: isAuthFromProvider,
          fromService: Boolean(serviceUser),
          fromStore: storeIsAuthenticated,
          final: finalIsAuthenticated
        });
        
        setIsAuthenticated(finalIsAuthenticated);
      } catch (error) {
        console.error('Erro ao verificar autenticação em LoginRoute:', error);
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [authProviderAuthenticated]);
  
  // Loading state
  if (loading || !authChecked) {
    return (
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
          Verificando sessão...
        </Typography>
      </Box>
    );
  }
  
  // Se já estiver autenticado, mostra a tela de confirmação de conta
  if (isAuthenticated) {
    return <AccountConfirmation />;
  }
  
  // Caso contrário, mostra o componente de login normal
  return element;
};

/**
 * AccountConfirmation component - Displays when a user is already logged in
 * Shows user account info and provides options to continue or switch accounts
 * Versão simplificada de acordo com a nova lógica de temas
 * 
 * @component
 * @returns {React.ReactElement} Account confirmation UI
 */
// Componente AccountConfirmation corrigido para routes.js
const AccountConfirmation = () => {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { switchAccount } = useAuth();
  const { showToast } = useToast();
  const intendedPath = location.state?.from || '/dashboard';
  
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminTabValue, setAdminTabValue] = useState(0);

  // Efeito para carregar dados do usuário ao inicializar
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        // Tentar obter dados do usuário de diferentes fontes
        const authService = serviceLocator.get('auth');
        const storeState = serviceLocator.get('store').getState()?.auth;
        
        // Combinar dados do serviço e da store para maior confiabilidade
        const currentUser = storeState?.currentUser || authService.getCurrentUser();
        
        if (!currentUser) {
          console.error('Nenhum dado de usuário encontrado em AccountConfirmation');
          throw new Error('Dados de usuário não disponíveis');
        }
        
        setUserInfo(currentUser);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        showToast('Erro ao carregar dados do usuário. Tente fazer login novamente.', { type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [showToast]);

  /**
   * Abre o modal de administração
   */
  const handleAdminModalOpen = () => setAdminModalOpen(true);
  
  /**
   * Fecha o modal de administração
   */
  const handleAdminModalClose = () => setAdminModalOpen(false);

  /**
   * Trata a mudança de abas no modal de administração
   */
  const handleAdminTabChange = (_, newValue) => {
    setAdminTabValue(newValue);
  };

/**
 * Trata os cliques nos botões de ação de conta
 * @param {string} action - A ação a executar ('continue' ou 'otherAccount')
 */
const handleButtonClick = async (action) => {
  setLoading(true);
  try {
    if (action === 'continue') {
      navigate(intendedPath, { replace: true });
    } else if (action === 'otherAccount') {
      // Garantir logout completo
      try {
        // 1. Logout via AuthProvider
        await switchAccount();
        
        // 2. Logout explícito no serviço Firebase (redundância)
        const authService = serviceLocator.get('auth');
        if (authService.signOut) {
          await authService.signOut();
        }
        
        // 3. Despachar ação de logout diretamente para o Redux
        const store = serviceLocator.get('store');
        if (store && store.dispatch) {
          store.dispatch({ type: 'auth/LOGOUT' });
        }
        
        // 4. Forçar redirecionamento para login
        setTimeout(() => {
          console.log('Forçando redirecionamento para tela de login');
          window.location.href = '/login'; // Usar window.location para forçar refresh completo
        }, 100);
      } catch (error) {
        console.error('Erro ao tentar fazer logout:', error);
        // Em caso de erro, mesmo assim tentar forçar redirecionamento
        window.location.href = '/login';
      }
    }
  } catch (error) {
    console.error('Erro durante ação:', error);
    showToast(error.message || 'Ocorreu um erro', { type: 'error' });
  } finally {
    setLoading(false);
  }
};

  /**
   * Navega para a página de administração de interesses
   */
  const handleAdminInterests = () => {
    navigate('/admin/interests', { replace: true });
    handleAdminModalClose();
  };

  /**
   * Navega para a página de administração RBAC
   */
  const handleAdminRBAC = () => {
    navigate('/admin/rbac', { replace: true });
    handleAdminModalClose();
  };

  // Loading state
  if (loading || !userInfo) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Carregando informações da conta...
        </Typography>
      </Box>
    );
  }

  // Extrai dados do usuário com segurança
  const userEmail = userInfo?.email || 'Usuário Conectado';
  const profilePhoto = userInfo?.fotoDoPerfil || process.env.REACT_APP_PLACE_HOLDER_IMG;
  const displayName = userInfo?.name || userInfo?.displayName || userInfo?.nome || 'Usuário Conectado';
  const isAdmin = userInfo?.isOwnerOrAdmin || false;

  return (
    <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh', // Isso garante que o Box ocupe toda a altura da viewport
      p: 2 // Padding para evitar que o conteúdo encoste nas bordas em telas pequenas
    }}
  >
    <Box
      sx={{
        maxWidth: 400,
        width: '100%',
        padding: 3,
        borderRadius: 2,
        boxShadow: 3,
        textAlign: 'center',
        bgcolor: 'background.paper'
      }}
    >
      <Grid container direction="column" spacing={2}>
        <Grid item xs={12}>
          <Avatar
            src={profilePhoto}
            alt={displayName}
            sx={{
              width: 60,
              height: 60,
              margin: 'auto',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
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
          <Typography variant="body1" marginBottom={1}>
            Conta conectada:
          </Typography>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {userEmail}
          </Typography>
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
              color="primary"
              fullWidth
              onClick={() => handleButtonClick('otherAccount')}
              disabled={loading}
            >
              Usar outra conta
            </Button>
            {loading && <LinearProgress />}
          </Stack>
        </Grid>

        {isAdmin && (
          <Grid item xs={12} mt={2}>
            <Divider sx={{ mb: 2 }} />
            <Tooltip title="Administrar Interesses (Admin)">
              <Card sx={{ p: 1 }}>
                <Button
                  variant="contained"
                  color="success"
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

      <Modal 
        open={adminModalOpen} 
        onClose={handleAdminModalClose}
        aria-labelledby="admin-modal-title"
      >
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
            borderRadius: 2
          }}
        >
          <Tabs value={adminTabValue} onChange={handleAdminTabChange}>
            <Tab label="Interesses" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Usuários" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="RBAC" id="tab-2" aria-controls="tabpanel-2" />
          </Tabs>
          
          <Box role="tabpanel" hidden={adminTabValue !== 0} id="tabpanel-0" aria-labelledby="tab-0" mt={2}>
            <Typography>Administrar Interesses</Typography>
            <Button onClick={handleAdminInterests} variant="contained" sx={{ mt: 1 }}>
              Gerenciar
            </Button>
          </Box>
          
          <Box role="tabpanel" hidden={adminTabValue !== 1} id="tabpanel-1" aria-labelledby="tab-1" mt={2}>
            <Typography>Administrar Usuários</Typography>
          </Box>
          
          <Box role="tabpanel" hidden={adminTabValue !== 2} id="tabpanel-2" aria-labelledby="tab-2" mt={2}>
            <Typography>Controle de Acesso Baseado em Roles (RBAC)</Typography>
            <Button onClick={handleAdminRBAC} variant="contained" sx={{ mt: 1 }}>
              Gerenciar
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
    </Box>
  );
};

/**
 * AppRoutes component - Main application routes configuration
 * Sets up all public and protected routes for the application
 * 
 * @component
 * @returns {React.ReactElement} The application routes structure
 */
export const AppRoutes = () => {
  const location = useLocation();
  const startTime = performance.now();

  useEffect(() => {
    // Log inicialização de rotas
    coreLogger.log(MODULE_NAME, LOG_LEVELS.INITIALIZATION, 'Routes initialization', {
      startTimestamp: new Date().toISOString(),
      initialPath: location.pathname,
    });

    // Log métricas de performance para carregamento inicial
    const initialLoadTime = performance.now() - startTime;
    coreLogger.log(MODULE_NAME, LOG_LEVELS.PERFORMANCE, 'Initial routes load', {
      duration: `${Math.round(initialLoadTime)}ms`,
      path: location.pathname,
    });

    // Função de limpeza
    return () => {
      const totalLifetime = performance.now() - startTime;
      coreLogger.log(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'Routes cleanup', {
        duration: `${Math.round(totalLifetime)}ms`,
        endTimestamp: new Date().toISOString(),
        finalPath: location.pathname,
      });
    };
  }, [location.pathname]);

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<LoginRoute element={<Login />} />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/cookies" element={<CookiePolicy />} />
      <Route path="/terms" element={<TermsOfUse />} />
      <Route path="invite/validate/:inviteId" element={<Register />} />
      <Route path="/invalid-invite" element={<InvalidInvite />} />
      <Route path="/shop" element={<Shop />} />
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
        <Route path="caixinha/:caixinhaId" element={<PrivateRoute element={<CaixinhaOverview />} />} />
        <Route path="vendedor" element={<PrivateRoute element={<SellerDashboard />} />} />
        
        {/* Rotas de administração */}
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
};

export default AccountConfirmation;