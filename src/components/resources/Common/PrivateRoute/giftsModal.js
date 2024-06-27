import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Container, Row } from 'react-bootstrap';
import { db } from '../../../../firebase.config';
import { useAuth } from '../../AuthService';
import { collection, getDocs, doc, getDoc, updateDoc, increment, addDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { TiLinkOutline } from 'react-icons/ti';
import { toast } from 'react-toastify';
import './giftsModal.css';

const GiftsModal = ({ show, handleClose, postId }) => {
    const [gifts, setGifts] = useState([]);
    const [postUserId, setPostUserId] = useState(null);
    const [postUserName, setPostUserName] = useState(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchPostDetails = async () => {
            if (!postId) return;

            const postRef = doc(db, "postagens", postId);
            const postSnap = await getDoc(postRef);

            if (postSnap.exists()) {
                const postData = postSnap.data();
                setPostUserId(postData.usuarioId);
                setPostUserName(postData.usuarioNome);
            }
        };

        fetchPostDetails();
    }, [postId]);

    useEffect(() => {
        const fetchGifts = async () => {
            const storage = getStorage();
            const querySnapshot = await getDocs(collection(db, "presentes"));
            const gifts = await Promise.all(querySnapshot.docs.map(async (doc) => {
                const giftData = doc.data();
                const urlRef = ref(storage, giftData.url);
                const httpUrl = await getDownloadURL(urlRef); // Converte gs:// para http://
                return { id: doc.id, ...giftData, url: httpUrl };
            }));
            setGifts(gifts);
        };

        if (db) {
            fetchGifts();
        }
    }, []);

    const handleSendGift = async (gift) => {
        try {
            // Verifica se o usuário tem ElosCoins suficientes
            const userRef = doc(db, "usuario", currentUser.uid);
            const userSnap = await getDoc(userRef); // Correção: use getDoc para um único documento

            if (userSnap.exists()) {
                const userData = userSnap.data();
                if (userData.saldoElosCoins >= gift.valor) {
                    // Atualiza o saldo de ElosCoins do usuário
                    await updateDoc(userRef, {
                        saldoElosCoins: increment(-gift.valor)
                    });

                    // Registra a compra do presente na subcoleção 'pagamentos' do usuário
                    await addDoc(collection(userRef, "pagamentos"), {
                        tipo: 'envio_presente',
                        valor: gift.valor,
                        data: new Date(),
                        meioPagamento: 'ElosCoins',
                        postId,
                        giftId: gift.id,
                        giftName: gift.nome,
                        receiverId: postUserId,
                        receiverName: postUserName,
                        senderName: currentUser.nome
                    });

                    // Registra o envio do presente na subcoleção 'gifts' na postagem
                    const postRef = doc(db, "postagens", postId);
                    await addDoc(collection(postRef, "gifts"), {
                        giftId: gift.id,
                        nome: gift.nome,
                        sender: currentUser.uid,
                        senderName: currentUser.nome,
                        timestamp: new Date(),
                        url: gift.url,
                        valor: gift.valor
                    });

                    toast.success("Presente enviado com sucesso!");
                    handleClose(); // Fecha o modal após enviar o presente
                } else {
                    toast.error("Saldo insuficiente de ElosCoins.");
                }
            } else {
                toast.error("Usuário não encontrado.");
            }
        } catch (error) {
            console.error("Erro ao enviar o presente:", error);
            toast.error("Erro ao enviar o presente. Tente novamente.");
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Escolha um Presente</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container className='gift-container'>
                    <Row className='gift-row'>
                        {gifts.map(gift => (
                            <Card className='gift-card' key={gift.id} onClick={() => handleSendGift(gift)}>
                                <img src={gift.url} alt={gift.nome} className="gift-foto mr-2" />
                                <Card.Body className='gift-body'>
                                    <Card.Title className='gift-title'>{gift.nome}</Card.Title>
                                    <Card.Text className='gift-value'><TiLinkOutline />{gift.valor} ElosCoins</Card.Text>
                                </Card.Body>
                            </Card>
                        ))}
                    </Row>
                </Container>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-success" onClick={handleClose}>
                    <TiLinkOutline />Comprar Elos
                </Button>
                <Button variant="outline-secondary" onClick={handleClose}>
                    Cancelar Envio
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default GiftsModal;
