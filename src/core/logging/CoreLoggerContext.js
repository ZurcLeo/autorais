// src/core/logging/CoreLoggerContext.js
import React, { createContext, useContext } from 'react';
import { coreLogger } from './CoreLogger';

const CoreLoggerContext = createContext(null);

export function CoreLoggerProvider({ children }) {
  // coreLogger já se auto-inicializa no construtor
  return (
    <CoreLoggerContext.Provider value={coreLogger}>
      {children}
    </CoreLoggerContext.Provider>
  );
}

export function useCoreLogger() {
  const context = useContext(CoreLoggerContext);
  if (!context) {
    throw new Error('useCoreLogger must be used within a CoreLoggerProvider');
  }
  return context;
}