import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
  Avatar,
  Divider,
  Chip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const CaixinhaList = ({ caixinhas, selectedId, onSelect }) => {
  const { t } = useTranslation();

  // Função para formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h6" fontWeight="bold">
          {t('yourCaixinhas')}
        </Typography>
        <Typography variant="body2">
          {t('selectCaixinha')}
        </Typography>
      </Box>
      
      <List sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
        {caixinhas.map((caixinha) => (
          <React.Fragment key={caixinha.id}>
            <ListItem disablePadding>
              <ListItemButton
                selected={selectedId === caixinha.id}
                onClick={() => onSelect(caixinha)}
                sx={{
                  py: 2,
                  borderLeft: selectedId === caixinha.id ? 4 : 0,
                  borderLeftColor: 'primary.main',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                  }
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.light',
                        width: 40,
                        height: 40,
                        mr: 2,
                      }}
                    >
                      {caixinha.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <ListItemText
                      primary={caixinha.name}
                      secondary={
                        caixinha.description
                          ? caixinha.description.length > 30
                            ? caixinha.description.substring(0, 30) + '...'
                            : caixinha.description
                          : t('noDescription')
                      }
                      primaryTypographyProps={{
                        fontWeight: 'bold',
                        noWrap: true,
                      }}
                      secondaryTypographyProps={{
                        noWrap: true,
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    <Chip
                      label={`${t('balance')}: ${formatCurrency(caixinha.saldoTotal || 0)}`}
                      size="small"
                      sx={{ fontSize: '0.75rem' }}
                    />
                    <Chip
                      label={`${t('members')}: ${caixinha.members?.length || 0}`}
                      size="small"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </Box>
                </Box>
              </ListItemButton>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default CaixinhaList;