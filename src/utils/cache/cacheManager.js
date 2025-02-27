import { useState, useEffect, useCallback, useMemo } from 'react';

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
    console.info('[CacheManager] CacheManager initialized'); // Log de info
  }

  setItem(key, value, options = {}) {
    try {
      if (!key) {
        console.warn('[CacheManager] Cannot set cache item with null or undefined key'); // Log de warn
        throw new Error('Key is null or undefined');
      }

      if (value === undefined || value === null) {
        console.warn('[CacheManager] Cannot set cache item with null or undefined value'); // Log de warn
        throw new Error('Value is null or undefined');
      }

      const timestamp = Date.now();
      const cacheTime = options.cacheTime || DEFAULT_CACHE_TIME;
      const staleTime = options.staleTime || DEFAULT_STALE_TIME;

      if (typeof cacheTime !== 'number' || cacheTime < 0) {
        console.warn('[CacheManager] Invalid cacheTime, using default value'); // Log de warn
        cacheTime = DEFAULT_CACHE_TIME;
      }

      if (typeof staleTime !== 'number' || staleTime < 0) {
        console.warn('[CacheManager] Invalid staleTime, using default value'); // Log de warn
        staleTime = DEFAULT_STALE_TIME;
      }

      this.cache.set(key, { value, timestamp, cacheTime, staleTime });
      console.debug(`[CacheManager] Item set for key "${key}"`, { value, timestamp, cacheTime, staleTime }); // Log de debug

      if (this.subscribers.has(key)) {
        this.subscribers.get(key).forEach((callback) => {
          try {
            callback(value);
          } catch (error) {
            console.error(`[CacheManager] Error notifying subscriber for key "${key}":`, error.message, error.stack); // Log de erro
          }
        });
      }
    } catch (error) {
      console.error(`[CacheManager] Error setting item for key "${key}":`, error.message, error.stack); // Log de erro
      throw error; // Re-throw para que o chamador possa lidar com o erro
    }
  }

  getItem(key) {
    try {
      if (!key) {
        console.debug('[CacheManager] Key is null or undefined'); // Log de debug
        return null;
      }

      const item = this.cache.get(key);
      if (!item) {
        console.debug(`[CacheManager] Item not found for key "${key}"`); // Log de debug
        return null;
      }

      const { value, timestamp, cacheTime } = item;
      if (Date.now() - timestamp > cacheTime) {
        console.debug(`[CacheManager] Item for key "${key}" expired and removed`); // Log de debug
        this.cache.delete(key);
        return null;
      }

      console.debug(`[CacheManager] Item retrieved for key "${key}"`, { value, timestamp }); // Log de debug
      return value;
    } catch (error) {
      console.error(`[CacheManager] Error getting item for key "${key}":`, error.message, error.stack); // Log de erro
      return null;
    }
  }

  isStale(key) {
    try {
      if (!key) {
        console.debug('[CacheManager] Key is null or undefined'); // Log de debug
        return true;
      }

      const item = this.cache.get(key);
      if (!item) {
        console.debug(`[CacheManager] Item not found for key "${key}"`); // Log de debug
        return true;
      }

      const isStale = Date.now() - item.timestamp > item.staleTime;
      console.debug(`[CacheManager] Item for key "${key}" is ${isStale ? 'stale' : 'fresh'}`); // Log de debug
      return isStale;
    } catch (error) {
      console.error(`[CacheManager] Error checking staleness for key "${key}":`, error.message, error.stack); // Log de erro
      return true; // Assume stale em caso de erro
    }
  }

  subscribe(key, callback) {
    try {
      if (!key || typeof callback !== 'function') {
        console.warn('[CacheManager] Invalid subscription parameters', { key, callback }); // Log de warn
        throw new Error('Invalid subscription parameters');
      }

      if (!this.subscribers.has(key)) {
        this.subscribers.set(key, new Set());
      }

      this.subscribers.get(key).add(callback);
      console.debug(`[CacheManager] Subscriber added for key "${key}"`); // Log de debug

      return () => {
        const subscribers = this.subscribers.get(key);
        if (subscribers) {
          subscribers.delete(callback);
          if (subscribers.size === 0) {
            this.subscribers.delete(key);
          }
          console.debug(`[CacheManager] Subscriber removed for key "${key}"`); // Log de debug
        }
      };
    } catch (error) {
      console.error(`[CacheManager] Error subscribing to key "${key}":`, error.message, error.stack); // Log de erro
      throw error; // Re-throw para que o chamador possa lidar com o erro
    }
  }

  invalidate(key) {
    try {
      if (!key) {
        console.warn('[CacheManager] Cannot invalidate null or undefined key'); // Log de warn
        throw new Error('Key is null or undefined');
      }

      this.cache.delete(key);
      console.debug(`[CacheManager] Item invalidated for key "${key}"`); // Log de debug
    } catch (error) {
      console.error(`[CacheManager] Error invalidating key "${key}":`, error.message, error.stack); // Log de erro
      throw error; // Re-throw para que o chamador possa lidar com o erro
    }
  }

  clear() {
    try {
      this.cache.clear();
      this.subscribers.clear();
      console.info('[CacheManager] Cache and subscribers cleared'); // Log de info
    } catch (error) {
      console.error('[CacheManager] Error clearing cache:', error.message, error.stack); // Log de erro
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
        console.warn('[useCachedResource] Invalid key or fetch function'); // Log de warn
        return;
      }

      // Check if we need to fetch
      if (!force && data && !globalCache.isStale(key)) {
        console.debug(`[useCachedResource] Data for key "${key}" is fresh, skipping fetch`); // Log de debug
        return;
      }

      console.time(`[useCachedResource] Fetch time for key "${key}"`); // Medição de tempo
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn();

        if (result !== undefined && result !== null) {
          globalCache.setItem(key, result, options);
          setData(result);
          console.debug(`[useCachedResource] Data fetched and cached for key "${key}"`, result); // Log de debug
        }
      } catch (err) {
        setError(err);
        console.error(`[useCachedResource] Error fetching key "${key}":`, err.message, err.stack); // Log de erro
      } finally {
        setLoading(false);
        console.timeEnd(`[useCachedResource] Fetch time for key "${key}"`); // Finalização da medição de tempo
      }
    },
    [key, fetchFn, stableOptions]
  );

  useEffect(() => {
    if (!key) {
      console.warn('[useCachedResource] Key is null or undefined'); // Log de warn
      return;
    }

    const unsubscribe = globalCache.subscribe(key, setData);

    if (!data || globalCache.isStale(key)) {
      fetch().catch((err) => {
        console.error(`[useCachedResource] Error in initial fetch for key "${key}":`, err.message, err.stack); // Log de erro
      });
    }

    return () => {
      unsubscribe();
      console.debug(`[useCachedResource] Unsubscribed from key "${key}"`); // Log de debug
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