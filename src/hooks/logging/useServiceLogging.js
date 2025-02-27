// src/hooks/useServiceLogging.js
import { useEffect } from 'react';
import { coreLogger } from '../../core/logging/CoreLogger';
import { LOG_LEVELS } from '../../reducers/metadata/metadataReducer';
import { useLocation } from 'react-router-dom';

export const useServiceLogging = (serviceName, options = {}) => {
  const { 
    trackPerformance = true,
    trackLifecycle = true,
    trackErrors = true 
  } = options;

  useEffect(() => {
    const startTime = performance.now();
    
    if (trackLifecycle) {
      coreLogger.logServiceInitStart(serviceName);
    }

    return () => {
      if (trackLifecycle) {
        const duration = performance.now() - startTime;
        coreLogger.logServiceInitComplete(serviceName, duration);
      }
    };
  }, [serviceName, trackLifecycle]);

  const logError = (error, context = {}) => {
    if (trackErrors) {
      coreLogger.logServiceError(serviceName, error, context);
    }
  };

  const logPerformance = (operation, duration, metadata = {}) => {
    if (trackPerformance) {
      coreLogger.logServicePerformance(serviceName, operation, duration, metadata);
    }
  };

  return {
    logError,
    logPerformance
  };
};

// src/hooks/useRouteLogging.js
export const useRouteLogging = (routeName) => {
  const location = useLocation();
  
  useEffect(() => {
    coreLogger.logEvent(routeName, LOG_LEVELS.STATE, 'Route changed', {
      path: location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [location, routeName]);
};