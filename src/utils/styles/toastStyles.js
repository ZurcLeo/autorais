// src/utils/styles/toastStyles.js
const toastStyles = {
  // Estilos base para todos os toasts
  base: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '4px',
    position: 'relative',
    overflow: 'hidden',
  },
  
  // Estilos específicos por tipo
  success: {
    borderLeft: '4px solid',
    borderColor: 'success.main',
  },
  error: {
    borderLeft: '4px solid',
    borderColor: 'error.main',
  },
  info: {
    borderLeft: '4px solid',
    borderColor: 'info.main',
  },
  warning: {
    borderLeft: '4px solid',
    borderColor: 'warning.main',
  },
  
  // Estilos de variantes
  highlighted: {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: '1px solid',
    borderColor: 'divider',
  },
  critical: {
    boxShadow: '0 4px 20px rgba(211, 47, 47, 0.3)',
  },
  subtle: {
    opacity: 0.9,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  
  // Elementos internos
  icon: {
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
  },
  action: {
    marginTop: '8px',
  },
  progress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '3px',
    transition: 'width linear',
  },
  
  // Media queries
  mobile: {
    width: '100%',
    maxWidth: '100%',
    borderRadius: 0,
    boxShadow: 'none',
    borderTop: '1px solid',
    borderColor: 'divider',
  }
};

export default toastStyles;