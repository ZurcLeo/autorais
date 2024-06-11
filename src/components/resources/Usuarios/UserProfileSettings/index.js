import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { useUserContext } from '../../userContext';
import useNotification from '../../Common/PrivateRoute/hooks/useNotification'
import useUnreadComments from '../../Common/PrivateRoute/hooks/useUnreadComments';
import useUnreadConnections from '../../Common/PrivateRoute/hooks/useUnreadConnections';
import useUnreadMessage from '../../Common/PrivateRoute/hooks/useUnreadMessage';
import useUserProfile from '../../Common/PrivateRoute/hooks/useUserProfile';

const UserProfileSettings = () => {
  const { currentUser } = useUserContext();
  const { userData, updateProfileData, isLoading, isEditing, setIsEditing } = useUserProfile();
  const { globalNotifications, privateNotifications, markAsRead } = useNotification();
  const unreadCommentsCount = useUnreadComments();
  const unreadConnections = useUnreadConnections();
  const unreadMessages = useUnreadMessage();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ ...userData });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
    await updateProfileData(formData);
    setEditing(false);
  };

  if (isLoading) {
    return <Spinner animation="border" />;
  }

  return (
    <Container>
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body>
              <h2>Configurações do Perfil</h2>
              <Row>
                <Col sm={6}>
                  <h4>Informações do Usuário</h4>
                  {editing ? (
                    <Form>
                      <Form.Group controlId="formName">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                          type="text"
                          name="nome"
                          value={formData.nome}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                      <Form.Group controlId="formEmail">
                        <Form.Label>E-mail</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                      <Button variant="primary" onClick={handleSaveChanges}>
                        Salvar Alterações
                      </Button>
                      <Button variant="secondary" onClick={() => setEditing(false)}>
                        Cancelar
                      </Button>
                    </Form>
                  ) : (
                    <>
                      <p>Nome: {userData.nome}</p>
                      <p>E-mail: {userData.email}</p>
                      <p>ID: {userData.uid}</p>
                      <Button variant="light" onClick={() => setEditing(true)}>
                        Editar Informações
                      </Button>
                    </>
                  )}
                </Col>
                <Col sm={6}>
                  <h4>Compras e Pagamentos</h4>
                  <Badge variant="danger">
                    <p>Saldo (ℰ$): {userData.saldoElosCoins}</p>
                  </Badge>
                  <p>Total: 500 MB</p>
                  <Button variant="light">Mostrar detalhes</Button>
                </Col>
              </Row>

              <Row>
                <Col sm={6}>
                  <h4>Postagens</h4>
                  <p>Total de Postagens: {userData.postagens}</p>
                  <Button variant="primary">Editar Postagens</Button>
                </Col>
                <Col sm={6}>
                  <h4>Melhores Amigos</h4>
                  <p>Total de Melhores Amigos: {userData.amigosAutorizados}</p>
                  <Button variant="danger">Editar Melhores Amigos</Button>
                </Col>
              </Row>

              <Row>
                <Col sm={6}>
                  <h4>Comentários Não Lidos</h4>
                  <p>{unreadCommentsCount} Comentários não lidos</p>
                </Col>
                <Col sm={6}>
                  <h4>Conexões</h4>
                  <p>Novas Solicitações: {unreadConnections.newRequests}</p>
                  <p>Solicitações Aceitas: {unreadConnections.acceptedRequests}</p>
                  <p>Conexões Dissolvidas: {unreadConnections.dissolvedConnections}</p>
                </Col>
              </Row>

              <Row>
                <Col sm={6}>
                  <h4>Mensagens Não Lidas</h4>
                  <p>{unreadMessages} Mensagens não lidas</p>
                </Col>
                <Col sm={6}>
                  <h4>Notificações</h4>
                  <ul>
                    {globalNotifications.map(notification => (
                      <li key={notification.id}>{notification.message}</li>
                    ))}
                    {privateNotifications.map(notification => (
                      <li key={notification.id}>{notification.message}</li>
                    ))}
                  </ul>
                  <Button variant="light">Marcar todas como lidas</Button>
                </Col>
              </Row>

              <Row>
                <Col sm={12}>
                  <h4>Newsletter</h4>
                  <Form>
                    <Form.Group controlId="formNewsletterName">
                      <Form.Control type="text" placeholder="Nome" />
                    </Form.Group>
                    <Form.Group controlId="formNewsletterEmail">
                      <Form.Control type="email" placeholder="E-mail" />
                    </Form.Group>
                    <Button variant="success">Inscrever-se</Button>
                  </Form>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfileSettings;
