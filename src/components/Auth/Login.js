// src/components/Auth/Login.js
import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Typography, Box, IconButton, 
  Tooltip, CircularProgress, Paper, Grid, Divider,
  InputAdornment, Fade, Alert, Checkbox, FormControlLabel,
  Link, Card, CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Google as GoogleIcon,
  Facebook as FacebookIcon, 
  Microsoft as MicrosoftIcon,
  Visibility, VisibilityOff, 
  Email as EmailIcon,
  Lock as LockIcon 
} from '@mui/icons-material';
import { serviceLocator } from '../../core/services/BaseService';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../providers/ToastProvider';
import { useValidation } from '../../providers/ValidationProvider'; // Importando o hook de validação
import InterestModal from './InterestModal';
import { motion } from 'framer-motion';

// Componentes estilizados
const LoginButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.2),
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

const Login = () => {
    const serviceStore = serviceLocator.get('store').getState()?.auth;
    const serviceUser = serviceLocator.get('auth').getCurrentUser();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [openModal, setOpenModal] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Contextos e hooks
  const { t } = useTranslation();
  const { authLoading, currentUser } = serviceStore
  const { 
    login, loginWithGoogle, isAuthenticated, 
    loginWithMicrosoft, error 
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { 
    validateField, validateForm, setFieldDirty, 
    errors, dirtyFields, resetValidation 
  } = useValidation();
  
  const year = new Date().getFullYear();

  // Schema de validação para o formulário de login
  const loginSchema = {
    email: {
      type: 'email',
      required: true
    },
    password: {
      type: 'password',
      required: true,
      minLength: 6, // Adapte conforme suas regras de senha
      requireSpecialChar: false // Ajuste conforme necessário
    }
  };

  useEffect(() => {
    if (!authLoading) {
      setInitialLoading(false);
    }
   
    if (!authLoading && isAuthenticated && currentUser) {
      if (location.pathname === '/login') {
        console.log('Usuário já autenticado, redirecionando para dashboard');
        navigate('/dashboard');
      }
    }
  }, [authLoading, isAuthenticated, currentUser, navigate, location.pathname]);

  // Efeito para limpar validação ao desmontar componente
  useEffect(() => {
    return () => {
      resetValidation();
    };
  }, [resetValidation]);
 console.log('ESTADO NO LOGIN', useAuth())
  // Efeito para verificar autenticação
  useEffect(() => {
    if (!authLoading) {
      setInitialLoading(false);
    }
   
    if (!authLoading && isAuthenticated && currentUser) {
      if (location.pathname === '/login') {
        console.log('Usuário já autenticado, mostrando tela de confirmação');
      }
    }
  }, [authLoading, isAuthenticated, currentUser, navigate, location.pathname]);

  // Manipuladores de eventos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Valida e marca o campo como "dirty" quando o usuário interage
    if (dirtyFields.has(name)) {
      validateField(value, loginSchema[name].type, loginSchema[name]);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setFieldDirty(name);
    validateField(value, loginSchema[name].type, loginSchema[name]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar todo o formulário antes de submeter
    const isValid = await validateForm(formData, loginSchema);
    
    if (!isValid) {
      showToast(t('login.fix_errors'), { type: 'warning' });
      return;
    }
    
    try {
      await login(formData.email, formData.password);
      showToast(t('login.success'), { type: 'success' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      showToast(t(`login.login_with_${provider}_started`), { type: 'info' });
      
      if (provider === 'google') {
        await loginWithGoogle();
      } else if (provider === 'microsoft') {
        await loginWithMicrosoft();
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      showToast(error.message || t(`login.${provider}_failed`), { type: 'error' });
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  // Loading state
  if (initialLoading || authLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh" 
        flexDirection="column"
      >
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          {t('common.verifying_session')}
        </Typography>
      </Box>
    );
  }

  // Helpers para verificação de erros
  const hasError = (fieldName) => dirtyFields.has(fieldName) && errors.has(fieldName);
  const getErrorMessage = (fieldName) => hasError(fieldName) ? errors.get(fieldName) : '';

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      {/* Hero Section - Lado esquerdo */}
      <Grid 
        item 
        xs={false} 
        sm={4} 
        md={7}
        sx={{
          backgroundImage: `url(${process.env.REACT_APP_ELO_EVENT_IMAGE_URL})`,
          backgroundRepeat: 'no-repeat',
          backgroundColor: t => t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: { xs: 'none', md: 'block' }
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 4
          }}
        >
          <Typography 
            component="h1" 
            variant="h3" 
            color="white" 
            fontWeight="bold"
          >
            elosCloud_
          </Typography>
          <Typography 
            variant="h6" 
            color="white" 
            align="center" 
            sx={{ mt: 2, maxWidth: '80%' }}
          >
            _transformando tudo.
          </Typography>
        </Box>
      </Grid>

      {/* Login Section - Lado direito */}
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card elevation={0} sx={{ maxWidth: 400, width: '100%' }}>
              <CardContent>
                <Typography component="h1" variant="h5" align="center" gutterBottom>
                  {t('login.welcome_back')}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
                  {t('login.login_description')}
                </Typography>

                {/* Mostrar erro de autenticação se existir */}
                {error && (
                  <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label={t('login.email')}
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={hasError('email')}
                    helperText={getErrorMessage('email')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color={hasError('email') ? "error" : "action"} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label={t('login.password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={hasError('password')}
                    helperText={getErrorMessage('password')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color={hasError('password') ? "error" : "action"} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          value="remember" 
                          color="primary" 
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                      }
                      label={t('login.remember_me')}
                    />
                    <Link component={RouterLink} to="/forgot-password" variant="body2">
                      {t('login.forgot_password')}
                    </Link>
                  </Box>

                  <LoginButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={authLoading || (errors.size > 0 && dirtyFields.size > 0)}
                  >
                    {authLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      t('login.login_button')
                    )}
                  </LoginButton>
                  
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('common.or')}
                    </Typography>
                  </Divider>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Tooltip title={t('login.login_with_google')}>
                      <SocialButton
                        color="default"
                        onClick={() => handleSocialLogin('google')}
                        disabled={authLoading}
                      >
                        <GoogleIcon style={{ color: '#4285F4' }} />
                      </SocialButton>
                    </Tooltip>
                    
                    <Tooltip title={t('login.login_with_microsoft')}>
                      <SocialButton
                        color="default"
                        onClick={() => handleSocialLogin('microsoft')}
                        disabled={authLoading}
                      >
                        <MicrosoftIcon style={{ color: '#00A4EF' }} />
                      </SocialButton>
                    </Tooltip>
                    
                    <Tooltip title={t('login.login_with_facebook')}>
                      <SocialButton
                        color="default"
                        onClick={() => handleSocialLogin('facebook')}
                        disabled={authLoading}
                      >
                        <FacebookIcon style={{ color: '#1877F2' }} />
                      </SocialButton>
                    </Tooltip>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('login.invite_only')}
                    </Typography>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={handleOpenModal}
                      sx={{ mt: 1 }}
                    >
                      {t('login.how_to_get_invite')}
                    </Link>
                  </Box>
                  
                  {/* <Box sx={{ mt: 4 }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      {t('login.no_account_yet')} 
                      <Link component={RouterLink} to="/register" variant="body2" sx={{ ml: 1 }}>
                        {t('login.sign_up')}
                      </Link>
                    </Typography>
                  </Box> */}
                </Box>
              </CardContent>
            </Card>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              align="center" 
              sx={{ mt: 2 }}
            >
              {t('common.footer_text', { year })}
            </Typography>
          </motion.div>
        </Box>
      </Grid>
      <InterestModal open={openModal} handleClose={handleCloseModal} />
    </Grid>
  );
};

export default Login;