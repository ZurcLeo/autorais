// theme/styles/baseStyles.js
export const createBaseStyles = (tokens, semanticColors) => ({
    // Estilos fundamentais de interação
    interaction: {
      transition: `all ${tokens.transitions.duration.base} ${tokens.transitions.timing.ease}`,
      focusRing: {
        outline: `2px solid ${semanticColors.border.strong}`,
        outlineOffset: '2px',
      },
    },
    
    // Estilos fundamentais de superfície
    surface: {
      borderRadius: tokens.borderRadius.base,
      elevation: tokens.elevation[1],
    },
    
    // Estilos fundamentais de tipografia
    typography: {
      fontFamily: tokens.typography.fontFamily.body,
      fontSize: tokens.typography.fontSize.base,
      lineHeight: tokens.typography.lineHeight.base,
    }
  });