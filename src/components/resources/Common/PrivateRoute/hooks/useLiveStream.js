// src/hooks/useLiveStream.js
import { useState, useRef, useEffect, useCallback } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../../firebase.config';
import { toast } from 'react-toastify';

const useLiveStream = (currentUser) => {
    const [isStreaming, setIsStreaming] = useState(false);
    const [iceServers, setIceServers] = useState([]);
    const [error, setError] = useState(null);
    const videoRef = useRef();
    const peerConnections = useRef({});
    const functions = getFunctions();
    const animationFrameId = useRef(null);
    const negotiationNeeded = useRef({});
    const sentOffers = useRef(new Set());
    const sentAnswers = useRef(new Set());

    const sendCandidate = useCallback((userId, candidate) => {
        const sendCandidateFunction = httpsCallable(functions, 'sendCandidate');
        sendCandidateFunction({ to: userId, candidate }).catch(error => {
            toast.error('Failed to send ICE candidate');
            console.error('Failed to send ICE candidate:', error);
        });
    }, [functions]);

    const createPeerConnection = useCallback((userId) => {
        const peerConnection = new RTCPeerConnection({ iceServers });

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                sendCandidate(userId, event.candidate);
            }
        };

        peerConnection.ontrack = (event) => {
            const remoteStream = event.streams[0];
            const remoteVideo = document.getElementById(`remoteVideo-${userId}`);
            if (remoteVideo) {
                remoteVideo.srcObject = remoteStream;
            } else {
                const newRemoteVideo = document.createElement('video');
                newRemoteVideo.id = `remoteVideo-${userId}`;
                newRemoteVideo.autoplay = true;
                document.body.appendChild(newRemoteVideo);
                newRemoteVideo.srcObject = remoteStream;
            }
        };

        peerConnection.onnegotiationneeded = () => handleNegotiationNeededEvent(userId);

        return peerConnection;
    }, [iceServers, sendCandidate]);

    const handleNegotiationNeededEvent = useCallback(async (userId) => {
        if (negotiationNeeded.current[userId] || !isStreaming) return;
        negotiationNeeded.current[userId] = true;

        try {
            const peerConnection = peerConnections.current[userId];
            const offer = await peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });
            await peerConnection.setLocalDescription(offer);

            if (!offer.sdp || !offer.type) {
                toast.error('Invalid offer generated');
                return;
            }

            const sendOffer = httpsCallable(functions, 'sendOffer');
            await sendOffer({ offer: peerConnection.localDescription, userId });
        } catch (error) {
            toast.error('Failed to create or send offer');
            console.error('Failed to create or send offer:', error);
        } finally {
            negotiationNeeded.current[userId] = false;
        }
    }, [functions, isStreaming]);

    const handleCreateOffer = useCallback(async (peerConnection, userId) => {
        const offer = await peerConnection.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        });
        await peerConnection.setLocalDescription(offer);

        if (!offer.sdp || !offer.type) {
            toast.error('Invalid offer generated');
            throw new Error('Invalid offer generated');
        }

        const sendOffer = httpsCallable(functions, 'sendOffer');
        await sendOffer({ offer: peerConnection.localDescription, userId });
        sentOffers.current.add(userId);
    }, [functions]);

    const handleCreateAnswer = useCallback(async (peerConnection, userId, from) => {
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        if (!answer.sdp || !answer.type) {
            toast.error('Invalid answer generated');
            throw new Error('Invalid answer generated');
        }

        const sendAnswer = httpsCallable(functions, 'sendAnswer');
        await sendAnswer({ answer: peerConnection.localDescription, userId, from });
        sentAnswers.current.add(userId);
    }, [functions]);

    const createOffer = useCallback(async (userId) => {
        if (!isStreaming) return;

        const peerConnection = createPeerConnection(userId);
        peerConnections.current[userId] = peerConnection;

        await handleCreateOffer(peerConnection, userId);
    }, [createPeerConnection, handleCreateOffer, isStreaming]);

    const handleReceiveOffer = useCallback(async (data) => {
        if (!isStreaming) return;

        const { from, sdp, type } = data;

        if (!sdp || !type) {
            toast.error('Invalid offer received');
            console.error('Invalid offer received:', data);
            return;
        }

        const offer = { sdp, type };
        let peerConnection = peerConnections.current[from];
        if (!peerConnection) {
            peerConnection = createPeerConnection(from);
            peerConnections.current[from] = peerConnection;
        }

        try {
            if (peerConnection.signalingState !== 'stable') {
                toast.warn('Cannot set remote offer in current state');
                console.warn('Cannot set remote offer in current state', peerConnection.signalingState);
                return;
            }

            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            await handleCreateAnswer(peerConnection, currentUser.uid, from);
        } catch (error) {
            toast.error('Failed to handle received offer');
            console.error('Failed to handle received offer:', error);
        }
    }, [createPeerConnection, handleCreateAnswer, currentUser.uid, isStreaming]);

    const handleReceiveAnswer = useCallback(async (data) => {
        if (!isStreaming) return;

        const { from, sdp, type } = data;

        if (!sdp || !type) {
            toast.error('Invalid answer received');
            console.error('Invalid answer received:', data);
            return;
        }

        const answer = { sdp, type };
        const peerConnection = peerConnections.current[from];
        if (peerConnection) {
            try {
                if (peerConnection.signalingState !== 'have-local-offer') {
                    toast.warn('Cannot set remote answer in current state');
                    console.warn('Cannot set remote answer in current state', peerConnection.signalingState);
                    return;
                }
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            } catch (error) {
                toast.error('Failed to set remote description');
                console.error('Failed to set remote description:', error);
            }
        } else {
            toast.error('PeerConnection not found for user');
            console.error('PeerConnection not found for user:', from);
        }
    }, [isStreaming]);

    const handleReceiveCandidate = useCallback(async (data) => {
        if (!isStreaming) return;

        const { from, candidate } = data;
        const peerConnection = peerConnections.current[from];
        if (peerConnection) {
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                toast.error('Failed to add ICE candidate');
                console.error('Failed to add ICE candidate:', error);
            }
        }
    }, [isStreaming]);

    useEffect(() => {
        if (!currentUser || !currentUser.uid) return;

        const offersDoc = doc(db, 'offers', currentUser.uid);
        const answersDoc = doc(db, 'answers', currentUser.uid);
        const candidatesDoc = doc(db, 'candidates', currentUser.uid);

        const unsubscribeOffers = onSnapshot(offersDoc, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (!sentOffers.current.has(data.from)) {
                    console.log('Offer received:', data);
                    handleReceiveOffer(data);
                }
            }
        });

        const unsubscribeAnswers = onSnapshot(answersDoc, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (!sentAnswers.current.has(data.from)) {
                    console.log('Answer received:', data);
                    handleReceiveAnswer(data);
                }
            }
        });

        const unsubscribeCandidates = onSnapshot(candidatesDoc, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                console.log('Candidate received:', data);
                handleReceiveCandidate(data);
            }
        });

        return () => {
            unsubscribeOffers();
            unsubscribeAnswers();
            unsubscribeCandidates();
        };
    }, [currentUser, handleReceiveOffer, handleReceiveAnswer, handleReceiveCandidate, isStreaming]);

    useEffect(() => {
        const fetchTurnCredentials = async () => {
            const getTurnCredentials = httpsCallable(functions, 'getTurnCredentials');
            try {
                const result = await getTurnCredentials();
                setIceServers([result.data.turnServer]);
            } catch (error) {
                toast.error('Failed to get TURN credentials');
                setError('Failed to get TURN credentials.');
            }
        };

        fetchTurnCredentials();
    }, [functions]);

    useEffect(() => {
        Object.values(peerConnections.current).forEach((peerConnection) => {
            peerConnection.onnegotiationneeded = () => handleNegotiationNeededEvent(currentUser.uid);
        });
    }, [currentUser.uid]);

    const startStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            videoRef.current.srcObject = stream;
            setIsStreaming(true);

            stream.getTracks().forEach(track => {
                Object.values(peerConnections.current).forEach(peerConnection => {
                    peerConnection.addTrack(track, stream);
                });
            });

            const notifyStreamStarted = httpsCallable(functions, 'notifyStreamStarted');
            await notifyStreamStarted({ userId: currentUser.uid, userName: currentUser.displayName });

            const handleVideoFrame = (now) => {
                console.log('Processing video frame:', now);
                animationFrameId.current = requestAnimationFrame(handleVideoFrame);
            };
            animationFrameId.current = requestAnimationFrame(handleVideoFrame);

            await createOffer(currentUser.uid);
        } catch (err) {
            toast.error('Failed to access media devices. Please check your permissions.');
            setError('Failed to access media devices. Please check your permissions.');
        }
    };

    const stopStream = async () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
        setIsStreaming(false);

        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }

        const notifyStreamStopped = httpsCallable(functions, 'notifyStreamStopped');
        try {
            await notifyStreamStopped({ userId: currentUser.uid });
        } catch (error) {
            toast.error('Error notifying stream stopped');
            console.error('Error notifying stream stopped:', error);
        }

        Object.values(peerConnections.current).forEach(peerConnection => {
            peerConnection.close();
        });
        peerConnections.current = {};
        sentOffers.current.clear();
        sentAnswers.current.clear();
    };

    return { videoRef, isStreaming, startStream, stopStream, error };
};

export default useLiveStream;
