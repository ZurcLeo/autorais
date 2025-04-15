import React, { useState, useEffect } from 'react';
import { TextField, Box, CircularProgress, Typography } from '@mui/material';
import { useConnections } from '../../providers/ConnectionProvider';
import { useTranslation } from 'react-i18next';

const FriendSearch = ({ onResults }) => {
  const { t } = useTranslation();
  const { smartSearchUsers, loading, error } = useConnections();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const isLoading = loading?.searching || false;
  
  // Função para lidar com a mudança no campo de busca
  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      onResults([]);
    }
  };
  
  // Efeito para executar a busca quando a query mudar
  useEffect(() => {
    let isMounted = true;
    
    const performSearch = async () => {
      if (!searchQuery.trim()) return;
      
      try {
        const results = await smartSearchUsers(searchQuery);
        
        if (isMounted) {
          setSearchResults(results);
          if (onResults) {
            onResults(results);
          }
        }
      } catch (searchError) {
        console.error('Search failed:', searchError);
      }
    };
    
    // Executar a busca somente se houver uma query
    if (searchQuery.trim()) {
      performSearch();
    }
    
    return () => {
      isMounted = false;
    };
  }, [searchQuery, smartSearchUsers, onResults]);

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        fullWidth
        value={searchQuery}
        onChange={handleInputChange}
        placeholder={t('friendSearch.placeholder')}
        variant="outlined"
        size="small"
        InputProps={{
          endAdornment: isLoading && (
            <CircularProgress size={20} sx={{ position: 'absolute', right: 8 }} />
          ),
        }}
      />
      
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
          {t('friendSearch.errorMessage', { error })}
        </Typography>
      )}
      
      {!isLoading && searchQuery && searchResults.length === 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          {t('friendSearch.noResults')}
        </Typography>
      )}
    </Box>
  );
};

export default FriendSearch;