import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Box,
  IconButton, 
  Tooltip,
  CircularProgress
} from '@mui/material';
import { GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider } from 'firebase/auth';
import { useAuth } from '../../providers/AuthProvider';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import Microsoft from '@mui/icons-material/Microsoft';
import { useTranslation } from 'react-i18next';
import InterestModal from './InterestModal';

const Login = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();
  const { currentUser, signInWithEmail, loginWithProvider } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [providerLoginInProgress, setProviderLoginInProgress] = useState(false);

  const auth = useAuth();
  console.log('[Login] Auth context values:', {
    currentUser: auth.currentUser,
    loginWithProvider: auth.loginWithProvider,
    signInWithEmail: auth.signInWithEmail
  });

  useEffect(() => {
    if (currentUser?.idToken && !isCheckingAuth) {
      navigate('/dashboard');
    }
  }, [currentUser, isCheckingAuth, navigate]);

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    console.info('[Login] Attempting email login');
    setLoginInProgress(true);
    const startTime = performance.now();
    try {
      await signInWithEmail(email, password);
      toast.success(t('login.login_success'));
      console.debug(`[Login] Email login successful in ${performance.now() - startTime}ms`);
      navigate('/dashboard');
    } catch (error) {
      console.error('[Login] Email login error:', error);
      toast.error(t('login.login_error', { message: error.response?.data?.message || error.message }));
    } finally {
      setLoginInProgress(false);
    }
  };

  const handleProviderLogin = async (provider) => {
    console.log(`[Login] Click detected for ${provider} login`);
    console.info(`[Login] Attempting provider login with ${provider}`);
    setProviderLoginInProgress(true);
    try {
        // Resto do código mantido...
    } catch (error) {
        console.error('[Login] Provider login error:', error);
        toast.error(t('login.provider_login_error', {
            message: error.response?.data?.message || error.message || 'Erro desconhecido',
        }));
    } finally {
        setProviderLoginInProgress(false);
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  return (
    <Container maxWidth="lg" style={{ display: 'flex', left: 0, top: 0, bottom: 0 }}>
      <Container maxWidth="lg" style={{ marginTop: '2rem', width: '30%', marginLeft: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100vh' }}>
        <Typography variant="h5" style={{ marginTop: '2rem' }} gutterBottom>{t('login.login')}</Typography>
        <form onSubmit={handleEmailLogin}>
          <TextField
            label={t('login.email')}
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <TextField
            label={t('login.password')}
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            style={{ marginBottom: '1rem', position: 'relative' }}
            disabled={loginInProgress}
          >
            {loginInProgress ? (
              <>
                <CircularProgress size={24} color="inherit" style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: -12,
                  marginLeft: -12
                }} />
                <span style={{ visibility: 'hidden' }}>{t('login.login_button')}</span>
              </>
            ) : (
              t('login.login_button')
            )}
          </Button>
        </form>
        <Typography variant="body2" align="center" gutterBottom>{t('common.or')}</Typography>
        <Box display="flex" justifyContent="space-around" marginBottom="1rem">
          <Tooltip title={t('login.login_with_google')}>
            <IconButton
              onClick={() => handleProviderLogin('google')}
              style={{ border: '1px solid', borderColor: 'transparent', position: 'relative' }}
              disabled={providerLoginInProgress}
            >
              {providerLoginInProgress ? (
                <CircularProgress size={24} style={{ color: '#4285F4' }} />
              ) : (
                <GoogleIcon style={{ color: '#4285F4' }} />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title={t('login.login_with_facebook')}>
            <IconButton
              onClick={() => handleProviderLogin('facebook')}
              style={{ border: '1px solid', borderColor: 'transparent', position: 'relative' }}
              disabled={providerLoginInProgress}
            >
              {providerLoginInProgress ? (
                <CircularProgress size={24} style={{ color: '#1877F2' }} />
              ) : (
                <FacebookIcon style={{ color: '#1877F2' }} />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title={t('login.login_with_microsoft')}>
            <IconButton
              onClick={() => handleProviderLogin('microsoft')}
              style={{ border: '1px solid', borderColor: 'transparent', position: 'relative' }}
              disabled={providerLoginInProgress}
            >
              {providerLoginInProgress ? (
                <CircularProgress size={24} style={{ color: '#00A4EF' }} />
              ) : (
                <Microsoft style={{ color: '#00A4EF' }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="body2" align="center" gutterBottom style={{ color: 'gray' }}>{t('login.invite_only')}</Typography>
        <Typography variant="body2" align="center">
          <Button onClick={handleOpenModal} style={{ textTransform: 'none' }}>
            {t('login.how_to_get_invite')}
          </Button>
        </Typography>

      <Typography variant="body2" style={{ textAlign: 'center', color: 'grey' }} dangerouslySetInnerHTML={{ __html: t('common.footer_text', { year }) }} />

      </Container>
      <InterestModal open={openModal} handleClose={handleCloseModal} />
    </Container>
  );
};

export default Login;