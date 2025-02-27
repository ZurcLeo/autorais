// src/context/ToastContext.js
import React, { createContext, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import CustomToast from '../../components/Common/CustomToast';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const showToast = useCallback((message, options = {}) => {
    return toast(
      ({ closeToast }) => (
        <CustomToast
          closeToast={closeToast}
          toastProps={{ message, ...options }}
        />
      ),
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        ...options,
      }
    );
  }, []);

  const showPromiseToast = useCallback((promise, messages) => {
    const id = showToast(messages.loading || "Processando...", { 
      isLoading: true,
      autoClose: false
    });

    promise
      .then(() => {
        toast.update(id, {
          render: messages.success,
          type: "success",
          isLoading: false,
          autoClose: 5000
        });
      })
      .catch((error) => {
        toast.update(id, {
          render: messages.error || error.message,
          type: "error",
          isLoading: false,
          autoClose: 5000
        });
      });

    return id;
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showPromiseToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};