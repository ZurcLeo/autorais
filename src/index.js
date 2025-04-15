// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import {ErrorBoundaryProvider} from './core/error/ErrorBoundaryProvider'
import { ThemeContextProvider } from './themeContext';
import App from './App';
import 'react-toastify/dist/ReactToastify.css'; 
import './utils/i18n'; 

// Inicializar sistema de rastreamento de eventos para debug
if (process.env.NODE_ENV !== 'production') {
  // Usando o objeto global adequadamente
  if (typeof window !== 'undefined') {
    // No navegador
    window._eventTracing = [];
    
    // Adicionar funções de ajuda para debug
    window.showEventFlows = () => {
      const traces = {};
      
      // Agrupar por traceId
      window._eventTracing.forEach(entry => {
        if (!traces[entry.traceId]) {
          traces[entry.traceId] = [];
        }
        traces[entry.traceId].push(entry);
      });
      
      // Ordenar e formatar
      const formattedFlows = Object.entries(traces).map(([traceId, entries]) => {
        const sorted = entries.sort((a, b) => a.timestamp - b.timestamp);
        return {
          traceId,
          flow: sorted.map(e => `${e.type}: ${e.serviceName || ''}:${e.eventType || ''} → ${e.actionType || ''}`).join(' → '),
          startTime: new Date(sorted[0].timestamp).toISOString(),
          duration: sorted[sorted.length - 1].timestamp - sorted[0].timestamp
        };
      });
      
      console.table(formattedFlows);
      return formattedFlows;
    };
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <ErrorBoundaryProvider>
        <ThemeContextProvider 
      defaultMode="dark" // Define explicitamente o modo padrão
      defaultTheme="ocean" // Define explicitamente o tema padrão
    >
      <App />
    </ThemeContextProvider>
    </ErrorBoundaryProvider>
  // </React.StrictMode>
);