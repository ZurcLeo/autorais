//eloswebapp/src/components/pages/apresentacaoAreaRestrita.js
import React from 'react';
import { Container, Row, Col, Card, Button, Image, Badge, Alert } from 'react-bootstrap';
import ClaudAvatar from '../imgs/robozinho_tres.webp'; // Certifique-se de ter uma imagem para o Claud
import EllaAvatar from '../imgs/robozinho_dois.webp'
import SamAvatar from '../imgs/robozinho_um.webp'
import Cadeado from '../imgs/cadeado.png';

const ApresentacaoAR = () => {
  return (
    <Container className="mt-5">
        <h3>Nossos recursos On-Line</h3>
        <br />
      <Row>
        {/* Coluna para a Área Restrita e CTA para Login */}
        <Col md={6} className="d-flex align-items-center justify-content-center">
            <Col xs={12} md={8}>
          <Card className="bg-light text-center">
            
            <Card.Img variant="top" src={Cadeado} alt="Claud Avatar" />
            <Card.Body>
              <Card.Title>Area Restrita</Card.Title>
              <Card.Text>
                Crie sua conta e acesse serviços exclusivos.
              </Card.Text>
              <Button variant="success">Registre-se</Button>
              <span> ou </span>
              <Button variant="success">Entre</Button>
            </Card.Body>
          </Card>
        </Col>
          
        </Col>

        {/* Coluna para o Card do Claud */}

        <Col xs={12} md={2}>
          <Card className="bg-light text-center">
          <Image thumbnail roundedCircle variant="top" src={ClaudAvatar} alt="Claud Avatar" />    
            <Card.Body>
              <Card.Title>Claud</Card.Title>
              <Card.Text>
                Assistente Pessoal
              </Card.Text>

              <Badge bg='info'>Planejador de Metas</Badge>
              <Badge bg='success'>Gestao de Compromissos</Badge>
              <Badge bg='warning'>Analise de Objetivos</Badge>
              <Badge bg='dark'>Organizador de tarefas</Badge>
<br />
<br />
              <Button variant="success" disabled>Adicionar Claud como amigo</Button>
            </Card.Body>
          </Card>

        </Col>
        <Col xs={12} md={2}>
          <Card className="bg-light text-center">
          <Image thumbnail roundedCircle variant="top" src={EllaAvatar} alt="Claud Avatar" />    
                  <Card.Body>
              <Card.Title>Ella</Card.Title>
              <Card.Text>
                Assistente Financeira
              </Card.Text>
              <Badge bg='info'>Analista de Metas</Badge>
              <Badge bg='success'>Alertas de Pagamentos</Badge>
              <Badge bg='warning'>Analise de Pagamentos</Badge>
              <Badge bg='dark'>Planejador de tarefas</Badge>
<br />
<br />
              <Button variant="success" disabled>Adicionar Ella como amigo</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={2}>
          <Card className="bg-light text-center">
            <Image thumbnail roundedCircle variant="top" src={SamAvatar} alt="Claud Avatar" />
            <Card.Body>
              <Card.Title>Sam</Card.Title>
              <Card.Text>
                Assistente Comercial
              </Card.Text>
              <Badge bg='info'>Calculadora de Metas</Badge>
              <Badge bg='success'>Priorizacao focada</Badge>
              <Badge bg='warning'>Indicadores</Badge>
              <Badge bg='dark'>Calculadora de tarefas</Badge>
<br />
<br />
              <Button variant="success" disabled> Adicionar Ella como amigo</Button>
            </Card.Body>
          </Card>
          
        </Col>
      </Row>
      <br/>
      <br/>
      <Alert>Registre-se ou entre para se conectar a outras pessoas.</Alert>
 
      <br/>
      <br/>

    </Container>
  );
};

export default ApresentacaoAR;
