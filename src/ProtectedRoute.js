import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Usuário autenticado, exibindo conteúdo protegido...', user);
        setUser(user);
      } else {
        console.log('Usuário não autenticado, redirecionando para a página de login...');
      }
      setIsLoading(false);
    }, (error) => {
      console.log(`Erro na autenticação: ${error.message}`);
      setError(error);
      setIsLoading(false);
    });

    // Limpa a inscrição ao desmontar
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    console.log('Carregando estado de autenticação...');
    return <div>Carregando...</div>;
  }

  if (error) {
    console.log(`Erro na autenticação: ${error.message}`);
    // Aqui você pode decidir o que fazer em caso de erro, por exemplo, redirecionar para uma página de erro ou exibir uma mensagem.
  }

  return user ? children : <Navigate to="/Login" replace />;
};

export default ProtectedRoute;
