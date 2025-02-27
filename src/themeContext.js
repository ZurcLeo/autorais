import React, {
  createContext,
  useMemo,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createDynamicTheme } from './theme/';
import { colorPalettes } from './theme/tokens';
import { coreLogger } from './core/logging/CoreLogger';
import { Button } from '@mui/material';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const THEME_STORAGE_KEY = 'app-theme-preferences';

export const ThemeContextProvider = ({ children, defaultMode = 'dark' }) => {
  const getStoredTheme = useCallback(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return stored ? JSON.parse(stored) : { mode: defaultMode };
    } catch {
      return { mode: defaultMode };
    }
  }, [defaultMode]);

  const [themeState, setThemeState] = useState(getStoredTheme);
  const [themeError, setThemeError] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeState));
    } catch (error) {
      coreLogger.logServiceError('Falha ao salvar tema:', error);
    }
  }, [themeState]);

  // Memoized handleChange OUTSIDE of useEffect
  const handleChange = useCallback((e) => {
    if (themeState.autoMode) {
      setThemeState((prev) => ({
        ...prev,
        mode: e.matches ? 'dark' : 'light',
      }));
    }
  }, [themeState.autoMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [handleChange]);

  // Mova todos os useCallback para o nível superior do componente
  // em vez de dentro do useMemo
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light',
      autoMode: false,
    }));
  }, []);

  const setThemeMode = useCallback((mode) => {
    setThemeState((prev) => ({
      ...prev,
      mode,
      autoMode: false,
    }));
  }, []);

  const toggleAutoMode = useCallback(() => {
    setThemeState((prev) => {
      const autoMode = !prev.autoMode;
      const newState = { ...prev, autoMode };

      if (autoMode) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        newState.mode = prefersDark ? 'dark' : 'light';
      }

      return newState;
    });
  }, []);

  const resetTheme = useCallback(() => {
    setThemeState({ mode: defaultMode, autoMode: false });
  }, [defaultMode]);

  const toggleReduceMotion = useCallback(() => {
    setThemeState(prev => ({
      ...prev,
      reduceMotion: !prev.reduceMotion
    }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setThemeState(prev => ({
      ...prev,
      highContrast: !prev.highContrast
    }));
  }, []);

  // Agora useMemo apenas para combinar os callbacks já criados
  const themeActions = useMemo(
    () => ({
      toggleTheme,
      setThemeMode,
      toggleAutoMode,
      resetTheme,
      toggleReduceMotion,
      toggleHighContrast,
    }),
    [toggleTheme, setThemeMode, toggleAutoMode, resetTheme, toggleReduceMotion, toggleHighContrast]
  );

  // Criação do tema com tratamento de erro
  const theme = useMemo(() => {
    try {
      const dynamicTheme = createDynamicTheme(themeState.mode, {
        components: {
          MuiButton: {
            defaultProps: {
              disableElevation: themeState.reduceMotion,
            },
            styleOverrides: {
              root: {
                transition: themeState.reduceMotion ? 'none' : undefined,
              },
            },
          },
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                scrollBehavior: themeState.reduceMotion ? 'auto' : 'smooth',
              },
            },
          },
        },
        palette: {
          mode: themeState.mode,
          primary: {
            main: colorPalettes.ocean[500],
            light: colorPalettes.ocean[300],
            dark: colorPalettes.ocean[700],
          },
          secondary: {
            main: colorPalettes.sunset[500],
            light: colorPalettes.sunset[300],
            dark: colorPalettes.sunset[700],
          },
          success: {
            main: colorPalettes.forest[500],
            light: colorPalettes.forest[300],
            dark: colorPalettes.forest[700],
          },
        },
      });

      // Fallbacks para paletas ausentes
      dynamicTheme.palette.success = dynamicTheme.palette.success || { main: '#4caf50', light: '#81c784', dark: '#388e3c' };
      dynamicTheme.palette.warning = dynamicTheme.palette.warning || { main: '#ff9800', light: '#ffb74d', dark: '#f57c00' };
      dynamicTheme.palette.error = dynamicTheme.palette.error || { main: '#f44336', light: '#e57373', dark: '#d32f2f' };
      dynamicTheme.palette.info = dynamicTheme.palette.info || { main: '#2196f3', light: '#64b5f6', dark: '#1976d2' };
      dynamicTheme.palette.grey = dynamicTheme.palette.grey || {
        50: '#fafafa', 100: '#f5f5f5', 200: '#eeeeee', 300: '#e0e0e0',
        400: '#bdbdbd', 500: '#9e9e9e', 600: '#757575', 700: '#616161',
        800: '#424242', 900: '#212121',
      };

      return dynamicTheme;
    } catch (error) {
      console.error('Erro ao criar tema:', error);
      setThemeError(error);
      return {
        palette: {
          mode: 'light', primary: { main: '#1976d2' }, secondary: { main: '#dc004e' },
          success: { main: '#4caf50', light: '#81c784', dark: '#388e3c' },
          warning: { main: '#ff9800', light: '#ffb74d', dark: '#f57c00' },
          error: { main: '#f44336', light: '#e57373', dark: '#d32f2f' },
          info: { main: '#2196f3', light: '#64b5f6', dark: '#1976d2' },
          grey: {
            50: '#fafafa', 100: '#f5f5f5', 200: '#eeeeee', 300: '#e0e0e0',
            400: '#bdbdbd', 500: '#9e9e9e', 600: '#757575', 700: '#616161',
            800: '#424242', 900: '#212121',
          },
          background: { default: '#fff', paper: '#fff' },
          text: { primary: 'rgba(0, 0, 0, 0.87)', secondary: 'rgba(0, 0, 0, 0.54)' },
          divider: 'rgba(0, 0, 0, 0.12)',
        },
        spacing: (factor) => `${0.25 * factor}rem`,
        shape: { borderRadius: 4 },
      };
    }
  }, [themeState.mode, themeState.reduceMotion]);

  // Context value com estado e ações do tema
  const contextValue = useMemo(
    () => ({
      ...themeActions,
      mode: themeState.mode,
      autoMode: themeState.autoMode,
      reduceMotion: themeState.reduceMotion,
      highContrast: themeState.highContrast,
      error: themeError,
      palette: theme.palette,
    }),
    [themeActions, themeState, themeError, theme.palette]
  );

  if (themeError) {
    console.error('Erro crítico no sistema de temas:', themeError);
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: colorPalettes.sunset[100],
        color: colorPalettes.sunset[700],
        fontFamily: 'sans-serif'
      }}>
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
          <h1>Erro ao Carregar Tema</h1>
          <p>Ocorreu um erro ao carregar o tema da aplicação.</p>
          <p style={{ fontSize: '0.9em', color: 'grey' }}>{themeError.message}</p>
          <Button onClick={() => window.location.reload()} variant="contained" color="primary">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};