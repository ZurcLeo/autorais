import React from 'react';
import { Container, Card, Image } from 'react-bootstrap';
import Img404 from '../imgs/ilustrprojectmanager.png';

function NotFoundPage() {
  // Estilo customizado para definir a largura e a altura do Card
  const cardStyle = {
    width: '80%',
    // Para centralizar o Card no Container
    margin: 'auto',
    // Adicionando margem superior e um pouco de espaço
    marginTop: '5%',
  };

  return (
    <Container className="text-center d-flex align-items-center justify-content-center" style={{ height: '100vh' }}> {/* Ajuste para que o Container preencha a altura da tela */}
      <Card style={cardStyle}>
        <Card.Header as="h1">Erro 404</Card.Header>
        <Card.Body>
          <Card.Title>Não encontramos essa página.</Card.Title>
          <Card.Text>
            Tente recarregar ou voltar ao início.
          </Card.Text>
          {/* Ajustando a imagem para se adequar ao Card */}
          <Image src={Img404} alt="Ilustração de um gerenciamento ágil de projeto" style={{ maxWidth: '100%', height: 'auto' }} fluid />
        </Card.Body>
      </Card>
    </Container>
  );
}

export default NotFoundPage;
