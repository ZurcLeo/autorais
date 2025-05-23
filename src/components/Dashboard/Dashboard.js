// src/components/Dashboard/Dashboard.js
import React from 'react';
import { CircularProgress, Container } from '@mui/material';
import { useAuth } from '../../providers/AuthProvider';
// import { useDashboard } from '../../context/DashboardContext/'; // Contexto!
import { useMessages } from '../../providers/MessageProvider';
import { useNotifications } from '../../providers/NotificationProvider';
import { useConnections } from '../../providers/ConnectionProvider';
import { useCaixinha } from '../../providers/CaixinhaProvider';
import {
  CaixinhasSection,
  NotificationsSection,
  MessagesSection,
  ConnectionsSection
} from './sections';

export const Dashboard = () => {
        const { currentUser } = useAuth();
        const { messages } = useMessages();
        const { notifications, notifLoading } = useNotifications();
        const connectionState = useConnections();
        const { friends, bestFriends, loading } = connectionState;
        const { caixinhas } = useCaixinha();
        console.log('caixinhas no dashL: ', useCaixinha())

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Container sx={{
            display: 'flex',
            flexDirection: 'column', // Organiza os itens em coluna
            width: '100%', // Ocupa a largura disponível
            padding: 2,
          }}>
            <CaixinhasSection data={caixinhas.caixinhas} />
            <NotificationsSection data={notifications} />
            <MessagesSection data={messages} />
            <ConnectionsSection data={{friends, bestFriends}} />
        </Container>
    );
};