import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const facebookLogin = async (accessToken) => {
    const response = await axios.post(`${API_URL}/api/auth/facebook-login`, { accessToken });
    return response.data;
  }

  export const register = async (email, password, inviteCode) => {
    const response = await axios.post(`${API_URL}/api/auth/register`, { email, password, inviteCode });
    return response.data;
  }

  export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    return response.data;
  }

  export const logout = async () => {
    const response = await axios.post(`${API_URL}/api/auth/logout`);
    return response.data;
  }

  export const loginWithProvider = async (idToken, provider) => {
    const response = await axios.post(`${API_URL}/api/auth/login-with-provider`, { idToken, provider });
    return response.data;
  }

  export const registerWithProvider = async (provider, inviteCode) => {
    const response = await axios.post(`${API_URL}/api/auth/register-with-provider`, { provider, inviteCode });
    return response.data;
  }

  export const resendVerificationEmail = async (email) => {
    const response = await axios.post(`${API_URL}/api/auth/resend-verification-email`, { email });
    return response.data;
  }

  export const getToken = async () => {
    const response = await axios.get(`${API_URL}/api/auth/token`);
    return response.data;
  }

  export const getCurrentUser = async () => {
    const response = await axios.get(`${API_URL}/api/auth/me`);
    return response.data;
  }
