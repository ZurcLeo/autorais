import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../../../../../firebase.config'; // Certifique-se de que o caminho está correto
import { collection, getDocs, doc, setDoc, arrayUnion, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../../AuthService'; // Ajuste o caminho conforme necessário

const PhotosContext = createContext();

export const usePhotos = () => useContext(PhotosContext);

export const PhotosProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [fotosPublicas, setFotosPublicas] = useState([]);
    const [fotosPrivadas, setFotosPrivadas] = useState([]);
    const [loading, setLoading] = useState(false);

    // Função para carregar as fotos
    useEffect(() => {
        if (currentUser && currentUser.uid) {
            const fetchFotos = async () => {
                setLoading(true);
                try {
                    const fotosPublicasSnapshot = await getDocs(collection(db, `media/${currentUser.uid}/publico`));
                    const publicas = fotosPublicasSnapshot.docs.map(doc => doc.data().fotos).flat();
                    setFotosPublicas(publicas);

                    const fotosPrivadasSnapshot = await getDocs(collection(db, `media/${currentUser.uid}/privado`));
                    const privadas = fotosPrivadasSnapshot.docs.map(doc => doc.data().fotos).flat();
                    setFotosPrivadas(privadas);
                } catch (error) {
                    console.error("Erro ao buscar fotos:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchFotos();
        }
    }, [currentUser?.uid]);

    // Função para adicionar foto
    const addFoto = async (foto, isPrivate) => {
        if (!currentUser || !currentUser.uid) return;
        
        const folderPath = `media/${currentUser.uid}/${isPrivate ? 'privado' : 'publico'}`;
        const newDocRef = doc(collection(db, folderPath));

        try {
            await setDoc(newDocRef, {
                fotos: arrayUnion(foto)
            });
            if (isPrivate) {
                setFotosPrivadas(prev => [...prev, foto]);
            } else {
                setFotosPublicas(prev => [...prev, foto]);
            }
        } catch (error) {
            console.error("Erro ao adicionar foto:", error);
        }
    };

    const value = {
        fotosPublicas,
        fotosPrivadas,
        addFoto,
        loading
    };

    return (
        <PhotosContext.Provider value={value}>
            {!loading && children}
        </PhotosContext.Provider>
    );
};
