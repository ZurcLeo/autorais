import React from 'react';
import { Card, Container, Row, Col, Button } from "react-bootstrap";
import { FaUserCircle } from 'react-icons/fa';
import { useConnections } from './hooks/useConnections';
import './ActiveConnections.css'

const ActiveConnections = () => {
    const { activeConnections } = useConnections();

    const handleImageError = (e) => {
        e.target.src = process.env.REACT_APP_PLACE_HOLDER_IMG;
    };

    return (
        <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">Conexões Ativas</Card.Header>
            <Card.Body>
                <Container>
                    <Row className="g-4">
                        {activeConnections.length > 0 ? (
                            activeConnections.map((connection) => (
                                <Col key={connection.uid} sm={6} md={4} lg={3}>
                                    <Card className="h-100 text-center shadow-sm border-0">
                                        <Card.Img
                                            variant="top"
                                            src={connection.fotoDoPerfil || process.env.REACT_APP_PLACE_HOLDER_IMG}
                                            alt={connection.nome}
                                            onError={handleImageError}
                                            className="rounded-circle mx-auto mt-3"
                                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                        />
                                        <Card.Body>
                                            <Card.Title>{connection.nome}</Card.Title>
                                            <Card.Text>{connection.email}</Card.Text>
                                            <Button variant="outline-primary" href={`/perfil/${connection.uid}`}>
                                                Ver Perfil
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col>
                                <div className="text-center">
                                    <FaUserCircle size={50} className="text-muted mb-3" />
                                    <p className="text-muted">Você não possui conexões ativas.</p>
                                </div>
                            </Col>
                        )}
                    </Row>
                </Container>
            </Card.Body>
        </Card>
    );
};

export default ActiveConnections;