// themeTokens.js
const spacing = {
    nano: '0.125rem', // 2px
    micro: '0.25rem', // 4px
    tiny: '0.5rem', // 8px
    small: '0.75rem', // 12px
    base: '1rem', // 16px
    medium: '1.5rem', // 24px
    large: '2rem', // 32px
    xl: '3rem', // 48px
    xxl: '4rem', // 64px
};

const typography = {
    fontFamily: {
        heading: '"Satoshi", "Inter", sans-serif',
        body: '"Inter", system-ui, sans-serif',
        mono: '"Fira Code", monospace'
    },
    fontWeight: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700
    },
    fontSize: {
        xs: '0.75rem', // 12px
        sm: '0.875rem', // 14px
        base: '1rem', // 16px
        lg: '1.125rem', // 18px
        xl: '1.25rem', // 20px
        '2xl': '1.5rem', // 24px
        '3xl': '2rem', // 32px
        '4xl': '2.5rem', // 40px
    },
    lineHeight: {
        tight: 1.2,
        base: 1.5,
        relaxed: 1.75
    }
};

const borderRadius = {
    none: '0',
    sm: '0.25rem', // 4px
    base: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    full: '9999px'
};

const elevation = {
    0: 'none',
    1: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    2: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    3: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    4: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    5: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
};

const transitions = {
    duration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
        slower: '500ms'
    },
    timing: {
        ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }
};

// Paletas cromáticas inspiradas na natureza
export const colorPalettes = {
    ocean: {
        50: '#F0F7FF',
        100: '#E0F0FF',
        200: '#BAE0FF',
        300: '#7CC4FA',
        400: '#36A6F2',
        500: '#0A84DE',
        600: '#0069C2',
        700: '#005199',
        800: '#003B70',
        900: '#002647'
    },
    sunset: {
        50: '#FFF7ED',
        100: '#FFEDD5',
        200: '#FED7AA',
        300: '#FDBA74',
        400: '#FB923C',
        500: '#F97316',
        600: '#EA580C',
        700: '#C2410C',
        800: '#9A3412',
        900: '#7C2D12'
    },
    forest: {
        50: '#F0FDF4',
        100: '#DCFCE7',
        200: '#BBF7D0',
        300: '#86EFAC',
        400: '#4ADE80',
        500: '#22C55E',
        600: '#16A34A',
        700: '#15803D',
        800: '#166534',
        900: '#14532D'
    },
    mountain: {
        50: '#F4F8F8',
        100: '#DAE5E5',
        200: '#AEC3C3',
        300: '#7FA1A1',
        400: '#5E8888',
        500: '#466D6D',
        600: '#355656',
        700: '#2A4444',
        800: '#1F3232',
        900: '#142121'
    },
    glacier: {
        50: '#F0FBFF',
        100: '#D8F6FF',
        200: '#AEEBFF',
        300: '#7ED8FF',
        400: '#42BDF6',
        500: '#1E9EEB',
        600: '#007ECC',
        700: '#0063A3',
        800: '#004C7A',
        900: '#003557'
    },
    volcano: {
        50: '#FFF5F5',
        100: '#FEE4E2',
        200: '#FEB2A8',
        300: '#FC8181',
        400: '#F56565',
        500: '#E53E3E',
        600: '#C53030',
        700: '#9B2C2C',
        800: '#742A2A',
        900: '#4A2020'
    },
    earth: {
        50: '#F5F2EB',
        100: '#EDE5D3',
        200: '#D6C4A1',
        300: '#BFA878',
        400: '#A48850',
        500: '#8B6B38',
        600: '#6F5128',
        700: '#563C1B',
        800: '#3D2B12',
        900: '#261B0B'
    }
};

