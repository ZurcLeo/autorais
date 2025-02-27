// components/ContextualNavigation.tsx
import React from 'react';
import { useLocation } from "react-router-dom";
import { useContextualNavigation } from "../hooks/useContextualNavigation.ts";
import { Box, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';

const ContextualNavigation: React.FC = () => {
    const location = useLocation();
    const { navigateWithContext } = useContextualNavigation();
    
    return (
      <Box className="contextual-navigation" sx={{ position: 'fixed', right: 20, top: '50%' }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="subtitle2">Seções Relacionadas</Typography>
          <List>
            {getRelatedSections(location.pathname).map(section => (
              <ListItem
                button
                key={section.id}
                onClick={() => navigateWithContext(section.id)}
              >
                <ListItemText primary={section.title} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    );
  };