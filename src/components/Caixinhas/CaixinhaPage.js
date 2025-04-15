import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  Divider, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem, 
  CircularProgress,
  LinearProgress,
  Paper,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  TrendingUp, 
  PersonAdd, 
  Payments, 
  MoreVert, 
  NotificationsActive,
  Timeline,
  AccountBalance,
  Group,
  Assignment,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const CaixinhaPage = ({ caixinha }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeSection, setActiveSection] = useState('overview');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);

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

  const toggleExpand = (section) => {
    setExpanded({...expanded, [section]: !expanded[section]});
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const renderProgressIndicator = (value, max) => {
    const percentage = (value / max) * 100;
    return (
      <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" value={percentage} 
            sx={{ 
              height: 8, 
              borderRadius: 5,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
              }
            }} 
          />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: '-20px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            color: theme.palette.text.secondary
          }}
        >
          {percentage.toFixed(0)}%
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      {/* Header Section with Quick Stats */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          mb: 3
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {caixinha?.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {caixinha?.description}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', mt: { xs: 2, md: 0 }, gap: 1 }}>
          <Badge badgeContent={notifications.length} color="error">
            <IconButton onClick={() => setShowNotifications(!showNotifications)}>
              <NotificationsActive />
            </IconButton>
          </Badge>
          <Button
            variant="contained"
            startIcon={<Payments />}
            sx={{ 
              borderRadius: '20px',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              color: 'white',
              fontWeight: 'bold'
            }}
          >
            Contribuir
          </Button>
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem>Exportar Relatórios</MenuItem>
            <MenuItem>Configurações</MenuItem>
            <MenuItem>Ajuda</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Notifications Panel - Conditionally Rendered */}
      {showNotifications && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            mb: 3, 
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            maxHeight: '300px',
            overflow: 'auto'
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>Notificações Recentes</Typography>
          <Divider sx={{ mb: 2 }} />
          {notifications.map((notification, index) => (
            <Box 
              key={index} 
              sx={{ 
                p: 1, 
                mb: 1, 
                display: 'flex', 
                alignItems: 'center',
                borderRadius: 1,
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.03)' }
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: 
                    notification.type === 'payment' ? 'success.light' :
                    notification.type === 'member' ? 'info.light' : 'warning.light',
                  mr: 2
                }}
              >
                {notification.type === 'payment' ? <Payments /> : 
                 notification.type === 'member' ? <PersonAdd /> : <NotificationsActive />}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1">{notification.message}</Typography>
                <Typography variant="caption" color="text.secondary">{notification.time} atrás</Typography>
              </Box>
            </Box>
          ))}
        </Paper>
      )}

      {/* Main Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card 
            elevation={2} 
            sx={{ 
              borderRadius: 3,
              height: '100%',
              background: 'linear-gradient(to right, #ffffff, #f5f5f5)',
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '30%',
                height: '100%',
                background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(33, 150, 243, 0.1))',
                zIndex: 1
              }
            }}
          >
            <CardContent sx={{ height: '100%', position: 'relative', zIndex: 2 }}>
              <Typography variant="h6" gutterBottom>Evolução do Saldo</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={balanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(value) => `R$${value/1000}k`}
                    />
                    <RechartsTooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 8,
                        boxShadow: theme.shadows[3],
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
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Grid container spacing={3} sx={{ height: '100%' }}>
            <Grid item xs={12}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                  color: 'white'
                }}
              >
                <CardContent>
                  <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Saldo Total
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {formatCurrency(caixinha?.saldoTotal)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                      icon={<ArrowUpward />} 
                      label="15% este mês" 
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card elevation={2} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">
                    Contribuição Mensal
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'medium', mb: 1 }}>
                    {formatCurrency(caixinha?.contribuicaoMensal || 0)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Próximo pagamento:
                    </Typography>
                    <Chip
                      label="15 dias restantes"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card elevation={2} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">
                    Progresso da Caixinha
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
                    <CircularProgress
                      variant="determinate"
                      value={75}
                      size={60}
                      thickness={8}
                      sx={{ mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'medium' }}>75%</Typography>
                      <Typography variant="body2" color="text.secondary">9/12 meses</Typography>
                    </Box>
                  </Box>
                  {renderProgressIndicator(9, 12)}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Navigation Tabs for Mobile or Desktop */}
      <Box sx={{ mb: 3 }}>
        {isMobile ? (
          <Tabs 
            value={activeSection} 
            onChange={(e, value) => setActiveSection(value)} 
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                minWidth: 'auto',
                py: 2
              }
            }}
          >
            <Tab icon={<Timeline />} label="Atividades" value="activities" />
            <Tab icon={<Group />} label="Membros" value="members" />
            <Tab icon={<AccountBalance />} label="Empréstimos" value="loans" />
            <Tab icon={<Assignment />} label="Relatórios" value="reports" />
          </Tabs>
        ) : (
          <Paper 
            elevation={1} 
            sx={{ 
              display: 'flex', 
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            <Button 
              variant={activeSection === 'activities' ? 'contained' : 'text'} 
              onClick={() => setActiveSection('activities')}
              startIcon={<Timeline />}
              sx={{ 
                borderRadius: 0,
                py: 1.5,
                px: 3,
                flex: 1,
                backgroundColor: activeSection === 'activities' ? 'primary.main' : 'transparent',
                color: activeSection === 'activities' ? 'white' : 'text.primary',
                '&:hover': {
                  backgroundColor: activeSection === 'activities' ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Atividades
            </Button>
            <Button 
              variant={activeSection === 'members' ? 'contained' : 'text'} 
              onClick={() => setActiveSection('members')}
              startIcon={<Group />}
              sx={{ 
                borderRadius: 0,
                py: 1.5,
                px: 3,
                flex: 1,
                backgroundColor: activeSection === 'members' ? 'primary.main' : 'transparent',
                color: activeSection === 'members' ? 'white' : 'text.primary',
                '&:hover': {
                  backgroundColor: activeSection === 'members' ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Membros
            </Button>
            <Button 
              variant={activeSection === 'loans' ? 'contained' : 'text'} 
              onClick={() => setActiveSection('loans')}
              startIcon={<AccountBalance />}
              sx={{ 
                borderRadius: 0,
                py: 1.5,
                px: 3,
                flex: 1,
                backgroundColor: activeSection === 'loans' ? 'primary.main' : 'transparent',
                color: activeSection === 'loans' ? 'white' : 'text.primary',
                '&:hover': {
                  backgroundColor: activeSection === 'loans' ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Empréstimos
            </Button>
            <Button 
              variant={activeSection === 'reports' ? 'contained' : 'text'} 
              onClick={() => setActiveSection('reports')}
              startIcon={<Assignment />}
              sx={{ 
                borderRadius: 0,
                py: 1.5,
                px: 3,
                flex: 1,
                backgroundColor: activeSection === 'reports' ? 'primary.main' : 'transparent',
                color: activeSection === 'reports' ? 'white' : 'text.primary',
                '&:hover': {
                  backgroundColor: activeSection === 'reports' ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Relatórios
            </Button>
          </Paper>
        )}
      </Box>

      {/* Content Area - This would change based on active section */}
      <Box sx={{ mt: 2 }}>
        {activeSection === 'activities' && (
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Atividades Recentes</Typography>
                <Button size="small" color="primary">Ver todas</Button>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                {/* Activity items would go here */}
                <Box sx={{ py: 2, display: 'flex', alignItems: 'flex-start' }}>
                  <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                    <Payments />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">Nova contribuição</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Maria fez uma contribuição de {formatCurrency(300)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Hoje, 14:30
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                
                <Box sx={{ py: 2, display: 'flex', alignItems: 'flex-start' }}>
                  <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                    <PersonAdd />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">Novo membro</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pedro aceitou o convite para participar da caixinha
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ontem, 08:15
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                
                <Box sx={{ py: 2, display: 'flex', alignItems: 'flex-start' }}>
                  <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                    <AccountBalance />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">Empréstimo aprovado</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Empréstimo de {formatCurrency(1500)} para Ana foi aprovado
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      02/04/2025, 16:45
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
        
        {/* Other content sections would be conditionally rendered here */}
      </Box>
    </Box>
  );
};

export default CaixinhaPage;