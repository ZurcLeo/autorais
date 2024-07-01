// src/services/authService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const register = async (email, password, inviteCode) => {
  const response = await api.post('api/auth/register', { email, password, inviteCode });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('api/auth/login', { email, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('api/auth/logout');
  return response.data;
};

export const loginWithProvider = async (idToken, provider) => {
  const response = await api.post('api/auth/login-with-provider', { idToken, provider });
  return response.data;
};

export const registerWithProvider = async (provider, inviteCode) => {
  const response = await api.post('api/auth/register-with-provider', { provider, inviteCode });
  return response.data;
};

export const resendVerificationEmail = async (email) => {
  const response = await api.post('api/auth/resend-verification-email', { email });
  return response.data;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('authToken');
  console.log('idToken', token)
  if (!token) {
    throw new Error('No auth token found');
  }
  try {
    const response = await api.get('api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error);
    throw error;
  }
};