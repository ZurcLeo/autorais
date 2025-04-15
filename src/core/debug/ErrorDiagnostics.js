//src/core/error/ErrorDiagnostics.js
import React, { useState } from 'react';
import { useErrorBoundary } from '../../hooks/error/useErrorBoundary';

/**
 * Componente para diagnóstico e teste do sistema de erros
 * Deve ser usado apenas em ambientes de desenvolvimento
 */
export const ErrorDiagnostics = ({ initiallyOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [errorType, setErrorType] = useState('rendering');
  const { error, setError, clearError } = useErrorBoundary();

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9990,
          padding: '8px 12px',
          background: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}
      >
        Diagnóstico de Erros
      </button>
    );
  }

  // Função para simular diferentes tipos de erros
  const triggerError = () => {
    switch (errorType) {
      case 'rendering':
        // Este vai ser capturado pelo ErrorBoundary
        throw new Error('Erro de renderização simulado');
      
      case 'async':
        // Este será capturado pelo Provider global
        setTimeout(() => {
          throw new Error('Erro assíncrono simulado');
        }, 100);
        break;
      
      case 'promise':
        // Este também será capturado pelo Provider global
        Promise.reject(new Error('Erro de promessa simulado'));
        break;
      
      case 'manual':
        // Este será processado pelo Provider via setError
        setError(new Error('Erro manual simulado'), {
          serviceName: 'ErrorDiagnostics',
          operation: () => {
            console.log('Tentativa de recuperação do erro manual');
            return Promise.resolve();
          }
        });
        break;
        
      case 'infinite-loop':
        // Simula um erro de loop infinito
        const error = new Error('Erro de loop infinito simulado');
        error.code = 'INFINITE_LOOP';
        setError(error, { serviceName: 'ErrorDiagnostics' });
        break;
        
      default:
        console.warn('Tipo de erro desconhecido:', errorType);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '350px',
        padding: '15px',
        background: 'white',
        boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
        borderRadius: '8px',
        zIndex: 9992
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>Diagnóstico de Erros</h3>
        <button 
          onClick={() => setIsOpen(false)}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            fontSize: '18px',
            cursor: 'pointer' 
          }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Tipo de Erro:</label>
        <select 
          value={errorType} 
          onChange={(e) => setErrorType(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '8px', 
            borderRadius: '4px', 
            border: '1px solid #ddd' 
          }}
        >
          <option value="rendering">Erro de Renderização</option>
          <option value="async">Erro Assíncrono</option>
          <option value="promise">Erro de Promessa</option>
          <option value="manual">Erro Manual (via setError)</option>
          <option value="infinite-loop">Erro de Loop Infinito</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={triggerError}
          style={{
            padding: '8px 12px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            flex: 1
          }}
        >
          Simular Erro
        </button>
        
        <button 
          onClick={clearError}
          style={{
            padding: '8px 12px',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            flex: 1
          }}
          disabled={!error}
        >
          Limpar Erro
        </button>
      </div>

      {error && (
        <div 
          style={{ 
            marginTop: '15px', 
            padding: '10px', 
            background: '#ffebee', 
            borderRadius: '4px',
            border: '1px solid #ffcdd2'
          }}
        >
          <strong>Erro Atual:</strong>
          <pre style={{ 
            margin: '5px 0 0', 
            fontSize: '12px', 
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-word' 
          }}>
            {error.message}
            {error.stack && `\n\n${error.stack.split('\n').slice(1).join('\n')}`}
          </pre>
        </div>
      )}
    </div>
  );
};