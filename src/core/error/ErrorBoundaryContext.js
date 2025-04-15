//src/core/error/ErrorBoundaryContext.js
import { createContext } from 'react';

export const ErrorBoundaryContext = createContext({
  setError: null,
  error: null,
  clearError: null,
  clearAllErrors: null,
  errorHistory: null
});