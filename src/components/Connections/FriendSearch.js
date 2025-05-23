// src/components/Connections/FriendSearch.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  TextField, 
  Box, 
  CircularProgress, 
  Typography,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Collapse,
  Fade
} from '@mui/material';
import { 
  Search as SearchIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useConnections } from '../../providers/ConnectionProvider';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';

/**
 * Componente otimizado de busca de amigos com design aprimorado e feedback visual
 * Implementa busca em tempo real com debounce e exibição de resultados no próprio componente
 * 
 * @param {Object} props - Propriedades do componente
 * @param {Function} props.onResults - Callback para enviar resultados da busca
 * @param {boolean} props.showPreview - Se deve mostrar preview dos resultados (opcional)
 * @param {number} props.debounceTime - Tempo de debounce em ms (opcional, padrão: 300)
 * @param {Object} props.initialFilters - Filtros iniciais (opcional)
 */
const FriendSearch = ({ 
  onResults, 
  showPreview = true, 
  debounceTime = 300,
  initialFilters = {}
}) => {
  const { t } = useTranslation();
  const { smartSearchUsers, loading, error } = useConnections();
  
  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(initialFilters);
  
  const isLoading = loading?.searching || false;
  
  // Criar função de pesquisa com debounce
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        onResults([]);
        return;
      }
      
      try {
        const results = await smartSearchUsers(query, selectedFilters);
        setSearchResults(results);
        onResults(results);
        
        if (results.length > 0) {
          setShowResults(true);
        }
      } catch (searchError) {
        console.error('Search failed:', searchError);
      }
    }, debounceTime),
    [smartSearchUsers, onResults, selectedFilters]
  );
  
  // Função para lidar com a mudança no campo de busca
  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      onResults([]);
    } else {
      debouncedSearch(query);
    }
  };
  
  // Limpar a pesquisa
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    onResults([]);
  };
  
  // Alternar exibição de resultados expandidos
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Aplicar filtro de busca
  const handleFilterToggle = (filter) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };
  
  // Efeito para cancelar o debounce ao desmontar o componente
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);
  
  // Opções de filtro disponíveis
  const filterOptions = [
    { id: 'onlyWithPhoto', label: t('friendSearch.hasPhoto') },
    { id: 'onlyActive', label: t('friendSearch.active') },
    { id: 'similarInterests', label: t('friendSearch.similarInterests') }
  ];
  
  // Truncar texto se for muito longo
  const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    return text.length > maxLength 
      ? `${text.substring(0, maxLength)}...` 
      : text;
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Paper 
        elevation={1}
        sx={{
          p: 1,
          transition: 'all 0.3s ease',
          borderRadius: 2,
          border: '1px solid',
          borderColor: searchQuery ? 'primary.main' : 'divider',
          boxShadow: searchQuery ? 2 : 1
        }}
      >
        <TextField
          fullWidth
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={t('friendSearch.placeholder')}
          variant="standard"
          size="medium"
          autoComplete="off"
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color={isLoading ? "disabled" : "primary"} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <IconButton 
                    size="small" 
                    onClick={handleClearSearch}
                    edge="end"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </InputAdornment>
            ),
            sx: {
              py: 0.5,
              px: 1,
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }
          }}
          sx={{
            '& .MuiInputBase-root': {
              bgcolor: 'background.paper',
              transition: 'background-color 0.2s ease'
            }
          }}
        />
        
        {/* Chips de filtro */}
        {showResults && (
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 0.5,
              mt: 1 
            }}
          >
            {filterOptions.map(filter => (
              <Chip
                key={filter.id}
                label={filter.label}
                size="small"
                color={selectedFilters[filter.id] ? "primary" : "default"}
                variant={selectedFilters[filter.id] ? "filled" : "outlined"}
                onClick={() => handleFilterToggle(filter.id)}
                sx={{
                  borderRadius: 6,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: selectedFilters[filter.id] ? 'primary.dark' : 'action.hover'
                  }
                }}
              />
            ))}
          </Box>
        )}
      </Paper>
      
      {error && (
        <Typography 
          variant="caption" 
          color="error" 
          sx={{ 
            display: 'block',
            mt: 0.5,
            ml: 1
          }}
        >
          {t('friendSearch.errorMessage', { error })}
        </Typography>
      )}
      
      {/* Mensagem quando não há resultados */}
      {!isLoading && searchQuery && searchResults.length === 0 && (
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            display: 'block',
            mt: 0.5,
            ml: 1
          }}
        >
          {t('friendSearch.noResults')}
        </Typography>
      )}
      
      {/* Preview de resultados (se habilitado) */}
      {showPreview && showResults && searchResults.length > 0 && (
        <Fade in={showResults}>
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              mt: 0.5,
              zIndex: 1000,
              maxHeight: expanded ? 500 : 300,
              overflow: 'auto',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <List dense sx={{ py: 1 }}>
              {/* Cabeçalho de resultados */}
              <ListItem 
                sx={{
                  justifyContent: 'space-between',
                  px: 2,
                  py: 0.5
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  {t('friendSearch.resultsCount', { count: searchResults.length })}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={toggleExpanded}
                  color="primary"
                >
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </ListItem>
              
              {/* Lista de resultados limitada */}
              <Collapse in={true} timeout="auto">
                {searchResults.slice(0, expanded ? searchResults.length : 5).map((user) => (
                  <ListItem 
                    key={user.id} 
                    button
                    sx={{
                      px: 2,
                      py: 1,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={user.fotoDoPerfil}
                        sx={{ 
                          width: 40, 
                          height: 40,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {(user.nome ? user.nome[0] : <PersonIcon />)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="body1" 
                          sx={{ fontWeight: 'medium' }}
                        >
                          {user.nome || t('friendSearch.unknownUser')}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            component="span"
                            display="block"
                          >
                            {user.email}
                          </Typography>
                          {user.interesses && (
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: 0.5,
                                mt: 0.5 
                              }}
                            >
                              {Object.values(user.interesses || {})
                                .flat()
                                .slice(0, 3)
                                .map((interest, index) => (
                                  <Chip
                                    key={index}
                                    label={truncateText(interest, 15)}
                                    size="small"
                                    variant="outlined"
                                    sx={{ 
                                      height: 20, 
                                      '& .MuiChip-label': { px: 1, py: 0 } 
                                    }}
                                  />
                                ))}
                            </Box>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </Collapse>
              
              {/* Rodapé com link para ver todos */}
              {searchResults.length > 5 && !expanded && (
                <ListItem 
                  button
                  onClick={toggleExpanded}
                  sx={{
                    justifyContent: 'center',
                    color: 'primary.main',
                    py: 0.5
                  }}
                >
                  <Typography 
                    variant="body2" 
                    color="primary"
                    sx={{ fontWeight: 'medium' }}
                  >
                    {t('friendSearch.viewMore', { 
                      count: searchResults.length - 5 
                    })}
                  </Typography>
                </ListItem>
              )}
            </List>
          </Paper>
        </Fade>
      )}
    </Box>
  );
};

export default FriendSearch;