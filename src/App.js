import React, { useState, useEffect } from 'react';
import './App.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase.config';
import { useAuth } from './components/resources/AuthService';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
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
import LiveStreamApp from './components/resources/Common/PrivateRoute/LiveStreamApp';
import MeetingView from './components/resources/Common/PrivateRoute/MeetingView';
import ElosCoinManager from './components/resources/Common/PrivateRoute/elosCoinManager';
import ConvidarAmigos from './components/resources/Common/PrivateRoute/GenerateAndSendInvite';
import ValidateInvite from './components/resources/Common/PrivateRoute/ValidateInvite';
import GridPublicUsers from './components/pages/gridPublicUsers';
import Return from './components/resources/Common/PrivateRoute/return';
import SuccessPage from './components/resources/Common/PrivateRoute/successPage';
import EditProfileForm from './components/resources/Common/PrivateRoute/EditProfileForm';
import Pricing from './components/pages/pricing';
import axios from 'axios';
import { CssBaseline, ThemeProvider, Container } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import PaymentsHistory from './components/resources/Common/PrivateRoute/paymentsHistory';

function App() {
  let location = useLocation();
  const { currentUser } = useAuth();
  const [ja3Hash, setJa3Hash] = useState('');
  const [themeMode, setThemeMode] = useState('light');

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

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
          const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/ja3/calculate`, {
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
    <ThemeProvider theme={themeMode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      <TopNavBar mode={themeMode} toggleColorMode={toggleTheme} />
      <Container>
        {/* <div className="App"> */}
          <AnimatePresence mode='wait'>
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
              <Route path="/Precos" element={<Pricing />} />
              
              {/* Rotas protegidas dentro de MainLayout */}
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/homepage" element={<HomePageAuth />} />
                <Route path="/UserProfileSettings" element={<UserProfileSettings />} />
                <Route path="/Connections" element={<Connections />} />
                <Route path="/Chat" element={<Chat />} />
                <Route path="/goChat" element={<GoChat />} />
                <Route path="/goChat/:connectionId" element={<GoChat />} />
                <Route path="/Hospedagens" element={<Hospedagens />} />
                <Route path="/HospedagensClientes" element={<HospedagensClientes />} />
                <Route path="/HospedagensProprietarios" element={<HospedagensProprietarios />} />
                <Route path="/HospedagensClientes/checkinform/:reservaCodigo" element={<CheckInForm />} />
                <Route path="/Profile" element={<Profile />} />
                <Route path="/EditarPerfil" element={<EditProfileForm mode={themeMode} toggleColorMode={toggleTheme}/>} />
                <Route path="/Perfil/:uid" element={<Perfil />} />
                <Route path="/PerfilPessoal/:uid" element={<PerfilPessoal />} />
                <Route path="/PerfilAmigo/:uid" element={<PerfilAmigo />} />
                <Route path="/Postagens" element={<Postagens />} />
                <Route path="/Payments" element={<Payments />} />
                <Route path="/return" element={<Return />} />
                <Route path="/Payments/success" element={<SuccessPage />} />
                <Route path="/payments-history" element={<PaymentsHistory/>} />
                <Route path="/ElosCoinManager" element={<ElosCoinManager />} />
                <Route path="/ConvidarAmigos" element={<ConvidarAmigos />} />
                <Route path="/LivesOnline" element={<LiveStream />} />
                <Route path="/LiveStream" element={<LiveStreamApp />} />
                <Route path="/MeetingView/:liveId" element={<MeetingView />} />
               
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AnimatePresence>
          <Footer />
        {/* </div> */}
      </Container>
    </ThemeProvider>
  );
}

export default App;
