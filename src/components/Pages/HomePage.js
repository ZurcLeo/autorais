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
  ArrowUpward,
  SolarPower,
  Recycling,
  TrendingUp,
  Store,
  Verified
} from '@mui/icons-material';
import { coreLogger } from '../../core/logging';
import { LOG_LEVELS } from '../../core/constants/config';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';

const MODULE_NAME = 'HomePage';

const howItWorksCards = [
  {
    icon: <People fontSize="large" />,
    title: 'Faça o Bem',
    description: 'Plante árvores, use energia solar, recicle',
    emoji: '🌱'
  },
  {
    icon: <MonetizationOn fontSize="large" />,
    title: 'Ganhe GreenCoins',
    description: 'Suas ações viram moedas especiais verificadas',
    emoji: '💚'
  },
  {
    icon: <SolarPower fontSize="large" />,
    title: 'Descontos Reais',
    description: 'Troque por energia solar, produtos orgânicos e mais',
    emoji: '☀️'
  }
];

const impactNumbers = {
  treesPlanted: '10.247',
  solarPanels: '2.156',
  moneySaved: 'R$ 847.329'
};

const partners = [
  { name: 'Energia Solar Brasil', category: 'energia' },
  { name: 'Orgânicos & Cia', category: 'orgânicos' },
  { name: 'Instituto Verde', category: 'ong' },
  { name: 'EcoTech Solutions', category: 'tecnologia' }
];


