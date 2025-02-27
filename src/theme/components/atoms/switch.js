// theme/components/atoms/switch.js
export const createSwitchStyles = (tokens, semanticColors, baseStyles) => ({
    MuiSwitch: {
      styleOverrides: {
        root: {
          ...baseStyles.interaction,
          
          '& .MuiSwitch-thumb': {
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)',
              opacity: 0,
              transition: 'opacity 0.2s ease-in-out',
            }
          },
          
          '&:hover .MuiSwitch-thumb': {
            transform: 'scale(1.1)',
            '&::before': { opacity: 1 }
          },
          
          '&:active .MuiSwitch-thumb': {
            transform: 'scale(0.9)',
          }
        }
      }
    }
  });