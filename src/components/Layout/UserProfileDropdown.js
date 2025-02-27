import React, { useState } from 'react';
import { Avatar, IconButton, Menu, MenuItem, Typography, Badge } from '@mui/material';
import { GiFingerPrint, GiWallet, GiModernCity, GiExitDoor } from "react-icons/gi";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/_AuthContext';
import { useNotifications } from '../../hooks/notification/useNotifications';
import { useTranslation } from 'react-i18next';

const UserProfileDropdown = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { currentUser, logoutUser } = useAuth();
  const { notifications } = useNotifications(); // Removemos setNotifications pois não precisamos mais dele aqui
  const { t } = useTranslation();

  // Calcula o número de notificações não lidas
  const unreadNotificationsCount = notifications.filter(
    notification => !notification.lida
  ).length;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate(`/profile/${currentUser?.uid}`); // Nota: mudamos de id para uid para manter consistência
    handleMenuClose();
  };

  const handleNotificationsClick = () => {
    navigate('/notifications');
    handleMenuClose();
  };

  return (
    <>
      <IconButton onClick={handleMenuOpen}>
        <Avatar src={currentUser?.fotoDoPerfil} alt={currentUser?.displayName} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleProfileClick}>
          <GiFingerPrint style={{ marginRight: 8 }} />
          <Typography>{t('userprofiledropdown.profile')}</Typography>
        </MenuItem>
        <MenuItem onClick={handleNotificationsClick}>
          <Badge 
            badgeContent={unreadNotificationsCount} 
            color="primary"
            sx={{ marginRight: 1 }}
          >
            <GiWallet style={{ marginRight: 8 }} />
          </Badge>
          <Typography>{t('userprofiledropdown.notifications')}</Typography>
        </MenuItem>
        <MenuItem onClick={() => navigate('/dashboard')}>
          <GiModernCity style={{ marginRight: 8 }} />
          <Typography>{t('userprofiledropdown.dashboard')}</Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <GiExitDoor style={{ marginRight: 8 }} />
          <Typography>{t('userprofiledropdown.logout')}</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserProfileDropdown;