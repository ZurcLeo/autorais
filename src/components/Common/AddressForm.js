import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Grid, 
  CircularProgress, 
  IconButton,
  InputAdornment,
  Tooltip
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatCEP } from '../../utils/formatters';

const AddressForm = ({ value, onChange, disabled = false }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [cepError, setCepError] = useState('');

  const handleCepSearch = async (cep) => {
    if (!cep || cep.length < 8) return;
    
    setLoading(true);
    setCepError('');

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setCepError(t('address.errors.cepNotFound'));
        return;
      }

      onChange({
        ...value,
        zipCode: cep,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
      });
    } catch (error) {
      setCepError(t('address.errors.cepSearchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, fieldValue) => {
    onChange({
      ...value,
      [field]: fieldValue
    });
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label={t('address.fields.zipCode')}
            value={formatCEP(value.zipCode)}
            onChange={(e) => {
              const cep = e.target.value.replace(/\D/g, '');
              handleFieldChange('zipCode', cep);
              if (cep.length === 8) handleCepSearch(cep);
            }}
            error={!!cepError}
            helperText={cepError || t('address.help.zipCode')}
            disabled={disabled || loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {loading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Tooltip title={t('address.search')}>
                      <IconButton
                        onClick={() => handleCepSearch(value.zipCode)}
                        disabled={!value.zipCode || value.zipCode.length < 8}
                      >
                        <SearchIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label={t('address.fields.street')}
            value={value.street}
            onChange={(e) => handleFieldChange('street', e.target.value)}
            disabled={disabled}
            required
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label={t('address.fields.number')}
            value={value.number}
            onChange={(e) => handleFieldChange('number', e.target.value)}
            disabled={disabled}
            required
          />
        </Grid>

        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label={t('address.fields.complement')}
            value={value.complement}
            onChange={(e) => handleFieldChange('complement', e.target.value)}
            disabled={disabled}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={t('address.fields.neighborhood')}
            value={value.neighborhood}
            onChange={(e) => handleFieldChange('neighborhood', e.target.value)}
            disabled={disabled}
            required
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label={t('address.fields.city')}
            value={value.city}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            disabled={disabled}
            required
          />
        </Grid>

        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            label={t('address.fields.state')}
            value={value.state}
            onChange={(e) => handleFieldChange('state', e.target.value)}
            disabled={disabled}
            required
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddressForm;