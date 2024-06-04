import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase.config';
import { collection, query, where, getDocs, addDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { useUserContext } from '../../userContext';
import { Button } from 'react-bootstrap';
import { IoHeartOutline, IoHappyOutline, IoSadSharp, IoSadOutline, IoThumbsDown, IoHappy, IoHeartSharp, IoThumbsUpOutline, IoThumbsUp } from 'react-icons/io5';

const Reactions = ({ post }) => {
    const { currentUser } = useUserContext();
    const [activeReactions, setActiveReactions] = useState({});

    useEffect(() => {
        const fetchReactions = async () => {
            const reactionsRef = collection(db, `postagens/${post.id}/reacoes`);
            const q = query(reactionsRef, where("docId", "==", currentUser.uid));
            const reactionDocs = await getDocs(q);
            const reactions = {};
            reactionDocs.forEach(doc => {
                reactions[doc.data().tipoDeReacao] = true;
            });
            setActiveReactions(reactions);
        };

        if (currentUser && post.id) {
            fetchReactions();
        }
    }, [post.id, currentUser]);

    const handleReaction = async (reactionType) => {
        const reactionsRef = collection(db, `postagens/${post.id}/reacoes`);
        const q = query(reactionsRef, where("docId", "==", currentUser.uid));
        
        // Buscar todas as reações do usuário para esta postagem
        const snapshot = await getDocs(q);
    
        // Deletar todas as reações existentes antes de adicionar uma nova
        const batch = writeBatch(db); // Supondo que você possa usar batch
        snapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    
        // Adicionar nova reação apenas se ela não é a mesma que estava ativa
        if (!activeReactions[reactionType]) {
            await addDoc(reactionsRef, {
                docId: currentUser.uid,
                timestamp: new Date(),
                tipoDeReacao: reactionType,
                senderName: currentUser.nome,
                senderFoto: currentUser.fotoDoPerfil
            });
            setActiveReactions({ [reactionType]: true });
        } else {
            // Se clicar na mesma reação que estava ativa, desativa todas as reações
            setActiveReactions({});
        }
    };
    

    return (
        <div>
            {['like', 'love', 'haha', 'sad', 'dislike'].map(type => (
                <Button
                    key={type}
                    style={{ border: 'none' }}
                    variant={activeReactions[type] ? 'primary' : 'secondary'}
                    onClick={() => handleReaction(type)}
                >
                    {activeReactions[type] ? (
                        { 'like': <IoThumbsUp />, 'love': <IoHeartSharp />, 'haha': <IoHappy />, 'sad': <IoSadSharp />, 'dislike': <IoThumbsDown /> }[type]
                    ) : (
                        { 'like': <IoThumbsUpOutline />, 'love': <IoHeartOutline />, 'haha': <IoHappyOutline />, 'sad': <IoSadOutline />, 'dislike': <IoThumbsDown /> }[type]
                    )}
                </Button>
            ))}
        </div>
    );
};

export default Reactions;
