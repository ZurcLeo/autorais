// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import {LOG_LEVELS} from './reducers/metadata/metadataReducer';
import {ErrorBoundaryProvider, ErrorBoundary} from './core/error';
import {BootstrapProvider } from './core/initialization/BootstrapContext';
import {InitializationManager} from "./core/initialization/InitializationManager";
import {ThemeContextProvider} from './themeContext';
import {AuthProvider} from './providers/AuthProvider';
import {BrowserRouter} from 'react-router-dom';
import App from './App';
import {CoreLoggerProvider} from './core/logging/CoreLoggerContext';
import {coreLogger} from './core/logging/CoreLogger';
import {ProviderDiagnostics} from './core/logging/ProviderDiagnostics';
import {ServiceInitializationProvider} from './core/initialization/ServiceInitializationProvider';
import {LoadingScreen} from "./core/initialization/LoadingScreen";
import 'react-toastify/dist/ReactToastify.css';

// Performance measurement start (outside React, can be kept here)
const startTime = performance.now();

// Initialize logging -  Now handled by CoreLoggerProvider and BootstrapProvider
// within React tree DOM container validation (outside React, can be kept here)
const container = document.getElementById('root');
if (!container) {
    coreLogger.logEvent(
        'Index',
        LOG_LEVELS.ERROR,
        'Root container not found',
        { // Logger might not be fully initialized yet if BootstrapProvider failed, console.error is safer here initially
            error: 'Failed to find root element',
            selector: 'root'
        }
    );
    console.error('Root container not found'); // Ensure error is logged even if CoreLogger fails
    // Instead of throwing, display critical error UI directly as React might not be ready for throwing here during initial render.
    displayCriticalError(new Error('Root container not found'));
    // Stop further initialization, return to prevent React rendering return;
}

const root = createRoot(container);

function renderApp() {
    root.render(
<ErrorBoundaryProvider>
  <CoreLoggerProvider>
    <BootstrapProvider>
      <ServiceInitializationProvider>
        <ThemeContextProvider>
          <AuthProvider>  {/* Movido para cima */}
            <BrowserRouter>
              <ErrorBoundary>
                <InitializationManager />
                <LoadingScreen />
                <App />
                {process.env.NODE_ENV === 'development' && 
                  <ProviderDiagnostics initiallyOpen={true} />
                }
              </ErrorBoundary>
            </BrowserRouter>
          </AuthProvider>
        </ThemeContextProvider>
      </ServiceInitializationProvider>
    </BootstrapProvider>
  </CoreLoggerProvider>
</ErrorBoundaryProvider>
      );
  }

// Asynchronous application startup orchestration (now using BootstrapProvider
// correctly)
async function initializeApplication() {
    try {
        renderApp(); // Renderiza a aplicação React (BootstrapProvider inicia o bootstrap DENTRO do React)
        setupErrorListeners(); // Configura listeners de erro globais (fora do React)

    } catch (error) {
        // Tratamento de erro crítico FORA do React
        console.error('[Critical] Failed to initialize application:', error);
        try {
            coreLogger.logServiceInitError('Index', error);
        } catch (logError) {
            console.error('[Critical] Logger failed:', logError);
        }
        displayCriticalError(error);
    }
}

function setupErrorListeners() { // Error listener setup (keep this, it's non-React related)
    window.addEventListener('error', (event) => {
        coreLogger.logEvent('Window', LOG_LEVELS.ERROR, 'Runtime error caught', {
            error: event.error
                ?.message,
            filename: event.filename,
            lineNumber: event.lineno,
            colNumber: event.colno
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        coreLogger.logEvent(
            'Window',
            LOG_LEVELS.ERROR,
            'Unhandled Promise rejection',
            {
                reason: event.reason
                    ?.message || String(event.reason),
                stack: event.reason
                    ?.stack
            }
        );
    });
}

function displayCriticalError(error) { // Critical error display (keep this, it's non-React related)
    const errorContainer = document.createElement('div');
    errorContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    max-width: 80%;
    text-align: center;
  `;

    errorContainer.innerHTML = `
    <h1 style="color: #e53e3e; margin: 0 0 16px;">Erro Crítico</h1>
    <p style="margin: 0 0 16px;">Ocorreu um erro ao inicializar a aplicação.</p>
    <p style="margin: 0 0 16px; font-size: 0.8em; color: #777; overflow-wrap: break-word;">${error.message}</p>
    <button onclick="window.location.reload()" style="
      background: #3182ce;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    ">Tentar Novamente</button>
  `;

    document
        .body
        .appendChild(errorContainer);
}

// Start the application bootstrap process
initializeApplication();