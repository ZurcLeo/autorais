//frontend/src/LanguageSwitcher.js
import React from 'react';
import { MenuItem, Select, FormControl, InputLabel, Box, Typography } from '@mui/material';
import ReactCountryFlag from 'react-country-flag';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { showPromiseToast } from './utils/toastUtils'; // Importe a função de toast com promise
import i18n from './utils/i18n';

const LanguageSwitcher = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Função para mudar o idioma e exibir toast de carregamento
  const changeLanguage = (lng) => {
    const promise = i18n.changeLanguage(lng); // Isso retorna uma Promise
    showPromiseToast(promise, {
      loading: t('common.loading'),
      success: t('common.languageChangedSuccess'),
      error: t('common.languageChangedError'),
    });
  };

  const languages = [
    { code: 'en', country: 'US', name: 'English' },
    { code: 'pt', country: 'BR', name: 'Português' },
    { code: 'nl', country: 'NL', name: 'Nederlands' },
  ];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
      <FormControl variant="outlined" size="small">
        <InputLabel id="language-select-label">{t('common.language')}</InputLabel>
        <Select
          labelId="language-select-label"
          id="language-select"
          value={i18n.language}
          onChange={(e) => changeLanguage(e.target.value)} // Chama a função com toast
          label={t('common.language')}
          sx={{
            minWidth: 120,
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
            },
          }}
        >
          {languages.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              <ReactCountryFlag
                countryCode={lang.country}
                svg
                style={{
                  width: '1.5em',
                  height: '1.5em',
                  marginRight: theme.spacing(1),
                }}
              />
              <Typography variant="body2">{lang.name}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSwitcher;