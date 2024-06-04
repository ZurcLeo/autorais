import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../AuthService';
import { Button, Container, Alert, Row, Col, Spinner } from 'react-bootstrap';
import ChatBox from './ChatBox';
import useLiveStream from './hooks/useLiveStream';

const LiveStream = () => {
    const { liveId } = useParams();
    const { currentUser } = useAuth();
    const { videoRef, isStreaming, startStream, stopStream, error } = useLiveStream(currentUser);
    const [loading, setLoading] = useState(false);
    
    const handleStartStream = async () => {
        setLoading(true);
        await startStream();
        setLoading(false);
    };

    const handleStopStream = async () => {
        setLoading(true);
        await stopStream();
        setLoading(false);
    };

    return (
        <Container>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row>
                <Col md={9}>
                    <div className="video-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', background: '#000' }}>
                        <video ref={videoRef} autoPlay muted style={{ width: '100%', height: 'auto', maxHeight: '100%' }} />
                        {!isStreaming && <p style={{ color: '#fff' }}>Seu vídeo aparecerá aqui ao iniciar a transmissão.</p>}
                    </div>
                    <div>
                        <Button onClick={handleStartStream} disabled={!currentUser || isStreaming || loading} variant="primary" className="mt-3">
                            {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Iniciar Transmissão'}
                        </Button>
                        {isStreaming && (
                            <>
                                <Button onClick={handleStopStream} variant="danger" className="mt-3 ms-3" disabled={loading}>
                                    {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Parar Transmissão'}
                                </Button>
                                <p className="mt-3">Sua transmissão está ao vivo!</p>
                            </>
                        )}
                    </div>
                </Col>
                <Col md={3}>
                    <ChatBox liveId={liveId} />
                </Col>
            </Row>
        </Container>
    );
};

export default LiveStream;
