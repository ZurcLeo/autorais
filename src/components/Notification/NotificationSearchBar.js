// components/NotificationSearchBar.js
import React from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const NotificationSearchBar = ({ value, onChange }) => {
  const { t } = useTranslation();
  
  const handleChange = (event) => {
    onChange(event.target.value);
  };
  
  const handleClear = () => {
    onChange('');
  };
  
  return (
    <TextField
      fullWidth
      variant="outlined"
      placeholder={t('common.search')}
      size="small"
      margin="normal"
      value={value}
      onChange={handleChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton
              aria-label="clear search"
              onClick={handleClear}
              edge="end"
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default NotificationSearchBar;