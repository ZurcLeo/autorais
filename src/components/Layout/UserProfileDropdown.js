// src/components/Layout/UserProfileDropdown.js - Versão Melhorada
import React, { useState, useEffect, useMemo } from 'react';
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
  Tooltip
} from '@mui/material';
import {
  PersonOutline as ProfileIcon,
  NotificationsOutlined as NotificationIcon,
  DashboardOutlined as DashboardIcon,
  ExitToAppOutlined as LogoutIcon,
  SettingsOutlined as SettingsIcon,
  HelpOutlineOutlined as HelpIcon,
  Translate as TranslateIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { useAuth } from '../../providers/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import { serviceLocator } from '../../core/services/BaseService';
import { useNotifications } from '../../providers/NotificationProvider';
import { useTranslation } from 'react-i18next';
import { coreLogger } from '../../core/logging';
import { LOG_LEVELS } from '../../core/constants/config';
import { useTheme } from '@mui/material/styles';
import { ThemeControls } from '../../ThemeControls';
import LanguageSwitcher from '../../LanguageSwitcher';

const MODULE_NAME = 'UserProfileDropdown';

// Estrutura agrupada de itens do menu
const getMenuGroups = (t, currentUser) => [
  {
    id: 'main',
    items: [
      {
        id: 'profile',
        label: t('userprofiledropdown.profile'),
        icon: <ProfileIcon />,
        path: `/profile/${currentUser?.uid}`,
        dividerAfter: false
      },
      {
        id: 'notifications',
        label: t('userprofiledropdown.notifications'),
        icon: <NotificationIcon />,
        path: '/notifications',
        hasBadge: true,
        dividerAfter: false
      },
      {
        id: 'dashboard',
        label: t('userprofiledropdown.dashboard'),
        icon: <DashboardIcon />,
        path: '/dashboard',
        dividerAfter: true
      }
    ]
  },
  {
    id: 'support',
    items: [
      {
        id: 'settings',
        label: t('userprofiledropdown.settings'),
        icon: <SettingsIcon />,
        path: '/settings',
        dividerAfter: false
      },
      {
        id: 'help',
        label: t('userprofiledropdown.help'),
        icon: <HelpIcon />,
        path: '/help',
        dividerAfter: true
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
        isLogout: true,
        dividerAfter: false
      }
    ]
  }
];

const UserProfileDropdown = ({ isSidebarCollapsed = false, onAction, notification }) => {
  const {currentUser, authLoading} = useAuth()
  const { t } = useTranslation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showThemeControls, setShowThemeControls] = useState(false);
  const [showLanguageSwitcher, setShowLanguageSwitcher] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { unreadCount } = useNotifications();

  // Memorizar os grupos de menu para evitar recriação a cada render
  const menuGroups = useMemo(() => getMenuGroups(t, currentUser), [t, currentUser]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    // Resetar os estados de exibição dos controles quando o menu é aberto
    setShowThemeControls(false);
    setShowLanguageSwitcher(false);
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'User menu opened');
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Resetar os estados de exibição dos controles quando o menu é fechado
    setShowThemeControls(false);
    setShowLanguageSwitcher(false);
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'User menu closed');
  };

  const handleNavigation = (path, isLogoutAction = false) => {
    handleMenuClose();

    if (isLogoutAction) {
      handleLogout();
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
    event.stopPropagation();  // Evitar que o clique feche o menu
    setShowThemeControls(!showThemeControls);
    setShowLanguageSwitcher(false);
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Theme controls toggled', {
      visible: !showThemeControls
    });
  };

  const toggleLanguageSwitcher = (event) => {
    event.stopPropagation();  // Evitar que o clique feche o menu
    setShowLanguageSwitcher(!showLanguageSwitcher);
    setShowThemeControls(false);
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Language switcher toggled', {
      visible: !showLanguageSwitcher
    });
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
  const userdata = currentUser
  
  const displayName = userdata.name || userdata.displayName || t('common.user');
  const fotoDoPerfil = userdata.fotoDoPerfil || userdata.photoURL;

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
                boxShadow: theme.shadows[2],
                border: `2px solid ${theme.palette.background.paper}`
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
          <Typography variant="subtitle1" fontWeight="bold">
            {displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {currentUser.email}
          </Typography>
        </Box>
        <Divider />

        {/* Opções de menu padrão */}
        {menuGroups.map((group, groupIndex) => (
          <React.Fragment key={group.id}>
            {group.items.map((item) => (
              <MenuItem key={item.id} onClick={() => handleNavigation(item.path, item.isLogout)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </MenuItem>
            ))}
            {groupIndex < menuGroups.length - 1 && <Divider />}
          </React.Fragment>
        ))}
        
        {/* Adicionar nova seção para configurações da UI */}
        <Divider />
        <Box sx={{ px: 1, py: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ pl: 2 }}>
            {t('userprofiledropdown.preferences')}
          </Typography>
        </Box>
        
        {/* Opção para trocar de tema */}
        <MenuItem onClick={toggleThemeControls}>
          <ListItemIcon><PaletteIcon /></ListItemIcon>
          <ListItemText primary={t('userprofiledropdown.changeTheme')} />
        </MenuItem>
        
        {/* Painel de controle de tema que aparece quando clicado */}
        {showThemeControls && (
          <Box sx={{ px: 2, py: 1, maxWidth: 300 }}>
            <ThemeControls />
          </Box>
        )}
        
        {/* Opção para trocar de idioma */}
        <MenuItem onClick={toggleLanguageSwitcher}>
          <ListItemIcon><TranslateIcon /></ListItemIcon>
          <ListItemText primary={t('userprofiledropdown.changeLanguage')} />
        </MenuItem>
        
        {/* Seletor de idioma que aparece quando clicado */}
        {showLanguageSwitcher && (
          <Box sx={{ px: 2, py: 1 }}>
            <LanguageSwitcher isSidebarCollapsed={false} />
          </Box>
        )}
      </Menu>
    </>
  );
};

export default UserProfileDropdown;