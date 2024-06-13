//eloswebapp/src/components/resources/Common/PrivateRoute/contactus.jsx
import React, { useState, useEffect } from "react";
import { Card, Container, Image } from "react-bootstrap";
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const ContactUs = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Usuário está autenticado
        setUser(firebaseUser);
        setIsLoading(false);
      } else {
        // Usuário não está autenticado
        setIsLoading(false);
      }
    });

    return () => unsubscribe(); // Limpeza ao desmontar
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Usuário não autenticado</div>;
  }

  return (
    <div>
      <Container className="d-flex justify-content-center align-items-center my-5">
        <Card style={{ width: '18rem' }}>
            <Card.Header>Fale Conosco</Card.Header>
          <Card.Body className="text-center">
            <Image
              src={user.photoURL || 'caminho_para_uma_imagem_padrão.jpg'}
              alt={user.displayName || 'Usuário'}
              roundedCircle
              fluid
              style={{ width: '100px', height: '100px' }}
            />
            <Card.Title className="mt-3">{user.displayName || 'Nome do Usuário'}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">{user.email || 'Email do Usuário'}</Card.Subtitle>
            <Card.Text>Alguma informação de contato ou instrução adicional pode ser colocada aqui.</Card.Text>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default ContactUs;
