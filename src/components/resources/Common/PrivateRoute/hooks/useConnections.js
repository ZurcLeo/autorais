// hooks/useConnections.js
import { useState, useEffect, useRef } from 'react';
import { doc, serverTimestamp, collection, where, getDocs, query, updateDoc } from 'firebase/firestore';
import { useAuth } from "../../../AuthService";
import { db } from "../../../../../firebase.config";
import { toast } from "react-toastify";

export const useConnections = () => {
    const { currentUser } = useAuth();
    const [activeConnections, setActiveConnections] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!currentUser) return;

        const fetchConnections = async () => {
            try {
                const connectionsRef = collection(db, `conexoes/${currentUser.uid}/ativas`);
                const snapshot = await getDocs(query(connectionsRef, where("status", "!=", "desfeita")));
                const connections = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                console.log("Active connections:", connections); // Adicione este log
                setActiveConnections(connections);
            } catch (error) {
                console.error("Erro ao buscar conexões:", error);
            }
        };

        fetchConnections();
    }, [currentUser]);

    const fetchFriendRequests = async () => {
        if (!currentUser) return;

        try {
            const friendRequestsRef = collection(db, `conexoes/${currentUser.uid}/solicitadas`);
            const q = query(friendRequestsRef, where("status", "==", "pendente"));
            const snapshot = await getDocs(q);
            const requests = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setFriendRequests(requests);
        } catch (error) {
            console.error("Erro ao buscar solicitações de amizade:", error);
        }
    };

    const handleSearch = async (searchTerm) => {
        if (!searchTerm.trim()) {
            toast.error("Digite um termo de busca.");
            return;
        }
        setLoading(true);
        try {
            const usersRef = collection(db, "usuario");
            const q = query(usersRef, where("perfilPublico", "==", true), where("nome", ">=", searchTerm), where("nome", "<=", searchTerm + '\uf8ff'));
            const querySnapshot = await getDocs(q);
            const results = querySnapshot.docs.map(doc => ({
                user: doc.id,
                ...doc.data()
            })).filter(user => user.user !== currentUser.uid);
            console.log("Search results:", results); // Adicione este log
            setSearchResults(results);
        } catch (error) {
            console.error("Erro na busca:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (targetuser) => {
        if (!currentUser) {
            console.error("Tentativa de enviar solicitação sem estar autenticado.");
            toast.error("Você precisa estar autenticado para enviar solicitações.");
            setError("Você precisa estar autenticado para enviar solicitações.");
            return;
        }

        try {
            setLoading(true);
            const novaSolicitacao = {
                uid: currentUser.uid,
                nome: currentUser.nome || 'Usuário sem nome',
                email: currentUser.email || 'Usuário sem email',
                fotoDoPerfil: currentUser.fotoDoPerfil || process.env.REACT_APP_PLACE_HOLDER_IMG,
                descricao: currentUser.descricao || 'Gostaria de conectar com você.'
            };

            await updateDoc(doc(db, `conexoes/${targetuser}/solicitadas/${currentUser.uid}`), novaSolicitacao);
            toast.success("Solicitação enviada com sucesso.");
        } catch (error) {
            console.error("Erro ao enviar solicitação de conexão:", error);
            toast.error("Erro ao enviar solicitação de conexão:", error);
            setError("Erro ao enviar a solicitação.");
        } finally {
            setLoading(false);
        }
    };

    return {
        activeConnections,
        friendRequests,
        searchResults,
        loading,
        error,
        fetchFriendRequests,
        handleSearch,
        handleSendRequest
    };
};