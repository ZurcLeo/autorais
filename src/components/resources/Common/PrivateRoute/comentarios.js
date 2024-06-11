import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase.config';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { useUserContext } from '../../userContext';
import { Button, Form, ListGroup, InputGroup, FormControl } from 'react-bootstrap';
import { IoIosSend } from "react-icons/io";

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
                        <img src={comentario.usuarioFoto} alt="Foto do perfil" className="comment-foto mr-2" />
                        <strong>{comentario.usuarioNome}</strong>: {comentario.texto}
                    </ListGroup.Item>
                ))}
            </ListGroup>
            
            <strong style={{ fontSize: '10px' }}>{comentarios.length} comentarios</strong>
            
            {currentUser && (
                <InputGroup>
                    <FormControl
                        type="text"
                        placeholder="Adicione um comentário..."
                        value={novoComentario}
                        onChange={(e) => setNovoComentario(e.target.value)}
                    />
                    <Button variant="warning" onClick={handleAddComentario}>
                        <IoIosSend />
                    </Button>
                </InputGroup>
            )}
        </div>
    );
};

export default Comentarios;
