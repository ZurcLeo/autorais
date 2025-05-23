import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import {
  Box,
  Button,
  Card,
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
  CircularProgress,
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
  ConfirmationNumber as ConfirmationNumberIcon,
} from '@mui/icons-material';
import RifasManagement from './RifasManagement';
import { useCaixinha } from '../../providers/CaixinhaProvider';
import { useTranslation } from 'react-i18next';
import ActivityTimeline from './ActivityTimelineItem';
import MembersManager from './MembersManager';
import LoanManagement from './LoanManagement';
import BankingManagement from './BankingManagement';
import Reports from './Reports';
import caixinha_back from '../../images/caixinha_back.png'
import { useNotifications } from '../../providers/NotificationProvider';
import CaixinhaList from './CaixinhaList';
import CaixinhaWelcome from './CaixinhaWelcome';
import { useCaixinhaInvite } from '../../providers/CaixinhaInviteProvider';
import CaixinhaInvitesNotification from './CaixinhaInvitesNotification';
import CreateCaixinhaButton from './CreateCaixinhaButton';

const caixinhaImg = caixinha_back;

// Componente para cartão de estatística rápida
const QuickStatCard = ({ icon, title, value, color }) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      height: '100%',
      borderRadius: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: 6
      }
    }}
  >
    <Avatar sx={{ mb: 1, bgcolor: color || 'primary.light' }}>
      {icon}
    </Avatar>
    <Typography variant="h6" fontWeight="bold">{value}</Typography>
    <Typography variant="body2" color="text.secondary">{title}</Typography>
  </Paper>
);

