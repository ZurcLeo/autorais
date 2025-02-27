import React, { useState, useCallback, useRef } from 'react';
import { TextField, Box, CircularProgress } from '@mui/material';
import { useConnections } from '../../context/ConnectionContext';
import { useTranslation } from 'react-i18next';

const FriendSearch = ({ onResults }) => {
  const { t } = useTranslation();
  const { searchUsers } = useConnections();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);

  const handleSearch = useCallback(
    async (query) => {
      if (!query?.trim()) return;
      setLoading(true);
      try {
        const results = await searchUsers(query);
        onResults(results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    },
    [searchUsers, onResults]
  );

  const debouncedSearch = useCallback(
    (query) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        handleSearch(query);
      }, 300);
    },
    [handleSearch]
  );

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
        endAdornment: loading && (
          <CircularProgress
            size={20}
            sx={{ position: 'absolute', right: 8 }}
          />
        ),
      }}
    />
  </Box>
);
};

export default FriendSearch;