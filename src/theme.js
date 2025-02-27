import { createTheme } from '@mui/material/styles';
import { tokens, semanticTokens, colorPalettes } from './theme/tokens';

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

const createTypography = (tokens) => {
  const createHeadingStyle = (size, letterSpacing = '-0.01em') => ({
    fontFamily: tokens.typography.fontFamily.heading,
    fontSize: tokens.typography.fontSize[size],
    fontWeight: tokens.typography.fontWeight.bold,
    lineHeight: tokens.typography.lineHeight.tight,
    letterSpacing,
  });

  return {
    fontFamily: tokens.typography.fontFamily.body,
    h1: createHeadingStyle('4xl', '-0.02em'),
    h2: createHeadingStyle('3xl'),
    h3: createHeadingStyle('2xl'),
    h4: createHeadingStyle('xl'),
    body: {
      fontFamily: tokens.typography.fontFamily.body,
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.normal,
      lineHeight: tokens.typography.lineHeight.normal,
    },
    small: {
      fontFamily: tokens.typography.fontFamily.body,
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.normal,
      lineHeight: tokens.typography.lineHeight.normal,
    },
  };
}

export const createDynamicTheme = (mode = 'dark', customizations = {}) => {
  const currentSemanticColors = semanticTokens[mode] || semanticTokens.dark; // Fallback seguro
  const safeTokens = tokens || { borderRadius: { base: '4px' } }; // Fallback caso tokens esteja indefinido

  const baseThemeConfig = {
    palette: {
      mode,
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
      background: {
        default: currentSemanticColors.background.primary,
        paper: currentSemanticColors.background.secondary,
      },
      text: {
        primary: currentSemanticColors.text.primary,
        secondary: currentSemanticColors.text.secondary,
      },
    },
    typography: createTypography(safeTokens),
    spacing: (factor) => `${0.25 * factor}rem`,
    shape: {
      borderRadius: parseInt(safeTokens.borderRadius.base, 10),
    },
    components: createComponents(mode, safeTokens, currentSemanticColors),
  };

console.log('BaseThemeConfig:', baseThemeConfig.components, 'TypeOf: ', typeof customizations === 'object' && customizations !== null ? customizations : {})

  // Aplica customizações apenas se forem válidas
  return createTheme(baseThemeConfig, typeof customizations === 'object' && customizations !== null ? customizations : {});
};