import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { db, auth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signOut as firebaseSignOut } from '../../firebaseConfig';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

const API = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: API,
});

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        const response = await api.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCurrentUser(response.data.user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const registerWithEmail = async (email, password, inviteCode) => {
    try {
      const response = await api.post('/auth/register', { email, password, inviteCode });
      localStorage.setItem('authToken', response.data.token);
      toast.success('Muito bem! Sua conta foi criada.');
      setCurrentUser(response.data.user);
    } catch (error) {
      toast.error('Erro ao criar conta.');
      console.error(error);
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('authToken', response.data.token);
      toast.success('Login bem-sucedido.');
      navigate('/homepage');
      setCurrentUser(response.data.user);
    } catch (error) {
      toast.error('Erro ao fazer login.');
      console.error(error);
    }
  };

  const signInWithProvider = async (provider) => {
    try {
      let providerInstance;

      if (provider === 'google') {
        providerInstance = new GoogleAuthProvider();
      } else if (provider === 'facebook') {
        providerInstance = new FacebookAuthProvider();
        providerInstance.addScope('email');
      } else if (provider === 'microsoft') {
        providerInstance = new OAuthProvider('microsoft.com');
      }

      const result = await signInWithPopup(auth, providerInstance);
      const idToken = await result.user.getIdToken();

      const response = await api.post('/auth/login-with-provider', { idToken, provider });

      localStorage.setItem('authToken', response.data.token);
      toast.success('Login com provedor bem-sucedido.');
      navigate('/homepage');
      setCurrentUser(response.data.user);
    } catch (error) {
      toast.error('Erro no login com provedor.');
      console.error('Erro ao fazer login com provedor:', error.response ? error.response.data : error.message);
    }
  };

  const registerWithProvider = async (provider, inviteCode) => {
    try {
      const response = await api.post('/auth/register-with-provider', { provider, inviteCode });
      localStorage.setItem('authToken', response.data.token);
      toast.success('Registro com provedor bem-sucedido.');
      setCurrentUser(response.data.user);
    } catch (error) {
      toast.error('Erro no registro com provedor.');
      console.error(error);
    }
  };

  const resendVerificationEmail = async (email) => {
    try {
      await api.post('/auth/resend-verification-email', { email });
      toast.success('E-mail de verificação reenviado.');
    } catch (error) {
      toast.error('Erro ao reenviar e-mail de verificação.');
      console.error(error);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', { uid: currentUser.uid });
      await firebaseSignOut(auth);
      setCurrentUser(null);
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao tentar deslogar:', error);
      toast.error('Erro ao tentar deslogar!');
    }
  };

  const value = {
    currentUser,
    loading,
    registerWithEmail,
    signInWithEmail,
    signInWithProvider,
    registerWithProvider,
    resendVerificationEmail,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;