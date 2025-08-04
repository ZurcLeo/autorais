import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  AppBar,
  Modal,
  Tabs,
  Tab,
  Toolbar,
  Box,
  IconButton,
  Typography,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  InputBase,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Tooltip,
  useTheme,
  alpha,
  Zoom,
  Fade,
  Slide,
  Breadcrumbs,
  Link,
  Switch,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Popper,
  ClickAwayListener,
  Grow
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Brightness4,
  Brightness7,
  Add as AddIcon,
  Chat as ChatIcon,
  AccountBalance as CaixinhaIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  MoreVert as MoreVertIcon,
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
  Language as LanguageIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Psychology as PsychologyIcon,
  CloudSync as CloudSyncIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Palette as PaletteIcon,
  Translate as TranslateIcon,
  AdminPanelSettings as AdminIcon,
  DashboardCustomizeSharp as AdminDashboardIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { useNotifications } from '../../providers/NotificationProvider';
import { useMessages } from '../../providers/MessageProvider';
import { useTranslation } from 'react-i18next';
import { ThemeControls } from '../../ThemeControls';
import LanguageSwitcher from '../../LanguageSwitcher';
import logoElosCloud from '../../images/logo_eloscloud.jpeg';

// Componente de Logo compacto para TopNavBar
const CompactLogo = ({ isMobile }) => {
  const theme = useTheme();
  
  if (!isMobile) return null;
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mr: 2,
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        '&:hover': {
          transform: 'scale(1.05)'
        }
      }}
      onClick={() => window.location.href = '/dashboard'}
    >
      <Box
        component="img"
        src={logoElosCloud}
        alt="ElosCloud"
        sx={{
          height: 32,
          width: 'auto',
          objectFit: 'contain'
        }}
      />
      <Typography 
        variant="h6" 
        sx={{ 
          ml: 1, 
          fontWeight: 'bold',
          background: `linear-gradient(45deg, ${theme?.palette?.primary?.main || '#1976d2'}, ${theme?.palette?.secondary?.main || '#dc004e'})`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '1rem',
          display: { xs: 'none', sm: 'block' }
        }}
      >
        ElosCloud
      </Typography>
    </Box>
  );
};

