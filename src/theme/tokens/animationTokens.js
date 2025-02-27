// animationTokens.js

/**
 * Sistema de Animação ElosCloud
 * -----------------------------
 * Baseado em estudos de movimento natural e percepção humana
 * Ref: Material Design Motion Guidelines + Princípios de Animação Disney
 */

export const animationTokens = {
    // Durações calibradas para percepção humana
    duration: {
      instant: '0ms',      // Mudanças imperceptíveis
      micro: '100ms',      // Feedback imediato
      base: '200ms',       // Maioria das interações
      complex: '300ms',    // Transições complexas
      deliberate: '500ms', // Mudanças significativas
      dramatic: '800ms'    // Entrada/saída dramática
    },
  
    // Curvas de aceleração natural
    easing: {
      // Movimento natural (padrão)
      natural: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      
      // Entrada rápida, saída suave
      energetic: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
      
      // Saída com ênfase
      emphasis: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
      
      // Movimento suave e relaxado
      gentle: 'cubic-bezier(0.4, 0.14, 0.3, 1)',
  
      // Movimento com bounce (elasticidade)
      bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  
      // Movimento circular
      circular: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
    },
  
    // Padrões de movimento para diferentes contextos
    patterns: {
      // Feedback de interação
      interaction: {
        hover: {
          duration: 'micro',
          easing: 'natural',
          properties: ['transform', 'box-shadow', 'background-color']
        },
        press: {
          duration: 'instant',
          easing: 'emphasis',
          properties: ['transform', 'box-shadow']
        },
        focus: {
          duration: 'base',
          easing: 'gentle',
          properties: ['outline', 'box-shadow']
        }
      },
  
      // Transições de conteúdo
      content: {
        fade: {
          duration: 'base',
          easing: 'natural',
          properties: ['opacity']
        },
        slide: {
          duration: 'complex',
          easing: 'natural',
          properties: ['transform']
        },
        scale: {
          duration: 'complex',
          easing: 'emphasis',
          properties: ['transform']
        }
      },
  
      // Transições de navegação
      navigation: {
        pageTransition: {
          duration: 'dramatic',
          easing: 'circular',
          properties: ['opacity', 'transform']
        },
        modalEnter: {
          duration: 'complex',
          easing: 'energetic',
          properties: ['opacity', 'transform']
        },
        modalExit: {
          duration: 'base',
          easing: 'natural',
          properties: ['opacity', 'transform']
        }
      },
  
      // Animações de estado
      state: {
        loading: {
          duration: 'deliberate',
          easing: 'circular',
          properties: ['transform', 'opacity']
        },
        success: {
          duration: 'complex',
          easing: 'bounce',
          properties: ['transform', 'opacity']
        },
        error: {
          duration: 'base',
          easing: 'emphasis',
          properties: ['transform']
        }
      }
    },
  
    // Presets para redução de movimento (acessibilidade)
    reducedMotion: {
      enabled: {
        duration: {
          instant: '0ms',
          micro: '50ms',
          base: '100ms',
          complex: '150ms',
          deliberate: '200ms',
          dramatic: '300ms'
        },
        easing: {
          // Curvas mais suaves para redução de movimento
          natural: 'linear',
          energetic: 'ease-out',
          emphasis: 'ease-in',
          gentle: 'linear',
          bounce: 'ease-out',
          circular: 'ease-in-out'
        }
      }
    }
  };
  
  // Helpers para construção de animações
  export const createAnimation = ({
    duration = 'base',
    easing = 'natural',
    properties = [],
    pattern = null,
    reducedMotion = false
  } = {}) => {
    const tokens = reducedMotion ? animationTokens.reducedMotion.enabled : animationTokens;
    const durationValue = tokens.duration[duration];
    const easingValue = tokens.easing[easing];
  
    if (pattern) {
      const patternConfig = tokens.patterns[pattern];
      return {
        transition: patternConfig.properties
          .map(prop => `${prop} ${durationValue} ${easingValue}`)
          .join(', ')
      };
    }
  
    return {
      transition: properties
        .map(prop => `${prop} ${durationValue} ${easingValue}`)
        .join(', ')
    };
  };