// InvitationCard.jsx refatorado com Material UI
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  Chip,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  LinearProgress,
  Tooltip,
  Collapse,
  useTheme
} from '@mui/material';
import { 
  MoreVert as MoreIcon,
  AccessTime as PendingIcon,
  CheckCircle as UsedIcon,
  Cancel as CanceledIcon,
  HourglassEmpty as ExpiredIcon,
  Refresh as ResendIcon,
  Block as CancelIcon,
  ContentCopy as CopyIcon,
  Person as ProfileIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Componente estilizado para o ícone de expansão
const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

// Container para o cartão flip
const FlipCardContainer = styled(Box)(({ theme }) => ({
  perspective: '1000px',
  marginBottom: 16,
  width: '100%',
  minHeight: '200px', // Garante uma altura mínima para o cartão
}));

// O cartão que vai girar
const FlipCardInner = styled(Box, {
  shouldForwardProp: (prop) => !['flipped', 'isSelected'].includes(prop)
})(({ theme, flipped, isSelected }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  transition: 'transform 0.8s',
  transformStyle: 'preserve-3d',
  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  boxShadow: isSelected ? `0 0 0 2px ${theme.palette.primary.main}` : 'none',
}));

// Estilos comuns para frente e verso
const cardSideStyles = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden', // Para compatibilidade com Safari
  borderRadius: 1,
  overflow: 'hidden'
};

// Frente do cartão
const CardFront = styled(Card)(({ theme }) => ({
  ...cardSideStyles,
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  minHeight: '200px', // Garante uma altura mínima
}));

// Verso do cartão
const CardBack = styled(Card)(({ theme }) => ({
  ...cardSideStyles,
  transform: 'rotateY(180deg)',
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  minHeight: '200px', // Garante uma altura mínima
}));

