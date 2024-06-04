import React, { useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import FormularioDeMensagem from '../../chats';
import { Auth } from 'firebase/auth';

const ConnectionItem = ({ connection }) => {
  const [showChat, setShowChat] = useState(false);
const user = Auth.auth().currentUser;

  const toggleChat = () => setShowChat(!showChat);

  return (
    <div>
      <Card>
        {/* Informações da conexão */}
        <Card.Body>
          <Card.Title>{connection.nome}</Card.Title>
          <Button variant="primary" onClick={toggleChat}>👋 Enviar Mensagem</Button>
        </Card.Body>
      </Card>
      {showChat && <FormularioDeMensagem uidRemetente={user} uidDestinatario={connection.uid} />}
    </div>
  );
};

export default ConnectionItem;
