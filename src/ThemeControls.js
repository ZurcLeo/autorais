// ThemeControls.jsx
import React from 'react';
import { useTheme } from './themeContext';
import { Button, Stack, Switch, FormControlLabel } from '@mui/material';
import { DarkMode, LightMode, SettingsSystemDaydream, MotionPhotosOff, Contrast } from '@mui/icons-material'; 

export const ThemeControls = () => {
  // Obtenha o valor completo do contexto
  const themeContext = useTheme();

  // Desestrutura as propriedades e funções que precisamos
  const {
    mode,
    autoMode,
    reduceMotion,
    toggleTheme,
    toggleAutoMode,
    toggleReduceMotion,
    toggleHighContrast,
    highContrast, // Certifique-se de desestruturar highContrast também
  } = themeContext;

  return (
    <Stack spacing={2} direction="column">
    <Stack direction="row" spacing={2} alignItems="center">
      <Button
        variant="outlined"
        onClick={toggleTheme}
        startIcon={mode === 'light' ? <DarkMode /> : <LightMode />} // Ícones MUI para modo claro/escuro
        disabled={autoMode}
      >
        {mode === 'light' ? 'Modo Escuro' : 'Modo Claro'}
      </Button>

      <FormControlLabel
        control={
          <Switch
            checked={autoMode}
            onChange={toggleAutoMode}
            icon={<SettingsSystemDaydream />} // Ícone MUI para modo automático
          />
        }
        label="Automático"
      />
    </Stack>

    <FormControlLabel
      control={
        <Switch
          checked={reduceMotion}
          onChange={toggleReduceMotion}
          icon={<MotionPhotosOff />} // Ícone MUI para reduzir movimento
        />
      }
      label="Reduzir Movimento"
    />

    <FormControlLabel
      control={
        <Switch
          checked={highContrast}
          onChange={toggleHighContrast}
          icon={<Contrast />} // Ícone MUI para alto contraste
        />
      }
      label="Alto Contraste"
    />
  </Stack>
  );
};