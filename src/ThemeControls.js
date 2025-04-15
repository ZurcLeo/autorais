// ThemeControls.jsx - Versão Otimizada
import React, { memo, useMemo } from 'react';
import { useAppTheme } from './themeContext';
import { 
  Button, 
  Stack, 
  Switch, 
  FormControlLabel, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Box,
  Paper,
  Grid,
  Typography,
  Tooltip,
  Divider,
  useTheme
} from '@mui/material';
import { 
  DarkMode, 
  LightMode, 
  SettingsSystemDaydream, 
  MotionPhotosOff, 
  Contrast,
  Palette
} from '@mui/icons-material'; 
import ThemePreview from './ThemePreview';

// Componente de amostra de cor do tema (memoizado)
const ThemeColorSwatch = memo(({ colorName, color }) => (
  <Tooltip title={colorName}>
    <Box 
      sx={{ 
        width: 24, 
        height: 24, 
        backgroundColor: color, 
        borderRadius: '50%',
        border: '1px solid rgba(0,0,0,0.1)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }} 
    />
  </Tooltip>
));

// Memoização do componente de rótulos de tema para evitar re-renderizações desnecessárias
const ThemeOption = memo(({ theme, themeLabels, themeColors }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Stack direction="row" spacing={0.5}>
      {themeColors[theme]?.map((color, index) => (
        <ThemeColorSwatch 
          key={index} 
          color={color} 
          colorName={`${themeLabels[theme]} ${index + 1}`} 
        />
      ))}
    </Stack>
    <Typography>{themeLabels[theme] || theme}</Typography>
  </Stack>
));

// Componente principal memoizado
export const ThemeControls = memo(({ inMenu = false }) => {
  // Obtenha o valor completo do contexto
  const themeContext = useAppTheme();
  const muiTheme = useTheme();

  // Desestrutura as propriedades e funções que precisamos
  const {
    mode,
    autoMode,
    reduceMotion,
    highContrast,
    toggleTheme,
    toggleAutoMode,
    toggleReduceMotion,
    toggleHighContrast,
    currentTheme,
    setTheme,
    availableThemes,
  } = themeContext;

  // Mapeia os nomes de temas para rótulos mais amigáveis (memoizado)
  const themeLabels = useMemo(() => ({
    ocean: 'Oceano',
    sunset: 'Pôr do Sol',
    forest: 'Floresta',
    mountain: 'Montanha',
    glacier: 'Glacial',
    volcano: 'Vulcânico',
    earth: 'Terra'
  }), []);

  // Cores de amostra para os temas (memoizado)
  const themeColors = useMemo(() => ({
    ocean: ['#0A84DE', '#36A6F2', '#7CC4FA'],
    sunset: ['#F97316', '#FB923C', '#FDBA74'],
    forest: ['#22C55E', '#4ADE80', '#86EFAC'],
    mountain: ['#466D6D', '#5E8888', '#7FA1A1'],
    glacier: ['#1E9EEB', '#42BDF6', '#7ED8FF'],
    volcano: ['#E53E3E', '#F56565', '#FC8181'],
    earth: ['#8B6B38', '#A48850', '#BFA878']
  }), []);

  // Estilos consistentes memoizados
  const styles = useMemo(() => ({
    menuStack: {
      width: '100%', 
      spacing: 1.5
    },
    fullStack: {
      spacing: 2
    },
    select: {
      mb: inMenu ? 0 : 2
    },
    divider: {
      my: inMenu ? 0.5 : 1
    }
  }), [inMenu]);

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  // Versão compacta para o menu do usuário
  if (inMenu) {
    return (
      <Stack spacing={1.5} direction="column" sx={styles.menuStack}>
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel id="theme-select-label-menu">Tema</InputLabel>
          <Select
            labelId="theme-select-label-menu"
            id="theme-select-menu"
            value={currentTheme}
            onChange={handleThemeChange}
            label="Tema"
            size="small"
          >
            {availableThemes.map((theme) => (
              <MenuItem key={theme} value={theme}>
                <ThemeOption 
                  theme={theme} 
                  themeLabels={themeLabels} 
                  themeColors={themeColors} 
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider sx={styles.divider} />
        
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <FormControlLabel
            control={
              <Switch
                checked={mode === 'dark'}
                onChange={toggleTheme}
                size="small"
                disabled={autoMode}
              />
            }
            label={
              <Typography variant="body2">
                {mode === 'light' ? 'Modo Claro' : 'Modo Escuro'}
              </Typography>
            }
          />
          <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Configurações de Tema</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <ThemeControls />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={7}>
          <ThemePreview />
        </Grid>
      </Grid>
    </Box>
          <FormControlLabel
            control={
              <Switch
                checked={autoMode}
                onChange={toggleAutoMode}
                size="small"
              />
            }
            label={
              <Typography variant="body2">Auto</Typography>
            }
          />
        </Stack>
        
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <FormControlLabel
            control={
              <Switch
                checked={reduceMotion}
                onChange={toggleReduceMotion}
                size="small"
              />
            }
            label={
              <Typography variant="body2">Reduzir Movimento</Typography>
            }
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={highContrast}
                onChange={toggleHighContrast}
                size="small"
              />
            }
            label={
              <Typography variant="body2">Alto Contraste</Typography>
            }
          />
        </Stack>
      </Stack>
    );
  }

  // Versão completa para página de configurações ou painel de controle
  return (
    <Stack spacing={2} direction="column" sx={styles.fullStack}>
      <Typography variant="h6" gutterBottom>
        Preferências de Tema
      </Typography>

      <FormControl fullWidth variant="outlined" size="small" sx={styles.select}>
        <InputLabel id="theme-select-label">Tema</InputLabel>
        <Select
          labelId="theme-select-label"
          id="theme-select"
          value={currentTheme}
          onChange={handleThemeChange}
          label="Tema"
          startAdornment={<Palette sx={{ mr: 1, ml: -0.5 }} />}
        >
          {availableThemes.map((theme) => (
            <MenuItem key={theme} value={theme}>
              <ThemeOption 
                theme={theme} 
                themeLabels={themeLabels} 
                themeColors={themeColors} 
              />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider sx={styles.divider} />
      
      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          variant="outlined"
          onClick={toggleTheme}
          startIcon={mode === 'light' ? <DarkMode /> : <LightMode />}
          disabled={autoMode}
          size="small"
        >
          {mode === 'light' ? 'Modo Escuro' : 'Modo Claro'}
        </Button>

        <FormControlLabel
          control={
            <Switch
              checked={autoMode}
              onChange={toggleAutoMode}
              size="small"
            />
          }
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <SettingsSystemDaydream fontSize="small" />
              <Typography variant="body2">Automático</Typography>
            </Stack>
          }
        />
      </Stack>

      <Divider sx={styles.divider} />
      
      <Typography variant="subtitle2" gutterBottom>
        Acessibilidade
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={reduceMotion}
            onChange={toggleReduceMotion}
            size="small"
          />
        }
        label={
          <Stack direction="row" spacing={1} alignItems="center">
            <MotionPhotosOff fontSize="small" />
            <Typography variant="body2">Reduzir Movimento</Typography>
          </Stack>
        }
      />

      <FormControlLabel
        control={
          <Switch
            checked={highContrast}
            onChange={toggleHighContrast}
            size="small"
          />
        }
        label={
          <Stack direction="row" spacing={1} alignItems="center">
            <Contrast fontSize="small" />
            <Typography variant="body2">Alto Contraste</Typography>
          </Stack>
        }
      />
    </Stack>
  );
});

ThemeControls.displayName = 'ThemeControls';
ThemeColorSwatch.displayName = 'ThemeColorSwatch';
ThemeOption.displayName = 'ThemeOption';