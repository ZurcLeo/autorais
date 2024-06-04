import React, { useState, useEffect } from 'react';
import './App.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase.config';
import { useAuth } from './components/resources/AuthService';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { UserProvider } from './components/resources/userContext';
import { StatusProvider } from './components/resources/Usuarios/userStatus';
import Footer from './components/pages/footer';
import ProtectedRoute from './ProtectedRoute';
import HomePage from './components/pages/home';
import Sobre from './components/pages/about';
import Privacy from './components/pages/privacy';
import Terms from './components/pages/terms';
import Services from './components/pages/services';
import Register from './components/resources/Common/PrivateRoute/register';
import Login from './components/resources/Common/PrivateRoute/login';
import NotFoundPage from './components/pages/notfoundpage';
import HomePageAuth from './components/resources/Common/HomePageAuth';
import MainLayout from './components/resources/Common/PrivateRoute';
import UserProfileSettings from './components/resources/Usuarios/UserProfileSettings';
import Connections from './components/resources/Common/PrivateRoute/connections';
import Chat from './components/resources/chats';
import GoChat from './components/resources/Common/PrivateRoute/goChat';
import Hospedagens from './components/resources/Common/PrivateRoute/hospedagens';
import HospedagensClientes from './components/resources/Common/PrivateRoute/hospedagensClientes';
import HospedagensProprietarios from './components/resources/Common/PrivateRoute/hospedagensProprietarios';
import CheckInForm from './components/resources/Common/PrivateRoute/hospedagens';
import Profile from './components/resources/Common/PrivateRoute/profiles';
import Perfil from './components/resources/Common/PrivateRoute/perfil';
import PerfilPessoal from './components/resources/Common/PrivateRoute/perfilPessoal';
import PerfilAmigo from './components/resources/Common/PrivateRoute/perfilAmigo';
import Postagens from './components/resources/Common/PrivateRoute/postagens';
import Payments from './components/resources/Common/PrivateRoute/payments';
import TopNavBar from './components/resources/Common/PrivateRoute/topNavBar';
import LiveStream from './components/resources/Common/PrivateRoute/LiveStream';
import LiveStreamViewer from './components/resources/Common/PrivateRoute/LiveStreamViewer';
import LiveStreamsMosaic from './components/resources/Common/PrivateRoute/LiveStreamMosaic';
import ElosCoinManager from './components/resources/Common/PrivateRoute/elosCoinManager';
import ConvidarAmigos from './components/resources/Common/PrivateRoute/convidarAmigos';
import ValidateInvite from './components/resources/Common/PrivateRoute/ValidateInvite';
import GridPublicUsers from './components/pages/gridPublicUsers';
import SearchFriends from './components/resources/Common/PrivateRoute/SearchFriends';
import FriendRequests from './components/resources/Common/PrivateRoute/FriendRequests';
import ActiveConnections from './components/resources/Common/PrivateRoute/ActiveConnections';
import axios from 'axios';

function App() {
  let location = useLocation();
  const { currentUser } = useAuth();
  const [ja3Hash, setJa3Hash] = useState('');

  useEffect(() => {
    if (!currentUser) {
      setJa3Hash('');
      return;
    }

    const userId = currentUser.uid;

    async function fetchJa3Hash() {
      try {
        const userRef = doc(db, 'usuario', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists() && userDoc.data().ja3Hash) {
          setJa3Hash(userDoc.data().ja3Hash);
        } else {
          const response = await axios.post('https://us-central1-elossolucoescloud-1804e.cloudfunctions.net/calculateJA3', {
            version: '769', // Versão do SSL/TLS
            cipherSuites: ['4865', '4866', '4867'], // Suítes de cifragem
            extensions: ['0', '11', '10'], // Extensões
            ellipticCurves: ['23', '24'], // Curvas elípticas
            ellipticCurvePointFormats: ['0'], // Formatos de ponto da curva elíptica
            userId: userId
          });
          const ja3Hash = response.data.ja3Hash;
          setJa3Hash(ja3Hash);

          // Armazenar a JA3 no Firestore
          await setDoc(userRef, { ja3Hash }, { merge: true });
        }
      } catch (error) {
        console.error('Error fetching JA3 hash:', error);
      }
    }

    if (currentUser && !ja3Hash) {
      fetchJa3Hash();
    }
  }, [currentUser, ja3Hash]);

  return (
    <div className="App">
      <StatusProvider />
      <TopNavBar />
      <AnimatePresence mode='wait'>
        <UserProvider>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/sobre/privacy" element={<Privacy />} />
            <Route path="/sobre/terms" element={<Terms />} />
            <Route path="/services" element={<Services />} />
            <Route path="/Registro" element={<Register />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/invite" element={<ValidateInvite />} />

            <Route path="/PublicUsers" element={<GridPublicUsers />} />
            
            {/* Rotas protegidas dentro de MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/homepage" element={<ProtectedRoute><HomePageAuth /></ProtectedRoute>} />
              <Route path="/UserProfileSettings" element={<ProtectedRoute><UserProfileSettings /></ProtectedRoute>} />
              <Route path="/Connections" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
              <Route path="/Chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/goChat" element={<ProtectedRoute><GoChat /></ProtectedRoute>} />
              <Route path="/goChat/:connectionId" element={<ProtectedRoute><GoChat /></ProtectedRoute>} />
              <Route path="/Hospedagens" element={<ProtectedRoute><Hospedagens /></ProtectedRoute>} />
              <Route path="/HospedagensClientes" element={<ProtectedRoute><HospedagensClientes /></ProtectedRoute>} />
              <Route path="/HospedagensProprietarios" element={<ProtectedRoute><HospedagensProprietarios /></ProtectedRoute>} />
              <Route path="/HospedagensClientes/checkinform/:reservaCodigo" element={<ProtectedRoute><CheckInForm /></ProtectedRoute>} />
              <Route path="/Profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/Perfil/:uid" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
              <Route path="/PerfilPessoal/:uid" element={<ProtectedRoute><PerfilPessoal /></ProtectedRoute>} />
              <Route path="/PerfilAmigo/:uid" element={<ProtectedRoute><PerfilAmigo /></ProtectedRoute>} />
              <Route path="/Postagens" element={<ProtectedRoute><Postagens /></ProtectedRoute>} />
              <Route path="/Payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="/ElosCoinManager" element={<ProtectedRoute><ElosCoinManager /></ProtectedRoute>} />
              <Route path="/ConvidarAmigos" element={<ProtectedRoute><ConvidarAmigos /></ProtectedRoute>} />
              <Route path="/LiveStream" element={<ProtectedRoute><LiveStream /></ProtectedRoute>} />
              <Route path="/liveStreamViewer/:liveId" element={<ProtectedRoute><LiveStreamViewer /></ProtectedRoute>} />
              
              <Route path="/LivesOnline" element={<LiveStreamsMosaic />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </UserProvider>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

export default App;
