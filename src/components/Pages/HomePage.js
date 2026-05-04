// src/components/Pages/HomePage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  AppBar,
  Toolbar,
  Box,
  useScrollTrigger,
  Fade,
  styled,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip
} from '@mui/material';
import {
  People,
  Lock,
  ArrowUpward,
  Savings,
  PixOutlined,
  GroupAdd,
  ChatBubbleOutline,
  BarChart,
  CardGiftcard,
  AccountBalanceWallet,
  VerifiedUser,
  CheckCircleOutline
} from '@mui/icons-material';
import { coreLogger } from '../../core/logging';
import { LOG_LEVELS } from '../../core/constants/config';
import Footer from './Footer';

const MODULE_NAME = 'HomePage';

const howItWorksSteps = [
  {
    icon: <Savings fontSize="large" />,
    step: '01',
    title: 'Crie sua Caixinha',
    description: 'Configure uma caixinha colaborativa, defina as regras e o valor das contribuições mensais.'
  },
  {
    icon: <GroupAdd fontSize="large" />,
    step: '02',
    title: 'Convide os Membros',
    description: 'Envie convites por e-mail. Cada membro aceita e se cadastra diretamente na plataforma.'
  },
  {
    icon: <PixOutlined fontSize="large" />,
    step: '03',
    title: 'Contribua via PIX',
    description: 'Gere cobranças PIX, pague com segurança e acompanhe o saldo em tempo real.'
  }
];

const features = [
  {
    icon: <Savings />,
    title: 'Caixinhas Colaborativas',
    description: 'Gerencie grupos de poupança com regras flexíveis, histórico completo e controle de saldo.'
  },
  {
    icon: <PixOutlined />,
    title: 'Pagamentos via PIX',
    description: 'Contribuições geradas automaticamente. Pagamentos validados e registrados sem burocracia.'
  },
  {
    icon: <ChatBubbleOutline />,
    title: 'Mensagens Integradas',
    description: 'Comunicação direta entre membros da caixinha dentro da própria plataforma.'
  },
  {
    icon: <AccountBalanceWallet />,
    title: 'Empréstimos',
    description: 'Solicite empréstimos ao grupo com regras definidas pelo gestor da caixinha.'
  },
  {
    icon: <CardGiftcard />,
    title: 'Rifas',
    description: 'Organize rifas dentro da caixinha como forma de distribuição ou arrecadação extra.'
  },
  {
    icon: <BarChart />,
    title: 'Relatórios',
    description: 'Visualize extratos, histórico de atividades e relatórios financeiros detalhados.'
  }
];

const trustItems = [
  { icon: <VerifiedUser />, label: 'Autenticação Firebase' },
  { icon: <Lock />, label: 'Validação bancária via PIX' },
  { icon: <CheckCircleOutline />, label: 'Tokens JWT seguros' },
  { icon: <People />, label: 'Controle de permissões por papel' }
];

const HeroSection = styled('section')(({ theme }) => ({
  minHeight: '88vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.background.default} 60%, ${theme.palette.secondary.main}06 100%)`,
  color: theme.palette.text.primary,
  padding: theme.spacing(4),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden'
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(6),
  position: 'relative',
  display: 'inline-block',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -10,
    left: '50%',
    width: 64,
    height: 4,
    backgroundColor: theme.palette.primary.main,
    transform: 'translateX(-50%)',
    borderRadius: 2
  }
}));

