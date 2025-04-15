// src/components/Layout/LanguageSwitcher.js - Versão Melhorada
import React, { useState, useEffect } from 'react';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  CircularProgress,
  Tooltip,
  useMediaQuery,
  List
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import ReactCountryFlag from 'react-country-flag';
import LanguageIcon from '@mui/icons-material/Language';
import { coreLogger } from './core/logging';
import { LOG_LEVELS } from './core/constants/config';

const MODULE_NAME = 'LanguageSwitcher';

const LanguageSwitcher = ({ isSidebarCollapsed = false, inMenu = false }) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [loadingLang, setLoadingLang] = useState(null);

  // Disponibilizar mais idiomas facilmente aqui
  const languages = [
    { code: 'en', country: 'US', name: 'English' },
    { code: 'pt', country: 'BR', name: 'Português' },
    { code: 'nl', country: 'NL', name: 'Nederlands' },
    // Facilmente extensível para adicionar mais idiomas
  ];

  const handleMenuOpen = (event) => {
    if (!inMenu) {
      setAnchorEl(event.currentTarget);
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Language menu opened');
    }
  };

  const handleMenuClose = () => {
    if (!inMenu) {
      setAnchorEl(null);
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Language menu closed');
    }
  };

  // Função assíncrona para mudar o idioma com indicador de carregamento
  const changeLanguage = async (langCode) => {
    if (langCode === i18n.language) {
      handleMenuClose();
      return;
    }

    try {
      setLoadingLang(langCode);
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Language change initiated', {
        from: i18n.language,
        to: langCode
      });

      await i18n.changeLanguage(langCode);
      
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Language changed successfully', {
        to: langCode
      });
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Language change failed', {
        error: error.message
      });
    } finally {
      setLoadingLang(null);
      handleMenuClose();
    }
  };

  // Encontrar o idioma atual para exibição
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Se estiver sendo renderizado dentro do menu dropdown do usuário
  if (inMenu) {
    return (
      <List sx={{ width: '100%', p: 0 }}>
        {languages.map((lang) => (
          <MenuItem 
            key={lang.code} 
            onClick={() => changeLanguage(lang.code)}
            selected={i18n.language === lang.code}
            disabled={loadingLang === lang.code}
            sx={{
              py: 1.5,
              borderLeft: i18n.language === lang.code ? 
                `4px solid ${theme.palette.primary.main}` : 
                '4px solid transparent'
            }}
          >
            <ListItemIcon>
              {loadingLang === lang.code ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <ReactCountryFlag
                  countryCode={lang.country}
                  svg
                  style={{
                    width: '1.5em',
                    height: '1.5em',
                  }}
                />
              )}
            </ListItemIcon>
            <ListItemText 
              primary={lang.name} 
              primaryTypographyProps={{
                fontWeight: i18n.language === lang.code ? 'bold' : 'regular'
              }}
            />
          </MenuItem>
        ))}
      </List>
    );
  }

  // Versão padrão para a barra de navegação
  return (
    <>
      <Tooltip title={t('common.language')} arrow placement="bottom">
        <IconButton
          onClick={handleMenuOpen}
          color="inherit"
          aria-label={t('common.selectLanguage')}
          aria-controls="language-menu"
          aria-haspopup="true"
          aria-expanded={Boolean(anchorEl) ? 'true' : 'false'}
          size="medium"
          sx={{ mx: 0.5 }}
        >
          {isSidebarCollapsed || isMobile ? (
            <LanguageIcon />
          ) : (
            <ReactCountryFlag
              countryCode={currentLanguage.country}
              svg
              aria-label={currentLanguage.name}
              style={{
                width: '1.5em',
                height: '1.5em',
                borderRadius: '50%',
                objectFit: 'cover',
                boxShadow: theme.shadows[1]
              }}
            />
          )}
        </IconButton>
      </Tooltip>

      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { 
            minWidth: 180,
            maxHeight: '80vh' // Evitar problemas em telas pequenas
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Typography 
          variant="subtitle2" 
          sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 'bold' }}
        >
          {t('common.selectLanguage')}
        </Typography>

        {languages.map((lang) => (
          <MenuItem 
            key={lang.code} 
            onClick={() => changeLanguage(lang.code)}
            selected={i18n.language === lang.code}
            disabled={loadingLang === lang.code}
            sx={{
              py: 1.5,
              borderLeft: i18n.language === lang.code ? 
                `4px solid ${theme.palette.primary.main}` : 
                '4px solid transparent'
            }}
          >
            <ListItemIcon>
              {loadingLang === lang.code ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <ReactCountryFlag
                  countryCode={lang.country}
                  svg
                  style={{
                    width: '1.5em',
                    height: '1.5em',
                  }}
                />
              )}
            </ListItemIcon>
            <ListItemText 
              primary={lang.name} 
              primaryTypographyProps={{
                fontWeight: i18n.language === lang.code ? 'bold' : 'regular'
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;