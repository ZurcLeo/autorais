// // src/context/PaymentContext.js
// import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
// import { useAuth } from './AuthContext';
// import paymentService from '../services/paymentService';
// import { showToast, showPromiseToast } from '../utils/toastUtils';
// import { useCachedResource, globalCache } from '../utils/cache/cacheManager';
// import { formatDocument } from '../utils/formatters';

// // Configuration constants for the payment context
// const PAYMENT_CONFIG = {
//   STORAGE_KEY: 'pix_payment_data',
//   CACHE_KEY: 'payment:sessions',
//   CACHE_TIME: 30 * 60 * 1000, // 30 minutes
//   STALE_TIME: 5 * 60 * 1000,  // 5 minutes
//   STATUS_CHECK_INTERVAL: 5000, // 5 seconds
//   PAYMENT_EXPIRY_TIME: 30 * 60 * 1000, // 30 minutes
//   MAX_RETRIES: 3
// };

// // Payment status enumeration
// const PAYMENT_STATUS = {
//   PENDING: 'pending',
//   PROCESSING: 'processing',
//   SUCCEEDED: 'succeeded',
//   FAILED: 'failed',
//   EXPIRED: 'expired',
//   CANCELED: 'canceled'
// };

// const PaymentContext = createContext();

// // Storage utility functions with error handling
// const storageUtils = {
//   save: (data) => {
//     try {
//       localStorage.setItem(PAYMENT_CONFIG.STORAGE_KEY, JSON.stringify(data));
//     } catch (error) {
//       console.error('Error saving payment data to storage:', error);
//     }
//   },

//   load: () => {
//     try {
//       const data = localStorage.getItem(PAYMENT_CONFIG.STORAGE_KEY);
//       return data ? JSON.parse(data) : null;
//     } catch (error) {
//       console.error('Error loading payment data from storage:', error);
//       return null;
//     }
//   },

//   clear: () => {
//     try {
//       localStorage.removeItem(PAYMENT_CONFIG.STORAGE_KEY);
//     } catch (error) {
//       console.error('Error clearing payment data from storage:', error);
//     }
//   }
// };

// export const PaymentProvider = ({ children }) => {
//   const { currentUser } = useAuth();
//   const userId = currentUser?.uid;

//   // State management with detailed payment information
//   const [state, setState] = useState({
//     paymentData: null,
//     timeLeft: null,
//     loading: false,
//     error: null,
//     retryCount: 0,
//     lastUpdated: null
//   });

//   // Cache key for current user's payment sessions
//   const cacheKey = useMemo(() => 
//     userId ? `${PAYMENT_CONFIG.CACHE_KEY}:${userId}` : null
//   , [userId]);

//   // Clear expired payment data on mount and state changes
//   useEffect(() => {
//     const checkExpiry = () => {
//       if (state.paymentData?.expiresAt) {
//         const expiresAt = new Date(state.paymentData.expiresAt).getTime();
//         const now = Date.now();
        
//         if (now >= expiresAt) {
//           clearPaymentData();
//         } else {
//           setTimeLeft(Math.floor((expiresAt - now) / 1000));
//         }
//       }
//     };

//     checkExpiry();
//     const interval = setInterval(checkExpiry, 1000);
//     return () => clearInterval(interval);
//   }, [state.paymentData]);

//   // Clear payment data and related state
//   const clearPaymentData = useCallback(() => {
//     setState(prev => ({
//       ...prev,
//       paymentData: null,
//       timeLeft: null,
//       error: null,
//       retryCount: 0,
//       lastUpdated: null
//     }));
//     storageUtils.clear();
//   }, []);

//   // Transform raw payment data into consistent format
//   const transformPaymentData = useCallback((rawData) => {
//     return {
//       id: rawData.id,
//       qrCode: rawData.qr_code,
//       qrCodeBase64: rawData.qr_code_base64,
//       ticketUrl: rawData.ticket_url,
//       status: rawData.status,
//       amount: rawData.amount,
//       currency: rawData.currency || 'BRL',
//       expiresAt: rawData.expires_at,
//       createdAt: rawData.created_at || new Date().toISOString(),
//       metadata: rawData.metadata || {}
//     };
//   }, []);

//   // Set remaining time for payment
//   const setTimeLeft = useCallback((seconds) => {
//     setState(prev => ({
//       ...prev,
//       timeLeft: Math.max(0, seconds)
//     }));
//   }, []);

//   // Validate payment data before submission
//   const validatePaymentData = useCallback((data) => {
//     const { amount, email, identificationType, identificationNumber } = data;
    
//     if (!amount || amount <= 0) {
//       throw new Error('Valor inválido para pagamento');
//     }

//     if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       throw new Error('Email inválido');
//     }

//     if (!identificationType || !['cpf', 'cnpj'].includes(identificationType)) {
//       throw new Error('Tipo de identificação inválido');
//     }

//     const cleanId = identificationNumber.replace(/\D/g, '');
//     if (!cleanId) {
//       throw new Error('Número de identificação inválido');
//     }

//     return {
//       ...data,
//       identificationNumber: cleanId
//     };
//   }, []);

//   // Initialize a new PIX payment
//   const startPixPayment = useCallback(async (paymentData) => {
//     setState(prev => ({ ...prev, loading: true, error: null }));

