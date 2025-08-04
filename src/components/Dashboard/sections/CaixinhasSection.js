import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Box, 
  Button, 
  Chip,
  LinearProgress,
  Grid,
  Paper,
  IconButton,
  Fade,
  Zoom,
  useTheme,
  CardContent,
  CardActions,
  Tooltip
} from '@mui/material';
import { 
  OpenInNew as OpenInNewIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Add as AddIcon,
  CalendarToday as CalendarTodayIcon,
  People as PeopleIcon,
  MonetizationOn as MonetizationOnIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CaixinhaInvitesNotification from '../../Caixinhas/CaixinhaInvitesNotification';

// Componente de item de caixinha como card
const CaixinhaCard = ({ caixinha, onClick, index = 0 }) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  // Formatar valores monetários
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  // Formatar data
  const formatarData = (dataString) => {
    if (!dataString) return '';
    const data = new Date(dataString);
    return format(data, 'dd/MM/yyyy', { locale: ptBR });
  };

  // Calcular progresso da caixinha
  const calcularProgresso = (dataInicio, dataFim) => {
    if (!dataInicio || !dataFim) return 50;
    
    const inicio = new Date(dataInicio).getTime();
    const fim = new Date(dataFim).getTime();
    const hoje = new Date().getTime();
    
    if (hoje >= fim) return 100;
    if (hoje <= inicio) return 0;
    
    return Math.floor(((hoje - inicio) / (fim - inicio)) * 100);
  };

  const progresso = caixinha.dataInicio && caixinha.dataFim 
    ? calcularProgresso(caixinha.dataInicio, caixinha.dataFim)
    : 50;

  // Define cores e gradientes de acordo com o progresso
  const getProgressConfig = (progress) => {
    if (progress < 30) return { 
      color: 'info', 
      gradient: 'linear-gradient(135deg, #2196f3, #21cbf3)',
      bgGradient: 'linear-gradient(135deg, #2196f315, #21cbf305)'
    };
    if (progress < 70) return { 
      color: 'warning', 
      gradient: 'linear-gradient(135deg, #ff9800, #ffc107)',
      bgGradient: 'linear-gradient(135deg, #ff980015, #ffc10705)'
    };
    return { 
      color: 'success', 
      gradient: 'linear-gradient(135deg, #4caf50, #8bc34a)',
      bgGradient: 'linear-gradient(135deg, #4caf5015, #8bc34a05)'
    };
  };

  const progressConfig = getProgressConfig(progresso);

  // Calcular dias restantes
  const getDaysRemaining = (dataFim) => {
    if (!dataFim) return null;
    const fim = new Date(dataFim);
    const hoje = new Date();
    const diffTime = fim - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const diasRestantes = getDaysRemaining(caixinha.dataFim);

  return (
    <Fade in={true} timeout={300 + (index * 100)}>
      <Card
        elevation={isHovered ? 12 : 3}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onClick(caixinha)}
        sx={{
          cursor: 'pointer',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
          background: isHovered ? progressConfig.bgGradient : 'background.paper',
          border: `1px solid ${isHovered ? theme.palette[progressConfig.color].main + '30' : 'transparent'}`,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: progressConfig.gradient,
            transform: isHovered ? 'scaleX(1)' : 'scaleX(0.8)',
            transformOrigin: 'left',
            transition: 'transform 0.3s ease'
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header com nome e valor */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {caixinha.name}
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 800,
                  background: progressConfig.gradient,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent'
                }}
              >
                {formatCurrency(caixinha.saldoTotal)}
              </Typography>
            </Box>
            
            <IconButton 
              size="small" 
              sx={{ 
                opacity: isHovered ? 1 : 0.6,
                transition: 'opacity 0.3s ease'
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>

          {/* Métricas */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Chip
              icon={<PeopleIcon />}
              label={`${caixinha.members?.length || 0} membros`}
              size="small"
              variant="outlined"
              sx={{
                borderColor: theme.palette[progressConfig.color].main + '40',
                color: theme.palette[progressConfig.color].main,
                '& .MuiChip-icon': {
                  color: theme.palette[progressConfig.color].main
                }
              }}
            />
            
            {diasRestantes !== null && (
              <Chip
                icon={<ScheduleIcon />}
                label={diasRestantes > 0 ? `${diasRestantes} dias` : 'Finalizada'}
                size="small"
                variant="outlined"
                color={diasRestantes > 7 ? 'success' : diasRestantes > 0 ? 'warning' : 'error'}
              />
            )}
          </Box>

          {/* Progresso */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Progresso
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUpIcon 
                  fontSize="small" 
                  sx={{ color: theme.palette[progressConfig.color].main }}
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette[progressConfig.color].main
                  }}
                >
                  {progresso}%
                </Typography>
              </Box>
            </Box>
            
            <LinearProgress
              variant="determinate"
              value={progresso}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.palette[progressConfig.color].main + '20',
                '& .MuiLinearProgress-bar': {
                  background: progressConfig.gradient,
                  borderRadius: 4,
                  transition: 'transform 0.4s ease'
                }
              }}
            />
          </Box>

          {/* Data de término */}
          {caixinha.dataFim && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayIcon 
                fontSize="small" 
                sx={{ color: 'text.secondary' }}
              />
              <Typography variant="caption" color="text.secondary">
                Término: {formatarData(caixinha.dataFim)}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
};

export const CaixinhasSection = ({ data = [], maxInitialItems = 6, compact = false }) => {
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Handler para navegação quando clicar na caixinha
  const handleCaixinhaClick = (caixinha) => {
    navigate(`/caixinha/${caixinha.id}`);
  };
  
  // Controle de quais caixinhas exibir
  const displayedItems = showAll ? data : data.slice(0, maxInitialItems);
  const hiddenCount = data.length - maxInitialItems;
  
  // Navega para a página de caixinhas
  const goToCaixinhasPage = () => {
    navigate('/caixinhas');
  };
  
  // Criar nova caixinha
  const createNewCaixinha = () => {
    navigate('/caixinha/nova');
  };
  
  // Se não há dados, mostre uma mensagem com design moderno
  if (!data || data.length === 0) {
    return (
      <Box sx={{ mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            border: `2px dashed ${theme.palette.primary.main}40`
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: theme.shadows[8]
            }}
          >
            <MonetizationOnIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Suas caixinhas aparecerão aqui
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
            Crie sua primeira caixinha para começar a gerenciar seus recursos e alcançar seus objetivos financeiros
          </Typography>
          
          <Button 
            variant="contained" 
            size="large"
            startIcon={<AddIcon />}
            onClick={createNewCaixinha}
            sx={{ 
              borderRadius: 25,
              px: 4,
              py: 1.5,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              boxShadow: theme.shadows[8],
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[12]
              }
            }}
          >
            Criar Primeira Caixinha
          </Button>
          
          <Box sx={{ mt: 3 }}>
            <CaixinhaInvitesNotification />
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header da seção */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography 
          variant={compact ? "h6" : "h5"} 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent'
          }}
        >
          Minhas Caixinhas
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Ver todas as caixinhas">
            <Button 
              variant="outlined" 
              size="small"
              endIcon={<OpenInNewIcon />}
              onClick={goToCaixinhasPage}
              sx={{ borderRadius: 20 }}
            >
              Ver todas
            </Button>
          </Tooltip>
          
          <Zoom in={true}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={createNewCaixinha}
              sx={{ 
                borderRadius: 20,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: 'none',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              Nova
            </Button>
          </Zoom>
        </Box>
      </Box>
      
      {/* Grid de caixinhas */}
      <Grid container spacing={3}>
        {displayedItems.map((caixinha, index) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={compact ? 6 : 4} 
            lg={compact ? 4 : 3}
            key={caixinha.id}
          >
            <CaixinhaCard 
              caixinha={caixinha} 
              onClick={handleCaixinhaClick}
              index={index}
            />
          </Grid>
        ))}
      </Grid>
      
      {/* Botão para mostrar mais */}
      {data.length > maxInitialItems && (
        <Fade in={true} timeout={500}>
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setShowAll(!showAll)}
              endIcon={showAll ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              sx={{ 
                borderRadius: 25,
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              {showAll 
                ? 'Mostrar menos caixinhas' 
                : `Ver mais ${hiddenCount} caixinhas`}
            </Button>
          </Box>
        </Fade>
      )}
    </Box>
  );
};