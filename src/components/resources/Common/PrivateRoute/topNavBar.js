import React, { useState } from 'react';
import {
  AppBar, Box, Toolbar, Button, Container, MenuItem, Drawer, IconButton, Avatar, Badge, Menu, Tooltip, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthService';
import useUnreadConnections from './hooks/useUnreadConnections';
import useUnreadMessage from '../PrivateRoute/hooks/useUnreadMessage';
import useNotification from './hooks/useNotification';
import CustomLinkContainer from '../../../customLinkContainer';
import { IoPersonOutline, IoPersonCircleOutline, IoSettingsOutline, IoExitOutline, IoNotificationsOutline } from "react-icons/io5";
import { FaSun, FaMoon } from 'react-icons/fa';
import './topNavBar.css';

const placeholder = process.env.REACT_APP_PLACE_HOLDER_IMG;

const logoStyle = {
  width: '60px',
  height: 'auto',
  cursor: 'pointer',
};

const NotificationDropdown = ({ globalNotifications, privateNotifications, markAsRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification, type) => {
    markAsRead(notification.id, type);
    if (type === 'global') {
      navigate(`/live/${notification.userId}`);
    }
  };

  return (
    <div className="notification-dropdown">
      <button onClick={handleToggle} className="notification-button">
        <IoNotificationsOutline size={20} />
        <p>{globalNotifications.length + privateNotifications.length}</p>
      </button>
      {isOpen && (
        <div className="notification-dropdown-menu">
          <h3>Notificações Globais</h3>
          {globalNotifications.length > 0 ? (
            globalNotifications.map(notification => (
              <div
                key={notification.id}
                className="notification-dropdown-item"
                onClick={() => handleNotificationClick(notification, 'global')}
              >
                {notification.conteudo}
              </div>
            ))
          ) : (
            <div className="notification-dropdown-item">Nenhuma notificação nova</div>
          )}

          <h3>Notificações Privadas</h3>
          {privateNotifications.length > 0 ? (
            privateNotifications.map(notification => (
              <div
                key={notification.id}
                className="notification-dropdown-item"
                onClick={() => handleNotificationClick(notification, 'private')}
              >
                {notification.conteudo}
              </div>
            ))
          ) : (
            <div className="notification-dropdown-item">Nenhuma notificação nova</div>
          )}
        </div>
      )}
    </div>
  );
};

const TopNavBar = ({ mode, toggleColorMode }) => {
  const { currentUser, logout } = useAuth();
  const unreadMessagesCount = useUnreadMessage();
  const { newRequests } = useUnreadConnections();
  const { globalNotifications, privateNotifications, markAsRead } = useNotification();
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/Login');
    } catch (error) {
      console.error('Erro ao tentar deslogar:', error);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const drawer = (
    <Box
      sx={{
        minWidth: '60dvw',
        p: 2,
        backgroundColor: 'background.paper',
        flexGrow: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'end',
          flexGrow: 1,
        }}
      >
        {/* <Button
          color="primary"
          variant="contained"
          component="a"
          href="/material-ui/getting-started/templates/sign-up/"
          target="_blank"
          sx={{ width: '100%' }}
        >
          Sign up
        </Button> */}
        <Button
          color="secondary"
          variant="outlined"
          component="a"
          href="/Login"
          sx={{ width: '100%' }}
        >
          Sign in
        </Button>
      </Box>
      <Divider />
      <MenuItem onClick={() => navigate('/homepage')}>Home</MenuItem>
      <MenuItem onClick={() => navigate('/services')}>Serviços</MenuItem>
      <MenuItem onClick={() => navigate('/blog')}>Blog</MenuItem>
      <MenuItem onClick={() => navigate('/Sobre')}>Sobre</MenuItem>
      <MenuItem onClick={() => navigate('/Login')}>Entrar</MenuItem>
    </Box>
  );

  return (
    <div>
      <AppBar position="fixed" sx={{ boxShadow: 0, bgcolor: 'transparent', backgroundImage: 'none', mt: 2 }}>
        <Container maxWidth="lg">
          <Toolbar
            variant="regular"
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              borderRadius: '999px',
              bgcolor:
                theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(24px)',
              maxHeight: 40,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow:
                theme.palette.mode === 'light'
                  ? `0 0 1px rgba(85, 166, 246, 0.1), 1px 1.5px 2px -1px rgba(85, 166, 246, 0.15), 4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)`
                  : '0 0 1px rgba(2, 31, 59, 0.7), 1px 1.5px 2px -1px rgba(2, 31, 59, 0.65), 4px 4px 12px -2.5px rgba(2, 31, 59, 0.65)',
            })}
          >
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', ml: '-18px', px: 0 }}>
              <img
                src={placeholder}
                style={logoStyle}
                alt="logo of sitemark"
                onClick={() => navigate('/')}
              />
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                <MenuItem component="a" href="/homepage">
                  Home
                </MenuItem>
                <MenuItem component="a" href="/services">
                  Serviços
                </MenuItem>
                <MenuItem component="a" href="/blog">
                  Blog
                </MenuItem>
                <MenuItem component="a" href="/Sobre">
                  Sobre
                </MenuItem>
              </Box>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, alignItems: 'center' }}>
              {currentUser ? (
                <>
                  <NotificationDropdown
                    globalNotifications={globalNotifications}
                    privateNotifications={privateNotifications}
                    markAsRead={markAsRead}
                  />
                  <Tooltip title="Alterar Tema">
                    <IconButton onClick={toggleColorMode} color="inherit">
                      {mode === 'light' ? <FaSun /> : <FaMoon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Perfil">
                    <IconButton
                      edge="end"
                      aria-label="account of current user"
                      aria-haspopup="true"
                      onClick={handleProfileMenuOpen}
                      color="inherit"
                    >
                      <Avatar src={currentUser.fotoDoPerfil || placeholder} />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    keepMounted
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem component={CustomLinkContainer} to={`/PerfilPessoal/${currentUser.uid}`}>
                      <IoPersonOutline fontSize="small" />
                      Meu perfil
                    </MenuItem>
                    <MenuItem component={CustomLinkContainer} to="/Payments">
                      <IoPersonCircleOutline fontSize="small" />
                      Compras
                    </MenuItem>
                    <MenuItem component={CustomLinkContainer} to="/UserProfileSettings">
                      <IoSettingsOutline fontSize="small" />
                      Configurações
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <IoExitOutline fontSize="small" />
                      Sair
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button component="a" href="/Login" color="inherit">
                    Entrar
                  </Button>
                </>
              )}
            </Box>
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
              <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
                {drawer}
              </Drawer>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </div>
  );
};

export default TopNavBar;
