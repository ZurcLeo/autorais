// ThemeControls.jsx
import React from 'react';
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
import { AVAILABLE_THEMES } from './theme';

// Componente de amostra de cor do tema
const ThemeColorSwatch = ({ color, label }) => (
  <Tooltip title={label || ''}>
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
);

// Cores de amostra para os temas
const themeColors = {
  ocean: ['#0A84DE', '#36A6F2'],
  sunset: ['#F97316', '#FB923C'],
  forest: ['#22C55E', '#4ADE80'],
  mountain: ['#466D6D', '#5E8888'],
  glacier: ['#1E9EEB', '#42BDF6'],
  volcano: ['#E53E3E', '#F56565'],
  earth: ['#8B6B38', '#A48850']
};

// Componente de opção de tema
const ThemeOption = ({ theme, themeLabels }) => {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Stack direction="row" spacing={0.5}>
        {themeColors[theme]?.map((color, index) => (
          <ThemeColorSwatch 
            key={index} 
            color={color} 
            label={`${themeLabels[theme]} ${index === 0 ? 'Primary' : 'Secondary'}`} 
          />
        ))}
      </Stack>
      <Typography>{themeLabels[theme] || theme}</Typography>
    </Stack>
  );
};

export const ThemeControls = ({ inMenu = false }) => {
  // Obter valores e funções do contexto de tema
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
    availableThemes = AVAILABLE_THEMES
  } = useAppTheme();

  // Mapeamento de nomes de temas para rótulos mais amigáveis
  const themeLabels = {
    ocean: 'Oceano',
    sunset: 'Pôr do Sol',
    forest: 'Floresta',
    mountain: 'Montanha',
    glacier: 'Glacial',
    volcano: 'Vulcânico',
    earth: 'Terra'
  };

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  // Estilos simplificados baseados na propriedade inMenu
  const styles = {
    menuStack: {
      width: '100%',
      p: inMenu ? 1 : 0
    },
    divider: {
      my: inMenu ? 0.5 : 1
    },
    formControl: {
      mb: inMenu ? 0 : 2,
      width: '100%'
    }
  };

  // Versão compacta para o menu do usuário
  if (inMenu) {
    return (
      <Stack spacing={1.5} direction="column" sx={styles.menuStack}>
        <FormControl variant="outlined" size="small" sx={styles.formControl}>
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

  // Versão completa para página de configurações
  return (
    <Stack spacing={2} direction="column">
      <Typography variant="h6" gutterBottom>
        Preferências de Tema
      </Typography>

      <FormControl variant="outlined" size="small" sx={styles.formControl}>
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
};