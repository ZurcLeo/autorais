import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Add as AddIcon,
  Assignment as AssignmentIcon,
  AttachMoney as AttachMoneyIcon,
  Close as CloseIcon,
  CreditCard as CreditCardIcon,
  ExpandMore as ExpandMoreIcon,
  Group as GroupIcon,
  MoreVert as MoreVertIcon,
  Notifications as NotificationsIcon,
  Payments as PaymentsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import ActivityTimeline from './ActivityTimelineItem';
import MembersList from './MembersList';
import LoanManagement from './LoanManagement';
import BankingManagement from './BankingManagement';
import Reports from './Reports';
import { serviceLocator } from '../../core/services/BaseService';

const CaixinhaOverview = ({ caixinha }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const caixinhaStore = serviceLocator.get('store').getState()?.caixinhas;
  const [activeSection, setActiveSection] = useState('overview');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [contributionDialog, setContributionDialog] = useState(false);
  const [contributionAmount, setContributionAmount] = useState(caixinha?.contribuicaoMensal || '');

  // Simulated data
  const balanceHistory = [
    { month: 'Jan', balance: 2500 },
    { month: 'Fev', balance: 3200 },
    { month: 'Mar', balance: 4100 },
    { month: 'Abr', balance: 4800 },
    { month: 'Mai', balance: 5400 },
    { month: 'Jun', balance: 6200 },
  ];

  const notifications = [
    { type: 'payment', message: 'Nova contribuição recebida', time: '10min' },
    { type: 'member', message: 'João aceitou seu convite', time: '2h' },
    { type: 'alert', message: 'Distribuição agendada para amanhã', time: '5h' },
  ];

  const nextDistribution = {
    date: new Date(new Date().setDate(new Date().getDate() + 15)),
    amount: caixinha?.saldoTotal || 0,
    member: 'Maria Silva'
  };

  console.log('caixinhas: ', caixinhaStore)

  const toggleExpand = (section) => {
    setExpanded({ ...expanded, [section]: !expanded[section] });
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleContribute = () => {
    setContributionDialog(true);
  };

  const handleContributionSubmit = () => {
    // Implement API call to submit contribution
    console.log('Contributing amount:', contributionAmount);
    setContributionDialog(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderProgressBar = (value, max) => {
    const percentage = (value / max) * 100;
    return (
      <Box sx={{ position: 'relative', width: '100%', mt: 2 }}>
        <Box sx={{ height: 8, width: '100%', bgcolor: 'grey.100', borderRadius: 4 }}>
          <Box
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'primary.main',
              width: `${percentage}%`,
              background: 'linear-gradient(90deg, #3f51b5 0%, #2196f3 100%)',
            }}
          />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: -20,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'text.secondary',
          }}
        >
          {percentage.toFixed(0)}%
        </Box>
      </Box>
    );
  };

  const renderNotificationsDrawer = () => (
    <Drawer
      anchor="right"
      open={showNotifications}
      onClose={() => setShowNotifications(false)}
    >
      <Box sx={{ width: 320, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{t('notifications')}</Typography>
          <IconButton onClick={() => setShowNotifications(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <List>
          {notifications.map((notification, index) => (
            <ListItem 
              key={index} 
              sx={{ 
                mb: 1, 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                boxShadow: 1
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ 
                  bgcolor: 
                    notification.type === 'payment' ? 'success.light' : 
                    notification.type === 'member' ? 'info.light' : 'warning.light' 
                }}>
                  {notification.type === 'payment' ? <PaymentsIcon /> : 
                   notification.type === 'member' ? <PersonIcon /> : <NotificationsIcon />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary={notification.message}
                secondary={notification.time}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );

  const renderOverviewSection = () => (
    <Grid container spacing={3}>
      {/* Quick Stats */}
      <Grid item xs={12} md={4}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
            {t('totalBalance')}
          </Typography>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
            {formatCurrency(caixinha?.saldoTotal || 0)}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {t('totalMembers')}
              </Typography>
              <Typography variant="h6">
                {caixinha?.members?.length || 0}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {t('monthlyContribution')}
              </Typography>
              <Typography variant="h6">
                {formatCurrency(caixinha?.contribuicaoMensal || 0)}
              </Typography>
            </Box>
          </Box>
          
          <Button 
            variant="contained" 
            startIcon={<AttachMoneyIcon />}
            onClick={handleContribute}
            sx={{ 
              mt: 'auto', 
              borderRadius: 8,
              py: 1,
              background: 'linear-gradient(45deg, #2196F3 30%, #3f51b5 90%)',
              boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            {t('makeContribution')}
          </Button>
        </Paper>
      </Grid>
      
      {/* Balance History Chart */}
      <Grid item xs={12} md={8}>
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
            {t('balanceHistory')}
          </Typography>
          <Box sx={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={balanceHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <RechartsTooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => `${label}/${new Date().getFullYear()}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#3f51b5" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
      
      {/* Next Distribution */}
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {t('nextDistribution')}
            </Typography>
            <Chip 
              label={formatDate(nextDistribution.date)} 
              color="primary" 
              variant="outlined"
              size="small"
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
            <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {t('recipient')}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {nextDistribution.member}
              </Typography>
            </Box>
            <Box sx={{ ml: 'auto', textAlign: 'right' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {t('amount')}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {formatCurrency(nextDistribution.amount)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
      
      {/* Recent Activity */}
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
            {t('recentActivity')}
          </Typography>
          
          <List sx={{ maxHeight: 200, overflow: 'auto' }}>
            {(caixinha?.atividades || []).slice(0, 3).map((activity, index) => (
              <ListItem key={activity.id || index} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                    {activity.tipo === 'contribuicao' ? (
                      <PaymentsIcon />
                    ) : activity.tipo === 'emprestimo' ? (
                      <CreditCardIcon />
                    ) : (
                      <PersonIcon />
                    )}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={t(`activity.${activity.tipo}.title`)}
                  secondary={
                    <>
                      {activity.usuario} • {formatDate(new Date(activity.data))}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
          
          <Button 
            fullWidth 
            sx={{ mt: 2 }}
            onClick={() => setActiveSection('activity')}
          >
            {t('viewAll')}
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderContentBySection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverviewSection();
      case 'activity':
        return <ActivityTimeline caixinha={caixinha} />;
      case 'members':
        return <MembersList caixinha={caixinha} />;
      case 'loans':
        return <LoanManagement caixinha={caixinha} />;
      case 'reports':
        return <Reports caixinha={caixinha} />;
      case 'banking':
        return <BankingManagement caixinhaId={caixinha.id} />;
      default:
        return renderOverviewSection();
    }
  };

  return (
    <Box sx={{ p: 2, md: 3 }}>
      {/* Header Section with Quick Stats */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center',
        mb: 4 
      }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {caixinha.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {caixinha.description}
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          mt: isMobile ? 2 : 0,
          gap: 1 
        }}>
          <IconButton
            onClick={() => setShowNotifications(true)}
            sx={{ position: 'relative' }}
          >
            <NotificationsIcon />
            {notifications.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 16,
                  height: 16,
                  bgcolor: 'error.main',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                {notifications.length}
              </Box>
            )}
          </IconButton>
          
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
          
          <Button
            variant="contained"
            startIcon={<AttachMoneyIcon />}
            onClick={handleContribute}
            sx={{ 
              borderRadius: 8,
              background: 'linear-gradient(45deg, #2196F3 30%, #3f51b5 90%)',
              boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            {t('contribute')}
          </Button>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeSection}
          onChange={(_, newValue) => setActiveSection(newValue)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : false}
        >
          <Tab 
            icon={<TimelineIcon fontSize="small" />} 
            label={t('overview')} 
            value="overview"
            iconPosition="start"
          />
          <Tab 
            icon={<AssignmentIcon fontSize="small" />} 
            label={t('activity')} 
            value="activity"
            iconPosition="start"
          />
          <Tab 
            icon={<GroupIcon fontSize="small" />} 
            label={t('members')} 
            value="members"
            iconPosition="start"
          />
          <Tab 
            icon={<CreditCardIcon fontSize="small" />} 
            label={t('loans')} 
            value="loans"
            iconPosition="start"
          />
          <Tab 
            icon={<AssignmentIcon fontSize="small" />} 
            label={t('reports')} 
            value="reports"
            iconPosition="start"
          />
          <Tab 
            icon={<AccountBalanceIcon fontSize="small" />} 
            label={t('banking.travaBancaria')} 
            value="banking"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Main Content Area */}
      <Box>
        {renderContentBySection()}
      </Box>

      {/* Notifications Drawer */}
      {renderNotificationsDrawer()}

      {/* Options Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
          {t('settings')}
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <GroupIcon fontSize="small" sx={{ mr: 1 }} />
          {t('inviteMembers')}
        </MenuItem>
      </Menu>

      {/* Contribution Dialog */}
      <Dialog open={contributionDialog} onClose={() => setContributionDialog(false)}>
        <DialogTitle>{t('makeContribution')}</DialogTitle>
        <DialogContent>
          <TextField
            label={t('amount')}
            type="number"
            fullWidth
            margin="dense"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
            InputProps={{
              startAdornment: 'R$',
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContributionDialog(false)}>{t('cancel')}</Button>
          <Button 
            onClick={handleContributionSubmit} 
            variant="contained"
            disabled={!contributionAmount}
          >
            {t('contribute')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CaixinhaOverview;