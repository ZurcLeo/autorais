// src/App.js
import React, { useEffect } from 'react';
import { Container } from '@mui/material';
import { ToastProvider } from './providers/ToastProvider';
import { ToastContainer } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { LOG_LEVELS } from './reducers/metadata/metadataReducer';
import AppRoutes from './routes';
import { coreLogger } from './core/logging/CoreLogger';

const App = () => {
    const location = useLocation();
    const startTime = performance.now();

  // Função para lidar com a inicialização do ToastContainer
  const handleToastInit = () => {

    coreLogger.logEvent('App', LOG_LEVELS.LIFECYCLE, 'ToastContainer initialized', {
      timestamp: new Date().toISOString()
    });
    console.log('ToastContainer has been initialized');
  };

  useEffect(() => {

    coreLogger.logServiceInitStart('App', LOG_LEVELS.LIFECYCLE, 'Routes initialization', {
      startTimestamp: new Date().toISOString(),
      initialPath: location.pathname
    });

    // Registrar métricas de performance inicial
    const initialLoadTime = performance.now() - startTime;
    coreLogger.logServicePerformance('App', LOG_LEVELS.PERFORMANCE, 'Initial routes load', {
      duration: `${Math.round(initialLoadTime)}ms`,
      path: location.pathname
    });

    return () => {
      const totalLifetime = performance.now() - startTime;
      coreLogger.logServiceInitComplete('App', LOG_LEVELS.LIFECYCLE, 'Routes cleanup', {
        duration: `${Math.round(totalLifetime)}ms`,
        endTimestamp: new Date().toISOString(),
        finalPath: location.pathname
      });
    };
  }, []);

  // Log detalhado de mudanças de rota
  useEffect(() => {
    coreLogger.logEvent('App', LOG_LEVELS.STATE, 'Route navigation', {
      path: location.pathname,
      search: location.search,
      timestamp: new Date().toISOString(),
      referrer: document.referrer || 'direct',
      hasAuthenticatedLayout: location.pathname !== '/login' && 
                             location.pathname !== '/register' &&
                             location.pathname !== '/'
    });
  }, [location]);

  // // Função auxiliar para logging de erros de rota
  // const handleRouteError = (error) => {
  //   coreLogger.logServiceError('App', LOG_LEVELS.ERROR, 'Route error', {
  //     error: error.message,
  //     path: location.pathname,
  //     stack: error.stack,
  //     timestamp: new Date().toISOString()
  //   });
  // };

  return (
    <Container>
      <ToastProvider>
        <AppRoutes />
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          onInit={handleToastInit} // Passando a função para onInit
        />
      </ToastProvider>
    </Container>
  );
};

export default App;