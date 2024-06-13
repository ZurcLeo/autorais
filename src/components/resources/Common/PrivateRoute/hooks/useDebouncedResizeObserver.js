import { useEffect } from 'react';
import debounce from 'lodash.debounce';

function useDebouncedResizeObserver(callback, delay = 100) {
  const debouncedCallback = debounce(callback, delay);

  useEffect(() => {
    const observer = new ResizeObserver(debouncedCallback);
    observer.observe(document.body);

    return () => {
      observer.disconnect();
      debouncedCallback.cancel();
    };
  }, [debouncedCallback]);

  return null; // This hook does not need to return anything
}

export default useDebouncedResizeObserver;
