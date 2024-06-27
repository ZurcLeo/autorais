// src/hooks/useImageUpload.js
import { useRef, useState } from "react";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import AvatarEditor from 'react-avatar-editor';
import { toast } from 'react-toastify';
import { useAuth } from "../../../AuthService";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../../../../firebase.config";
import useUserProfile from "./useUserProfile";

const useImageUpload = () => {
    const { currentUser } = useAuth();
    const [userData, setUserData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState(process.env.REACT_APP_PLACE_HOLDER_IMG);
    const [isPhotoSelected, setIsPhotoSelected] = useState(false);
    const avatarEditorRef = useRef(null);
    const { updateProfileData, fetchUserData } = useUserProfile();
   
    const handleImageChange = event => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setProfileImage(reader.result);
                setIsPhotoSelected(true);
                toast.info("Foto de perfil selecionada. Ajuste e clique em 'Upload' para salvar.");
            };
            reader.readAsDataURL(file);
        } else {
            setIsPhotoSelected(false);
            toast.error("Erro ao carregar a imagem.");
        }
    };

    const uploadSelectedImage = async () => {
        if (!avatarEditorRef.current) {
            toast.error("Nenhuma imagem pronta para upload.");
            return;
        }
        setIsLoading(true);
        try {
            const canvas = avatarEditorRef.current.getImageScaledToCanvas();
            canvas.toBlob(async blob => {
                const imageUrl = await uploadImage(blob);
                const updatedData = { ...userData, fotoDoPerfil: imageUrl };
                await updateProfileData(updatedData);
                setIsPhotoSelected(false); // Reset após o upload
                setProfileImage(null); // Limpa a imagem do editor
                toast.success("Foto de perfil atualizada com sucesso.");
            });
        } catch (error) {
            console.error("Erro ao fazer upload da foto:", error);
            toast.error("Erro ao atualizar a foto do perfil.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const uploadImage = async (blob) => {
        const storageRef = ref(getStorage(), `fotoDePerfil/${currentUser.uid}`);
        const uploadTask = uploadBytesResumable(storageRef, blob);
        await uploadTask;
        toast.success("Imagem enviada com sucesso.");
        return getDownloadURL(uploadTask.snapshot.ref);
    };
    
    return {
        profileImage,
        isPhotoSelected,
        avatarEditorRef,
        handleImageChange,
        uploadSelectedImage
    };
};

export default useImageUpload;