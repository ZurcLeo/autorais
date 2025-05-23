import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Chip,
  Button,
  ButtonGroup,
  Divider,
  Alert,
  useTheme,
  useMediaQuery,
  Tooltip,
  CircularProgress,
  Badge
} from '@mui/material';
import { 
  Star as StarIcon, 
  StarBorder as StarBorderIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const TicketSelectionGrid = ({ 
  rifa, 
  availableTickets, 
  selectedTicket, 
  setSelectedTicket,
  loading 
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Estados adicionais
  const [sortOrder, setSortOrder] = useState('asc');
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem(`rifa-favorites-${rifa.id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [viewMode, setViewMode] = useState('all'); // 'all', 'available', 'favorites'
  
  // Efeito para salvar favoritos no localStorage
  useEffect(() => {
    localStorage.setItem(`rifa-favorites-${rifa.id}`, JSON.stringify(favorites));
  }, [favorites, rifa.id]);

  // Gerenciar favoritos
  const toggleFavorite = (number) => {
    setFavorites(prev => 
      prev.includes(number) 
        ? prev.filter(n => n !== number) 
        : [...prev, number]
    );
  };

  // Todos os números da rifa
  const allNumbers = Array.from({ length: rifa.quantidadeBilhetes }, (_, i) => i + 1);
  
  // Números vendidos
  const soldTickets = rifa.bilhetesVendidos?.map(b => b.numero) || [];

  // Filtrar números com base no modo de visualização
  const getFilteredNumbers = () => {
    let numbers = [...allNumbers];
    
    if (viewMode === 'available') {
      numbers = numbers.filter(num => availableTickets.includes(num));
    } else if (viewMode === 'favorites') {
      numbers = numbers.filter(num => favorites.includes(num));
    }
    
    // Aplicar ordenação
    return numbers.sort((a, b) => sortOrder === 'asc' ? a - b : b - a);
  };

  const filteredNumbers = getFilteredNumbers();

  // Verificações
  const isAvailable = (number) => availableTickets.includes(number);
  const isSold = (number) => soldTickets.includes(number);
  const isFavorite = (number) => favorites.includes(number);

  return (
    <Box sx={{ mt: 2 }}>
      {/* Cabeçalho e Controles */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        flexWrap: 'wrap',
        gap: 1 
      }}>
        <Typography variant="subtitle1" component="div">
          {t('rifas.selectTicket')}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ButtonGroup size="small" variant="outlined">
            <Tooltip title={t('rifas.sortAscending')}>
              <Button 
                onClick={() => setSortOrder('asc')}
                variant={sortOrder === 'asc' ? 'contained' : 'outlined'}
              >
                <SortIcon sx={{ transform: 'rotate(0deg)' }} fontSize="small" />
              </Button>
            </Tooltip>
            <Tooltip title={t('rifas.sortDescending')}>
              <Button 
                onClick={() => setSortOrder('desc')}
                variant={sortOrder === 'desc' ? 'contained' : 'outlined'}
              >
                <SortIcon sx={{ transform: 'rotate(180deg)' }} fontSize="small" />
              </Button>
            </Tooltip>
          </ButtonGroup>
          
          <ButtonGroup size="small" variant="outlined">
            <Tooltip title={t('rifas.viewAll')}>
              <Button 
                onClick={() => setViewMode('all')}
                variant={viewMode === 'all' ? 'contained' : 'outlined'}
              >
                {t('rifas.all')}
              </Button>
            </Tooltip>
            <Tooltip title={t('rifas.viewAvailable')}>
              <Button 
                onClick={() => setViewMode('available')}
                variant={viewMode === 'available' ? 'contained' : 'outlined'}
              >
                {t('rifas.available')}
              </Button>
            </Tooltip>
            <Tooltip title={t('rifas.viewFavorites')}>
              <Button 
                onClick={() => setViewMode('favorites')}
                variant={viewMode === 'favorites' ? 'contained' : 'outlined'}
              >
                <StarIcon fontSize="small" />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />
      
      {/* Status */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {t('rifas.ticketsAvailable')}: {availableTickets.length}/{rifa.quantidadeBilhetes}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {t('rifas.ticketsSelected')}: {selectedTicket ? '1' : '0'}
        </Typography>
      </Box>
      
      {/* Grade de Números */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : availableTickets.length === 0 ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t('rifas.noAvailableTickets')}
        </Alert>
      ) : filteredNumbers.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t('rifas.noTicketsInCurrentView')}
        </Alert>
      ) : (
        <>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(5, 1fr)', 
              sm: 'repeat(8, 1fr)',
              md: 'repeat(10, 1fr)'
            },
            gap: 1,
            maxHeight: 320,
            overflowY: 'auto',
            p: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1
          }}>
            {filteredNumbers.map((number) => {
              const available = isAvailable(number);
              const selected = selectedTicket === number;
              const favorite = isFavorite(number);
              const sold = isSold(number);
              
              return (
                <Tooltip 
                  key={number} 
                  title={sold ? t('rifas.ticketSold') : favorite ? t('rifas.removeFavorite') : t('rifas.addFavorite')}
                >
                  <Box sx={{ position: 'relative' }}>
                    <Chip
                      label={number}
                      clickable={available}
                      onClick={() => available && setSelectedTicket(number)}
                      color={selected ? 'primary' : 'default'}
                      variant={selected ? 'filled' : 'outlined'}
                      disabled={!available}
                      onDoubleClick={() => toggleFavorite(number)}
                      sx={{
                        width: '100%',
                        height: 36,
                        fontSize: '0.9rem',
                        opacity: available ? 1 : 0.6,
                        cursor: available ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: available ? 'scale(1.05)' : 'none',
                          backgroundColor: selected 
                            ? theme.palette.primary.dark 
                            : available 
                              ? theme.palette.action.hover 
                              : undefined
                        },
                        ...(selected && {
                          animation: 'pulse 1.5s infinite',
                          '@keyframes pulse': {
                            '0%': { boxShadow: '0 0 0 0 rgba(33, 150, 243, 0.4)' },
                            '70%': { boxShadow: '0 0 0 8px rgba(33, 150, 243, 0)' },
                            '100%': { boxShadow: '0 0 0 0 rgba(33, 150, 243, 0)' }
                          }
                        })
                      }}
                    />
                    {favorite && (
                      <StarIcon 
                        sx={{ 
                          position: 'absolute', 
                          top: -8, 
                          right: -8, 
                          fontSize: 16, 
                          color: theme.palette.warning.main,
                          backgroundColor: theme.palette.background.paper,
                          borderRadius: '50%',
                          padding: 0.1
                        }} 
                      />
                    )}
                    {selected && (
                      <CheckCircleIcon 
                        sx={{ 
                          position: 'absolute', 
                          top: -8, 
                          left: -8, 
                          fontSize: 16, 
                          color: theme.palette.success.main,
                          backgroundColor: theme.palette.background.paper,
                          borderRadius: '50%',
                          padding: 0.1
                        }} 
                      />
                    )}
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
          
          {/* Instrução rápida */}
          <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center', color: 'text.secondary' }}>
            {t('rifas.doubleClickFavorite')}
          </Typography>
        </>
      )}
      
      {/* Pré-visualização do bilhete selecionado */}
      {selectedTicket && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {t('rifas.selectedTicketMessage', { 
            number: selectedTicket,
            prize: rifa.premio 
          })}
        </Alert>
      )}
    </Box>
  );
};

export default TicketSelectionGrid;