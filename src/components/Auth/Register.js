//frontend/src/components/Auth/Register.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Typography,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebaseConfig'; // Certifique-se de ter configurado o Firebase corretamente.
import authService from '../../services/authService'; // Caminho relativo correto.
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { Camera, Mail, Lock, Github } from 'lucide-react';

const Register = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    nome: location.state?.nome || '',
    password: '',
    confirmPassword: '',
    inviteId: location.state?.inviteId || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter no mínimo 8 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulated auth service call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Handle successful registration
    } catch (error) {
      setErrors({ submit: 'Erro ao registrar. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleProviderAuth = async (provider) => {
    setLoading(true);
    try {
      let authProvider;
  
      // Inicializa o provedor com base na seleção
      if (provider === 'google') {
        authProvider = new GoogleAuthProvider();
      } else if (provider === 'facebook') {
        authProvider = new FacebookAuthProvider();
      } else if (provider === 'microsoft') {
        authProvider = new OAuthProvider('microsoft.com');
      } else {
        throw new Error('Provedor inválido');
      }
  
      // Faz a autenticação com o provedor selecionado
      const result = await signInWithPopup(auth, authProvider);
  
      // Recupera o token de autenticação do Firebase
      const idToken = await result.user.getIdToken();
  
      // Envia o token ao backend para registro ou login
      const response = await authService.registerWithProvider(provider, formData.inviteId, formData.email, formData.password, formData.nome);
      toast.success('Registro realizado com sucesso!');
      navigate('/dashboard'); // Redireciona para o dashboard ou página inicial
    } catch (error) {
      // Exibe erros detalhados
      toast.error(`Erro ao autenticar com ${provider}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
        p: 3
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardHeader
          title={
            <Typography variant="h5" align="center">
              Criar Conta
            </Typography>
          }
          subheader={
            <Typography variant="body2" align="center" color="textSecondary">
              Comece sua jornada conosco
            </Typography>
          }
          sx={{ textAlign: 'center', py: 2 }}
        />
        <CardContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              label="Email"
              type="email"
              fullWidth
              placeholder="seu@email.com"
              value={formData.email}
              disabled
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              InputProps={{
                startAdornment: <Mail className="icon" />,
              }}
              error={!!errors.email}
              helperText={errors.email}
            />

            <TextField
              label="Senha"
              type="password"
              fullWidth
              placeholder="********"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              InputProps={{
                startAdornment: <Lock className="icon" />,
              }}
              error={!!errors.password}
              helperText={errors.password}
            />

            <TextField
              label="Confirmar Senha"
              type="password"
              fullWidth
              placeholder="********"
              value={formData.confirmPassword}
              onChange={e =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              InputProps={{
                startAdornment: <Lock className="icon" />,
              }}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />

            {errors.submit && (
              <Alert severity="error">{errors.submit}</Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Registrar'}
            </Button>

            <Divider sx={{ my: 2 }}>ou continue com</Divider>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<GoogleIcon />}
                onClick={() => handleProviderAuth('google')}
                disabled={loading}
              >
                Google
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Github />}
                onClick={() => handleProviderAuth('github')}
                disabled={loading}
              >
                Github
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Github />}
                onClick={() => handleProviderAuth('microsoft')}
                disabled={loading}
              >
                Microsoft
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;