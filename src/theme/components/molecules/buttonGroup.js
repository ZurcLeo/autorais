export const createButtonGroupStyles = (tokens, semanticColors, baseStyles) => ({
    MuiButtonGroup: {
      styleOverrides: {
        root: {
          ...baseStyles.surface,
          // Estilos específicos para o grupo de botões que complementam
          // os estilos individuais dos botões
        }
      }
    }
  });