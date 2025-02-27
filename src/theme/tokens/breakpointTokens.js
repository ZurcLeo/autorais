// breakpointTokens.js

/**
 * Sistema de Breakpoints ElosCloud
 * -------------------------------
 * Baseado em estatísticas de dispositivos e princípios de design responsivo
 * Utiliza abordagem mobile-first com breakpoints em em para melhor acessibilidade
 */

export const breakpointTokens = {
    // Breakpoints Base
    // Usando 'em' para respeitar as preferências de fonte do usuário
    values: {
      xs: '20em',     // 320px  - Smartphones pequenos
      sm: '36em',     // 576px  - Smartphones grandes
      md: '48em',     // 768px  - Tablets
      lg: '64em',     // 1024px - Laptops/Desktops
      xl: '80em',     // 1280px - Desktops grandes
      xxl: '96em',    // 1536px - Telas ultra-wide
    },
  
    // Contextos de Uso
    contexts: {
      mobile: {
        portrait: 'xs',
        landscape: 'sm'
      },
      tablet: {
        portrait: 'md',
        landscape: 'lg'
      },
      desktop: {
        standard: 'lg',
        wide: 'xl',
        ultraWide: 'xxl'
      }
    },
  
    // Layouts Responsivos
    layouts: {
      singleColumn: {
        maxWidth: 'sm',
        padding: '1rem'
      },
      twoColumn: {
        minWidth: 'md',
        gap: '2rem',
        sidebar: '30%'
      },
      threeColumn: {
        minWidth: 'lg',
        gap: '2rem',
        sidebar: '25%'
      },
      grid: {
        columns: {
          xs: 1,
          sm: 2,
          md: 3,
          lg: 4,
          xl: 6
        },
        gap: {
          xs: '1rem',
          sm: '1.5rem',
          md: '2rem'
        }
      }
    },
  
    // Configurações de Container
    container: {
      padding: {
        xs: '1rem',
        sm: '1.5rem',
        md: '2rem',
        lg: '2.5rem',
        xl: '3rem'
      },
      maxWidth: {
        sm: '540px',
        md: '720px',
        lg: '960px',
        xl: '1140px',
        xxl: '1320px'
      }
    },
  
    // Tipografia Responsiva
    typography: {
      scaling: {
        base: '16px',
        ratio: 1.2,
        breakpoints: {
          xs: 0.875,    // 14px
          sm: 1,        // 16px
          md: 1,        // 16px
          lg: 1.125,    // 18px
          xl: 1.125     // 18px
        }
      },
      lineHeight: {
        xs: 1.4,
        sm: 1.5,
        md: 1.6,
        lg: 1.7
      }
    },
  
    // Espaçamento Responsivo
    spacing: {
      scale: {
        xs: 0.75,  // Fator de escala para telas pequenas
        sm: 1,     // Escala base
        md: 1.25,  // Aumento moderado
        lg: 1.5,   // Aumento significativo
        xl: 1.75   // Máximo aumento
      },
      units: {
        base: '1rem',
        vertical: {
          xs: '1rem',
          sm: '1.5rem',
          md: '2rem',
          lg: '2.5rem',
          xl: '3rem'
        },
        horizontal: {
          xs: '1rem',
          sm: '1.5rem',
          md: '2rem',
          lg: '2.5rem',
          xl: '3rem'
        }
      }
    },
  
    // Media Queries
    mediaQueries: {
      up: (breakpoint) => `@media (min-width: ${breakpointTokens.values[breakpoint]})`,
      down: (breakpoint) => `@media (max-width: ${breakpointTokens.values[breakpoint]})`,
      between: (start, end) => 
        `@media (min-width: ${breakpointTokens.values[start]}) and (max-width: ${breakpointTokens.values[end]})`,
      only: (breakpoint) => {
        const nextBreakpoints = {
          xs: 'sm',
          sm: 'md',
          md: 'lg',
          lg: 'xl',
          xl: 'xxl'
        };
        return nextBreakpoints[breakpoint]
          ? `@media (min-width: ${breakpointTokens.values[breakpoint]}) and (max-width: ${breakpointTokens.values[nextBreakpoints[breakpoint]]})`
          : breakpointTokens.mediaQueries.up(breakpoint);
      }
    },
  
    // Orientação e Aspectos
    orientation: {
      portrait: '@media (orientation: portrait)',
      landscape: '@media (orientation: landscape)'
    },
  
    // Recursos de Dispositivo
    deviceFeatures: {
      hover: '@media (hover: hover)',
      touch: '@media (hover: none) and (pointer: coarse)',
      stylus: '@media (hover: none) and (pointer: fine)',
      prefersReducedMotion: '@media (prefers-reduced-motion: reduce)',
      highContrast: '@media (prefers-contrast: high)',
      darkMode: '@media (prefers-color-scheme: dark)',
      lightMode: '@media (prefers-color-scheme: light)'
    },
  
    // Helpers de Utilidade
    utils: {
      pxToEm: (px, base = 16) => `${px / base}em`,
      emToPx: (em, base = 16) => em * base,
      getBreakpointValue: (breakpoint) => parseInt(breakpointTokens.values[breakpoint]),
      isBreakpointUp: (breakpoint, windowWidth) => 
        windowWidth >= parseInt(breakpointTokens.values[breakpoint]),
      getClosestBreakpoint: (windowWidth) => 
        Object.entries(breakpointTokens.values)
          .reduce((closest, [breakpoint, value]) => {
            const breakpointWidth = parseInt(value);
            if (windowWidth >= breakpointWidth && (!closest.width || breakpointWidth > closest.width)) {
              return { breakpoint, width: breakpointWidth };
            }
            return closest;
          }, { breakpoint: 'xs', width: 0 }).breakpoint
    }
  };
  
  // Hook para consumo dos breakpoints
  export const useBreakpoints = () => {
    const [breakpoint, setBreakpoint] = useState(() => 
      breakpointTokens.utils.getClosestBreakpoint(window.innerWidth)
    );
  
    useEffect(() => {
      const handleResize = () => {
        setBreakpoint(breakpointTokens.utils.getClosestBreakpoint(window.innerWidth));
      };
  
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    return {
      breakpoint,
      isUp: (bp) => breakpointTokens.utils.isBreakpointUp(bp, window.innerWidth),
      values: breakpointTokens.values,
      mediaQueries: breakpointTokens.mediaQueries
    };
  };
  
  // Exemplo de uso com Styled Components
  export const createBreakpointStyles = (styles) => {
    return Object.entries(styles).reduce((acc, [breakpoint, style]) => {
      if (breakpoint === 'base') {
        return { ...acc, ...style };
      }
      return {
        ...acc,
        [breakpointTokens.mediaQueries.up(breakpoint)]: style
      };
    }, {});
  };
  
  // Exemplo de uso com CSS-in-JS
  export const responsive = (property, values) => {
    return Object.entries(values).reduce((acc, [breakpoint, value]) => ({
      ...acc,
      [breakpoint === 'base' ? property : `${breakpointTokens.mediaQueries.up(breakpoint)} {
        ${property}
      }`]: value
    }), {});
  };