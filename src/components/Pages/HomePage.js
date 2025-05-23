// src/components/Pages/HomePage.js
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  AppBar, 
  Toolbar, 
  TextField, 
  Box, 
  useScrollTrigger, 
  Fade,  
  styled,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
  Avatar
} from '@mui/material';
import { 
  People, 
  LiveTv, 
  Dashboard, 
  Lock, 
  MonetizationOn,
  ArrowUpward
} from '@mui/icons-material';
import { coreLogger } from '../../core/logging';
import { LOG_LEVELS } from '../../core/constants/config';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules'; 
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const MODULE_NAME = 'HomePage';

const portfolioItems = [
  { 
    title: 'Sistema de Gestão Empresarial', 
    image: '/assets/portfolio/portfolio-1.jpg', 
    description: 'Plataforma completa com módulos financeiros, RH e gestão de projetos integrada.' 
  },
  { 
    title: 'Plataforma de Comunicação', 
    image: '/assets/portfolio/portfolio-2.jpg', 
    description: 'Sistema integrado de comunicação corporativa com chat, videoconferência e compartilhamento de documentos.' 
  },
  { 
    title: 'Dashboard Analytics', 
    image: '/assets/portfolio/portfolio-3.jpg', 
    description: 'Painel de métricas com BI avançado para tomadas de decisão estratégicas.' 
  },
];

const features = [
  { icon: <Lock fontSize="large" />, title: 'Autenticação Segura', description: 'Sistema de convites e controle de acesso granular' },
  { icon: <MonetizationOn fontSize="large" />, title: 'Gestão Financeira', description: 'Caixinhas coletivas com relatórios detalhados' },
  { icon: <People fontSize="large" />, title: 'Rede Social Corporativa', description: 'Comunicação integrada entre serviços' },
  { icon: <LiveTv fontSize="large" />, title: 'Streaming Profissional', description: 'Plataforma para lives e transmissões corporativas' },
  { icon: <Dashboard fontSize="large" />, title: 'Painéis Administrativos', description: 'Controle completo de múltiplas aplicações' },
];

const HeroSection = styled('section')(({ theme }) => ({
  minHeight: '90vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(45deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.paper} 100%)`,
  color: theme.palette.text.primary,
  padding: theme.spacing(4),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundSize: '20px 20px',
    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
    opacity: 0.2,
  },
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s, box-shadow 0.3s',
  height: '100%',
  borderRadius: 2,
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: theme.shadows[10],
  },
  '& .MuiCardContent-root': {
    padding: theme.spacing(4),
  },
  '& .MuiSvgIcon-root': {
    color: theme.palette.secondary.main,
  },
}));

const StyledPortfolioCard = styled(Paper)(({ theme }) => ({
  position: 'relative',
  height: 500,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: 2,
  boxShadow: theme.shadows[4],
  [theme.breakpoints.down('md')]: {
    height: 400,
  },
  [theme.breakpoints.down('sm')]: {
    height: 300,
  },
}));

const PortfolioImageContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  width: '100%',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
  }
}));

const PortfolioImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const PortfolioContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  padding: theme.spacing(4),
  color: theme.palette.primary.main,
  zIndex: 1,
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
    width: 80,
    height: 4,
    backgroundColor: theme.palette.primary.main,
    transform: 'translateX(-50%)',
    borderRadius: 2,
  }
}));

