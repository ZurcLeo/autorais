import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebase.config';
import { useAuth } from '../../AuthService';
import PerfilPessoal from './perfilPessoal';
import PerfilAmigo from './perfilAmigo';
import { toast } from 'react-toastify';

const Perfil = () => {
    const { uid } = useParams(); // Pega o uid dos parâmetros da URL
    const { currentUser } = useAuth(); // Informações do usuário atual
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const docRef = doc(db, "usuario", uid); // Ajustar o caminho conforme necessário
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setPerfil(docSnap.data());
                } else {
                    toast("Nenhum documento encontrado.");
                }
            } catch (error) {
                console.error("Error getting document:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [uid]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!perfil) {
        return <div>No profile data</div>;
    }

    // Renderiza PerfilPessoal se o perfil a ser visualizado é do usuário atual, caso contrário, renderiza PerfilAmigo
    return uid === currentUser?.uid ? <PerfilPessoal perfil={perfil} /> : <PerfilAmigo perfil={perfil} />;
};

export default Perfil;
