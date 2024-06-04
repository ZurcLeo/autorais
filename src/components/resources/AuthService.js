import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { db, auth } from '../../firebase.config';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, serverTimestamp, writeBatch, onSnapshot } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { toast } from 'react-toastify';

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
          console.error("Erro ao acessar o documento do usuário:", error);
          toast.error('Erro de acesso aos dados do usuário.');
        }
      } else {
        setCurrentUser(null);
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

  const ensureUserProfileExists = async (userCredential) => {
    const userDocRef = doc(db, `usuario/${userCredential.user.uid}`);
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
      const batch = writeBatch(db);

      const email = userCredential.user.email;
      const defaultName = email.substring(0, email.indexOf('@'));

      batch.set(userDocRef, {
        email: userCredential.user.email,
        nome: userCredential.user.displayName || defaultName || 'ElosCloud.Cliente',
        perfilPublico: false,
        dataCriacao: serverTimestamp(),
        uid: userCredential.user.uid,
        tipoDeConta: 'Cliente',
        isOwnerOrAdmin: false,
        fotoDoPerfil: CLAUD_PROFILE_IMG,
        amigos: ['0000000000'],  // Sempre usa imagem de placeholder
        amigosAutorizados: ['0000000000'],
        conversasComMensagensNaoLidas: [],
      });

      batch.set(doc(db, `conexoes/${userCredential.user.uid}/solicitadas/${CLAUD_PROFILE}`), {
        dataSolicitacao: serverTimestamp(),
        nome: 'Claud Suporte',
        uid: CLAUD_PROFILE,
        status: 'pendente',
        fotoDoPerfil: CLAUD_PROFILE_IMG,
        descricao: 'Gostaria de conectar com você.',
        amigos: ['0000000000'],
      });

      await batch.commit();
      toast.success('Perfil e conexão com Claud criados com sucesso.');
    }
  };

  const validateInvite = async (inviteCode) => {
    if (!inviteCode) {
      throw new Error('Código de convite não fornecido.');
    }
  
    const inviteRef = doc(db, 'convites', inviteCode);
    const inviteSnap = await getDoc(inviteRef);
    if (!inviteSnap.exists() || inviteSnap.data().status !== 'pending') {
      throw new Error('Convite inválido ou já utilizado.');
    }
    return inviteRef;
  };

  const invalidateInvite = async (inviteId, email) => {
    const functions = getFunctions();
    const invalidateInviteFunction = httpsCallable(functions, 'invalidateInvite');
    try {
        const result = await invalidateInviteFunction({ inviteId });
        if (result.data.success) {
            console.log('Invite invalidated successfully.');
            toast.success('Convite invalidado com sucesso. Um e-mail de boas-vindas foi enviado.');
        } else {
            console.error('Failed to invalidate invite.');
        }
    } catch (error) {
        console.error('Error invalidating invite:', error);
        toast.error('Erro ao invalidar o convite.');
    }
};

  const registerWithEmail = async (email, password, inviteCode) => {
    try {
      const inviteRef = await validateInvite(inviteCode);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      await ensureUserProfileExists(userCredential);
      await invalidateInvite(inviteCode, email); 
      toast.success('Muito bem! Sua conta foi criada.');
    } catch (error) {
      toast.error('Erro ao criar conta.');
      console.error(error);
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        toast.info('Por favor, verifique seu e-mail.');
        return;
      }
      await ensureUserProfileExists(userCredential);
      toast.success('Login bem-sucedido.');
      navigate('/homepage');
    } catch (error) {
      toast.error('Erro ao fazer login.');
      console.error(error);
    }
  };

  const signInWithProvider = async (provider) => {
    try {
      let providerToUse;
      if (provider === 'google') {
        providerToUse = new GoogleAuthProvider();
        providerToUse.setCustomParameters({ prompt: 'select_account' });
      } else if (provider === 'microsoft') {
        providerToUse = new OAuthProvider('microsoft.com');
        providerToUse.setCustomParameters({ prompt: 'select_account' });
      }
  
      const userCredential = await signInWithPopup(auth, providerToUse);
      await ensureUserProfileExists(userCredential);
      toast.success('Login com provedor bem-sucedido.');
      navigate('/homepage');
    } catch (error) {
      toast.error('Erro no login com provedor.');
      console.error(error);
    }
  };

  const registerWithProvider = async (provider, inviteCode) => {
    try {
        const inviteRef = await validateInvite(inviteCode);
        
        let providerToUse;
        if (provider === 'google') {
            providerToUse = new GoogleAuthProvider();
            providerToUse.setCustomParameters({ prompt: 'select_account' });
        } else if (provider === 'microsoft') {
            providerToUse = new OAuthProvider('microsoft.com');
            providerToUse.setCustomParameters({ prompt: 'select_account' });
        }
    
        const userCredential = await signInWithPopup(auth, providerToUse);
        await ensureUserProfileExists(userCredential);
        const email = userCredential.user.email;
        await invalidateInvite(inviteCode, email); 
        toast.success('Registro com provedor bem-sucedido.');
    } catch (error) {
        toast.error('Erro no registro com provedor.');
        console.error(error);
    }
};

  const resendVerificationEmail = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        toast.success('E-mail de verificação reenviado.');
      }
    } catch (error) {
      toast.error('Erro ao reenviar e-mail de verificação.');
      console.error(error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Usuário deslogado com sucesso.');
      navigate('/');
    } catch (error) {
      toast.error('Erro ao deslogar usuário.');
      console.error(error);
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
