// src/components/Pages/DemoPage.js
// Página pública de demonstração da plataforma ElosCloud.
//
// Arquitetura de segurança:
// - Zero chamadas ao backend
// - Zero criação de usuários Firebase
// - Zero acesso a dados reais
// - Dados são 100% estáticos, gerados em demoSeedData.js
// - DemoProvider re-provê todos os contextos com dados seed
// - Componentes reais renderizam normalmente sem saber que estão em demo
//
// Rota: /demo (pública, sem PrivateRoute)

import React from 'react';
import { Box, Container, Typography, Button, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DemoProvider from '../../demo/DemoProvider';
import DemoBanner from '../../demo/DemoBanner';
import { Dashboard } from '../Dashboard/Dashboard';

const DemoTopBar = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 800, color: theme.palette.primary.main, cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        ElosCloud
      </Typography>

      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <Button
          variant="outlined"
          size="small"
          color="primary"
          onClick={() => navigate('/login')}
          sx={{ fontWeight: 600 }}
        >
          Entrar
        </Button>
        <Button
          variant="contained"
          size="small"
          color="primary"
          onClick={() => navigate('/register')}
          sx={{ fontWeight: 600 }}
        >
          Criar conta
        </Button>
      </Box>
    </Box>
  );
};

const DemoPage = () => (
  <DemoProvider>
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <DemoBanner />
      <DemoTopBar />
      <Box sx={{ flex: 1, py: 3 }}>
        <Dashboard />
      </Box>
    </Box>
  </DemoProvider>
);

export default DemoPage;
