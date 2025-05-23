import React, { useState, useMemo } from 'react';
import { 
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  Chip,
  Switch,
  FormControlLabel,
  Stack,
  Divider,
  useTheme
} from '@mui/material';

import {
  ModeNight as DarkIcon,
  LightMode as LightIcon,
  Palette as PaletteIcon,
  Contrast as ContrastIcon,
  Check as CheckIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

// Um simulador de visualização de tema que mostra como os componentes
// se comportariam com diferentes configurações de tema
const ThemePreview = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [themeVariant, setThemeVariant] = useState('ocean');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const theme = useTheme();
  
  // Paletas de temas disponíveis
  const themeVariants = useMemo(() => [
    { name: 'ocean', label: 'Oceano', primary: theme.palette.primary.main, secondary: theme.palette.secondary.main, accent: '#F97316' },
    { name: 'sunset', label: 'Pôr do Sol', primary: '#F97316', secondary: '#FB923C', accent: '#E53E3E' },
    { name: 'forest', label: 'Floresta', primary: '#22C55E', secondary: '#4ADE80', accent: '#8B6B38' },
    { name: 'mountain', label: 'Montanha', primary: '#466D6D', secondary: '#5E8888', accent: '#1E9EEB' },
    { name: 'glacier', label: 'Glacial', primary: '#1E9EEB', secondary: '#42BDF6', accent: '#0A84DE' },
    { name: 'volcano', label: 'Vulcânico', primary: '#E53E3E', secondary: '#F56565', accent: '#F97316' },
    { name: 'earth', label: 'Terra', primary: '#8B6B38', secondary: '#A48850', accent: '#22C55E' },
  ], []);

  // Seleciona a paleta atual
  const currentPalette = useMemo(() => 
    themeVariants.find(v => v.name === themeVariant) || themeVariants[0], 
    [themeVariant, themeVariants]
  );
  
  // Define estilos para simular o tema selecionado
  const previewStyles = useMemo(() => {
    const isDark = isDarkMode;
    
    return {
      container: {
        backgroundColor: isDark ? '#121212' : '#f5f5f5',
        color: isDark ? '#ffffff' : '#333333',
        transition: 'background-color 0.3s, color 0.3s',
        borderRadius: 8,
        overflow: 'hidden',
        border: `1px solid ${isDark ? '#333' : '#ddd'}`
      },
      header: {
        backgroundColor: currentPalette.primary,
        color: '#ffffff',
        padding: 2,
      },
      sidebar: {
        backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
        borderRight: `1px solid ${isDark ? '#333' : '#ddd'}`,
        height: '100%',
        width: '25%',
        padding: 2
      },
      content: {
        backgroundColor: isDark ? '#282828' : '#ffffff',
        padding: 2,
        width: '75%',
      },
      card: {
        backgroundColor: isDark ? '#333' : '#fff',
        color: isDark ? '#fff' : '#333',
        marginBottom: 2
      },
      button: {
        primary: {
          backgroundColor: currentPalette.primary,
          color: '#fff',
          '&:hover': {
            backgroundColor: isDark 
              ? `${currentPalette.primary}cc` 
              : `${currentPalette.primary}dd`,
          }
        },
        secondary: {
          backgroundColor: isDark ? '#333' : '#eee',
          color: isDark ? '#fff' : '#333',
          border: `1px solid ${isDark ? '#555' : '#ccc'}`,
        }
      },
      chip: {
        backgroundColor: currentPalette.secondary,
        color: '#fff',
        margin: 0.5
      }
    };
  }, [isDarkMode, currentPalette]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  const handleThemeChange = (themeName) => {
    setThemeVariant(themeName);
  };
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        <PaletteIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Visualização de Tema
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" paragraph>
          Simule como a interface se comportaria com diferentes temas e modos.
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={isDarkMode} 
                onChange={toggleDarkMode}
                color="primary"
              />
            }
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                {isDarkMode ? <DarkIcon fontSize="small" /> : <LightIcon fontSize="small" />}
                <Typography variant="body2">
                  {isDarkMode ? 'Modo Escuro' : 'Modo Claro'}
                </Typography>
              </Stack>
            }
          />
          
          <Divider orientation="vertical" flexItem />
          
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>Tema:</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {themeVariants.map((variant) => (
                <Chip
                  key={variant.name}
                  label={variant.label}
                  onClick={() => handleThemeChange(variant.name)}
                  color={variant.name === themeVariant ? "primary" : "default"}
                  icon={variant.name === themeVariant ? <CheckIcon /> : null}
                  size="small"
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>
      
      {/* Simulação de UI */}
      <Paper 
        elevation={3} 
        sx={{ 
          height: 400, 
          overflow: 'hidden',
          mb: 3,
          ...previewStyles.container
        }}
      >
        {/* Header */}
        <Box sx={previewStyles.header}>
          <Typography variant="h6">Aplicação Exemplo</Typography>
        </Box>
        
        {/* Conteúdo principal */}
        <Box sx={{ display: 'flex', height: 'calc(100% - 52px)' }}>
          {/* Sidebar */}
          <Box sx={previewStyles.sidebar}>
            <Typography variant="subtitle2" sx={{ mb: 2, opacity: 0.7 }}>
              Navegação
            </Typography>
            <Stack spacing={1}>
              {['Dashboard', 'Relatórios', 'Configurações', 'Usuários'].map((item, index) => (
                <Box 
                  key={item}
                  sx={{
                    p: 1, 
                    borderRadius: 1,
                    cursor: 'pointer',
                    backgroundColor: currentTab === index 
                      ? (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                    }
                  }}
                  onClick={() => setCurrentTab(index)}
                >
                  <Typography variant="body2">{item}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
          
          {/* Content Area */}
          <Box sx={previewStyles.content}>
            <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 2 }}>
              {['Dashboard', 'Relatórios', 'Configurações', 'Usuários'].map((tab) => (
                <Tab key={tab} label={tab} />
              ))}
            </Tabs>
            
            <Box hidden={currentTab !== 0}>
              <Typography variant="h6" gutterBottom>Dashboard</Typography>
              <Card sx={previewStyles.card}>
                <CardContent>
                  <Typography variant="body2">
                    Resumo de atividades recentes e métricas importantes.
                  </Typography>
                </CardContent>
              </Card>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button sx={previewStyles.button.primary}>
                  Ação Principal
                </Button>
                <Button sx={previewStyles.button.secondary}>
                  Ação Secundária
                </Button>
              </Box>
              <Stack direction="row" flexWrap="wrap">
                {['Vendas', 'Marketing', 'Produto', 'Suporte'].map((tag) => (
                  <Chip key={tag} label={tag} sx={previewStyles.chip} />
                ))}
              </Stack>
            </Box>

            <Box hidden={currentTab !== 1}>
              <Typography variant="h6" gutterBottom>Relatórios</Typography>
              <Typography variant="body2" paragraph>
                Visualização de dados e análises.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button sx={previewStyles.button.primary} startIcon={<VisibilityIcon />}>
                  Visualizar
                </Button>
                <Button sx={previewStyles.button.secondary}>
                  Exportar
                </Button>
              </Box>
            </Box>

            <Box hidden={currentTab !== 2}>
              <Typography variant="h6" gutterBottom>Configurações</Typography>
              <Typography variant="body2" paragraph>
                Personalize as preferências do sistema.
              </Typography>
              <FormControlLabel
                control={<Switch color="primary" />}
                label="Notificações por e-mail"
                sx={{ display: 'block' }}
              />
              <FormControlLabel
                control={<Switch color="primary" />}
                label="Modo compacto"
                sx={{ display: 'block' }}
              />
            </Box>

            <Box hidden={currentTab !== 3}>
              <Typography variant="h6" gutterBottom>Usuários</Typography>
              <Typography variant="body2" paragraph>
                Gerencie contas de usuários e permissões.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button sx={previewStyles.button.primary}>
                  Adicionar Usuário
                </Button>
                <Button sx={previewStyles.button.secondary}>
                  Editar Perfis
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ContrastIcon color="action" />
        <Typography variant="body2" color="text.secondary">
          Visualização simulada do tema {currentPalette.label} no modo {isDarkMode ? 'escuro' : 'claro'}
        </Typography>
      </Box>
    </Box>
  );
};

export default ThemePreview;