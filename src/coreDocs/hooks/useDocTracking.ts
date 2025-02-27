import { useEffect, useCallback } from 'react';
import { coreLogger } from '../../core/logging/CoreLogger';
import { LOG_LEVELS } from '../../reducers/metadata/metadataReducer';

interface TrackingOptions {
  section: string;
  subsection?: string;
}

/**
 * Custom hook for documentation usage tracking
 * Integrates with CoreLogger for consistent logging
 */
export const useDocTracking = ({ section, subsection }: TrackingOptions) => {
  const trackView = useCallback(() => {
    console.log('DocTracking', LOG_LEVELS.INFO, 'Documentation viewed', {
      section,
      subsection,
      timestamp: new Date().toISOString()
    });
  }, [section, subsection]);

  const trackSearch = useCallback((searchTerm: string) => {
    console.log('DocTracking', LOG_LEVELS.INFO, 'Documentation searched', {
      section,
      searchTerm,
      timestamp: new Date().toISOString()
    });
  }, [section]);

  useEffect(() => {
    trackView();
  }, [trackView]);

  // Retornando ambas as funções no objeto
  return { 
    trackView,
    trackSearch 
  };
};