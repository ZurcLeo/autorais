import _ from 'lodash';
import { tokens, semanticTokens, colorPalettes } from './themeTokens';

/**
 * Cria uma variação temática baseada em uma paleta específica
 * @param {string} paletteName - Nome da paleta (ocean, sunset, forest, volcano, etc)
 * @param {string} mode - Modo do tema (light/dark)
 * @param {Object} options - Opções adicionais para customização
 * @returns {Object} - Novo tema configurado com a paleta específica
 */
export const createThemeVariant = (paletteName = 'ocean', mode = 'light', options = {}) => {
  // Validar entrada com fallbacks seguros
  const validPalettes = Object.keys(colorPalettes);
  const validPalette = validPalettes.includes(paletteName) ? paletteName : 'ocean';
  const validMode = ['light', 'dark'].includes(mode) ? mode : 'light';
  
  // Obter a paleta de cores selecionada com fallback
  const primaryPalette = _.get(colorPalettes, validPalette, colorPalettes.ocean);
  
  // Obter tokens semânticos base para o modo com deep clone para evitar mutações
  const baseSemanticTokens = _.cloneDeep(_.get(semanticTokens, validMode, semanticTokens.light));
  
  // Definir características específicas de cada paleta com combinações harmônicas
  const paletteCharacteristics = {
    ocean: {
      accent: colorPalettes.sunset,
      secondary: colorPalettes.forest,
      tertiary: colorPalettes.glacier,
      neutral: colorPalettes.mountain
    },
    sunset: {
      accent: colorPalettes.volcano,
      secondary: colorPalettes.earth,
      tertiary: colorPalettes.ocean,
      neutral: colorPalettes.mountain
    },
    forest: {
      accent: colorPalettes.earth,
      secondary: colorPalettes.glacier,
      tertiary: colorPalettes.ocean,
      neutral: colorPalettes.mountain
    },
    mountain: {
      accent: colorPalettes.glacier,
      secondary: colorPalettes.ocean,
      tertiary: colorPalettes.forest,
      neutral: colorPalettes.earth
    },
    glacier: {
      accent: colorPalettes.ocean,
      secondary: colorPalettes.mountain,
      tertiary: colorPalettes.forest,
      neutral: colorPalettes.earth
    },
    volcano: {
      accent: colorPalettes.sunset,
      secondary: colorPalettes.earth,
      tertiary: colorPalettes.mountain,
      neutral: colorPalettes.ocean
    },
    earth: {
      accent: colorPalettes.forest,
      secondary: colorPalettes.sunset,
      tertiary: colorPalettes.volcano,
      neutral: colorPalettes.mountain
    }
  };
  
  // Obter paletas relacionadas com fallback seguro
  const paletteSet = _.get(paletteCharacteristics, validPalette, paletteCharacteristics.ocean);
  const { accent, secondary, tertiary, neutral } = paletteSet;
  
  // Processar opções customizadas
  const {
    contrastLevel = 1, // Nível de contraste (0.5 = menos contraste, 1 = normal, 1.5 = mais contraste)
    saturationLevel = 1, // Nível de saturação (valores menores = mais neutro, valores maiores = mais vibrante)
    accentStrength = 1, // Intensidade dos acentos (0.5 = sutil, 1 = normal, 1.5 = forte)
    customFeedbackColors = false // Usar cores de feedback customizadas baseadas na paleta principal
  } = options;
  
  // Função para ajustar nível de cores com base em contrastLevel
// Função para ajustar nível de cores com base em contrastLevel
  const adjustColor = (lightColor, darkColor) => {
      // Se estamos no modo light
      if (validMode === 'light') {
        const matchLight = lightColor.match(/\d+/);
        if (matchLight) {
          const baseValue = parseInt(matchLight[0], 10);
  
          if (baseValue <= 50) {
            // Para tons claros, ajustar com base no contraste (maior contraste = mais escuro)
            return lightColor;
          } else {
            // Calcular o próximo nível baseado no contrastLevel
            const adjustment = Math.round((baseValue - 50) * (contrastLevel - 1));
            const newValue = Math.max(50, Math.min(900, baseValue + adjustment));
            return lightColor.replace(/\d+/, newValue);
          }
        }
        return lightColor; // Retornar a cor original se não houver correspondência
      } else {
        // No modo dark, fazer o inverso
        const matchDark = darkColor.match(/\d+/);
        if (matchDark) {
          const baseValue = parseInt(matchDark[0], 10);
  
          if (baseValue >= 500) {
            return darkColor;
          } else {
            const adjustment = Math.round((500 - baseValue) * (contrastLevel - 1));
            const newValue = Math.max(50, Math.min(900, baseValue - adjustment));
            return darkColor.replace(/\d+/, newValue);
          }
        }
        return darkColor; // Retornar a cor original se não houver correspondência
      }
    };
  
  // Criar novo tema com a paleta selecionada como primária e todas as propriedades necessárias
  const themeVariant = {
    // Substituir cores de fundo
    background: {
      primary: validMode === 'light' 
        ? '#FFFFFF' 
        : adjustColor(primaryPalette[800], primaryPalette[900]),
      secondary: validMode === 'light' 
        ? adjustColor(primaryPalette[50], primaryPalette[100]) 
        : adjustColor(primaryPalette[700], primaryPalette[800]),
      tertiary: validMode === 'light' 
        ? adjustColor(primaryPalette[100], primaryPalette[200]) 
        : adjustColor(primaryPalette[600], primaryPalette[700]),
      accent: validMode === 'light' 
        ? adjustColor(accent[50], accent[100]) 
        : adjustColor(accent[800], accent[900]),
      neutral: validMode === 'light'
        ? adjustColor(neutral[50], neutral[100])
        : adjustColor(neutral[800], neutral[900]),
    },
    
    // Substituir cores de texto
    text: {
      primary: validMode === 'light' 
        ? adjustColor(primaryPalette[800], primaryPalette[900]) 
        : adjustColor(primaryPalette[50], primaryPalette[100]),
      secondary: validMode === 'light' 
        ? adjustColor(primaryPalette[600], primaryPalette[700]) 
        : adjustColor(primaryPalette[200], primaryPalette[300]),
      tertiary: validMode === 'light' 
        ? adjustColor(primaryPalette[400], primaryPalette[500]) 
        : adjustColor(primaryPalette[300], primaryPalette[400]),
      accent: validMode === 'light' 
        ? adjustColor(accent[600], accent[700]) 
        : adjustColor(accent[200], accent[300]),
      onPrimary: validMode === 'light' ? '#FFFFFF' : primaryPalette[900],
      onSecondary: validMode === 'light' ? '#FFFFFF' : secondary[900],
      onAccent: validMode === 'light' ? '#FFFFFF' : accent[900],
      disabled: validMode === 'light' ? neutral[400] : neutral[600],
    },
    
    // Substituir cores de borda
    border: {
      subtle: validMode === 'light' 
        ? adjustColor(primaryPalette[100], primaryPalette[200]) 
        : adjustColor(primaryPalette[600], primaryPalette[700]),
      default: validMode === 'light' 
        ? adjustColor(primaryPalette[200], primaryPalette[300]) 
        : adjustColor(primaryPalette[500], primaryPalette[600]),
      strong: validMode === 'light' 
        ? adjustColor(primaryPalette[300], primaryPalette[400]) 
        : adjustColor(primaryPalette[400], primaryPalette[500]),
      focus: validMode === 'light' 
        ? adjustColor(primaryPalette[400], primaryPalette[500]) 
        : adjustColor(primaryPalette[300], primaryPalette[400]),
      accent: validMode === 'light'
        ? adjustColor(accent[300], accent[400])
        : adjustColor(accent[400], accent[500]),
    },
    
    // Ajustar estados de interação de forma detalhada
    interaction: {
      focus: {
        outline: validMode === 'light' 
          ? adjustColor(primaryPalette[400], primaryPalette[500]) 
          : adjustColor(primaryPalette[500], primaryPalette[600]),
        outlineWidth: baseSemanticTokens.interaction.focus.outlineWidth,
        outlineOffset: baseSemanticTokens.interaction.focus.outlineOffset,
        ring: `0 0 0 2px ${validMode === 'light' 
          ? primaryPalette[200] 
          : primaryPalette[800]}`,
        background: validMode === 'light' 
          ? primaryPalette[50] 
          : primaryPalette[900],
      },
      hover: {
        background: validMode === 'light' 
          ? primaryPalette[50] 
          : primaryPalette[800],
        border: validMode === 'light' 
          ? primaryPalette[300] 
          : primaryPalette[600],
        text: validMode === 'light' 
          ? primaryPalette[700] 
          : primaryPalette[100],
        scale: baseSemanticTokens.interaction.hover.scale,
        elevation: baseSemanticTokens.interaction.hover.elevation,
        transition: `all ${tokens.transitions.duration.fast} ${tokens.transitions.timing.ease}`,
      },
      active: {
        background: validMode === 'light' 
          ? primaryPalette[100] 
          : primaryPalette[900],
        border: validMode === 'light' 
          ? primaryPalette[400] 
          : primaryPalette[700],
        text: validMode === 'light' 
          ? primaryPalette[800] 
          : primaryPalette[50],
        scale: baseSemanticTokens.interaction.active.scale,
        elevation: baseSemanticTokens.interaction.active.elevation,
        transition: `all ${tokens.transitions.duration.fast} ${tokens.transitions.timing.bounce}`,
      },
      disabled: {
        background: validMode === 'light' 
          ? neutral[100] 
          : neutral[800],
        border: validMode === 'light' 
          ? neutral[200] 
          : neutral[700],
        text: validMode === 'light' 
          ? neutral[400] 
          : neutral[500],
        opacity: baseSemanticTokens.interaction.disabled.opacity,
        cursor: baseSemanticTokens.interaction.disabled.cursor,
      },
      selected: {
        background: validMode === 'light' 
          ? primaryPalette[100] 
          : primaryPalette[800],
        border: validMode === 'light' 
          ? primaryPalette[500] 
          : primaryPalette[400],
        text: validMode === 'light' 
          ? primaryPalette[900] 
          : primaryPalette[50],
        boxShadow: validMode === 'light'
          ? `0 0 0 1px ${primaryPalette[300]}`
          : `0 0 0 1px ${primaryPalette[600]}`,
      }
    },
    
    // Ajustar estados de feedback mantendo a consistência semântica
    feedback: {
      success: customFeedbackColors 
        ? {
            background: validMode === 'light' ? primaryPalette[50] : primaryPalette[900],
            border: validMode === 'light' ? primaryPalette[300] : primaryPalette[700],
            text: validMode === 'light' ? primaryPalette[800] : primaryPalette[100],
            icon: validMode === 'light' ? primaryPalette[500] : primaryPalette[400],
            title: validMode === 'light' ? primaryPalette[900] : primaryPalette[50],
          }
        : {
            background: validMode === 'light' ? colorPalettes.forest[50] : colorPalettes.forest[900],
            border: validMode === 'light' ? colorPalettes.forest[300] : colorPalettes.forest[700],
            text: validMode === 'light' ? colorPalettes.forest[800] : colorPalettes.forest[100],
            icon: validMode === 'light' ? colorPalettes.forest[500] : colorPalettes.forest[400],
            title: validMode === 'light' ? colorPalettes.forest[900] : colorPalettes.forest[50],
          },
      error: customFeedbackColors
        ? {
            background: validMode === 'light' ? accent[50] : accent[900],
            border: validMode === 'light' ? accent[300] : accent[700],
            text: validMode === 'light' ? accent[800] : accent[100],
            icon: validMode === 'light' ? accent[500] : accent[400],
            title: validMode === 'light' ? accent[900] : accent[50],
          }
        : {
            ...baseSemanticTokens.feedback.error,
            icon: validMode === 'light' ? accent[500] : accent[400],
          },
      warning: customFeedbackColors
        ? {
            background: validMode === 'light' ? secondary[50] : secondary[900],
            border: validMode === 'light' ? secondary[300] : secondary[700],
            text: validMode === 'light' ? secondary[800] : secondary[100],
            icon: validMode === 'light' ? secondary[500] : secondary[400],
            title: validMode === 'light' ? secondary[900] : secondary[50],
          }
        : {
            ...baseSemanticTokens.feedback.warning,
            icon: validMode === 'light' ? accent[500] : accent[400],
          },
      info: customFeedbackColors
        ? {
            background: validMode === 'light' ? tertiary[50] : tertiary[900],
            border: validMode === 'light' ? tertiary[300] : tertiary[700],
            text: validMode === 'light' ? tertiary[800] : tertiary[100],
            icon: validMode === 'light' ? tertiary[500] : tertiary[400],
            title: validMode === 'light' ? tertiary[900] : tertiary[50],
          }
        : {
            ...baseSemanticTokens.feedback.info,
            icon: validMode === 'light' ? primaryPalette[500] : primaryPalette[400],
          },
    },
    
    // Estados de validação consistentes
    validation: {
      valid: customFeedbackColors
        ? {
            border: validMode === 'light' ? primaryPalette[300] : primaryPalette[600],
            icon: validMode === 'light' ? primaryPalette[500] : primaryPalette[400],
            text: validMode === 'light' ? primaryPalette[700] : primaryPalette[200],
            background: validMode === 'light' ? primaryPalette[50] : primaryPalette[900],
          }
        : _.merge({}, baseSemanticTokens.validation.valid),
      invalid: customFeedbackColors
        ? {
            border: validMode === 'light' ? accent[300] : accent[600],
            icon: validMode === 'light' ? accent[500] : accent[400],
            text: validMode === 'light' ? accent[700] : accent[200],
            background: validMode === 'light' ? accent[50] : accent[900],
          }
        : _.merge({}, baseSemanticTokens.validation.invalid),
      pending: {
        border: validMode === 'light' ? tertiary[300] : tertiary[600],
        icon: validMode === 'light' ? tertiary[500] : tertiary[400],
        text: validMode === 'light' ? tertiary[700] : tertiary[200],
        background: validMode === 'light' ? tertiary[50] : tertiary[900],
      },
    },
    
    // Navegação adaptada à paleta
    navigation: {
      primary: {
        background: validMode === 'light' ? primaryPalette[700] : primaryPalette[900],
        text: '#FFFFFF',
        hover: validMode === 'light' ? primaryPalette[600] : primaryPalette[800],
        active: validMode === 'light' ? primaryPalette[800] : primaryPalette[700],
        border: validMode === 'light' ? primaryPalette[500] : primaryPalette[600],
      },
      secondary: {
        background: 'transparent',
        text: validMode === 'light' ? primaryPalette[700] : primaryPalette[200],
        hover: validMode === 'light' ? primaryPalette[50] : primaryPalette[800],
        active: validMode === 'light' ? primaryPalette[100] : primaryPalette[700],
        border: validMode === 'light' ? primaryPalette[200] : primaryPalette[700],
      },
      tertiary: {
        background: 'transparent',
        text: validMode === 'light' ? primaryPalette[600] : primaryPalette[300],
        hover: validMode === 'light' ? primaryPalette[50] : primaryPalette[800],
        active: validMode === 'light' ? primaryPalette[100] : primaryPalette[700],
        border: 'transparent',
      },
    },
    
    // Overlay e modais
    overlay: {
      backdrop: validMode === 'light' 
        ? 'rgba(0, 0, 0, 0.5)' 
        : 'rgba(0, 0, 0, 0.75)',
      surface: validMode === 'light' 
        ? '#FFFFFF' 
        : primaryPalette[900],
      elevation: baseSemanticTokens.overlay.elevation,
      border: validMode === 'light' 
        ? primaryPalette[200] 
        : primaryPalette[700],
    },
    
    // Acessibilidade
    a11y: {
      focusVisible: {
        outline: validMode === 'light' 
          ? `2px solid ${primaryPalette[500]}` 
          : `2px solid ${primaryPalette[400]}`,
        outlineOffset: '2px'
      },
      contrastText: {
        high: validMode === 'light' ? '#000000' : '#FFFFFF',
        medium: validMode === 'light' 
          ? primaryPalette[900] 
          : primaryPalette[100],
        low: validMode === 'light' 
          ? primaryPalette[700] 
          : primaryPalette[300],
      },
      keyboardFocus: {
        ring: validMode === 'light' 
          ? `0 0 0 4px ${primaryPalette[200]}` 
          : `0 0 0 4px ${primaryPalette[700]}`,
      }
    },
    
    // Cores semânticas completas
    primary: {
      main: validMode === 'light' 
        ? primaryPalette[500] 
        : primaryPalette[300],
      light: validMode === 'light' 
        ? primaryPalette[300] 
        : primaryPalette[100],
      dark: validMode === 'light' 
        ? primaryPalette[700] 
        : primaryPalette[500],
      hover: validMode === 'light' 
        ? primaryPalette[400] 
        : primaryPalette[200],
      active: validMode === 'light' 
        ? primaryPalette[600] 
        : primaryPalette[400],
      disabled: validMode === 'light' 
        ? primaryPalette[200] 
        : primaryPalette[700],
      contrastText: validMode === 'light' 
        ? '#fff' 
        : primaryPalette[900],
      // Adicionar tons específicos para cada nível (50-900)
      50: primaryPalette[50],
      100: primaryPalette[100],
      200: primaryPalette[200],
      300: primaryPalette[300],
      400: primaryPalette[400],
      500: primaryPalette[500],
      600: primaryPalette[600],
      700: primaryPalette[700],
      800: primaryPalette[800],
      900: primaryPalette[900],
    },
    
    secondary: {
      main: validMode === 'light' 
        ? secondary[500] 
        : secondary[300],
      light: validMode === 'light' 
        ? secondary[300] 
        : secondary[100],
      dark: validMode === 'light' 
        ? secondary[700] 
        : secondary[500],
      hover: validMode === 'light' 
        ? secondary[400] 
        : secondary[200],
      active: validMode === 'light' 
        ? secondary[600] 
        : secondary[400],
      disabled: validMode === 'light' 
        ? secondary[200] 
        : secondary[700],
      contrastText: validMode === 'light' 
        ? '#fff' 
        : secondary[900],
      // Adicionar tons específicos para cada nível (50-900)
      50: secondary[50],
      100: secondary[100],
      200: secondary[200],
      300: secondary[300],
      400: secondary[400],
      500: secondary[500],
      600: secondary[600],
      700: secondary[700],
      800: secondary[800],
      900: secondary[900],
    },
    
    // Outras cores semânticas 
    accent: {
      main: validMode === 'light' ? accent[500] : accent[300],
      light: validMode === 'light' ? accent[300] : accent[100],
      dark: validMode === 'light' ? accent[700] : accent[500],
      hover: validMode === 'light' ? accent[400] : accent[200],
      active: validMode === 'light' ? accent[600] : accent[400],
      disabled: validMode === 'light' ? accent[200] : accent[700],
      contrastText: validMode === 'light' ? '#fff' : accent[900],
      // Tons específicos
      50: accent[50],
      100: accent[100],
      200: accent[200],
      300: accent[300],
      400: accent[400],
      500: accent[500],
      600: accent[600],
      700: accent[700],
      800: accent[800],
      900: accent[900],
    },
    
    // Cores padrão de feedback mantidas, mas com possibilidade de customização
    error: customFeedbackColors 
      ? {
          main: accent[500],
          light: accent[300],
          dark: accent[700],
          hover: accent[400],
          active: accent[600],
          disabled: accent[200],
          contrastText: '#fff',
        }
      : _.merge({}, baseSemanticTokens.error),
    
    warning: customFeedbackColors 
      ? {
          main: secondary[500],
          light: secondary[300],
          dark: secondary[700],
          hover: secondary[400],
          active: secondary[600],
          disabled: secondary[200],
          contrastText: '#fff',
        }
      : _.merge({}, baseSemanticTokens.warning),
    
    success: customFeedbackColors 
      ? {
          main: primaryPalette[500],
          light: primaryPalette[300],
          dark: primaryPalette[700],
          hover: primaryPalette[400],
          active: primaryPalette[600],
          disabled: primaryPalette[200],
          contrastText: '#fff',
        }
      : _.merge({}, baseSemanticTokens.success),
    
    info: customFeedbackColors 
      ? {
          main: tertiary[500],
          light: tertiary[300],
          dark: tertiary[700],
          hover: tertiary[400],
          active: tertiary[600],
          disabled: tertiary[200],
          contrastText: '#fff',
        }
      : _.merge({}, baseSemanticTokens.info),
    
    // Tons neutros (grays)
    neutral: {
      50: neutral[50],
      100: neutral[100],
      200: neutral[200],
      300: neutral[300],
      400: neutral[400],
      500: neutral[500],
      600: neutral[600],
      700: neutral[700],
      800: neutral[800],
      900: neutral[900],
      main: neutral[500],
      light: neutral[300],
      dark: neutral[700],
    },
    
    // Metadados do tema para referência
    metadata: {
      id: `${validPalette}-${validMode}`,
      name: `${validPalette.charAt(0).toUpperCase() + validPalette.slice(1)} ${validMode.charAt(0).toUpperCase() + validMode.slice(1)}`,
      palette: validPalette,
      mode: validMode,
      options: {
        contrastLevel,
        saturationLevel,
        accentStrength,
        customFeedbackColors
      }
    }
  };
  
  // Mesclar com tokens semânticos base para preservar propriedades não substituídas
  return _.merge({}, baseSemanticTokens, themeVariant);
};