export const InvitationCard = ({ 
  invitation, 
  onResend, 
  onCancel,  
  isSelectMode = false, 
  isSelected = false, 
  onSelect = () => {} 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [copied, setCopied] = useState(false);
  // Use o hook do MUI para obter o tema atual
  const theme = useTheme();

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return 'N/A';
    }
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Configuração de status
  const getStatusConfig = (status) => {
    switch(status) {
      case 'pending':
        return {
          icon: <PendingIcon />,
          label: 'Pendente',
          color: 'warning',
          progress: 33
        };
      case 'used':
        return {
          icon: <UsedIcon />,
          label: 'Aceito',
          color: 'success',
          progress: 100
        };
      case 'canceled':
        return {
          icon: <CanceledIcon />,
          label: 'Cancelado',
          color: 'error',
          progress: 0
        };
      case 'expired':
        return {
          icon: <ExpiredIcon />,
          label: 'Expirado',
          color: 'info',
          progress: 0
        };
      default:
        return {
          icon: null,
          label: status,
          color: 'info',
          progress: 0
        };
    }
  };
  
  const statusConfig = getStatusConfig(invitation.status);

  useEffect(() => {
    if (expanded) {
      setFlipped(false);
    }
  }, [expanded]);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://localhost:3000/invite/${invitation.inviteId}`);
    setCopied(true);
    handleMenuClose();
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const handleResendClick = () => {
    onResend(invitation.inviteId);
    handleMenuClose();
  };

  const handleCardClick = () => {
    if (isSelectMode) {
      onSelect();
    }
  };
  
  const handleCancelClick = () => {
    onCancel(invitation.inviteId);
    handleMenuClose();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      style={{ marginBottom: 16 }}
    >
      
      <Card
        variant="outlined"
        sx={{
          position: 'relative',
          borderLeft: 4,
          borderLeftColor: theme.palette[statusConfig.color]?.main || theme.palette.grey[500],
          transition: 'all 0.3s ease',
          transformStyle: 'preserve-3d',
          transform: expanded ? 'rotateY(180deg)' : 'rotateY(0deg)',
          backfaceVisibility: 'hidden',
          '&:hover': {
            boxShadow: 3,
            transform: 'translateY(-4px)'
          }
        }}
      >
        {/* Barra de progresso */}
        <LinearProgress 
          variant="determinate" 
          value={statusConfig.progress} 
          color={statusConfig.color}
          sx={{ height: 4 }}
        />
        
        {/* Cabeçalho do cartão */}
        <CardHeader
          avatar={
            <Avatar 
              src={invitation.senderPhotoURL || ''}
              alt={invitation.senderName}
            >
              {invitation.senderName?.[0] || '?'}
            </Avatar>
          }
          action={
            <div>
              <Chip
                icon={statusConfig.icon}
                label={statusConfig.label}
                color={statusConfig.color}
                size="small"
                sx={{ mr: 1 }}
              />
              <IconButton 
                aria-label="mais opções"
                onClick={handleMenuOpen}
              >
                <MoreIcon />
              </IconButton>
              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
              >
                {invitation.status === 'pending' && (
                  <>
                    <MenuItem onClick={handleResendClick}>
                      <ResendIcon sx={{ mr: 1 }} /> Reenviar convite
                    </MenuItem>
                    <MenuItem onClick={handleCancelClick}>
                      <CancelIcon sx={{ mr: 1 }} /> Cancelar convite
                    </MenuItem>
                    <MenuItem onClick={handleCopyLink}>
                      <CopyIcon sx={{ mr: 1 }} /> Copiar link
                    </MenuItem>
                  </>
                )}
                
                {invitation.status === 'expired' && (
                  <MenuItem onClick={handleResendClick}>
                    <ResendIcon sx={{ mr: 1 }} /> Reenviar convite
                  </MenuItem>
                )}
                
                {invitation.status === 'used' && (
                  <MenuItem onClick={handleMenuClose}>
                    <ProfileIcon sx={{ mr: 1 }} /> Ver perfil do usuário
                  </MenuItem>
                )}
                
                <Divider />
                <MenuItem onClick={handleMenuClose}>
                  Ver histórico de eventos
                </MenuItem>
              </Menu>
            </div>
          }
          title={
            <Typography variant="subtitle1" noWrap>
              {invitation.friendName}
            </Typography>
          }
          subheader={
            <Typography variant="body2" color="text.secondary" noWrap>
              {invitation.email}
            </Typography>
          }
        />
        
        {/* Conteúdo principal */}
        <CardContent>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              mb: 2 
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Enviado por: {invitation.senderName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(invitation.createdAt)}
            </Typography>
          </Box>
          
          {/* Timeline visual - pode ser implementada com Step ou uma solução personalizada */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative', mt: 3, mb: 2 }}>
            {/* Linha de fundo */}
            <Box 
              sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: 0, 
                right: 0, 
                height: 2, 
                bgcolor: 'divider', // Usa a cor do divider do tema
                zIndex: 0 
              }} 
            />
            
            {/* Pontos da timeline */}
            {['Criado', 'Enviado', 'Validado', 'Registrado'].map((step, index) => {
              const isActive = index === 0 || index === 1 || 
                (invitation.status === 'used' && (index === 2 || index === 3));
              return (
                <Box 
                  key={step} 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    zIndex: 1,
                    position: 'relative'
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      bgcolor: isActive ? theme.palette[statusConfig.color].main : theme.palette.text.disabled,
                      border: 2,
                      borderColor: theme.palette.background.paper,
                      mb: 1
                    }} 
                  />
                  <Typography 
                    variant="caption" 
                    color={isActive ? statusConfig.color + '.main' : 'text.secondary'}
                    sx={{ fontWeight: isActive ? 'bold' : 'normal' }}
                  >
                    {step}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </CardContent>
        
        {/* Ações do cartão */}
        <CardActions disableSpacing>
          <Button
            size="small"
            onClick={handleExpandClick}
            startIcon={<ExpandMoreIcon />}
            sx={{ 
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
              transformOrigin: 'center'
            }}
          >
            {expanded ? 'Ocultar detalhes' : 'Ver detalhes'}
          </Button>
          
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            {invitation.status === 'pending' && (
              <>
                <Tooltip title="Reenviar">
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => onResend(invitation.inviteId)}
                  >
                    <ResendIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancelar">
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => onCancel(invitation.inviteId)}
                  >
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={copied ? "Copiado!" : "Copiar link"}>
                  <IconButton 
                    size="small" 
                    color={copied ? "success" : "default"}
                    onClick={handleCopyLink}
                  >
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            
            {invitation.status === 'expired' && (
              <Tooltip title="Reenviar">
                <IconButton 
                  size="small" 
                  color="primary"
                  onClick={() => onResend(invitation.inviteId)}
                >
                  <ResendIcon />
                </IconButton>
              </Tooltip>
            )}
            
            {invitation.status === 'used' && (
              <Tooltip title="Ver perfil">
                <IconButton 
                  size="small" 
                  color="primary"
                >
                  <ProfileIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </CardActions>
        
        {/* Detalhes expandidos */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography paragraph variant="body2">
              <strong>ID do Convite:</strong> {invitation.inviteId}
            </Typography>
            <Typography paragraph variant="body2">
              <strong>ID do Remetente:</strong> {invitation.senderId}
            </Typography>
            {invitation.status === 'used' && (
              <Typography paragraph variant="body2">
                <strong>Validado por:</strong> {invitation.validatedBy || 'N/A'}
              </Typography>
            )}
            {invitation.lastSentAt && (
              <Typography paragraph variant="body2">
                <strong>Último reenvio:</strong> {formatDate(invitation.lastSentAt)}
              </Typography>
            )}
          </CardContent>
        </Collapse>
      </Card>
    </motion.div>
  );
};