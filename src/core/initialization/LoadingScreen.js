// src/core/initialization/LoadingScreen.js
import React from 'react';
import { useServiceInitialization } from '../../hooks/initialization/useServiceInitialization';
import { motion } from 'framer-motion';

export const LoadingScreen = ({ phase = 'services' }) => {
  
  const {
    state,
    isInitializationComplete,
    services,
    isServiceReady,
    getServiceError
  } = useServiceInitialization();
 
  if (isInitializationComplete()) {
    return null;
  }

  const getPhaseContent = () => {
    switch (phase) {
      case 'bootstrap':
        return {
          title: 'Initializing Core Systems',
          message: 'Please wait while we initialize core systems...'
        };
      
      case 'services':
        return {
          title: 'Loading Services',
          message: 'Initializing application services...'
        };
      
      case 'error':
        return {
          title: 'Initialization Error',
          message: 'An error occurred during initialization'
        };
      
      default:
        return {
          title: 'Loading',
          message: 'Please wait...'
        };
    }
  };

  const { title, message } = getPhaseContent();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center"
    >
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>

        {phase === 'services' && (
          <div className="space-y-4">
            {Object.entries(services).map(([serviceName, status]) => (
              <div key={serviceName} className="space-y-2">
                <div className="flex justify-between">
                  <span>{serviceName}</span>
                  <span>{isServiceReady(serviceName) ? '✓' : '...'}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${isServiceReady(serviceName) ? 'bg-green-500' : 'bg-blue-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: isServiceReady(serviceName) ? '100%' : '60%' }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                {getServiceError(serviceName) && (
                  <p className="text-red-500 text-sm">
                    {getServiceError(serviceName)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};