import React from 'react';
import { Card, Container, Row, Col, Button } from "react-bootstrap";
import { FaUserCircle } from 'react-icons/fa';
import { useConnections } from './hooks/useConnections';
import { useAuth } from '../../AuthService';
import './ActiveConnections.css';

const ActiveConnections = () => {
    const { activeConnections, handleAuthorizeFriend, handleDeauthorizeFriend } = useConnections();
    const { currentUser } = useAuth();

    const handleImageError = (e) => {
        e.target.src = process.env.REACT_APP_PLACE_HOLDER_IMG;
    };

    const handleCardClick = (uid) => {
        window.location.href = `/perfil/${uid}`;
    };

    const isAuthorized = (uid) => currentUser.amigosAutorizados.includes(uid);

    return (
        <Card className="main-card shadow-sm border-0">
            <Card.Body>
            <Card.Text>
               Conexões Ativas
            </Card.Text>
                <Container>
                    <Row className="g-4">
                        {activeConnections.length > 0 ? (
                            activeConnections.map((connection) => (
                                <Col key={connection.uid} sm={6}>
                                    <Card 
                                        className="sub-card h-100 shadow-sm border-0 clickable-card"
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
                                            {isAuthorized(connection.uid) && (
                                                <div className="best-friend-marker"></div>
                                            )}
                                        </div>
                                        <Card.Body>
                                            <Card.Title className="text-name mb-2">{connection.nome}</Card.Title>
                                            <Card.Text className="text-muted mb-3">{connection.email}</Card.Text>
                                            {/* {isAuthorized(connection.uid) ? (
                                                <Button variant="outline-danger" onClick={() => handleDeauthorizeFriend(connection.uid)}>
                                                    Desautorizar
                                                </Button>
                                            ) : (
                                                <Button variant="outline-success" onClick={() => handleAuthorizeFriend(connection.uid)}>
                                                    Autorizar
                                                </Button>
                                            )} */}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col>
                                <div className="sub-card">
                                    <FaUserCircle size={50} className="icon-white mb-3" />
                                    <p className="text-white">Você não possui conexões ativas.</p>
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
