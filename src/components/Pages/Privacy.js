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

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  const sections = [
    {
      id: 'collection',
      title: t('privacyPolicy.dataCollection.title'),
      icon: StorageIcon,
      lastUpdate: '2024-01-15',
      content: (
        <>
          <Typography variant="body1" paragraph>
            {t('privacyPolicy.dataCollection.description')}
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary={t('privacyPolicy.dataCollection.accountInfo.title')}
                secondary={t('privacyPolicy.dataCollection.accountInfo.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('privacyPolicy.dataCollection.usageData.title')}
                secondary={t('privacyPolicy.dataCollection.usageData.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('privacyPolicy.dataCollection.technicalData.title')}
                secondary={t('privacyPolicy.dataCollection.technicalData.description')}
              />
            </ListItem>
          </List>
        </>
      ),
    },
    {
      id: 'use',
      title: t('privacyPolicy.dataUsage.title'),
      icon: SettingsIcon,
      lastUpdate: '2024-01-15',
      content: (
        <>
          <Typography variant="body1" paragraph>
            {t('privacyPolicy.dataUsage.description')}
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary={t('privacyPolicy.dataUsage.coreServices.title')}
                secondary={t('privacyPolicy.dataUsage.coreServices.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('privacyPolicy.dataUsage.userExperience.title')}
                secondary={t('privacyPolicy.dataUsage.userExperience.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('privacyPolicy.dataUsage.security.title')}
                secondary={t('privacyPolicy.dataUsage.security.description')}
              />
            </ListItem>
          </List>
        </>
      ),
    },
    {
      id: 'sharing',
      title: t('privacyPolicy.dataSharing.title'),
      icon: PeopleIcon,
      lastUpdate: '2024-01-15',
      content: (
        <>
          <Typography variant="body1" paragraph>
            {t('privacyPolicy.dataSharing.description')}
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary={t('privacyPolicy.dataSharing.consent.title')}
                secondary={t('privacyPolicy.dataSharing.consent.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('privacyPolicy.dataSharing.providers.title')}
                secondary={t('privacyPolicy.dataSharing.providers.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('privacyPolicy.dataSharing.legal.title')}
                secondary={t('privacyPolicy.dataSharing.legal.description')}
              />
            </ListItem>
          </List>
        </>
      ),
    },
    {
      id: 'security',
      title: t('privacyPolicy.securityMeasures.title'),
      icon: SecurityIcon,
      lastUpdate: '2024-01-15',
      content: (
        <>
          <Typography variant="body1" paragraph>
            {t('privacyPolicy.securityMeasures.description')}
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary={t('privacyPolicy.securityMeasures.encryption.title')}
                secondary={t('privacyPolicy.securityMeasures.encryption.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('privacyPolicy.securityMeasures.accessControls.title')}
                secondary={t('privacyPolicy.securityMeasures.accessControls.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('privacyPolicy.securityMeasures.audits.title')}
                secondary={t('privacyPolicy.securityMeasures.audits.description')}
              />
            </ListItem>
          </List>
        </>
      ),
    },
    {
      id: 'international',
      title: t('privacyPolicy.internationalData.title'),
      icon: PublicIcon,
      lastUpdate: '2024-01-15',
      content: (
        <>
          <Typography variant="body1" paragraph>
            {t('privacyPolicy.internationalData.description')}
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary={t('privacyPolicy.internationalData.gdpr.title')}
                secondary={t('privacyPolicy.internationalData.gdpr.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('privacyPolicy.internationalData.safeguards.title')}
                secondary={t('privacyPolicy.internationalData.safeguards.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('privacyPolicy.internationalData.compliance.title')}
                secondary={t('privacyPolicy.internationalData.compliance.description')}
              />
            </ListItem>
          </List>
        </>
      ),
    },
  ];

  return (
    <Container sx={{ paddingY: 4, maxWidth: 'md' }}>
      <Typography variant="h4" align="center" gutterBottom>
        {t('privacyPolicy.title')}
      </Typography>
      <Typography variant="body2" align="center" color="textSecondary" gutterBottom>
        {t('privacyPolicy.lastUpdated')} January 15, 2024
      </Typography>
      <Typography variant="body1" paragraph align="center">
        {t('privacyPolicy.intro')}
      </Typography>

      <Box sx={{ marginTop: 4 }}>
        {sections.map((section) => (
          <PrivacySection
            key={section.id}
            title={section.title}
            icon={section.icon}
            lastUpdate={section.lastUpdate}
          >
            {section.content}
          </PrivacySection>
        ))}
      </Box>

      <Box sx={{ marginTop: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {t('privacyPolicy.contact')}
        </Typography>
        <Link href="mailto:privacy@eloscloud.com" color="primary" underline="hover">
          privacidade@eloscloud.com.br
        </Link>
      </Box>
    </Container>
  );
};

export default PrivacyPolicy;