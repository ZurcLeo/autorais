// theme.js - Arquivo unificado simplificado
import { createTheme } from '@mui/material/styles';

// Definir paletas básicas de cores para cada variante
const palettes = {
  ocean: {
    primary: {
      main: '#0A84DE',
      light: '#36A6F2',
      dark: '#0962A4'
    },
    secondary: {
      main: '#22C55E',
      light: '#4ADE80',
      dark: '#166534'
    }
  },
  sunset: {
    primary: {
      main: '#F97316',
      light: '#FB923C',
      dark: '#C2410C'
    },
    secondary: {
      main: '#E11D48',
      light: '#F43F5E',
      dark: '#BE123C'
    }
  },
  forest: {
    primary: {
      main: '#22C55E',
      light: '#4ADE80',
      dark: '#166534'
    },
    secondary: {
      main: '#0A84DE',
      light: '#36A6F2',
      dark: '#0962A4'
    }
  },
  mountain: {
    primary: {
      main: '#466D6D',
      light: '#5E8888',
      dark: '#2D4B4B'
    },
    secondary: {
      main: '#8B6B38',
      light: '#A48850',
      dark: '#634C28'
    }
  },
  glacier: {
    primary: {
      main: '#1E9EEB',
      light: '#42BDF6',
      dark: '#0D7ABB'
    },
    secondary: {
      main: '#466D6D',
      light: '#5E8888',
      dark: '#2D4B4B'
    }
  },
  volcano: {
    primary: {
      main: '#E53E3E',
      light: '#F56565',
      dark: '#C53030'
    },
    secondary: {
      main: '#F97316',
      light: '#FB923C',
      dark: '#C2410C'
    }
  },
  earth: {
    primary: {
      main: '#8B6B38',
      light: '#A48850',
      dark: '#634C28'
    },
    secondary: {
      main: '#22C55E',
      light: '#4ADE80',
      dark: '#166534'
    }
  }
};

// Definir cores de estados para feedback e interações
const stateColors = {
  error: {
    light: '#FEE2E2',
    main: '#EF4444',
    dark: '#B91C1C'
  },
  warning: {
    light: '#FEF3C7',
    main: '#F59E0B',
    dark: '#B45309'
  },
  info: {
    light: '#DBEAFE',
    main: '#3B82F6',
    dark: '#1D4ED8'
  },
  success: {
    light: '#DCFCE7',
    main: '#22C55E',
    dark: '#166534'
  }
};

// Função simplificada para criar tema
export const createAppTheme = (mode = 'light', variant = 'ocean', options = {}) => {
  const {
    reduceMotion = false,
    highContrast = false
  } = options;

  // Selecionar paleta de cores
  const themePalette = palettes[variant] || palettes.ocean;
  
  // Aplicar ajustes de contraste se necessário
  if (highContrast) {
    // Aumentar contraste para acessibilidade
    themePalette.primary.main = mode === 'light' 
      ? darkenColor(themePalette.primary.main, 0.2)
      : lightenColor(themePalette.primary.main, 0.2);
      
    themePalette.secondary.main = mode === 'light'
      ? darkenColor(themePalette.secondary.main, 0.2)
      : lightenColor(themePalette.secondary.main, 0.2);
  }

  return createTheme({
    palette: {
      mode,
      primary: themePalette.primary,
      secondary: themePalette.secondary,
      error: stateColors.error,
      warning: stateColors.warning,
      info: stateColors.info,
      success: stateColors.success,
      background: {
        default: mode === 'light' ? '#FFFFFF' : '#121212',
        paper: mode === 'light' ? '#F5F5F5' : '#1E1E1E',
      },
      text: {
        primary: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
        secondary: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
        disabled: mode === 'light' ? 'rgba(0, 0, 0, 0.38)' : 'rgba(255, 255, 255, 0.38)',
      },
      divider: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
    },
    typography: {
      fontFamily: '"Lato", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollBehavior: reduceMotion ? 'auto' : 'smooth',
            lineHeight: 1.5,
            // Remover estilos desnecessários adicionados nos arquivos antigos
          }
        }
      },
      MuiButton: {
        defaultProps: {
          disableElevation: reduceMotion,
        },
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            transition: reduceMotion ? 'none' : 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            // Remover efeitos excessivos e manter apenas sombras básicas
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            overflow: 'hidden',
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            // Remover efeitos personalizados complexos
            boxShadow: mode === 'light' 
              ? '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
              : '0 1px 3px rgba(0,0,0,0.24), 0 1px 2px rgba(0,0,0,0.36)',
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            // Simplificar e manter apenas estilos básicos
          }
        }
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          }
        }
      },
      // Remover estilos desnecessários para outros componentes
    },
  });
};

// Funções utilitárias para ajustes de cores (simplificadas)
function lightenColor(color, amount) {
  // Implementação simplificada para clarear cor
  return color; // Substituir por implementação real
}

function darkenColor(color, amount) {
  // Implementação simplificada para escurecer cor
  return color; // Substituir por implementação real
}

// Exportar constantes disponíveis para o restante da aplicação
export const AVAILABLE_THEMES = Object.keys(palettes);