import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Container,
  Chip,
  IconButton,
  Collapse,
  Link,
  Paper,
  Grid,
  Button,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccessTime as AccessTimeIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  Storage as StorageIcon,
  Settings as SettingsIcon,
  Public as PublicIcon,
  Info as InfoIcon,
  Cookie as CookieIcon,
  BubbleChart as BubbleChartIcon,
  Speed as SpeedIcon,
  Extension as ExtensionIcon,
  BarChart as BarChartIcon,
  Layers as LayersIcon,
  GavelRounded as GavelIcon,
  Block as BlockIcon,
} from '@mui/icons-material';

const PrivacySection = ({ title, icon: Icon, children, lastUpdate }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card elevation={3} sx={{ marginBottom: 2, borderRadius: 2 }}>
      <Box
        sx={{
          padding: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          backgroundColor: expanded ? 'primary.light' : 'background.paper',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`Toggle ${title}`}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Icon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {lastUpdate && (
            <Chip
              label={`Updated: ${lastUpdate}`}
              icon={<AccessTimeIcon />}
              variant="outlined"
              size="small"
            />
          )}
          <IconButton size="small" aria-label={`Expand ${title}`}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <CardContent>{children}</CardContent>
      </Collapse>
    </Card>
  );
};

const SubSection = ({ title, description, children }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" paragraph>
          {description}
        </Typography>
      )}
      {children}
    </Box>
  );
};

const CookieTypeDescription = ({ title, purpose, details, duration, tools, control }) => {
  return (
    <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      {purpose && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>{purpose}</strong>
        </Typography>
      )}
      {details && (
        <Typography variant="body2" paragraph>
          {details}
        </Typography>
      )}
      {duration && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {duration}
        </Typography>
      )}
      {tools && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {tools}
        </Typography>
      )}
      {control && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {control}
        </Typography>
      )}
    </Box>
  );
};

