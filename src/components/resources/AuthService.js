import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { db, auth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signOut as firebaseSignOut  } from '../../firebase.config';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
});

const CLAUD_PROFILE = process.env.REACT_APP_CLAUD_PROFILE;
const CLAUD_PROFILE_IMG = process.env.REACT_APP_CLAUD_PROFILE_IMG;

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
        localStorage.setItem('authToken', token);
        const userDocRef = doc(db, `usuario/${user.uid}`);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setCurrentUser({
              ...user,
              tipoDeConta: userData.tipoDeConta,
            });
          }
        } catch (error) {
          console.error('Erro ao acessar o documento do usuário:', error);
          toast.error('Erro de acesso aos dados do usuário.');
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('authToken');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (currentUser?.uid) {
      const userDocRef = doc(db, `usuario/${currentUser.uid}`);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const updatedUserData = doc.data();
          setCurrentUser(prev => ({ ...prev, ...updatedUserData }));
        }
      });
      return () => unsubscribe();
    }
  }, [currentUser?.uid]);

  const registerWithEmail = async (email, password, inviteCode) => {
    try {
      const response = await api.post('/api/auth/register', { email, password, inviteCode });
      localStorage.setItem('authToken', response.data.token);
      toast.success('Muito bem! Sua conta foi criada.');
      setCurrentUser(response.data.user);  // Set the current user state based on response from backend
    } catch (error) {
      toast.error('Erro ao criar conta.');
      console.error(error);
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('authToken', response.data.token);
      toast.success('Login bem-sucedido.');
      navigate('/homepage');
      setCurrentUser(response.data.user);  // Set the current user state based on response from backend
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

        const response = await api.post('https://eloscloudapp-1cefc4b4944e.herokuapp.com/api/auth/login-with-provider', { idToken, provider });

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
      const response = await api.post('/api/auth/register-with-provider', { provider, inviteCode });
      localStorage.setItem('authToken', response.data.token);
      toast.success('Registro com provedor bem-sucedido.');
      setCurrentUser(response.data.user);  // Set the current user state based on response from backend
    } catch (error) {
      toast.error('Erro no registro com provedor.');
      console.error(error);
    }
  };

  const resendVerificationEmail = async (email) => {
    try {
      await api.post('/api/auth/resend-verification-email', { email });
      toast.success('E-mail de verificação reenviado.');
    } catch (error) {
      toast.error('Erro ao reenviar e-mail de verificação.');
      console.error(error);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout', { uid: currentUser.uid });
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