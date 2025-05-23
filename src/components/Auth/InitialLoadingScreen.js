import {
    Button, Typography, Box,
    CircularProgress
  } from '@mui/material';
  import { 
ErrorOutline
  } from '@mui/icons-material';
/**
 * Componente de tela de carregamento a ser criado em components/Loaders/InitialLoadingScreen.js
 * Este é apenas um placeholder para referência - o componente real deve ser implementado separadamente
 */
export const InitialLoadingScreen = ({ type, message, details, retry }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 3 }}>
      {type === 'bootstrap' && <CircularProgress size={40} />}
      {(type === 'error' || type === 'critical-error') && (
        <ErrorOutline color="error" sx={{ fontSize: 40 }} />
      )}
      <Typography variant="h6" color="secondary" sx={{ mt: 2 }}>
        {message}
      </Typography>
      {details && (
        <Typography variant="body2" color="secondary" sx={{ mt: 1, maxWidth: '500px', textAlign: 'center' }}>
          {details}
        </Typography>
      )}
      {retry && (
        <Button variant="contained" color="primary" onClick={retry} sx={{ mt: 2 }}>
          Tentar novamente
        </Button>
      )}
    </Box>
  );
};