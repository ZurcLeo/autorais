// src/pages/Caixinha/components/CaixinhaOverview.js
import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Button,
  Tabs,
  Tab,
  Box
} from '@mui/material';
import {
  Timeline,
  Group,
  AccountBalance,
  Assignment
} from '@mui/icons-material';
import BankingManagement from './BankingManagement';
import ActivityTimeline from './ActivityTimelineItem';
import MembersList from './MembersList';
import LoanManagement from './LoanManagement';
import Reports from './Reports';
import { useTranslation } from 'react-i18next';

const CaixinhaOverview = ({ caixinha }) => {
  const [tabValue, setTabValue] = React.useState(0);
  const { t } = useTranslation();


  const handleContribuir = () => {
    // Implementar lógica de contribuição
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {caixinha.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {caixinha.description}
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {t('totalBalance')}
                </Typography>
                <Typography variant="h6">
                  R$ {caixinha.saldoTotal.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          {/* Add more stats cards */}
        </Grid>

        <Box sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleContribuir}
          >
            {t('makeContribution')}
          </Button>
        </Box>

  <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} variant="scrollable">
  <Tab icon={<Timeline />} label={t('activity')} />
  <Tab icon={<Group />} label={t('members')} />
  <Tab icon={<AccountBalance />} label={t('loans')} />
  <Tab icon={<Assignment />} label={t('reports')} />
  <Tab icon={<AccountBalance />} label={t('banking.travaBancaria')} />
</Tabs>

<Box sx={{ mt: 2 }}>
  {tabValue === 0 && <ActivityTimeline caixinha={caixinha} />}
  {tabValue === 1 && <MembersList caixinha={caixinha} />}
  {tabValue === 2 && <LoanManagement caixinha={caixinha} />}
  {tabValue === 3 && <Reports caixinha={caixinha} />}
  {tabValue === 4 && <BankingManagement caixinhaId={caixinha.id} />}
</Box>
      </CardContent>
    </Card>
  );
};

export default CaixinhaOverview;