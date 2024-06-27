//src/components/Auth/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signInWithPopup } from 'firebase/auth';
import { toast } from 'react-toastify';
import { Button, Container, TextField, Typography } from '@mui/material';
import { login, loginWithProvider } from '../../services/authService';
import { auth } from '../../firebaseConfig';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      toast.success('Login bem-sucedido!');
      localStorage.setItem('token', response.token);
      navigate('/dashboard');
    } catch (error) {
      toast.error(`Erro ao fazer login: ${error.response?.data?.message || error.message}`);
    }
  };

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
      const result = await signInWithPopup(auth, providerInstance);
      const idToken = await result.user.getIdToken();
      const response = await loginWithProvider(idToken, provider);

      toast.success('Login bem-sucedido!');
      localStorage.setItem('token', response.token);
      navigate('/dashboard');
    } catch (error) {
      toast.error(`Erro ao fazer login com ${provider}: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
      <Typography variant="h4" gutterBottom>Login</Typography>
      <form onSubmit={handleEmailLogin}>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Senha"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginBottom: '1rem' }}>
          Login
        </Button>
      </form>
      <Typography variant="h6" gutterBottom>Ou</Typography>
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
        color="inherit"
        fullWidth
        onClick={() => handleProviderLogin('microsoft')}
      >
        Login com Microsoft
      </Button>
    </Container>
  );
};

export default Login;