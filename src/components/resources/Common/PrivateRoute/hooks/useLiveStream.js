import { useState, useRef, useEffect, useCallback } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../../firebase.config';

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

    const createPeerConnection = (userId) => {
        const peerConnection = new RTCPeerConnection({ iceServers });

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                const sendCandidate = httpsCallable(functions, 'sendCandidate');
                sendCandidate({ to: userId, candidate: event.candidate });
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
    };

    const handleNegotiationNeededEvent = async (userId) => {
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
            console.error('Invalid offer generated:', offer);
            return;
          }
      
          const sendOffer = httpsCallable(functions, 'sendOffer');
          await sendOffer({ offer: peerConnection.localDescription, userId });
        } catch (error) {
          console.error('Failed to create or send offer:', error);
        } finally {
          negotiationNeeded.current[userId] = false;
        }
      };

    const createOffer = async (userId) => {
        if (!isStreaming) return;

        const peerConnection = createPeerConnection(userId);
        peerConnections.current[userId] = peerConnection;

        const offer = await peerConnection.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        });
        await peerConnection.setLocalDescription(offer);

        if (!offer.sdp || !offer.type) {
            console.error('Invalid offer generated:', offer);
            return;
        }

        const sendOffer = httpsCallable(functions, 'sendOffer');
        await sendOffer({ offer: peerConnection.localDescription, userId });
        sentOffers.current.add(userId);
    };

    const handleReceiveOffer = useCallback(async (data) => {
        if (!isStreaming) return;

        const { from, sdp, type } = data;

        if (!sdp || !type) {
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
                console.warn('Cannot set remote offer in current state', peerConnection.signalingState);
                return;
            }

            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            if (!answer.sdp || !answer.type) {
                console.error('Invalid answer generated:', answer);
                return;
            }

            const sendAnswer = httpsCallable(functions, 'sendAnswer');
            await sendAnswer({ answer: peerConnection.localDescription, userId: from, from: currentUser.uid });
            sentAnswers.current.add(from);
        } catch (error) {
            console.error('Failed to handle received offer:', error);
        }
    }, [functions, currentUser, isStreaming]);

    const handleReceiveAnswer = useCallback(async (data) => {
        if (!isStreaming) return;

        const { from, sdp, type } = data;

        if (!sdp || !type) {
            console.error('Invalid answer received:', data);
            return;
        }

        const answer = { sdp, type };
        const peerConnection = peerConnections.current[from];
        if (peerConnection) {
            try {
                if (peerConnection.signalingState !== 'have-local-offer') {
                    console.warn('Cannot set remote answer in current state', peerConnection.signalingState);
                    return;
                }
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            } catch (error) {
                console.error('Failed to set remote description:', error);
            }
        } else {
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
                setError('Failed to get TURN credentials.');
            }
        };

        fetchTurnCredentials();
    }, [functions]);

    useEffect(() => {
        Object.values(peerConnections.current).forEach((peerConnection) => {
          peerConnection.onnegotiationneeded = () => handleNegotiationNeededEvent(currentUser.uid);
        });
      }, [peerConnections.current]);

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

            // Register frame callback using requestAnimationFrame
            const handleVideoFrame = (now) => {
                console.log('Processing video frame:', now);
                animationFrameId.current = requestAnimationFrame(handleVideoFrame);
            };
            animationFrameId.current = requestAnimationFrame(handleVideoFrame);

            // Create offer to initiate connection
            await createOffer(currentUser.uid);
        } catch (err) {
            setError('Failed to access media devices. Please check your permissions.');
        }
    };

    const stopStream = async () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
        setIsStreaming(false);

        // Cancel the animation frame loop
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }

        const notifyStreamStopped = httpsCallable(functions, 'notifyStreamStopped');
        try {
            await notifyStreamStopped({ userId: currentUser.uid });
        } catch (error) {
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