const ScrollTopButton = ({ children }) => {
  const trigger = useScrollTrigger({ threshold: 100 });
  return (
    <Fade in={trigger}>
      <Box
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        role="presentation"
        sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }}
      >
        {children}
      </Box>
    </Fade>
  );
};

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Navigation from HomePage', {
      from: location.pathname,
      to: path
    });
  };

  return (
    <Box className="home-page" sx={{ overflowX: 'hidden', mt: '100px' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={scrolled ? 4 : 0}
        sx={{
          transition: 'background-color 0.3s, box-shadow 0.3s',
          bgcolor: scrolled ? theme.palette.background.paper : 'transparent'
        }}
      >
        <Toolbar sx={{ py: { xs: 1, md: 2 } }}>
          <Typography
            variant="h5"
            sx={{ flexGrow: 1, fontWeight: 800, color: theme.palette.primary.main }}
          >
            ElosCloud
          </Typography>

          {!isMobile && (
            <>
              <Button color="primary" sx={{ mx: 1, fontWeight: 600 }}>Como Funciona</Button>
              <Button color="primary" sx={{ mx: 1, fontWeight: 600 }}>Recursos</Button>
              <Button color="primary" sx={{ mx: 1, fontWeight: 600 }}>Segurança</Button>
            </>
          )}

          <Button
            variant="outlined"
            color="primary"
            sx={{ borderRadius: 2, ml: 1, mr: 1, fontWeight: 600 }}
            onClick={() => handleNavigation('/login')}
          >
            Entrar
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2, fontWeight: 600 }}
            onClick={() => handleNavigation('/register')}
          >
            Cadastrar
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero */}
      <HeroSection>
        <Fade in timeout={800}>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={9} lg={7}>
              <Chip
                label="Plataforma colaborativa de caixinhas"
                color="primary"
                variant="outlined"
                size="small"
                sx={{ mb: 3, fontWeight: 600 }}
              />
              <Typography
                variant={isMobile ? 'h3' : 'h1'}
                sx={{ fontWeight: 800, mb: 3, lineHeight: 1.15 }}
              >
                Sua caixinha colaborativa,{' '}
                <Box component="span" sx={{ color: theme.palette.primary.main }}>
                  organizada e segura
                </Box>
              </Typography>
              <Typography
                variant={isMobile ? 'body1' : 'h6'}
                sx={{ mb: 5, color: theme.palette.text.secondary, maxWidth: 600, mx: 'auto', lineHeight: 1.7 }}
              >
                Crie e gerencie caixinhas comunitárias com contribuições via PIX, controle de membros,
                empréstimos, rifas e relatórios — tudo em um só lugar.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  sx={{ borderRadius: 2, py: 1.5, px: 5, fontWeight: 700, fontSize: '1.05rem' }}
                  onClick={() => handleNavigation('/register')}
                >
                  Criar conta grátis
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  color="primary"
                  sx={{ borderRadius: 2, py: 1.5, px: 5, fontWeight: 700, fontSize: '1.05rem' }}
                  onClick={() => handleNavigation('/demo')}
                >
                  Explorar Demo
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Fade>
      </HeroSection>

      {/* Como Funciona */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: theme.palette.background.default }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <SectionTitle variant={isMobile ? 'h4' : 'h3'} align="center">
              Como Funciona
            </SectionTitle>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: 520, mx: 'auto' }}>
              Três passos para começar a gerenciar sua caixinha colaborativa
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {howItWorksSteps.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Fade in timeout={(index + 1) * 350}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      p: 4,
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.divider}`,
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        transform: 'translateY(-6px)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                  >
                    <Typography
                      variant="h2"
                      sx={{ color: theme.palette.primary.main, opacity: 0.15, fontWeight: 900, lineHeight: 1, mb: 2 }}
                    >
                      {item.step}
                    </Typography>
                    <Box sx={{ color: theme.palette.primary.main, mb: 2 }}>
                      {item.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
                      {item.description}
                    </Typography>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Recursos */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: theme.palette.background.paper
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <SectionTitle variant={isMobile ? 'h4' : 'h3'} align="center">
              Tudo que sua caixinha precisa
            </SectionTitle>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: 520, mx: 'auto' }}>
              Funcionalidades completas para gestão financeira colaborativa
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      borderColor: theme.palette.primary.light,
                      boxShadow: theme.shadows[2]
                    }
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: `${theme.palette.primary.main}12`,
                      color: theme.palette.primary.main,
                      flexShrink: 0,
                      display: 'flex'
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Segurança */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 10 },
          bgcolor: theme.palette.background.default
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <SectionTitle variant={isMobile ? 'h4' : 'h3'} align="center">
              Seguro por construção
            </SectionTitle>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: 480, mx: 'auto' }}>
              Infraestrutura confiável para cuidar do dinheiro da sua comunidade
            </Typography>
          </Box>

          <Grid container spacing={2} justifyContent="center">
            {trustItems.map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Box sx={{ color: theme.palette.primary.main, display: 'flex' }}>
                    {item.icon}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Final */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: theme.palette.primary.main,
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="sm">
          <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 800, mb: 2 }}>
            Comece sua caixinha hoje
          </Typography>
          <Typography variant="body1" sx={{ mb: 5, opacity: 0.85, lineHeight: 1.7 }}>
            Cadastro gratuito. Configure sua caixinha em minutos e convide seus membros.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              borderRadius: 2,
              py: 1.5,
              px: 6,
              fontWeight: 700,
              fontSize: '1.05rem',
              bgcolor: 'white',
              color: theme.palette.primary.main,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.92)'
              }
            }}
            onClick={() => handleNavigation('/register')}
          >
            Criar conta grátis
          </Button>
        </Container>
      </Box>

      <ScrollTopButton>
        <IconButton
          aria-label="scroll to top"
          sx={{
            bgcolor: theme.palette.background.paper,
            boxShadow: 6,
            '&:hover': { bgcolor: theme.palette.action.hover }
          }}
        >
          <ArrowUpward color="primary" />
        </IconButton>
      </ScrollTopButton>

      <Footer />
    </Box>
  );
};

export default HomePage;
