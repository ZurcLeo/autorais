import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  Stack,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Computer as ComputerIcon,
  Error as ErrorIcon,
  AccountBalance as LoanIcon,
  Verified as VerifiedIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const PRIORITY_CONFIG = {
  low: { color: 'success', icon: <InfoIcon />, label: 'Baixa' },
  medium: { color: 'warning', icon: <WarningIcon />, label: 'Média' },
  high: { color: 'error', icon: <ErrorIcon />, label: 'Alta' },
  urgent: { color: 'error', icon: <ErrorIcon />, label: 'Urgente' }
};

const STATUS_CONFIG = {
  pending: { color: 'warning', icon: <ScheduleIcon />, label: 'Pendente' },
  assigned: { color: 'info', icon: <PersonIcon />, label: 'Atribuído' },
  resolved: { color: 'success', icon: <CheckCircleIcon />, label: 'Resolvido' },
  closed: { color: 'default', icon: <CheckCircleIcon />, label: 'Fechado' }
};

const CATEGORY_CONFIG = {
  loan: { color: 'primary', icon: <LoanIcon />, label: 'Empréstimos' },
  financial: { color: 'secondary', icon: <TrendingUpIcon />, label: 'Financeiro' },
  technical: { color: 'info', icon: <ComputerIcon />, label: 'Técnico' },
  account: { color: 'warning', icon: <PersonIcon />, label: 'Conta' }
};

/**
 * Componente aprimorado para exibir detalhes completos do ticket
 * Utiliza todas as informações disponíveis do backend de forma organizada
 * Inclui timeline com dados corretos dos agentes (nome e foto)
 */
