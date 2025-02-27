import { useState, useCallback, useContext } from 'react';
import { ConnectionContext } from '../context/ConnectionContext';
import { coreLogger } from '../../core/logging/CoreLogger';

export function useConnectionSearch() {
  const { searchUsers, searchResults, searching, error } = useContext(ConnectionContext);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Debounce da busca para evitar muitas requisições
  const handleQueryChange = useCallback((newQuery) => {
    setQuery(newQuery);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(newQuery);
      if (newQuery.trim().length > 2) {
        searchUsers(newQuery)
          .catch(error => {
            coreLogger.logServiceError('connectionSearch', error, {
              context: 'useConnectionSearch',
              query: newQuery
            });
          });
      }
    }, 300); // espera 300ms após o último input
    
    setSearchTimeout(timeoutId);
  }, [searchUsers, searchTimeout]);

  // Limpar timeout ao desmontar
  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  }, [searchTimeout]);

  return {
    query,
    debouncedQuery,
    searchResults,
    searching,
    error,
    handleQueryChange,
    clearSearch,
    searchUsers
  };
}