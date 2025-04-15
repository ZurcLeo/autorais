// useToast.js
import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toastProps, setToastProps] = useState(null);

  const showToast = useCallback((props) => {
    setToastProps(props);
  }, []);

  const closeToast = useCallback(() => {
    setToastProps(null);
  }, []);

  return {
    toastProps,
    showToast,
    closeToast,
  };
};