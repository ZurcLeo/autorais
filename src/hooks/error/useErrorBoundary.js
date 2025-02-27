import { useContext, useCallback } from 'react';
import { ErrorBoundaryContext } from '../../core/error/ErrorBoundaryContext';
import { ErrorBoundary } from '../../core/error/ErrorBoundary';
import { ErrorAlert } from '../../core/error/ErrorAlert';

export function useErrorBoundary() {
  const context = useContext(ErrorBoundaryContext);
  
  if (!context) {
    throw new Error('useErrorBoundary must be used within ErrorBoundaryProvider');
  }

  return {
    ErrorBoundary,
    ErrorAlert,
    ...context
  };
}