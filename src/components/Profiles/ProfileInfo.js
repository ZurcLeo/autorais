import React, { useState, useCallback } from 'react';
import { Box, Typography, TextField, IconButton, Tooltip, Fade, Snackbar } from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import { debounce } from 'lodash';
import { useValidation } from '../../providers/ValidationProvider';
import { useTranslation } from 'react-i18next';

const ProfileInfo = ({ userData, isEditable, onSave }) => {
  const { t } = useTranslation();
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const { validateField } = useValidation();
  const sugestoes = ["Sugestão 1", "Sugestão 2", "Sugestão 3"];

  // Validação otimizada com debounce
  const debouncedValidation = useCallback(
    debounce((field, value) => {
      const validationError = validateField(value, field === 'descricao' ? 'text' : 'default'); 
      setError(validationError || '');
      setOpenSnackbar(!!validationError);
    }, 300),
    [validateField]
  );

  const handleEdit = (field) => {
    setEditingField(field);
    setTempValue(userData[field] || '');
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue('');
    setError('');
  };

  const handleSave = async (field) => {
    const validationError = validateField(tempValue, field === 'descricao' ? 'text' : 'default');

    if (validationError) {
      setError(validationError);
      setOpenSnackbar(true);
      return;
    }

    try {
      await onSave(field, tempValue);
      setEditingField(null);
      setError('');
    } catch (error) {
      console.error(t('profileInfo.saveError'), error);
      setError(t('profileInfo.saveError'));
      setOpenSnackbar(true);
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const renderField = (label, field) => (
    <Box display="flex" alignItems="center" py={2} borderBottom="1px solid #eaeaea">
      <Typography variant="body1" color="textSecondary" flexBasis="30%">
        {label}
      </Typography>
      <Box flexGrow={1} position="relative">
        {editingField === field && isEditable ? (
          <Fade in={true}>
            <Autocomplete
              freeSolo
              options={sugestoes}
              value={tempValue}
              onInputChange={(event, newInputValue) => {
                setTempValue(newInputValue);
                debouncedValidation(field, newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  variant="standard"
                  multiline={field === 'descricao'}
                  rows={field === 'descricao' ? 4 : 1}
                  autoFocus
                  error={!!error}
                  helperText={error}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <Box>
                        <Tooltip title={t('common.save')}>
                          <IconButton size="small" onClick={() => handleSave(field)} disabled={!!error}>
                            <SaveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.cancel')}>
                          <IconButton size="small" onClick={handleCancel}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ),
                  }}
                />
              )}
            />
          </Fade>
        ) : (
          <Typography
            variant="body1"
            style={{ 
              whiteSpace: 'pre-wrap', 
              wordWrap: 'break-word',
              padding: '8px 0'
            }}
          >
            {userData[field] || t('profileInfo.notProvided')}
          </Typography>
        )}
      </Box>
      {isEditable && editingField !== field && (
        <Tooltip title={t('common.edit')}>
          <IconButton size="small" onClick={() => handleEdit(field)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  return (
    <Box>
      {renderField(t('profileInfo.name'), 'nome')}
      {renderField(t('common.description'), 'descricao')}
      {renderField(t('profileInfo.tipoDePerfil'), 'tipoDeConta')}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={error}
      />
    </Box>
  );
};

export default ProfileInfo;