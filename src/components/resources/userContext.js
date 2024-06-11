import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../../firebase.config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getAuth,
} from 'firebase/auth';
import { doc, getDoc, runTransaction } from 'firebase/firestore';

const UserContext = createContext();
const auth = getAuth();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [friendsIds, setFriendsIds] = useState([]);
  const [bestFriendsIds, setBestFriendsIds] = useState([]);
  const [userReactions, setUserReactions] = useState({});


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Carrega dados adicionais do usuário se necessário
        fetchUserData(user.uid);
       
      } else {
        setCurrentUser(null);
      }
      setIsAuthenticated(!!user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const fetchFriends = async () => {
        const userDocRef = doc(db, "usuario", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            setFriendsIds(userDoc.data().amigos || []);
            setBestFriendsIds(userDoc.data().amigosAutorizados || []);
            setUserReactions(userDoc.data().reacoes || {});
        }
    };

    fetchFriends();
}, [currentUser]);

  const fetchUserData = async (userId) => {
    const userDocRef = doc(db, 'usuario', userId);
    const docSnapshot = await getDoc(userDocRef);
    if (docSnapshot.exists()) {
      setCurrentUser({ uid: userId, ...docSnapshot.data() });
    }
  };

  const handleUserReaction = async (postId, newReactionType) => {
    const userReactionsRef = doc(db, "usuario", currentUser.uid);
    const postReactionsRef = doc(db, "postagens", postId); // Ajuste no caminho da subcoleção
  
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userReactionsRef);
      const postDoc = await transaction.get(postReactionsRef);
  
      if (!userDoc.exists() || !postDoc.exists()) {
        throw new Error("Documento não encontrado!");
      }
  
      let newUserReactions = userDoc.data().reacoes || {};
      let newPostReactions = postDoc.data()[newReactionType] || [];
  
      // Atualiza ou remove a reação do usuário
      if (newUserReactions[postId] === newReactionType) {
        delete newUserReactions[postId];
        newPostReactions = newPostReactions.filter(reaction => reaction.docId !== currentUser.uid);
      } else {
        newUserReactions[postId] = newReactionType;
        newPostReactions.push({
          docId: currentUser.uid,
          timestamp: new Date()
        });
      }
  
      // Escreve as atualizações de volta para o Firestore
      transaction.update(userReactionsRef, { reacoes: newUserReactions });
      transaction.set(postReactionsRef, { [newReactionType]: newPostReactions }, { merge: true });
    }).catch(error => console.error("Falha na transação:", error));
  
  
    // Atualizar o estado local
    setUserReactions(prevReactions => ({
      ...prevReactions,
      [postId]: newReactionType
    }));
  };
  

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Erro no login:", error);
      setFeedbackMessage(error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Erro ao sair:", error);
      setFeedbackMessage(error.message);
    }
  };

  const register = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Adicione a lógica para criar um documento de usuário no Firestore se necessário
    } catch (error) {
      console.error("Erro no registro:", error);
      setFeedbackMessage(error.message);
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    feedbackMessage,
    friendsIds, 
    bestFriendsIds,
    userReactions,
    setUserReactions,
    login,
    logout,
    register,
    setLoading,
    setFeedbackMessage,
    handleUserReaction, 
    };
    
    return (
    <UserContext.Provider value={value}>
    {!loading && children}
    </UserContext.Provider>
    );
    };
    
    export const useUserContext = () => useContext(UserContext);
