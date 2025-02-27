// src/pages/Caixinha/components/CaixinhaList.js
import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Card 
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const CaixinhaList = ({ caixinhas = [], selectedId, onSelect }) => {
  const { t } = useTranslation();

  // Validar se `caixinhas` é realmente um array
  const caixinhasArray = Array.isArray(caixinhas) ? caixinhas : [];

  return (
    <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t('activeGroups')}
        </Typography>
        <List>
          {caixinhasArray.length > 0 ? (
            caixinhasArray.map((caixinha) => (
              <ListItem
                key={caixinha.id}
                button
                selected={selectedId === caixinha.id}
                onClick={() => onSelect(caixinha)}
                sx={{
                  bgcolor: selectedId === caixinha.id ? 'primary.light' : 'transparent',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={caixinha.name || t('unnamedGroup')}
                  secondary={caixinha.description || t('noDescription')}
                />
              </ListItem>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              {t('noGroups')}
            </Typography>
          )}
        </List>
      </Box>
    </Card>
  );
};

export default CaixinhaList;