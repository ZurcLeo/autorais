import { createTheme } from '@mui/material/styles';
import { tokens, semanticTokens, colorPalettes } from './theme/themeTokens';
import _ from 'lodash';
import { createThemeVariant } from './theme/themeVariants';

const createComponents = (mode, tokens, semanticColors) => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        transition: `background-color ${tokens.transitions.duration.slow} ${tokens.transitions.timing.ease}, color ${tokens.transitions.duration.slow} ${tokens.transitions.timing.ease}`,
        lineHeight: tokens.typography.lineHeight.normal,
        fontSize: tokens.typography.fontSize.base,
        backgroundColor: semanticColors.background.primary,
        color: semanticColors.text.primary,
        margin: 0,
        padding: 0,
        minHeight: '100vh',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${semanticColors.primary.main}, ${semanticColors.accent.main})`,
          zIndex: 1300,
        }
      },
      'h1, h2, h3, h4, h5, h6': {
        color: semanticColors.text.primary,
        margin: `${tokens.spacing.lg} 0 ${tokens.spacing.md} 0`,
        '&:first-child': {
          marginTop: 0
        }
      },
      a: {
        color: semanticColors.link.normal,
        textDecoration: 'none',
        transition: `color ${tokens.transitions.duration.base} ${tokens.transitions.timing.ease}`,
        '&:hover': {
          color: semanticColors.link.hover,
          textDecoration: 'underline'
        },
        '&:active': {
          color: semanticColors.link.active
        }
      },
      img: {
        maxWidth: '100%',
        height: 'auto',
        display: 'block'
      },
      'pre, code': {
        fontFamily: tokens.typography.fontFamily.mono
      }
    }
  },
  MuiTypography: {
    styleOverrides: {
      root: {
        '&.MuiTypography-gutterBottom': {
          marginBottom: tokens.spacing.md
        }
      },
      h1: {
        fontSize: tokens.typography.fontSize['5xl'],
        fontWeight: tokens.typography.fontWeight.bold,
        lineHeight: tokens.typography.lineHeight.tight,
        letterSpacing: '-0.025em',
        color: semanticColors.text.primary,
        '&::after': {
          content: '""',
          display: 'block',
          width: '80px',
          height: '4px',
          background: semanticColors.background.accent,
          marginTop: tokens.spacing.sm,
          borderRadius: tokens.borderRadius.full
        }
      },
      h2: {
        fontSize: tokens.typography.fontSize['4xl'],
        fontWeight: tokens.typography.fontWeight.semiBold,
        lineHeight: tokens.typography.lineHeight.snug,
        letterSpacing: '-0.02em',
        color: semanticColors.text.primary,
        marginTop: tokens.spacing.xl
      },
      h3: {
        fontSize: tokens.typography.fontSize['3xl'],
        fontWeight: tokens.typography.fontWeight.medium,
        lineHeight: tokens.typography.lineHeight.normal,
        letterSpacing: '-0.015em',
        color: semanticColors.text.primary,
        marginTop: tokens.spacing.lg
      },
      h4: {
        fontSize: tokens.typography.fontSize['2xl'],
        fontWeight: tokens.typography.fontWeight.medium,
        lineHeight: tokens.typography.lineHeight.normal,
        letterSpacing: '-0.01em',
        color: semanticColors.text.primary,
        marginTop: tokens.spacing.lg
      },
      h5: {
        fontSize: tokens.typography.fontSize.xl,
        fontWeight: tokens.typography.fontWeight.normal,
        lineHeight: tokens.typography.lineHeight.normal,
        color: semanticColors.text.primary
      },
      h6: {
        fontSize: tokens.typography.fontSize.lg,
        fontWeight: tokens.typography.fontWeight.normal,
        lineHeight: tokens.typography.lineHeight.normal,
        color: semanticColors.text.primary,
        opacity: 0.8
      },
      subtitle1: {
        fontSize: tokens.typography.fontSize.base,
        fontWeight: tokens.typography.fontWeight.medium,
        color: semanticColors.text.secondary,
        lineHeight: tokens.typography.lineHeight.relaxed
      },
      subtitle2: {
        fontSize: tokens.typography.fontSize.sm,
        fontWeight: tokens.typography.fontWeight.medium,
        color: semanticColors.text.secondary,
        lineHeight: tokens.typography.lineHeight.relaxed
      },
      body1: {
        fontSize: tokens.typography.fontSize.base,
        lineHeight: tokens.typography.lineHeight.relaxed,
        color: semanticColors.text.secondary,
        '& + &': {
          marginTop: tokens.spacing.sm
        }
      },
      body2: {
        fontSize: tokens.typography.fontSize.sm,
        lineHeight: tokens.typography.lineHeight.relaxed,
        color: semanticColors.text.secondary,
        opacity: 0.9
      },
      button: {
        textTransform: 'none',
        fontWeight: tokens.typography.fontWeight.medium,
        letterSpacing: '0.025em'
      },
      caption: {
        fontSize: tokens.typography.fontSize.xs,
        color: semanticColors.text.tertiary,
        lineHeight: tokens.typography.lineHeight.relaxed,
        display: 'inline-block'
      },
      overline: {
        fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.medium,
        color: semanticColors.text.tertiary,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        lineHeight: tokens.typography.lineHeight.relaxed
      },
      code: {
        fontFamily: tokens.typography.fontFamily.mono,
        backgroundColor: semanticColors.background.tertiary,
        color: semanticColors.text.code,
        padding: '2px 6px',
        borderRadius: tokens.borderRadius.sm,
        fontSize: '0.9em',
        fontWeight: tokens.typography.fontWeight.medium,
        border: `1px solid ${semanticColors.border.subtle}`
      },
      pre: {
        fontFamily: tokens.typography.fontFamily.mono,
        fontSize: '0.9em',
        whiteSpace: 'pre-wrap',
        backgroundColor: semanticColors.background.secondary,
        color: semanticColors.text.primary,
        padding: tokens.spacing.md,
        borderRadius: tokens.borderRadius.md,
        overflowX: 'auto',
        margin: `${tokens.spacing.lg} 0`,
        border: `1px solid ${semanticColors.border.subtle}`,
        lineHeight: tokens.typography.lineHeight.relaxed,
        '& code': {
          backgroundColor: 'transparent',
          padding: 0,
          border: 'none',
          color: 'inherit'
        }
      }
    }
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
  MuiLink: {
    styleOverrides: {
      root: {
        position: 'relative',
        transition: `all ${tokens.transitions.duration.base} ${tokens.transitions.timing.ease}`,
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-2px',
          left: 0,
          right: 0,
          height: '1px',
          backgroundColor: semanticColors.link.underline,
          transform: 'scaleX(0)',
          transformOrigin: 'right',
          transition: `transform ${tokens.transitions.duration.base} ${tokens.transitions.timing.ease}`
        },
        '&:hover': {
          color: semanticColors.link.hover,
          '&::after': {
            transform: 'scaleX(1)',
            transformOrigin: 'left'
          }
        },
        '&:active': {
          color: semanticColors.link.active
        }
      }
    }
  },
  
  MuiContainer: {
    styleOverrides: {
      root: {
        paddingLeft: tokens.spacing.lg,
        paddingRight: tokens.spacing.lg,
        '@media (min-width: 600px)': {
          paddingLeft: tokens.spacing.xl,
          paddingRight: tokens.spacing.xl
        }
      }
    }
  },
  
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundColor: semanticColors.background.secondary,
        color: semanticColors.text.primary,
        border: `1px solid ${semanticColors.border.subtle}`,
        boxShadow: tokens.elevation[1],
        borderRadius: tokens.borderRadius.md,
        transition: `all ${tokens.transitions.duration.base} ${tokens.transitions.timing.ease}`,
        '&:hover': {
          boxShadow: tokens.elevation[3],
          transform: 'translateY(-2px)',
          borderColor: semanticColors.border.default
        },
        '&.MuiPaper-elevation0': {
          backgroundColor: semanticColors.background.primary,
          border: 'none',
          boxShadow: 'none'
        }
      }
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
          backgroundColor: semanticColors.interaction.active.background,
          borderColor: semanticColors.interaction.active.border,
          color: semanticColors.interaction.active.text,
          transform: `scale(${semanticColors.interaction.active.scale})`,
        },
        '&:hover': {
          backgroundColor: semanticColors.interaction.hover.background,
          borderColor: semanticColors.interaction.hover.border,
          color: semanticColors.interaction.hover.text,
          transform: `scale(${semanticColors.interaction.hover.scale})`,
        },
        '&:hover::before': {
          opacity: 1,
        },
        '&:focus-visible': {
          outline: semanticColors.a11y.focusVisible.outline,
          outlineOffset: semanticColors.a11y.focusVisible.outlineOffset,
        },
        '&.Mui-disabled': {
          backgroundColor: semanticColors.interaction.disabled.background,
          borderColor: semanticColors.interaction.disabled.border,
          color: semanticColors.interaction.disabled.text,
          opacity: semanticColors.interaction.disabled.opacity,
          cursor: semanticColors.interaction.disabled.cursor,
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
    fontFamily: _.get(tokens, 'typography.fontFamily.body', '"Roboto", "Helvetica", "Arial", sans-serif'),
    h1: createHeadingStyle('4xl', '-0.02em'),
    h2: createHeadingStyle('3xl'),
    h3: createHeadingStyle('2xl'),
    h4: createHeadingStyle('xl'),
    h5: createHeadingStyle('lg'),
    h6: createHeadingStyle('base'),
    subtitle1: {
      fontFamily: _.get(tokens, 'typography.fontFamily.body', '"Roboto", "Helvetica", "Arial", sans-serif'),
      fontSize: _.get(tokens, 'typography.fontSize.lg', '1.125rem'),
      fontWeight: _.get(tokens, 'typography.fontWeight.medium', 500),
      lineHeight: _.get(tokens, 'typography.lineHeight.normal', 1.5),
    },
    subtitle2: {
      fontFamily: _.get(tokens, 'typography.fontFamily.body', '"Roboto", "Helvetica", "Arial", sans-serif'),
      fontSize: _.get(tokens, 'typography.fontSize.base', '1rem'),
      fontWeight: _.get(tokens, 'typography.fontWeight.medium', 500),
      lineHeight: _.get(tokens, 'typography.lineHeight.normal', 1.5),
    },
    body1: {
      fontFamily: _.get(tokens, 'typography.fontFamily.body', '"Roboto", "Helvetica", "Arial", sans-serif'),
      fontSize: _.get(tokens, 'typography.fontSize.base', '1rem'),
      fontWeight: _.get(tokens, 'typography.fontWeight.normal', 400),
      lineHeight: _.get(tokens, 'typography.lineHeight.normal', 1.5),
    },
    body2: {
      fontFamily: _.get(tokens, 'typography.fontFamily.body', '"Roboto", "Helvetica", "Arial", sans-serif'),
      fontSize: _.get(tokens, 'typography.fontSize.sm', '0.875rem'),
      fontWeight: _.get(tokens, 'typography.fontWeight.normal', 400),
      lineHeight: _.get(tokens, 'typography.lineHeight.normal', 1.5),
    },
    button: {
      fontFamily: _.get(tokens, 'typography.fontFamily.body', '"Roboto", "Helvetica", "Arial", sans-serif'),
      fontSize: _.get(tokens, 'typography.fontSize.sm', '0.875rem'),
      fontWeight: _.get(tokens, 'typography.fontWeight.medium', 500),
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
    },
    caption: {
      fontFamily: _.get(tokens, 'typography.fontFamily.body', '"Roboto", "Helvetica", "Arial", sans-serif'),
      fontSize: _.get(tokens, 'typography.fontSize.xs', '0.75rem'),
      fontWeight: _.get(tokens, 'typography.fontWeight.normal', 400),
      lineHeight: _.get(tokens, 'typography.lineHeight.normal', 1.5),
    },
    overline: {
      fontFamily: _.get(tokens, 'typography.fontFamily.body', '"Roboto", "Helvetica", "Arial", sans-serif'),
      fontSize: _.get(tokens, 'typography.fontSize.xs', '0.75rem'),
      fontWeight: _.get(tokens, 'typography.fontWeight.medium', 500),
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
    // Manter compatibilidade com versão anterior
    body: {
      fontFamily: _.get(tokens, 'typography.fontFamily.body', '"Roboto", "Helvetica", "Arial", sans-serif'),
      fontSize: _.get(tokens, 'typography.fontSize.base', '1rem'),
      fontWeight: _.get(tokens, 'typography.fontWeight.normal', 400),
      lineHeight: _.get(tokens, 'typography.lineHeight.normal', 1.5),
    },
    small: {
      fontFamily: _.get(tokens, 'typography.fontFamily.body', '"Roboto", "Helvetica", "Arial", sans-serif'),
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
export const createDynamicTheme = (mode = 'light', variant = 'ocean', customizations = {}) => {
  // Validação de input
  const validMode = ['light', 'dark'].includes(mode) ? mode : 'dark';
  
  // Aplica deep merge para tokens com fallbacks seguros
  const safeTokens = _.merge({}, defaultTokens, tokens || {});
  
  // Obtém cores semânticas com fallback
  const currentSemanticColors = _.get(semanticTokens, validMode, semanticTokens.dark);

  const variantSemanticColors = createThemeVariant(variant, validMode);

  // Configuração base do tema
  const baseThemeConfig = {
    palette: {
      mode: validMode,
      primary: {
        main: variantSemanticColors.primary.main,
        light: variantSemanticColors.primary.light,
        dark: variantSemanticColors.primary.dark,
      },
      secondary: {
        main: variantSemanticColors.secondary.main,
        light: variantSemanticColors.secondary.light,
        dark: variantSemanticColors.secondary.dark,
      },
      error: {
        main: colorPalettes.volcano[validMode === 'light' ? 500 : 300],
        light: colorPalettes.volcano[validMode === 'light' ? 300 : 100],
        dark: colorPalettes.volcano[validMode === 'light' ? 700 : 500],
      },
      warning: {
        main: colorPalettes.sunset[validMode === 'light' ? 500 : 300],
        light: colorPalettes.sunset[validMode === 'light' ? 300 : 100],
        dark: colorPalettes.sunset[validMode === 'light' ? 700 : 500],
      },
      success: {
        main: colorPalettes.forest[validMode === 'light' ? 500 : 300],
        light: colorPalettes.forest[validMode === 'light' ? 300 : 100],
        dark: colorPalettes.forest[validMode === 'light' ? 700 : 500],
      },
      info: {
        main: colorPalettes.glacier[validMode === 'light' ? 500 : 300],
        light: colorPalettes.glacier[validMode === 'light' ? 300 : 100],
        dark: colorPalettes.glacier[validMode === 'light' ? 700 : 500],
      },
      background: {
        default: variantSemanticColors.background.primary,
        paper: variantSemanticColors.background.secondary,
      },
      text: {
        primary: variantSemanticColors.text.primary,
        secondary: variantSemanticColors.text.secondary,
      },
    },
    typography: createTypography(safeTokens),
    spacing: (factor) => `${0.25 * factor}rem`,
    shape: {
      borderRadius: parseInt(_.get(safeTokens, 'borderRadius.base', '8'), 10),
    },
    components: createComponents(validMode, safeTokens, variantSemanticColors),
  };

  // Sanitiza e aplica customizações
  const sanitizedCustomizations = sanitizeCustomizations(customizations);
  
  // Usa lodash.merge para deep merge das customizações
  const finalThemeConfig = _.merge({}, baseThemeConfig, sanitizedCustomizations);

  return createTheme(finalThemeConfig);
};