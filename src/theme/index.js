// theme.js
import { createTheme } from '@mui/material/styles';
import { tokens, semanticTokens, colorPalettes } from './themeTokens';
import _ from 'lodash';
const createComponents = (mode, tokens, semanticColors) => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        transition: `background-color ${tokens.transitions.duration.slow} ${tokens.transitions.timing.ease}`,
        lineHeight: '1.6',
        fontSize: tokens.typography.fontSize.base,
        padding: '16px',
        margin: '24px',
      },
      'h1, h2, h3, h4, h5, h6': {
        color: semanticColors.text.primary,
        padding: '16px',
        margin: '24px',
      }
    },
  },
  MuiTypography: {
    styleOverrides: {
      h1: {
        fontSize: tokens.typography.fontSize['5xl'], // Título principal maior
        fontWeight: tokens.typography.fontWeight.bold,
        color: semanticColors.text.primary,
        letterSpacing: '-0.025em', // Ajuste fino para títulos grandes
      },
      h2: {
        fontSize: tokens.typography.fontSize['4xl'],
        fontWeight: tokens.typography.fontWeight.semiBold, // Um pouco menos bold que h1
        color: semanticColors.text.primary,
        letterSpacing: '-0.02em',
      },
      h3: {
        fontSize: tokens.typography.fontSize['3xl'],
        fontWeight: tokens.typography.fontWeight.medium, // Ainda menos bold
        color: semanticColors.text.primary,
        letterSpacing: '-0.015em',
      },
      h4: {
        fontSize: tokens.typography.fontSize['2xl'],
        fontWeight: tokens.typography.fontWeight.medium,
        color: semanticColors.text.primary,
        letterSpacing: '-0.01em',
      },
      h5: {
        fontSize: tokens.typography.fontSize.xl,
        fontWeight: tokens.typography.fontWeight.normal,
        color: semanticColors.text.primary,
      },
      h6: {
        fontSize: tokens.typography.fontSize.lg,
        fontWeight: tokens.typography.fontWeight.normal,
        color: semanticColors.text.primary,
        opacity: 0.8, // Suavemente atenuado para menos ênfase que h5
      },
      body1: {
        fontSize: tokens.typography.fontSize.base,
        color: semanticColors.text.secondary,
      },
      // Variant para código inline - Refinado
      code: {
        fontFamily: 'monospace',
        backgroundColor: semanticColors.background.tertiary, // Cor mais suave
        color: semanticColors.text.primary,
        padding: '4px 8px', // Mais padding para destacar
        borderRadius: tokens.borderRadius.sm, // Mais arredondado
        fontSize: '0.9rem', // Ajuste de tamanho
        fontWeight: 'medium', // Mais destaque
      },
      // Estilos para Typography quando component="pre" é usado (blocos de código) - Refinado
      pre: {
        fontFamily: 'monospace',
        fontSize: '0.9rem',
        whiteSpace: 'pre-wrap',
        backgroundColor: semanticColors.background.secondary,
        color: semanticColors.text.primary,
        padding: tokens.spacing.lg, // Mais padding vertical e horizontal
        borderRadius: tokens.borderRadius.md, // Um pouco mais arredondado
        overflowX: 'auto',
        margin: 0,
        border: `1px solid ${semanticColors.border.subtle}`, // Adiciona borda sutil
        // Adicionado para melhorar a legibilidade de blocos de código longos
        lineHeight: '1.5',
        tabSize: 4, // Define o tamanho do tab para melhor visualização de indentação
        direction: 'ltr', // Garante a direção da leitura da esquerda para a direita
        textAlign: 'left', // Alinhamento à esquerda padrão para código
        wordWrap: 'break-word', // Quebra palavras longas para evitar overflow horizontal extremo
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: semanticColors.background.primary,
        color: semanticColors.text.primary,
        boxShadow: tokens.elevation[1],
        transition: `all ${tokens.transitions.duration.base} ${tokens.transitions.timing.ease}`,
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        backgroundColor: semanticColors.background.secondary,
        color: semanticColors.text.primary,
        boxShadow: tokens.elevation[3],
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        backgroundColor: semanticColors.background.primary,
        color: semanticColors.text.primary,
        borderRadius: tokens.borderRadius.lg,
        boxShadow: tokens.elevation[4],
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: semanticColors.background.secondary,
        color: semanticColors.text.primary,
        borderRadius: tokens.borderRadius.base,
        boxShadow: tokens.elevation[1],
      },
    },
  },
  MuiSnackbar: {
    styleOverrides: {
      root: {
        backgroundColor: semanticColors.background.primary,
        color: semanticColors.text.primary,
        borderRadius: tokens.borderRadius.base,
        boxShadow: tokens.elevation[2],
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      indicator: {
        backgroundColor: semanticColors.background.accent,
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundColor: semanticColors.background.secondary, // Cor de fundo padrão para Paper
        color: semanticColors.text.primary, // Cor de texto padrão para Paper
        boxShadow: tokens.elevation[1], // Adiciona uma leve elevação padrão
        borderRadius: tokens.borderRadius.md, // Paper um pouco mais arredondado
        padding: '16px',
        margin: '24px', // Padding padrão para Paper
        // Melhor transição hover para Paper
        transition: `box-shadow ${tokens.transitions.duration.base} ${tokens.transitions.timing.ease}, transform ${tokens.transitions.duration.base} ${tokens.transitions.timing.ease}`,
        '&:hover': {
          boxShadow: tokens.elevation[3], // Elevação mais alta no hover
          transform: 'translateY(-2px)', // Leve elevação visual no hover
        }
      },
      // Variantes de Paper para diferentes contextos, se necessário, podem ser adicionadas aqui
      // Exemplo: Paper para seções de código mais destacadas
      codeSection: {
        backgroundColor: semanticColors.background.tertiary, // Fundo ainda mais suave para seções de código
        border: `1px solid ${semanticColors.border.default}`, // Borda mais visível
        padding: '16px', // Padding maior para seções de código
      }
    },
    error: {
      padding: '16px', 
    }
  },
  MuiTable: {
    styleOverrides: {
      root: {
        backgroundColor: semanticColors.background.primary,
        color: semanticColors.text.primary,
      },
    },
  },
  MuiPagination: {
    styleOverrides: {
      root: {
        '& .MuiPaginationItem-root': {
          color: semanticColors.text.primary,
        },
        '& .Mui-selected': {
          backgroundColor: semanticColors.background.accent,
        },
      },
    },
  },
  MuiAccordion: {
    styleOverrides: {
      root: {
        backgroundColor: semanticColors.background.secondary,
        color: semanticColors.text.primary,
        border: `1px solid ${semanticColors.border.subtle}`,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        backgroundColor: semanticColors.background.tertiary,
        color: semanticColors.text.primary,
      },
    },
  },
  MuiList: {
    styleOverrides: {
      root: {
        backgroundColor: semanticColors.background.primary,
        color: semanticColors.text.primary,
      },
    },
  },
  MuiBox: {
    styleOverrides: {
      section: {
        padding: '16px',
        margin: '24px',    // Opcional: padding vertical interno da seção
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)', // Opcional: Separador visual
      },
      subsection: {
        padding: '16px',
        margin: '24px',  // Opcional: Indentação para subseções
      },
    },
  },
  MuiListItem: {
    styleOverrides: {
      root: {
        '&:hover': {
          backgroundColor: semanticColors.background.tertiary,
        },
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: semanticColors.border.default, // Cor da Divider mais visível
        opacity: 0.5, // Reduz a opacidade para não ser muito intrusiva
        marginBottom: tokens.spacing.md, // Espaçamento abaixo da Divider
        marginTop: tokens.spacing.md,    // Espaçamento acima da Divider
      },
    }
  },
  MuiBackdrop: {
    styleOverrides: {
      root: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
    },
  },
  MuiSkeleton: {
    styleOverrides: {
      root: {
        backgroundColor: semanticColors.background.secondary,
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: tokens.borderRadius.medium, // Alerta mais arredondado
        marginBottom: '32px', // Margem inferior maior entre seções principais
        padding: '16px 0', // Espaçamento padrão abaixo dos alertas
        boxShadow: tokens.elevation[1], // Suave elevação
        // Ajustes de tipografia para alertas - mais conciso e claro
        '& .MuiAlertTitle-root': {
          fontWeight: tokens.typography.fontWeight.semiBold,
          marginBottom: tokens.spacing.sm, // Espaçamento abaixo do título do alerta
          fontSize: tokens.typography.fontSize.lg,
        },
        '& .MuiAlert-message': {
          fontSize: tokens.typography.fontSize.base,
          lineHeight: '1.4', // Melhor espaçamento entre linhas no corpo do alerta
        }
      },
      // Variantes de severidade - Cores mais sutis e integradas ao tema
      standardWarning: {
        backgroundColor: colorPalettes.sunset[400],
        color: semanticColors.text.primary,
        '& .MuiAlert-icon': {
          color: colorPalettes.sunset[700],
        }
      },
      standardError: {
        backgroundColor: colorPalettes.sunset[100],
        color: semanticColors.text.primary,
        '& .MuiAlert-icon': {
          color: colorPalettes.sunset[700],
        }
      },
      standardInfo: {
        backgroundColor: colorPalettes.ocean[100],
        color: semanticColors.text.primary,
        '& .MuiAlert-icon': {
          color: colorPalettes.ocean[700],
        }
      },
      standardSuccess: {
        backgroundColor: colorPalettes.forest[100],
        color: semanticColors.text.primary,
        '& .MuiAlert-icon': {
          color: colorPalettes.forest[700],
        }
      },

    }
  },
  MuiStepper: {
    styleOverrides: {
      root: {
        backgroundColor: semanticColors.background.primary,
        color: semanticColors.text.primary,
      },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: {
        '& .MuiSwitch-thumb': {
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)',
            opacity: 0,
            transition: 'opacity 0.2s ease-in-out',
          }
        },
        '&:hover .MuiSwitch-thumb': {
          transform: 'scale(1.1)',
          '&::before': {
            opacity: 1,
          }
        },
        '&:active .MuiSwitch-thumb': {
          transform: 'scale(0.9)',
        }
      }
    }
  },
  MuiSlider: {
    styleOverrides: {
      root: {
        color: semanticColors.background.accent,
      },
    },
  },
  MuiRating: {
    styleOverrides: {
      iconFilled: {
        color: semanticColors.background.accent,
      },
    },
  },
  MuiAutocomplete: {
    styleOverrides: {
      paper: {
        backgroundColor: semanticColors.background.primary,
        color: semanticColors.text.primary,
      },
    },
  },
  MuiSelect: {
    styleOverrides: {
      select: {
        backgroundColor: semanticColors.background.primary,
        color: semanticColors.text.primary,
      },
    },
  },
  MuiToolbar: {
    styleOverrides: {
      root: {
        backgroundColor: semanticColors.background.primary,
        color: semanticColors.text.primary,
      },
    },
  },
  MuiBreadcrumbs: {
    styleOverrides: {
      root: {
        color: semanticColors.text.primary,
      },
    },
  },
  MuiSpeedDial: {
    styleOverrides: {
      root: {
        backgroundColor: semanticColors.background.accent,
        color: semanticColors.text.primary,
      },
    },
  },
  MuiTimeline: {
    styleOverrides: {
      root: {
        backgroundColor: semanticColors.background.primary,
        color: semanticColors.text.primary,
      },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        backgroundColor: semanticColors.background.tertiary,
        color: semanticColors.text.primary,
      },
    },
  },
  MuiBadge: {
    styleOverrides: {
      badge: {
        backgroundColor: semanticColors.background.accent,
        color: semanticColors.text.primary,
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        backgroundColor: semanticColors.background.secondary,
      },
      bar: {
        backgroundColor: semanticColors.background.accent,
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: semanticColors.background.secondary,
        color: semanticColors.text.primary,
        borderRight: `1px solid ${semanticColors.border.subtle}`,
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        position: 'relative',
        transition: `all ${tokens.transitions.duration.base} cubic-bezier(0.34, 1.56, 0.64, 1)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 'inherit',
          transition: 'opacity 0.2s ease-in-out',
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
          opacity: 0,
        },
        '&:active': {
          transform: 'scale(0.98)',
        },
        '&:hover::before': {
          opacity: 1,
        },
        '&:focus-visible': {
          outline: `2px solid ${semanticColors.border.strong}`,
          outlineOffset: '2px',
        }
      }
    }
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: tokens.borderRadius.lg,
        padding: tokens.spacing.base,
        backgroundColor: semanticColors.background.primary,
        transition: `all ${tokens.transitions.duration.base} ${tokens.transitions.timing.ease}`,
        border: `1px solid ${semanticColors.border.subtle}`,
        '&:hover': {
          borderColor: semanticColors.border.default,
          transform: 'translateY(-2px)',
          boxShadow: tokens.elevation[2],
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiInputBase-root': {
          borderRadius: tokens.borderRadius.base,
          transition: `all ${tokens.transitions.duration.base} ${tokens.transitions.timing.ease}`,
          '&:hover': {
            borderColor: semanticColors.border.strong,
          },
          '&.Mui-focused': {
            boxShadow: `0 0 0 2px ${semanticColors.border.strong}`,
          },
        },
      },
    },
  },
  // Adicione mais componentes conforme necessário
});

// Função para criar tipografia
const createTypography = (tokens) => {
  // Função auxiliar para criar estilos de cabeçalho
  const createHeadingStyle = (size, letterSpacing = '-0.01em') => ({
    fontFamily: _.get(tokens, 'typography.fontFamily.heading', '"Roboto", "Helvetica", "Arial", sans-serif'),
    fontSize: _.get(tokens, `typography.fontSize.${size}`, '1rem'),
    fontWeight: _.get(tokens, 'typography.fontWeight.bold', 700),
    lineHeight: _.get(tokens, 'typography.lineHeight.tight', 1.2),
    letterSpacing,
  });

  // Criar sistema completo de tipografia com fallbacks seguros
  return {
    fontFamily: _.get(tokens, 'typography.fontFamily.body', '"Lato", sans-serif'),
    h1: createHeadingStyle('4xl', '-0.02em'),
    h2: createHeadingStyle('3xl'),
    h3: createHeadingStyle('2xl'),
    h4: createHeadingStyle('xl'),
    h5: createHeadingStyle('lg'),
    h6: createHeadingStyle('base'),
    subtitle1: {
      fontFamily: _.get(tokens, 'typography.fontFamily.body', '"Lato", sans-serif'),
      fontSize: _.get(tokens, 'typography.fontSize.lg', '1.125rem'),
      fontWeight: _.get(tokens, 'typography.fontWeight.medium', 500),
      lineHeight: _.get(tokens, 'typography.lineHeight.normal', 1.5),
    },
    subtitle2: {
      fontFamily: _.get(tokens, 'typography.fontFamily.body', '"Lato", sans-serif'),
      fontSize: _.get(tokens, 'typography.fontSize.base', '1rem'),
      fontWeight: _.get(tokens, 'typography.fontWeight.medium', 500),
      lineHeight: _.get(tokens, 'typography.lineHeight.normal', 1.5),
    },
    body1: {
      fontFamily: _.get(tokens, 'typography.fontFamily.body', '"Lato", sans-serif'),
      fontSize: _.get(tokens, 'typography.fontSize.base', '1rem'),
      fontWeight: _.get(tokens, 'typography.fontWeight.normal', 400),
      lineHeight: _.get(tokens, 'typography.lineHeight.normal', 1.5),
    },
    body2: {
      fontFamily: _.get(tokens, 'typography.fontFamily.body', '"Lato", sans-serif'),
      fontSize: _.get(tokens, 'typography.fontSize.sm', '0.875rem'),
      fontWeight: _.get(tokens, 'typography.fontWeight.normal', 400),
      lineHeight: _.get(tokens, 'typography.lineHeight.normal', 1.5),
    },
    button: {
      fontFamily: _.get(tokens, 'typography.fontFamily.body', '"Lato", sans-serif'),
      fontSize: _.get(tokens, 'typography.fontSize.sm', '0.875rem'),
      fontWeight: _.get(tokens, 'typography.fontWeight.medium', 500),
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
    },
    caption: {
      fontFamily: _.get(tokens, 'typography.fontFamily.body', '"Lato", sans-serif'),
      fontSize: _.get(tokens, 'typography.fontSize.xs', '0.75rem'),
      fontWeight: _.get(tokens, 'typography.fontWeight.normal', 400),
      lineHeight: _.get(tokens, 'typography.lineHeight.normal', 1.5),
    },
    overline: {
      fontFamily: _.get(tokens, 'typography.fontFamily.body', '"Lato", sans-serif'),
      fontSize: _.get(tokens, 'typography.fontSize.xs', '0.75rem'),
      fontWeight: _.get(tokens, 'typography.fontWeight.medium', 500),
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
    // Manter compatibilidade com versão anterior
    body: {
      fontFamily: _.get(tokens, 'typography.fontFamily.body', '"Lato", sans-serif'),
      fontSize: _.get(tokens, 'typography.fontSize.base', '1rem'),
      fontWeight: _.get(tokens, 'typography.fontWeight.normal', 400),
      lineHeight: _.get(tokens, 'typography.lineHeight.normal', 1.5),
    },
    small: {
      fontFamily: _.get(tokens, 'typography.fontFamily.body', '"Lato", sans-serif'),
      fontSize: _.get(tokens, 'typography.fontSize.sm', '0.875rem'),
      fontWeight: _.get(tokens, 'typography.fontWeight.normal', 400),
      lineHeight: _.get(tokens, 'typography.lineHeight.normal', 1.5),
    },
  };
};

// Define os tokens padrão para uso quando os tokens fornecidos estiverem ausentes
const defaultTokens = {
  borderRadius: { 
    xs: '2px',
    sm: '4px', 
    base: '8px', 
    md: '12px', 
    lg: '16px',
    xl: '24px'
  },
  typography: {
    fontFamily: {
      heading: '"Roboto", "Helvetica", "Arial", sans-serif',
      body: '"Roboto", "Helvetica", "Arial", sans-serif',
      monospace: '"Roboto Mono", "Courier New", monospace',
    },
    fontSize: { 
      '5xl': '3rem',    // 48px
      '4xl': '2.25rem', // 36px
      '3xl': '1.875rem', // 30px
      '2xl': '1.5rem',  // 24px
      'xl': '1.25rem',  // 20px
      'lg': '1.125rem', // 18px
      'base': '1rem',   // 16px
      'sm': '0.875rem', // 14px
      'xs': '0.75rem',  // 12px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
    '2xl': '3rem', // 48px
  },
  transitions: {
    duration: {
      fast: '150ms',
      base: '300ms',
      slow: '500ms',
    },
    timing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  elevation: {
    0: 'none',
    1: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    2: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
    3: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
    4: '0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.05)',
    5: '0 20px 40px rgba(0,0,0,0.2)',
  },
};

/**
 * Função de sanitização para customizações
 * Valida e sanitiza personalizações para prevenir valores inválidos
 */
const sanitizeCustomizations = (customizations) => {
  if (!_.isPlainObject(customizations)) {
    return {};
  }

  // Lista de propriedades permitidas no nível superior
  const allowedTopLevelKeys = ['palette', 'typography', 'spacing', 'shape', 'components'];
  
  // Filtra apenas propriedades permitidas
  return _.pickBy(customizations, (value, key) => {
    return allowedTopLevelKeys.includes(key);
  });
};

/**
 * Cria um tema dinâmico baseado em mode e customizações
 * @param {string} mode - Modo do tema: 'light' ou 'dark'
 * @param {Object} customizations - Customizações adicionais para o tema
 * @returns {Object} - Tema configurado
 */
export const createDynamicTheme = (mode = 'dark', customizations = {}) => {
  // Validação de input
  const validMode = ['light', 'dark'].includes(mode) ? mode : 'dark';
  
  // Aplica deep merge para tokens com fallbacks seguros
  const safeTokens = _.merge({}, defaultTokens, tokens || {});
  
  // Obtém cores semânticas com fallback
  const currentSemanticColors = _.get(semanticTokens, validMode, semanticTokens.dark);

  // Configuração base do tema
  const baseThemeConfig = {
    palette: {
      mode: validMode,
      primary: {
        main: _.get(colorPalettes, 'ocean[500]', '#1976d2'),
        light: _.get(colorPalettes, 'ocean[300]', '#42a5f5'),
        dark: _.get(colorPalettes, 'ocean[700]', '#0d47a1'),
      },
      secondary: {
        main: _.get(colorPalettes, 'sunset[500]', '#f50057'),
        light: _.get(colorPalettes, 'sunset[300]', '#ff4081'),
        dark: _.get(colorPalettes, 'sunset[700]', '#c51162'),
      },
      info: {
        main: _.get(colorPalettes, 'ocean[600]', '#0288d1'),
        light: _.get(colorPalettes, 'ocean[200]', '#4fc3f7'),
        dark: _.get(colorPalettes, 'ocean[700]', '#01579b'),
      },
      success: {
        main: _.get(colorPalettes, 'forest[500]', '#4caf50'),
        light: _.get(colorPalettes, 'forest[300]', '#81c784'),
        dark: _.get(colorPalettes, 'forest[700]', '#2e7d32'),
      },
      warning: {
        main: _.get(colorPalettes, 'volcano[500]', '#ff9800'),
        light: _.get(colorPalettes, 'volcano[300]', '#ffb74d'),
        dark: _.get(colorPalettes, 'volcano[700]', '#e65100'),
      },
      error: {
        main: _.get(colorPalettes, 'sunset[400]', '#f44336'),
        light: _.get(colorPalettes, 'sunset[200]', '#ef9a9a'),
        dark: _.get(colorPalettes, 'sunset[800]', '#b71c1c'),
      },
      background: {
        default: _.get(currentSemanticColors, 'background.primary', '#121212'),
        paper: _.get(currentSemanticColors, 'background.secondary', '#1e1e1e'),
      },
      text: {
        primary: _.get(currentSemanticColors, 'text.primary', '#ffffff'),
        secondary: _.get(currentSemanticColors, 'text.secondary', '#b0b0b0'),
      },
    },
    typography: createTypography(safeTokens),
    spacing: (factor) => `${0.25 * factor}rem`,
    shape: {
      borderRadius: parseInt(_.get(safeTokens, 'borderRadius.base', '8'), 10),
    },
    components: createComponents(validMode, safeTokens, currentSemanticColors),
  };

  // Sanitiza e aplica customizações
  const sanitizedCustomizations = sanitizeCustomizations(customizations);
  
  // Usa lodash.merge para deep merge das customizações
  const finalThemeConfig = _.merge({}, baseThemeConfig, sanitizedCustomizations);

  console.log('[DynamicTheme] Tema final criado com configurações:', {
    mode: finalThemeConfig.palette.mode,
    primaryMain: finalThemeConfig.palette.primary.main,
    backgroundDefault: finalThemeConfig.palette.background.default,
    textPrimary: finalThemeConfig.palette.text.primary,
    finalThemeConfig,
  });

  return createTheme(finalThemeConfig);
};