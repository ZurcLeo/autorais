import React from 'react';
import { Typography, Box, Divider, List, ListItem, ListItemIcon, ListItemText, Avatar } from '@mui/material';
import {
  Payment as PaymentIcon,
  AccountBalance as LoanIcon,
  Person as PersonIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Helper function to format dates consistently
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Helper to get icon based on activity type
const getActivityIcon = (type) => {
  switch (type) {
    case 'contribuicao':
      return <PaymentIcon />;
    case 'emprestimo':
      return <LoanIcon />;
    case 'novo_membro':
      return <PersonIcon />;
    default:
      return <StarIcon />;
  }
};

// Helper to get color based on activity type
const getActivityColor = (type) => {
  switch (type) {
    case 'contribuicao':
      return 'green';
    case 'emprestimo':
      return 'blue';
    case 'novo_membro':
      return 'orange';
    default:
      return 'purple';
  }
};

const ActivityTimelineItem = ({ activity }) => {
  const { t } = useTranslation('timeline');

  return (
    <ListItem alignItems="flex-start" sx={{ pl: 0, pr: 0 }}>
      <ListItemIcon>
        <Avatar sx={{ bgcolor: getActivityColor(activity.tipo) }}>
          {getActivityIcon(activity.tipo)}
        </Avatar>
      </ListItemIcon>
      <ListItemText
        primary={t(`activity.${activity.tipo}.title`)}
        secondary={
          <>
            <Typography variant="body2" color="textSecondary" component="span">
              {t(`activity.${activity.tipo}.description`, {
                usuario: activity.usuario,
              })}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="textSecondary">
                {activity.usuario}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {formatDate(activity.data)}
              </Typography>
            </Box>
          </>
        }
      />
    </ListItem>
  );
};

const ActivityTimeline = ({ caixinha }) => {
  const { t } = useTranslation('timeline');
  const sortedActivities = [...(caixinha.atividades || [])].sort(
    (a, b) => new Date(b.data) - new Date(a.data)
  );

  if (sortedActivities.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="textSecondary">{t('noActivities')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t('activityTimeline')}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List>
        {sortedActivities.map((activity, index) => (
          <React.Fragment key={activity.id || index}>
            <ActivityTimelineItem activity={activity} />
            {index < sortedActivities.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default ActivityTimeline;