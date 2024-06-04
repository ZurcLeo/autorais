import React, { useEffect, useState } from 'react';
import { db } from '../../../../firebase.config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Card, Container, Row, Col, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaUserCircle } from 'react-icons/fa';
import './LiveStreamMosaic.css';

const LiveStreamsMosaic = () => {
    const [liveStreams, setLiveStreams] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const liveStreamsRef = collection(db, 'liveStreams');
        const liveStreamsQuery = query(liveStreamsRef, where('isActive', '==', true));

        const unsubscribe = onSnapshot(liveStreamsQuery, (snapshot) => {
            const streams = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Active live streams:', streams);
            setLiveStreams(streams);
        });

        return () => unsubscribe();
    }, []);

    const handleCardClick = (liveId) => {
        console.log('Navigating to live stream:', liveId);
        navigate(`/LiveStreamViewer/${liveId}`);
    };

    const handleStartLiveStream = () => {
        console.log('Navigating to start live stream');
        navigate('/LiveStream'); // Rota para iniciar a transmissão ao vivo
    };

    return (
        <Container>
            <Row>
                {liveStreams.length > 0 ? (
                    liveStreams.map(stream => (
                        <Col key={stream.userId} xs={12} sm={6} md={4} className="mb-4">
                            <Card onClick={() => handleCardClick(stream.userId)} className="live-stream-card">
                                <Card.Img variant="top" src={stream.thumbnailUrl || 'default-thumbnail.jpg'} alt={`${stream.userName} thumbnail`} />
                                <Card.Body>
                                    <Card.Title>{stream.userName}</Card.Title>
                                    <Card.Text>
                                        {stream.title || 'Live Stream'}
                                        <br />
                                        <Badge bg="success">Ao Vivo</Badge>
                                        <br />
                                        <FaUser /> {stream.viewerCount || 0} espectadores
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col>
                        <div className="text-center">
                            <FaUserCircle size={50} className="text-muted mb-3" />
                            <p className="text-muted">Nenhuma transmissão ao vivo no momento.</p>
                            <Button variant="outline-success" onClick={handleStartLiveStream}>Entre ao Vivo</Button>
                        </div>
                    </Col>
                )}
            </Row>
        </Container>
    );
};

export default LiveStreamsMosaic;
