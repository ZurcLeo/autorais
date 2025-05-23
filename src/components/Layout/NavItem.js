// src/components/Layout/NavItem.js - Simplified theme adaptation
import React, { useEffect } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { coreLogger } from '../../core/logging';
import { LOG_LEVELS } from '../../core/constants/config';

const MODULE_NAME = 'NavItem';

const NavItem = ({ icon, onClick, tooltip, disabled = false }) => {
  const uniqueKey = uuidv4();
  
  // Log of render once per component
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
  
  // Wrapper for onClick with logging
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
      <span> {/* Wrapper to allow tooltip even when disabled */}
        <IconButton 
          size="large" 
          color="inherit" 
          onClick={handleClick} 
          aria-label={tooltip} 
          aria-hidden={false}
          disabled={disabled}
          sx={{
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'action.hover',
              transform: 'scale(1.05)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
            '&.Mui-disabled': {
              opacity: 0.6,
              color: 'text.disabled',
            }
          }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default NavItem;