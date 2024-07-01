// src/context/AuthContext.js
import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register, login, logout, loginWithProvider, registerWithProvider, resendVerificationEmail } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const registerWithEmail = async (email, password, inviteCode) => {
    try {
      const response = await register(email, password, inviteCode);
      localStorage.setItem('authToken', response.token);
      toast.success('Muito bem! Sua conta foi criada.');
      setCurrentUser(response.user);
      navigate('/dashboard');
      setLoading(false)
    } catch (error) {
      toast.error('Erro ao criar conta.');
      console.error(error);
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const response = await login(email, password);
      localStorage.setItem('authToken', response.token);
      toast.success('Login bem-sucedido.');
      setCurrentUser(response.user);
      navigate('/dashboard');
      setLoading(false)
    } catch (error) {
      toast.error('Erro ao fazer login.');
      console.error(error);
    }
  };

  const signInWithProvider = async (idToken, provider) => {
    console.log('idToken', idToken, ' provider: ', provider)
    if(!idToken || !provider) {
      toast.error('Erro ao fazer login. idToken e Provider são obrigatórios.');
    }
    try {
      const response = await loginWithProvider(idToken, provider);
      localStorage.setItem('authToken', response.token);
      toast.success('Login com provedor bem-sucedido.');
      setCurrentUser(response.user);
      navigate('/dashboard');
      setLoading(false)
    } catch (error) {
      console.error('Erro ao fazer login com provedor:', error);
      if (error.response) {
        toast.error(`Erro no login com provedor: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        toast.error('Erro no login com provedor: Nenhuma resposta do servidor');
      } else {
        toast.error(`Erro no login com provedor: ${error.message}`);
      }
    }
  };

  const registerWithProvider = async (provider, inviteCode) => {
    try {
      const response = await registerWithProvider(provider, inviteCode);
      localStorage.setItem('authToken', response.token);
      toast.success('Registro com provedor bem-sucedido.');
      setCurrentUser(response.user);
      navigate('/dashboard');
      setLoading(false)
    } catch (error) {
      toast.error('Erro no registro com provedor.');
      console.error(error);
    }
  };

  const handleResendVerificationEmail = async (email) => {
    try {
      await resendVerificationEmail(email);
      toast.success('E-mail de verificação reenviado.');
      setLoading(false)
    } catch (error) {
      toast.error('Erro ao reenviar e-mail de verificação.');
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
      localStorage.removeItem('authToken');
      toast.success('Logout realizado com sucesso!');
      navigate('/login');
      setLoading(false)
    } catch (error) {
      console.error('Erro ao tentar deslogar:', error);
      toast.error('Erro ao tentar deslogar!');
    }
  };

  const value = {
    currentUser,
    setCurrentUser,
    loading,
    registerWithEmail,
    signInWithEmail,
    signInWithProvider,
    registerWithProvider,
    handleResendVerificationEmail,
    handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };