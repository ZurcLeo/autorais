// theme/components/atoms/button.js
export const createButtonStyles = (tokens, semanticColors, baseStyles) => ({
    MuiButton: {
      styleOverrides: {
        root: {
          ...baseStyles.interaction,
          ...baseStyles.surface,
          position: 'relative',
          padding: `${tokens.spacing.small} ${tokens.spacing.base}`,
          
          // Efeito de highlight na hover
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
            opacity: 0,
            transition: 'opacity 0.2s ease-in-out',
          },
          
          '&:hover::before': {
            opacity: 1,
          },
          
          '&:active': {
            transform: 'scale(0.98)',
          },
          
          '&:focus-visible': baseStyles.interaction.focusRing,
        }
      }
    }
  });