const EnhancedTicketDetail = ({ ticket, open, onClose, onUpdate }) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    userInfo: true,
    deviceInfo: false,
    loanInfo: false,
    timeline: true,
    context: false,
    errorLogs: false
  });
  const [agentsCache, setAgentsCache] = useState(new Map());

  // Função para obter dados do agente usando agentInfo do ticket
  const getAgentDisplayName = (item) => {
    // Se o item tem agentId e coincide com o agentInfo do ticket, usar os dados corretos
    if (item.agentId && ticket.agentInfo && item.agentId === ticket.agentInfo.id) {
      return ticket.agentInfo.nome || 'Agente';
    }
    
    // Fallback para propriedades diretas (exceto 'Agent' genérico)
    const directName = item.agentName || 
                      item.senderInfo?.name || 
                      item.agent?.name || 
                      item.author?.name ||
                      item.user?.name ||
                      item.createdBy?.name ||
                      item.authorName ||
                      item.userName;
    
    if (directName && directName !== 'Agent') {
      return directName;
    }
    
    return 'Agente';
  };
  
  const getAgentAvatar = (item) => {
    // Se o item tem agentId e coincide com o agentInfo do ticket, usar a foto correta
    if (item.agentId && ticket.agentInfo && item.agentId === ticket.agentInfo.id) {
      return ticket.agentInfo.fotoDoPerfil;
    }
    
    // Fallback para propriedades diretas
    const directAvatar = item.agentAvatar || 
                        item.senderInfo?.avatar || 
                        item.agent?.avatar ||
                        item.author?.avatar ||
                        item.user?.avatar ||
                        item.createdBy?.avatar ||
                        item.authorAvatar ||
                        item.userAvatar;
    
    return directAvatar || null;
  };

  if (!ticket) return null;

  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
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

  const getTimeDifference = (date1, date2) => {
    const diff = Math.abs(new Date(date1) - new Date(date2));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const renderUserInfoCard = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={ticket.userPhotoURL}
            sx={{ 
              width: 56, 
              height: 56, 
              mr: 2,
              bgcolor: theme.palette.primary.main 
            }}
          >
            {ticket.userName?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" component="span">
                {ticket.userName || 'Usuário Anônimo'}
              </Typography>
              {ticket.user?.isVerified && (
                <Tooltip title="Usuário Verificado">
                  <VerifiedIcon color="primary" fontSize="small" />
                </Tooltip>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {ticket.userEmail}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => copyToClipboard(ticket.userEmail)}
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Box>
              {ticket.user?.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {ticket.user.phone}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              ID do Usuário
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {ticket.userId}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Status da Verificação
            </Typography>
            <Typography variant="body2">
              {ticket.user?.isVerified ? 'Verificado' : 'Não Verificado'}
            </Typography>
          </Grid>
          {ticket.user?.roles?.client && (
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Cliente desde
              </Typography>
              <Typography variant="body2">
                {formatDate(ticket.user.roles.client.assignedAt)}
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderTicketSummaryCard = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6">
            {ticket.title}
          </Typography>
          <Chip 
            label={`#${ticket.id}`}
            size="small"
            variant="outlined"
            sx={{ fontFamily: 'monospace' }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            {...STATUS_CONFIG[ticket.status]}
            label={STATUS_CONFIG[ticket.status]?.label || ticket.status}
            icon={STATUS_CONFIG[ticket.status]?.icon}
            variant="filled"
            size="small"
          />
          <Chip
            {...PRIORITY_CONFIG[ticket.priority]}
            label={PRIORITY_CONFIG[ticket.priority]?.label || ticket.priority}
            icon={PRIORITY_CONFIG[ticket.priority]?.icon}
            variant="filled"
            size="small"
          />
          <Chip
            {...CATEGORY_CONFIG[ticket.category]}
            label={CATEGORY_CONFIG[ticket.category]?.label || ticket.category}
            icon={CATEGORY_CONFIG[ticket.category]?.icon}
            variant="outlined"
            size="small"
          />
        </Box>

        <Typography variant="body1" paragraph>
          {ticket.description}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Criado em
            </Typography>
            <Typography variant="body2">
              {formatDate(ticket.createdAt)}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Atualizado em
            </Typography>
            <Typography variant="body2">
              {formatDate(ticket.updatedAt)}
            </Typography>
          </Grid>
          {ticket.assignedAt && (
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Atribuído em
              </Typography>
              <Typography variant="body2">
                {formatDate(ticket.assignedAt)}
              </Typography>
            </Grid>
          )}
          {ticket.resolvedAt && (
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Resolvido em
              </Typography>
              <Typography variant="body2">
                {formatDate(ticket.resolvedAt)}
              </Typography>
            </Grid>
          )}
        </Grid>

        {ticket.assignedAt && ticket.resolvedAt && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Tempo de Resolução
            </Typography>
            <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
              {getTimeDifference(ticket.resolvedAt, ticket.assignedAt)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderDeviceInfoAccordion = () => (
    <Accordion 
      expanded={expandedSections.deviceInfo}
      onChange={() => handleSectionToggle('deviceInfo')}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ComputerIcon />
          <Typography variant="h6">Informações do Dispositivo</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {ticket.deviceInfo ? (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row">Navegador</TableCell>
                  <TableCell>{ticket.deviceInfo.userAgent}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Plataforma</TableCell>
                  <TableCell>{ticket.deviceInfo.platform}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Resolução da Tela</TableCell>
                  <TableCell>{ticket.deviceInfo.screenResolution}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Viewport</TableCell>
                  <TableCell>{ticket.deviceInfo.viewport}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Idioma</TableCell>
                  <TableCell>{ticket.deviceInfo.language}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Fuso Horário</TableCell>
                  <TableCell>{ticket.deviceInfo.timezone}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Timestamp</TableCell>
                  <TableCell>{formatDate(ticket.deviceInfo.timestamp)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">
            Informações do dispositivo não disponíveis
          </Alert>
        )}
      </AccordionDetails>
    </Accordion>
  );

  const renderLoanInfoAccordion = () => (
    <Accordion 
      expanded={expandedSections.loanInfo}
      onChange={() => handleSectionToggle('loanInfo')}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LoanIcon />
          <Typography variant="h6">Informações de Empréstimos</Typography>
          {ticket.context?.loan?.loanSummary && (
            <Badge 
              badgeContent={ticket.context.loan.loanSummary.totalLoans} 
              color="primary"
            />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {ticket.context?.loan?.loanSummary ? (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h4" color="primary">
                    {ticket.context.loan.loanSummary.totalLoans}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de Empréstimos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h4" color="success.main">
                    {ticket.context.loan.loanSummary.activeLoans}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Empréstimos Ativos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h4" color="error.main">
                    {ticket.context.loan.loanSummary.overdueLoans}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Empréstimos Vencidos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info">
            Informações de empréstimos não disponíveis
          </Alert>
        )}
      </AccordionDetails>
    </Accordion>
  );

  const renderTimelineAccordion = () => (
    <Accordion 
      expanded={expandedSections.timeline}
      onChange={() => handleSectionToggle('timeline')}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon />
          <Typography variant="h6">Timeline do Ticket</Typography>
          {ticket.conversationHistory && (
            <Badge 
              badgeContent={ticket.conversationHistory.length} 
              color="primary"
            />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {ticket.conversationHistory && ticket.conversationHistory.length > 0 ? (
          <List>
            {ticket.conversationHistory.map((item, index) => {
              const isAgentNote = item.type === 'agent_note';
              
              
              // Usar as funções melhoradas para obter nome e avatar
              const agentName = getAgentDisplayName(item);
              const agentAvatar = getAgentAvatar(item);
              const agentInitial = agentName.charAt(0).toUpperCase();
              
              return (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar 
                        src={agentAvatar}
                        sx={{ 
                          bgcolor: isAgentNote ? 'primary.main' : 'secondary.main',
                          width: 40,
                          height: 40
                        }}
                      >
                        {agentAvatar ? null : (isAgentNote ? agentInitial : <InfoIcon />)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2">
                            {isAgentNote ? 'Nota do Agente' : 'Atualização'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(item.timestamp)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {item.content || item.note}
                          </Typography>
                          <Typography variant="caption" color="primary" sx={{ fontWeight: 'medium' }}>
                            por {agentName}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < ticket.conversationHistory.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              );
            })}
          </List>
        ) : (
          <Alert severity="info">
            Nenhuma atividade registrada no timeline
          </Alert>
        )}
      </AccordionDetails>
    </Accordion>
  );

  const renderContextAccordion = () => (
    <Accordion 
      expanded={expandedSections.context}
      onChange={() => handleSectionToggle('context')}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon />
          <Typography variant="h6">Contexto Técnico</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {ticket.context && Object.keys(ticket.context).length > 0 ? (
          <Box
            component="pre"
            sx={{
              bgcolor: alpha(theme.palette.grey[100], 0.5),
              p: 2,
              borderRadius: 1,
              fontSize: '0.875rem',
              overflow: 'auto',
              maxHeight: 300,
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap'
            }}
          >
            {JSON.stringify(ticket.context, null, 2)}
          </Box>
        ) : (
          <Alert severity="info">
            Contexto técnico não disponível
          </Alert>
        )}
      </AccordionDetails>
    </Accordion>
  );

  const renderErrorLogsAccordion = () => (
    <Accordion 
      expanded={expandedSections.errorLogs}
      onChange={() => handleSectionToggle('errorLogs')}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ErrorIcon />
          <Typography variant="h6">Logs de Erro</Typography>
          {ticket.errorLogs && ticket.errorLogs.length > 0 && (
            <Badge 
              badgeContent={ticket.errorLogs.length} 
              color="error"
            />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {ticket.errorLogs && ticket.errorLogs.length > 0 ? (
          <Stack spacing={1}>
            {ticket.errorLogs.map((error, index) => (
              <Alert key={index} severity="error" variant="outlined">
                {error.message || error}
              </Alert>
            ))}
          </Stack>
        ) : (
          <Alert severity="info">
            Nenhum erro registrado
          </Alert>
        )}
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          m: 1
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" component="div">
            Detalhes do Ticket
          </Typography>
          <IconButton onClick={onClose} size="large">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {renderUserInfoCard()}
          {renderTicketSummaryCard()}
          
          <Stack spacing={1}>
            {renderDeviceInfoAccordion()}
            {renderLoanInfoAccordion()}
            {renderTimelineAccordion()}
            {renderContextAccordion()}
            {renderErrorLogsAccordion()}
          </Stack>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Fechar
        </Button>
        {onUpdate && (
          <Button onClick={() => onUpdate(ticket)} variant="contained">
            Atualizar Ticket
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedTicketDetail;