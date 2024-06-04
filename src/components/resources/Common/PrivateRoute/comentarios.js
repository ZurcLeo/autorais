import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase.config';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { useUserContext } from '../../userContext';
import { Button, Form, ListGroup } from 'react-bootstrap';

const Comentarios = ({ postId, isPrivate }) => {
    const { currentUser, friendsIds } = useUserContext();
    const [comentarios, setComentarios] = useState([]);
    const [novoComentario, setNovoComentario] = useState('');

    useEffect(() => {
        const comentariosRef = collection(db, "postagens", postId, "comentarios");
        const unsubscribe = onSnapshot(comentariosRef, (snapshot) => {
            const fetchedComentarios = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setComentarios(fetchedComentarios);
        });

        return () => unsubscribe(); // Desinscrever-se quando o componente for desmontado
    }, [postId]);

    const handleAddComentario = async () => {
        if (!novoComentario.trim()) return;

        const comentarioRef = collection(db, "postagens", postId, "comentarios");
        await addDoc(comentarioRef, {
            usuarioId: currentUser.uid,
            usuarioNome: currentUser.nome,
            usuarioFoto: currentUser.fotoDoPerfil,
            texto: novoComentario,
            timestamp: new Date()
        });

        setNovoComentario('');
    };

    return (
        <div>
            <ListGroup variant="flush">
                {comentarios.map(comentario => (
                    <ListGroup.Item key={comentario.id}>
                        <strong>{comentario.usuarioNome}</strong>: {comentario.texto}
                    </ListGroup.Item>
                ))}
            </ListGroup>
            
            <strong style={{ fontSize: '10px' }}>{comentarios.length} comentarios</strong>
            
            {currentUser && (
                <Form>
                    <Form.Group controlId="novoComentario">
                        <Form.Control
                            type="text"
                            placeholder="Adicione um comentário..."
                            value={novoComentario}
                            onChange={(e) => setNovoComentario(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="primary" onClick={handleAddComentario}>
                        Comentar
                    </Button>
                </Form>
            )}
        </div>
    );
};

export default Comentarios;
