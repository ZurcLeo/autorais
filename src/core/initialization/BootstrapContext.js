// src/core/initialization/BootstrapContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { coreLogger } from '../logging/CoreLogger';
import { LOG_LEVELS } from '../../reducers/metadata/metadataReducer';

// Estados possíveis do bootstrap
export const BootstrapState = {
  INITIAL: 'initial',
  STARTING: 'starting',
  READY: 'ready',
  ERROR: 'error'
};

// Ações do reducer
const BootstrapActions = {
  START_BOOTSTRAP: 'START_BOOTSTRAP',
  BOOTSTRAP_SUCCESS: 'BOOTSTRAP_SUCCESS',
  BOOTSTRAP_ERROR: 'BOOTSTRAP_ERROR'
};

// Estado inicial
const initialState = {
  status: BootstrapState.INITIAL,
  error: null,
  startTime: null,
  initializationTime: null
};

// Reducer para gerenciar o estado do bootstrap
function bootstrapReducer(state, action) {
  switch (action.type) {
    case BootstrapActions.START_BOOTSTRAP:
      return {
        ...state,
        status: BootstrapState.STARTING,
        startTime: Date.now(),
        error: null
      };
    
    case BootstrapActions.BOOTSTRAP_SUCCESS:
      return {
        ...state,
        status: BootstrapState.READY,
        initializationTime: Date.now() - state.startTime,
        error: null
      };
    
    case BootstrapActions.BOOTSTRAP_ERROR:
      return {
        ...state,
        status: BootstrapState.ERROR,
        error: action.payload,
        initializationTime: Date.now() - state.startTime
      };
    
    default:
      return state;
  }
}

// Criação do contexto
const BootstrapContext = createContext(null);

// Provider do contexto
export function BootstrapProvider({ children }) {
  const [state, dispatch] = useReducer(bootstrapReducer, initialState);

  // Efeito para iniciar o bootstrap
  useEffect(() => {
    async function initializeCore() {
      try {
        dispatch({ type: BootstrapActions.START_BOOTSTRAP });
        
        // Inicia o logger
        await coreLogger.initialize()
        // Se chegou aqui, podemos começar a usar o logger
        coreLogger.logEvent('BootstrapCore', LOG_LEVELS.INITIALIZATION, 'Core systems initialized', {
          startTime: state.startTime,
          timestamp: new Date().toISOString()
        });

        dispatch({ type: BootstrapActions.BOOTSTRAP_SUCCESS });
      } catch (error) {
        console.error('[BootstrapCore] Initialization failed:', error);
        dispatch({ 
          type: BootstrapActions.BOOTSTRAP_ERROR,
          payload: error 
        });
      }
    }

    if (state.status === BootstrapState.INITIAL) {
      initializeCore();
    }
  }, [state.status]);

  // Hook para reiniciar o bootstrap se necessário
  const retryBootstrap = () => {
    if (state.status === BootstrapState.ERROR) {
      dispatch({ type: BootstrapActions.START_BOOTSTRAP });
    }
  };

  const value = {
    ...state,
    retryBootstrap,
    isReady: state.status === BootstrapState.READY
  };

  return (
    <BootstrapContext.Provider value={value}>
      {children}
    </BootstrapContext.Provider>
  );
}

// Hook para usar o contexto
export function useBootstrap() {
  const context = useContext(BootstrapContext);
  if (!context) {
    throw new Error('useBootstrap must be used within a BootstrapProvider');
  }
  return context;
}

// Componente de loading para usar durante a inicialização
export function BootstrapLoading() {
  const { status, error, retryBootstrap } = useBootstrap();

  if (status === BootstrapState.ERROR) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Erro na Inicialização
          </h2>
          <p className="text-gray-700 mb-4">
            Ocorreu um erro ao inicializar os sistemas core.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="text-xs text-left bg-gray-100 p-2 rounded mb-4 overflow-auto">
              {error?.message}
            </pre>
          )}
          <button
            onClick={retryBootstrap}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (status !== BootstrapState.READY) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p>Inicializando sistemas core...</p>
        </div>
      </div>
    );
  }

  return null;
}