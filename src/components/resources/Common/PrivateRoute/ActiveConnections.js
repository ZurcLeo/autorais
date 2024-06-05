import React from 'react';
import { Card, Container, Row, Col } from "react-bootstrap";
import { FaUserCircle } from 'react-icons/fa';
import { useConnections } from './hooks/useConnections';
import './ActiveConnections.css';

const ActiveConnections = () => {
    const { activeConnections } = useConnections();

    const handleImageError = (e) => {
        e.target.src = process.env.REACT_APP_PLACE_HOLDER_IMG;
    };

    const handleCardClick = (uid) => {
        window.location.href = `/perfil/${uid}`;
    };

    return (
        <Card className="shadow-sm border-0">
            <Card.Header className="bg-light text-dark text-center py-4">
                <h3 className="mb-0">Conexões Ativas</h3>
            </Card.Header>
            <Card.Body className="p-5">
                <Container>
                    <Row className="g-4">
                        {activeConnections.length > 0 ? (
                            activeConnections.map((connection) => (
                                <Col key={connection.uid} sm={6} md={4} lg={3}>
                                    <Card 
                                        className="h-100 text-center shadow-sm border-0 clickable-card"
                                        onClick={() => handleCardClick(connection.uid)}
                                    >
                                        <div className="position-relative">
                                            <Card.Img
                                                variant="top"
                                                src={connection.fotoDoPerfil || process.env.REACT_APP_PLACE_HOLDER_IMG}
                                                alt={connection.nome}
                                                onError={handleImageError}
                                                className="rounded-circle mx-auto mt-3"
                                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                            />
                                            {connection.melhorAmigo && (
                                                <div className="best-friend-marker"></div>
                                            )}
                                        </div>
                                        <Card.Body>
                                            <Card.Title className="mb-2">{connection.nome}</Card.Title>
                                            <Card.Text className="text-muted mb-3">{connection.email}</Card.Text>
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
