import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Box,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const StatCard = ({ icon: Icon, title, value, subtitle, progress }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Icon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ mb: 1 }}>
        {value}
      </Typography>
      <Typography color="text.secondary" variant="body2">
        {subtitle}
      </Typography>
      {progress !== undefined && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}
    </CardContent>
  </Card>
);

const CaixinhaStats = ({ caixinhas = [] }) => {
  const { t } = useTranslation();

  // Calculate statistics from caixinhas data
  const totalBalance = caixinhas.reduce((sum, cx) => sum + (cx.saldoTotal || 0), 0);
  const totalMembers = caixinhas.reduce((sum, cx) => sum + (cx.members?.length || 0), 0);
  const totalContributions = caixinhas.reduce((sum, cx) => sum + (cx.contribuicao?.length || 0), 0);
  
  // Calculate average participation rate
  const participationRate = caixinhas.length > 0
    ? (totalContributions / (totalMembers * caixinhas.length)) * 100
    : 0;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          icon={AccountBalanceIcon}
          title={t('stats.totalBalance')}
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(totalBalance)}
          subtitle={t('stats.activeCaixinhas', { count: caixinhas.length })}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          icon={GroupIcon}
          title={t('stats.totalMembers')}
          value={totalMembers}
          subtitle={t('stats.averagePerGroup', {
            average: (totalMembers / (caixinhas.length || 1)).toFixed(1)
          })}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          icon={TrendingUpIcon}
          title={t('stats.totalContributions')}
          value={totalContributions}
          subtitle={t('stats.monthlyAverage', {
            average: (totalContributions / (caixinhas.length || 1)).toFixed(1)
          })}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          icon={AssessmentIcon}
          title={t('stats.participationRate')}
          value={`${participationRate.toFixed(1)}%`}
          subtitle={t('stats.participationTrend')}
          progress={participationRate}
        />
      </Grid>
    </Grid>
  );
};

export default CaixinhaStats;