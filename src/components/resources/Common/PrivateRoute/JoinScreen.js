// src/JoinScreen.js
import React, { useState } from 'react';
import { Container, Button, TextField } from '@mui/material';

const JoinScreen = ({ getMeetingAndToken }) => {
    const [meetingId, setMeetingId] = useState('');

    const handleJoin = async () => {
        if (meetingId.trim() !== '') {
            await getMeetingAndToken(meetingId);
        }
    };

    const handleCreate = async () => {
        await getMeetingAndToken(null); // Create new meeting
    };

    return (
        <Container>
            <TextField label="Enter Meeting Id" value={meetingId} onChange={(e) => setMeetingId(e.target.value)} fullWidth />
            <Button variant="contained" color="primary" onClick={handleJoin}>Join</Button>
            <Button variant="contained" color="secondary" onClick={handleCreate}>Create Meeting</Button>
        </Container>
    );
};

export default JoinScreen;
