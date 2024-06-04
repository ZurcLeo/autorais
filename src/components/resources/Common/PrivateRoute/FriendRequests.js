// components/FriendRequests.js
import React from 'react';
import { Card, ListGroup, Button, Row, Col } from "react-bootstrap";
import { useConnections } from './hooks/useConnections';

const FriendRequests = () => {
    const { friendRequests, handleAcceptFriendRequest, handleRejectRequest } = useConnections();

    return (
        <Card>
            <Card.Header>Solicitações de Amizade</Card.Header>
            <Card.Body>
                <ListGroup variant="flush">
                    {friendRequests.map((request) => (
                        <ListGroup.Item key={request.id}>
                            <Row>
                                <Col>
                                <Card.Text>{request.fotoDoPerfil}</Card.Text>
                                    <Card.Text>{request.nome}</Card.Text>
                                    <Card.Text>{request.email}</Card.Text>
                                </Col>
                                <Col>
                                    <Button variant="success" onClick={() => handleAcceptFriendRequest(request.id)}>
                                        Aceitar
                                    </Button>
                                    <Button variant="danger" onClick={() => handleRejectRequest(request.uid)}>
                                        Rejeitar
                                    </Button>
                                </Col>
                            </Row>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Card.Body>
        </Card>
    );
};

export default FriendRequests;