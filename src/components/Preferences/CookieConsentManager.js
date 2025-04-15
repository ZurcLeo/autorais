// src/components/Preferences/CookieConsentManager.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { serviceLocator } from '../../core/services/BaseService';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Switch, 
  FormControlLabel, 
  FormGroup, 
  Divider, 
  Slide, 
  Container,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
  Fab,
  Tooltip
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon 
} from '@mui/icons-material';

// Slide transition para o banner
const SlideUpTransition = React.forwardRef((props, ref) => {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Componente principal para gerenciamento de consentimento de cookies
const CookieConsentManager = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const userPreferencesService = serviceLocator.get('userPreferences');
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferencesPanel, setShowPreferencesPanel] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
    thirdParty: false
  });

  // Carregar preferências ao montar o componente
  useEffect(() => {
    const loadCookiePreferences = async () => {
      try {
        // Verificar se o usuário já deu consentimento
        const hasConsent = userPreferencesService.hasCookieConsent();
        
        // Se não houver consentimento, mostrar o banner
        if (!hasConsent) {
          setShowBanner(true);
        }
        
        // Carregar preferências atuais
        const prefs = userPreferencesService.getCookiePreferences();
        setCookiePreferences(prefs);
      } catch (error) {
        console.error('Error loading cookie preferences:', error);
        // Em caso de erro, mostrar o banner por segurança
        setShowBanner(true);
      }
    };
    
    loadCookiePreferences();
  }, []);

  // Manipulador para alteração das preferências
  const handlePreferenceChange = (preference) => {
    setCookiePreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }));
  };

  // Aceitar todas as preferências
  const handleAcceptAll = async () => {
    const newPreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      thirdParty: true,
      consentTimestamp: Date.now()
    };
    
    try {
      await userPreferencesService.setCookiePreferences(newPreferences);
      setCookiePreferences(newPreferences);
      setShowBanner(false);
      setShowPreferencesPanel(false);
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
    }
  };

  // Aceitar apenas cookies necessários
  const handleRejectNonEssential = async () => {
    const newPreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      thirdParty: false,
      consentTimestamp: Date.now()
    };
    
    try {
      await userPreferencesService.setCookiePreferences(newPreferences);
      setCookiePreferences(newPreferences);
      setShowBanner(false);
      setShowPreferencesPanel(false);
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
    }
  };

  // Salvar as preferências personalizadas
  const handleSavePreferences = async () => {
    try {
      const updatedPreferences = {
        ...cookiePreferences,
        consentTimestamp: Date.now()
      };
      
      await userPreferencesService.setCookiePreferences(updatedPreferences);
      setShowBanner(false);
      setShowPreferencesPanel(false);
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
    }
  };

  // Mostrar o painel de preferências
  const handleShowPreferences = () => {
    setShowPreferencesPanel(true);
    setShowBanner(false);
  };

  // Renderizar o botão de configurações quando nenhum banner está visível
  if (!showBanner && !showPreferencesPanel) {
    return (
      <Box sx={{ position: 'fixed', bottom: 80, right: 24, zIndex: 1050 }}>
        <Tooltip title={t('cookies.managePreferences')} placement="left">
          <Fab 
            size="medium" 
            color="default" 
            aria-label={t('cookies.managePreferences')}
            onClick={() => setShowPreferencesPanel(true)}
            sx={{ 
              boxShadow: 3,
              '&:hover': {
                backgroundColor: theme.palette.grey[300]
              }
            }}
          >
            <SettingsIcon />
          </Fab>
        </Tooltip>
      </Box>
    );
  }

  return (
    <>
      {/* Banner de consentimento */}
      <Slide direction="up" in={showBanner && !showPreferencesPanel} mountOnEnter unmountOnExit>
        <Paper 
          elevation={4}
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: 1100,
            borderTop: `1px solid ${theme.palette.divider}`,
            py: 2
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Grid item xs={12} md={7}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {t('cookies.weUseCookies')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('cookies.bannerDescription')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  justifyContent: 'flex-end',
                  gap: 1
                }}>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    size="small"
                    onClick={handleRejectNonEssential}
                  >
                    {t('cookies.rejectNonEssential')}
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    size="small"
                    onClick={handleShowPreferences}
                  >
                    {t('cookies.customize')}
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="small"
                    onClick={handleAcceptAll}
                  >
                    {t('cookies.acceptAll')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Paper>
      </Slide>

      {/* Diálogo de preferências detalhado */}
      <Dialog
        open={showPreferencesPanel}
        onClose={() => setShowPreferencesPanel(false)}
        fullScreen={isMobile}
        maxWidth="md"
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: 'sticky',
          top: 0,
          backgroundColor: theme.palette.background.paper,
          zIndex: 10
        }}>
          <Typography variant="h6">{t('cookies.cookiePreferences')}</Typography>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={() => {
              setShowPreferencesPanel(false);
              setShowBanner(true);
            }} 
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant="body1" paragraph>
            {t('cookies.preferencesDescription')}
          </Typography>
          
          {/* Categorias de cookies */}
          <Box sx={{ mt: 3 }}>
            {/* Cookies Necessários */}
            <Accordion defaultExpanded sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="necessary-cookies-content"
                id="necessary-cookies-header"
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pr: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {t('cookies.necessary.title')}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={cookiePreferences.necessary} 
                        disabled 
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                      />
                    }
                    label=""
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    sx={{ ml: 2, mr: 0 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {t('cookies.necessary.purpose')}
                </Typography>
                <Typography variant="body2">
                  {t('cookies.necessary.details')}
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            {/* Cookies Funcionais */}
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="functional-cookies-content"
                id="functional-cookies-header"
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pr: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {t('cookies.functionality.title')}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={cookiePreferences.functional} 
                        onChange={() => handlePreferenceChange('functional')}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                      />
                    }
                    label=""
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    sx={{ ml: 2, mr: 0 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {t('cookies.functionality.purpose')}
                </Typography>
                <Typography variant="body2">
                  {t('cookies.functionality.details')}
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            {/* Cookies Analíticos */}
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="analytics-cookies-content"
                id="analytics-cookies-header"
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pr: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {t('cookies.analytics.title')}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={cookiePreferences.analytics} 
                        onChange={() => handlePreferenceChange('analytics')}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                      />
                    }
                    label=""
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    sx={{ ml: 2, mr: 0 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {t('cookies.analytics.purpose')}
                </Typography>
                <Typography variant="body2">
                  {t('cookies.analytics.details')}
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            {/* Cookies de Marketing */}
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="marketing-cookies-content"
                id="marketing-cookies-header"
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pr: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {t('cookies.marketing.title')}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={cookiePreferences.marketing} 
                        onChange={() => handlePreferenceChange('marketing')}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                      />
                    }
                    label=""
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    sx={{ ml: 2, mr: 0 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {t('cookies.marketing.purpose')}
                </Typography>
                <Typography variant="body2">
                  {t('cookies.marketing.details')}
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            {/* Cookies de Terceiros */}
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="thirdparty-cookies-content"
                id="thirdparty-cookies-header"
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pr: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {t('cookies.thirdParty.title')}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={cookiePreferences.thirdParty} 
                        onChange={() => handlePreferenceChange('thirdParty')}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                      />
                    }
                    label=""
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    sx={{ ml: 2, mr: 0 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {t('cookies.thirdParty.purpose')}
                </Typography>
                <Typography variant="body2">
                  {t('cookies.thirdParty.details')}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
          position: 'sticky',
          bottom: 0,
          backgroundColor: theme.palette.background.paper,
          zIndex: 10
        }}>
          <Button 
            variant="outlined" 
            color="inherit"
            onClick={handleRejectNonEssential}
            fullWidth={isMobile}
          >
            {t('cookies.rejectNonEssential')}
          </Button>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            flexDirection: { xs: 'column', sm: 'row' },
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={handleAcceptAll}
              fullWidth={isMobile}
            >
              {t('cookies.acceptAll')}
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSavePreferences}
              fullWidth={isMobile}
            >
              {t('cookies.savePreferences')}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CookieConsentManager;