const CaixinhaOverview = () => {
  const { t } = useTranslation();
  const caixinhaContext = useCaixinha();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {notifications} = useNotifications();

  const [loading, setLoading] = useState(true);
  const [selectedCaixinhaId, setSelectedCaixinhaId] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [contributionDialog, setContributionDialog] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');

  const caixinhasArray = caixinhaContext.caixinhas?.caixinhas || [];
  const hasCaixinhas = caixinhasArray.length > 0;

  console.log('notifications:', caixinhasArray)

  useEffect(() => {
    if (caixinhasArray.length > 0 && !selectedCaixinhaId) {
      setSelectedCaixinhaId(caixinhasArray[0].id);
      if (caixinhasArray[0]?.contribuicaoMensal) {
        setContributionAmount(caixinhasArray[0].contribuicaoMensal);
      }
    }
    setLoading(false);
  }, [caixinhasArray, selectedCaixinhaId]);

  const balanceHistory = [
    { month: 'Jan', balance: 2500 },
    { month: 'Fev', balance: 3200 },
    { month: 'Mar', balance: 4100 },
    { month: 'Abr', balance: 4800 },
    { month: 'Mai', balance: 5400 },
    { month: 'Jun', balance: 6200 },
  ];

  const caixinha = hasCaixinhas
    ? (caixinhasArray.find(c => c.id === selectedCaixinhaId) || caixinhasArray[0])
    : null;

  const nextDistribution = caixinha ? {
    date: new Date(new Date().setDate(new Date().getDate() + 15)),
    amount: caixinha?.saldoTotal || 0,
    member: 'Maria Silva'
  } : null;

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

  const handleCaixinhaSelect = (selectedCaixinha) => {
    setSelectedCaixinhaId(selectedCaixinha.id);
    setActiveSection('overview');
    if (selectedCaixinha?.contribuicaoMensal) {
      setContributionAmount(selectedCaixinha.contribuicaoMensal);
    }
  };

  const renderNotificationsDrawer = () => (
    <Drawer
      anchor="right"
      open={showNotifications}
      onClose={() => setShowNotifications(false)}
    >
      <Box  sx={{
      display: 'flex',
      flexDirection: 'column', // Organiza os itens em coluna
      width: '100%', // Ocupa a largura disponível
      padding: 2,
    }}>
    <Box>
          <Typography variant="h6">{t('notifications')}</Typography>
          <IconButton onClick={() => setShowNotifications(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <List>
          {notifications?.map((notification, index) => (
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
      <Grid item xs={12} sm={6} md={3}>
        <QuickStatCard
          icon={<AccountBalanceIcon />}
          title={t('totalBalance')}
          value={formatCurrency(caixinha?.saldoTotal || 0)}
          color="success.light"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <QuickStatCard
          icon={<GroupIcon />}
          title={t('totalMembers')}
          value={caixinha?.members?.length || 0}
          color="primary.light"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <QuickStatCard
          icon={<AttachMoneyIcon />}
          title={t('monthlyContribution')}
          value={formatCurrency(caixinha?.contribuicaoMensal || 0)}
          color="warning.light"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper
          elevation={2}
          sx={{
            p: 3,
            height: '100%',
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 6
            }
          }}
        >
          <Typography variant="h6" fontWeight="bold" mb={1}>
            {nextDistribution ? formatDate(nextDistribution.date) : t('noScheduled')}
          </Typography>
          <Typography variant="body2" color="text.secondary">{t('nextDistributionDate')}</Typography>
          {nextDistribution && (
            <>
              <Typography variant="body1" fontWeight="medium">
                {t('amount')}: {formatCurrency(nextDistribution.amount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('recipient')}: {nextDistribution.member}
              </Typography>
            </>
          )}
        </Paper>
      </Grid>

      {/* Balance History Chart */}
      <Grid item xs={12} md={8}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            {t('balanceHistory')}
          </Typography>
          <Box sx={{ height: 300 }}>
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
                  labelFormatter={(label) => `<span class="math-inline">\{label\}/</span>{new Date().getFullYear()}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    borderRadius: 8,
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
                    border: 'none'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  dot={{ r: 6, strokeWidth: 2 }}
                  activeDot={{ r: 8, strokeWidth: 2 }}
                  name={t('currentBalance')}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      {/* Recent Activity */}
      <Grid item xs={12} md={4}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            {t('recentActivity')}
          </Typography>
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {(caixinha?.atividades || []).slice(0, 5).map((activity, index) => (
              <ListItem key={activity.id || index} alignItems="flex-start" sx={{ py: 1 }}>
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
                  secondary={`${activity.usuario} • ${formatDate(new Date(activity.data))}`}
                  secondaryTypographyProps={{ color: 'text.secondary' }}
                />
              </ListItem>
            ))}
            {caixinha?.atividades?.length > 5 && (
              <Button
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => setActiveSection('activity')}
              >
                {t('viewAll')}
              </Button>
            )}
          </List>
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
        return <MembersManager caixinha={caixinha} />;
      case 'loans':
        return <LoanManagement caixinha={caixinha} />;
      case 'rifas':
        return <RifasManagement caixinha={caixinha} />;
      case 'reports':
        return <Reports caixinha={caixinha} />;
      case 'banking':
        return <BankingManagement caixinhaId={caixinha?.id} />;
      default:
        return renderOverviewSection();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!hasCaixinhas) {
    return <CaixinhaWelcome />;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <CreateCaixinhaButton />
      <CaixinhaInvitesNotification />
      <Grid container spacing={3}>
        {caixinhasArray.length > 1 && (
          <Grid item xs={12} md={3}>
            <CaixinhaList
              caixinhas={caixinhasArray}
              selectedId={selectedCaixinhaId}
              onSelect={handleCaixinhaSelect}
            />
          </Grid>
        )}

        <Grid item xs={12} md={caixinhasArray.length > 1 ? 9 : 12}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 4 },
              mb: 4,
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {caixinha?.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                  {caixinha?.description || t('caixinha.noDescription')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<AttachMoneyIcon />}
                    onClick={handleContribute}
                    sx={{ borderRadius: 8 }}
                  >
                    {t('contribute')}
                  </Button>
                  <IconButton onClick={handleMenuOpen}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
                <Box
                  component="img"
                  src={caixinhaImg}
                  alt="Ilustração da Caixinha"
                  sx={{
                    width: '100%',
                    maxWidth: 400,
                    display: 'block',
                    mx: 'auto'
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

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
                icon={<ConfirmationNumberIcon fontSize="small" />}
                label={t('rifas.title')}
                value="rifas"
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

          <Box>
            {renderContentBySection()}
          </Box>
        </Grid>
      </Grid>

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