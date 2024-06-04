import React from "react";
import { Container, Row, Col, Card, Button, ListGroup } from "react-bootstrap";
import Hero from "./Hero";

import {
  FaRegCompass,
  FaGamepad,
  FaRegPaperPlane,
  FaRegAddressBook,
} from "react-icons/fa";

const cardData = [
  {
    variant: 'success',
    header: 'UX/UI Design',
    title: 'Foco no Usuário',
    text: 'Por meio de uma abordagem centrada no usuário oferecemos:',
    icon: <FaRegCompass size={60} />,
    list: [
      'Pesquisa de Usuário',
      'Arquitetura da Informação',
      'Design de Interação',
      'Mapeamento de Experiências',
      'Prototipagem',
      'Teste de Usabilidade',
      'Design de Interfaces',
      'Experiência Mobile',
      'Acessibilidade',
      'Jornada do usuário'
    ]
  },
  {
    variant: 'success',
    header: 'Design Instrucional',
    title: 'Treinamentos Gamificados',
    text: 'Oferecemos conteúdos educacionais através de:',
    icon: <FaGamepad size={60} />,
    list: [
      'Criação',
      'Consultoria',
      'Design para EaD',
      'Gamificação',
      'Criação de MOOCs',
      'Adaptação para Presencial',
      'Adaptação para EaD',
      'Treinamento Corporativo',
      'Avaliação do Aprendizado',
      'Suporte e Manutenção'
    ]
  },
  {
    variant: 'success',
    header: 'Transformação Digital',
    title: 'Microempreendedores',
    text: 'Oferecemos suporte a pequenos empreendedores com:',
    icon: <FaRegPaperPlane size={60} />,
    list: [
      'Consultoria',
      'Implementação Cloud',
      'Suporte em TI',
      'Soluções de E-Commerce',
      'Marketing Digital',
      'Soluções Digitais',
      'Gerenciamento de Dados',
      'Segurança Digital',
      'Integração de Sistemas',
      'Automação de Processos'
    ]
  },
  {
    variant: 'success',
    header: 'Tecnologias Educacionais',
    title: 'Educação como Estrutura',
    text: 'É com ferramentas educacionais eficazes que oferecemos:',
    icon: <FaRegAddressBook size={60} />,
    list: [
      'Cursos On-Line',
      'Treinamentos Específicos',
      'Webnars e Workshop',
      'Consultoria Educacional',
      'Plataforma de Aprendizado',
      'Conteúdo Educativo',
      'Programas de Certificação',
      'Suporte de Aprendizado',
      'Aprendizado Personalizado',
      'Parcerias Educacionais'
    ]
  },
];



const Services = () => {
  return (
    <>
    
      <Hero title="Serviços">
        <p>
          Elos Soluções Cloud eleva o patamar do UX (User Experience) e UI (User Interface) design, oferecendo experiências intuitivas e visualmente cativantes...
        </p>
      </Hero>
      
      <br />
      <Container fluid>
        <Row className="justify-content-center">
          {cardData.map((card, index) => (
            <Col md={4} lg={3} key={index} className="mb-4">
              <Card border="light" className="h-100 shadow">
                <Card.Header className="bg-primary text-white">{card.header}</Card.Header>
                <Card.Body>
                  <Card.Title className="mb-3"><br />{card.icon}<br /><br /> {card.title}</Card.Title>
                  <Card.Text>{card.text}</Card.Text>
                  <ListGroup variant="flush">
                    {card.list.map((item, idx) => (
                      <ListGroup.Item key={idx}>{item}</ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
                <Card.Footer>
                <br />
                 
                <Button variant="dark" style={{ width: '100%' }}>Entre em Contato</Button>

                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default Services;