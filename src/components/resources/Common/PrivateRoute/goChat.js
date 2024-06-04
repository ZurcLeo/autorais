import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { ListGroup, Tab, Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from "../../AuthService";
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from "../../../../firebase.config";
import FormularioDeMensagem from '../../chats';
import '../../chats.css';

const placeHolderFoto = process.env.REACT_APP_PLACE_HOLDER_IMG

const GoChat = () => {
  const { connectionId } = useParams();
  const { currentUser } = useAuth();
  const [activeConnections, setActiveConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});



  useEffect(() => {
    if (currentUser) {
      // Certifique-se de que o caminho para a coleção esteja correto
      const connectionsRef = collection(db, `conexoes/${currentUser.uid}/ativas`);
      // Ajuste a condição de consulta conforme necessário
      const q = query(connectionsRef, where("status", "==", "aceita"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const connections = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setActiveConnections(connections);
      });
      return () => unsubscribe();
    }
  }, [currentUser, connectionId]);

  useEffect(() => {
    if (currentUser) {
      // Obtém a referência ao documento do usuário
      const userDocRef = doc(db, `usuario/${currentUser.uid}`);
      // Escuta mudanças no documento do usuário
      const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          // Assume que conversasComMensagensNaoLidas é uma array de IDs de conversas
          const unreadConversations = data.conversasComMensagensNaoLidas || [];
          // Cria um objeto para mapear o estado de não leitura por ID de conexão
          let newUnreadMessages = {};
          (data.amigos || []).forEach(friendId => {
            // Verifica se o ID da conversa para cada amigo está na lista de não lidos
            newUnreadMessages[friendId] = unreadConversations.includes(`${currentUser.uid}_${friendId}`) || unreadConversations.includes(`${friendId}_${currentUser.uid}`);
          });
          setUnreadMessages(newUnreadMessages);
        }
      });
  
      return () => unsubscribe();
    }
  }, [currentUser]);
  

  useEffect(() => {
    if (connectionId) {
        setSelectedConnection(connectionId); // Defina a conexão selecionada com base no parâmetro
    }
}, [connectionId]);

  const handleSelectConnection = (connection) => {
    setSelectedConnection(connection);
  };

  return (
    <div>
      <Container style={{ marginTop: '20px' }}>
        <Card>
            <Card.Header>Conversas</Card.Header>
      <Row  style={{
        padding: '20px'}}>
        <Col xs={12}>
          <Tab.Container id="chat-tabs" defaultActiveKey="#goChat">
            <Row>
            <Col sm={3} md={5} className="mb-3">
            <Card>
            <Card.Header>Contatos</Card.Header>
  <ListGroup style={{
        padding: '20px'}}>
    {activeConnections.map(connection => (
      <ListGroup.Item
        key={connection.id}
        action
        href={`#${connection.id}`}
        onClick={() => setSelectedConnectionId(connection.id)}
        className={unreadMessages[connection.id] ? "has-unread-messages" : ""}
      >
        <div className="d-flex align-items-center">
          <img
            src={connection.fotoDoPerfil || placeHolderFoto}
            alt={connection.nome}
            className="rounded-circle me-2"
            style={{ width: '30px', height: '30px' }}
          />
          <div>
            <div>{connection.nome}</div>
            {unreadMessages[connection.id] && (
            <div className="unread-indicator"></div>
          )}
          </div>
        </div>
      </ListGroup.Item>
    ))}
  </ListGroup>
  </Card>
</Col>
              <Col sm={9} md={7}>
                <Tab.Content>
                  {activeConnections.length > 0 ? (
                    activeConnections.map(connection => (
                      <Tab.Pane eventKey={`#${connection.id}`} key={connection.id}>
                        <FormularioDeMensagem
                          uidRemetente={currentUser.uid}
                          uidDestinatario={connection.id}
                          shouldDisplay={selectedConnectionId === connection.id}
                        />
                      </Tab.Pane>
                    ))
                  ) : (
                    <p>Nenhuma conversa selecionada</p>
                  )}
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </Col>
      </Row>
      </Card>
    </Container>
    </div>
  );
};

export default GoChat;
