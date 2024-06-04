import React, { useEffect, useState } from 'react';
import { Card, Image, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { db } from '../../../../firebase.config';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../AuthService';

const PerfilAmigo = () => {
    const { uid } = useParams();
    const { currentUser } = useAuth();
    const [perfil, setPerfil] = useState(null);
    const [fotosPublicas, setFotosPublicas] = useState([]);
    const [fotosPrivadas, setFotosPrivadas] = useState([]);
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
                    // Verifica se o currentUser está autorizado a ver fotos privadas
                    if (perfilData.amigosAutorizados.includes(currentUser.uid)) {
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

        if (uid) fetchPerfil();
    }, [uid, currentUser]);

    if (isLoading) return <div>Carregando...</div>;
    if (error) return <div>{error}</div>;
    if (!perfil) return <div>Perfil não encontrado.</div>;

    // Renderiza o componente de perfil
    return (
        <div>
            <Card>
                <Card.Header>
                    <h2>Perfil de {perfil.nome}</h2>
                </Card.Header>
                <Card.Body>
                    <Row className="justify-content-md-center">
                        <Col md={6}>
                            <Image style={{ width: '100px', height: 'auto' }} src={perfil.fotoDoPerfil || 'path/to/default/image.jpg'} roundedCircle />
                        </Col>
                    </Row>
                    <Card.Text>Email: {perfil.email}</Card.Text>
                    <Card.Text>Idade: {perfil.idade}</Card.Text>
                    <Card.Text>Bio: {perfil.descricao}</Card.Text>
                </Card.Body>
            </Card>
            
            <Row xs={1} md={4} className="g-4">
                {fotosPublicas.map((foto, index) => (
                    <Col key={index}>
                        <Image src={foto.url} thumbnail />
                    </Col>
                ))}
            </Row>
            
            {currentUser.uid !== uid && fotosPrivadas.length > 0 && (
                <>
                    <h3>Fotos Privadas</h3>
                    <Row xs={1} md={4} className="g-4">
                        {fotosPrivadas.map((foto, index) => (
                            <Col key={index}>
                                <Image src={foto.url} thumbnail />
                            </Col>
                        ))}
                    </Row>
                </>
            )}
        </div>
    );
};

export default PerfilAmigo;
