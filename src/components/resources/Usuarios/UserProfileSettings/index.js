import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Image, Badge, Form } from 'react-bootstrap';
// import AccountDeletion from '../DeleteAccount/DeleteAccountConfirm';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../../../firebase.config';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";

const UserProfileSettings = () => {
    const [user, loading, error] = useAuthState(auth);
    const [userMetadata, setUserMetadata] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState(null);

    // Ajuste: Definindo fetchUserMetadata fora do useEffect para acesso global no componente
    const fetchUserMetadata = async () => {
        if (user) {
            const userRef = doc(db, 'usuario', user.uid);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                setUserMetadata(docSnap.data());
            } else {
                console.log("No such document!");
            }
        }
    };

    useEffect(() => {
        fetchUserMetadata(); // Chama fetchUserMetadata quando o componente é montado ou o usuário é atualizado.
    }, [user]);

    const handleImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setProfileImage(event.target.files[0]);
        }
    };

    const handleEditSubmit = async (event) => {
        event.preventDefault();
        if (!user) return;

        const formData = new FormData(event.currentTarget);
        const updatedData = Object.fromEntries(formData.entries());

        if (profileImage) {
            const storage = getStorage();
            const imageRef = ref(storage, `profileImages/${user.uid}`);
            await uploadBytes(imageRef, profileImage);
            const imageUrl = await getDownloadURL(imageRef);
            updatedData.profileImage = imageUrl; // Atenção ao nome da chave, ajuste conforme necessário
        }

        await updateDoc(doc(db, "usuarios", user.uid), {
            ...updatedData,
            updatedAt: serverTimestamp(),
        });

        if (profileImage) {
            setProfileImage(null);
        }

        await fetchUserMetadata(); // Chama fetchUserMetadata para atualizar os metadados do usuário após a submissão
        setIsEditing(false);
    };

    const toggleEdit = () => setIsEditing(!isEditing);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!user) return <div>Usuário não autenticado</div>;

    return (
        // JSX permanece inalterado
        <Container className="mt-5">
        <Card>
            <Card.Header>Configurações do Perfil</Card.Header>
            <Card.Body>
                {isEditing ? (
                    <Form onSubmit={handleEditSubmit}>
                        <Form.Group controlId="formFile" className="mb-3">
                            <Form.Label>Foto do Perfil</Form.Label>
                            <Form.Control type="file" onChange={handleImageChange} />
                        </Form.Group>
                        {/* Outros campos de formulário conforme necessário */}
                        <Button variant="primary" type="submit">Salvar Alterações</Button>
                        <Button variant="secondary" onClick={toggleEdit} style={{ marginLeft: '10px' }}>Cancelar</Button>
                    </Form>
                ) : (
                    <>
                        <Image src={userMetadata?.profileImage || 'placeholderProfileImage.png'} alt="Foto de perfil" roundedCircle style={{ width: '100px', height: '100px' }} />
                        <Card.Title>{user.displayName}</Card.Title>
                        <Card.Text>{user.email}</Card.Text>
                        {/* Renderização de informações adicionais do usuário */}
                        <Button variant="info" onClick={toggleEdit}>Editar Perfil</Button>
                        {/* <AccountDeletion /> */}
                    </>
                )}
            </Card.Body>
        </Card>
    </Container>
    );
};

export default UserProfileSettings;
