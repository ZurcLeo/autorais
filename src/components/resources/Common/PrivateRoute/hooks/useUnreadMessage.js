import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../../firebase.config';
import { useAuth } from '../../../AuthService';

const useUnreadMessage = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            // Suponha que 'usuario' é uma coleção e cada documento é um usuário identificado pelo seu uid
            const userDocRef = doc(db, `usuario/${currentUser.uid}`);
            
            // Inscreve-se para ouvir mudanças no documento do usuário
            const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    // Suponha que 'conversasComMensagensNaoLidas' é um array contendo IDs de conversas com mensagens não lidas
                    const unreadConversations = data.conversasComMensagensNaoLidas || [];
                    // Atualiza o contador de mensagens não lidas
                    setUnreadCount(unreadConversations.length);
                } else {
                    // Caso não exista o documento ou não haja dados
                    setUnreadCount(0);
                }
            }, (error) => {
                // Trata possíveis erros de subscrição
                console.error("Falha ao se inscrever nas atualizações de mensagens não lidas:", error);
                setUnreadCount(0);
            });

            // Limpa a inscrição quando o componente é desmontado
            return () => unsubscribe();
        }
    }, [currentUser]);

    return unreadCount;
};

export default useUnreadMessage;
