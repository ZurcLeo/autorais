// src/components/Layout/NavItem.js
import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

const NavItem = ({ icon, onClick, tooltip }) => {
  const uniqueKey = uuidv4(); 

  return (
    <Tooltip title={tooltip} key={uniqueKey}>
      <IconButton size="large" color="inherit" onClick={onClick} aria-label={tooltip} aria-hidden={false}>
        {icon}
      </IconButton>
    </Tooltip>
  );
};

export default NavItem;