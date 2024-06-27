// src/components/Auth/ProviderLogin.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signInWithPopup } from 'firebase/auth';
import { toast } from 'react-toastify';
import { Button, Container, Typography } from '@mui/material';
import { loginWithProvider } from '../../services/authService';
import { auth } from '../../firebaseConfig';
import { showPromiseToast } from '../../utils/toastUtils';

const ProviderLogin = () => {
  const navigate = useNavigate();

  const handleProviderLogin = async (provider) => {
    let providerInstance;

    if (provider === 'google') {
      providerInstance = new GoogleAuthProvider();
    } else if (provider === 'facebook') {
      providerInstance = new FacebookAuthProvider();
    } else if (provider === 'microsoft') {
      providerInstance = new OAuthProvider('microsoft.com');
    }

    try {
      const result = signInWithPopup(auth, providerInstance);
      showPromiseToast(result);
      
      const idToken = await result.user.getIdToken();
      const response = await loginWithProvider(idToken, provider);

      toast.success('Login bem-sucedido!');
      localStorage.setItem('token', response.token);
      navigate('/dashboard');
    } catch (error) {
      toast.error(`Erro ao fazer login com ${provider}: ${error.message}`);
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
      <Typography variant="h4" gutterBottom>Login com Provedor</Typography>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={() => handleProviderLogin('google')}
        style={{ marginBottom: '1rem' }}
      >
        Login com Google
      </Button>
      <Button
        variant="contained"
        color="secondary"
        fullWidth
        onClick={() => handleProviderLogin('facebook')}
        style={{ marginBottom: '1rem' }}
      >
        Login com Facebook
      </Button>
      <Button
        variant="contained"
        color="default"
        fullWidth
        onClick={() => handleProviderLogin('microsoft')}
      >
        Login com Microsoft
      </Button>
    </Container>
  );
};

export default ProviderLogin;