const HomePage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [scrolled, setScrolled] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = portfolioItems.length;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1 === maxSteps ? 0 : prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1 < 0 ? maxSteps - 1 : prevActiveStep - 1);
  };

  const handleNavigation = (path) => {
    navigate(path);
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Navigation from HomePage', {
      from: location.pathname,
      to: path
    });
  };

  return (
    <Box className="home-page" sx={{ overflowX: 'hidden', mt: '100px' }}>
      <AppBar 
        position="fixed" 
        color={scrolled ? 'primary' : 'transparent'} 
        elevation={scrolled ? 4 : 0}
        sx={{ 
          transition: 'background-color 0.3s, box-shadow 0.3s',
          bgcolor: scrolled ? theme.palette.background.paper : 'transparent'
        }}
      >
        <Toolbar sx={{ py: { xs: 1, md: 2 } }}>
          <Typography color="secondary" variant="h4" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            <span style={{ color: theme.palette.text.primary }}>ElosCloud</span>
          </Typography>
          
          {!isMobile && (
            <>
              <Button color="primary" sx={{ mx: 1, fontWeight: 600 }}>{t('home.portfolio')}</Button>
              <Button color="primary" sx={{ mx: 1, fontWeight: 600 }}>{t('home.services')}</Button>
              <Button color="primary" sx={{ mx: 1, fontWeight: 600 }}>{t('home.contact')}</Button>
            </>
          )}
          
          <Button 
            variant="contained" 
            color="secondary" 
            sx={{ 
              borderRadius: 2, 
              ml: 2,
              fontWeight: 600,
              boxShadow: 3,
              '&:hover': {
                boxShadow: 6,
              }
            }}
            onClick={() => handleNavigation('/login')}
          >
            login
            {/* {t('login')} */}
          </Button>
        </Toolbar>
      </AppBar>

      <HeroSection>
        <Fade in timeout={1000}>
          <Grid container spacing={6} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={10} lg={8}>
              <Typography 
                variant={isMobile ? "h3" : "h1"}
                color="primary.main"  
                gutterBottom 
                sx={{ fontWeight: 800, mb: 4 }}
              >
                {t('hero.title')}
                <Typography 
                  component="span" 
                  display="block" 
                  color="secondary.main" 
                  sx={{ fontSize: '1.2em', mt: 1 }}
                >
                  {t('hero.subtitle')}
                </Typography>
              </Typography>
              <Typography 
                variant={isMobile ? "body1" : "h5"} 
                paragraph 
                color="primary.main"  
                sx={{ mb: 6, opacity: 0.9, maxWidth: '800px', mx: 'auto' }}
              >
                {t('hero.description')}
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                sx={{ 
                  borderRadius: 2, 
                  py: 2, 
                  px: 6,
                  fontSize: '1.1rem',
                  boxShadow: 4,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 6,
                  }
                }}
                href="#contact-section"
              >
                {t('hero.cta')}
              </Button>
            </Grid>
          </Grid>
        </Fade>
      </HeroSection>

      <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: theme.palette.background.paper }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <SectionTitle 
                            color="primary.main"  
                            variant={isMobile ? "h3" : "h2"} align="center">
              {t('features.title')}
            </SectionTitle>
          </Box>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Fade in timeout={(index + 1) * 400}>
                  <FeatureCard elevation={2}>
                    <CardContent sx={{ textAlign: 'center', height: '100%' }}>
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.background.paper,
                          width: 80,
                          height: 80,
                          mx: 'auto',
                          mb: 3,
                          '& .MuiSvgIcon-root': {
                            fontSize: '2.5rem',
                          }
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Typography 
                      color="secondary.main"  
                      variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </FeatureCard>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

<Box component="section" id="portfolio-section" sx={{ py: { xs: 8, md: 12 }, bgcolor: theme.palette.background.paper }}>
  <Container maxWidth="lg">
    <Box sx={{ textAlign: 'center', mb: 6 }}>
      <SectionTitle 
      color="primary.main"
      variant={isMobile ? "h3" : "h2"} align="center">
        {t('portfolio.title')}
      </SectionTitle>
    </Box>
    
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={50}
        slidesPerView={1}
        color="primary.main"  
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        pagination={{
          clickable: true,
          el: '.swiper-pagination',
          type: 'bullets',
        }}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        onSlideChange={(swiper) => setActiveStep(swiper.realIndex)}
      >
        {portfolioItems.map((item, index) => (
          <SwiperSlide key={index}>
            <StyledPortfolioCard>
              <PortfolioImageContainer>
                <PortfolioImage
                  // src={}
                  alt={item.title}
                />
              </PortfolioImageContainer>
              <PortfolioContent>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="body1">
                  {item.description}
                </Typography>
              </PortfolioContent>
            </StyledPortfolioCard>
          </SwiperSlide>
        ))}
      </Swiper>
      
