// components/Connections.js
import React from 'react';
import { Container } from "react-bootstrap";
import SearchFriends from './SearchFriends';
import ActiveConnections from './ActiveConnections';
import FriendRequests from './FriendRequests';

const Connections = () => {
    return (
        <Container style={{ marginTop: '20px' }}>
            <SearchFriends />
            <FriendRequests />
            <ActiveConnections />
        </Container>
    );
};

export default Connections;