const HeroSection = styled('section')(({ theme }) => ({
  minHeight: '90vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 50%, #e0f2e0 100%)`,
  backgroundImage: 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%2322c55e" fill-opacity="0.03"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3C/g%3E%3C/svg%3E")',
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
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
          <Typography color="secondary" variant="h4" sx={{ flexGrow: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <People sx={{ color: '#22c55e' }} />
            <span style={{ color: theme.palette.text.primary }}>ElosCloud</span>
          </Typography>
          
          {!isMobile && (
            <>
              <Button color="primary" sx={{ mx: 1, fontWeight: 600 }}>Como Funciona</Button>
              <Button color="primary" sx={{ mx: 1, fontWeight: 600 }}>Impacto</Button>
              <Button color="primary" sx={{ mx: 1, fontWeight: 600 }}>Parcerias</Button>
              <Button color="primary" sx={{ mx: 1, fontWeight: 600 }}>Sobre</Button>
            </>
          )}
          
          <Button 
            variant="outlined"
            color="primary" 
            sx={{ 
              borderRadius: 2, 
              ml: 1,
              mr: 1,
              fontWeight: 600
            }}
            onClick={() => handleNavigation('/login')}
          >
            Login
          </Button>
          <Button 
            variant="contained" 
            sx={{ 
              borderRadius: 2, 
              bgcolor: '#22c55e',
              color: 'white',
              fontWeight: 600,
              boxShadow: 3,
              '&:hover': {
                bgcolor: '#16a34a',
                boxShadow: 6,
              }
            }}
            onClick={() => handleNavigation('/register')}
          >
            Cadastrar
          </Button>
        </Toolbar>
      </AppBar>

      <HeroSection>
        <Box sx={{ 
          position: 'absolute', 
          top: '20%', 
          right: '10%', 
          opacity: 0.1, 
          fontSize: '200px',
          color: '#22c55e',
          transform: 'rotate(15deg)'
        }}>
          🌱
        </Box>
        <Box sx={{ 
          position: 'absolute', 
          bottom: '20%', 
          left: '10%', 
          opacity: 0.1, 
          fontSize: '150px',
          color: '#22c55e',
          transform: 'rotate(-10deg)'
        }}>
          ☀️
        </Box>
        <Fade in timeout={1000}>
          <Grid container spacing={6} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={10} lg={8}>
              <Typography 
                variant={isMobile ? "h3" : "h1"}
                sx={{ 
                  fontWeight: 800, 
                  mb: 3,
                  color: '#1a1a1a',
                  textAlign: 'center'
                }}
              >
                Transforme suas ações sustentáveis em benefícios reais
              </Typography>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                sx={{ 
                  mb: 6, 
                  color: '#4a5568', 
                  maxWidth: '800px', 
                  mx: 'auto',
                  textAlign: 'center',
                  lineHeight: 1.6
                }}
              >
                A primeira plataforma brasileira que recompensa seu impacto ambiental com descontos e vantagens exclusivas
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<People />}
                sx={{ 
                  borderRadius: 3, 
                  py: 2, 
                  px: 6,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  bgcolor: '#22c55e',
                  color: 'white',
                  boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#16a34a',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(34, 197, 94, 0.4)',
                  }
                }}
                onClick={() => handleNavigation('/register')}
              >
                Comece Agora - É Grátis
              </Button>
            </Grid>
          </Grid>
        </Fade>
      </HeroSection>

      {/* Seção Como Funciona */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <SectionTitle 
              variant={isMobile ? "h3" : "h2"} 
              align="center"
              sx={{ color: '#1a1a1a', mb: 2 }}
            >
              Como Funciona
            </SectionTitle>
            <Typography variant="h6" sx={{ color: '#6b7280', maxWidth: '600px', mx: 'auto' }}>
              Três passos simples para transformar suas ações em benefícios
            </Typography>
          </Box>
          
          <Grid container spacing={4} justifyContent="center">
            {howItWorksCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Fade in timeout={(index + 1) * 400}>
                  <Card 
                    elevation={0}
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      p: 4,
                      borderRadius: 3,
                      border: '2px solid #f0f0f0',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#22c55e',
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(34, 197, 94, 0.1)',
                      }
                    }}
                  >
                    <Box sx={{ 
                      fontSize: '4rem',
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      {card.emoji}
                    </Box>
                    
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        mb: 2, 
                        fontWeight: 700,
                        color: '#1a1a1a'
                      }}
                    >
                      {card.title}
                    </Typography>
                    
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#6b7280',
                        lineHeight: 1.6,
                        fontSize: '1.1rem'
                      }}
                    >
                      {card.description}
                    </Typography>
                    
                    {/* Ícone pequeno no canto */}
                    <Box sx={{ 
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      color: '#22c55e',
                      opacity: 0.3
                    }}>
                      {card.icon}
                    </Box>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Seção Seu Impacto em Números */}
      <Box 
        component="section" 
        sx={{ 
          py: { xs: 8, md: 12 }, 
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decorativo */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)`
        }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <SectionTitle 
              variant={isMobile ? "h3" : "h2"} 
              align="center"
              sx={{ color: '#1a1a1a', mb: 2 }}
            >
              Seu Impacto em Números
            </SectionTitle>
            <Typography variant="h6" sx={{ color: '#6b7280', maxWidth: '600px', mx: 'auto' }}>
              Veja o impacto real que nossa comunidade já está gerando
            </Typography>
          </Box>
          
          {/* Contadores de Impacto */}
          <Grid container spacing={4} sx={{ mb: 8 }}>
            <Grid item xs={12} md={4}>
              <Card 
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 3,
                  bgcolor: 'white',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(34, 197, 94, 0.15)',
                  }
                }}
              >
                <Box sx={{ fontSize: '3rem', mb: 2 }}>🌳</Box>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800, 
                    color: '#22c55e',
                    mb: 1
                  }}
                >
                  {impactNumbers.treesPlanted}
                </Typography>
                <Typography variant="h6" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                  Árvores Plantadas
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
                  Cada uma contribuindo para um planeta mais verde
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card 
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 3,
                  bgcolor: 'white',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(34, 197, 94, 0.15)',
                  }
                }}
              >
                <Box sx={{ fontSize: '3rem', mb: 2 }}>☀️</Box>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800, 
                    color: '#f59e0b',
                    mb: 1
                  }}
                >
                  {impactNumbers.solarPanels}
                </Typography>
                <Typography variant="h6" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                  Painéis Solares Instalados
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
                  Com desconto através da nossa plataforma
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card 
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 3,
                  bgcolor: 'white',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(34, 197, 94, 0.15)',
                  }
                }}
              >
                <Box sx={{ fontSize: '3rem', mb: 2 }}>💰</Box>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800, 
                    color: '#10b981',
                    mb: 1
                  }}
                >
                  {impactNumbers.moneySaved}
                </Typography>
                <Typography variant="h6" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                  Economizados pela Comunidade
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
                  Em descontos e benefícios sustentáveis
                </Typography>
              </Card>
            </Grid>
          </Grid>
          
          {/* Mapa do Brasil (placeholder) */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: '#1a1a1a', fontWeight: 600, mb: 4 }}>
              Impacto por Todo o Brasil
            </Typography>
            <Card 
              elevation={0}
              sx={{
                p: 6,
                borderRadius: 3,
                bgcolor: 'white',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 300
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ fontSize: '4rem', mb: 2 }}>🇧🇷</Box>
                <Typography variant="h6" sx={{ color: '#6b7280' }}>
                  Mapa interativo em desenvolvimento
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af', mt: 1 }}>
                  Visualize o impacto ambiental em tempo real por região
                </Typography>
              </Box>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* Seção Parcerias que Transformam */}
      <Box 
        component="section" 
        sx={{ 
          py: { xs: 8, md: 12 }, 
          bgcolor: 'white'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <SectionTitle 
              variant={isMobile ? "h3" : "h2"} 
              align="center"
              sx={{ color: '#1a1a1a', mb: 2 }}
            >
              Parcerias que Transformam
            </SectionTitle>
            <Typography variant="h6" sx={{ color: '#6b7280', maxWidth: '600px', mx: 'auto' }}>
              Empresas comprometidas com um futuro mais sustentável
            </Typography>
          </Box>
          
          {/* Grid de Parceiros */}
          <Grid container spacing={3} sx={{ mb: 8 }}>
            {partners.map((partner, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Card 
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 2,
                    border: '1px solid #f3f4f6',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#22c55e',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 16px rgba(34, 197, 94, 0.1)',
                    }
                  }}
                >
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    bgcolor: '#f0fdf4',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    {partner.category === 'energia' && <SolarPower sx={{ color: '#f59e0b' }} />}
                    {partner.category === 'orgânicos' && <People sx={{ color: '#22c55e' }} />}
                    {partner.category === 'ong' && <People sx={{ color: '#8b5cf6' }} />}
                    {partner.category === 'tecnologia' && <TrendingUp sx={{ color: '#3b82f6' }} />}
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#1a1a1a',
                      fontSize: '0.9rem'
                    }}
                  >
                    {partner.name}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Testemunhal em Destaque */}
          <Box sx={{ mb: 6 }}>
            <Card 
              elevation={0}
              sx={{
                p: 6,
                borderRadius: 3,
                bgcolor: '#f8fafc',
                border: '1px solid #e5e7eb',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Aspas decorativas */}
              <Box sx={{
                position: 'absolute',
                top: 20,
                left: 30,
                fontSize: '4rem',
                color: '#22c55e',
                opacity: 0.2,
                lineHeight: 1
              }}>
                “
              </Box>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  fontStyle: 'italic',
                  color: '#374151',
                  mb: 3,
                  lineHeight: 1.6,
                  position: 'relative',
                  zIndex: 1
                }}
              >
                "Economizei R$ 2.400 na minha conta de luz instalando painéis solares com desconto através da ElosCloud. Além de ajudar o planeta, estou poupando dinheiro!"
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 50, 
                    height: 50, 
                    bgcolor: '#22c55e',
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: 700
                  }}
                >
                  J
                </Avatar>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                    João Silva
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Usuário ElosCloud, São Paulo
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
          
          {/* Selo de Verificação */}
          <Box sx={{ textAlign: 'center' }}>
            <Card 
              elevation={0}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                p: 3,
                borderRadius: 2,
                bgcolor: '#f0fdf4',
                border: '1px solid #22c55e'
              }}
            >
              <Verified sx={{ color: '#22c55e', fontSize: '2rem' }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                  Impacto Validado por Tecnologia
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Todas as ações são verificadas e auditadas
                </Typography>
              </Box>
            </Card>
          </Box>
        </Container>
      </Box>
      
      {/* Seção CTA Final */}
      <Box 
        component="section" 
        sx={{ 
          py: { xs: 8, md: 12 }, 
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant={isMobile ? "h3" : "h2"} 
            sx={{ fontWeight: 800, mb: 3 }}
          >
            Pronto para Transformar o Mundo?
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ mb: 6, opacity: 0.9, lineHeight: 1.6 }}
          >
            Junte-se à nossa comunidade e comece a ganhar GreenCoins pelas suas ações sustentáveis hoje mesmo!
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<People />}
            sx={{ 
              borderRadius: 3, 
              py: 2, 
              px: 6,
              fontSize: '1.2rem',
              fontWeight: 700,
              bgcolor: 'white',
              color: '#22c55e',
              boxShadow: '0 8px 24px rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#f9fafb',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 32px rgba(255, 255, 255, 0.4)',
              }
            }}
            onClick={() => handleNavigation('/register')}
          >
            Cadastre-se Gratuitamente
          </Button>
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