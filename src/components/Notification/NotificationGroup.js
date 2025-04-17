// components/NotificationGroup.js
import React, { useState } from 'react';
import { Box, Typography, IconButton, Chip, Collapse } from '@mui/material';
import { KeyboardArrowDown as ExpandMoreIcon } from '@mui/icons-material';

const NotificationGroup = ({ title, children, count }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <Box sx={{ mb: 3 }}>
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between"
        onClick={() => setIsOpen(!isOpen)}
        sx={{ 
          py: 1, 
          px: 2, 
          borderRadius: 1,
          bgcolor: 'background.paper',
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
          mb: 1
        }}
      >
        <Box display="flex" alignItems="center">
          <Typography variant="subtitle1" fontWeight="medium">
            {title}
          </Typography>
          <Chip 
            label={count} 
            size="small" 
            sx={{ ml: 1 }}
          />
        </Box>
        <IconButton size="small">
          <ExpandMoreIcon 
            sx={{ 
              transform: isOpen ? 'rotate(180deg)' : 'none', 
              transition: 'transform 0.3s' 
            }} 
          />
        </IconButton>
      </Box>
      
      <Collapse in={isOpen}>
        {children}
      </Collapse>
    </Box>
  );
};

export default NotificationGroup;