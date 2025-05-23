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
        heading: '"Lato", sans-serif',
        body: '"Lato", system-ui, sans-serif',
        mono: '"Lato", monospace'
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
            secondary: 'palette.50',
            tertiary: 'palette.100',
            accent: 'palette.50'
        },
        text: {
            primary: 'palette.900',
            secondary: 'palette.700',
            tertiary: 'palette.500',
            accent: 'palette.700',
            onPrimary: '#FFFFFF',
            onSecondary: '#FFFFFF',
            onAccent: '#FFFFFF',
            disabled: 'palette.400'
        },
        border: {
            subtle: 'palette.100',
            default: 'palette.200',
            strong: 'palette.300',
            focus: 'palette.400'
        },
        interaction: {
            focus: {
                outline: 'palette.400',
                outlineWidth: '2px',
                outlineOffset: '2px',
                ring: 'palette.200',
                background: 'palette.50'
            },
            hover: {
                background: 'palette.50',
                border: 'palette.300',
                text: 'palette.700',
                scale: '1.02',
                elevation: 2
            },
            active: {
                background: 'palette.100',
                border: 'palette.400',
                text: 'palette.800',
                scale: '0.98',
                elevation: 1
            },
            disabled: {
                background: 'neutral.100',
                border: 'neutral.200',
                text: 'neutral.400',
                opacity: 0.6,
                cursor: 'not-allowed'
            },
            selected: {
                background: 'palette.100',
                border: 'palette.500',
                text: 'palette.900'
            }
        },
        feedback: {
            success: {
                background: 'success.50',
                border: 'success.300',
                text: 'success.800',
                icon: 'success.500',
                title: 'success.900'
            },
            error: {
                background: 'error.50',
                border: 'error.300',
                text: 'error.800',
                icon: 'error.500',
                title: 'error.900'
            },
            warning: {
                background: 'warning.50',
                border: 'warning.300',
                text: 'warning.800',
                icon: 'warning.500',
                title: 'warning.900'
            },
            info: {
                background: 'info.50',
                border: 'info.300',
                text: 'info.800',
                icon: 'info.500',
                title: 'info.900'
            }
        },
        validation: {
            valid: {
                border: 'success.300',
                icon: 'success.500',
                text: 'success.700',
                background: 'success.50'
            },
            invalid: {
                border: 'error.300',
                icon: 'error.500',
                text: 'error.700',
                background: 'error.50'
            },
            pending: {
                border: 'info.300',
                icon: 'info.500',
                text: 'info.700',
                background: 'info.50'
            }
        },
        navigation: {
            primary: {
                background: 'palette.700',
                text: '#FFFFFF',
                hover: 'palette.600',
                active: 'palette.800',
                border: 'palette.500'
            },
            secondary: {
                background: 'transparent',
                text: 'palette.700',
                hover: 'palette.50',
                active: 'palette.100',
                border: 'palette.200'
            },
            tertiary: {
                background: 'transparent',
                text: 'palette.600',
                hover: 'palette.50',
                active: 'palette.100',
                border: 'transparent'
            }
        },
        overlay: {
            backdrop: 'rgba(0, 0, 0, 0.5)',
            surface: '#FFFFFF',
            elevation: 4,
            border: 'palette.200'
        },
        a11y: {
            focusVisible: {
                outline: 'palette.500',
                outlineOffset: '2px'
            },
            contrastText: {
                high: '#000000',
                medium: 'palette.900',
                low: 'palette.700'
            },
            keyboardFocus: {
                ring: 'palette.200'
            }
        },
        // Definições semânticas de cores primárias
        primary: {
            main: 'palette.500',
            light: 'palette.300',
            dark: 'palette.700',
            hover: 'palette.400',
            active: 'palette.600',
            disabled: 'palette.200',
            contrastText: '#FFFFFF'
        },
        secondary: {
            main: 'secondary.500',
            light: 'secondary.300',
            dark: 'secondary.700',
            hover: 'secondary.400',
            active: 'secondary.600',
            disabled: 'secondary.200',
            contrastText: '#FFFFFF'
        },
        error: {
            main: 'error.500',
            light: 'error.300',
            dark: 'error.700',
            hover: 'error.400',
            active: 'error.600',
            disabled: 'error.200',
            contrastText: '#FFFFFF'
        },
        warning: {
            main: 'warning.500',
            light: 'warning.300',
            dark: 'warning.700',
            hover: 'warning.400',
            active: 'warning.600',
            disabled: 'warning.200',
            contrastText: '#FFFFFF'
        },
        success: {
            main: 'success.500',
            light: 'success.300',
            dark: 'success.700',
            hover: 'success.400',
            active: 'success.600',
            disabled: 'success.200',
            contrastText: '#FFFFFF'
        },
        info: {
            main: 'info.500',
            light: 'info.300',
            dark: 'info.700',
            hover: 'info.400',
            active: 'info.600',
            disabled: 'info.200',
            contrastText: '#FFFFFF'
        },
        neutral: {
            50: 'neutral.50',
            100: 'neutral.100',
            200: 'neutral.200',
            300: 'neutral.300',
            400: 'neutral.400',
            500: 'neutral.500',
            600: 'neutral.600',
            700: 'neutral.700',
            800: 'neutral.800',
            900: 'neutral.900'
        }
    },
    dark: {
        background: {
            primary: 'palette.900',
            secondary: 'palette.800',
            tertiary: 'palette.700',
            accent: 'accent.900'
        },
        text: {
            primary: 'palette.50',
            secondary: 'palette.200',
            tertiary: 'palette.300',
            accent: 'accent.300',
            onPrimary: 'palette.900',
            onSecondary: 'secondary.900',
            onAccent: 'accent.900',
            disabled: 'neutral.500'
        },
        border: {
            subtle: 'palette.700',
            default: 'palette.600',
            strong: 'palette.500',
            focus: 'palette.400'
        },
        interaction: {
            focus: {
                outline: 'palette.400',
                outlineWidth: '2px',
                outlineOffset: '2px',
                ring: 'palette.700',
                background: 'palette.900'
            },
            hover: {
                background: 'palette.800',
                border: 'palette.600',
                text: 'palette.100',
                scale: '1.02',
                elevation: 2
            },
            active: {
                background: 'palette.900',
                border: 'palette.700',
                text: 'palette.50',
                scale: '0.98',
                elevation: 1
            },
            disabled: {
                background: 'neutral.800',
                border: 'neutral.700',
                text: 'neutral.500',
                opacity: 0.5,
                cursor: 'not-allowed'
            },
            selected: {
                background: 'palette.800',
                border: 'palette.400',
                text: 'palette.50'
            }
        },
        feedback: {
            success: {
                background: 'success.900',
                border: 'success.700',
                text: 'success.100',
                icon: 'success.400',
                title: 'success.50'
            },
            error: {
                background: 'error.900',
                border: 'error.700',
                text: 'error.100',
                icon: 'error.400',
                title: 'error.50'
            },
            warning: {
                background: 'warning.900',
                border: 'warning.700',
                text: 'warning.100',
                icon: 'warning.400',
                title: 'warning.50'
            },
            info: {
                background: 'info.900',
                border: 'info.700',
                text: 'info.100',
                icon: 'info.400',
                title: 'info.50'
            }
        },
        validation: {
            valid: {
                border: 'success.600',
                icon: 'success.400',
                text: 'success.100',
                background: 'success.900'
            },
            invalid: {
                border: 'error.600',
                icon: 'error.400',
                text: 'error.100',
                background: 'error.900'
            },
            pending: {
                border: 'info.600',
                icon: 'info.400',
                text: 'info.100',
                background: 'info.900'
            }
        },
        navigation: {
            primary: {
                background: 'palette.900',
                text: '#FFFFFF',
                hover: 'palette.800',
                active: 'palette.700',
                border: 'palette.600'
            },
            secondary: {
                background: 'transparent',
                text: 'palette.100',
                hover: 'palette.800',
                active: 'palette.700',
                border: 'palette.700'
            },
            tertiary: {
                background: 'transparent',
                text: 'palette.200',
                hover: 'palette.800',
                active: 'palette.700',
                border: 'transparent'
            }
        },
        overlay: {
            backdrop: 'rgba(0, 0, 0, 0.75)',
            surface: 'palette.900',
            elevation: 4,
            border: 'palette.700'
        },
        a11y: {
            focusVisible: {
                outline: 'palette.400',
                outlineOffset: '2px'
            },
            contrastText: {
                high: '#FFFFFF',
                medium: 'palette.100',
                low: 'palette.300'
            },
            keyboardFocus: {
                ring: 'palette.700'
            }
        },
        primary: {
            main: 'palette.300',
            light: 'palette.100',
            dark: 'palette.500',
            hover: 'palette.200',
            active: 'palette.400',
            disabled: 'palette.700',
            contrastText: 'palette.900'
        },
        secondary: {
            main: 'secondary.300',
            light: 'secondary.100',
            dark: 'secondary.500',
            hover: 'secondary.200',
            active: 'secondary.400',
            disabled: 'secondary.700',
            contrastText: 'secondary.900'
        },
        error: {
            main: 'error.300',
            light: 'error.100',
            dark: 'error.500',
            hover: 'error.200',
            active: 'error.400',
            disabled: 'error.700',
            contrastText: 'error.900'
        },
        warning: {
            main: 'warning.300',
            light: 'warning.100',
            dark: 'warning.500',
            hover: 'warning.200',
            active: 'warning.400',
            disabled: 'warning.700',
            contrastText: 'warning.900'
        },
        success: {
            main: 'success.300',
            light: 'success.100',
            dark: 'success.500',
            hover: 'success.200',
            active: 'success.400',
            disabled: 'success.700',
            contrastText: 'success.900'
        },
        info: {
            main: 'info.300',
            light: 'info.100',
            dark: 'info.500',
            hover: 'info.200',
            active: 'info.400',
            disabled: 'info.700',
            contrastText: 'info.900'
        },
        neutral: {
            50: 'neutral.900',
            100: 'neutral.800',
            200: 'neutral.700',
            300: 'neutral.600',
            400: 'neutral.500',
            500: 'neutral.400',
            600: 'neutral.300',
            700: 'neutral.200',
            800: 'neutral.100',
            900: 'neutral.50'
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