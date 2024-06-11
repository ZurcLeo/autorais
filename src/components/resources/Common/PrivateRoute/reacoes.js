import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase.config';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useUserContext } from '../../userContext';
import { Button } from 'react-bootstrap';
import { IoHeartOutline, IoHappyOutline, IoSadSharp, IoSadOutline, IoThumbsDown, IoHappy, IoHeartSharp, IoThumbsUpOutline, IoThumbsUp } from 'react-icons/io5';

const Reactions = ({ post }) => {
    const { currentUser } = useUserContext();
    const [activeReactions, setActiveReactions] = useState({});
    const [reactionCounts, setReactionCounts] = useState({
        like: 0,
        love: 0,
        haha: 0,
        sad: 0,
        dislike: 0
    });

    useEffect(() => {
        const reactionsRef = collection(db, `postagens/${post.id}/reacoes`);
        
        // Listen for real-time updates to reactions
        const unsubscribe = onSnapshot(reactionsRef, (snapshot) => {
            const counts = {
                like: 0,
                love: 0,
                haha: 0,
                sad: 0,
                dislike: 0
            };
            const userReactions = {};

            snapshot.forEach(doc => {
                const data = doc.data();
                counts[data.tipoDeReacao]++;
                if (data.docId === currentUser.uid) {
                    userReactions[data.tipoDeReacao] = true;
                }
            });

            setReactionCounts(counts);
            setActiveReactions(userReactions);
        });

        return () => unsubscribe();
    }, [post.id, currentUser.uid]);

    const handleReaction = async (reactionType) => {
        const reactionsRef = collection(db, `postagens/${post.id}/reacoes`);
        const userReactionDoc = doc(reactionsRef, currentUser.uid);

        if (activeReactions[reactionType]) {
            // If the same reaction is clicked again, remove it
            await deleteDoc(userReactionDoc);
        } else {
            // Otherwise, set the new reaction, overwriting any existing reaction
            await setDoc(userReactionDoc, {
                docId: currentUser.uid,
                timestamp: new Date(),
                tipoDeReacao: reactionType,
                senderName: currentUser.nome,
                senderFoto: currentUser.fotoDoPerfil
            });
        }
    };

    return (
        <div className="reactions-container">
            {['like', 'love', 'haha', 'sad', 'dislike'].map(type => (
                <div
                    key={type}
                    className="reaction-button"
                    variant={activeReactions[type] ? 'warning' : 'outline-warning'}
                    onClick={() => handleReaction(type)}
                >
                    {activeReactions[type] ? (
                        { 'like': <IoThumbsUp />, 'love': <IoHeartSharp />, 'haha': <IoHappy />, 'sad': <IoSadSharp />, 'dislike': <IoThumbsDown /> }[type]
                    ) : (
                        { 'like': <IoThumbsUpOutline />, 'love': <IoHeartOutline />, 'haha': <IoHappyOutline />, 'sad': <IoSadOutline />, 'dislike': <IoThumbsDown /> }[type]
                    )}
                    <span className="reaction-count">{reactionCounts[type]}</span>
                </div>
            ))}
        </div>
    );
};

export default Reactions;
