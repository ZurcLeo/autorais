// src/components/Support/EscalationStatus.js
import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  Collapse,
  Divider,
  useTheme,
  alpha,
  Fade,
  Slide
} from '@mui/material';
import {
  SupportAgent as SupportAgentIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassIcon,
  Psychology as AIIcon
} from '@mui/icons-material';
import { useSupport } from '../../providers/SupportProvider';

/**
 * Componente moderno para mostrar status de escalonamento
 * Exibe informações visuais sobre o progresso do suporte
 */
const EscalationStatus = ({ 
  conversationId,
  variant = 'card', // 'card', 'banner', 'compact'
  dismissible = true,
  showDetails = true
}) => {
  const theme = useTheme();
  const { conversationStatuses, escalationSuggestions, dismissEscalationSuggestion } = useSupport();
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Obter status da conversa
  const conversationStatus = conversationStatuses[conversationId];
  const escalationSuggestion = escalationSuggestions[conversationId];

  // Estado de progresso
  const [progress, setProgress] = useState(0);

  // Atualizar progresso baseado no status
  useEffect(() => {
    if (!conversationStatus) return;

    const progressMap = {
      'escalating': 25,
      'pending': 50,
      'assigned': 75,
      'active_human': 100,
      'resolved': 100,
      'failed': 0
    };

    const targetProgress = progressMap[conversationStatus.status] || 0;
    
    const timer = setTimeout(() => {
      setProgress(targetProgress);
    }, 300);

    return () => clearTimeout(timer);
  }, [conversationStatus?.status]);

  // Se não há status relevante, não renderizar
  if (!conversationStatus && !escalationSuggestion?.dismissed === false) {
    return null;
  }

  // Se foi dismissado, não renderizar
  if (dismissed) {
    return null;
  }

  // Handler para dismissar
  const handleDismiss = () => {
    if (escalationSuggestion && !escalationSuggestion.dismissed) {
      dismissEscalationSuggestion(conversationId);
    }
    setDismissed(true);
  };

  // Configuração visual baseada no status
  const getStatusConfig = () => {
    if (escalationSuggestion && !escalationSuggestion.dismissed) {
      return {
        type: 'suggestion',
        severity: 'info',
        icon: <AIIcon />,
        title: 'Sugestão de Escalonamento',
        message: escalationSuggestion.message,
        color: theme.palette.info.main,
        bgColor: alpha(theme.palette.info.main, 0.1),
        action: 'Sugerido pela IA'
      };
    }

    if (!conversationStatus) return null;

    const statusMap = {
      'escalating': {
        type: 'escalating',
        severity: 'info',
        icon: <HourglassIcon />,
        title: 'Conectando com Atendente',
        message: 'Processando sua solicitação...',
        color: theme.palette.primary.main,
        bgColor: alpha(theme.palette.primary.main, 0.1),
        action: 'Em Andamento'
      },
      'pending': {
        type: 'pending',
        severity: 'warning',
        icon: <ScheduleIcon />,
        title: 'Na Fila de Atendimento',
        message: conversationStatus.queuePosition ? 
          `Posição na fila: ${conversationStatus.queuePosition}` : 
          'Aguardando atendente disponível',
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, 0.1),
        action: 'Aguardando',
        estimatedTime: conversationStatus.estimatedWaitTime
      },
      'assigned': {
        type: 'assigned',
        severity: 'info',
        icon: <PersonIcon />,
        title: 'Atendente Atribuído',
        message: conversationStatus.handledBy?.name ? 
          `Atendente: ${conversationStatus.handledBy.name}` : 
          'Um atendente foi designado para você',
        color: theme.palette.info.main,
        bgColor: alpha(theme.palette.info.main, 0.1),
        action: 'Atribuído',
        agent: conversationStatus.handledBy
      },
      'active_human': {
        type: 'active',
        severity: 'success',
        icon: <SupportAgentIcon />,
        title: 'Conectado com Atendente',
        message: conversationStatus.handledBy?.name ? 
          `Conversando com ${conversationStatus.handledBy.name}` : 
          'Você está conversando com um atendente humano',
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.1),
        action: 'Ativo',
        agent: conversationStatus.handledBy
      },
      'resolved': {
        type: 'resolved',
        severity: 'success',
        icon: <CheckCircleIcon />,
        title: 'Atendimento Concluído',
        message: 'Seu ticket foi resolvido com sucesso',
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.1),
        action: 'Resolvido'
      },
      'failed': {
        type: 'failed',
        severity: 'error',
        icon: <ErrorIcon />,
        title: 'Falha no Escalonamento',
        message: conversationStatus.error || 'Não foi possível conectar com um atendente',
        color: theme.palette.error.main,
        bgColor: alpha(theme.palette.error.main, 0.1),
        action: 'Erro'
      }
    };

    return statusMap[conversationStatus.status] || null;
  };

  const statusConfig = getStatusConfig();
  if (!statusConfig) return null;

  // Formatação de tempo estimado
  const formatEstimatedTime = (minutes) => {
    if (!minutes) return null;
    if (minutes < 60) return `~${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `~${hours}h ${mins > 0 ? `${mins}min` : ''}`;
  };

  // Renderização compacta
  if (variant === 'compact') {
    return (
      <Fade in={true}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1,
            borderRadius: 1,
            backgroundColor: statusConfig.bgColor,
            border: `1px solid ${alpha(statusConfig.color, 0.3)}`
          }}
        >
          {statusConfig.icon}
          <Typography variant="caption" color={statusConfig.color} sx={{ fontWeight: 'medium' }}>
            {statusConfig.action}
          </Typography>
          {dismissible && (
            <IconButton size="small" onClick={handleDismiss}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Fade>
    );
  }

  // Renderização banner
  if (variant === 'banner') {
    return (
      <Slide direction="down" in={true}>
        <Alert
          severity={statusConfig.severity}
          icon={statusConfig.icon}
          action={
            dismissible && (
              <IconButton size="small" onClick={handleDismiss}>
                <CloseIcon fontSize="small" />
              </IconButton>
            )
          }
          sx={{
            borderRadius: 2,
            backgroundColor: statusConfig.bgColor,
            border: `1px solid ${alpha(statusConfig.color, 0.3)}`,
            '& .MuiAlert-icon': {
              color: statusConfig.color
            }
          }}
        >
          <AlertTitle sx={{ color: statusConfig.color, fontWeight: 'bold' }}>
            {statusConfig.title}
          </AlertTitle>
          {statusConfig.message}
        </Alert>
      </Slide>
    );
  }

  // Renderização card (padrão)
  return (
    <Fade in={true}>
      <Box
        sx={{
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.95)} 0%, 
            ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(statusConfig.color, 0.3)}`,
          borderRadius: 3,
          p: 2,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
          transition: 'all 0.3s ease'
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: statusConfig.bgColor,
                border: `2px solid ${alpha(statusConfig.color, 0.5)}`,
                color: statusConfig.color
              }}
            >
              {statusConfig.icon}
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: statusConfig.color }}>
                {statusConfig.title}
              </Typography>
              <Chip 
                label={statusConfig.action} 
                size="small" 
                sx={{ 
                  backgroundColor: statusConfig.bgColor,
                  color: statusConfig.color,
                  fontWeight: 'medium'
                }} 
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {showDetails && (
              <IconButton 
                size="small" 
                onClick={() => setExpanded(!expanded)}
                sx={{ 
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <ExpandMoreIcon />
              </IconButton>
            )}
            {dismissible && (
              <IconButton size="small" onClick={handleDismiss}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Barra de progresso */}
        {statusConfig.type !== 'suggestion' && statusConfig.type !== 'failed' && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(statusConfig.color, 0.2),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: statusConfig.color,
                  borderRadius: 3
                }
              }}
            />
          </Box>
        )}

        {/* Mensagem principal */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: showDetails ? 1 : 0 }}>
          {statusConfig.message}
        </Typography>

        {/* Informações adicionais */}
        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Tempo estimado */}
            {statusConfig.estimatedTime && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Tempo estimado: {formatEstimatedTime(statusConfig.estimatedTime)}
                </Typography>
              </Box>
            )}

            {/* Informações do agente */}
            {statusConfig.agent && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar 
                  src={statusConfig.agent.avatar} 
                  sx={{ width: 20, height: 20 }}
                >
                  {statusConfig.agent.name?.[0]}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  {statusConfig.agent.name} está atendendo você
                </Typography>
              </Box>
            )}

            {/* Timestamp */}
            {conversationStatus?.timestamp && (
              <Typography variant="caption" color="text.disabled">
                Última atualização: {new Date(conversationStatus.timestamp).toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        </Collapse>
      </Box>
    </Fade>
  );
};

export default EscalationStatus;