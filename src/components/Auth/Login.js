import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Container, TextField, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { signInWithEmail, signInWithProvider } = useAuth();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmail(email, password);
      toast.success('Login bem-sucedido!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(`Erro ao fazer login: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleProviderLogin = async (provider) => {
    try {
      const response = await signInWithProvider(provider);
      localStorage.setItem('authToken', response.token);
      toast.success('Login com provedor bem-sucedido.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao fazer login com provedor:', error);
      toast.error(`Erro no login com provedor: ${error.response?.data?.message || error.message}`);
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