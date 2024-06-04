import React from "react";
import CTA from "./cta";
import { Link } from "react-router-dom";
import ComoFunciona from "./howitwork";
import GridPublicUsers from "./gridPublicUsers";
import Background from '../imgs/background.webp';  // Correção ortográfica
import { Navbar, Container, Button, Row, Col, Card } from 'react-bootstrap';

const HomePage = () => {

    const containerStyle = {
        position: 'relative',
        width: "100vw",
        height: '85vh',
        overflow: 'hidden'
    };

    const imageStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: '0.3'
    };

    const textStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#343A3F',
        textAlign: 'center'
    };

    const buttonStyle = {
        marginTop: '20px',
        backgroundColor: '#007bff',
        borderColor: '#007bff'
    };

    const navbarStyle = {
        height: '5vh',
        backgroundColor: '#343A3F',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff'
    };

    return (
        <div>
            <div style={containerStyle}>
                <img 
                    src={Background}
                    style={imageStyle}
                    alt='Ilustração com diversos ícones representando conexões, viagens e tecnologias.'
                />
                <div style={textStyle}>
                    <h1>ElosCloud</h1>
                    <p>
       É possível construir relações genuínas on-line?
      </p>
      <p>O desafio parece grande, mas nós gostamos de desafios!</p>
                          <Button style={buttonStyle} size="lg">Saiba Mais</Button>
                </div>
            </div>
            <Navbar style={navbarStyle}>
            ✊🏽 Juntos & Misturados 🏳️‍🌈
            </Navbar>
            <Container className="my-5">
            <h2 className="text-center mb-4">ElosCloud em 3 Palavras</h2>
                <Row className="text-center">
                    <Col md={4}>
                        <Card className="mb-4">
                            <Card.Body>
                                <Card.Title>Afinidades</Card.Title>
                                <Card.Text>
                                    Aqui você constrói sua rede com base em afinidades.
                                    Um local exclusivo para convidados.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="mb-4">
                            <Card.Body>
                                <Card.Title>Relações</Card.Title>
                                <Card.Text>
                                    Estar em um ambiente seguro para se relacionar.
                                    Fale com pessoas de verdade.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="mb-4">
                            <Card.Body>
                                <Card.Title>Negócios</Card.Title>
                                <Card.Text>
                                    Negocie com profissionais qualificados.
                                    Diversos tipos de negócios genuínos.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <GridPublicUsers />
                <Card>
                    <Card.Body>
                Valorizamos os pequenos empresários e estamos dispostos a ajudar seu negócio a crescer.<br/>
                Fale com a gente e vamos começar essa jornada juntos!
                </Card.Body>
                <Card.Footer>
                <Button as={Link} to="/contato" variant="dark">
        Entrar em Contato
      </Button>
      </Card.Footer>
      </Card>
            </Container>
            <CTA />
            <ComoFunciona />
        </div>
    );
}

export default HomePage;