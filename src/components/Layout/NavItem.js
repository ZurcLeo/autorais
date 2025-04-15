// src/components/Layout/NavItem.js - Adaptado para sistema de eventos
import React, { useEffect } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { coreLogger } from '../../core/logging';
import { LOG_LEVELS } from '../../core/constants/config';

const MODULE_NAME = 'NavItem';

const NavItem = ({ icon, onClick, tooltip, disabled = false }) => {
  const uniqueKey = uuidv4();
  
  // Log de render uma única vez por componente
  useEffect(() => {
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'NavItem rendered', {
      tooltip,
      disabled
    });
    
    return () => {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'NavItem unmounted', {
        tooltip
      });
    };
  }, [tooltip, disabled]);
  
  // Wrapper para onClick com logging
  const handleClick = (event) => {
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Navigation item clicked', {
      tooltip
    });
    
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Tooltip title={tooltip} key={uniqueKey}>
      <span> {/* Wrapper para permitir tooltip mesmo quando desabilitado */}
        <IconButton 
          size="large" 
          color="inherit" 
          onClick={handleClick} 
          aria-label={tooltip} 
          aria-hidden={false}
          disabled={disabled}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default NavItem;