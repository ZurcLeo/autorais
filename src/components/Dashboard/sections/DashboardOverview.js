import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Chip,
  useTheme
} from '@mui/material';
import {
  AccountBalance as CaixinhaIcon,
  Message as MessageIcon,
  Notifications as NotificationIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Wallet as WalletIcon
} from '@mui/icons-material';

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  color = 'primary', 
  subtitle, 
  trend,
  progress 
}) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme?.shadows?.[8] || '0px 8px 16px rgba(0,0,0,0.15)'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: theme?.palette?.[color]?.light || '#e3f2fd',
              color: theme?.palette?.[color]?.main || '#1976d2',
              width: 48,
              height: 48,
              mr: 2
            }}
          >
            {icon}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
        
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {subtitle}
          </Typography>
        )}
        
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <TrendingUpIcon 
              fontSize="small" 
              color={trend > 0 ? 'success' : 'error'} 
            />
            <Typography 
              variant="caption" 
              sx={{ 
                ml: 0.5,
                color: trend > 0 
                  ? theme?.palette?.success?.main || '#2e7d32'
                  : theme?.palette?.error?.main || '#d32f2f'
              }}
            >
              {trend > 0 ? '+' : ''}{trend}%
            </Typography>
          </Box>
        )}
        
        {progress !== undefined && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ 
                height: 6, 
                borderRadius: 3,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: theme?.palette?.[color]?.main || '#1976d2'
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              {progress}% do objetivo
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const AlertCard = ({ unreadNotifications }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ mt: 3 }}>
      <Card sx={{ 
        bgcolor: theme?.palette?.warning?.light || '#fff3e0', 
        color: theme?.palette?.warning?.contrastText || '#e65100' 
      }}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationIcon sx={{ mr: 2 }} />
            <Typography variant="body1">
              Você tem {unreadNotifications} notificação{unreadNotifications > 1 ? 'ões' : ''} pendente{unreadNotifications > 1 ? 's' : ''}
            </Typography>
            <Chip 
              label={unreadNotifications} 
              size="small" 
              sx={{ 
                ml: 'auto', 
                bgcolor: theme?.palette?.warning?.main || '#ff9800', 
                color: theme?.palette?.warning?.contrastText || '#fff' 
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

const WelcomeSection = ({ currentUser }) => {
  const theme = useTheme();
  const currentHour = new Date().getHours();
  
  const getGreeting = () => {
    if (currentHour < 12) return 'Bom dia';
    if (currentHour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <Card 
      sx={{ 
        mb: 3,
        background: `linear-gradient(135deg, ${theme?.palette?.primary?.main || '#1976d2'} 0%, ${theme?.palette?.primary?.dark || '#1565c0'} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
              {getGreeting()}, {currentUser?.nome || currentUser?.name || 'Usuário'}!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Bem-vindo ao seu painel de controle
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
              Gerencie suas caixinhas, mensagens e conexões em um só lugar
            </Typography>
          </Box>
          <Avatar
            src={currentUser?.fotoDoPerfil}
            alt={currentUser?.nome || currentUser?.name}
            sx={{
              width: 80,
              height: 80,
              border: '3px solid rgba(255,255,255,0.3)'
            }}
          >
            {(currentUser?.nome || currentUser?.name || 'U').charAt(0).toUpperCase()}
          </Avatar>
        </Box>
      </CardContent>
      
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          zIndex: 0
        }}
      />
    </Card>
  );
};

export const DashboardOverview = ({ 
  data = {},
  currentUser 
}) => {
  const {
    caixinhas = [],
    messages = [],
    notifications = [],
    connections = { friends: [], bestFriends: [] }
  } = data;

  // Calcular métricas
  const totalCaixinhas = caixinhas.length;
  const unreadMessages = messages.filter(m => m.unread).length;
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const totalConnections = (connections.friends?.length || 0) + (connections.bestFriends?.length || 0);
  
  // Calcular saldo total das caixinhas
  const totalSaldo = caixinhas.reduce((acc, caixinha) => acc + (caixinha.saldoTotal || 0), 0);
  
  // Calcular caixinhas ativas (com atividade recente)
  const caixinhasAtivas = caixinhas.filter(c => {
    if (!c.dataFim) return true;
    return new Date(c.dataFim) > new Date();
  }).length;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <WelcomeSection currentUser={currentUser} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Caixinhas"
            value={totalCaixinhas}
            icon={<CaixinhaIcon />}
            color="primary"
            subtitle={`${caixinhasAtivas} ativas`}
            progress={caixinhasAtivas > 0 ? Math.round((caixinhasAtivas / totalCaixinhas) * 100) : 0}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Saldo Total"
            value={formatCurrency(totalSaldo)}
            icon={<WalletIcon />}
            color="success"
            subtitle="Todas as caixinhas"
            trend={totalSaldo > 0 ? 5.2 : 0}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Mensagens"
            value={messages.length}
            icon={<MessageIcon />}
            color="info"
            subtitle={unreadMessages > 0 ? `${unreadMessages} não lidas` : 'Todas lidas'}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Conexões"
            value={totalConnections}
            icon={<PeopleIcon />}
            color="primary"
            subtitle={`${connections.bestFriends?.length || 0} melhores amigos`}
          />
        </Grid>
      </Grid>
      
      {/* Alerts/Status Cards */}
      {unreadNotifications > 0 && (
        <AlertCard unreadNotifications={unreadNotifications} />
      )}
    </Box>
  );
};