const CookiePolicy = () => {
  const { t } = useTranslation();
  const lastUpdateDate = "01/03/2025"; // Você pode obter isso do seu JSON também

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2, 
          bgcolor: 'primary.light', 
          color: 'primary.contrastText' 
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          {t('cookiePolicy.title')}
        </Typography>
        <Typography variant="subtitle1">
          {t('cookiePolicy.lastUpdated')} {lastUpdateDate}
        </Typography>
      </Paper>

      <Typography variant="body1" paragraph>
        {t('cookiePolicy.intro')}
      </Typography>
      
      <Typography variant="body1" paragraph>
        {t('cookiePolicy.contact')} <Link href="mailto:contato@eloscloud.com.br">contato@eloscloud.com.br</Link>
      </Typography>

      <PrivacySection 
        title={t('cookiePolicy.whatAreCookies.title')} 
        icon={CookieIcon}
      >
        <Typography variant="body1">
          {t('cookiePolicy.whatAreCookies.description')}
        </Typography>
      </PrivacySection>

      <PrivacySection 
        title={t('cookiePolicy.cookieTypes.title')} 
        icon={LayersIcon}
      >
        <Typography variant="body1" paragraph>
          {t('cookiePolicy.cookieTypes.description')}
        </Typography>

        <CookieTypeDescription 
          title={t('cookiePolicy.cookieTypes.essential.title')}
          purpose={t('cookiePolicy.cookieTypes.essential.purpose')}
          details={t('cookiePolicy.cookieTypes.essential.details')}
          duration={t('cookiePolicy.cookieTypes.essential.duration')}
        />

        <CookieTypeDescription 
          title={t('cookiePolicy.cookieTypes.performance.title')}
          purpose={t('cookiePolicy.cookieTypes.performance.purpose')}
          details={t('cookiePolicy.cookieTypes.performance.details')}
          duration={t('cookiePolicy.cookieTypes.performance.duration')}
        />

        <CookieTypeDescription 
          title={t('cookiePolicy.cookieTypes.functionality.title')}
          purpose={t('cookiePolicy.cookieTypes.functionality.purpose')}
          details={t('cookiePolicy.cookieTypes.functionality.details')}
          duration={t('cookiePolicy.cookieTypes.functionality.duration')}
        />

        <CookieTypeDescription 
          title={t('cookiePolicy.cookieTypes.analytics.title')}
          purpose={t('cookiePolicy.cookieTypes.analytics.purpose')}
          details={t('cookiePolicy.cookieTypes.analytics.details')}
          tools={t('cookiePolicy.cookieTypes.analytics.tools')}
          duration={t('cookiePolicy.cookieTypes.analytics.duration')}
        />

        <CookieTypeDescription 
          title={t('cookiePolicy.cookieTypes.thirdParty.title')}
          purpose={t('cookiePolicy.cookieTypes.thirdParty.purpose')}
          details={t('cookiePolicy.cookieTypes.thirdParty.details')}
          control={t('cookiePolicy.cookieTypes.thirdParty.control')}
        />
      </PrivacySection>

      <PrivacySection 
        title={t('cookiePolicy.cookieManagement.title')} 
        icon={SettingsIcon}
      >
        <Typography variant="body1" paragraph>
          {t('cookiePolicy.cookieManagement.description')}
        </Typography>

        <SubSection 
          title={t('cookiePolicy.cookieManagement.browserSettings.title')}
          description={t('cookiePolicy.cookieManagement.browserSettings.description')}
        />

        <SubSection 
          title={t('cookiePolicy.cookieManagement.consentBanner.title')}
          description={t('cookiePolicy.cookieManagement.consentBanner.description')}
        />

        <SubSection 
          title={t('cookiePolicy.cookieManagement.preferencesPanel.title')}
          description={t('cookiePolicy.cookieManagement.preferencesPanel.description')}
        />

        <Box sx={{ mt: 3 }}>
          <Button variant="contained" color="primary">
            Abrir Preferências de Cookies
          </Button>
        </Box>
      </PrivacySection>

      <PrivacySection 
        title={t('cookiePolicy.policyChanges.title')} 
        icon={InfoIcon}
      >
        <Typography variant="body1">
          {t('cookiePolicy.policyChanges.description')}
        </Typography>
      </PrivacySection>

      <PrivacySection 
        title={t('cookiePolicy.legalBasis.title')} 
        icon={GavelIcon}
      >
        <Typography variant="body1" paragraph>
          {t('cookiePolicy.legalBasis.description')}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {t('cookiePolicy.legalBasis.consent.title')}
              </Typography>
              <Typography variant="body2">
                {t('cookiePolicy.legalBasis.consent.description')}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {t('cookiePolicy.legalBasis.legitimateInterest.title')}
              </Typography>
              <Typography variant="body2">
                {t('cookiePolicy.legalBasis.legitimateInterest.description')}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {t('cookiePolicy.legalBasis.contractualObligation.title')}
              </Typography>
              <Typography variant="body2">
                {t('cookiePolicy.legalBasis.contractualObligation.description')}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </PrivacySection>

      <PrivacySection 
        title={t('cookiePolicy.refusalImpact.title')} 
        icon={BlockIcon}
      >
        <Typography variant="body1" paragraph>
          {t('cookiePolicy.refusalImpact.description')}
        </Typography>

        <List>
          <ListItem>
            <ListItemText 
              primary={t('cookiePolicy.refusalImpact.essential.title')}
              secondary={t('cookiePolicy.refusalImpact.essential.description')}
            />
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary={t('cookiePolicy.refusalImpact.performance.title')}
              secondary={t('cookiePolicy.refusalImpact.performance.description')}
            />
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary={t('cookiePolicy.refusalImpact.functionality.title')}
              secondary={t('cookiePolicy.refusalImpact.functionality.description')}
            />
          </ListItem>
        </List>
      </PrivacySection>
    </Container>
  );
};

export default CookiePolicy;