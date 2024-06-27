import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Grid, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Badge } from '@mui/material';
import { useAuth } from '../../AuthService';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../../../firebase.config';
import FormularioDeMensagem from '../../chats';
import '../../chats.css';

const placeHolderFoto = process.env.REACT_APP_PLACE_HOLDER_IMG;

const GoChat = () => {
  const { connectionId } = useParams();
  const { currentUser } = useAuth();
  const [activeConnections, setActiveConnections] = useState([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});

  useEffect(() => {
    if (currentUser) {
      const connectionsRef = collection(db, `conexoes/${currentUser.uid}/ativas`);
      const q = query(connectionsRef, where('status', '==', 'aceita'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const connections = snapshot.docs.map((doc) => ({
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
      const userDocRef = doc(db, `usuario/${currentUser.uid}`);
      const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const unreadConversations = data.conversasComMensagensNaoLidas || [];
          let newUnreadMessages = {};
          (data.amigos || []).forEach((friendId) => {
            newUnreadMessages[friendId] =
              unreadConversations.includes(`${currentUser.uid}_${friendId}`) ||
              unreadConversations.includes(`${friendId}_${currentUser.uid}`);
          });
          setUnreadMessages(newUnreadMessages);
        }
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  useEffect(() => {
    if (connectionId) {
      setSelectedConnectionId(connectionId);
    }
  }, [connectionId]);

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h2">
          Conversas
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={5}>
          <Box sx={{ p: 2, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
              Contatos
            </Typography>
            <List>
              {activeConnections.map((connection) => (
                <ListItem
                  key={connection.id}
                  button
                  onClick={() => setSelectedConnectionId(connection.id)}
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      color="primary"
                      variant="dot"
                      invisible={!unreadMessages[connection.id]}
                    >
                      <Avatar
                        src={connection.fotoDoPerfil || placeHolderFoto}
                        alt={connection.nome}
                      />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText primary={connection.nome} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Grid>
        <Grid item xs={12} sm={7}>
          <Box sx={{ p: 2, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
            {activeConnections.length > 0 ? (
              activeConnections.map((connection) => (
                <Box
                  key={connection.id}
                  sx={{
                    display: selectedConnectionId === connection.id ? 'block' : 'none',
                  }}
                >
                  <FormularioDeMensagem
                    uidRemetente={currentUser.uid}
                    uidDestinatario={connection.id}
                    shouldDisplay={selectedConnectionId === connection.id}
                  />
                </Box>
              ))
            ) : (
              <Typography>Nenhuma conversa selecionada</Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default GoChat;