// Componente de busca global avançada
const GlobalSearchBar = ({ onSearch, onClose }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  // Implementar busca real no backend
  const performSearch = useCallback(async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    try {
      // TODO: Implementar busca real no backend
      // const searchService = serviceLocator.get('search');
      // const results = await searchService.globalSearch(term);
      
      // Por enquanto, retornar array vazio até implementar busca real
      setSearchResults([]);
      setIsSearching(false);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setIsSearching(false);
    }
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    performSearch(value);
    onSearch?.(value);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      onClose?.();
    }
  };

  useEffect(() => {
    // Focus no input quando abre
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  return (
    <ClickAwayListener onClickAway={onClose}>
      <Paper
        elevation={8}
        sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1300,
          maxWidth: 600,
          mx: 'auto',
          mt: 1,
          background: `linear-gradient(135deg, ${theme?.palette?.background?.paper || '#fff'} 0%, ${alpha(theme?.palette?.background?.paper || '#fff', 0.95)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme?.palette?.divider || 'rgba(0,0,0,0.12)', 0.2)}`
        }}
      >
        {/* Search Input */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme?.palette?.divider || 'rgba(0,0,0,0.12)'}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SearchIcon sx={{ mr: 2, color: 'text.secondary' }} />
            <InputBase
              ref={searchInputRef}
              placeholder="Buscar usuários, caixinhas, mensagens..."
              value={searchTerm}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              sx={{
                flex: 1,
                '& input': {
                  fontSize: '1.1rem',
                  fontWeight: 400
                }
              }}
            />
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Search Results */}
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {isSearching ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">Buscando...</Typography>
            </Box>
          ) : searchResults.length > 0 ? (
            <List>
              {searchResults.map((result) => (
                <ListItem
                  key={`${result.type}-${result.id}`}
                  button
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: alpha(theme?.palette?.primary?.main || '#1976d2', 0.1)
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={result.avatar}>
                      {result.title.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={result.title}
                    secondary={result.subtitle}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      label={result.action} 
                      size="small" 
                      variant="outlined"
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : searchTerm ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Nenhum resultado encontrado para "{searchTerm}"
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Buscas recentes
              </Typography>
              {/* Histórico de buscas aqui */}
              <Typography variant="body2" color="text.secondary">
                Nenhuma busca recente
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </ClickAwayListener>
  );
};

// Componente de notificações avançado
const NotificationsPanel = ({ anchorEl, open, onClose }) => {
  const theme = useTheme();
  const { notifications: realNotifications, markAsRead } = useNotifications();
  const [filter, setFilter] = useState('all');

  // Usar notificações reais do provider
  const notifications = realNotifications || [];

  // Função para mapear tipo de notificação
  const getNotificationType = (notification) => {
    if (notification.type) return notification.type;
    // Inferir tipo baseado no conteúdo se não estiver explícito
    if (notification.title?.toLowerCase().includes('mensagem')) return 'message';
    if (notification.title?.toLowerCase().includes('caixinha')) return 'caixinha';
    return 'system';
  };

  // Função para formatar tempo relativo
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Agora';
    
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  const filteredNotifications = notifications.filter(notif => {
    const type = getNotificationType(notif);
    if (filter === 'unread') return !notif.read;
    if (filter === 'messages') return type === 'message';
    if (filter === 'caixinhas') return type === 'caixinha';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      transition
      sx={{ zIndex: 1300 }}
    >
      {({ TransitionProps }) => (
        <Grow {...TransitionProps} timeout={200}>
          <Paper
            elevation={8}
            sx={{
              width: 400,
              maxHeight: 500,
              background: `linear-gradient(135deg, ${theme?.palette?.background?.paper || '#fff'} 0%, ${alpha(theme?.palette?.background?.paper || '#fff', 0.95)} 100%)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme?.palette?.divider || 'rgba(0,0,0,0.12)', 0.2)}`
            }}
          >
            {/* Header */}
            <Box sx={{ 
              p: 2, 
              borderBottom: `1px solid ${theme?.palette?.divider || 'rgba(0,0,0,0.12)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Typography variant="h6" fontWeight="bold">
                Notificações
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label={`${unreadCount} novas`}
                  size="small"
                  color="primary"
                  variant={filter === 'unread' ? 'filled' : 'outlined'}
                  onClick={() => setFilter(filter === 'unread' ? 'all' : 'unread')}
                />
                <IconButton size="small" onClick={onClose}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Filters */}
            <Box sx={{ p: 1, borderBottom: `1px solid ${theme?.palette?.divider || 'rgba(0,0,0,0.12)'}` }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[
                  { key: 'all', label: 'Todas' },
                  { key: 'messages', label: 'Mensagens' },
                  { key: 'caixinhas', label: 'Caixinhas' }
                ].map((filterOption) => (
                  <Chip
                    key={filterOption.key}
                    label={filterOption.label}
                    size="small"
                    variant={filter === filterOption.key ? 'filled' : 'outlined'}
                    onClick={() => setFilter(filterOption.key)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>

            {/* Notifications List */}
            <List sx={{ p: 0, maxHeight: 300, overflow: 'auto' }}>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => {
                  const notificationType = getNotificationType(notification);
                  return (
                    <ListItem
                      key={notification.id || notification._id}
                      button
                      sx={{
                        bgcolor: notification.read ? 'transparent' : alpha(theme?.palette?.primary?.main || '#1976d2', 0.05),
                        borderLeft: notification.read ? 'none' : `3px solid ${theme?.palette?.primary?.main || '#1976d2'}`,
                        '&:hover': {
                          bgcolor: alpha(theme?.palette?.action?.hover || 'rgba(0,0,0,0.04)', 0.8)
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={notification.avatar || notification.senderPhoto}>
                          {notificationType === 'message' ? <ChatIcon /> : 
                           notificationType === 'caixinha' ? <CaixinhaIcon /> : <NotificationsIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={notification.title || notification.message}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {notification.content || notification.body || notification.description || ''}
                            </Typography>
                            <Typography variant="caption" color="primary">
                              {formatRelativeTime(notification.timestamp || notification.createdAt || notification.time)}
                            </Typography>
                          </Box>
                        }
                        primaryTypographyProps={{
                          fontWeight: notification.read ? 400 : 600,
                          fontSize: '0.95rem'
                        }}
                      />
                      {!notification.read && (
                        <ListItemSecondaryAction>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Marcar como lida usando função do provider
                              if (markAsRead) {
                                markAsRead(notification.id || notification._id);
                              }
                            }}
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  );
                })
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    {filter === 'unread' ? 'Nenhuma notificação não lida' : 
                     filter === 'messages' ? 'Nenhuma notificação de mensagens' :
                     filter === 'caixinhas' ? 'Nenhuma notificação de caixinhas' :
                     'Nenhuma notificação'}
                  </Typography>
                </Box>
              )}
            </List>

            {/* Footer */}
            <Box sx={{ p: 2, borderTop: `1px solid ${theme?.palette?.divider || 'rgba(0,0,0,0.12)'}` }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  fullWidth 
                  variant="text" 
                  color="primary"
                  onClick={() => {
                    // Navegar para página de notificações
                    window.location.href = '/notifications';
                    onClose();
                  }}
                >
                  Ver todas
                </Button>
                {unreadCount > 0 && (
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => {
                      // Marcar todas como lidas
                      notifications.filter(n => !n.read).forEach(notification => {
                        if (markAsRead) {
                          markAsRead(notification.id || notification._id);
                        }
                      });
                    }}
                  >
                    Marcar todas
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Grow>
      )}
    </Popper>
  );
};

// Componente de Quick Actions
const QuickActionsMenu = ({ anchorEl, open, onClose }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const quickActions = [
    {
      icon: <CaixinhaIcon />,
      label: 'Nova Caixinha',
      description: 'Criar uma nova caixinha colaborativa',
      action: () => navigate('/caixinha/nova'),
      color: 'primary'
    },
    {
      icon: <ChatIcon />,
      label: 'Nova Conversa',
      description: 'Iniciar conversa com amigos',
      action: () => navigate('/messages'),
      color: 'info'
    },
    {
      icon: <PersonIcon />,
      label: 'Adicionar Amigo',
      description: 'Conectar-se com novos usuários',
      action: () => navigate('/connections'),
      color: 'success'
    }
  ];

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      PaperProps={{
        elevation: 8,
        sx: {
          mt: 1,
          background: `linear-gradient(135deg, ${theme?.palette?.background?.paper || '#fff'} 0%, ${alpha(theme?.palette?.background?.paper || '#fff', 0.95)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme?.palette?.divider || 'rgba(0,0,0,0.12)', 0.2)}`,
          minWidth: 280
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
          Ações Rápidas
        </Typography>
        {quickActions.map((action, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              action.action();
              onClose();
            }}
            sx={{
              p: 2,
              borderRadius: 1,
              mb: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha(theme?.palette?.[action.color]?.main || '#1976d2', 0.1),
                transform: 'translateX(4px)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Avatar
                sx={{
                  bgcolor: alpha(theme?.palette?.[action.color]?.main || '#1976d2', 0.1),
                  color: theme?.palette?.[action.color]?.main || '#1976d2',
                  mr: 2,
                  width: 40,
                  height: 40
                }}
              >
                {action.icon}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight="medium">
                  {action.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {action.description}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Box>
    </Menu>
  );
};

// Componente de Breadcrumbs inteligente
const SmartBreadcrumbs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    
    const breadcrumbData = {
      '': { label: 'Início', icon: <HomeIcon /> },
      'dashboard': { label: 'Dashboard', icon: <HomeIcon /> },
      'caixinha': { label: 'Caixinhas', icon: <CaixinhaIcon /> },
      'messages': { label: 'Mensagens', icon: <ChatIcon /> },
      'connections': { label: 'Conexões', icon: <PersonIcon /> },
      'profile': { label: 'Perfil', icon: <PersonIcon /> },
      'notifications': { label: 'Notificações', icon: <NotificationsIcon /> }
    };

    return pathnames.map((pathname, index) => {
      const to = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      const data = breadcrumbData[pathname] || { label: pathname, icon: null };

      return {
        to,
        label: data.label,
        icon: data.icon,
        isLast
      };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length === 0) return null;

  return (
    <Breadcrumbs
      separator={<ChevronRightIcon fontSize="small" />}
      sx={{ display: { xs: 'none', sm: 'flex' } }}
    >
      <Link
        component="button"
        variant="body2"
        color="inherit"
        onClick={() => navigate('/dashboard')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' }
        }}
      >
        <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
        Início
      </Link>
      
      {breadcrumbs.map((breadcrumb) => (
        <Link
          key={breadcrumb.to}
          component="button"
          variant="body2"
          color={breadcrumb.isLast ? 'text.primary' : 'inherit'}
          onClick={() => !breadcrumb.isLast && navigate(breadcrumb.to)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            fontWeight: breadcrumb.isLast ? 600 : 400,
            '&:hover': breadcrumb.isLast ? {} : { textDecoration: 'underline' }
          }}
        >
          {breadcrumb.icon && (
            <Box sx={{ mr: 0.5, fontSize: 16 }}>{breadcrumb.icon}</Box>
          )}
          {breadcrumb.label}
        </Link>
      ))}
    </Breadcrumbs>
  );
};

// Componente principal do TopNavBar moderno
const ModernTopNavBar = ({ 
  sidebarOpen, 
  toggleSidebar, 
  isMobile, 
  sidebarWidth 
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const { notifications } = useNotifications();
  const { t } = useTranslation();
  
  // Estados dos menus e modals
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [quickActionsAnchor, setQuickActionsAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Estados para tema e idioma
  const [showThemeControls, setShowThemeControls] = useState(false);
  const [showLanguageSwitcher, setShowLanguageSwitcher] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminTabValue, setAdminTabValue] = useState(0);

  // Detectar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadNotifications = notifications?.filter(n => !n.read)?.length || 0;

  // Handlers para tema e idioma
  const toggleThemeControls = (event) => {
    event.stopPropagation();
    setShowThemeControls(!showThemeControls);
    setShowLanguageSwitcher(false);
  };

  const toggleLanguageSwitcher = (event) => {
    event.stopPropagation();
    setShowLanguageSwitcher(!showLanguageSwitcher);
    setShowThemeControls(false);
  };

  // Admin handlers
  const handleAdminModalOpen = () => {
    setAdminModalOpen(true);
    setProfileAnchor(null);
  };
  
  const handleAdminModalClose = () => {
    setAdminModalOpen(false);
  };

  const handleAdminTabChange = (_, newValue) => {
    setAdminTabValue(newValue);
  };

  const handleAdminInterests = () => {
    navigate('/admin/interests', { replace: true });
    handleAdminModalClose();
  };

  const handleAdminRBAC = () => {
    navigate('/admin/rbac', { replace: true });
    handleAdminModalClose();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`,
        ml: isMobile ? 0 : `${sidebarWidth}px`,
        bgcolor: alpha(theme?.palette?.background?.paper || '#fff', 0.8),
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${alpha(theme?.palette?.divider || 'rgba(0,0,0,0.12)', 0.2)}`,
        color: theme?.palette?.text?.primary || 'rgba(0,0,0,0.87)',
        transition: theme?.transitions?.create(['width', 'margin'], {
          easing: theme?.transitions?.easing?.sharp,
          duration: theme?.transitions?.duration?.leavingScreen,
        }) || 'all 0.3s ease'
      }}
    >
      <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 3 } }}>
        {/* Menu Button */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={toggleSidebar}
          sx={{ 
            mr: 2,
            display: isMobile ? 'block' : 'none'
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo para mobile */}
        <CompactLogo isMobile={isMobile} />

        {/* Breadcrumbs */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <SmartBreadcrumbs />
        </Box>

        {/* Search Bar */}
        <Box sx={{ position: 'relative', mx: 2, display: { xs: 'none', md: 'block' } }}>
          <Tooltip title="Buscar (Ctrl+K)">
            <Paper
              onClick={() => setSearchOpen(true)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: 300,
                height: 40,
                px: 2,
                cursor: 'pointer',
                bgcolor: alpha(theme?.palette?.action?.hover || 'rgba(0,0,0,0.04)', 0.5),
                border: `1px solid ${alpha(theme?.palette?.divider || 'rgba(0,0,0,0.12)', 0.3)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: alpha(theme?.palette?.action?.hover || 'rgba(0,0,0,0.04)', 0.8),
                  borderColor: theme?.palette?.primary?.main || '#1976d2'
                }
              }}
            >
              <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Buscar...
              </Typography>
              <Box sx={{ ml: 'auto' }}>
                <Chip label="Ctrl+K" size="small" variant="outlined" />
              </Box>
            </Paper>
          </Tooltip>

          {searchOpen && (
            <GlobalSearchBar
              onSearch={() => {}}
              onClose={() => setSearchOpen(false)}
            />
          )}
        </Box>

        {/* Mobile Search Button */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <IconButton
            color="inherit"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon />
          </IconButton>
        </Box>

        {/* Connection Status */}
        <Tooltip title={isOnline ? 'Online' : 'Offline'}>
          <IconButton color="inherit" size="small">
            {isOnline ? (
              <WifiIcon sx={{ color: 'success.main' }} />
            ) : (
              <WifiOffIcon sx={{ color: 'error.main' }} />
            )}
          </IconButton>
        </Tooltip>

        {/* Quick Actions */}
        <Tooltip title="Ações Rápidas">
          <IconButton
            color="inherit"
            onClick={(e) => setQuickActionsAnchor(e.currentTarget)}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>

        <QuickActionsMenu
          anchorEl={quickActionsAnchor}
          open={Boolean(quickActionsAnchor)}
          onClose={() => setQuickActionsAnchor(null)}
        />

        {/* Notifications */}
        <Tooltip title="Notificações">
          <IconButton
            color="inherit"
            onClick={(e) => setNotificationsAnchor(e.currentTarget)}
          >
            <Badge badgeContent={unreadNotifications} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <NotificationsPanel
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={() => setNotificationsAnchor(null)}
        />

        {/* Profile Menu */}
        <Tooltip title="Perfil">
          <IconButton
            onClick={(e) => setProfileAnchor(e.currentTarget)}
            sx={{ ml: 1 }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: isOnline ? 'success.main' : 'error.main',
                    border: '2px solid white'
                  }}
                />
              }
            >
              <Avatar
                src={currentUser?.fotoDoPerfil}
                sx={{ width: 32, height: 32 }}
              >
                {(currentUser?.nome || 'U').charAt(0).toUpperCase()}
              </Avatar>
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Profile Menu Dropdown */}
        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={() => {
            setProfileAnchor(null);
            setShowThemeControls(false);
            setShowLanguageSwitcher(false);
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 8,
            sx: {
              mt: 1,
              minWidth: 280,
              maxWidth: showThemeControls || showLanguageSwitcher ? 380 : 320,
              background: `linear-gradient(135deg, ${theme?.palette?.background?.paper || '#fff'} 0%, ${alpha(theme?.palette?.background?.paper || '#fff', 0.95)} 100%)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme?.palette?.divider || 'rgba(0,0,0,0.12)', 0.2)}`
            }
          }}
        >
          {/* Profile Header */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme?.palette?.divider || 'rgba(0,0,0,0.12)'}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={currentUser?.fotoDoPerfil}
                sx={{ width: 48, height: 48 }}
              >
                {(currentUser?.nome || 'U').charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {currentUser?.nome || 'Usuário'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentUser?.email || 'Email não disponível'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Main Menu Items */}
          <MenuItem onClick={() => navigate(`/profile/${currentUser?.uid}`)}>
            <PersonIcon sx={{ mr: 2 }} />
            {t('userprofiledropdown.profile') || 'Meu Perfil'}
          </MenuItem>
          
          <MenuItem onClick={() => navigate('/notifications')}>
            <NotificationsIcon sx={{ mr: 2 }} />
            {t('userprofiledropdown.notifications') || 'Notificações'}
            {unreadNotifications > 0 && (
              <Badge badgeContent={unreadNotifications} color="error" sx={{ ml: 'auto' }} />
            )}
          </MenuItem>

          <MenuItem onClick={() => navigate('/dashboard')}>
            <HomeIcon sx={{ mr: 2 }} />
            {t('userprofiledropdown.dashboard') || 'Dashboard'}
          </MenuItem>

          {/* Admin Section */}
          {currentUser?.isOwnerOrAdmin && (
            <>
              <Divider />
              <MenuItem onClick={handleAdminModalOpen} sx={{ color: 'success.main' }}>
                <AdminIcon sx={{ mr: 2 }} />
                {t('userprofiledropdown.admin') || 'Administração'}
              </MenuItem>
            </>
          )}

          <Divider />

          {/* Settings */}
          <MenuItem onClick={() => navigate('/settings')}>
            <SettingsIcon sx={{ mr: 2 }} />
            {t('userprofiledropdown.settings') || 'Configurações'}
          </MenuItem>

          {/* Preferences Section */}
          <Box sx={{ px: 1, py: 0.5 }}>
            <Typography variant="caption" sx={{ pl: 2, color: 'text.secondary' }}>
              {t('userprofiledropdown.preferences') || 'Preferências'}
            </Typography>
          </Box>
          
          {/* Theme Controls */}
          <MenuItem onClick={toggleThemeControls}>
            <PaletteIcon sx={{ mr: 2 }} />
            {t('userprofiledropdown.changeTheme') || 'Alterar Tema'}
          </MenuItem>
          
          {showThemeControls && (
            <Box sx={{ px: 2, py: 1, maxWidth: 350 }}>
              <ThemeControls inMenu={true} />
            </Box>
          )}
          
          {/* Language Switcher */}
          <MenuItem onClick={toggleLanguageSwitcher}>
            <TranslateIcon sx={{ mr: 2 }} />
            {t('userprofiledropdown.changeLanguage') || 'Alterar Idioma'}
          </MenuItem>
          
          {showLanguageSwitcher && (
            <Box sx={{ px: 2, py: 1 }}>
              <LanguageSwitcher inMenu={true} />
            </Box>
          )}

          <Divider />

          {/* Logout */}
          <MenuItem onClick={signOut}>
            <LogoutIcon sx={{ mr: 2 }} />
            {t('userprofiledropdown.logout') || 'Sair'}
          </MenuItem>
        </Menu>

        {/* Admin Modal */}
        <Modal 
          open={adminModalOpen} 
          onClose={handleAdminModalClose}
          aria-labelledby="admin-modal-title"
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2
            }}
          >
            <Typography variant="h6" component="h2" id="admin-modal-title" sx={{ mb: 2 }}>
              <AdminDashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Painel Administrativo
            </Typography>
            
            <Tabs value={adminTabValue} onChange={handleAdminTabChange}>
              <Tab label="Interesses" id="tab-0" aria-controls="tabpanel-0" />
              <Tab label="Usuários" id="tab-1" aria-controls="tabpanel-1" />
              <Tab label="RBAC" id="tab-2" aria-controls="tabpanel-2" />
            </Tabs>
            
            <Box role="tabpanel" hidden={adminTabValue !== 0} id="tabpanel-0" aria-labelledby="tab-0" mt={2}>
              <Typography>Administrar Interesses</Typography>
              <Button onClick={handleAdminInterests} variant="contained" sx={{ mt: 1 }}>
                Gerenciar
              </Button>
            </Box>
            
            <Box role="tabpanel" hidden={adminTabValue !== 1} id="tabpanel-1" aria-labelledby="tab-1" mt={2}>
              <Typography>Administrar Usuários</Typography>
            </Box>
            
            <Box role="tabpanel" hidden={adminTabValue !== 2} id="tabpanel-2" aria-labelledby="tab-2" mt={2}>
              <Typography>Controle de Acesso Baseado em Roles (RBAC)</Typography>
              <Button onClick={handleAdminRBAC} variant="contained" sx={{ mt: 1 }}>
                Gerenciar
              </Button>
            </Box>
          </Box>
        </Modal>
      </Toolbar>
    </AppBar>
  );
};

export default ModernTopNavBar;