import React from "react";
import { Row, Col, Card, Image, Container } from 'react-bootstrap';
import { FaAward, FaUsers } from 'react-icons/fa';
import Hero from "./Hero";
import leo from '../imgs/leo.jpeg';
import CertG from '../imgs/uxgooglecert.png';
import CertS from '../imgs/badge-spoc-1.webp';
import '../pages/about.css';

function Sobre() {
  const teamMembers = [
    {
      id: "1001",
      image: leo,
      name: "Leonardo Cruz",
      role: "Especialista em Experiência do Usuário",
      skills: ["Gestão de TI", "UX Design", "Visão de Negócios", "Consultoria Tecnológica", "Design Instrucional"]
    },
  ];

  return (
    <div>
      <Hero title="Quem Somos" />
      <Container fluid>
        <Row className="m-5 justify-content-center">
          <Col lg={6} className="mb-5">
            <Card className="mb-3">
              <Card.Header>Nossa História</Card.Header>

              <Card.Body>
              
              <Card.Subtitle>O surgimento da ElosCloud</Card.Subtitle>
              <Card.Text>A Elos Soluções Cloud é uma empresa de tecnologia fundada em 2017, com a missão de transformar e facilitar a jornada digital de microempreendedores, escolas e pequenas empresas. Nosso principal objetivo é fornecer soluções de tecnologia inovadoras e eficazes, com foco especial na educação.</Card.Text>
    
              <Card.Subtitle>Desafios que nos movem</Card.Subtitle>
              <Card.Text>Desde o início, compreendemos que o mundo digital pode ser intimidador para muitos empreendedores, por isso nos dedicamos a facilitar essa transição, oferecendo ferramentas, recursos e conhecimentos necessários para prosperar na economia digital.</Card.Text>
   
              <Card.Subtitle>Conexões que nos fortalecem</Card.Subtitle>
              <Card.Text>Como parceiros oficiais da Microsoft, temos acesso às mais avançadas soluções de nuvem disponíveis no mercado. Essa parceria nos permite ajudar nossos clientes a alavancar todo o potencial da digitalização, proporcionando-lhes acesso a uma ampla gama de serviços e ferramentas de negócios.</Card.Text>
    
              <Card.Subtitle>Aprendizados que nos impulsionam</Card.Subtitle>
              <Card.Text>Acreditamos fortemente na importância da educação em todos os processos. Por isso, concentramos nossos esforços na oferta de treinamentos, webinars, workshops e cursos de capacitação em diversas áreas digitais. Nossos programas de aprendizado são adaptados às necessidades específicas de cada cliente, garantindo que o aprendizado seja relevante, eficaz e aplicável.</Card.Text>
    
              <Card.Subtitle>Integrações que nos envolvem</Card.Subtitle>
              <Card.Text>Por meio de nossos serviços de UX Design e Design Instrucional, buscamos criar experiências digitais intuitivas e agradáveis, além de conteúdos educacionais envolventes e impactantes. Seja através do design de interfaces de usuário, desenvolvimento de plataformas de aprendizado online ou criação de cursos digitais, nosso objetivo é sempre fornecer soluções que atendam às necessidades dos nossos clientes da melhor maneira possível.</Card.Text>
    
              <Card.Subtitle>Inovação que nos destaca</Card.Subtitle>
              <Card.Text>Na Elos Cloud, nos orgulhamos de nossa dedicação à excelência, inovação e satisfação do cliente. Estamos constantemente buscando novas maneiras de aprimorar nossos serviços e oferecer as melhores soluções para as necessidades de negócios digitais dos nossos clientes.</Card.Text>
    
              <Card.Subtitle>Comunicação que nos aproxima</Card.Subtitle>
              <Card.Text>Junte-se a nós em nossa missão de empoderar microempreendedores, escolas e pequenas empresas em sua jornada digital. Acreditamos que, juntos, podemos construir um futuro digital melhor.</Card.Text>
    
    </Card.Body>
    </Card>
                      
                      </Col>
          <Col lg={6} className="mb-5">
            <h4><FaUsers /> Nossos Talentos</h4>
            {teamMembers.map((member, index) => (
              <Card key={member.id || index} className="mb-3">
                <Card.Body>
                  <Row>
                    <Col sm={4}>
                      <Image src={member.image} thumbnail roundedCircle />
                    </Col>
                    <Col sm={8}>
                      <Card.Title>{member.name}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">{member.role}</Card.Subtitle>
                      <Card.Text>{member.skills.join(', ')}</Card.Text>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
            <h4><FaAward /> Certificações</h4>
            <Image src={CertG} className="cert" alt="Google UX Certified - Badge" />
            <Image src={CertS} className="cert" alt="Product Owner Certified - Badge" />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Sobre;
