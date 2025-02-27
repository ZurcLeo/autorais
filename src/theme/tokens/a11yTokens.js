// a11yTokens.js

/**
 * Sistema de Tokens de Acessibilidade ElosCloud
 * --------------------------------------------
 * Baseado em WCAG 2.1 Level AAA e padrões de acessibilidade cognitiva
 */

export const a11yTokens = {
    // Contraste e Visibilidade
    contrast: {
      high: {
        ratioMin: 7.0, // WCAG AAA para texto normal
        ratioLargeMin: 4.5, // WCAG AAA para texto grande
        background: {
          light: '#FFFFFF',
          dark: '#000000'
        },
        text: {
          light: '#000000',
          dark: '#FFFFFF'
        }
      },
      medium: {
        ratioMin: 4.5, // WCAG AA para texto normal
        ratioLargeMin: 3.0, // WCAG AA para texto grande
        background: {
          light: '#F8F9FA',
          dark: '#212529'
        },
        text: {
          light: '#212529',
          dark: '#F8F9FA'
        }
      }
    },
  
    // Foco e Navegação
    focus: {
      keyboards: {
        outlineWidth: '3px',
        outlineStyle: 'solid',
        outlineOffset: '2px',
        outlineColor: {
          light: '#1A73E8',
          dark: '#60A5FA'
        },
        transition: 'outline 0.2s ease-in-out'
      },
      touch: {
        minTargetSize: '44px',
        spacing: '8px'
      },
      indicators: {
        primary: {
          light: 'rgba(26, 115, 232, 0.4)',
          dark: 'rgba(96, 165, 250, 0.4)'
        },
        secondary: {
          light: 'rgba(66, 133, 244, 0.3)',
          dark: 'rgba(147, 197, 253, 0.3)'
        }
      }
    },
  
    // Movimento e Animação
    motion: {
      reduced: {
        animation: 'none',
        transition: {
          duration: '0ms',
          property: 'none'
        }
      },
      safe: {
        maxFrequency: '3hz', // Limite seguro para epilepsia fotossensível
        maxRotation: '20deg',
        maxScale: '1.2',
        preferredDistance: '100px'
      }
    },
  
    // Espaçamento e Layout
    spacing: {
      clickable: {
        minHeight: '44px',
        minWidth: '44px',
        padding: '12px'
      },
      readability: {
        maxWidth: '60ch',
        lineHeight: 1.5,
        paragraphSpacing: '1.5em'
      }
    },
  
    // Texto e Tipografia
    typography: {
      scaling: {
        allowUser: true,
        minSize: '16px',
        scaleRatio: 1.2
      },
      readability: {
        fontWeight: {
          normal: 400,
          medium: 500,
          bold: 700
        },
        lineHeight: {
          normal: 1.5,
          relaxed: 1.75
        },
        letterSpacing: {
          normal: '0.01em',
          relaxed: '0.02em'
        }
      }
    },
  
    // Estados Interativos
    states: {
      hover: {
        scale: 1.02,
        brightness: 1.1,
        transitionDuration: '200ms'
      },
      active: {
        scale: 0.98,
        brightness: 0.95,
        transitionDuration: '100ms'
      },
      disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        events: 'none'
      }
    },
  
    // Feedback e Notificações
    feedback: {
      timing: {
        response: '100ms',
        notification: '5000ms'
      },
      haptic: {
        enabled: true,
        patterns: {
          success: 'medium',
          error: 'heavy',
          warning: 'light'
        }
      },
      sound: {
        enabled: false, // Opt-in apenas
        volume: 0.5,
        types: {
          notification: 'notification.mp3',
          error: 'error.mp3',
          success: 'success.mp3'
        }
      }
    },
  
    // Presets para Condições Específicas
    presets: {
      colorBlindness: {
        protanopia: {
          primary: '#0066FF',
          secondary: '#FFB800',
          error: '#FF0000'
        },
        deuteranopia: {
          primary: '#0044FF',
          secondary: '#FFD500',
          error: '#FF1A1A'
        },
        tritanopia: {
          primary: '#0055FF',
          secondary: '#FFAA00',
          error: '#FF2200'
        }
      },
      cognitive: {
        reducedMotion: true,
        simplifiedLayout: true,
        enhancedFocus: true,
        increasedSpacing: true
      },
      motorImpaired: {
        largerTargets: true,
        reducedMotion: true,
        enhancedFocus: true,
        keyboardFriendly: true
      }
    }
  };
  
// Helpers para validação de contraste
export const validateContrast = (background, foreground, size = 'normal') => {
    // Converter cores hex para RGB
    const hexToRgb = (hex) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] : null;
    };
  
    // Calcular luminância relativa
    const getLuminance = (rgb) => {
      const [r, g, b] = rgb.map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
  
    const bgRgb = hexToRgb(background);
    const fgRgb = hexToRgb(foreground);
    
    if (!bgRgb || !fgRgb) return false;
  
    const lum1 = getLuminance(bgRgb);
    const lum2 = getLuminance(fgRgb);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    const contrastRatio = (brightest + 0.05) / (darkest + 0.05);
  
    const requiredRatio = size === 'large' 
      ? a11yTokens.contrast.high.ratioLargeMin 
      : a11yTokens.contrast.high.ratioMin;
  
    return contrastRatio >= requiredRatio;
  };
  
  // Helper para ajustar tokens baseado em preferências
  export const getA11yAdjustedTokens = (userPreferences) => {
    const adjustedTokens = JSON.parse(JSON.stringify(a11yTokens)); // Deep clone
  
    // Ajuste de contraste
    if (['high', 'medium'].includes(userPreferences.contrastPreference)) {
      adjustedTokens.contrast = {
        ...adjustedTokens.contrast,
        ...a11yTokens.contrast[userPreferences.contrastPreference]
      };
    }
  
    // Ajuste de movimento
    if (userPreferences.motionPreference === 'reduced') {
      adjustedTokens.motion = {
        ...adjustedTokens.motion,
        ...a11yTokens.motion.reduced
      };
    }
  
    // Presets para daltonismo
    if (userPreferences.colorVisionDeficiency) {
      const preset = a11yTokens.presets.colorBlindness[userPreferences.colorVisionDeficiency];
      if (preset) {
        adjustedTokens.colors = {
          ...adjustedTokens.colors,
          ...preset
        };
      }
    }
  
    // Presets cognitivos
    if (userPreferences.cognitiveSupport) {
      Object.assign(adjustedTokens, a11yTokens.presets.cognitive);
    }
  
    // Presets para deficiência motora
    if (userPreferences.motorImpairmentSupport) {
      Object.assign(adjustedTokens, a11yTokens.presets.motorImpaired);
    }
  
    return adjustedTokens;
  };
  
  // Função para converter tokens em variáveis CSS
  export const applyA11yTokens = (tokens) => {
    const root = document.documentElement;
    
    const flattenTokens = (obj, prefix = '') => {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        const varName = `${prefix ? `${prefix}-` : ''}${key}`;
        if (typeof value === 'object' && value !== null) {
          return { ...acc, ...flattenTokens(value, varName) };
        }
        return { ...acc, [varName]: value };
      }, {});
    };
  
    const flattened = flattenTokens(tokens, 'a11y');
    
    Object.entries(flattened).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  };
  
  // Função para inicialização
  export const initA11y = (userPreferences = {}) => {
    const tokens = getA11yAdjustedTokens(userPreferences);
    applyA11yTokens(tokens);
  };