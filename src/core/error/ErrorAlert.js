//src/core/error/ErrorAlert.js
import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Info, CheckCircle, XCircle, X, RefreshCw, ExternalLink } from 'lucide-react';

// Constantes para animações e configurações
const ANIMATION_DURATION = 300; // ms
const AUTO_CLOSE_DELAY = 5000; // ms

/**
 * Componente de alerta para exibição de mensagens de erro, sucesso, aviso ou informação
 */
export const ErrorAlert = ({ 
  type = 'error', 
  title,
  message, 
  autoClose = true,
  position = 'top-right',
  duration = AUTO_CLOSE_DELAY,
  onClose,
  onRetry,
  hasDetails = false,
  errorDetails,
  className = ''
}) => {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Configuração de ícones e cores para cada tipo de alerta
  const alertConfig = {
    success: { icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-300' },
    error: { icon: XCircle, color: 'bg-red-100 text-red-800 border-red-300' },
    warning: { icon: AlertCircle, color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    info: { icon: Info, color: 'bg-blue-100 text-blue-800 border-blue-300' }
  };

  const { icon: Icon, color } = alertConfig[type] || alertConfig.info;

  // Classes de posicionamento
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  // Handler para fechar o alerta com animação
  const closeAlert = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, ANIMATION_DURATION);
  }, [onClose]);

  // Handler para ação de retry quando disponível
  const handleRetry = useCallback(() => {
    if (onRetry && typeof onRetry === 'function') {
      onRetry();
    }
  }, [onRetry]);

  // Auto-close após o delay definido (apenas se autoClose estiver ativado)
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        closeAlert();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, closeAlert, duration]);

  // Se o alerta não estiver visível, não renderiza nada
  if (!visible) return null;

  // Classes para animações
  const animationClasses = exiting
    ? 'animate-out fade-out slide-out-to-right duration-300'
    : 'animate-in fade-in slide-in-from-right duration-300';

  return (
    <div 
      className={`fixed z-50 ${positionClasses[position] || 'top-4 right-4'} max-w-md w-full`}
    >
      <div 
        className={`${color} border rounded-lg p-4 shadow-sm relative flex items-start gap-3 ${animationClasses} ${className}`}
        role="alert"
      >
        <div className="flex-shrink-0">
          <Icon size={20} />
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-semibold mb-1">{title}</div>
          )}
          <div className="text-sm">{message}</div>
          
          {/* Botões de ação */}
          <div className="mt-3 flex flex-wrap gap-2">
            {onRetry && (
              <button
                onClick={handleRetry}
                className="inline-flex items-center text-xs py-1 px-2 rounded bg-white bg-opacity-30 hover:bg-opacity-50 transition-all"
              >
                <RefreshCw size={12} className="mr-1" />
                Tentar Novamente
              </button>
            )}
            
            {hasDetails && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center text-xs py-1 px-2 rounded bg-white bg-opacity-30 hover:bg-opacity-50 transition-all"
              >
                <ExternalLink size={12} className="mr-1" />
                {showDetails ? 'Ocultar Detalhes' : 'Ver Detalhes'}
              </button>
            )}
          </div>
          
          {/* Detalhes técnicos do erro (quando expandido) */}
          {showDetails && errorDetails && (
            <div className="mt-3 p-2 bg-white bg-opacity-20 rounded text-xs font-mono overflow-auto max-h-32">
              <pre>{typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails, null, 2)}</pre>
            </div>
          )}
        </div>
        
        <button 
          onClick={closeAlert}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors duration-150"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};