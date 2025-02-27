import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, TextField, IconButton, Tooltip, Fade, Snackbar } from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import { debounce } from 'lodash';
import { useValidation } from '../../context/ValidationContext'; // Importando o contexto de validação
import { useTranslation } from 'react-i18next'; // Importando para traduções

const ProfileInfo = ({ user, onSave }) => {
  const { t } = useTranslation(); // Função para tradução
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const { validateText } = useValidation(); // Usando o contexto de validação
  const sugestoes = ["Sugestão 1", "Sugestão 2", "Sugestão 3"]; // Sugestões para o autocomplete

  const debouncedValidation = debounce((value) => {
    const validationError = validateText(value);
    if (validationError) {
      setError(validationError);
      setOpenSnackbar(true);
      return;
    }
    setError('');
    setOpenSnackbar(false);
  }, 300);

  const handleEdit = (field) => {
    setEditingField(field);
    setTempValue(user[field] || '');
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue('');
    setError('');
  };

  const handleSave = async (field) => {
    if (error) {
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
    <Box
      display="flex"
      alignItems="center"
      py={2}
      borderBottom="1px solid #eaeaea"
      sx={{ '&:last-child': { borderBottom: 'none' } }}
    >
      <Typography variant="body1" color="textSecondary" flexBasis="30%">
        {label}
      </Typography>
      <Box flexGrow={1} position="relative">
        {editingField === field ? (
          <Fade in={true}>
            <Autocomplete
              freeSolo
              options={sugestoes}
              value={tempValue}
              onInputChange={(event, newInputValue) => {
                setTempValue(newInputValue);
                debouncedValidation(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  variant="standard"
                  multiline
                  rows={4}
                  autoFocus
                  InputProps={{
                    endAdornment: (
                      <Box>
                        <Tooltip title={t('common.save')}>
                          <IconButton size="small" onClick={() => handleSave(field)}>
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
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {user[field] || t('profileInfo.notProvided')}
          </pre>
        )}
        {error && <Typography color="error">{error}</Typography>}
      </Box>
      {editingField !== field && (
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
      {renderField(t('profileInfo.tipoDePerfil'), 'perfil')}
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