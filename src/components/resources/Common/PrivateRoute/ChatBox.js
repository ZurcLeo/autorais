import React, { useState, useEffect } from 'react';
import { Form, Button, ListGroup } from 'react-bootstrap';
import { db } from '../../../../firebase.config';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../AuthService'; // Ajuste o caminho conforme necessário

const ChatBox = ({ liveId }) => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (!liveId) return;

        const messagesRef = collection(db, `lives/${liveId}/mensagens`);
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [liveId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser || !liveId) return;

        try {
            await addDoc(collection(db, `lives/${liveId}/mensagens`), {
                userId: currentUser.uid,
                nome: currentUser.displayName,
                foto: currentUser.photoURL,
                mensagem: newMessage,
                timestamp: serverTimestamp()
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="chat-box">
            <ListGroup variant="flush" className="mb-3 chat-messages">
                {messages.map(message => (
                    <ListGroup.Item key={message.id}>
                        <img src={message.foto} alt="User" width="30" height="30" className="me-2" />
                        <strong>{message.nome}</strong>: {message.mensagem}
                    </ListGroup.Item>
                ))}
            </ListGroup>
            <Form onSubmit={handleSendMessage}>
                <Form.Group controlId="newMessage">
                    <Form.Control
                        type="text"
                        placeholder="Digite uma mensagem"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                </Form.Group>
                <Button type="submit" variant="primary" className="mt-2">
                    Enviar
                </Button>
            </Form>
        </div>
    );
};

export default ChatBox;
