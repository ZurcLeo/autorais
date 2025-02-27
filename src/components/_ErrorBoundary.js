// import React, { Component, useState, useCallback } from 'react';
// import { coreLogger } from '../core/logging/CoreLogger';
// import { LOG_LEVELS } from '../reducers/metadata/metadataReducer';
// import { Alert, AlertTitle } from '@mui/material';

// class ErrorBoundary extends Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false, error: null };
    
//     // Log de inicialização
//     coreLogger.logServiceInitStart('ErrorBoundary', LOG_LEVELS.INITIALIZATION, 'Error boundary initialized', {
//       timestamp: new Date().toISOString(),
//       props: Object.keys(props)
//     });
//   }

//   static getDerivedStateFromError(error) {
//     return { hasError: true, error };
//   }

//   componentDidCatch(error, errorInfo) {
//     const startTime = performance.now();
    
//     // Log detalhado do erro
//     coreLogger.logServiceError('ErrorBoundary', LOG_LEVELS.ERROR, 'Error boundary triggered', {
//       error: {
//         message: error.message,
//         stack: error.stack,
//         name: error.name,
//         type: error.constructor.name
//       },
//       errorInfo: {
//         componentStack: errorInfo.componentStack
//       },
//       context: {
//         location: window.location.href,
//         timestamp: new Date().toISOString(),
//         userAgent: navigator.userAgent,
//         viewportSize: {
//           width: window.innerWidth,
//           height: window.innerHeight
//         }
//       }
//     });

//     // Log de performance do tratamento do erro
//     coreLogger.logServicePerformance('ErrorBoundary', LOG_LEVELS.PERFORMANCE, 'Error handling time', {
//       duration: `${Math.round(performance.now() - startTime)}ms`,
//       errorType: error.name
//     });

//     if (this.props.onError) {
//       try {
//         this.props.onError(error, errorInfo);
//         coreLogger.logEvent('ErrorBoundary', LOG_LEVELS.LIFECYCLE, 'Custom error handler executed');
//       } catch (handlerError) {
//         coreLogger.logServiceError('ErrorBoundary', LOG_LEVELS.ERROR, 'Custom error handler failed', {
//           originalError: error.message,
//           handlerError: handlerError.message
//         });
//       }
//     }
//   }

//   componentWillUnmount() {
//     coreLogger.logProviderUnmount('ErrorBoundary', LOG_LEVELS.LIFECYCLE, 'Error boundary unmounting', {
//       hasError: this.state.hasError,
//       timestamp: new Date().toISOString()
//     });
//   }

//   handleReload = () => {
//     coreLogger.logEvent('ErrorBoundary', LOG_LEVELS.STATE, 'Application reload requested', {
//       error: this.state.error?.message,
//       timestamp: new Date().toISOString(),
//       location: window.location.href
//     });
    
//     window.location.reload();
//   };

//   render() {
//     if (this.state.hasError) {
//       if (this.props.fallback) {
//         coreLogger.logEvent('ErrorBoundary', LOG_LEVELS.STATE, 'Rendering custom fallback');
//         return this.props.fallback;
//       }

//       coreLogger.logEvent('ErrorBoundary', LOG_LEVELS.STATE, 'Rendering default fallback', {
//         errorMessage: this.state.error?.message
//       });

//       return (
//         <Alert
//           severity="error"
//           variant="filled"
//           sx={{
//             position: 'fixed',
//             top: '50%',
//             left: '50%',
//             transform: 'translate(-50%, -50%)',
//             maxWidth: '90vw',
//             width: '400px'
//           }}
//         >
//           <AlertTitle>Algo deu errado</AlertTitle>
//           {process.env.NODE_ENV === 'development' && (
//             <pre style={{ whiteSpace: 'pre-wrap' }}>
//               {this.state.error?.message}
//             </pre>
//           )}
//           <button
//             onClick={this.handleReload}
//             style={{
//               marginTop: '16px',
//               padding: '8px 16px',
//               borderRadius: '4px',
//               border: 'none',
//               backgroundColor: 'white',
//               cursor: 'pointer'
//             }}
//           >
//             Recarregar aplicação
//           </button>
//         </Alert>
//       );
//     }

//     return this.props.children;
//   }
// }

// // Hook personalizado com logging integrado
// export function useErrorBoundary() {
//   const [error, setError] = useState(null);

//   // Log da criação do hook
//   React.useEffect(() => {
//     coreLogger.logEvent('useErrorBoundary', LOG_LEVELS.LIFECYCLE, 'Error boundary hook initialized');
    
//     return () => {
//       coreLogger.logEvent('useErrorBoundary', LOG_LEVELS.LIFECYCLE, 'Error boundary hook cleanup');
//     };
//   }, []);

//   // Wrapper para setError com logging
//   const setErrorWithLogging = useCallback((newError) => {
//     if (newError) {
//       coreLogger.logServiceError('useErrorBoundary', LOG_LEVELS.ERROR, 'Functional component error', {
//         error: {
//           message: newError.message,
//           stack: newError.stack,
//           name: newError.name
//         },
//         timestamp: new Date().toISOString()
//       });
//     }
//     setError(newError);
//   }, []);

//   const ErrorFallback = ({ error }) => {
//     React.useEffect(() => {
//       if (error) {
//         coreLogger.logEvent('ErrorFallback', LOG_LEVELS.STATE, 'Rendering error fallback', {
//           errorMessage: error.message
//         });
//       }
//     }, [error]);
  
//     return (
//       <Alert severity="error">
//         <AlertTitle>Erro</AlertTitle>
//         {error?.message || 'Ocorreu um erro inesperado.'}
//       </Alert>
//     );
//   };

//   return {
//     ErrorBoundary,
//     ErrorFallback: (props) => <ErrorFallback {...props} />, 
//     error,
//     setError: setErrorWithLogging
//   };
// }

// export { ErrorBoundary };