import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Link, 
  Divider, 
  useTheme, 
  IconButton,
  Stack,
  Paper,
  useMediaQuery
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Email, 
  LinkedIn, 
  Instagram, 
  Facebook,
  KeyboardArrowUp
} from '@mui/icons-material';

const Footer = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box 
      component="footer" 
      sx={{
        bgcolor: theme.palette.mode === 'dark' 
          ? theme.palette.grey[900] 
          : theme.palette.grey[50],
        position: 'relative',
        mt: 8,
        pt: { xs: 8, md: 10 },
        pb: 6,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }
      }}
    >
      {/* Top circle for back to top button */}
      <Box 
        sx={{ 
          position: 'absolute',
          top: -28,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            bgcolor: theme.palette.background.paper,
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)'
            }
          }}
          onClick={scrollToTop}
        >
          <KeyboardArrowUp 
            color="primary" 
            fontSize="large" 
          />
        </Paper>
      </Box>

      {/* Logo */}
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              display: 'inline-block',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              pb: 1
            }}
          >
            Elos<span>Cloud</span>
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mt: 1,
              maxWidth: 400,
              mx: 'auto'
            }}
          >
            Transformando ideias em soluções em nuvem
          </Typography>
        </Box>

        <Grid 
          container 
          spacing={isMobile ? 4 : 8} 
          justifyContent="space-between"
          sx={{ mb: 6 }}
        >
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 600 }}>
              Nossa Empresa
            </Typography>
            <Link
              component={RouterLink}
              to="/about"
              color="text.secondary"
              underline="none"
              sx={{ 
                display: 'block', 
                mb: 1.5,
                transition: 'color 0.2s',
                '&:hover': { color: 'primary.main', pl: 0.5 }
              }}
            >
              Sobre nós
            </Link>
            <Link
              component={RouterLink}
              to="/services"
              color="text.secondary"
              underline="none"
              sx={{ 
                display: 'block', 
                mb: 1.5,
                transition: 'color 0.2s',
                '&:hover': { color: 'primary.main', pl: 0.5 }
              }}
            >
              Serviços
            </Link>
            <Link
              component={RouterLink}
              to="/clients"
              color="text.secondary"
              underline="none"
              sx={{ 
                display: 'block',
                mb: 1.5,
                transition: 'color 0.2s',
                '&:hover': { color: 'primary.main', pl: 0.5 }
              }}
            >
              Nossos Clientes
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 600 }}>
              Informações Legais
            </Typography>
            <Link
              component={RouterLink}
              to="/privacy"
              color="text.secondary"
              underline="none"
              sx={{ 
                display: 'block', 
                mb: 1.5,
                transition: 'color 0.2s',
                '&:hover': { color: 'primary.main', pl: 0.5 }
              }}
            >
              Política de Privacidade
            </Link>
            <Link
              component={RouterLink}
              to="/terms"
              color="text.secondary"
              underline="none"
              sx={{ 
                display: 'block',
                mb: 1.5,
                transition: 'color 0.2s',
                '&:hover': { color: 'primary.main', pl: 0.5 }
              }}
            >
              Termos de Uso
            </Link>
            <Link
              component={RouterLink}
              to="/cookies"
              color="text.secondary"
              underline="none"
              sx={{ 
                display: 'block',
                transition: 'color 0.2s',
                '&:hover': { color: 'primary.main', pl: 0.5 }
              }}
            >
              Política de Cookies
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 600 }}>
              Entre em Contato
            </Typography>
            <Link
              href="mailto:contato@eloscloud.com.br"
              color="text.secondary"
              underline="none"
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                mb: 1.5,
                transition: 'color 0.2s',
                '&:hover': { color: 'primary.main' }
              }}
            >
              <Email sx={{ mr: 1, fontSize: 18 }} />
              contato@eloscloud.com.br
            </Link>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Rua Exemplo, 123 - São Paulo, SP
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <IconButton 
                size="small"
                aria-label="linkedin"
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { 
                    color: '#0077B5',
                    bgcolor: 'rgba(0, 119, 181, 0.1)'
                  }
                }}
              >
                <LinkedIn />
              </IconButton>
              <IconButton 
                size="small"
                aria-label="instagram"
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { 
                    color: '#E4405F',
                    bgcolor: 'rgba(228, 64, 95, 0.1)'
                  }
                }}
              >
                <Instagram />
              </IconButton>
              <IconButton 
                size="small"
                aria-label="facebook"
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { 
                    color: '#1877F2',
                    bgcolor: 'rgba(24, 119, 242, 0.1)'
                  }
                }}
              >
                <Facebook />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 4 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center' }}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ textAlign: isMobile ? 'center' : 'left', mb: isMobile ? 2 : 0 }}
          >
            © {currentYear} Elos Soluções Cloud. {t('common.rights')}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ textAlign: isMobile ? 'center' : 'right' }}
          >
            Projetado com ❤️ no Brasil
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;