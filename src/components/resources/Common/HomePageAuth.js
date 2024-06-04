import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../AuthService";
import Profile from "./PrivateRoute/profiles";
import Payments from "./PrivateRoute/payments";
import Connections from "./PrivateRoute/connections";
import Support from "./PrivateRoute/support";
import ContactUs from "./PrivateRoute/contactus";
import GoChat from "./PrivateRoute/goChat";
import { toast } from 'react-toastify';

// Objeto de estilo fora do componente para evitar recriação em cada renderização
const flexContainerStyle = {
  display: 'flex', 
  flexWrap: 'wrap',
  justifyContent: 'center', // Centraliza os itens no contêiner (opcional)
  alignItems: 'flex-start' // Alinha os itens ao topo do contêiner
};

function HomePageAuth() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      toast("Você não está logado. Redirecionando para a tela de login...");
      navigate('/Login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return <div>Redirecionando para a tela de login...</div>;
  }

  return (
    <div className="homepage-auth" >
      <div style={flexContainerStyle}>
        <Profile />
        <Connections />
        <GoChat />
        <Payments />
        <Support />
        <ContactUs />
      </div>
    </div>
  );
}

export default HomePageAuth;
