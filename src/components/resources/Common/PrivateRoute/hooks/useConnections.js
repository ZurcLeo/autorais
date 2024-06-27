// hooks/useConnections.js
import { useState, useEffect } from 'react';
import { doc, getDocs, query, where, updateDoc, collection, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from "../../../AuthService";
import { db } from "../../../../../firebase.config";
import { toast } from "react-toastify";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export const useConnections = () => {
    const { currentUser } = useAuth();
    const [activeConnections, setActiveConnections] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [authorizedStatus, setAuthorizedStatus] = useState({});
    const [status, setStatus] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) return;

        const fetchConnections = async () => {
            try {
                const connectionsRef = collection(db, `conexoes/${currentUser.uid}/ativas`);
                const snapshot = await getDocs(query(connectionsRef, where("status", "!=", "desfeita")));
                const connections = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                console.log("Active connections:", connections);
                setActiveConnections(connections);
            } catch (error) {
                console.error("Erro ao buscar conexões:", error);
            }
        };

        fetchConnections();
        fetchFriendRequests();
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
            const qName = query(usersRef, where("perfilPublico", "==", true), where("nome", ">=", searchTerm), where("nome", "<=", searchTerm + '\uf8ff'));
            const qEmail = query(usersRef, where("perfilPublico", "==", true), where("email", "==", searchTerm));
            const [nameSnapshot, emailSnapshot] = await Promise.all([getDocs(qName), getDocs(qEmail)]);
            
            const nameResults = nameSnapshot.docs.map(doc => ({ user: doc.id, ...doc.data() }));
            const emailResults = emailSnapshot.docs.map(doc => ({ user: doc.id, ...doc.data() }));
            const results = [...nameResults, ...emailResults].filter(user => user.user !== currentUser.uid);
            
            console.log("Search results:", results);
            setSearchResults(results);
        } catch (error) {
            console.error("Erro na busca:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (targetUser) => {
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
                nome: currentUser.displayName || 'Usuário sem nome',
                email: currentUser.email || 'Usuário sem email',
                fotoDoPerfil: currentUser.photoURL || process.env.REACT_APP_PLACE_HOLDER_IMG,
                descricao: currentUser.descricao || 'Gostaria de conectar com você.',
                status: "pendente",
                dataCriacao: serverTimestamp()
            };

            await setDoc(doc(db, `conexoes/${targetUser}/solicitadas/${currentUser.uid}`), novaSolicitacao);
            toast.success("Solicitação enviada com sucesso.");
        } catch (error) {
            console.error("Erro ao enviar solicitação de conexão:", error);
            toast.error("Erro ao enviar solicitação de conexão:", error);
            setError("Erro ao enviar a solicitação.");
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (solicitanteId) => {
        if (!currentUser) {
            console.error("Usuário não autenticado.");
            toast.error("Você precisa estar autenticado para aceitar solicitações.");
            setError("Você precisa estar autenticado para aceitar solicitações.");
            return { success: false, error: "Usuário não autenticado" };
        }

        setLoading(true);
        toast.info("Conectando vocês..."); // Toast indicando o início da conexão
        try {
            const solicitadaRef = doc(db, `conexoes/${currentUser.uid}/solicitadas/${solicitanteId}`);
            await updateDoc(solicitadaRef, {
                status: "aprovada",
                dataDoAceite: serverTimestamp()
            });

            toast.success("Pronto! Vocês agora estão conectados!"); // Toast final de sucesso
            return { success: true }; // Indica sucesso na operação
        } catch (error) {
            console.error("Erro ao aceitar solicitação de conexão:", error);
            toast.error("Erro ao aceitar solicitação de conexão:", error);
            setError("Erro ao aceitar a solicitação.");
            return { success: false, error: error.message }; // Retorna sucesso falso e a mensagem de erro
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptFriendRequest = async (solicitanteId) => {
        setLoading(true);
        setFeedbackMessage("Aceitando pedido de amizade...");

        try {
            const response = await handleAcceptRequest(solicitanteId); // Função que aceita o pedido de amizade
            if (response.success) {
                setFeedbackMessage("Pedido de amizade aceito com sucesso!");
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error("Erro ao aceitar pedido de amizade:", error);
            setFeedbackMessage("Erro ao aceitar pedido de amizade.");
        } finally {
            setLoading(false);
        }
    };

    const handleRejectRequest = async (solicitanteId) => {
        if (!currentUser) {
            console.error("Tentativa de rejeitar solicitação sem estar autenticado.");
            toast.error("Você precisa estar autenticado para realizar esta ação.");
            setError("Você precisa estar autenticado para realizar esta ação.");
            return;
        }

        setLoading(true);
        try {
            const solicitadaRef = doc(db, `conexoes/${currentUser.uid}/solicitadas`, solicitanteId);

            await updateDoc(solicitadaRef, {
                status: "desfeita",
                dataDesfeita: serverTimestamp()
            });

            setStatus('desfeita');
            toast.success("Amizade desfeita com sucesso.");
            setFeedbackMessage("Amizade desfeita.");
        } catch (error) {
            console.error("Erro ao rejeitar solicitação:", error);
            toast.error("Erro ao rejeitar a solicitação.");
            setError("Erro ao rejeitar a solicitação.");
        } finally {
            setLoading(false);
        }
    };

    const handleDesfazerAmizade = async (friendUid) => {
        if (!currentUser) {
            console.error("Tentativa de desfazer amizade sem estar autenticado.");
            setError("Você precisa estar autenticado para realizar esta ação.");
            return;
        }

        setLoading(true);
        try {
            const currentUserConnectionRef = doc(db, `conexoes/${currentUser.uid}/ativas/${friendUid}`);

            await updateDoc(currentUserConnectionRef, {
                status: "desfeita",
                dataDesfeita: serverTimestamp(),
            });

            toast.success("Amizade desfeita com sucesso.");
            setFeedbackMessage("Amizade desfeita com sucesso.");
            setActiveConnections(prevConnections => prevConnections.filter(conn => conn.uid !== friendUid));
            setStatus('desfeita');
        } catch (error) {
            toast.error("Erro ao desfazer amizade.");
            toast.info("Tente novamente em alguns instantes.");
            console.error("Erro ao desfazer amizade:", error);
            setError("Erro ao desfazer a amizade.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessageClick = (uid) => {
        navigate(`/goChat/${uid}`);
    };

    const updateAuthorizationStatus = (friendUid, isAuthorized) => {
        setAuthorizedStatus(prev => ({
            ...prev,
            [friendUid]: isAuthorized
        }));
    };

    const handleSendMessage = (uid) => {
        setSelectedUser(prevUid => prevUid === uid ? null : uid);
    };

    const formatRelativeTime = (timestamp) => {
        const date = timestamp.toDate();
        return formatDistanceToNow(date, {
            addSuffix: true,
            locale: ptBR
        });
    };

    return {
        activeConnections,
        friendRequests,
        searchResults,
        loading,
        error,
        feedbackMessage,
        selectedUser,
        authorizedStatus,
        status,
        fetchFriendRequests,
        handleSearch,
        handleSendRequest,
        handleAcceptFriendRequest,
        handleAcceptRequest,
        handleRejectRequest,
        handleDesfazerAmizade,
        handleSendMessageClick,
        updateAuthorizationStatus,
        handleSendMessage,
        formatRelativeTime
    };
};