{/* Controles de navegação - versão corrigida */}
<Box sx={{ 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  mt: 2,
  gap: 2,
  position: 'relative',
  height: 40  // Altura fixa para o container
}}>
  {/* Botão Anterior */}
  <IconButton 
    className="swiper-button-prev"
    sx={{ 
      bgcolor: theme.palette.background.paper, 
      color: theme.palette.text.primary,
      '&:hover': { bgcolor: theme.palette.text.primary },
      position: 'static',  // Remove posicionamento absoluto
      transform: 'none'     // Remove transformações
    }}
  >
    {/* <KeyboardArrowLeft /> */}
  </IconButton>
  
  {/* Paginação */}
  <Box className="swiper-pagination" sx={{
    display: 'flex',
    justifyContent: 'center',
    width: 'auto',  // Largura automática
    position: 'static',  // Remove posicionamento absoluto
    '& .swiper-pagination-bullet': {
      width: 12,
      height: 12,
      mx: 0.5,
      bgcolor: theme.palette.background.paper,
      opacity: 1,
      transition: 'all 0.3s',
    },
    '& .swiper-pagination-bullet-active': {
      bgcolor: 'secondary.main',
      transform: 'scale(1.2)'
    }
  }} />
  
  {/* Botão Próximo */}
  <IconButton 
    className="swiper-button-next"
    sx={{ 
      // bgcolor: 'primary.main', 
      color: 'white',
      '&:hover': { bgcolor: theme.palette.background.paper },
      position: 'static',  // Remove posicionamento absoluto
      transform: 'none'     // Remove transformações
    }}
  >
    {/* <KeyboardArrowRight /> */}
  </IconButton>
</Box>
    </Box>
  </Container>
</Box>

      <Box 
        component="section" 
        id="contact-section" 
        color="primary.main"  
        sx={{ 
          py: { xs: 8, md: 12 }, 
          bgcolor: [theme.palette.background.paper],
          background: `linear-gradient(to right, ${theme.palette.background.paper} 0%, ${theme.palette.background.paper} 100%)`
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant={isMobile ? "h3" : "h2"} 
                gutterBottom 
                sx={{ fontWeight: 700, mb: 3 }}
              >
                {t('contact.title')}
                <Typography 
                  component="span" 
                  display="block" 
                  color="secondary.main" 
                  sx={{ mt: 1 }}
                >
                  {t('contact.subtitle')}
                </Typography>
              </Typography>
              <Typography 
                variant="body1" 
                paragraph 
                sx={{ fontSize: '1.1rem', color: 'text.secondary', mb: 4 }}
              >
                {t('contact.description')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={6}
                sx={{ 
                  p: 4, 
                  borderRadius: 2,
                  bgcolor: theme.palette.background.paper,
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 8,
                    height: '100%',
                    backgroundColor: theme.palette.secondary.main
                  }
                }}
              >
                <Box 
                  component="form" 
                  id="contact-form" 
                  noValidate
                  autoComplete="off"
                  sx={{ pl: 2 }}
                >
                  <TextField 
                    label={t('form.name')}
                    variant="outlined" 
                    fullWidth 
                    required 
                    sx={{ mb: 3 }}
                    InputProps={{ sx: { borderRadius: 1.5 } }}
                  />
                  <TextField 
                    label={t('form.email')}
                    type="email"
                    variant="outlined" 
                    fullWidth 
                    required 
                    sx={{ mb: 3 }}
                    InputProps={{ sx: { borderRadius: 1.5 } }}
                  />
                  <TextField
                    label={t('form.message')}
                    variant="outlined"
                    multiline
                    rows={5}
                    fullWidth
                    required
                    sx={{ mb: 4 }}
                    InputProps={{ sx: { borderRadius: 1.5 } }}
                  />
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    type="submit"
                    fullWidth
                    size="large"
                    sx={{
                      py: 1.5,
                      borderRadius: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600
                    }}
                  >
                    {t('form.submit')}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <ScrollTopButton>
        <IconButton 
          color="secondary" 
          aria-label="scroll to top"
          sx={{ 
            bgcolor: theme.palette.background.paper,
            boxShadow: 6,
            '&:hover': {
              bgcolor: theme.palette.text.primary,
            }
          }}
        >
          <ArrowUpward />
        </IconButton>
      </ScrollTopButton>

      <Footer />
    </Box>
  );
};

export default HomePage;