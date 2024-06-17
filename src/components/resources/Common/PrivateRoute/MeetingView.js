// src/MeetingView.js
import React, { useState } from 'react';
import { Container, Button } from '@mui/material';
import { useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import ChatBox from './ChatBox';

const MeetingView = ({ meetingId, onMeetingLeave }) => {
    const [joined, setJoined] = useState(false);
    const { join, participants } = useMeeting({
        onMeetingJoined: () => setJoined(true),
        onMeetingLeft: () => onMeetingLeave(),
    });

    const joinMeeting = () => {
        join();
    };

    return (
        <Container>
            <h3>Meeting Id: {meetingId}</h3>
            {joined ? (
                <div>
                    <Controls />
                    {[...participants.keys()].map(participantId => (
                        <ParticipantView participantId={participantId} key={participantId} />
                    ))}
                    <ChatBox liveId={meetingId} />
                </div>
            ) : (
                <Button variant="contained" onClick={joinMeeting}>Join</Button>
            )}
        </Container>
    );
};

const Controls = () => {
    const { leave, toggleMic, toggleWebcam } = useMeeting();

    return (
        <Container>
            <Button variant="contained" onClick={() => leave()}>Leave</Button>
            <Button variant="contained" onClick={() => toggleMic()}>Toggle Mic</Button>
            <Button variant="contained" onClick={() => toggleWebcam()}>Toggle Webcam</Button>
        </Container>
    );
};

const ParticipantView = ({ participantId }) => {
    const { displayName } = useParticipant(participantId);

    return (
        <Container>
            <h4>{displayName}</h4>
        </Container>
    );
};

export default MeetingView;