//     return showPromiseToast(
//       (async () => {
//         try {
//           const validatedData = validatePaymentData(paymentData);
          
//           const response = await paymentService.createPixPayment(validatedData);
//           const transformedData = transformPaymentData(response);
          
//           setState(prev => ({
//             ...prev,
//             paymentData: transformedData,
//             loading: false,
//             lastUpdated: new Date().toISOString()
//           }));

//           storageUtils.save(transformedData);

//           const expiresAt = new Date(transformedData.expiresAt).getTime();
//           setTimeLeft(Math.floor((expiresAt - Date.now()) / 1000));

//           return transformedData;
//         } catch (error) {
//           console.error('Payment initialization error:', error);
//           setState(prev => ({
//             ...prev,
//             error: error.message,
//             loading: false
//           }));
//           throw error;
//         }
//       })(),
//       {
//         loading: 'Iniciando pagamento...',
//         success: 'Pagamento iniciado com sucesso!',
//         error: 'Erro ao iniciar pagamento'
//       }
//     );
//   }, [validatePaymentData, transformPaymentData, setTimeLeft]);

//   // Monitor payment status with exponential backoff
//   const monitorPaymentStatus = useCallback((paymentId, onSuccess, onCancel) => {
//     let isCompleted = false;
//     let checkCount = 0;
//     let interval = PAYMENT_CONFIG.STATUS_CHECK_INTERVAL;

//     const checkStatus = async () => {
//       if (isCompleted || checkCount >= PAYMENT_CONFIG.MAX_RETRIES) {
//         return;
//       }

//       try {
//         const status = await paymentService.getPixPaymentStatus(paymentId);
//         checkCount++;

//         // Update state with new status
//         setState(prev => ({
//           ...prev,
//           paymentData: prev.paymentData ? {
//             ...prev.paymentData,
//             status
//           } : null,
//           lastUpdated: new Date().toISOString()
//         }));

//         // Handle different status cases
//         switch (status) {
//           case PAYMENT_STATUS.SUCCEEDED:
//             isCompleted = true;
//             onSuccess?.();
//             showToast('Pagamento realizado com sucesso!', { type: 'success' });
//             break;
          
//           case PAYMENT_STATUS.CANCELED:
//             isCompleted = true;
//             onCancel?.();
//             clearPaymentData();
//             showToast('Pagamento cancelado', { type: 'warning' });
//             break;
          
//           case PAYMENT_STATUS.FAILED:
//             isCompleted = true;
//             clearPaymentData();
//             showToast('Falha no pagamento', { type: 'error' });
//             break;
          
//           case PAYMENT_STATUS.EXPIRED:
//             isCompleted = true;
//             clearPaymentData();
//             showToast('Pagamento expirado', { type: 'warning' });
//             break;
          
//           default:
//             // Implement exponential backoff for pending/processing status
//             interval = Math.min(interval * 1.5, 30000); // Max 30 seconds
//             setTimeout(checkStatus, interval);
//         }
//       } catch (error) {
//         console.error('Error checking payment status:', error);
//         interval = Math.min(interval * 2, 60000); // Max 1 minute on error
//         setTimeout(checkStatus, interval);
//       }
//     };

//     checkStatus();
//     return () => {
//       isCompleted = true;
//     };
//   }, [clearPaymentData]);

//   // Countdown timer with callback
//   const startCountdown = useCallback((expiresAt, onExpire) => {
//     const intervalId = setInterval(() => {
//       const now = Date.now();
//       const expiryTime = new Date(expiresAt).getTime();
//       const remainingSeconds = Math.floor((expiryTime - now) / 1000);

//       if (remainingSeconds <= 0) {
//         clearInterval(intervalId);
//         setTimeLeft(0);
//         onExpire?.();
//         clearPaymentData();
//       } else {
//         setTimeLeft(remainingSeconds);
//       }
//     }, 1000);

//     return () => clearInterval(intervalId);
//   }, [setTimeLeft, clearPaymentData]);

//   // Format time left for display
//   const formattedTimeLeft = useMemo(() => {
//     if (!state.timeLeft) return '';
    
//     const minutes = Math.floor(state.timeLeft / 60);
//     const seconds = state.timeLeft % 60;
//     return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//   }, [state.timeLeft]);

//   // Context value
//   const value = useMemo(() => ({
//     paymentData: state.paymentData,
//     loading: state.loading,
//     error: state.error,
//     timeLeft: state.timeLeft,
//     formattedTimeLeft,
//     startPixPayment,
//     monitorPaymentStatus,
//     startCountdown,
//     clearPaymentData
//   }), [
//     state,
//     formattedTimeLeft,
//     startPixPayment,
//     monitorPaymentStatus,
//     startCountdown,
//     clearPaymentData
//   ]);

//   return (
//     <PaymentContext.Provider value={value}>
//       {children}
//     </PaymentContext.Provider>
//   );
// };

// // Custom hook for using the payment context
// export const usePayment = () => {
//   const context = useContext(PaymentContext);
//   if (context === undefined) {
//     throw new Error('usePayment must be used within a PaymentProvider');
//   }
//   return context;
// };