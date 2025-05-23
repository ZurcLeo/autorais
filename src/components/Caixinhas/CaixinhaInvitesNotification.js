// src/components/Notification/CaixinhaInvitesNotification.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Skeleton,
  Alert,
  Button,
  Divider,
  Badge
} from '@mui/material';
import { NotificationsNone as NotificationIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useCaixinhaInvite } from '../../providers/CaixinhaInviteProvider';
import CaixinhaInviteRequest from './CaixinhaInviteRequest';

/**
 * Componente que gerencia e exibe notificações de convites para caixinhas
 */
const CaixinhaInvitesNotification = () => {
  const { t } = useTranslation();
  const {
    pendingInvites,
    loadPendingInvites,
    loading,
    error,
    isServiceAvailable
  } = useCaixinhaInvite();
  
  const [showAll, setShowAll] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Carregar convites pendentes ao montar o componente
  useEffect(() => {
    const fetchInvites = async () => {
      try {
        await loadPendingInvites();
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Erro ao carregar convites de caixinha:', err);
      }
    };
    
    fetchInvites();
    
    // Atualizar a cada 2 minutos
    const interval = setInterval(fetchInvites, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [loadPendingInvites]);

  // Handler para atualização de convites
  const handleInviteUpdate = async () => {
    await loadPendingInvites();
    setLastUpdated(new Date());
  };

  // Se o serviço não estiver disponível
  if (!isServiceAvailable) {
    return null;
  }

  // Ordenar convites por data (mais recentes primeiro)
  const sortedInvites = [...pendingInvites].sort((a, b) => {
    const dateA = a.createdAt?._seconds || 0;
    const dateB = b.createdAt?._seconds || 0;
    return dateB - dateA;
  });

  // Limitar número de convites exibidos se não estiver mostrando todos
  const displayedInvites = showAll 
    ? sortedInvites 
    : sortedInvites.slice(0, 3);
  
  // Componente de carregamento
  if (loading && pendingInvites.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <NotificationIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">{t('caixinhaInvite.notificationTitle')}</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {[1, 2, 3].map((i) => (
          <Box key={i} sx={{ mb: 2 }}>
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2, mb: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton width="40%" height={36} />
              <Skeleton width="30%" height={36} />
            </Box>
          </Box>
        ))}
      </Paper>
    );
  }

  // Se houver erro
  if (error) {
    return (
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <NotificationIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">{t('caixinhaInvite.notificationTitle')}</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="error">
          {t('caixinhaInvite.loadError')}
        </Alert>
      </Paper>
    );
  }

  // Se não houver convites
  if (pendingInvites.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <NotificationIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">{t('caixinhaInvite.notificationTitle')}</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info" sx={{ backgroundColor: 'lightblue', color: 'darkblue' }}>
          {t('caixinhaInvite.noPendingInvites')}
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Badge badgeContent={pendingInvites.length} color="error" sx={{ mr: 1 }}>
            <NotificationIcon color="primary" />
          </Badge>
          <Typography variant="h6">{t('caixinhaInvite.notificationTitle')}</Typography>
        </Box>
        
        {lastUpdated && (
          <Typography variant="caption" color="text.secondary">
            {t('caixinhaInvite.lastUpdated', { 
              time: lastUpdated.toLocaleTimeString() 
            })}
          </Typography>
        )}
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <CaixinhaInviteRequest 
        invites={displayedInvites} 
        onInviteUpdate={handleInviteUpdate}
      />
      
      {/* Botão para mostrar mais/menos */}
      {pendingInvites.length > 3 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button 
            variant="outlined" 
            onClick={() => setShowAll(!showAll)}
          >
            {showAll 
              ? t('caixinhaInvite.showLess') 
              : t('caixinhaInvite.showMore', { count: pendingInvites.length - 3 })}
          </Button>
        </Box>
      )}
      
      {loading && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {t('caixinhaInvite.updatingInvites')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default CaixinhaInvitesNotification;