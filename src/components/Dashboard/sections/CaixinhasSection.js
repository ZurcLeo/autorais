import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Divider, 
  Box, 
  Button, 
  Chip,
  LinearProgress
} from '@mui/material';
import { 
  OpenInNew as OpenInNewIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Add as AddIcon,
  CalendarToday as CalendarTodayIcon,
  People as PeopleIcon,
  MonetizationOn as MonetizationOnIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CaixinhaInvitesNotification from '../../Caixinhas/CaixinhaInvitesNotification';

// Componente de item de caixinha
const CaixinhaItem = ({ caixinha, onClick }) => {
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

  // Define cores de acordo com o progresso
  const getProgressColor = (progress) => {
    if (progress < 30) return 'info';
    if (progress < 70) return 'warning';
    return 'success';
  };

  return (
    <ListItem 
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s',
        py: 1.5,
        px: 2,
        '&:hover': {
          bgcolor: 'action.hover',
          transform: 'translateY(-2px)'
        },
        borderRadius: 1
      }}
      onClick={() => onClick(caixinha)}
    >
      <ListItemAvatar>
        <Avatar 
          sx={{ 
            width: 48, 
            height: 48,
            bgcolor: 'primary.light',
            color: 'primary.main',
            fontWeight: 'bold'
          }}
        >
          {caixinha.name ? caixinha.name.charAt(0).toUpperCase() : "C"}
        </Avatar>
      </ListItemAvatar>
      
      <ListItemText
        primaryTypographyProps={{ component: 'div' }}
        secondaryTypographyProps={{ component: 'div' }}
        primary={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="medium">
              {caixinha.name}
            </Typography>
            <Typography variant="h6" color="secondary.main" fontWeight="bold">
              {formatCurrency(caixinha.saldoTotal)}
            </Typography>
          </Box>
        }
        secondary={
          <Box sx={{ mt: 0.5 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PeopleIcon fontSize="small" color="primary" />
                <Typography variant="caption">
                  {caixinha.members?.length || 0} membros
                </Typography>
              </Box>
              
              {caixinha.dataFim && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarTodayIcon fontSize="small" color="primary" />
                  <Typography variant="caption">
                    Fim: {formatarData(caixinha.dataFim)}
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Box sx={{ width: '100%', mt: 1 }}>
              <LinearProgress
                variant="determinate"
                value={progresso}
                color={getProgressColor(progresso)}
                sx={{ height: 4, borderRadius: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {progresso}% concluído
                </Typography>
              </Box>
            </Box>
          </Box>
        }
      />
    </ListItem>
  );
};

export const CaixinhasSection = ({ data = [], maxInitialItems = 3 }) => {
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  
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
  
  // Se não há dados, mostre uma mensagem
  if (!data || data.length === 0) {
    return (
      <Card sx={{ borderRadius: 2, p: 3 }}>
        <Typography variant="h6">
          Você ainda não possui caixinhas
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Crie uma nova caixinha para começar a gerenciar seus recursos
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={createNewCaixinha}
          sx={{ borderRadius: 8 }}
        >
          Criar Caixinha
        </Button>
        <Card>
        <CaixinhaInvitesNotification />
        </Card>
      </Card>
    );
  }

  return (
    <section>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" color="text.secondary">
          Minhas Caixinhas
        </Typography>
        <Button 
          variant="text" 
          endIcon={<OpenInNewIcon />}
          onClick={goToCaixinhasPage}
        >
          Ver todas
        </Button>
      </Box>
      
      <Card sx={{ borderRadius: 2 }}>
        <List sx={{ p: 0 }}>
          {displayedItems.map((caixinha, index) => (
            <React.Fragment key={caixinha.id}>
              <CaixinhaItem caixinha={caixinha} onClick={handleCaixinhaClick} />
              {index < displayedItems.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
        
        {data.length > maxInitialItems && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Button
              onClick={() => setShowAll(!showAll)}
              endIcon={showAll ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              sx={{ textTransform: 'none' }}
            >
              {showAll 
                ? 'Mostrar menos' 
                : `Ver mais ${hiddenCount} caixinhas`}
            </Button>
          </Box>
        )}
        
        <Box 
          sx={{ 
            p: 2, 
            bgcolor: 'primary.light', 
            display: 'flex', 
            justifyContent: 'center',
            borderRadius: '0 0 8px 8px'
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={createNewCaixinha}
            sx={{ 
              borderRadius: 20,
              px: 3
            }}
          >
            Nova Caixinha
          </Button>
        </Box>
      </Card>
    </section>
  );
};