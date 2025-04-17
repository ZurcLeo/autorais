// components/NotificationFilterDrawer.js
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Chip, 
  Button, 
  SwipeableDrawer 
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const NotificationFilterDrawer = ({ 
  open, 
  onClose, 
  onApplyFilters, 
  currentFilters,
  isMobile
}) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState(currentFilters || {
    type: 'all',
    readStatus: 'all',
    dateRange: 'all'
  });

  const handleFilterChange = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  return (
    <SwipeableDrawer
      anchor={isMobile ? 'bottom' : 'right'}
      open={open}
      onClose={onClose}
      onOpen={() => {}}
    >
      <Box sx={{ p: 2, width: 320, maxWidth: '100%' }}>
        <Typography variant="h6" gutterBottom>
          {t('notification.advanced_filters')}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('notification.filter_by_type')}
          </Typography>
          <Grid container spacing={1}>
            {['all', 'convite', 'alerta', 'mensagem'].map(type => (
              <Grid item key={type}>
                <Chip
                  label={t(`common.${type}`)}
                  onClick={() => handleFilterChange('type', type)}
                  color={filters.type === type ? 'primary' : 'default'}
                  variant={filters.type === type ? 'filled' : 'outlined'}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('notification.filter_by_status')}
          </Typography>
          <Grid container spacing={1}>
            {[
              { id: 'all', label: 'all_status' },
              { id: 'read', label: 'read_only' },
              { id: 'unread', label: 'unread_only' }
            ].map(status => (
              <Grid item key={status.id}>
                <Chip
                  label={t(`notification.${status.label}`)}
                  onClick={() => handleFilterChange('readStatus', status.id)}
                  color={filters.readStatus === status.id ? 'primary' : 'default'}
                  variant={filters.readStatus === status.id ? 'filled' : 'outlined'}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('notification.filter_by_date')}
          </Typography>
          <Grid container spacing={1}>
            {[
              { id: 'all', label: 'all_time' },
              { id: 'today', label: 'today' },
              { id: 'week', label: 'this_week' },
              { id: 'month', label: 'this_month' }
            ].map(period => (
              <Grid item key={period.id}>
                <Chip
                  label={t(`time.${period.label}`)}
                  onClick={() => handleFilterChange('dateRange', period.id)}
                  color={filters.dateRange === period.id ? 'primary' : 'default'}
                  variant={filters.dateRange === period.id ? 'filled' : 'outlined'}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
        
        <Box display="flex" justifyContent="flex-end" gap={1}>
          <Button variant="outlined" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="contained" onClick={handleApply}>
            {t('common.apply')}
          </Button>
        </Box>
      </Box>
    </SwipeableDrawer>
  );
};

export default NotificationFilterDrawer;