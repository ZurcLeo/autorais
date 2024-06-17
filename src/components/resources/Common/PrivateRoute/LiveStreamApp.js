import React, { useState, useEffect } from 'react';
import { MeetingProvider } from '@videosdk.live/react-sdk';
import { useAuth } from '../../AuthService';
import useLiveStream from './hooks/useLiveStream';
import axios from 'axios';
import JoinScreen from './JoinScreen';
import MeetingView from './MeetingView';

const api = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
});

const LiveStreamApp = () => {
    const [meetingId, setMeetingId] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const { currentUser } = useAuth();
    const { videoRef, isStreaming, startStream, stopStream, error } = useLiveStream(currentUser);

    useEffect(() => {
        const fetchAuthToken = async () => {
            try {
                const response = await api.get('/api/auth/token', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                setAuthToken(response.data.token);
            } catch (error) {
                console.error('Error fetching auth token:', error);
            }
        };
        fetchAuthToken();
    }, []);

    const getMeetingAndToken = async (meetingId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await api.post('/api/videosdk/start-session', { meetingId }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setMeetingId(response.data.roomId); // Alterar para usar response.data.roomId
            setAuthToken(response.data.token);
        } catch (error) {
            console.error('Error starting session:', error);
            throw error;
        }
    };

    const onMeetingLeave = async () => {
        try {
            await api.post('/api/videosdk/end-session', { roomId: meetingId }); // Corrigir para usar roomId
            setMeetingId(null);
        } catch (error) {
            console.error('Error ending session:', error);
        }
    };

    return authToken && meetingId ? (
        <MeetingProvider config={{ meetingId, micEnabled: true, webcamEnabled: true, name: currentUser.displayName }} token={authToken}>
            <MeetingView meetingId={meetingId} onMeetingLeave={onMeetingLeave} />
        </MeetingProvider>
    ) : (
        <JoinScreen getMeetingAndToken={getMeetingAndToken} />
    );
};

export default LiveStreamApp;
