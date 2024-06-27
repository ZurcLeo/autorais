// src/LiveStream.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getAuth } from 'firebase/auth';
import { Container, Button } from '@mui/material';
import axios from 'axios';
import { MeetingProvider, useMeeting, useParticipant, Constants } from '@videosdk.live/react-sdk';
import Hls from 'hls.js';

const api = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
});

const LiveStream = () => {
    const { currentUser } = getAuth();
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [roomId, setroomId] = useState(null);

    useEffect(() => {
        const fetchAuthToken = async () => {
            if (currentUser) {
                try {
                    const idToken = await currentUser.getIdToken();
                    setAuthToken(idToken);
                    localStorage.setItem('authToken', idToken);
                    console.log('Fetched ID token:', idToken);
                } catch (error) {
                    console.error('Error fetching ID token:', error);
                }
            }
        };

        fetchAuthToken();
    }, [currentUser]);

    const startStream = async () => {
        try {
            const idToken = await currentUser.getIdToken(true);
            console.log('Starting stream with token:', idToken);
            const response = await api.post('/api/videosdk/start-session', { userId: currentUser.uid }, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            console.log('Stream started with response:', response.data);
            setroomId(response.data.roomId);
            setIsStreaming(true);
        } catch (error) {
            setError('Failed to start stream');
            console.error('Error starting stream:', error);
        }
    };

    const stopStream = async () => {
        try {
            const idToken = await currentUser.getIdToken(true);
            await api.post('/api/videosdk/end-session', { roomId }, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            setIsStreaming(false);
            setroomId(null);
        } catch (error) {
            setError('Failed to stop stream');
            console.error('Error stopping stream:', error);
        }
    };

    const SpeakerView = () => {
        const [joined, setJoined] = useState(null);
        const { participants } = useMeeting();
        const mMeeting = useMeeting({
            onMeetingJoined: () => {
                setJoined("JOINED");
                if (mMeetingRef.current.localParticipant.mode === "CONFERENCE") {
                    mMeetingRef.current.localParticipant.pin();
                }
            },
        });
        const mMeetingRef = useRef(mMeeting);
        useEffect(() => {
            mMeetingRef.current = mMeeting;
        }, [mMeeting]);
        const speakers = useMemo(() => {
            return [...participants.values()].filter(participant => participant.mode === Constants.modes.CONFERENCE);
        }, [participants]);
        return (
            <div className="container">
                {joined && joined === "JOINED" ? (
                    <div>
                        {speakers.map(participant => (
                            <ParticipantView participantId={participant.id} key={participant.id} />
                        ))}
                        <Controls />
                    </div>
                ) : (
                    <p>Joining the meeting...</p>
                )}
            </div>
        );
    };

    const ViewerView = () => {
        const playerRef = useRef(null);
        const { hlsUrls, hlsState } = useMeeting();
        useEffect(() => {
            if (hlsUrls.downstreamUrl && hlsState === "HLS_PLAYABLE") {
                if (Hls.isSupported()) {
                    const hls = new Hls({
                        capLevelToPlayerSize: true,
                        maxLoadingDelay: 4,
                        minAutoBitrate: 0,
                        autoStartLoad: true,
                        defaultAudioCodec: "mp4a.40.2",
                    });
                    const player = document.querySelector("#hlsPlayer");
                    hls.loadSource(hlsUrls.downstreamUrl);
                    hls.attachMedia(player);
                } else {
                    if (typeof playerRef.current?.play === "function") {
                        playerRef.current.src = hlsUrls.downstreamUrl;
                        playerRef.current.play();
                    }
                }
            }
        }, [hlsUrls, hlsState, playerRef.current]);
        return (
            <div>
                {hlsState !== "HLS_PLAYABLE" ? (
                    <div>
                        <p>Please Click Go Live Button to start HLS</p>
                    </div>
                ) : (
                    <div>
                        <video
                            ref={playerRef}
                            id="hlsPlayer"
                            autoPlay
                            controls
                            style={{ width: "50%", height: "50%" }}
                            playsInline
                            muted
                            onError={(err) => {
                                console.log(err, "hls video error");
                            }}
                        ></video>
                    </div>
                )}
            </div>
        );
    };

    const ParticipantView = ({ participantId }) => {
        const { displayName } = useParticipant(participantId);
        return (
            <div>
                <h4>{displayName}</h4>
            </div>
        );
    };

    const Controls = () => {
        const { leave, toggleMic, toggleWebcam } = useMeeting();
        return (
            <Container>
                <Button variant="contained" onClick={leave}>Leave</Button>
                <Button variant="contained" onClick={toggleMic}>Toggle Mic</Button>
                <Button variant="contained" onClick={toggleWebcam}>Toggle Webcam</Button>
            </Container>
        );
    };

    return (
        <Container>
            {currentUser && localStorage.getItem('authToken') ? (
                mode ? (
                    <MeetingProvider
                        config={{
                            roomId,
                            micEnabled: true,
                            webcamEnabled: true,
                            name: currentUser.displayName || "User",
                            mode,
                        }}
                        joinWithoutUserInteraction
                        token={localStorage.getItem('authToken')}
                    >
                        {mode === Constants.modes.CONFERENCE ? <SpeakerView /> : <ViewerView />}
                    </MeetingProvider>
                ) : (
                    <div>
                        <Button variant="contained" onClick={() => setMode(Constants.modes.CONFERENCE)}>
                            Join as Speaker
                        </Button>
                        <Button variant="contained" style={{ marginLeft: 12 }} onClick={() => setMode(Constants.modes.VIEWER)}>
                            Join as Viewer
                        </Button>
                    </div>
                )
            ) : (
                <p>Faça Login para Transmitir OnLine.</p>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </Container>
    );
};

export default LiveStream;
