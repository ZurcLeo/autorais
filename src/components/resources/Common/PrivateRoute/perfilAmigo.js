import React, { useEffect, useState } from 'react';
import { Card, Image, Row, Col, Button, Container, Badge, Spinner, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { db } from '../../../../firebase.config';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../AuthService';
import { useConnections } from './hooks/useConnections';
import Authorization from './authorization';
import { FaUserFriends, FaEnvelope, FaBirthdayCake, FaRegUserCircle, FaCheckCircle, FaTimesCircle, FaLock, FaUnlock } from 'react-icons/fa';

const PerfilAmigo = () => {
    const { uid } = useParams();
    const { currentUser } = useAuth();
    const { handleAuthorizeFriend, handleDeauthorizeFriend, handleSendRequest, handleDesfazerAmizade } = useConnections();
    const [perfil, setPerfil] = useState(null);
    const [fotosPublicas, setFotosPublicas] = useState([]);
    const [fotosPrivadas, setFotosPrivadas] = useState([]);
    const [ancestralidade, setAncestralidade] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPerfil = async () => {
            setIsLoading(true);
            try {
                const perfilRef = doc(db, 'usuario', uid);
                const perfilSnap = await getDoc(perfilRef);
                if (perfilSnap.exists()) {
                    const perfilData = perfilSnap.data();
                    setPerfil(perfilData);
                    setFotosPublicas(perfilData.fotosPublicas || []);
                    if (perfilData.amigosAutorizados?.includes(currentUser.uid)) {
                        setFotosPrivadas(perfilData.fotosPrivadas || []);
                    }
                } else {
                    setError('Perfil não encontrado.');
                }
            } catch (err) {
                setError('Erro ao buscar informações do perfil.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchAncestralidade = async () => {
            setIsLoading(true);
            try {
                const ancestralidadeRef = collection(db, `usuario/${uid}/ancestralidade`);
                const ancestralidadeSnap = await getDocs(ancestralidadeRef);
                const ancestralidadeData = ancestralidadeSnap.docs.map(doc => doc.data());
                setAncestralidade(ancestralidadeData);
            } catch (err) {
                console.error('Erro ao buscar informações de ancestralidade:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (uid) {
            fetchPerfil();
            fetchAncestralidade();
        }
    }, [uid, currentUser]);

    if (isLoading) return <div className="text-center my-4"><Spinner animation="border" role="status"><span className="visually-hidden">Carregando...</span></Spinner></div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!perfil) return <div className="alert alert-warning">Perfil não encontrado.</div>;

    const isFriend = perfil.amigosAutorizados?.includes(currentUser.uid) || perfil.amigos?.includes(currentUser.uid);
    const isPendingRequest = perfil.solicitacoesPendentes?.includes(currentUser.uid);

    return (
        <Container>
            <Card className='main-card mb-4'>
                <Card.Body className="text-center">
                    <Card.Text className="text-center">Perfil de {perfil.nome}</Card.Text>

                    <Row className="justify-content-center mb-4">
                        <Col md={6}>
                            <Image className='img-fluid' src={perfil.fotoDoPerfil || process.env.REACT_APP_PLACE_HOLDER_IMG} alt="Foto do Perfil" />
                        </Col>
                    </Row>
                    <Card className="sub-card">
                        <Card.Text><FaEnvelope /> {perfil.email}</Card.Text>
                        <Card.Text><FaBirthdayCake /> {perfil.idade ? `${perfil.idade} anos` : <Badge bg='secondary'>Usuário ainda não registrou sua idade</Badge>}</Card.Text>
                        <Card.Text><FaRegUserCircle /> {perfil.descricao || <Badge bg='secondary'>Usuário ainda não registrou sua bio</Badge>}</Card.Text>
                        <Card.Text><FaUserFriends /> {perfil.amigos?.length ? `${perfil.amigos.length} amigos` : <Badge bg='secondary'>Usuário ainda não possui amigos</Badge>}</Card.Text>
                        <Card.Text>Interesses Pessoais: {perfil.interessesPessoais?.length ? perfil.interessesPessoais.join(', ') : <Badge bg='secondary'>Usuário ainda não possui interesses registrados</Badge>}</Card.Text>
                        <Card.Text>Interesses de Negócios: {perfil.interessesNegocios?.length ? perfil.interessesNegocios.join(', ') : <Badge bg='secondary'>Usuário ainda não possui interesses registrados</Badge>}</Card.Text>
                        <Card.Text>Ancestralidade: <Badge bg='secondary'>{perfil.convidadoPor}</Badge></Card.Text>
                    </Card>
                    {currentUser.uid !== uid && (
                        <div className="mt-4">
                            {isFriend ? (
                                <>
                                    <Button variant="danger" className="me-2" onClick={() => handleDesfazerAmizade(uid)}><FaTimesCircle /> Desfazer Amizade</Button>
                                    <Authorization userId={currentUser.uid} friendUid={uid} isAuthorized={isFriend} onStatusChange={(uid, status) => setPerfil(prev => ({ ...prev, amigosAutorizados: status ? [...prev.amigosAutorizados, uid] : prev.amigosAutorizados.filter(id => id !== uid) }))}>
                                        <FaLock /> Desautorizar
                                    </Authorization>
                                </>
                            ) : isPendingRequest ? (
                                <Button variant="warning" disabled><FaCheckCircle /> Solicitação Pendente</Button>
                            ) : (
                                <Button variant="primary" onClick={() => handleSendRequest(uid)}><FaUserFriends /> Enviar Solicitação de Amizade</Button>
                            )}
                            {!isFriend && !isPendingRequest && (
                                <Authorization userId={currentUser.uid} friendUid={uid} isAuthorized={isFriend} onStatusChange={(uid, status) => setPerfil(prev => ({ ...prev, amigosAutorizados: status ? [...prev.amigosAutorizados, uid] : prev.amigosAutorizados.filter(id => id !== uid) }))}>
                                    <FaUnlock /> Autorizar
                                </Authorization>
                            )}
                        </div>
                    )}
                </Card.Body>
            </Card>

            <h4 className="mb-4">Fotos Públicas</h4>
            <Row xs={1} md={4} className="g-4 mb-4">
                {fotosPublicas.map((foto, index) => (
                    <Col key={index}>
                        <Image src={foto.url} thumbnail />
                    </Col>
                ))}
            </Row>

            {currentUser.uid !== uid && fotosPrivadas.length > 0 && (
                <>
                    <h4 className="mb-4">Fotos Privadas</h4>
                    <Row xs={1} md={4} className="g-4">
                        {fotosPrivadas.map((foto, index) => (
                            <Col key={index}>
                                <Image src={foto.url} thumbnail />
                            </Col>
                        ))}
                    </Row>
                </>
            )}

            <h4 className="mb-4">Ancestralidade</h4>
            {ancestralidade.length > 0 ? (
                <Row xs={1} md={2} className="g-4">
                    {ancestralidade.map((ancestral, index) => (
                        <Col key={index}>
                            <Card>
                                <Card.Body>
                                    <Image src={ancestral.fotoDoUsuario || process.env.REACT_APP_PLACE_HOLDER_IMG} roundedCircle width="50" height="50" className="me-3" />
                                    <Card.Text>Convidado por: {ancestral.senderId}</Card.Text>
                                    <Card.Text>Data do Aceite: {new Date(ancestral.dataAceite.seconds * 1000).toLocaleDateString("pt-BR")}</Card.Text>
                                    <Card.Text>Invite ID: {ancestral.inviteId}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Alert variant="warning">Nenhuma informação de ancestralidade disponível.</Alert>
            )}
        </Container>
    );
};

export default PerfilAmigo;
