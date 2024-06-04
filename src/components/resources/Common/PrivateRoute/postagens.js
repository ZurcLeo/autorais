import React, { useState, useEffect } from 'react';
import { db, storage } from '../../../../firebase.config';
import { useAuth } from '../../AuthService';
import { useUserContext } from '../../userContext';
import { formatDistanceToNow } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { collection, query, orderBy, startAfter, onSnapshot, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button, InputGroup, FormControl, DropdownButton, Dropdown, Card, Row, Col, Container } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroll-component';
import { IoGiftOutline, IoCameraOutline, IoEarthOutline, IoLockClosedOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import './postagens.css';
import Reactions from './reacoes';
import Comentarios from './comentarios';
import GiftsModal from './giftsModal';
import usePostLoader from '../../Common/PrivateRoute/hooks/usePostLoader'; // Um hook customizado para carregar posts

const Postagens = () => {
    const { currentUser } = useAuth();
    const { friendsIds, bestFriendsIds } = useUserContext([]);
    const { setFriendsIds, setBestFriendsIds, userReactions, setUserReactions } = useUserContext(useUserContext);
    const [file, setFile] = useState(null);
    const [postText, setPostText] = useState('');
    const [visibility, setVisibility] = useState('publico');
    const [showGiftsModal, setShowGiftsModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null); // Atualizado para armazenar o post selecionado
    const { posts, hasMore, loadMorePosts } = usePostLoader(currentUser);

    const handleFileChange = (e) => setFile(e.target.files[0]);
    const handleVisibilityChange = (vis) => setVisibility(vis);

    const handleUploadAndPost = async () => {
        if (!file || !postText) {
            toast.error("Por favor, adicione texto e uma imagem/vídeo.");
            return;
        }

        const fileType = file.type.split('/')[0]; // 'image' or 'video'
        const storagePath = `media/${currentUser.uid}/${visibility}/${file.name}`;
        const fileRef = ref(storage, storagePath);
        try {
            await uploadBytes(fileRef, file);
            const fileUrl = await getDownloadURL(fileRef);
            const postRef = await addDoc(collection(db, "postagens"), {
                usuarioId: currentUser.uid,
                usuarioNome: currentUser.nome,
                usuarioFoto: currentUser.fotoDoPerfil,
                timestamp: new Date(),
                conteudo: postText,
                mediaUrl: fileUrl,
                tipoMedia: fileType,
                visibilidade: visibility,
            });
            toast.success('Postagem criada com sucesso!');
        } catch (error) {
            console.error('Erro ao enviar arquivo e criar postagem:', error);
            toast.error('Erro ao postar!');
        } finally {
            setFile(null);
            setPostText('');
        }
    };

    return (
        <Container style={{ marginTop: '20px', marginBottom: '20px' }} className='postagem-container'>
            <Card className="postagem-card">
                <Card.Header className="postagem-header">Postagens</Card.Header>
                <Card.Body className="postagem-body">
                    <InputGroup>
                        <FormControl
                            as="textarea"
                            placeholder="O que você está pensando?"
                            value={postText}
                            onChange={(e) => setPostText(e.target.value)}
                        />
                        <DropdownButton
                            as={InputGroup.Prepend}
                            variant="outline-secondary"
                            title={visibility.charAt(0).toUpperCase() + visibility.slice(1)}
                            id="input-group-dropdown-1"
                        >
                            <Dropdown.Item onClick={() => handleVisibilityChange('publico')}><IoEarthOutline /> Público</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleVisibilityChange('Privado')}><IoLockClosedOutline /> Privado</Dropdown.Item>
                        </DropdownButton>
                        <Button variant="outline-secondary" onClick={() => document.getElementById('file-input').click()}>
                            <IoCameraOutline /> {/* Ícone de câmera */}
                        </Button>
                        <Button variant='outline-success' style={{ borderTopRightRadius: 20, borderBottomRightRadius: 20 }} onClick={handleUploadAndPost} disabled={!file || !postText}>
                            Postar
                        </Button>
                        <FormControl
                            id="file-input"
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*,video/*"
                            style={{ display: 'none' }}
                        />
                    </InputGroup>
                    <hr />
                    <div>
                        <Card className='postagem-card'>
                            <Card.Header>Feed</Card.Header>
                            <Card.Body>
                                <InfiniteScroll
                                    dataLength={posts.length}
                                    next={loadMorePosts}
                                    hasMore={hasMore}
                                    loader={<h4>Loading...</h4>}
                                    endMessage={
                                        <p style={{ textAlign: 'center' }}>
                                            <b>Você não tem mais postagens.</b>
                                        </p>
                                    }
                                >
                                    {posts.map(post => (
                                        <Card key={post.id} className="mb-4">
                                            <Card.Header className="d-flex align-items-center">
                                                <img src={post.usuarioFoto} alt="Foto do perfil" className="post-foto mr-2" />
                                                <div>
                                                    <strong>{post.usuarioNome}</strong>
                                                    <div>
                                                        <small>
                                                            {post.timestamp?.toDate && formatDistanceToNow(post.timestamp.toDate(), { addSuffix: true, locale: ptBR })}
                                                        </small>
                                                        <div>
                                                            {post.visibilidade === 'publico' ? <IoEarthOutline /> : <IoLockClosedOutline />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card.Header>
                                            <Card.Body>
                                                <p>{post.conteudo}</p>
                                                {post.mediaUrl && <img className='thumbnail' src={post.mediaUrl} alt="Post media" />}
                                            </Card.Body>
                                            <Card.Footer>
                                                <Row className="mt-1">
                                                    <Col>
                                                        <Reactions className="reaction-buttons" post={post} />
                                                    </Col>
                                                    <Col>
                                                        <Button className='reaction-button' variant="outline-secondary">
                                                            <Comentarios key={post.id} postId={post.id} isPrivate={post.visibilidade === 'Privado'} />
                                                        </Button>
                                                    </Col>
                                                    <Col>
                                                        <Button
                                                            className='reaction-button'
                                                            variant="outline-success"
                                                            onClick={() => { setSelectedPost(post); setShowGiftsModal(true); }}
                                                        >
                                                            <IoGiftOutline />
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </Card.Footer>
                                        </Card>
                                    ))}
                                </InfiniteScroll>
                            </Card.Body>
                        </Card>
                    </div>
                </Card.Body>
            </Card>
            {selectedPost && (
                <GiftsModal
                    show={showGiftsModal}
                    handleClose={() => setShowGiftsModal(false)}
                    postId={selectedPost.id}
                    usuarioId={selectedPost.usuarioId}
                    usuarioNome={selectedPost.usuarioNome}
                />
            )}
        </Container>
    );
};

export default Postagens;
