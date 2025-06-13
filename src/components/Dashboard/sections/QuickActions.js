import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
  useTheme,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Chat as ChatIcon,
  Notifications as NotificationIcon,
  People as PeopleIcon,
  AccountBalance as CaixinhaIcon,
  Search as SearchIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QuickActionButton = ({ 
  icon, 
  label, 
  onClick, 
  color = 'primary', 
  variant = 'contained',
  disabled = false,
  tooltip
}) => {
  const theme = useTheme();
  
  const button = (
    <Button
      variant={variant}
      color={color}
      startIcon={icon}
      onClick={onClick}
      disabled={disabled}
      fullWidth
      sx={{
        p: 2,
        minHeight: 56,
        borderRadius: 2,
        textTransform: 'none',
        fontSize: '1rem',
        fontWeight: 500,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme?.shadows?.[8] || '0px 8px 16px rgba(0,0,0,0.15)'
        }
      }}
    >
      {label}
    </Button>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        {button}
      </Tooltip>
    );
  }

  return button;
};

const FloatingActionButton = ({ icon, onClick, color = 'primary', tooltip }) => {
  const fab = (
    <Fab
      color={color}
      onClick={onClick}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.1)'
        }
      }}
    >
      {icon}
    </Fab>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        {fab}
      </Tooltip>
    );
  }

  return fab;
};

export const QuickActions = ({ 
  showFloatingAction = true,
  recentActions = [],
  customActions = []
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Ações principais
  const primaryActions = [
    {
      id: 'nova-caixinha',
      label: 'Nova Caixinha',
      icon: <CaixinhaIcon />,
      onClick: () => navigate('/caixinha/nova'),
      tooltip: 'Criar uma nova caixinha para gerenciar recursos'
    },
    {
      id: 'nova-conversa',
      label: 'Nova Conversa',
      icon: <ChatIcon />,
      onClick: () => navigate('/messages'),
      tooltip: 'Iniciar uma nova conversa com seus contatos'
    },
    {
      id: 'adicionar-amigo',
      label: 'Adicionar Amigo',
      icon: <PeopleIcon />,
      onClick: () => navigate('/connections'),
      tooltip: 'Conectar-se com novos usuários'
    },
    {
      id: 'buscar',
      label: 'Buscar',
      icon: <SearchIcon />,
      onClick: () => {
        // Implementar busca global
        console.log('Abrir busca global');
      },
      variant: 'outlined',
      tooltip: 'Buscar por caixinhas, pessoas ou conteúdo'
    }
  ];

  // Ações secundárias
  const secondaryActions = [
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: <SettingsIcon />,
      onClick: () => navigate('/profile/' + getCurrentUserId()),
      variant: 'outlined'
    },
    {
      id: 'notificacoes',
      label: 'Ver Notificações',
      icon: <NotificationIcon />,
      onClick: () => navigate('/notifications'),
      variant: 'outlined'
    }
  ];

  // Função auxiliar para obter ID do usuário atual
  const getCurrentUserId = () => {
    // Esta função deve ser implementada baseada no seu contexto de auth
    return 'current-user-id'; // placeholder
  };

  // Combinar todas as ações
  const allActions = [...primaryActions, ...customActions];

  return (
    <>
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Ações Rápidas
          </Typography>
          
          {/* Ações Principais */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {allActions.map((action) => (
              <Grid item xs={12} sm={6} md={3} key={action.id}>
                <QuickActionButton {...action} />
              </Grid>
            ))}
          </Grid>

          {/* Ações Secundárias */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexWrap: 'wrap',
            pt: 2,
            borderTop: `1px solid ${theme?.palette?.divider || 'rgba(0,0,0,0.12)'}`
          }}>
            {secondaryActions.map((action) => (
              <QuickActionButton key={action.id} {...action} />
            ))}
          </Box>

          {/* Ações Recentes */}
          {recentActions.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Ações Recentes
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {recentActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    size="small"
                    startIcon={action.icon}
                    onClick={action.onClick}
                    sx={{ borderRadius: 20 }}
                  >
                    {action.label}
                  </Button>
                ))}
              </Box>
            </Box>
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
  const defaultActions = [
    {
      id: 'nova-caixinha',
      label: 'Nova Caixinha',
      icon: <CaixinhaIcon />,
      onClick: () => console.log('Nova caixinha')
    },
    {
      id: 'nova-conversa',
      label: 'Conversa',
      icon: <ChatIcon />,
      onClick: () => console.log('Nova conversa')
    }
  ];

  const allActions = actions.length > 0 ? actions : defaultActions;

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      {allActions.map((action) => (
        <Button
          key={action.id}
          variant="contained"
          startIcon={action.icon}
          onClick={action.onClick}
          sx={{ borderRadius: 20 }}
        >
          {action.label}
        </Button>
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