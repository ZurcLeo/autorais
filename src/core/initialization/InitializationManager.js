// src/core/initialization/InitializationManager.js
import React from 'react';
import { useServiceInitialization } from '../../hooks/initialization/useServiceInitialization';
import { useBootstrap } from './BootstrapContext';
import { LoadingScreen } from './LoadingScreen';
// import { coreLogger } from '../logging/CoreLogger';
// import { LOG_LEVELS } from '../../reducers/metadata/metadataReducer';

export const InitializationManager = ({ children }) => {
  const { isInitializationComplete, hasCriticalFailure } = useServiceInitialization();
  const { status: bootstrapStatus } = useBootstrap();

  if (bootstrapStatus !== 'ready') {
    return <LoadingScreen phase="bootstrap" />;
  }

  if (hasCriticalFailure()) {
    return <LoadingScreen phase="error" />;
  }

  if (!isInitializationComplete()) {
    return <LoadingScreen phase="services" />;
  }

  return children;
};