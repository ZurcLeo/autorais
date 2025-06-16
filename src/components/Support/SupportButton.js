// src/components/Support/SupportButton.js
import React, { useState, useCallback } from 'react';
import {
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Box,
  Typography,
  useTheme,
  alpha,
  Zoom
} from '@mui/material';
import {
  SupportAgent as SupportAgentIcon,
  Chat as ChatIcon,
  Psychology as AIIcon
} from '@mui/icons-material';
import { useSupport } from '../../providers/SupportProvider';

/**
 * Botão moderno para solicitar suporte humano
 * Usa glassmorphism e animações suaves
 */
const SupportButton = ({ 
  conversationId, 
  variant = 'button', // 'button', 'icon', 'fab'
  size = 'medium',
  showLabel = true,
  disabled = false,
  onEscalationStart,
  onEscalationSuccess,
  onEscalationError
}) => {
  const theme = useTheme();
  const { escalateConversation, isEscalating, conversationStatuses } = useSupport();
  const [isHovered, setIsHovered] = useState(false);

  // Verificar status atual da conversa
  const conversationStatus = conversationStatuses[conversationId];
  const isAlreadyEscalated = conversationStatus?.status && 
    ['pending', 'assigned', 'active_human'].includes(conversationStatus.status);

  // Handler para escalonamento
  const handleEscalate = useCallback(async () => {
    if (!conversationId || isEscalating || isAlreadyEscalated) return;

    try {
      onEscalationStart?.();
      
      const result = await escalateConversation(conversationId);
      
      onEscalationSuccess?.(result);
    } catch (error) {
      console.error('Erro ao escalonar conversa:', error);
      onEscalationError?.(error);
    }
  }, [conversationId, isEscalating, isAlreadyEscalated, escalateConversation, onEscalationStart, onEscalationSuccess, onEscalationError]);

  // Determinar estado visual
  const getButtonState = () => {
    if (isEscalating) return 'escalating';
    if (isAlreadyEscalated) return 'escalated';
    return 'available';
  };

  const buttonState = getButtonState();

  // Configurações visuais baseadas no estado
  const getStateConfig = () => {
    switch (buttonState) {
      case 'escalating':
        return {
          icon: <CircularProgress size={20} color="inherit" />,
          text: 'Conectando...',
          color: 'primary',
          disabled: true,
          bgColor: alpha(theme.palette.primary.main, 0.1),
          borderColor: theme.palette.primary.main
        };
      case 'escalated':
        return {
          icon: <ChatIcon />,
          text: 'Conectado',
          color: 'success',
          disabled: true,
          bgColor: alpha(theme.palette.success.main, 0.1),
          borderColor: theme.palette.success.main
        };
      default:
        return {
          icon: <SupportAgentIcon />,
          text: 'Falar com Atendente',
          color: 'primary',
          disabled: false,
          bgColor: alpha(theme.palette.primary.main, isHovered ? 0.15 : 0.08),
          borderColor: alpha(theme.palette.primary.main, isHovered ? 0.5 : 0.3)
        };
    }
  };

  const stateConfig = getStateConfig();

  // Estilos base com glassmorphism
  const baseStyles = {
    background: `linear-gradient(135deg, 
      ${alpha(theme.palette.background.paper, 0.9)} 0%, 
      ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${stateConfig.borderColor}`,
    borderRadius: '12px',
    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
    '&:hover': {
      background: `linear-gradient(135deg, 
        ${alpha(theme.palette.background.paper, 0.95)} 0%, 
        ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
      boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`,
      borderColor: alpha(stateConfig.borderColor, 0.7)
    }
  };

  // Renderização baseada na variante
  if (variant === 'icon') {
    return (
      <Tooltip title={stateConfig.text} placement="top">
        <Zoom in={true}>
          <IconButton
            onClick={handleEscalate}
            disabled={disabled || stateConfig.disabled}
            size={size}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
              ...baseStyles,
              width: 48,
              height: 48,
              color: theme.palette[stateConfig.color].main,
              '& .MuiSvgIcon-root': {
                fontSize: size === 'small' ? 18 : size === 'large' ? 28 : 24
              }
            }}
          >
            {stateConfig.icon}
          </IconButton>
        </Zoom>
      </Tooltip>
    );
  }

  if (variant === 'fab') {
    return (
      <Tooltip title={stateConfig.text} placement="left">
        <Zoom in={true}>
          <Box
            component="button"
            onClick={handleEscalate}
            disabled={disabled || stateConfig.disabled}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
              ...baseStyles,
              position: 'fixed',
              bottom: 24,
              right: 24,
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: stateConfig.disabled ? 'not-allowed' : 'pointer',
              zIndex: 1200,
              color: theme.palette[stateConfig.color].main,
              border: 'none',
              outline: 'none',
              '&:disabled': {
                opacity: 0.7,
                cursor: 'not-allowed'
              },
              '& .MuiSvgIcon-root': {
                fontSize: 28
              }
            }}
          >
            {stateConfig.icon}
          </Box>
        </Zoom>
      </Tooltip>
    );
  }

  // Variante button (padrão)
  return (
    <Zoom in={true}>
      <Button
        onClick={handleEscalate}
        disabled={disabled || stateConfig.disabled}
        size={size}
        startIcon={stateConfig.icon}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          ...baseStyles,
          px: 3,
          py: 1.5,
          color: theme.palette[stateConfig.color].main,
          textTransform: 'none',
          fontWeight: 'medium',
          '&:disabled': {
            opacity: 0.7,
            color: theme.palette[stateConfig.color].main
          }
        }}
      >
        {showLabel && (
          <Typography variant="body2" sx={{ ml: 0.5 }}>
            {stateConfig.text}
          </Typography>
        )}
      </Button>
    </Zoom>
  );
};

export default SupportButton;