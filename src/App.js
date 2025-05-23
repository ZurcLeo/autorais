// src/App.js
import React, {useState, useEffect} from 'react';
import {BrowserRouter} from 'react-router-dom';
import {serviceLocator} from './core/services/BaseService.js';
import {ServiceInitializationProvider} from './core/initialization/ServiceInitializationProvider';
import {AuthProvider} from './providers/AuthProvider';
import {NotificationProvider} from './providers/NotificationProvider';
import {DashboardProvider} from './context/DashboardContext';
import {AppRoutes} from './routes';
import {setupAuthEventMonitoring} from './providers/AuthProvider';
import {UserProvider} from './providers/UserProvider';
import {InterestsProvider} from './providers/InterestsProvider';
import {ValidationProvider} from './providers/ValidationProvider';
import {ToastProvider} from './providers/ToastProvider';
import {ConnectionProvider} from './providers/ConnectionProvider';
import {InviteProvider} from './providers/InviteProvider';
import CookieConsentManager from './components/Preferences/CookieConsentManager.js';
import {DebugProvider} from './core/debug/index.js';
import {DebugProviderBridge} from './core/debug/DebugProvider';
import {MessageProvider} from './providers/MessageProvider/index.js';
import {CaixinhaProvider} from './providers/CaixinhaProvider';
import {InitialLoadingScreen} from './components/Auth/InitialLoadingScreen.js';
import {useServiceInitialization} from './core/initialization/ServiceInitializationProvider';
import {debugServiceInstance} from './core/services/serviceDebug.js';
import {BankingProvider} from './providers/BankingProvider/index.js';
import {CaixinhaInviteProvider} from './providers/CaixinhaInviteProvider/index.js';
import {RifaProvider} from './providers/RifaProvider/index.js';
import {LoanProvider} from './providers/LoanProvider/index.js';
import {DisputeProvider} from './providers/DisputeProvider/index.js';
console.log(`app renderizando - ${new Date().toISOString()}`);

/**
 * Component that renders the application when critical services are ready
 * or displays a loading screen when they are initializing
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render when initialization is complete
 * @returns {React.ReactElement} Rendered component
 */
const AppInitializer = ({children}) => {
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

    /**
   * Effect to check the user session when the authentication service is ready
   */
    useEffect(() => {
        setupAuthEventMonitoring();
        if (isAuthReady) {
            const authService = serviceLocator.get('auth');
            console.log('Checking session with authService:');
            debugServiceInstance('auth'); // Add this for debugging

            try {
                // Call checkSession asynchronously
                authService
                    .checkSession()
                    .then(sessionResult => {
                        console.log('Session check result:', sessionResult);
                        console.log('Auth service after session check:');
                        debugServiceInstance('auth'); // Check again after the call
                        // Mark session check as complete
                        setSessionChecked(true);
                    })
                    .catch(error => {
                        console.error('Session check failed:', error);
                        setSessionCheckError(error);
                        setSessionChecked(true); // Still mark as checked, even with error
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

    // If bootstrap failed, show error screen
    if (bootstrapError) {
        return (
            <InitialLoadingScreen
                type="error"
                message="Application initialization failed"
                details={bootstrapError.message || String(bootstrapError)}
                retry={retryInitialization}/>
        );
    }

    // If bootstrap is still in progress, show loading screen
    if (!isBootstrapReady) {
        return <InitialLoadingScreen type="bootstrap" message="Starting application..."/>;
    }

    // If any critical service failed, show error screen
    if (hasCriticalFailure) {
        return (
            <InitialLoadingScreen
                type="critical-error"
                message="Critical services failure"
                details="Essential application components could not be initialized."
                retry={retryInitialization}/>
        );
    }

    // If auth service is ready but we haven't checked the session yet
    if (isAuthReady && !sessionChecked) {
        return <InitialLoadingScreen type="auth" message="Verifying session..."/>;
    }

    // If we had an error checking the session
    if (sessionCheckError) {
        return (
            <InitialLoadingScreen
                type="auth-error"
                message="Failed to verify session"
                details={sessionCheckError.message || String(sessionCheckError)}
                retry={() => window.location.reload()}/>
        );
    }

    // If all critical services are ready and the session was checked, render the
    // application
    return children;
};

/**
 * Main application component
 * Manages necessary providers and routing
 *
 * @component
 * @returns {React.ReactElement} Rendered application
 */
function App() {
    return (
        <ServiceInitializationProvider>
            <AppInitializer>
                <BrowserRouter
                    future={{
                        v7_startTransition: true
                    }}>
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
                                                                <CaixinhaInviteProvider>
                                                                    <BankingProvider>
                                                                        <RifaProvider>
                                                                            <LoanProvider>
                                                                                <DisputeProvider>
                                                                                    <DashboardProvider>
                                                                                        {process.env.NODE_ENV === 'development' && <DebugProviderBridge/>}
                                                                                        <CookieConsentManager/>
                                                                                        <AppRoutes/>
                                                                                    </DashboardProvider>
                                                                                </DisputeProvider>
                                                                            </LoanProvider>
                                                                        </RifaProvider>
                                                                    </BankingProvider>
                                                                </CaixinhaInviteProvider>
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
                </BrowserRouter>
            </AppInitializer>
        </ServiceInitializationProvider>
    );
}

export default App;