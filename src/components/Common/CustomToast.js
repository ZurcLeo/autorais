import React, { useCallback } from 'react';
import { Box, Typography, Button, IconButton, Fade } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const CustomToast = ({ closeToast, toastProps }) => {
  const theme = useTheme();
  const { type, message, action, icon: customIcon } = toastProps;

  const getBackgroundColor = useCallback(() => {
    switch (type) {
      case 'success':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'info':
        return theme.palette.info.main;
      case 'warning':
        return theme.palette.warning.main;
      default:
        return theme.palette.background.paper;
    }
  }, [theme, type]);

  const getIcon = useCallback(() => {
    if (customIcon) return customIcon;
    switch (type) {
      case 'success':
        return <CheckCircleOutlineIcon />;
      case 'error':
        return <ErrorOutlineIcon />;
      case 'info':
        return <InfoOutlinedIcon />;
      case 'warning':
        return <WarningAmberIcon />;
      default:
        return null;
    }
  }, [type, customIcon]);

  return (
    <Fade in={true}>
      <Box
        role="alert"
        aria-live="assertive"
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing(1.5, 2),
          borderRadius: theme.shape.borderRadius,
          backgroundColor: getBackgroundColor(),
          color: theme.palette.getContrastText(getBackgroundColor()),
          boxShadow: theme.shadows[3],
          maxWidth: '100%',
          width: '350px',
          '@media (max-width:400px)': {
            width: '100%',
          },
        }}
      >
        <Box sx={{ mr: 1.5 }}>{getIcon()}</Box>
        <Typography variant="body2" sx={{ flexGrow: 1 }}>
          {message}
        </Typography>
        {action && (
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              action.onClick();
              closeToast();
            }}
            sx={{ ml: 1 }}
          >
            {action.label}
          </Button>
        )}
        <IconButton
          size="small"
          color="inherit"
          onClick={closeToast}
          aria-label="Fechar notificação"
          sx={{ ml: 1 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Fade>
  );
};

export default React.memo(CustomToast);