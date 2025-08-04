import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
  useTheme,
  Tooltip,
  Fab,
  IconButton,
  Chip,
  Paper,
  Fade,
  Zoom
} from '@mui/material';
import {
  Add as AddIcon,
  Chat as ChatIcon,
  Notifications as NotificationIcon,
  People as PeopleIcon,
  AccountBalance as CaixinhaIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QuickActionCard = ({ 
  icon, 
  label, 
  onClick, 
  color = 'primary', 
  disabled = false,
  tooltip,
  compact = false
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };
  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);

  const cardContent = (
    <Paper
      elevation={isHovered ? 8 : 2}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={onClick}
      sx={{
        p: compact ? 2 : 3,
        minHeight: compact ? 80 : 100,
        borderRadius: 3,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: `linear-gradient(135deg, ${theme.palette[color]?.main || theme.palette.primary.main}15, ${theme.palette[color]?.main || theme.palette.primary.main}05)`,
        border: `1px solid ${theme.palette[color]?.main || theme.palette.primary.main}20`,
        opacity: disabled ? 0.6 : 1,
        transform: isPressed ? 'scale(0.98)' : isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        '&:hover': {
          borderColor: `${theme.palette[color]?.main || theme.palette.primary.main}40`,
          background: `linear-gradient(135deg, ${theme.palette[color]?.main || theme.palette.primary.main}25, ${theme.palette[color]?.main || theme.palette.primary.main}10)`,
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 1
        }}
      >
        <Box
          sx={{
            color: theme.palette[color]?.main || theme.palette.primary.main,
            transition: 'all 0.3s ease',
            transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
            fontSize: compact ? '1.5rem' : '2rem'
          }}
        >
          {icon}
        </Box>
        <Typography
          variant={compact ? 'caption' : 'body2'}
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            textAlign: 'center',
            fontSize: compact ? '0.75rem' : '0.875rem',
            opacity: isHovered ? 1 : 0.8,
            transition: 'opacity 0.3s ease'
          }}
        >
          {label}
        </Typography>
      </Box>
    </Paper>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow placement="top">
        {cardContent}
      </Tooltip>
    );
  }

  return cardContent;
};

const FloatingActionButton = ({ icon, onClick, color = 'primary', tooltip }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  const fab = (
    <Zoom in={isVisible}>
      <Fab
        color={color}
        onClick={onClick}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          background: `linear-gradient(135deg, ${color === 'primary' ? '#1976d2' : color}, ${color === 'primary' ? '#42a5f5' : color})`,
          '&:hover': {
            transform: 'scale(1.15) rotate(15deg)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          },
          '&:active': {
            transform: 'scale(1.05)'
          }
        }}
      >
        {icon}
      </Fab>
    </Zoom>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow placement="left">
        {fab}
      </Tooltip>
    );
  }

  return fab;
};

