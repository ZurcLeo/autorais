import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Tooltip,
  IconButton,
  Typography,
  Badge,
  Menu,
  MenuItem,
  Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { GiLockedChest, GiSettingsKnobs, GiWorld, GiShoppingCart } from "react-icons/gi";
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotifications } from '../../hooks/notification/useNotifications';
import { ThemeControls} from '../../ThemeControls';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../LanguageSwitcher';
import { serviceLocator } from '../../core/services/BaseService';
import UserProfileDropdown from './UserProfileDropdown';
import { coreLogger } from '../../core/logging';
import { LOG_LEVELS } from '../../core/constants/config';
import NavItem from './NavItem';
import { GiConversation, GiThreeFriends } from 'react-icons/gi';

const MODULE_NAME = 'TopNavBar';

const TopNavBar = ({ sidebarOpen, toggleSidebar, isMobile }) => {
  const serviceStore = serviceLocator.get('store').getState()?.auth;
  const notificationsService = serviceLocator.get('store').getState()?.notifications;

  const { isAuthenticated } = serviceStore;
  const { t } = useTranslation();
  const location = useLocation();
  const [anchorElTheme, setAnchorElTheme] = useState(null);
  const isThemeMenuOpen = Boolean(anchorElTheme);
  const navigate = useNavigate();
  const { unreadCount, notifLoading } = useNotifications();
  
console.log('LOGANDO NO TOPNAV', useNotifications())
  const handleNavigation = (path) => {
    navigate(path);
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Navigation from TopNavBar', {
      from: location.pathname,
      to: path
    });
  };

  const handleThemeMenuOpen = (event) => {
    setAnchorElTheme(event.currentTarget);
  };

  const handleThemeMenuClose = () => {
    setAnchorElTheme(null);
  };

  return (
    <AppBar position="fixed" sx={{
      width: { sm: `calc(100% - ${sidebarOpen ? 350 : 150}px)` },
      ml: { sm: `${sidebarOpen ? 280 : 150}px` },
      zIndex: (theme) => theme.zIndex.drawer + 1,
      transition: (theme) => theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleSidebar}
          sx={{ mr: 2, ...(isMobile ? {} : { display: 'none' }) }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {t('app.title')}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isAuthenticated && !notifLoading && (
            <>
              {!isMobile && (
                <>
                  <NavItem
                    icon={<GiConversation />}
                    onClick={() => handleNavigation('/messages')}
                    tooltip={t('topnavbar.messages')}
                  />
                  <NavItem
                    icon={<GiThreeFriends />}
                    onClick={() => handleNavigation('/connections')}
                    tooltip={t('topnavbar.friends')}
                  />
                </>
              )}
              <NavItem
                icon={<GiLockedChest />}
                onClick={() => handleNavigation('/caixinha')}
                tooltip={t('topnavbar.caixinha')}
              />
              <NavItem
                icon={<GiShoppingCart />}
                onClick={() => handleNavigation('/marketplace')}
                tooltip={t('topnavbar.marketplace')}
              />
            </>
          )}

          <Tooltip title={t('common.settings')} arrow>
            <IconButton
              size="large"
              aria-label="theme settings"
              aria-controls="theme-menu"
              aria-haspopup="true"
              onClick={handleThemeMenuOpen}
              color="inherit"
            >
              <GiSettingsKnobs />
            </IconButton>
          </Tooltip>

          <Menu
            id="theme-menu"
            anchorEl={anchorElTheme}
            open={isThemeMenuOpen}
            onClose={handleThemeMenuClose}
            MenuListProps={{
              'aria-labelledby': 'theme-settings-button',
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleThemeMenuClose}>
              <ThemeControls />
            </MenuItem>
          </Menu>

          <Tooltip title={t('topnavbar.notifications')} arrow>
            <IconButton size="large" color="inherit">
              <Badge
                overlap="circular"
                badgeContent={unreadCount > 0 ? unreadCount : null}
                color="error"
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <GiWorld />
              </Badge>
            </IconButton>
          </Tooltip>
          {isAuthenticated ? <UserProfileDropdown /> : <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              color="inherit"
              onClick={() => handleNavigation('/login')}
              sx={{ mx: 1 }}
            >
              {t('topnavbar.login')}
            </Button>
            {/* <Button
              color="inherit"
              variant="outlined"
              onClick={() => handleNavigation('/register')}
              sx={{ mx: 1 }}
            >
              {t('topnavbar.register')}
            </Button> */}
            <LanguageSwitcher />
          </Box>}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavBar;