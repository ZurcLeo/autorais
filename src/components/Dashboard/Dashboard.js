// src/components/Dashboard/Dashboard.js
import React from 'react';
import { Container } from '@mui/material';
import { useDashboard } from '../../context/DashboardContext/'; // Contexto!
// import { LoadingScreen } from '../../core/initialization/LoadingScreen';
import {
  CaixinhasSection,
  NotificationsSection,
  MessagesSection,
  ConnectionsSection
} from './sections';

export const Dashboard = () => {
    const {
        messages,
        notifications,
        connections,
        caixinhas,
        loading,
        fetchDashboardData // Agora usando fetchDashboardData do contexto
    } = useDashboard();

    // if (loading) {
    //     return <LoadingScreen />;
    // }

    return (
        <Container maxWidth="lg">
            <CaixinhasSection data={caixinhas} />
            <NotificationsSection data={notifications} />
            <MessagesSection data={messages} />
            <ConnectionsSection data={connections} />
        </Container>
    );
};