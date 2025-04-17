import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../providers/AuthProvider';
import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const AdminNavItem = () => {
  const { currentUser } = useAuth();

  if (!currentUser?.isOwnerOrAdmin) {
    return null;
  }

  return (
    <ListItem button component={Link} to="/admin/interests">
      <ListItemIcon>
        <AdminPanelSettingsIcon />
      </ListItemIcon>
      <ListItemText primary="Administração" />
    </ListItem>
  );
};

export default AdminNavItem;