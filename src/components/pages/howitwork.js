import React, { useState } from 'react';
import { Container, Badge, Row, Col, CardGroup, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { FaChartBar, FaClipboardList, FaCogs, FaChartLine } from 'react-icons/fa';
import './howitwork.css';
import EnvioDeConvite from '../imgs/enviodeconvite.png';
import RecebimentoDeConvite from '../imgs/recebimentodeconvite.png';
import PrimeiroLogin from '../imgs/primeirologin.png';
import BoasVindas from '../imgs/boasvindas.png';
import { Link } from 'react-router-dom';

const ComoFunciona = () => {
  const [email, setEmail] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você pode adicionar a lógica para enviar o e-mail para uma API ou outro serviço
    alert(`E-mail enviado: ${email}`);
    setEmail('');
  };

  const steps = [
    {
      title: 'Enviar',
      subtitle: 'PASSO 1',
      description: 'O seu amigo pessoal ou parceiro de negócios que já está na plataforma é o responsável pelo envio de convite. Fique atento ao seu e-mail!',
      icon: <FaChartBar size={60} />,
      image: EnvioDeConvite,
      links: [],
    },
    {
      title: 'Validar',
      subtitle: 'PASSO 2',
      description: 'Você verifica sua caixa de entrada e abre o convite. Você clica em Aceitar Convite e é redirecionado para a plataforma.',
      icon: <FaClipboardList size={60} />,
      image: RecebimentoDeConvite,
      links: [],
    },
    {
      title: 'Entrar',
      subtitle: 'PASSO 3',
      description: 'Usando o e-mail que recebeu o convite, você cria a sua conta, realiza o primeiro acesso e preenche os dados do seu perfil.',
      icon: <FaCogs size={60} />,
      image: PrimeiroLogin,
      links: [],
    },
    {
      title: 'Aproveitar',
      subtitle: 'PASSO 4',
      description: 'Exclusivamente ate o fim de 2024, ao criar sua conta na ElosCloud você receberá 5.000 ElosCloin para usar como quiser!',
      icon: <FaChartLine size={60} />,
      image: BoasVindas,
      links: [],
    },
  ];

  return (
    <Container className="py-5">
      <h4>Quer Entrar Para a Comunidade?</h4>
      <p>
        Em alguns passos simples, você pode obter acesso a nossa plataforma.
        <br />
        Qualquer pessoa na comunidade pode te convidar, veja como:
      </p>
      <Row className="justify-content-center">
        <CardGroup>
          {steps.map((step, index) => (
            <Col key={index} xs={12} sm={6} md={3}>
              <Card className="h-100 border-0 bystep">
                <Card.Img className='imgstep' variant="top" src={step.image} alt={step.title} />
                <Card.Body>
                  <Badge bg="dark" text="light" className="mb-3">{step.subtitle}</Badge>
                  <Card.Title className="mb-3">{step.title}</Card.Title>
                  <Card.Text>{step.description}</Card.Text>
                  {step.links.map((link, linkIndex) => (
                    <div key={linkIndex}>
                      <Link to={link.url}><span>{link.text}</span></Link>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </CardGroup>
      </Row>
      <Card className="mt-5">
        <Card.Header>Como Entrar</Card.Header>
        <Card.Body>
          <Card.Text>Quer entrar para a nossa comunidade? <br/>
          Envie o seu e-mail e nós avisaremos assim que novos convites estiverem disponíveis.</Card.Text>
      <Form onSubmit={handleSubmit} className="mb-3">
        <Form.Group controlId="formEmail">
          <InputGroup>
          <Form.Control
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={handleEmailChange}
          />
           <Button variant="dark" type="submit" id="button-addon2">
          Entrar na Lista
        </Button>
            </InputGroup>
        </Form.Group>
      </Form>
      </Card.Body>
      </Card>
      </Container>
  );
};

export default ComoFunciona;