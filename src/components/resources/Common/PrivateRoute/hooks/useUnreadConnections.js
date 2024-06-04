import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../../AuthService'; // Caminho fictício, substitua pelo correto
import { db } from '../../../../../firebase.config'; // Configuração do seu Firestore

const useUnreadConnections = () => {
    const { currentUser } = useAuth();
    const [state, setState] = useState({
        newRequests: 0,
        acceptedRequests: 0,
        dissolvedConnections: 0
    });

    useEffect(() => {
        if (!currentUser) return;

        const unsubscribes = [];

        // Ouvir novas solicitações de amizade
        const newRequestsRef = collection(db, `conexoes/${currentUser.uid}/solicitadas`);
        const newReqQuery = query(newRequestsRef, where("status", "==", "pendente"));
        const unsubscribeNewRequests = onSnapshot(newReqQuery, (snapshot) => {
            setState(prev => ({ ...prev, newRequests: snapshot.size }));
        });
        unsubscribes.push(unsubscribeNewRequests);

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [currentUser]);

    return state;
};

export default useUnreadConnections;
