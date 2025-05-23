// themeContext.js - Versão simplificada e unificada
import React, {
  createContext,
  useMemo,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createAppTheme, AVAILABLE_THEMES } from './theme';
import { Button } from '@mui/material';
import { coreLogger } from './core/logging';

const ThemeContext = createContext();

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};

const THEME_STORAGE_KEY = 'app-theme-preferences';

export const ThemeContextProvider = ({ children, defaultMode = 'dark', defaultTheme = 'ocean' }) => {
  // Função para recuperar as preferências do tema do localStorage
  const getStoredTheme = useCallback(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return stored ? JSON.parse(stored) : { 
        mode: defaultMode,
        currentTheme: defaultTheme,
        autoMode: false,
        reduceMotion: false,
        highContrast: false
      };
    } catch {
      // Fallback seguro para caso de erro ao ler localStorage
      return { 
        mode: defaultMode,
        currentTheme: defaultTheme,
        autoMode: false,
        reduceMotion: false,
        highContrast: false
      };
    }
  }, [defaultMode, defaultTheme]);

  const [themeState, setThemeState] = useState(getStoredTheme);
  const [themeError, setThemeError] = useState(null);

  // Persistir preferências no localStorage quando mudarem
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeState));
    } catch (error) {
      coreLogger.logServiceError('Falha ao salvar tema:', error);
    }
  }, [themeState]);

  // Gerenciar modo automático baseado nas preferências do sistema
  const handleMediaQueryChange = useCallback((e) => {
    if (themeState.autoMode) {
      setThemeState((prev) => ({
        ...prev,
        mode: e.matches ? 'dark' : 'light',
      }));
    }
  }, [themeState.autoMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Usar o método de evento apropriado dependendo da API disponível
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaQueryChange);
      return () => mediaQuery.removeEventListener('change', handleMediaQueryChange);
    } else {
      // Fallback para navegadores mais antigos
      mediaQuery.addListener(handleMediaQueryChange);
      return () => mediaQuery.removeListener(handleMediaQueryChange);
    }
  }, [handleMediaQueryChange]);

  // Funções de controle do tema - mantidas para compatibilidade
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
    setThemeState({ 
      mode: defaultMode, 
      currentTheme: defaultTheme,
      autoMode: false,
      reduceMotion: false,
      highContrast: false
    });
  }, [defaultMode, defaultTheme]);

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

  const setTheme = useCallback((themeName) => {
    if (AVAILABLE_THEMES.includes(themeName)) {
      console.log(`[Theme] Alterando tema para: ${themeName}`);
      setThemeState(prev => ({
        ...prev,
        currentTheme: themeName
      }));
    } else {
      console.warn(`[Theme] Tema "${themeName}" inválido. Temas disponíveis: ${AVAILABLE_THEMES.join(', ')}`);
    }
  }, []);

  // Compilar ações de tema para o contexto
  const themeActions = useMemo(
    () => ({
      toggleTheme,
      setThemeMode,
      toggleAutoMode,
      resetTheme,
      toggleReduceMotion,
      toggleHighContrast,
      setTheme,
    }),
    [toggleTheme, setThemeMode, toggleAutoMode, resetTheme, toggleReduceMotion, toggleHighContrast, setTheme]
  );

  // Criar o tema MUI usando a função simplificada
  const theme = useMemo(() => {
    try {
      console.log(`[Theme] Criando tema: ${themeState.currentTheme}, modo: ${themeState.mode}`);
      
      return createAppTheme(
        themeState.mode,
        themeState.currentTheme,
        {
          reduceMotion: themeState.reduceMotion,
          highContrast: themeState.highContrast
        }
      );
    } catch (error) {
      console.error('Erro ao criar tema:', error);
      setThemeError(error);
      
      // Retornar tema básico em caso de erro
      return createAppTheme('light', 'ocean');
    }
  }, [themeState.mode, themeState.currentTheme, themeState.reduceMotion, themeState.highContrast]);

  // Preparar valor do contexto
  const contextValue = useMemo(
    () => ({
      ...themeActions,
      mode: themeState.mode,
      autoMode: themeState.autoMode,
      reduceMotion: themeState.reduceMotion,
      highContrast: themeState.highContrast,
      currentTheme: themeState.currentTheme || 'ocean',
      availableThemes: AVAILABLE_THEMES,
      error: themeError,
      palette: theme.palette,
      // Expor algumas propriedades úteis do tema para componentes
      spacing: theme.spacing,
      breakpoints: theme.breakpoints,
    }),
    [themeActions, themeState, themeError, theme]
  );

  // Renderizar página de erro em caso de falha crítica no tema
  if (themeError) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa',
        color: '#343a40',
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

  // Renderizar o provedor de tema
  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};