export const QuickActions = ({ 
  showFloatingAction = true,
  recentActions = [],
  customActions = [],
  compact = false
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showSecondary, setShowSecondary] = useState(false);

  // Ações principais com cores específicas
  const primaryActions = [
    {
      id: 'nova-caixinha',
      label: 'Nova Caixinha',
      icon: <CaixinhaIcon />,
      onClick: () => navigate('/caixinha/nova'),
      tooltip: 'Criar uma nova caixinha para gerenciar recursos',
      color: 'primary'
    },
    {
      id: 'nova-conversa',
      label: 'Nova Conversa',
      icon: <ChatIcon />,
      onClick: () => navigate('/messages'),
      tooltip: 'Iniciar uma nova conversa com seus contatos',
      color: 'success'
    },
    {
      id: 'adicionar-amigo',
      label: 'Adicionar Amigo',
      icon: <PeopleIcon />,
      onClick: () => navigate('/connections'),
      tooltip: 'Conectar-se com novos usuários',
      color: 'info'
    },
    {
      id: 'buscar',
      label: 'Buscar',
      icon: <SearchIcon />,
      onClick: () => {
        console.log('Abrir busca global');
      },
      tooltip: 'Buscar por caixinhas, pessoas ou conteúdo',
      color: 'warning'
    }
  ];

  // Ações secundárias
  const secondaryActions = [
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: <SettingsIcon />,
      onClick: () => navigate('/profile/' + getCurrentUserId()),
      color: 'secondary'
    },
    {
      id: 'notificacoes',
      label: 'Notificações',
      icon: <NotificationIcon />,
      onClick: () => navigate('/notifications'),
      color: 'error'
    }
  ];

  // Função auxiliar para obter ID do usuário atual
  const getCurrentUserId = () => {
    return 'current-user-id';
  };

  // Combinar todas as ações
  const allActions = [...primaryActions, ...customActions];

  return (
    <>
      <Card 
        elevation={0}
        sx={{ 
          mb: 4,
          background: 'transparent',
          border: 'none'
        }}
      >
        <CardContent sx={{ p: compact ? 2 : 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 3
          }}>
            <Typography 
              variant={compact ? "subtitle1" : "h6"} 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                backgroundClip: 'text',
                color: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Ações Rápidas
            </Typography>
            
            {!compact && (
              <IconButton
                onClick={() => setShowSecondary(!showSecondary)}
                sx={{
                  transition: 'all 0.3s ease',
                  transform: showSecondary ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              >
                <MoreIcon />
              </IconButton>
            )}
          </Box>
          
          {/* Ações Principais */}
          <Grid container spacing={compact ? 1.5 : 2} sx={{ mb: 2 }}>
            {allActions.map((action, index) => (
              <Grid item xs={6} sm={3} key={action.id}>
                <Fade in={true} timeout={300 + (index * 100)}>
                  <div>
                    <QuickActionCard 
                      {...action} 
                      compact={compact}
                    />
                  </div>
                </Fade>
              </Grid>
            ))}
          </Grid>

          {/* Ações Secundárias */}
          <Fade in={showSecondary || compact}>
            <Box sx={{ 
              display: showSecondary || compact ? 'flex' : 'none', 
              gap: 1.5,
              flexWrap: 'wrap',
              pt: 2,
              borderTop: showSecondary ? `1px solid ${theme.palette.divider}` : 'none'
            }}>
              {secondaryActions.map((action, index) => (
                <Fade in={showSecondary || compact} timeout={200 + (index * 100)} key={action.id}>
                  <Box sx={{ flex: '1 1 150px' }}>
                    <QuickActionCard 
                      {...action} 
                      compact={true}
                    />
                  </Box>
                </Fade>
              ))}
            </Box>
          </Fade>

          {/* Ações Recentes */}
          {recentActions.length > 0 && (
            <Fade in={true} timeout={600}>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                  Recentes
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {recentActions.map((action, index) => (
                    <Chip
                      key={index}
                      icon={action.icon}
                      label={action.label}
                      onClick={action.onClick}
                      variant="outlined"
                      clickable
                      sx={{
                        borderRadius: 20,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: theme.shadows[4]
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Fade>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      {showFloatingAction && (
        <FloatingActionButton
          icon={<AddIcon />}
          onClick={() => navigate('/caixinha/nova')}
          tooltip="Criar Nova Caixinha"
        />
      )}
    </>
  );
};

// Componente de Quick Actions mais compacto para usar em outras páginas
export const QuickActionsCompact = ({ actions = [] }) => {
  const navigate = useNavigate();
  
  const defaultActions = [
    {
      id: 'nova-caixinha',
      label: 'Nova Caixinha',
      icon: <CaixinhaIcon />,
      onClick: () => navigate('/caixinha/nova'),
      color: 'primary'
    },
    {
      id: 'nova-conversa',
      label: 'Conversa',
      icon: <ChatIcon />,
      onClick: () => navigate('/messages'),
      color: 'success'
    },
    {
      id: 'adicionar-amigo',
      label: 'Amigos',
      icon: <PeopleIcon />,
      onClick: () => navigate('/connections'),
      color: 'info'
    }
  ];

  const allActions = actions.length > 0 ? actions : defaultActions;

  return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
      {allActions.map((action, index) => (
        <Fade in={true} timeout={200 + (index * 100)} key={action.id}>
          <Box sx={{ flex: '1 1 120px', minWidth: 120 }}>
            <QuickActionCard 
              {...action} 
              compact={true}
            />
          </Box>
        </Fade>
      ))}
    </Box>
  );
};

// Hook para gerenciar ações recentes
export const useRecentActions = () => {
  const [recentActions, setRecentActions] = React.useState([]);

  const addRecentAction = React.useCallback((action) => {
    setRecentActions(prev => {
      // Remove ação duplicada se existir
      const filtered = prev.filter(a => a.id !== action.id);
      // Adiciona no início e limita a 5 ações
      return [action, ...filtered].slice(0, 5);
    });
  }, []);

  const clearRecentActions = React.useCallback(() => {
    setRecentActions([]);
  }, []);

  return {
    recentActions,
    addRecentAction,
    clearRecentActions
  };
};