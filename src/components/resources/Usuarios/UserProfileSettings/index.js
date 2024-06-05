import React from 'react';
import { Container, Row, Col, Card, CardBody, Badge, Button } from 'react-bootstrap';

const UserProfileSettings = () => {
  return (
    <Container>
      <Row>
        <Col sm={12}>
          <Card>
            <CardBody>
              <h2>Configurações do Perfil</h2>

              <Row>
                <Col sm={6}>
                  <h4>Informações do Usuário</h4>
                  <p>Nome: Leonardo Cruz</p>
                  <p>E-mail: leolest@gmail.com</p>
                  <p>ID: 24612673</p>
                </Col>
                <Col sm={6}>
                  <h4>Configurações de Armazenamento</h4>
                  <Badge variant="danger">
                    <p>Usado: 0%</p>
                  </Badge>
                  <p>Total: 500 MB</p>
                  <Button variant="light">Mostrar detalhes</Button>
                </Col>
              </Row>

              <Row>
                <Col sm={6}>
                  <h4>Configurações de Senha</h4>
                  <Button variant="primary">Configurar senha</Button>
                </Col>
                <Col sm={6}>
                  <h4>Configurações de Conta</h4>
                  <Button variant="danger">Excluir conta</Button>
                </Col>
              </Row>

              <Row>
                <Col sm={12}>
                  <h4>Newsletter</h4>
                  <form>
                    <input type="text" placeholder="Nome" />
                    <input type="email" placeholder="E-mail" />
                    <Button variant="success">Inscrever-se</Button>
                  </form>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfileSettings;
