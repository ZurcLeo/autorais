// components/Connections.js
import React from 'react';
import { Container } from "react-bootstrap";
import SearchFriends from './SearchFriends';
import ActiveConnections from './ActiveConnections';
import FriendRequests from './FriendRequests';
import './connections.css'

const Connections = () => {
    return (
        <Container style={{ margin: '10px' }}>
            <SearchFriends />
            <FriendRequests />
            <ActiveConnections />
        </Container>
    );
};

export default Connections;