import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Verified as VerifiedIcon,
  AccountBalance as LoanIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Assignment as TicketIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  History as HistoryIcon
} from '@mui/icons-material';

/**
 * Painel de contexto completo do usuário
 * Consolida todas as informações relevantes para o atendimento
 */
const UserContextPanel = ({ user, tickets = [], onRefresh }) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    loans: true,
    history: false,
    tickets: true
  });

  if (!user) {
    return (
      <Alert severity="info">
        Selecione um ticket para ver o contexto do usuário
      </Alert>
    );
  }

  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRiskLevel = (user) => {
    let riskScore = 0;
    
    // Fatores de risco
    if (!user.isVerified) riskScore += 30;
    if (user.loanSummary?.overdueLoans > 0) riskScore += 40;
    if (tickets.filter(t => t.priority === 'urgent').length > 0) riskScore += 20;
    if (tickets.length > 5) riskScore += 10;

    if (riskScore >= 60) return { level: 'high', color: 'error', label: 'Alto Risco' };
    if (riskScore >= 30) return { level: 'medium', color: 'warning', label: 'Médio Risco' };
    return { level: 'low', color: 'success', label: 'Baixo Risco' };
  };

  const renderUserProfileSection = () => {
    const risk = getRiskLevel(user);
    
    return (
      <Accordion 
        expanded={expandedSections.profile}
        onChange={() => handleSectionToggle('profile')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon />
            <Typography variant="h6">Perfil do Usuário</Typography>
            <Chip
              label={risk.label}
              color={risk.color}
              size="small"
              variant="outlined"
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={user.photoURL}
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    mr: 2,
                    bgcolor: theme.palette.primary.main 
                  }}
                >
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6">
                      {user.name || 'Usuário Anônimo'}
                    </Typography>
                    {user.isVerified && (
                      <Tooltip title="Usuário Verificado">
                        <VerifiedIcon color="primary" />
                      </Tooltip>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    ID: {user.id}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {user.email}
                    </Typography>
                  </Box>
                </Grid>
                
                {user.phone && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {user.phone}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Status de Verificação
                  </Typography>
                  <Typography variant="body2">
                    {user.isVerified ? 'Verificado' : 'Não Verificado'}
                  </Typography>
                </Grid>

                {user.roles?.client && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Cliente desde
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(user.roles.client.assignedAt)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderLoanSummarySection = () => {
    const loanSummary = user.loanSummary;
    
    return (
      <Accordion 
        expanded={expandedSections.loans}
        onChange={() => handleSectionToggle('loans')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LoanIcon />
            <Typography variant="h6">Resumo Financeiro</Typography>
            {loanSummary?.overdueLoans > 0 && (
              <Badge badgeContent={loanSummary.overdueLoans} color="error">
                <WarningIcon />
              </Badge>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {loanSummary ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined" sx={{ 
                  background: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {loanSummary.totalLoans}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de Empréstimos
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Card variant="outlined" sx={{ 
                  background: alpha(theme.palette.success.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {loanSummary.activeLoans}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Empréstimos Ativos
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Card variant="outlined" sx={{ 
                  background: alpha(theme.palette.error.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main">
                      {loanSummary.overdueLoans}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Empréstimos Vencidos
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {loanSummary.overdueLoans > 0 && (
                <Grid item xs={12}>
                  <Alert severity="warning" variant="outlined">
                    <Typography variant="body2">
                      Este usuário possui {loanSummary.overdueLoans} empréstimo(s) em atraso. 
                      Considere isso ao avaliar solicitações relacionadas a pagamentos.
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          ) : (
            <Alert severity="info">
              Informações financeiras não disponíveis
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderTicketHistorySection = () => {
    const userTickets = tickets.slice(0, 5); // Últimos 5 tickets
    
    return (
      <Accordion 
        expanded={expandedSections.tickets}
        onChange={() => handleSectionToggle('tickets')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TicketIcon />
            <Typography variant="h6">Histórico de Tickets</Typography>
            <Badge badgeContent={tickets.length} color="primary" />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {userTickets.length > 0 ? (
            <List>
              {userTickets.map((ticket, index) => (
                <React.Fragment key={ticket.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      <Avatar sx={{ 
                        bgcolor: ticket.status === 'resolved' ? 'success.main' :
                                 ticket.status === 'assigned' ? 'info.main' : 'warning.main'
                      }}>
                        {ticket.status === 'resolved' ? <CheckCircleIcon /> : 
                         ticket.status === 'assigned' ? <PersonIcon /> : <ScheduleIcon />}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2">
                            {ticket.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(ticket.createdAt)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Categoria: {ticket.category} | Prioridade: {ticket.priority}
                          </Typography>
                          <Chip
                            label={ticket.status}
                            size="small"
                            color={
                              ticket.status === 'resolved' ? 'success' :
                              ticket.status === 'assigned' ? 'info' : 'warning'
                            }
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < userTickets.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Alert severity="info">
              Nenhum histórico de tickets encontrado
            </Alert>
          )}
          
          {tickets.length > 5 && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button variant="outlined" size="small">
                Ver todos os {tickets.length} tickets
              </Button>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderRecentActivitySection = () => {
    const recentActivity = user.recentActivity || [];
    
    return (
      <Accordion 
        expanded={expandedSections.history}
        onChange={() => handleSectionToggle('history')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon />
            <Typography variant="h6">Atividade Recente</Typography>
            {recentActivity.length > 0 && (
              <Badge badgeContent={recentActivity.length} color="secondary" />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {recentActivity.length > 0 ? (
            <List dense>
              {recentActivity.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description || 'Atividade do sistema'}
                      secondary={formatDate(activity.timestamp)}
                    />
                  </ListItem>
                  {index < recentActivity.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Alert severity="info">
              Nenhuma atividade recente registrada
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderInsightsAndRecommendations = () => {
    const insights = [];
    
    // Gerar insights baseados nos dados
    if (!user.isVerified) {
      insights.push({
        type: 'warning',
        message: 'Usuário não verificado. Solicite documentação antes de processar solicitações financeiras.'
      });
    }
    
    if (user.loanSummary?.overdueLoans > 0) {
      insights.push({
        type: 'error',
        message: 'Usuário possui empréstimos em atraso. Considere orientar sobre quitação.'
      });
    }
    
    const urgentTickets = tickets.filter(t => t.priority === 'urgent').length;
    if (urgentTickets > 0) {
      insights.push({
        type: 'warning',
        message: `Usuário possui ${urgentTickets} ticket(s) urgente(s). Priorize o atendimento.`
      });
    }
    
    if (tickets.length > 3) {
      insights.push({
        type: 'info',
        message: 'Usuário frequente do suporte. Considere investigar problemas recorrentes.'
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'success',
        message: 'Perfil do usuário sem alertas. Atendimento pode prosseguir normalmente.'
      });
    }

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Insights e Recomendações
        </Typography>
        {insights.map((insight, index) => (
          <Alert 
            key={index} 
            severity={insight.type} 
            sx={{ mb: 1 }}
            variant="outlined"
          >
            {insight.message}
          </Alert>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ maxHeight: '100vh', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Contexto do Usuário
        </Typography>
        {onRefresh && (
          <Tooltip title="Atualizar informações">
            <IconButton onClick={onRefresh} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Seções */}
      {renderUserProfileSection()}
      {renderLoanSummarySection()}
      {renderTicketHistorySection()}
      {renderRecentActivitySection()}
      
      {/* Insights */}
      {renderInsightsAndRecommendations()}
    </Box>
  );
};

export default UserContextPanel;