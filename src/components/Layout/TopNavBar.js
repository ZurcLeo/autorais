import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Tooltip,
  IconButton,
  Typography,
  Button,
  Menu,
  MenuItem,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { GiLockedChest, GiShoppingCart, GiConversation, GiThreeFriends } from "react-icons/gi";
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../LanguageSwitcher';
import UserProfileDropdown from './UserProfileDropdown';
import { coreLogger } from '../../core/logging';
import { LOG_LEVELS } from '../../core/constants/config';
import NavItem from './NavItem';
import { useAuth } from '../../providers/AuthProvider';

const MODULE_NAME = 'TopNavBar';

const TopNavBar = ({ sidebarOpen, toggleSidebar, isMobile }) => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // State for mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = React.useRef(null);
  
  const handleMobileMenuToggle = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      toggleSidebar();
    }
  };
  
  // Close mobile menu on route change
  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [location.pathname]);

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Navigation from TopNavBar', {
      from: location.pathname,
      to: path
    });
  };

  return (
    <AppBar 
      position="fixed"
      elevation={2}
      sx={{
        width: { sm: `calc(100% - ${sidebarOpen ? 280 : 80}px)` },
        ml: { sm: `${sidebarOpen ? 280 : 80}px` },
        zIndex: theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
        transition: theme.transitions.create(
          ['width', 'margin'], 
          {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }
        ),
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        },
        '&:hover': {
          boxShadow: 4,
        }
      }}
    >
      <Toolbar>
        <IconButton
          ref={menuButtonRef}
          color="inherit"
          aria-label={sidebarOpen ? "collapse sidebar" : "expand sidebar"}
          edge="start"
          onClick={handleMobileMenuToggle}
          sx={{
            mr: 2,
            display: isMobile ? 'flex' : 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'action.hover',
              transform: 'scale(1.05)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            }
          }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          {t('app.title')}
        </Typography>

        {/* Mobile menu */}
        {isMobile && (
          <Menu
            anchorEl={menuButtonRef.current}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            keepMounted
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            PaperProps={{
              elevation: 3,
              sx: {
                bgcolor: 'background.paper',
                color: 'text.primary',
                borderRadius: 1,
                minWidth: 180,
                mt: 1,
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.5,
                  borderRadius: 0.5,
                  mx: 0.5,
                  my: 0.25,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  '&:active': {
                    bgcolor: 'action.selected',
                  }
                }
              }
            }}
          >
            {isAuthenticated && (
              <>
                <MenuItem onClick={() => handleNavigation('/messages')}>
                  <GiConversation style={{ marginRight: 12, fontSize: 20 }} />
                  {t('topnavbar.messages')}
                </MenuItem>
                <MenuItem onClick={() => handleNavigation('/connections')}>
                  <GiThreeFriends style={{ marginRight: 12, fontSize: 20 }} />
                  {t('topnavbar.friends')}
                </MenuItem>
                <MenuItem onClick={() => handleNavigation('/caixinha')}>
                  <GiLockedChest style={{ marginRight: 12, fontSize: 20 }} />
                  {t('topnavbar.caixinha')}
                </MenuItem>
                <MenuItem onClick={() => handleNavigation('/shop')}>
                  <GiShoppingCart style={{ marginRight: 12, fontSize: 20 }} />
                  {t('topnavbar.marketplace')}
                </MenuItem>
              </>
            )}
          </Menu>
        )}

        {/* Desktop actions */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isAuthenticated && (
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
                onClick={() => handleNavigation('/shop')}
                tooltip={t('topnavbar.marketplace')}
              />
            </>
          )}

          {isAuthenticated ? (
            <UserProfileDropdown />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                color="primary"
                variant="contained"
                onClick={() => handleNavigation('/login')}
                sx={{
                  mx: 1,
                  boxShadow: 'none',
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 2,
                  py: 0.75,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  }
                }}
              >
                {t('topnavbar.login')}
              </Button>
              <LanguageSwitcher />
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavBar;