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
  AccountBox as AccountBoxIcon,
  Gavel as GavelIcon,
  Payment as PaymentIcon,
  Block as BlockIcon,
  Code as CodeIcon,
  Copyright as CopyrightIcon,
} from '@mui/icons-material';

const TermsSection = ({ title, icon: Icon, children, lastUpdate }) => {
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
          '&:hover': { backgroundColor: 'action.hover' },
        }}
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
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
          <IconButton size="small">
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

const TermsOfUse = () => {
  const { t } = useTranslation();

  const sections = [
    {
      id: 'account',
      title: t('termsOfUse.account.title'),
      icon: AccountBoxIcon,
      lastUpdate: '2024-01-15',
      content: (
        <>
          <Typography variant="body1" paragraph>
            {t('termsOfUse.account.description')}
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary={t('termsOfUse.account.creation.title')}
                secondary={t('termsOfUse.account.creation.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('termsOfUse.account.security.title')}
                secondary={t('termsOfUse.account.security.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('termsOfUse.account.updates.title')}
                secondary={t('termsOfUse.account.updates.description')}
              />
            </ListItem>
          </List>
        </>
      ),
    },
    {
      id: 'services',
      title: t('termsOfUse.services.title'),
      icon: CodeIcon,
      lastUpdate: '2024-01-15',
      content: (
        <>
          <Typography variant="body1" paragraph>
            {t('termsOfUse.services.description')}
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary={t('termsOfUse.services.acceptableUse.title')}
                secondary={t('termsOfUse.services.acceptableUse.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('termsOfUse.services.availability.title')}
                secondary={t('termsOfUse.services.availability.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('termsOfUse.services.api.title')}
                secondary={t('termsOfUse.services.api.description')}
              />
            </ListItem>
          </List>
        </>
      ),
    },
    {
      id: 'payment',
      title: t('termsOfUse.payment.title'),
      icon: PaymentIcon,
      lastUpdate: '2024-01-15',
      content: (
        <>
          <Typography variant="body1" paragraph>
            {t('termsOfUse.payment.description')}
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary={t('termsOfUse.payment.billing.title')}
                secondary={t('termsOfUse.payment.billing.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('termsOfUse.payment.methods.title')}
                secondary={t('termsOfUse.payment.methods.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('termsOfUse.payment.refunds.title')}
                secondary={t('termsOfUse.payment.refunds.description')}
              />
            </ListItem>
          </List>
        </>
      ),
    },
    {
      id: 'prohibited',
      title: t('termsOfUse.prohibited.title'),
      icon: BlockIcon,
      lastUpdate: '2024-01-15',
      content: (
        <>
          <Typography variant="body1" paragraph>
            {t('termsOfUse.prohibited.description')}
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary={t('termsOfUse.prohibited.illegal.title')}
                secondary={t('termsOfUse.prohibited.illegal.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('termsOfUse.prohibited.abuse.title')}
                secondary={t('termsOfUse.prohibited.abuse.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('termsOfUse.prohibited.access.title')}
                secondary={t('termsOfUse.prohibited.access.description')}
              />
            </ListItem>
          </List>
        </>
      ),
    },
    {
      id: 'liability',
      title: t('termsOfUse.liability.title'),
      icon: GavelIcon,
      lastUpdate: '2024-01-15',
      content: (
        <>
          <Typography variant="body1" paragraph>
            {t('termsOfUse.liability.description')}
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary={t('termsOfUse.liability.warranty.title')}
                secondary={t('termsOfUse.liability.warranty.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('termsOfUse.liability.limitation.title')}
                secondary={t('termsOfUse.liability.limitation.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('termsOfUse.liability.indemnification.title')}
                secondary={t('termsOfUse.liability.indemnification.description')}
              />
            </ListItem>
          </List>
        </>
      ),
    },
    {
      id: 'intellectual',
      title: t('termsOfUse.intellectual.title'),
      icon: CopyrightIcon,
      lastUpdate: '2024-01-15',
      content: (
        <>
          <Typography variant="body1" paragraph>
            {t('termsOfUse.intellectual.description')}
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary={t('termsOfUse.intellectual.ownership.title')}
                secondary={t('termsOfUse.intellectual.ownership.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('termsOfUse.intellectual.content.title')}
                secondary={t('termsOfUse.intellectual.content.description')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('termsOfUse.intellectual.feedback.title')}
                secondary={t('termsOfUse.intellectual.feedback.description')}
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
        {t('termsOfUse.title')}
      </Typography>
      <Typography variant="body2" align="center" color="textSecondary" gutterBottom>
        {t('termsOfUse.lastUpdated')} January 15, 2024
      </Typography>
      <Typography variant="body1" paragraph align="center">
        {t('termsOfUse.intro')}
      </Typography>

      <Box sx={{ marginTop: 4 }}>
        {sections.map((section) => (
          <TermsSection
            key={section.id}
            title={section.title}
            icon={section.icon}
            lastUpdate={section.lastUpdate}
          >
            {section.content}
          </TermsSection>
        ))}
      </Box>

      <Box sx={{ marginTop: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {t('termsOfUse.contact')}
        </Typography>
        <Link href="mailto:legal@eloscloud.com" color="primary" underline="hover">
          legal@eloscloud.com.br
        </Link>
      </Box>
    </Container>
  );
};

export default TermsOfUse;