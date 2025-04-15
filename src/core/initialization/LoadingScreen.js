// LoadingScreen.js (otimizado)
import React, { useMemo } from 'react';
import { useServiceInitialization } from './ServiceInitializationProvider';
import { motion } from 'framer-motion';
import { getStatusDescription } from './initializationUtils';

// Componente separado para cada serviço - evita re-renders desnecessários
const ServiceItem = React.memo(({ 
  name, 
  status, 
  description, 
  critical, 
  error, 
  getStatusDescription 
}) => {
  return (
    <div key={name} className="space-y-2">
      <div className="flex justify-between">
        <span className="flex items-center">
          {critical && (
            <span className="h-2 w-2 bg-red-500 rounded-full mr-2" title="Serviço crítico"></span>
          )}
          <span>{name}</span>
        </span>
        <span className={
          status === 'failed' ? 'text-red-500' : 
          status === 'ready' ? 'text-green-500' : 
          status === 'blocked' ? 'text-orange-500' : 'text-blue-500'
        }>
          {getStatusDescription(status)}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${
            status === 'ready' ? 'bg-green-500' : 
            status === 'failed' ? 'bg-red-500' :
            status === 'blocked' ? 'bg-orange-500' : 'bg-blue-500'
          }`}
          initial={{ width: 0 }}
          animate={{ 
            width: status === 'ready' ? '100%' : 
                   status === 'failed' ? '100%' : 
                   status === 'blocked' ? '60%' : 
                   status === 'initializing' ? '60%' : '30%' 
          }}
          transition={{ duration: 0.5 }}
        />
      </div>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
});

// Componente para uma fase inteira
const PhaseGroup = React.memo(({ 
  phaseName, 
  services, 
  getServiceError 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">
        {phaseName.charAt(0).toUpperCase() + phaseName.slice(1)}
      </h3>
      {services.map(service => (
        <ServiceItem
          key={service.name}
          name={service.name}
          status={service.status}
          description={service.description}
          critical={service.critical}
          error={getServiceError(service.name)}
          getStatusDescription={getStatusDescription}
        />
      ))}
    </div>
  );
});

export const LoadingScreen = ({ phase = 'services', error = null, retry = null }) => {
  const {
    services,
    isServiceReady,
    getServiceError,
    retryInitialization,
    metadata
  } = useServiceInitialization();
  
  const handleRetry = () => {
    if (retry) {
      retry();
    } else {
      retryInitialization();
    }
  };

  // Memoização do agrupamento de serviços por fase
  const servicesByPhase = useMemo(() => {
    if (phase !== 'services') return null;
    
    const phases = {};
    
    Object.entries(services).forEach(([serviceName, status]) => {
      const serviceMetadata = metadata?.[serviceName] || {};
      const phase = serviceMetadata.phase || 'unknown';
      
      if (!phases[phase]) {
        phases[phase] = [];
      }
      
      phases[phase].push({
        name: serviceName,
        status: status,
        critical: serviceMetadata.criticalPath,
        description: serviceMetadata.description
      });
    });
    
    return phases;
  }, [services, metadata, phase]);

  // Memoização do conteúdo da fase
  const phaseContent = useMemo(() => {
    switch (phase) {
      case 'bootstrap':
        return {
          title: 'Inicializando sistemas de base',
          message: 'Por favor, aguarde enquanto os sistemas de base são inicializados...'
        };
      
        case 'bootstrap-error':
          return {
            title: 'Erro de inicialização',
            message: error?.message ? String(error.message) : 'Erro desconhecido'
          };
      
      case 'services':
        return {
          title: 'Carregando serviços',
          message: 'Inicializando serviços da aplicação...'
        };
      
      case 'error':
        return {
          title: 'Erro de inicialização',
          message: 'Ocorreu um erro durante a inicialização dos serviços'
        };
      
      default:
        return {
          title: 'Carregando',
          message: 'Por favor, aguarde...'
        };
    }
  }, [phase, error]);

  const { title, message } = phaseContent;
  const showRetry = phase === 'bootstrap-error' || phase === 'error';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center"
    >
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">
          {typeof message === 'object' ? JSON.stringify(message) : message}
        </p>

        {phase === 'services' && (
          <div className="space-y-6">
            {/* Mostrar serviços por fase */}
            {servicesByPhase && Object.entries(servicesByPhase).map(([phaseName, phaseServices]) => (
              <PhaseGroup
                key={phaseName}
                phaseName={phaseName}
                services={phaseServices}
                getServiceError={getServiceError}
              />
            ))}
          </div>
        )}

        {showRetry && (
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </motion.div>
  );
};