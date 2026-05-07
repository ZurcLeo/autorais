// src/components/Pages/HomePage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import LanguageSwitcher from '../../LanguageSwitcher';
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
  const { t } = useTranslation();

  const howItWorksSteps = [
    {
      icon: <Savings fontSize="large" />,
      step: '01',
      title: t('home.howItWorks.step1.title'),
      description: t('home.howItWorks.step1.description')
    },
    {
      icon: <GroupAdd fontSize="large" />,
      step: '02',
      title: t('home.howItWorks.step2.title'),
      description: t('home.howItWorks.step2.description')
    },
    {
      icon: <PixOutlined fontSize="large" />,
      step: '03',
      title: t('home.howItWorks.step3.title'),
      description: t('home.howItWorks.step3.description')
    }
  ];

  const features = [
    {
      icon: <Savings />,
      title: t('home.features.items.savings.title'),
      description: t('home.features.items.savings.description')
    },
    {
      icon: <PixOutlined />,
      title: t('home.features.items.pix.title'),
      description: t('home.features.items.pix.description')
    },
    {
      icon: <ChatBubbleOutline />,
      title: t('home.features.items.messages.title'),
      description: t('home.features.items.messages.description')
    },
    {
      icon: <AccountBalanceWallet />,
      title: t('home.features.items.loans.title'),
      description: t('home.features.items.loans.description')
    },
    {
      icon: <CardGiftcard />,
      title: t('home.features.items.raffles.title'),
      description: t('home.features.items.raffles.description')
    },
    {
      icon: <BarChart />,
      title: t('home.features.items.reports.title'),
      description: t('home.features.items.reports.description')
    }
  ];

  const trustItems = [
    { icon: <VerifiedUser />, label: t('home.security.items.firebaseAuth') },
    { icon: <Lock />, label: t('home.security.items.pixValidation') },
    { icon: <CheckCircleOutline />, label: t('home.security.items.jwtTokens') },
    { icon: <People />, label: t('home.security.items.rbac') }
  ];

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
              <Button color="primary" sx={{ mx: 1, fontWeight: 600 }}>{t('home.nav.howItWorks')}</Button>
              <Button color="primary" sx={{ mx: 1, fontWeight: 600 }}>{t('home.nav.features')}</Button>
              <Button color="primary" sx={{ mx: 1, fontWeight: 600 }}>{t('home.nav.security')}</Button>
            </>
          )}

          <Button
            variant="outlined"
            color="primary"
            sx={{ borderRadius: 2, ml: 1, mr: 1, fontWeight: 600 }}
            onClick={() => handleNavigation('/login')}
          >
            {t('common.login_button')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2, fontWeight: 600 }}
            onClick={() => handleNavigation('/register')}
          >
            {t('home.nav.register')}
          </Button>
          <LanguageSwitcher />
        </Toolbar>
      </AppBar>

      {/* Hero */}
      <HeroSection>
        <Fade in timeout={800}>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={9} lg={7}>
              <Chip
                label={t('home.hero.chip')}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ mb: 3, fontWeight: 600 }}
              />
              <Typography
                variant={isMobile ? 'h3' : 'h1'}
                sx={{ fontWeight: 800, mb: 3, lineHeight: 1.15 }}
              >
                {t('home.hero.titlePart1')}{' '}
                <Box component="span" sx={{ color: theme.palette.primary.main }}>
                  {t('home.hero.titleHighlight')}
                </Box>
              </Typography>
              <Typography
                variant={isMobile ? 'body1' : 'h6'}
                sx={{ mb: 5, color: theme.palette.text.secondary, maxWidth: 600, mx: 'auto', lineHeight: 1.7 }}
              >
                {t('home.hero.subtitle')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  sx={{ borderRadius: 2, py: 1.5, px: 5, fontWeight: 700, fontSize: '1.05rem' }}
                  onClick={() => handleNavigation('/register')}
                >
                  {t('home.hero.ctaPrimary')}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  color="primary"
                  sx={{ borderRadius: 2, py: 1.5, px: 5, fontWeight: 700, fontSize: '1.05rem' }}
                  onClick={() => handleNavigation('/demo')}
                >
                  {t('home.hero.ctaSecondary')}
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
              {t('home.howItWorks.title')}
            </SectionTitle>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: 520, mx: 'auto' }}>
              {t('home.howItWorks.subtitle')}
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
              {t('home.features.title')}
            </SectionTitle>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: 520, mx: 'auto' }}>
              {t('home.features.subtitle')}
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
              {t('home.security.title')}
            </SectionTitle>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: 480, mx: 'auto' }}>
              {t('home.security.subtitle')}
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
            {t('home.cta.title')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 5, opacity: 0.85, lineHeight: 1.7 }}>
            {t('home.cta.subtitle')}
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
            {t('home.hero.ctaPrimary')}
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
