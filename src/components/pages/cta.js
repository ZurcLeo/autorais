import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import './cta.css';
import { Link } from 'react-router-dom';
import { 
  IoExtensionPuzzleOutline, 
  IoChatbubblesOutline, 
  IoNewspaperOutline,
  IoVideocamOutline
} from "react-icons/io5";import CTAItem from './CTAitem';

const ctaData = [
  {
    title: 'Conexões',
    text: 'Conectar-se com pessoas é o que torna tudo mais interessante, não é? Queremos que você construa relações autênticas, seja através de um encontro casual num café ou uma conversa no parque com alguém que também está na nossa rede. Nossa missão é facilitar essas conexões e ajudar você a fortalecer esses laços, tornando cada interação especial e significativa.',
  },
  {
    title: 'Postagens',
    text: 'Compartilhar experiências é o que nos aproxima. Queremos ajudar você a criar momentos memoráveis para seus clientes, seja numa postagem sobre aquela viagem incrível ou uma dica valiosa para o dia a dia. Nossa equipe vai te ajudar a melhorar cada ponto de contato, garantindo que suas postagens reflitam a essência da sua marca e encantem seu público.',
  },
  {
    title: 'Chat',
    text: 'Nada melhor do que resolver dúvidas na hora, certo? Nosso serviço de chat é perfeito para isso! Estamos aqui para garantir que seus clientes tenham respostas rápidas e úteis, fazendo com que se sintam bem atendidos e mais próximos de você. Vamos juntos tornar cada conversa uma oportunidade de fortalecer laços e construir confiança.',
  },
  {
    title: 'Transmissões ao Vivo',
    text: 'Imagine poder explicar aquela documentação complicada ou compartilhar conhecimento ao vivo com seus funcionários ou clientes. As transmissões ao vivo são perfeitas para isso! Estamos aqui para ajudar você a criar treinamentos e conteúdos ao vivo que sejam envolventes e eficazes. Com a nossa rede de especialistas, cada transmissão será uma experiência valiosa e produtiva.',
  },
];

const ctaIcons = [
  <IoExtensionPuzzleOutline size={60} />,
  <IoNewspaperOutline size={60} />,
  <IoChatbubblesOutline size={60} />,
  <IoVideocamOutline size={60} />,
];

const CTA = () => {
  return (
    <Container className="py-5">
      <h4 className="text-center p-3">Funcionalidades</h4>
   
      <Row>
  {ctaData.map((cta, index) => (
    <Col key={index} lg={6} className="mb-4">
      <CTAItem
        icon={ctaIcons[index]}
        title={cta.title}
        text={cta.text}
      />
    </Col>
  ))}
</Row>
      <Button as={Link} to="/contato" variant="dark">
        Entrar em Contato
      </Button>
    </Container>
  );
};

export default CTA;