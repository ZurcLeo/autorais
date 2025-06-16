// src/components/Support/TicketList.js
import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  useTheme,
  alpha,
  Skeleton,
  Badge
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  PriorityHigh as PriorityIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useSupport } from '../../providers/SupportProvider';

/**
 * Componente moderno para listar tickets de suporte
 * Suporta diferentes tipos de listas e ações
 */
const TicketList = ({
  type = 'pending', // 'pending', 'my', 'all'
  title,
  showActions = true,
  maxHeight = 400,
  onTicketClick,
  onAssignTicket,
  onResolveTicket,
  emptyMessage
}) => {
  const theme = useTheme();
  const { 
    filteredPendingTickets, 
    filteredMyTickets, 
    isFetchingTickets,
    assignTicket,
    resolveTicket 
  } = useSupport();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Determinar lista de tickets baseada no tipo
  const tickets = useMemo(() => {
    switch (type) {
      case 'my':
        return filteredMyTickets;
      case 'pending':
        return filteredPendingTickets;
      default:
        return [...filteredPendingTickets, ...filteredMyTickets];
    }
  }, [type, filteredPendingTickets, filteredMyTickets]);

  // Handlers para menu de ações
  const handleMenuOpen = (event, ticket) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedTicket(ticket);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTicket(null);
  };

  const handleAssign = async () => {
    if (selectedTicket) {
      try {
        await assignTicket(selectedTicket.id);
        onAssignTicket?.(selectedTicket);
      } catch (error) {
      }
    }
    handleMenuClose();
  };

  const handleResolve = async () => {
    if (selectedTicket) {
      try {
        await resolveTicket(selectedTicket.id, 'Resolvido pelo agente');
        onResolveTicket?.(selectedTicket);
      } catch (error) {
      }
    }
    handleMenuClose();
  };

  const handleViewConversation = () => {
    if (selectedTicket) {
      onTicketClick?.(selectedTicket);
    }
    handleMenuClose();
  };

  // Formatação de prioridade
  const getPriorityConfig = (priority) => {
    const configs = {
      high: {
        color: theme.palette.error.main,
        bgColor: alpha(theme.palette.error.main, 0.1),
        label: 'Alta'
      },
      medium: {
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, 0.1),
        label: 'Média'
      },
      low: {
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.1),
        label: 'Baixa'
      }
    };
    return configs[priority] || configs.medium;
  };

  // Formatação de status
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, 0.1),
        label: 'Pendente'
      },
      assigned: {
        color: theme.palette.info.main,
        bgColor: alpha(theme.palette.info.main, 0.1),
        label: 'Atribuído'
      },
      resolved: {
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.1),
        label: 'Resolvido'
      }
    };
    return configs[status] || configs.pending;
  };

  // Formatação de tempo
  const formatTimeAgo = (timestamp) => {
    try {
      if (!timestamp) return 'Data não disponível';
      
      const now = new Date();
      let time;
      
      // Lidar com diferentes formatos de timestamp
      if (timestamp && typeof timestamp === 'object' && timestamp._seconds) {
        // Firebase Timestamp format
        time = new Date(timestamp._seconds * 1000);
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        time = new Date(timestamp);
      } else {
        return 'Data inválida';
      }
      
      const diffMs = now - time;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return `${diffDays}d atrás`;
      if (diffHours > 0) return `${diffHours}h atrás`;
      return 'Agora';
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Componente de item de ticket
  const TicketItem = ({ ticket, index }) => {
    const priorityConfig = getPriorityConfig(ticket.priority);
    const statusConfig = getStatusConfig(ticket.status);

    return (
      <ListItem
        key={ticket.id}
        button
        onClick={() => {
          onTicketClick?.(ticket);
        }}
        sx={{
          borderRadius: 2,
          mb: 1,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.9)} 0%, 
            ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.background.paper, 0.95)} 0%, 
              ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4]
          }
        }}
      >
        <ListItemAvatar>
          <Badge
            badgeContent={<PriorityIcon fontSize="small" />}
            color="primary"
            invisible={ticket.priority !== 'high'}
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: priorityConfig.color,
                color: 'white'
              }
            }}
          >
            <Avatar
              src={ticket.userPhotoURL}
              sx={{
                width: 48,
                height: 48,
                bgcolor: priorityConfig.bgColor,
                color: priorityConfig.color
              }}
            >
              {(ticket.userName || ticket.userDisplayName || ticket.userEmail)?.[0]?.toUpperCase() || '?'}
            </Avatar>
          </Badge>
        </ListItemAvatar>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {ticket.userName || ticket.userDisplayName || ticket.userEmail || 'Usuário Anônimo'}
            </Typography>
            <Chip
              label={statusConfig.label}
              size="small"
              sx={{
                backgroundColor: statusConfig.bgColor,
                color: statusConfig.color,
                fontWeight: 'medium',
                fontSize: '0.7rem'
              }}
            />
            <Chip
              label={priorityConfig.label}
              size="small"
              sx={{
                backgroundColor: priorityConfig.bgColor,
                color: priorityConfig.color,
                fontWeight: 'medium',
                fontSize: '0.7rem'
              }}
            />
          </Box>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1
            }}
          >
            {ticket.lastMessageSnippet || ticket.description || ticket.title || 'Sem conteúdo disponível'}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.disabled">
                {formatTimeAgo(ticket.createdAt || ticket.requestedAt || ticket.updatedAt)}
              </Typography>
            </Box>
            
            {ticket.assignedTo && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.disabled">
                  Atribuído
                </Typography>
              </Box>
            )}
            
            <Typography variant="caption" color="text.disabled">
              #{ticket.id.slice(-6)}
            </Typography>
          </Box>
        </Box>

        {showActions && (
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              onClick={(e) => handleMenuOpen(e, ticket)}
              sx={{
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.background.paper, 0.9)
                }
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </ListItemSecondaryAction>
        )}
      </ListItem>
    );
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <Box>
      {[...Array(3)].map((_, index) => (
        <ListItem key={index} sx={{ mb: 1 }}>
          <ListItemAvatar>
            <Skeleton variant="circular" width={48} height={48} />
          </ListItemAvatar>
          <Box>
            <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="40%" />
          </Box>
        </ListItem>
      ))}
    </Box>
  );

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.9)} 0%, 
          ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        borderRadius: 3,
        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        {title && (
          <Box sx={{ p: 2, pb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {title}
            </Typography>
            {tickets.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
        )}

        {/* Lista */}
        <Box
          sx={{
            maxHeight,
            overflowY: 'auto',
            p: 1
          }}
        >
          {isFetchingTickets ? (
            <LoadingSkeleton />
          ) : tickets.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
                px: 2
              }}
            >
              <ChatIcon 
                sx={{ 
                  fontSize: 48, 
                  color: theme.palette.text.disabled, 
                  mb: 2 
                }} 
              />
              <Typography variant="body2" color="text.secondary" align="center">
                {emptyMessage || 'Nenhum ticket encontrado'}
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {tickets.map((ticket, index) => (
                <TicketItem key={ticket.id} ticket={ticket} index={index} />
              ))}
            </List>
          )}
        </Box>
      </CardContent>

      {/* Menu de ações */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleViewConversation}>
          <ChatIcon sx={{ mr: 1 }} />
          Ver Conversa
        </MenuItem>
        
        {selectedTicket?.status === 'pending' && (
          <MenuItem onClick={handleAssign}>
            <AssignmentIcon sx={{ mr: 1 }} />
            Atribuir a Mim
          </MenuItem>
        )}
        
        {selectedTicket?.status === 'assigned' && (
          <MenuItem onClick={handleResolve}>
            <CheckCircleIcon sx={{ mr: 1 }} />
            Resolver
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default TicketList;