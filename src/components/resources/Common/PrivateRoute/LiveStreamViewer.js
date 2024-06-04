import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../../../firebase.config';
import { doc, onSnapshot } from 'firebase/firestore';
import { Container, Alert, Spinner } from 'react-bootstrap';
import useLiveStream from './hooks/useLiveStream';
import { useAuth } from '../../AuthService';

const LiveStreamViewer = () => {
    const { liveId } = useParams();
    const { currentUser } = useAuth();
    const { videoRef, isStreaming, error: streamError, startStream, stopStream } = useLiveStream(currentUser);
    const [streamData, setStreamData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!liveId) {
            setError('Invalid live stream ID.');
            return;
        }

        const streamDoc = doc(db, 'liveStreams', liveId);
        const unsubscribe = onSnapshot(streamDoc, (snapshot) => {
            if (snapshot.exists()) {
                setStreamData(snapshot.data());
            } else {
                setError('Stream not found.');
            }
        });

        return () => unsubscribe();
    }, [liveId]);

    return (
        <Container>
            {error && <Alert variant="danger">{error}</Alert>}
            {streamError && <Alert variant="danger">{streamError}</Alert>}
            {streamData ? (
                <div>
                    <h2>{streamData.title}</h2>
                    <div className="video-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', background: '#000' }}>
                        <video ref={videoRef} autoPlay muted style={{ width: '100%', height: 'auto', maxHeight: '100%' }} />
                    </div>
                </div>
            ) : (
                !error && <Spinner animation="border" />
            )}
        </Container>
    );
};

export default LiveStreamViewer;
