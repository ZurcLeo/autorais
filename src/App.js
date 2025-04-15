// src/App.js - Versão Refatorada
import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { serviceLocator } from './core/services/BaseService.js';
import { ServiceInitializationProvider } from './core/initialization/ServiceInitializationProvider';
import { AuthProvider } from './providers/AuthProvider';
import { NotificationProvider } from './providers/NotificationProvider';
import { DashboardProvider } from './context/DashboardContext';
import { AppRoutes } from './routes';
import { setupAuthEventMonitoring } from './providers/AuthProvider';
import { UserProvider } from './providers/UserProvider';
import { InterestsProvider } from './providers/InterestsProvider';
import { ValidationProvider } from './providers/ValidationProvider';
import { ToastProvider } from './providers/ToastProvider';
import { ConnectionProvider } from './providers/ConnectionProvider';
import { InviteProvider } from './providers/InviteProvider';
import CookieConsentManager from './components/Preferences/CookieConsentManager.js';
import { DebugProvider } from './core/debug/index.js';
import { DebugProviderBridge } from './core/debug/DebugProvider';
import { MessageProvider } from './providers/MessageProvider/index.js';
import { CaixinhaProvider} from './providers/CaixinhaProvider';
import {InitialLoadingScreen} from './components/Auth/InitialLoadingScreen.js';
import { useServiceInitialization } from './core/initialization/ServiceInitializationProvider';
import { debugServiceInstance } from './core/services/serviceDebug.js';
/**
 * Componente que renderiza a aplicação quando serviços críticos estão prontos
 * ou uma tela de carregamento quando estão inicializando
 */
const AppInitializer = ({ children }) => {
  const { 
    isBootstrapReady, 
    bootstrapError, 
    criticalServicesReady,
    hasCriticalFailure,
    retryInitialization,
    isAuthReady
  } = useServiceInitialization();
  
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionCheckError, setSessionCheckError] = useState(null);

  // Efeito para verificar a sessão quando o serviço de autenticação estiver pronto
// Dentro de useEffect no AppInitializer
useEffect(() => {
  setupAuthEventMonitoring()
  if (isAuthReady) {
    const authService = serviceLocator.get('auth');
    console.log('Verificando sessão com authService:');
    debugServiceInstance('auth'); // Adicionar isto para depuração
    
    try {
      // Chamar o checkSession de forma assíncrona
      authService.checkSession()
        .then(sessionResult => {
          console.log('Session check result:', sessionResult);
          console.log('Auth service após verificação de sessão:');
          debugServiceInstance('auth'); // Verificar novamente após a chamada
          // Marcar a verificação de sessão como concluída
          setSessionChecked(true);
        })
        .catch(error => {
          console.error('Session check failed:', error);
          setSessionCheckError(error);
          setSessionChecked(true); // Ainda marcamos como verificado, mesmo com erro
        });
    } catch (error) {
      console.error('Error during session check:', error);
      setSessionCheckError(error);
      setSessionChecked(true);
    }
  }
}, [isAuthReady]);

  console.log('AppInitializer state:', { 
    isBootstrapReady, 
    bootstrapError, 
    criticalServicesReady,
    hasCriticalFailure,
    isAuthReady,
    sessionChecked
  });

  // Se o bootstrap falhou, mostrar tela de erro
  if (bootstrapError) {
    return (
      <InitialLoadingScreen 
        type="error" 
        message="Falha na inicialização da aplicação" 
        details={bootstrapError.message || String(bootstrapError)}
        retry={retryInitialization}
      />
    );
  }

  // Se o bootstrap ainda está em andamento, mostrar tela de carregamento
  if (!isBootstrapReady) {
    return <InitialLoadingScreen type="bootstrap" message="Iniciando aplicação..." />;
  }

  // Se algum serviço crítico falhou, mostrar tela de erro
  if (hasCriticalFailure) {
    return (
      <InitialLoadingScreen 
        type="critical-error" 
        message="Falha em serviços críticos" 
        details="Não foi possível inicializar componentes essenciais da aplicação."
        retry={retryInitialization}
      />
    );
  }

  // Se auth service está pronto mas ainda não verificamos a sessão
  if (isAuthReady && !sessionChecked) {
    return <InitialLoadingScreen type="auth" message="Verificando sessão..." />;
  }

  // Se tivemos erro ao verificar a sessão
  if (sessionCheckError) {
    return (
      <InitialLoadingScreen 
        type="auth-error" 
        message="Falha ao verificar sessão" 
        details={sessionCheckError.message || String(sessionCheckError)}
        retry={() => window.location.reload()}
      />
    );
  }

  // Se todos os serviços críticos estão prontos e a sessão foi verificada, renderizar a aplicação
  return children;
};

/**
 * Componente principal da aplicação
 * Gerencia os providers necessários e o roteamento
 */
function App() {
  return (
    <ServiceInitializationProvider>
      <AppInitializer>
        <Router>
          <DebugProvider>
            <ToastProvider>
              <AuthProvider>
                <NotificationProvider>
                  <ValidationProvider>
                    <InviteProvider>
                      <UserProvider>
                        <InterestsProvider>
                          <ConnectionProvider>
                            <MessageProvider>
                              <CaixinhaProvider>
                                <DashboardProvider>
                                  {process.env.NODE_ENV === 'development' && <DebugProviderBridge />}
                                  <CookieConsentManager />
                                  <AppRoutes />
                                </DashboardProvider>
                              </CaixinhaProvider>
                            </MessageProvider>
                          </ConnectionProvider>
                        </InterestsProvider>
                      </UserProvider>
                    </InviteProvider>
                  </ValidationProvider>
                </NotificationProvider>
              </AuthProvider>
            </ToastProvider>
          </DebugProvider>
        </Router>
      </AppInitializer>
    </ServiceInitializationProvider>
  );
}

export default App;