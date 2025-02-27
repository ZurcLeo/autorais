import React from 'react';
import { Container } from '@mui/material';
import { useDashboard } from '../../context/DashboardContext';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';
import {
  CaixinhasSection,
  NotificationsSection,
  MessagesSection,
  ConnectionsSection
} from './sections';

const Dashboard = () => {
  const { 
    messages = [], 
    notifications = [], 
    connections = { friends: [], bestFriends: [] }, 
    caixinhas = [],
    loading,
    error,
    refetchAll 
  } = useDashboard();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refetchAll} />;
  }

  return (
    <Container maxWidth="lg">
      <CaixinhasSection data={caixinhas} />
      <NotificationsSection data={notifications} />
      <MessagesSection data={messages} />
      <ConnectionsSection data={connections} />
    </Container>
  );
};

export default Dashboard;