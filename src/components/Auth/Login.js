// src/components/Auth/Login.js - Refatorado com redirecionamento baseado em estado
import React, { useState, useEffect, useRef } from 'react';
import {
  Button, TextField, Typography, Box, IconButton,
  Tooltip, CircularProgress, Paper, Grid, Divider,
  InputAdornment, Fade, Alert, Checkbox, FormControlLabel,
  Link, Card, CardContent
} from '@mui/material';
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
import { useAuth } from '../../providers/AuthProvider'; // Supondo que useAuth fornece isAuthenticated, authLoading, error, login, etc.
import { useToast } from '../../providers/ToastProvider';
import { useValidation } from '../../providers/ValidationProvider'; // Supondo que useValidation fornece validateField, validateForm, errors, dirtyFields, etc.
import InterestModal from './InterestModal';
import { motion } from 'framer-motion';

const Login = () => {
  // Removendo referências que controlavam o fluxo de redirecionamento manual/temporizado
  // const loginInProgress = useRef(false);
  // const loginSuccess = useRef(false);

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
  const {
    login, loginWithGoogle, isAuthenticated, // isAuthenticated, authLoading, error vêm daqui
    loginWithMicrosoft, error, authLoading
  } = useAuth(); // Assumindo que useAuth fornece estes estados e funções
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const {
    validateField, validateForm, setFieldDirty,
    errors, dirtyFields, resetValidation
  } = useValidation(); // Assumindo que useValidation fornece estes estados e funções

  const year = new Date().getFullYear();

  // Schema de validação
  const loginSchema = {
    email: {
      type: 'email',
      required: true
    },
    password: {
      type: 'password',
      required: true,
      minLength: 6,
      requireSpecialChar: false // Manter configuração existente
    }
  };

  // Efeito 1: Verificar autenticação inicial ao montar o componente
  // Este efeito lida com o caso do usuário já logado acessando a página de login
  useEffect(() => {
    const checkInitialAuth = async () => {
      try {
        // Idealmente, o useAuth provider já deve verificar o estado inicial
        // Podemos adicionar uma verificação direta se o provider pode ter delay inicial
        // Exemplo: verifica se o provider já carregou o estado inicial OU se já está autenticado
        // Para simplificar, vamos confiar que isAuthenticated do useAuth eventualmente reflete o estado real.
        // No entanto, manter a verificação direta inicial pode ser útil se o provider demorar a inicializar.
        const authService = serviceLocator.get('auth');
        const currentUser = authService.getCurrentUser(); // Ex: from firebase, etc.

        // Verifica se o useAuth provider já indicou autenticação
        // OU se o serviço de autenticação direto indica um usuário
        if (isAuthenticated || Boolean(currentUser)) {
           console.log('Usuário já autenticado no initial check, redirecionando para dashboard');
           navigate('/dashboard', { replace: true });
           return; // Importante para parar a execução
        }
      } catch (err) {
         console.error('Erro durante a verificação inicial de autenticação:', err);
         // Continua para renderizar o formulário se houver erro na verificação
      } finally {
        setInitialLoading(false); // Marca que a verificação inicial terminou
      }
    };

    checkInitialAuth();

    // Cleanup para validação
    return () => {
      resetValidation();
    };

  }, [navigate, isAuthenticated, resetValidation]); // Adicionado isAuthenticated e resetValidation como dependências


  // Efeito 2: Redirecionar quando o estado `isAuthenticated` mudar para true APÓS a verificação inicial
  // Este efeito lida com o login bem-sucedido pelo formulário ou social
  useEffect(() => {
    // Só redireciona se não estivermos mais no loading inicial E se isAuthenticated for true
    if (!initialLoading && isAuthenticated) {
      console.log('isAuthenticated mudou para true após initial load, redirecionando...');
      // Adicionar um pequeno delay *opcional* apenas para dar tempo do toast aparecer,
      // mas a navegação principal deve ser acionada pela mudança de estado.
      // Remover o setTimeout é o ideal para fiabilidade.
      // showToast(t('login.success'), { type: 'success' }); // Mova o toast para cá ou para o handler de login
      navigate('/dashboard', { replace: true });
    }
    // Este efeito não precisa de cleanup de validação, pois o primeiro useEffect já faz isso.
  }, [isAuthenticated, initialLoading, navigate, showToast, t]); // Depende de isAuthenticated e initialLoading

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

    const isValid = await validateForm(formData, loginSchema);

    if (!isValid) {
      showToast(t('login.fix_errors'), { type: 'warning' });
      return;
    }

    // Não precisamos mais controlar o `loginInProgress` ref aqui,
    // o estado `authLoading` do `useAuth` já indica que um login está em andamento.
    // Também removemos o setTimeout e a navegação direta.
    try {
      // showToast(t('login.logging_in'), { type: 'info' }); // Opcional: mostrar toast de início
      await login(formData.email, formData.password);
      // Se o await login for bem-sucedido, o useAuth provider deve atualizar
      // isAuthenticated para true. O segundo useEffect detectará essa mudança e redirecionará.

      // Não colocar navigate() nem setTimeout() aqui.
      // O toast de sucesso será mostrado pelo segundo useEffect.

    } catch (error) {
      console.error('Login failed:', error);
      // O useAuth provider deve definir o estado 'error', que é exibido no Alert.
      // Opcional: mostrar um toast adicional para erros específicos não tratados pelo Alert
      // showToast(error.message || t('login.general_error'), { type: 'error' });
    }
  };

  const handleSocialLogin = async (provider) => {
    // Não precisamos mais controlar o `loginInProgress` ref aqui.
    // Removemos o setTimeout e a navegação direta.
    try {
      showToast(t(`login.login_with_${provider}_started`), { type: 'info' });

      if (provider === 'google') {
        await loginWithGoogle();
      } else if (provider === 'microsoft') {
        await loginWithMicrosoft();
      } else if (provider === 'facebook') {
         // Implemente loginWithFacebook se necessário
         console.warn('Facebook login not fully implemented');
         showToast(t('login.facebook_not_implemented'), { type: 'warning' });
         return; // Parar se não implementado
      }
      // Se o await for bem-sucedido, o useAuth provider deve atualizar isAuthenticated.
      // O segundo useEffect detectará a mudança e redirecionará.

      // Não colocar navigate() nem setTimeout() aqui.
      // O toast de sucesso será mostrado pelo segundo useEffect.

    } catch (error) {
      console.error(`${provider} login failed:`, error);
      // O useAuth provider deve definir o estado 'error'.
      // Opcional: mostrar um toast mais específico
      showToast(error.message || t(`login.${provider}_failed`), { type: 'error' });
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  // Mostrar tela de loading enquanto verifica a sessão inicial
  if (initialLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column"
        }}
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

  // Renderizar o formulário de login após a verificação inicial
  return (
    <Grid container component="main" sx={{ height: '100vh', overflow: 'hidden' }}>
      {/* Hero Section - Lado esquerdo */}
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: `url(${process.env.REACT_APP_ELO_EVENT_IMAGE_URL})`,
          backgroundRepeat: 'no-repeat',
          bgcolor: 'primary.main',
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
            bgcolor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 4
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
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square sx={{ overflow: 'auto', maxHeight: '100vh' }}>
        <Box
          sx={{
            py: 4,
            px: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100%'
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card elevation={0} sx={{ maxWidth: 400, width: '100%', bgcolor: 'background.paper', mb: 2 }}>
              <CardContent>
                <Typography component="h1" variant="h5" align="center" gutterBottom>
                  {t('login.welcome_back')}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
                  {t('login.login_description')}
                </Typography>

                {/* Mostrar erro de autenticação se existir */}
                <Fade in={!!error} sx={{ width: '100%' }}>
                  {/* Usamos Fade e um Box condicional para a animação */}
                   <Box sx={{ mb: error ? 2 : 0, mt: error ? 2 : 0 }}>
                      {error && (
                         <Alert severity="error">
                           {error}
                         </Alert>
                      )}
                   </Box>
                </Fade>


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

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={authLoading || (errors.size > 0 && dirtyFields.size > 0)} // Usa authLoading do provider
                    sx={{
                      mt: 2,
                      mb: 2,
                      p: 1.2,
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    {authLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      t('login.login_button')
                    )}
                  </Button>

                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('common.or')}
                    </Typography>
                  </Divider>

                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Tooltip title={t('login.login_with_google')}>
                      <IconButton
                        onClick={() => handleSocialLogin('google')}
                        disabled={authLoading} // Usa authLoading do provider
                        sx={{
                          m: 1,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        <GoogleIcon sx={{ color: '#4285F4' }} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={t('login.login_with_microsoft')}>
                      <IconButton
                        onClick={() => handleSocialLogin('microsoft')}
                        disabled={authLoading} // Usa authLoading do provider
                        sx={{
                          m: 1,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        <MicrosoftIcon sx={{ color: '#00A4EF' }} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={t('login.login_with_facebook')}>
                      <IconButton
                         // onClick={() => handleSocialLogin('facebook')} // Desabilita ou remove se não implementado
                        disabled={authLoading} // Usa authLoading do provider
                        sx={{
                          m: 1,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        <FacebookIcon sx={{ color: '#1877F2' }} />
                      </IconButton>
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