import { useState, useEffect, useCallback, useMemo } from 'react';
import { LOG_LEVELS } from '../../core/constants/config';
import { coreLogger } from '../../core/logging';

const MODULE_NAME = 'CacheManager';
// Default cache durations
const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const DEFAULT_STALE_TIME = 30 * 1000; // 30 seconds in milliseconds

/**
 * CacheManager class handles storing and retrieving cached data with expiration
 * and staleness checking. It also supports subscription-based updates.
 */
export class CacheManager {
  constructor() {
    this.cache = new Map();
    this.subscribers = new Map();
  }

  setItem(key, value, options = {}) {
    try {
      if (!key) {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Cannot set cache item with null or undefined key.');
        throw new Error('Key is null or undefined');
      }

      if (value === undefined || value === null) {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Cannot set cache item with null or undefined value.');
        throw new Error('Value is null or undefined');
      }

      const timestamp = Date.now();
      const cacheTime = options.cacheTime || DEFAULT_CACHE_TIME;
      const staleTime = options.staleTime || DEFAULT_STALE_TIME;

      if (typeof cacheTime !== 'number' || cacheTime < 0) {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Invalid cacheTime, using default value.');
        cacheTime = DEFAULT_CACHE_TIME;
      }

      if (typeof staleTime !== 'number' || staleTime < 0) {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Invalid staleTime, using default value.');
        staleTime = DEFAULT_STALE_TIME;
      }

      this.cache.set(key, { value, timestamp, cacheTime, staleTime });
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.DEBUG, `[CacheManager] Item set for key "${key}"`, {
        value,
        timestamp,
        cacheTime,
        staleTime,
      });

      if (this.subscribers.has(key)) {
        this.subscribers.get(key).forEach((callback) => {
          try {
            callback(value);
          } catch (error) {
            coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, `Error notifying subscriber for key "${key}":`, error.message, error.stack);
          }
        });
      }
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, `Error setting item for key "${key}":`, error.message, error.stack);
      throw error; // Re-throw para que o chamador possa lidar com o erro
    }
  }

  getItem(key) {
    try {
      if (!key) {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.DEBUG, 'Key is null or undefined');
        return null;
      }

      const item = this.cache.get(key);
      if (!item) {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.DEBUG, `Item not found for key "${key}"`);
        return null;
      }

      const { value, timestamp, cacheTime } = item;
      if (Date.now() - timestamp > cacheTime) {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.DEBUG, `Item for key "${key}" expired and removed`);
        this.cache.delete(key);
        return null;
      }
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.DEBUG, `Item retrieved for key "${key}"`, {
        value,
        timestamp,
      });
      return value;
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, `Error getting item for key "${key}":`, error.message, error.stack);
      return null;
    }
  }

  isStale(key) {
    try {
      if (!key) {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.DEBUG, 'Key is null or undefined');
        return true;
      }

      const item = this.cache.get(key);
      if (!item) {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.DEBUG, `Item not found for key "${key}"`);
        return true;
      }

      const isStale = Date.now() - item.timestamp > item.staleTime;
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.DEBUG, `Item for key "${key}" is ${isStale ? 'stale' : 'fresh'}`);
      return isStale;
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, `Error checking staleness for key "${key}":`, error.message, error.stack);
      return true; // Assume stale em caso de erro
    }
  }

  subscribe(key, callback) {
    try {
      if (!key || typeof callback !== 'function') {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.WARN, 'Invalid subscription parameters', { key, callback });
        throw new Error('Invalid subscription parameters');
      }

      if (!this.subscribers.has(key)) {
        this.subscribers.set(key, new Set());
      }

      this.subscribers.get(key).add(callback);
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.DEBUG, `Subscriber added for key "${key}"`);

      return () => {
        const subscribers = this.subscribers.get(key);
        if (subscribers) {
          subscribers.delete(callback);
          if (subscribers.size === 0) {
            this.subscribers.delete(key);
          }
          coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.DEBUG, `Subscriber removed for key "${key}"`);
        }
      };
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, `Error subscribing to key "${key}":`, error.message, error.stack);
      throw error; // Re-throw para que o chamador possa lidar com o erro
    }
  }

  invalidate(key) {
    try {
      if (!key) {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.WARN, 'Cannot invalidate null or undefined key');
        throw new Error('Key is null or undefined');
      }

      this.cache.delete(key);
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.DEBUG, `Item invalidated for key "${key}"`);
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, `Error invalidating key "${key}":`, error.message, error.stack);
      throw error; // Re-throw para que o chamador possa lidar com o erro
    }
  }

  clear() {
    try {
      this.cache.clear();
      this.subscribers.clear();
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Cache and subscribers cleared');
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Error clearing cache:', error.message, error.stack);
      throw error; // Re-throw para que o chamador possa lidar com o erro
    }
  }
}

export const globalCache = new CacheManager();

export function useCachedResource(key, fetchFn, options = {}) {
  const [data, setData] = useState(() => globalCache.getItem(key));
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(null);

  // Memoize options to prevent unnecessary re-fetching
  const stableOptions = useMemo(() => JSON.stringify(options), [options]);

  // Memoize fetch function
  const fetch = useCallback(
    async (force = false) => {
      if (!key || !fetchFn) {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.WARN, '[useCachedResource] Invalid key or fetch function');
        return;
      }
      // Check if we need to fetch
      if (!force && data && !globalCache.isStale(key)) {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.DEBUG, `[useCachedResource] Data for key "${key}" is fresh, skipping fetch`);
        return;
      }

      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.DEBUG, `[useCachedResource] Fetching data for key "${key}"`);
      const startTime = performance.now(); // Medição de tempo
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn();

        if (result !== undefined && result !== null) {
          globalCache.setItem(key, result, options);
          setData(result);
          coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.DEBUG, `[useCachedResource] Data fetched and cached for key "${key}"`, result);
        }
      } catch (err) {
        setError(err);
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, `[useCachedResource] Error fetching key "${key}":`, err.message, err.stack);
      } finally {
        setLoading(false);
        const endTime = performance.now();
        const fetchTime = endTime - startTime;
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.DEBUG, `[useCachedResource] Fetch time for key "${key}": ${fetchTime.toFixed(2)}ms`); // Finalização da medição de tempo
      }
    },
    [key, fetchFn, stableOptions]
  );

  useEffect(() => {
    if (!key) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.WARN, '[useCachedResource] Key is null or undefined');
      return;
    }

    const unsubscribe = globalCache.subscribe(key, setData);

    if (!data || globalCache.isStale(key)) {
      fetch().catch((err) => {
        coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, `[useCachedResource] Error in initial fetch for key "${key}":`, err.message, err.stack);
      });
    }

    return () => {
      unsubscribe();
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.DEBUG, `[useCachedResource] Unsubscribed from key "${key}"`);
    };
  }, [key, fetch]);

  return {
    data,
    loading,
    error,
    refetch: () => fetch(true),
    invalidate: () => globalCache.invalidate(key),
  };
}