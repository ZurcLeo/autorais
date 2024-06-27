// src/hooks/useUserProfile.js
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../../../../../firebase.config';
import { useAuth } from '../../../AuthService';
import { toast } from 'react-toastify';

const useUserProfile = () => {
    const { currentUser } = useAuth();
    const [userData, setUserData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchUserData(currentUser.uid);
        } else {
            setIsLoading(false);
        }
    }, [currentUser]);

    const fetchUserData = async (uid) => {
        const userDocRef = doc(db, `usuario/${uid}`);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            let userDataFetched = docSnap.data();
            if (!userDataFetched.fotoDoPerfil || userDataFetched.fotoDoPerfil === process.env.REACT_APP_PLACE_HOLDER_IMG) {
                userDataFetched.fotoDoPerfil = process.env.REACT_APP_PLACE_HOLDER_IMG;
            }
            setUserData(userDataFetched);
        } else {
            toast.error("Dados do usuário não encontrados.");
        }
        setIsLoading(false);
    };

    const updateProfileData = async (data) => {
        const userDocRef = doc(db, `usuario/${currentUser.uid}`);
        await updateDoc(userDocRef, data);
        setUserData(data);
        setIsEditing(false);
        toast.success("Perfil atualizado com sucesso.");
    };

    return {
        currentUser,
        userData,
        isLoading,
        isEditing,
        setIsEditing,
        setUserData,
        updateProfileData,
    };
};

export default useUserProfile;