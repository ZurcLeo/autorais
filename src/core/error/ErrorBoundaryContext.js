import { createContext } from 'react';

export const ErrorBoundaryContext = createContext({
  setError: null,
  error: null,
});