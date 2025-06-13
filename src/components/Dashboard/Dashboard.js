// src/components/Dashboard/Dashboard.js
import React, { Suspense } from 'react';
import { Container, Grid, Box, Fade } from '@mui/material';
import { useAuth } from '../../providers/AuthProvider';
import { useDashboard } from '../../context/DashboardContext/'; // Contexto ativado!
import { useMessages } from '../../providers/MessageProvider';
import { useNotifications } from '../../providers/NotificationProvider';
import { useConnections } from '../../providers/ConnectionProvider';
import { useCaixinha } from '../../providers/CaixinhaProvider';
import {
  CaixinhasSection,
  NotificationsSection,
  MessagesSection,
  ConnectionsSection,
  DashboardOverview,
  QuickActions,
  DashboardSkeleton
} from './sections';

export const Dashboard = () => {
    const { currentUser } = useAuth();
    const { messages } = useMessages();
    const { notifications, notifLoading } = useNotifications();
    const connectionState = useConnections();
    const { friends, bestFriends, loading: connectionsLoading } = connectionState;
    const { caixinhas, loading: caixinhasLoading } = useCaixinha();
    
    // Usar o contexto do dashboard
    const { 
        data: dashboardData, 
        loading: dashboardLoading, 
        refreshDashboard 
    } = useDashboard();
    
    // Combinar dados de diferentes providers
    const combinedData = {
        caixinhas: caixinhas?.caixinhas || [],
        messages: messages || [],
        notifications: notifications || [],
        connections: { friends: friends || [], bestFriends: bestFriends || [] }
    };

    // Estados de loading combinados
    const isLoading = dashboardLoading || connectionsLoading || caixinhasLoading || notifLoading;

    // Loading state com skeleton
    if (isLoading) {
        return (
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <DashboardSkeleton />
            </Container>
        );
    }

    return (
        <Container 
            maxWidth="xl" 
            sx={{
                py: 3,
                minHeight: '100vh'
            }}
        >
            <Fade in={!isLoading} timeout={500}>
                <Box>
                    {/* Dashboard Overview - Métricas e boas-vindas */}
                    <DashboardOverview 
                        data={combinedData}
                        currentUser={currentUser}
                    />
                    
                    {/* Quick Actions - Ações frequentes */}
                    <QuickActions 
                        showFloatingAction={true}
                        // recentActions={recentActions} // Para implementar futuramente
                    />
                    
                    {/* Seções principais em Grid responsivo */}
                    <Grid container spacing={4}>
                        {/* Coluna da esquerda */}
                        <Grid item xs={12} lg={8}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <CaixinhasSection data={combinedData.caixinhas} />
                                <MessagesSection data={combinedData.messages} />
                            </Box>
                        </Grid>
                        
                        {/* Coluna da direita */}
                        <Grid item xs={12} lg={4}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <NotificationsSection data={combinedData.notifications} />
                                <ConnectionsSection data={combinedData.connections} />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Fade>
        </Container>
    );
};