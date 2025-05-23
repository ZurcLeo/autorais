// Modified UserProfileDropdown.js to include Admin functionality
import React, { useState, useMemo } from 'react';
import { 
  Avatar, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Typography, 
  Badge, 
  Divider,
  Box, 
  Skeleton,
  Tooltip,
  Modal,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import {
  PersonOutline as ProfileIcon,
  NotificationsOutlined as NotificationIcon,
  DashboardOutlined as DashboardIcon,
  ExitToAppOutlined as LogoutIcon,
  SettingsOutlined as SettingsIcon,
  HelpOutlineOutlined as HelpIcon,
  Translate as TranslateIcon,
  Palette as PaletteIcon,
  AdminPanelSettings as AdminIcon,
  DashboardCustomizeSharp as AdminDashboardIcon
} from '@mui/icons-material';
import { useAuth } from '../../providers/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotifications } from '../../providers/NotificationProvider';
import { useTranslation } from 'react-i18next';
import { coreLogger } from '../../core/logging';
import { LOG_LEVELS } from '../../core/constants/config';
import { ThemeControls } from '../../ThemeControls';
import LanguageSwitcher from '../../LanguageSwitcher';

const MODULE_NAME = 'UserProfileDropdown';

// Simplified menu groups structure
const getMenuGroups = (t, currentUser) => [
  {
    id: 'main',
    items: [
      {
        id: 'profile',
        label: t('userprofiledropdown.profile'),
        icon: <ProfileIcon />,
        path: `/profile/${currentUser?.uid}`
      },
      {
        id: 'notifications',
        label: t('userprofiledropdown.notifications'),
        icon: <NotificationIcon />,
        path: '/notifications',
        hasBadge: true
      },
      {
        id: 'dashboard',
        label: t('userprofiledropdown.dashboard'),
        icon: <DashboardIcon />,
        path: '/dashboard'
      }
    ]
  },
  // Add admin section if user is admin
  ...(currentUser?.isOwnerOrAdmin ? [{
    id: 'admin',
    items: [
      {
        id: 'admin',
        label: t('userprofiledropdown.admin'),
        icon: <AdminIcon />,
        isAdmin: true
      }
    ]
  }] : []),
  {
    id: 'support',
    items: [
      {
        id: 'settings',
        label: t('userprofiledropdown.settings'),
        icon: <SettingsIcon />,
        path: '/settings'
      },
      {
        id: 'help',
        label: t('userprofiledropdown.help'),
        icon: <HelpIcon />,
        path: '/help'
      }
    ]
  },
  {
    id: 'logout',
    items: [
      {
        id: 'logout',
        label: t('userprofiledropdown.logout'),
        icon: <LogoutIcon />,
        isLogout: true
      }
    ]
  }
];

const UserProfileDropdown = () => {
  const { currentUser, authLoading, logout } = useAuth();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showThemeControls, setShowThemeControls] = useState(false);
  const [showLanguageSwitcher, setShowLanguageSwitcher] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminTabValue, setAdminTabValue] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();

  // Memoized menu groups
  const menuGroups = useMemo(() => getMenuGroups(t, currentUser), [t, currentUser]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setShowThemeControls(false);
    setShowLanguageSwitcher(false);
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'User menu opened');
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setShowThemeControls(false);
    setShowLanguageSwitcher(false);
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'User menu closed');
  };

  const handleNavigation = (path, isLogoutAction = false, isAdminAction = false) => {
    handleMenuClose();

    if (isLogoutAction) {
      handleLogout();
      return;
    }

    if (isAdminAction) {
      handleAdminModalOpen();
      return;
    }

    if (location.pathname === path) return;

    navigate(path);
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Navigation from user menu', {
      to: path
    });
  };

  const handleLogout = async () => {
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Logout initiated');
    try {
      await logout();
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Logout failed', { 
        error: error.message 
      });
    }
  };

  const toggleThemeControls = (event) => {
    event.stopPropagation();
    setShowThemeControls(!showThemeControls);
    setShowLanguageSwitcher(false);
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Theme controls toggled', {
      visible: !showThemeControls
    });
  };

  const toggleLanguageSwitcher = (event) => {
    event.stopPropagation();
    setShowLanguageSwitcher(!showLanguageSwitcher);
    setShowThemeControls(false);
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Language switcher toggled', {
      visible: !showLanguageSwitcher
    });
  };

  // Admin Modal Handlers
  const handleAdminModalOpen = () => {
    setAdminModalOpen(true);
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Admin modal opened');
  };
  
  const handleAdminModalClose = () => {
    setAdminModalOpen(false);
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Admin modal closed');
  };

  const handleAdminTabChange = (_, newValue) => {
    setAdminTabValue(newValue);
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Admin tab changed', {
      tabIndex: newValue
    });
  };

  const handleAdminInterests = () => {
    navigate('/admin/interests', { replace: true });
    handleAdminModalClose();
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Navigated to admin interests');
  };

  const handleAdminRBAC = () => {
    navigate('/admin/rbac', { replace: true });
    handleAdminModalClose();
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Navigated to admin RBAC');
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
    );
  }

  if (!currentUser) {
    return null;
  }
  
  const displayName = currentUser.name || currentUser.displayName || t('common.user');
  const fotoDoPerfil = currentUser.fotoDoPerfil || currentUser.photoURL;

  return (
    <>
      <Tooltip title={displayName} arrow placement="bottom">
        <IconButton 
          onClick={handleMenuOpen}
          aria-label={t('userprofiledropdown.openMenu')}
          aria-controls="user-menu"
          aria-haspopup="true"
          aria-expanded={Boolean(anchorEl) ? 'true' : 'false'}
          size="medium"
          sx={{ ml: 1 }}
        >
          <Badge
            overlap="circular"
            badgeContent={unreadCount}
            color="error"
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Avatar 
              src={fotoDoPerfil} 
              alt={displayName}
              sx={{
                width: 40,
                height: 40,
                boxShadow: 2,
                border: `2px solid`,
                borderColor: 'background.paper'
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </Avatar>
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { 
            minWidth: 220,
            maxWidth: showThemeControls ? 320 : 280,
            mt: 1
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {displayName}
          </Typography>
          <Typography variant="body2" noWrap>
            {currentUser.email}
          </Typography>
        </Box>
        <Divider />

        {/* Menu Groups */}
        {menuGroups.map((group, groupIndex) => (
          <React.Fragment key={group.id}>
            {group.items.map((item) => (
              <MenuItem 
                key={item.id} 
                onClick={() => handleNavigation(item.path, item.isLogout, item.isAdmin)}
                sx={item.isAdmin ? { color: 'success.main' } : {}}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
                {item.hasBadge && unreadCount > 0 && (
                  <Badge badgeContent={unreadCount} color="error" />
                )}
              </MenuItem>
            ))}
            {groupIndex < menuGroups.length - 1 && <Divider />}
          </React.Fragment>
        ))}
        
        {/* Preferences Section */}
        <Divider />
        <Box sx={{ px: 1, py: 0.5 }}>
          <Typography variant="caption" sx={{ pl: 2 }}>
            {t('userprofiledropdown.preferences')}
          </Typography>
        </Box>
        
        {/* Theme Option */}
        <MenuItem onClick={toggleThemeControls}>
          <ListItemIcon><PaletteIcon /></ListItemIcon>
          <ListItemText primary={t('userprofiledropdown.changeTheme')} />
        </MenuItem>
        
        {/* Theme Controls Panel */}
        {showThemeControls && (
          <Box sx={{ px: 2, py: 1, maxWidth: 300 }}>
            <ThemeControls inMenu={true} />
          </Box>
        )}
        
        {/* Language Option */}
        <MenuItem onClick={toggleLanguageSwitcher}>
          <ListItemIcon><TranslateIcon /></ListItemIcon>
          <ListItemText primary={t('userprofiledropdown.changeLanguage')} />
        </MenuItem>
        
        {/* Language Switcher Panel */}
        {showLanguageSwitcher && (
          <Box sx={{ px: 2, py: 1 }}>
            <LanguageSwitcher inMenu={true} />
          </Box>
        )}
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
    </>
  );
};

export default UserProfileDropdown;