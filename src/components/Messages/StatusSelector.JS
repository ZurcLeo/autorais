// src/components/Messages/StatusSelector.js
import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText, 
  Button,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Tooltip,
  alpha
} from '@mui/material';
import { 
  CheckCircle as OnlineIcon, 
  AccessTime as AwayIcon, 
  DoNotDisturbOn as BusyIcon, 
  VisibilityOff as InvisibleIcon,
  ArrowDropDown as DropdownIcon,
  AccountCircle as ProfileIcon
} from '@mui/icons-material';
import { usePresence } from '../../hooks/usePresence';
import { serviceLocator } from '../../core/services/BaseService';

/**
 * StatusSelector component - Allows users to change their online presence status
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.variant='button'] - Display variant: 'button', 'icon', or 'avatar'
 * @param {string} [props.size='medium'] - Component size: 'small', 'medium', or 'large'
 * @returns {React.ReactElement} Status selector component with dropdown menu
 */
const StatusSelector = ({ variant = 'button', size = 'medium' }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { updateMyStatus, getUserStatus } = usePresence();
  const authStore = serviceLocator.get('store').getState()?.auth || {};
  const { currentUser } = authStore;
  
  // Status options with corresponding icons and colors
  const statusOptions = useMemo(() => [
    { value: 'online', label: 'Online', color: 'success.main', icon: OnlineIcon },
    { value: 'away', label: 'Ausente', color: 'warning.main', icon: AwayIcon },
    { value: 'busy', label: 'Ocupado', color: 'error.main', icon: BusyIcon },
    { value: 'invisible', label: 'Invisível', color: 'text.secondary', icon: InvisibleIcon },
    { value: 'offline', label: 'Offline', color: 'text.disabled', icon: null }
  ], []);
  
  // Get current user status
  const myStatus = getUserStatus(currentUser?.uid);
  const currentStatus = myStatus?.status || 'online';
  
  // Find current status in options
  const statusData = useMemo(() => 
    statusOptions.find(option => option.value === currentStatus) || statusOptions[0],
  [currentStatus, statusOptions]);
  
  // Menu event handlers
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleStatusChange = (status) => {
    updateMyStatus(status);
    handleClose();
  };
  
  // Component size mappings
  const sizeMap = {
    small: { avatar: 32, iconButton: 'small', badge: 10 },
    medium: { avatar: 40, iconButton: 'medium', badge: 12 },
    large: { avatar: 48, iconButton: 'large', badge: 14 }
  };
  
  const sizeValues = sizeMap[size] || sizeMap.medium;
  
  // Render trigger based on variant
  const renderTrigger = () => {
    const StatusIcon = statusData.icon;
    
    // Avatar variant with status badge
    if (variant === 'avatar') {
      return (
        <Tooltip title={`Status: ${statusData.label}`} arrow>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  bgcolor: statusData.color,
                  width: sizeValues.badge,
                  height: sizeValues.badge,
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: 'background.paper'
                }}
              />
            }
          >
            <Avatar
              src={currentUser?.photoURL}
              alt={currentUser?.displayName || 'Usuário'}
              onClick={handleClick}
              sx={{ 
                cursor: 'pointer',
                width: sizeValues.avatar,
                height: sizeValues.avatar,
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            >
              {currentUser?.displayName?.[0] || 'U'}
            </Avatar>
          </Badge>
        </Tooltip>
      );
    }
    
    // Icon variant
    if (variant === 'icon') {
      return (
        <Tooltip title={`Status: ${statusData.label}`} arrow>
          <IconButton
            onClick={handleClick}
            size={sizeValues.iconButton}
            aria-label="Change status"
            sx={{
              color: statusData.color,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha(statusData.color, 0.1)
              }
            }}
          >
            {StatusIcon ? <StatusIcon /> : <ProfileIcon />}
          </IconButton>
        </Tooltip>
      );
    }
    
    // Default button variant
    return (
      <Button
        variant="outlined"
        onClick={handleClick}
        endIcon={<DropdownIcon />}
        startIcon={StatusIcon && <StatusIcon />}
        size={size !== 'large' ? size : 'medium'}
        aria-label="Change status"
        aria-haspopup="true"
        sx={{ 
          color: statusData.color,
          borderColor: statusData.color,
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: statusData.color,
            bgcolor: alpha(statusData.color, 0.1)
          }
        }}
      >
        {statusData.label}
      </Button>
    );
  };
  
  return (
    <>
      {renderTrigger()}
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 200,
            mt: 1,
            p: 1,
            borderRadius: 1,
            overflow: 'visible',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: -6,
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: 12,
              height: 12,
              bgcolor: 'background.paper',
              zIndex: 0
            }
          }
        }}
      >
        <Typography 
          variant="subtitle2" 
          sx={{ 
            px: 2, 
            py: 1, 
            color: 'text.secondary',
            fontWeight: 'medium'
          }}
        >
          Definir status
        </Typography>
        
        {statusOptions.map((option) => {
          const Icon = option.icon;
          return (
            <MenuItem 
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              selected={currentStatus === option.value}
              sx={{ 
                borderRadius: 1,
                mb: 0.5,
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  bgcolor: alpha(option.color, 0.1),
                  '&:hover': {
                    bgcolor: alpha(option.color, 0.2),
                  }
                },
                '&:hover': {
                  bgcolor: alpha(option.color, 0.1),
                }
              }}
            >
              <ListItemIcon>
                {Icon ? (
                  <Icon sx={{ color: option.color }} />
                ) : (
                  <Box sx={{ width: 24 }} /> 
                )}
              </ListItemIcon>
              <ListItemText 
                primary={option.label} 
                primaryTypographyProps={{ 
                  color: currentStatus === option.value ? option.color : 'text.primary',
                  fontWeight: currentStatus === option.value ? 'medium' : 'regular'
                }}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default StatusSelector;