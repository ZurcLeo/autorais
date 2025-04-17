// components/NotificationFiltersBar.js
import React from 'react';
import { Box, Tabs, Tab, IconButton, Tooltip, Badge } from '@mui/material';
import { 
  FilterList as FilterIcon, 
  AccessTime as TimeIcon 
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 0,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const NotificationFiltersBar = ({ 
  activeTab, 
  onTabChange, 
  sortOrder, 
  onSortOrderChange, 
  onOpenFilters, 
  unreadCount,
  advancedFilters,
  isMobile
}) => {
  const { t } = useTranslation();
  
  const handleTabChange = (_, newValue) => {
    onTabChange(newValue);
  };
  
  const toggleSortOrder = () => {
    onSortOrderChange(prevSort => prevSort === 'desc' ? 'asc' : 'desc');
  };
  
  const hasAdvancedFilters = 
    advancedFilters.type !== 'all' || 
    advancedFilters.readStatus !== 'all' || 
    advancedFilters.dateRange !== 'all';
  
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mt={2}
    >
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab
          label={
            <Box display="flex" alignItems="center">
              {t('common.all')}
              {unreadCount > 0 && (
                <StyledBadge badgeContent={unreadCount} color="primary" sx={{ ml: 1 }} />
              )}
            </Box>
          }
          value="all"
        />
        <Tab label={t('common.invites')} value="convite" />
        <Tab label={t('common.alerts')} value="alerta" />
        <Tab label={t('common.messages')} value="mensagem" />
      </Tabs>
      
      <Box display="flex" alignItems="center">
        <Tooltip title={t(sortOrder === 'desc' ? 'common.newest_first' : 'common.oldest_first')}>
          <IconButton onClick={toggleSortOrder} size="small">
            <TimeIcon sx={{ transform: sortOrder === 'asc' ? 'rotate(180deg)' : 'none' }} />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={t('notification.advanced_filters')}>
          <IconButton 
            onClick={onOpenFilters} 
            size="small" 
            color={hasAdvancedFilters ? 'primary' : 'default'}
          >
            <FilterIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default NotificationFiltersBar;