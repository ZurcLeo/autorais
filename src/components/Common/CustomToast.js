// src/components/Common/CustomToast.js
import React, { useCallback, useEffect, useRef } from 'react';
import { Box, Typography, Button, IconButton, Fade, Paper } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
// import { useTheme } from '@mui/material/styles';
import {useTheme} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// Mapeamento de ARIA roles para acessibilidade
const ariaRoles = {
  error: 'alert',
  warning: 'alert',
  info: 'status',
  success: 'status'
};

const CustomToast = ({ closeToast, toastProps }) => {
  console.log("Valor da prop 'message' recebida:", toastProps.message);

  const theme = useTheme();
  const { 
    type = 'info', 
    message, 
    action, 
    icon: customIcon, 
    animation, 
    ariaLabel, 
    variant 
  } = toastProps;
  
  // Referência para contagem regressiva da animação
  const progressRef = useRef(null);
  
  // Efeito para animar o progresso
  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = '100%';
      
      // Reset para animar
      setTimeout(() => {
        if (progressRef.current) {
          progressRef.current.style.transition = 'width linear 5s';
          progressRef.current.style.width = '0%';
        }
      }, 10);
    }
  }, []);

  const getBackgroundColor = useCallback(() => {
    const colors = {
      success: theme.palette.success.light,
      error: theme.palette.error.light,
      info: theme.palette.info.light,
      warning: theme.palette.warning.light
    };

    if (variant === 'highlighted') {
      return colors[type] || theme.palette.background.paper;
    }

    if (variant === 'critical') {
      return type === 'error' ? theme.palette.error.main : colors[type];
    }

    // Usando uma cor semântica para o background padrão do toast
    return colors[type] || theme.palette.background.paper;
  }, [theme, type, variant]);

  const getIcon = useCallback(() => {
    if (React.isValidElement(customIcon)) {
      return customIcon;
    }
    
    const icons = {
      success: <CheckCircleOutlineIcon />,
      error: <ErrorOutlineIcon />,
      info: <InfoOutlinedIcon />,
      warning: <WarningAmberIcon />
    };
    
    return icons[type] || null;
  }, [type, customIcon]);

  // Animações especiais por tipo
  const getAnimationStyle = useCallback(() => {
    if (!animation) return {};
    
    const animations = {
      success: {
        animation: 'toast-success 0.5s ease forwards'
      },
      error: {
        animation: 'toast-error 0.7s ease'
      },
      pulse: {
        animation: 'toast-pulse 2s infinite'
      }
    };
    
    return animations[animation] || {};
  }, [animation]);

  const getTextColor = useCallback(() => {
    const bgColor = getBackgroundColor();
    // Tentando usar a cor de contraste semântica, se definida, senão a padrão
    return theme.semanticColors?.text?.primary || theme.palette.getContrastText(bgColor);
  }, [getBackgroundColor, theme.palette, theme.semanticColors]);

  const getBorderStyle = useCallback(() => {
    const borders = {
      success: `4px solid ${theme.palette.success.main}`,
      error: `4px solid ${theme.palette.error.main}`,
      info: `4px solid ${theme.palette.info.main}`,
      warning: `4px solid ${theme.palette.warning.main}`
    };

    // Usando uma cor semântica para a borda, se desejado
    const semanticBorders = {
      success: `4px solid ${theme.semanticColors?.border?.default || theme.palette.success.main}`,
      error: `4px solid ${theme.semanticColors?.border?.error || theme.palette.error.main}`,
      info: `4px solid ${theme.semanticColors?.border?.info || theme.palette.info.main}`,
      warning: `4px solid ${theme.semanticColors?.border?.warning || theme.palette.warning.main}`,
    };

    return {
      borderLeft: semanticBorders[type] || borders[type]
    };
  }, [theme, type, theme.palette, theme.semanticColors]);

  return (
    <Fade in={true}>
      <Paper
        elevation={3}
        role={ariaRoles[type] || 'status'}
        aria-live={type === 'error' ? 'assertive' : 'polite'}
        aria-label={ariaLabel || 
          `${type === 'error' ? 'Erro' : type === 'success' ? 'Sucesso' : 
            type === 'warning' ? 'Aviso' : 'Informação'}: ${message}`}
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          maxWidth: '350px',
          p: 2,
          overflow: 'hidden',
          backgroundColor: getBackgroundColor(),
          color: getTextColor(),
          ...getBorderStyle(),
          ...getAnimationStyle(),
          '@media (max-width:400px)': {
            width: '100%',
          },
          '&:hover .toast-progress': {
            animationPlayState: 'paused'
          },
          '@keyframes toast-success': {
            '0%': { transform: 'translateY(10px)', opacity: 0 },
            '100%': { transform: 'translateY(0)', opacity: 1 }
          },
          '@keyframes toast-error': {
            '0%, 100%': { transform: 'translateX(0)' },
            '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
            '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
          },
          '@keyframes toast-pulse': {
            '0%': { boxShadow: '0 0 0 0 rgba(0, 0, 0, 0.2)' },
            '70%': { boxShadow: '0 0 0 10px rgba(0, 0, 0, 0)' },
            '100%': { boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)' }
          }
        }}
        tabIndex={0} // Importante para acessibilidade via teclado
      >
        {/* Ícone */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mr: 1.5,
          color: type === 'error' ? theme.palette.error.main :
                type === 'success' ? theme.palette.success.main :
                type === 'warning' ? theme.palette.warning.main :
                theme.palette.info.main
        }}>
          {getIcon()}
        </Box>

        {/* Conteúdo */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
            {message}
          </Typography>

          {/* Botão de ação */}
          {action && (
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                action.onClick();
                if (action.closeAfterClick !== false) {
                  closeToast();
                }
              }}
              sx={{ mt: 1, fontWeight: 'bold' }}
            >
              {action.label}
            </Button>
          )}
        </Box>

        {/* Botão de fechar */}
        <IconButton
          size="small"
          color="inherit"
          onClick={closeToast}
          aria-label="Fechar notificação"
          sx={{ ml: 1 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        {/* Barra de progresso */}
        <Box
          ref={progressRef}
          className="toast-progress"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            backgroundColor: theme.palette.background.primary,
            width: '100%',
          }}
        />
      </Paper>
    </Fade>
  );
};

export default React.memo(CustomToast);