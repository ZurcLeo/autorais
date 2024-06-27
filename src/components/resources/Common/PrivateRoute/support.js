import React, { useState, useEffect } from "react";
import { Card, Container, Image } from "react-bootstrap";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebase.config';
import { platform } from "process";

const Support = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Garante que o componente sabe quando está carregando dados
const placeHolderImg = process.env.REACT_APP_PLACE_HOLDER_IMG; // Caminho para a imagem placeholder


  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (usuarioFirebase) => { // Usando async diretamente aqui
      if (usuarioFirebase) {
        setUser(usuarioFirebase);

        // A função é movida para dentro do useEffect, mas ainda é assíncrona
        try {
          const userDocRef = doc(db, "usuario", usuarioFirebase.uid);
          const docSnapshot = await getDoc(userDocRef);
          if (docSnapshot.exists()) {
            setUserData(docSnapshot.data());
          } else {
            console.log("Nenhum dado de usuário encontrado no Firestore");
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
        } finally {
          setIsLoading(false); // Finaliza o carregamento após a tentativa de buscar os dados
        }
      } else {
        setIsLoading(false); // Também finaliza o carregamento se não houver usuário logado
      }
    });

    // Limpeza da subscrição ao desmontar o componente
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !userData) {
    return <div>
          <Container className="d-flex justify-content-center align-items-center my-5">

    <Card style={{ width: '18rem' }}>
          <Card.Header>Dados de Suporte</Card.Header>
          <Card.Body className="text-center">
           
            <Card.Title className="mt-3">Nada por aqui</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">Chamados de Suporte</Card.Subtitle>
            <Card.Text>Todos os seus chamados estarão aqui.</Card.Text>
          </Card.Body>
        </Card>
        </Container>
        </div>; // Fornece feedback ao usuário
  }

  return (
    <div>
      <Container className="d-flex justify-content-center align-items-center my-5">
        <Card style={{ width: '18rem' }}>
          <Card.Header>Dados de Suporte</Card.Header>
          <Card.Body className="text-center">
            <Image
              src={userData.picture || placeHolderImg}
              alt={userData.name}
              roundedCircle
              fluid
              style={{ width: '100px', height: '100px' }}
            />
            <Card.Title className="mt-3">{userData.name}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">{userData.nickname}</Card.Subtitle>
            <Card.Text>{userData.email}</Card.Text>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Support;