export const semanticTokens = {
    light: {
        background: {
            primary: '#FFFFFF',
            secondary: colorPalettes.ocean[50],
            tertiary: colorPalettes.ocean[100],
            accent: colorPalettes.sunset[50]
        },
        text: {
            primary: colorPalettes.ocean[900],
            secondary: colorPalettes.ocean[700],
            tertiary: colorPalettes.ocean[500],
            accent: colorPalettes.sunset[700]
        },
        border: {
            subtle: colorPalettes.ocean[200],
            default: colorPalettes.ocean[300],
            strong: colorPalettes.ocean[400]
        },
        // Estados de Interação
        interaction: {
            focus: {
                outline: colorPalettes.ocean[400],
                outlineWidth: '2px',
                outlineOffset: '2px',
                ring: `0 0 0 2px ${colorPalettes.ocean[200]}`,
                background: colorPalettes.ocean[50]
            },
            hover: {
                background: colorPalettes.ocean[50],
                border: colorPalettes.ocean[300],
                text: colorPalettes.ocean[700],
                scale: '1.02',
                elevation: 2
            },
            active: {
                background: colorPalettes.ocean[100],
                border: colorPalettes.ocean[400],
                text: colorPalettes.ocean[800],
                scale: '0.98',
                elevation: 1
            },
            disabled: {
                background: colorPalettes.mountain[100],
                border: colorPalettes.mountain[200],
                text: colorPalettes.mountain[400],
                opacity: 0.6,
                cursor: 'not-allowed'
            },
            selected: {
                background: colorPalettes.ocean[100],
                border: colorPalettes.ocean[500],
                text: colorPalettes.ocean[900]
            }
        },
        // Estados de Feedback
        feedback: {
            success: {
                background: colorPalettes.forest[50],
                border: colorPalettes.forest[300],
                text: colorPalettes.forest[800],
                icon: colorPalettes.forest[500],
                title: colorPalettes.forest[900]
            },
            error: {
                background: colorPalettes.sunset[50],
                border: colorPalettes.sunset[300],
                text: colorPalettes.sunset[800],
                icon: colorPalettes.sunset[500],
                title: colorPalettes.sunset[900]
            },
            warning: {
                background: '#FFF7ED',
                border: '#FDBA74',
                text: '#9A3412',
                icon: '#F97316',
                title: '#7C2D12'
            },
            info: {
                background: colorPalettes.ocean[50],
                border: colorPalettes.ocean[300],
                text: colorPalettes.ocean[800],
                icon: colorPalettes.ocean[500],
                title: colorPalettes.ocean[900]
            }
        },
        // Estados de Validação
        validation: {
            valid: {
                border: colorPalettes.forest[300],
                icon: colorPalettes.forest[500],
                text: colorPalettes.forest[700],
                background: colorPalettes.forest[50]
            },
            invalid: {
                border: colorPalettes.sunset[300],
                icon: colorPalettes.sunset[500],
                text: colorPalettes.sunset[700],
                background: colorPalettes.sunset[50]
            },
            pending: {
                border: colorPalettes.ocean[300],
                icon: colorPalettes.ocean[500],
                text: colorPalettes.ocean[700],
                background: colorPalettes.ocean[50]
            }
        },
        navigation: {
            primary: {
                background: colorPalettes.ocean[700],
                text: '#FFFFFF',
                hover: colorPalettes.ocean[600],
                active: colorPalettes.ocean[800]
            },
            secondary: {
                background: 'transparent',
                text: colorPalettes.ocean[700],
                hover: colorPalettes.ocean[50],
                active: colorPalettes.ocean[100]
            },
            tertiary: {
                background: 'transparent',
                text: colorPalettes.ocean[600],
                hover: colorPalettes.ocean[50],
                active: colorPalettes.ocean[100]
            }
        },
        // Sobreposições e Modais
        overlay: {
            backdrop: 'rgba(0, 0, 0, 0.5)',
            surface: '#FFFFFF',
            elevation: 4,
            border: colorPalettes.ocean[200]
        },

        // Acessibilidade
        a11y: {
            focusVisible: {
                outline: `2px solid ${colorPalettes.ocean[500]}`,
                outlineOffset: '2px'
            },
            contrastText: {
                high: '#000000',
                medium: colorPalettes.ocean[900],
                low: colorPalettes.ocean[700]
            },
            keyboardFocus: {
                ring: `0 0 0 4px ${colorPalettes.ocean[200]}`
            }
        },
        // *** INTEGRAÇÃO DAS CORES SEMÂNTICAS PRIMÁRIAS, SECUNDÁRIAS, ETC. ***
        primary: { // Definição da cor semântica 'primary' para o tema LIGHT
            main: colorPalettes.ocean[500],
            light: colorPalettes.ocean[300],
            dark: colorPalettes.ocean[700],
            hover: colorPalettes.ocean[400],
            active: colorPalettes.ocean[600],
            disabled: colorPalettes.ocean[200],
            contrastText: '#fff', // Cor do texto contrastante (para botões primários em fundo escuro, por exemplo)
        },
        secondary: { // Definição da cor semântica 'secondary' para o tema LIGHT
            main: colorPalettes.forest[500],
            light: colorPalettes.forest[300],
            dark: colorPalettes.forest[700],
            hover: colorPalettes.forest[400],
            active: colorPalettes.forest[600],
            disabled: colorPalettes.forest[200],
            contrastText: '#fff'
        },
        error: { // Definição da cor semântica 'error' para o tema LIGHT
            main: colorPalettes.volcano[500], // Use cores base do Material UI (ou defina sua paleta 'error' se tiver)
            light: colorPalettes.volcano[300],
            dark: colorPalettes.volcano[700],
            hover: colorPalettes.volcano[400],
            active: colorPalettes.volcano[600],
            disabled: colorPalettes.volcano[200],
            contrastText: '#fff'
        },
        warning: { // Definição da cor semântica 'warning' para o tema LIGHT
            main: colorPalettes.sunset[500], // Use cores base do Material UI (ou defina sua paleta 'warning')
            light: colorPalettes.sunset[300],
            dark: colorPalettes.sunset[700],
            hover: colorPalettes.sunset[400],
            active: colorPalettes.sunset[600],
            disabled: colorPalettes.sunset[200],
            contrastText: '#fff'
        },
        success: { // Definição da cor semântica 'success' para o tema LIGHT
            main: colorPalettes.forest[500], // Use cores base do Material UI (ou defina sua paleta 'success')
            light: colorPalettes.forest[300],
            dark: colorPalettes.forest[700],
            hover: colorPalettes.forest[400],
            active: colorPalettes.forest[600],
            disabled: colorPalettes.forest[200],
            contrastText: '#fff'
        },
        info: { // Definição da cor semântica 'info' para o tema LIGHT
            main: colorPalettes.glacier[500], // Use cores base do Material UI (ou defina sua paleta 'info')
            light: colorPalettes.glacier[300],
            dark: colorPalettes.glacier[700],
            hover: colorPalettes.glacier[400],
            active: colorPalettes.glacier[600],
            disabled: colorPalettes.glacier[200],
            contrastText: '#fff'
        },
        mountain: { // Definição da cor semântica 'mountain' (tons de cinza) para o tema LIGHT - Use cores base 'mountain' do Material UI
            50: colorPalettes.mountain[50],
            100: colorPalettes.mountain[100],
            200: colorPalettes.mountain[200],
            300: colorPalettes.mountain[300],
            400: colorPalettes.mountain[400],
            500: colorPalettes.mountain[500],
            600: colorPalettes.mountain[600],
            700: colorPalettes.mountain[700],
            800: colorPalettes.mountain[800],
            900: colorPalettes.mountain[900]
        }
    },
    dark: {
        background: {
            primary: colorPalettes.ocean[900],
            secondary: colorPalettes.ocean[800],
            tertiary: colorPalettes.ocean[700],
            accent: colorPalettes.sunset[900]
        },
        text: {
            primary: colorPalettes.ocean[50],
            secondary: colorPalettes.ocean[200],
            tertiary: colorPalettes.ocean[300],
            accent: colorPalettes.sunset[300]
        },
        border: {
            subtle: colorPalettes.ocean[700],
            default: colorPalettes.ocean[600],
            strong: colorPalettes.ocean[500]
        },
        // Estados de Interação
        interaction: {
            focus: {
                outline: colorPalettes.ocean[600], // Mais escuro para melhor contraste
                outlineWidth: '2px',
                outlineOffset: '2px',
                ring: `0 0 0 2px ${colorPalettes.ocean[800]}`,
                background: colorPalettes.ocean[900]
            },
            hover: {
                background: colorPalettes.ocean[800],
                border: colorPalettes.ocean[600],
                text: colorPalettes.ocean[100], // Texto mais claro
                scale: '1.02',
                elevation: 2
            },
            active: {
                background: colorPalettes.ocean[900],
                border: colorPalettes.ocean[700],
                text: colorPalettes.ocean[50], // Texto ainda mais claro
                scale: '0.98',
                elevation: 1
            },
            disabled: {
                background: colorPalettes.mountain[800],
                border: colorPalettes.mountain[700],
                text: colorPalettes.mountain[500],
                opacity: 0.5,
                cursor: 'not-allowed'
            },
            selected: {
                background: colorPalettes.ocean[800],
                border: colorPalettes.ocean[400],
                text: colorPalettes.ocean[50]
            }
        },

        // Estados de Feedback
        feedback: {
            success: {
                background: colorPalettes.forest[900],
                border: colorPalettes.forest[700],
                text: colorPalettes.forest[100],
                icon: colorPalettes.forest[400],
                title: colorPalettes.forest[50]
            },
            error: {
                background: colorPalettes.sunset[900],
                border: colorPalettes.sunset[700],
                text: colorPalettes.sunset[100],
                icon: colorPalettes.sunset[400],
                title: colorPalettes.sunset[50]
            },
            warning: {
                background: '#4A2706', // Dark sunset
                border: '#92400E',
                text: '#FED7AA',
                icon: '#FB923C',
                title: '#FFEDD5'
            },
            info: {
                background: colorPalettes.ocean[900],
                border: colorPalettes.ocean[700],
                text: colorPalettes.ocean[100],
                icon: colorPalettes.ocean[400],
                title: colorPalettes.ocean[50]
            }
        },

        // Estados de Validação
        validation: {
            valid: {
                border: colorPalettes.forest[600],
                icon: colorPalettes.forest[400],
                text: colorPalettes.forest[100],
                background: colorPalettes.forest[900]
            },
            invalid: {
                border: colorPalettes.sunset[600],
                icon: colorPalettes.sunset[400],
                text: colorPalettes.sunset[100],
                background: colorPalettes.sunset[900]
            },
            pending: {
                border: colorPalettes.ocean[600],
                icon: colorPalettes.ocean[400],
                text: colorPalettes.ocean[100],
                background: colorPalettes.ocean[900]
            }
        },

        // Navegação
        navigation: {
            primary: {
                background: colorPalettes.ocean[900],
                text: '#FFFFFF',
                hover: colorPalettes.ocean[800],
                active: colorPalettes.ocean[700]
            },
            secondary: {
                background: 'transparent',
                text: colorPalettes.ocean[100],
                hover: colorPalettes.ocean[800],
                active: colorPalettes.ocean[700]
            },
            tertiary: {
                background: 'transparent',
                text: colorPalettes.ocean[200],
                hover: colorPalettes.ocean[800],
                active: colorPalettes.ocean[700]
            }
        },

        // Sobreposições e Modais
        overlay: {
            backdrop: 'rgba(0, 0, 0, 0.75)', // Mais escuro para melhor contraste
            surface: colorPalettes.ocean[900],
            elevation: 4,
            border: colorPalettes.ocean[700]
        },

        // Acessibilidade
        a11y: {
            focusVisible: {
                outline: `2px solid ${colorPalettes.ocean[400]}`,
                outlineOffset: '2px'
            },
            contrastText: {
                high: '#FFFFFF', // Invertido do tema light
                medium: colorPalettes.ocean[100],
                low: colorPalettes.ocean[300]
            },
            keyboardFocus: {
                ring: `0 0 0 4px ${colorPalettes.ocean[700]}`
            }
        },

        // *** DEFINIÇÕES DE CORES SEMÂNTICAS PARA O TEMA DARK (Pode ajustar as cores
        // para o tema escuro) ***
        primary: {
            main: colorPalettes.ocean[300], // Tom mais claro para primary no tema escuro
            light: colorPalettes.ocean[100],
            dark: colorPalettes.ocean[500],
            hover: colorPalettes.ocean[200],
            active: colorPalettes.ocean[400],
            disabled: colorPalettes.ocean[700],
            contrastText: colorPalettes.ocean[900], // Texto contrastante mais escuro no tema escuro
        },
        secondary: {
            main: colorPalettes.forest[300], // Ajuste as cores secundárias para o tema escuro
            light: colorPalettes.forest[100],
            dark: colorPalettes.forest[500],
            hover: colorPalettes.forest[200],
            active: colorPalettes.forest[400],
            disabled: colorPalettes.forest[700],
            contrastText: colorPalettes.ocean[900]
        },
        error: { // Ajuste as cores de erro para o tema escuro, se necessário
            main: colorPalettes.volcano[300],
            light: colorPalettes.volcano[100],
            dark: colorPalettes.volcano[500],
            hover: colorPalettes.volcano[200],
            active: colorPalettes.volcano[400],
            disabled: colorPalettes.volcano[700],
            contrastText: colorPalettes.ocean[900]
        },
        warning: { // Ajuste as cores de warning para o tema escuro, se necessário
            main: colorPalettes.sunset[300],
            light: colorPalettes.sunset[100],
            dark: colorPalettes.sunset[500],
            hover: colorPalettes.sunset[200],
            active: colorPalettes.sunset[400],
            disabled: colorPalettes.sunset[700],
            contrastText: colorPalettes.ocean[900]
        },
        success: { // Ajuste as cores de success para o tema escuro, se necessário
            main: colorPalettes.forest[300],
            light: colorPalettes.forest[100],
            dark: colorPalettes.forest[500],
            hover: colorPalettes.forest[200],
            active: colorPalettes.forest[400],
            disabled: colorPalettes.forest[700],
            contrastText: colorPalettes.ocean[900]
        },
        info: { // Ajuste as cores de info para o tema escuro, se necessário
            main: colorPalettes.glacier[300],
            light: colorPalettes.glacier[100],
            dark: colorPalettes.glacier[500],
            hover: colorPalettes.glacier[200],
            active: colorPalettes.glacier[400],
            disabled: colorPalettes.glacier[700],
            contrastText: colorPalettes.ocean[900]
        },
        mountain: { // Cores cinzas para o tema escuro - use cores base 'mountain' do Material UI, ajustando os tons se necessário
            50: colorPalettes.mountain[900],
            100: colorPalettes.mountain[800],
            200: colorPalettes.mountain[700],
            300: colorPalettes.mountain[600],
            400: colorPalettes.mountain[500],
            500: colorPalettes.mountain[400],
            600: colorPalettes.mountain[300],
            700: colorPalettes.mountain[200],
            800: colorPalettes.mountain[100],
            900: colorPalettes.mountain[50]
        }
    }
};

export const tokens = {
    spacing,
    typography,
    borderRadius,
    elevation,
    transitions,
    colorPalettes,
    semanticTokens
};