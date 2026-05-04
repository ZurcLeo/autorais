// src/demo/DemoBanner.js
// Faixa fixa no topo do modo demo.
// Informa claramente que o usuário está em modo de demonstração
// e oferece CTA de baixa fricção para solicitar convite.

import React from 'react';
import { Box, Typography, Button, Chip, useTheme, useMediaQuery } from '@mui/material';
import { VisibilityOutlined } from '@mui/icons-material';

const DemoBanner = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1200,
        bgcolor: theme.palette.primary.main,
        color: 'white',
        px: { xs: 2, md: 4 },
        py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Chip
          icon={<VisibilityOutlined sx={{ fontSize: '1rem !important', color: 'white !important' }} />}
          label="Demonstração"
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.7rem',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        />
        {!isMobile && (
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Você está explorando o ElosCloud com dados de exemplo.
            Nenhuma ação aqui afeta contas reais.
          </Typography>
        )}
      </Box>

      <Button
        variant="contained"
        size="small"
        href="mailto:contato@eloscloud.com.br?subject=Solicitar%20convite%20ElosCloud&body=Ol%C3%A1%2C%20explorei%20a%20demo%20e%20gostaria%20de%20receber%20um%20convite%20para%20usar%20o%20ElosCloud."
        sx={{
          bgcolor: 'white',
          color: theme.palette.primary.main,
          fontWeight: 700,
          fontSize: '0.8rem',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.92)',
          },
        }}
      >
        {isMobile ? 'Quero acesso' : 'Quero um convite'}
      </Button>
    </Box>
  );
};

export default DemoBanner;
