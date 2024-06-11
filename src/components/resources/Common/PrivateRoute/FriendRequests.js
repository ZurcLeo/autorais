import React, { useEffect } from 'react';
import { Card, ListGroup, Button, Row, Col } from "react-bootstrap";
import { useConnections } from './hooks/useConnections';

const FriendRequests = () => {
    const { friendRequests, handleAcceptFriendRequest, handleRejectRequest, fetchFriendRequests } = useConnections();

    useEffect(() => {
        fetchFriendRequests(); // Certifique-se de buscar as solicitações de amizade ao montar o componente
    }, [fetchFriendRequests]);

    return (
        <Card className='main-card'>
            <Card.Body>
                <Card.Text>Solicitações de Amizade</Card.Text>
                <ListGroup variant="flush">
                    {friendRequests.map((request) => (
                        <Card  className='main-card' key={request.id}>
                        <ListGroup.Item className='sub-card'>
                                <Row className='mt-3'>
                                <Col>
                                    <img className="foto-perfil" src={request.fotoDoPerfil} alt="Foto do perfil" width="50" height="50" />
                                    <Card.Text>{request.nome}</Card.Text>
                                    <Card.Text>{request.email}</Card.Text>
                                </Col>
                                <Col>
                                    <Button variant="warning" onClick={() => handleAcceptFriendRequest(request.uid)}>
                                        Aceitar
                                    </Button>
                                    <Button variant="outline-warning" onClick={() => handleRejectRequest(request.uid)}>
                                        Rejeitar
                                    </Button>
                                </Col>
                                </Row>
                                </ListGroup.Item>
                            </Card>
                       
                    ))}
                </ListGroup>
            </Card.Body>
        </Card>
    );
};

export default FriendRequests;
