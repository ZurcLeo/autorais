import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{
        bgcolor: 'background.paper',
        py: 6,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              Elos Soluções Cloud
            </Typography>
            <Typography variant="body2" color="text.secondary">
            Transformando ideias em soluções em nuvem            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Informações Legais
            </Typography>
            <Link
              component={RouterLink}
              to="/privacy"
              color="text.secondary"
              sx={{ 
                display: 'block', 
                mb: 1,
                '&:hover': { color: 'primary.main' }
              }}
            >
Política de Privacidade
            </Link>
            <Link
              component={RouterLink}
              to="/terms"
              color="text.secondary"
              sx={{ 
                display: 'block',
                '&:hover': { color: 'primary.main' }
              }}
            >
              Termos de Uso
            </Link>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Contato
            </Typography>
            <Link
              href="mailto:contact@eloscloud.com.br"
              color="text.secondary"
              sx={{ 
                display: 'block',
                '&:hover': { color: 'primary.main' }
              }}
            >
              contato@eloscloud.com.br
            </Link>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center"
        >
          © {currentYear} Elos Soluções Cloud. {t('common.rights')}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;