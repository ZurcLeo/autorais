// providers/features/BankingContext/index.js
import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { serviceLocator } from '../../core/services/BaseService';
import { showToast, showPromiseToast } from '../../utils/toastUtils';
import { useCachedResource, globalCache } from '../../utils/cache/cacheManager';
import { validateDocument } from '../../utils/validation';

const BankingContext = createContext();

const MODULE_NAME = 'BankingProvider';

// Constants
const BANKING_CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const BANKING_STALE_TIME = 30 * 1000; // 30 seconds
const HISTORY_CACHE_TIME = 15 * 60 * 1000; // 15 minutes
const HISTORY_STALE_TIME = 60 * 1000; // 1 minute

export const BankingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedCaixinha, setSelectedCaixinha] = useState(null);

  // Cache keys
  const getBankingInfoCacheKey = useCallback((caixinhaId) =>
    caixinhaId ? `banking:info:${caixinhaId}` : null
    , []);

  const getBankingHistoryCacheKey = useCallback((caixinhaId) =>
    caixinhaId ? `banking:history:${caixinhaId}` : null
    , []);

  // Banking Info Cache Resource
  const useBankingInfoResource = (caixinhaId) => {
    const fetchBankingInfo = useCallback(async () => {
      if (!caixinhaId) return null;
      try {
        const bankingService = serviceLocator.get('banking');
        const info = await bankingService.getBankingInfo(caixinhaId);
        return info;
      } catch (error) {
        console.error('Error fetching banking info:', error);
        throw error;
      }
    }, [caixinhaId]);

    return useCachedResource(
      getBankingInfoCacheKey(caixinhaId),
      fetchBankingInfo,
      {
        cacheTime: BANKING_CACHE_TIME,
        staleTime: BANKING_STALE_TIME,
        onError: (error) => {
          showToast('Error loading banking information', { type: 'error' });
        }
      }
    );
  };

  // Banking History Cache Resource
  const useBankingHistoryResource = (caixinhaId) => {
    const fetchBankingHistory = useCallback(async () => {
      if (!caixinhaId) return null;
      try {
        const bankingService = serviceLocator.get('banking');
        const history = await bankingService.getBankingHistory(caixinhaId);
        return history.history;
      } catch (error) {
        console.error('Error fetching banking history:', error);
        throw error;
      }
    }, [caixinhaId]);

    return useCachedResource(
      getBankingHistoryCacheKey(caixinhaId),
      fetchBankingHistory,
      {
        cacheTime: HISTORY_CACHE_TIME,
        staleTime: HISTORY_STALE_TIME,
        onError: (error) => {
          showToast('Error loading banking history', { type: 'error' });
        }
      }
    );
  };

  // Use the resources
  const {
    data: bankingInfo,
    loading: bankingInfoLoading,
    error: bankingInfoError,
    refetch: refetchBankingInfo,
    invalidate: invalidateBankingInfo
  } = useBankingInfoResource(selectedCaixinha);

  const {
    data: bankingHistory,
    loading: bankingHistoryLoading,
    error: bankingHistoryError,
    refetch: refetchBankingHistory,
    invalidate: invalidateBankingHistory
  } = useBankingHistoryResource(selectedCaixinha);

  // Select Caixinha
  const selectCaixinha = useCallback((caixinhaId) => {
    setSelectedCaixinha(caixinhaId);
  }, []);

  // Helper functions to invalidate specific cache keys
  const invalidateSpecificBankingInfo = useCallback((caixinhaId) => {
    if (!caixinhaId) return;
    const key = getBankingInfoCacheKey(caixinhaId);
    if (key) {
      globalCache.invalidate(key);
    }
  }, [getBankingInfoCacheKey]);

  const invalidateSpecificBankingHistory = useCallback((caixinhaId) => {
    if (!caixinhaId) return;
    const key = getBankingHistoryCacheKey(caixinhaId);
    if (key) {
      globalCache.invalidate(key);
    }
  }, [getBankingHistoryCacheKey]);

  // Register bank account
  const registerBankAccount = useCallback(async (caixinhaId, accountData) => {
    if (!caixinhaId || !accountData) {
      showToast('Invalid account data', { type: 'error' });
      return;
    }

    // Validate account data if document fields are provided
    if (accountData.documentType && accountData.documentNumber) {
      const isValidDocument = validateDocument(
        accountData.documentType,
        accountData.documentNumber
      );
      if (!isValidDocument) {
        showToast('Invalid document number', { type: 'error' });
        return;
      }
    }

    try {
      setLoading(true);

      const bankingService = serviceLocator.get('banking');
      const response = await bankingService.registerBankAccount(caixinhaId, accountData);

      // Invalidate caches for the specific caixinha
      invalidateSpecificBankingInfo(caixinhaId);
      invalidateSpecificBankingHistory(caixinhaId);
      
      // Also invalidate current selected caixinha cache if it's the same
      if (selectedCaixinha === caixinhaId) {
        invalidateBankingInfo();
        invalidateBankingHistory();
        
        await Promise.all([
          refetchBankingInfo(),
          refetchBankingHistory()
        ]);
      }

      showToast('Bank account registered successfully', { type: 'success' });
      return response;
    } catch (error) {
      console.error('Error registering bank account:', error);
      setError(error.message);
      showToast(error.message || 'Failed to register bank account', { type: 'error' });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [
    invalidateSpecificBankingInfo, 
    invalidateSpecificBankingHistory, 
    selectedCaixinha,
    invalidateBankingInfo,
    invalidateBankingHistory,
    refetchBankingInfo,
    refetchBankingHistory
  ]);

  // Generate PIX for validation
  const generateValidationPix = useCallback(async (accountId, paymentData = {}) => {
    if (!accountId) {
      showToast('Account ID is required', { type: 'error' });
      return;
    }

    try {
      setLoading(true);

      const bankingService = serviceLocator.get('banking');
      const response = await bankingService.generateValidationPix(accountId, paymentData);

      return response;
    } catch (error) {
      console.error('Error generating validation PIX:', error);
      setError(error.message);
      showToast(error.message || 'Failed to generate validation PIX', { type: 'error' });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Validate bank account
  const validateBankAccount = useCallback(async (transactionData) => {
    if (!transactionData || !transactionData.accountId || !transactionData.transactionId) {
      showToast('Invalid transaction data', { type: 'error' });
      return;
    }

    try {
      setLoading(true);

      const bankingService = serviceLocator.get('banking');
      const response = await bankingService.validateBankAccount(transactionData);

      // Invalidate caches for the specific caixinha
      if (transactionData.caixinhaId) {
        const caixinhaId = transactionData.caixinhaId;
        invalidateSpecificBankingInfo(caixinhaId);
        invalidateSpecificBankingHistory(caixinhaId);
        
        // Also invalidate current selected caixinha cache if it's the same
        if (selectedCaixinha === caixinhaId) {
          invalidateBankingInfo();
          invalidateBankingHistory();
          
          await Promise.all([
            refetchBankingInfo(),
            refetchBankingHistory()
          ]);
        }
      }

      showToast('Bank account validated successfully', { type: 'success' });
      return response;
    } catch (error) {
      console.error('Error validating bank account:', error);
      setError(error.message);
      showToast(error.message || 'Failed to validate bank account', { type: 'error' });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [
    invalidateSpecificBankingInfo,
    invalidateSpecificBankingHistory,
    selectedCaixinha,
    invalidateBankingInfo,
    invalidateBankingHistory,
    refetchBankingInfo,
    refetchBankingHistory
  ]);

  // Get transaction details
  const getTransactionDetails = useCallback(async (transactionId) => {
    if (!transactionId) {
      showToast('Invalid transaction ID', { type: 'error' });
      return;
    }

    try {
      setLoading(true);

      const bankingService = serviceLocator.get('banking');
      const details = await bankingService.getTransactionDetails(transactionId);
      return details;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      setError(error.message);
      // reject(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Transfer funds
  const transferFunds = useCallback(async (transferData) => {
    if (!transferData || !transferData.caixinhaId || !transferData.amount) {
      showToast('Invalid transfer data', { type: 'error' });
      return;
    }

    try {
      setLoading(true);

      const bankingService = serviceLocator.get('banking');
      const response = await bankingService.transferFunds(transferData);

      // Invalidate caches for the specific caixinha
      const caixinhaId = transferData.caixinhaId;
      invalidateSpecificBankingInfo(caixinhaId);
      invalidateSpecificBankingHistory(caixinhaId);
      
      // Also invalidate current selected caixinha cache if it's the same
      if (selectedCaixinha === caixinhaId) {
        invalidateBankingInfo();
        invalidateBankingHistory();
        
        await Promise.all([
          refetchBankingInfo(),
          refetchBankingHistory()
        ]);
      }

      return response;
    } catch (error) {
      console.error('Error transferring funds:', error);
      setError(error.message);
      // reject(error);
    } finally {
      setLoading(false);
    }
  }, [
    invalidateSpecificBankingInfo,
    invalidateSpecificBankingHistory,
    selectedCaixinha,
    invalidateBankingInfo,
    invalidateBankingHistory,
    refetchBankingInfo,
    refetchBankingHistory
  ]);

  // Cancel transaction
  const cancelTransaction = useCallback(async (transactionId) => {
    if (!transactionId) {
      showToast('Invalid transaction ID', { type: 'error' });
      return;
    }

    try {
      setLoading(true);

      const bankingService = serviceLocator.get('banking');
      const response = await bankingService.cancelTransaction(transactionId);

      // If the result includes the caixinha ID, invalidate specific cache
      if (response.caixinhaId) {
        invalidateSpecificBankingInfo(response.caixinhaId);
        invalidateSpecificBankingHistory(response.caixinhaId);
        
        // Also invalidate current selected caixinha cache if it's the same
        if (selectedCaixinha === response.caixinhaId) {
          invalidateBankingInfo();
          invalidateBankingHistory();
          
          await Promise.all([
            refetchBankingInfo(),
            refetchBankingHistory()
          ]);
        }
      }

      return response;
    } catch (error) {
      console.error('Error canceling transaction:', error);
      setError(error.message);
      // reject(error);
    } finally {
      setLoading(false);
    }
  }, [
    invalidateSpecificBankingInfo,
    invalidateSpecificBankingHistory,
    selectedCaixinha,
    invalidateBankingInfo,
    invalidateBankingHistory,
    refetchBankingInfo,
    refetchBankingHistory
  ]);

  // Process card payment
  const processCardPayment = useCallback(async (paymentData) => {
    if (!paymentData || !paymentData.token) {
      showToast('Invalid payment data or card token', { type: 'error' });
      return;
    }

    try {
      setLoading(true);

      const bankingService = serviceLocator.get('banking');
      const response = await bankingService.processCardPayment(paymentData);

      showToast('Payment processed successfully', { type: 'success' });
      return response;
    } catch (error) {
      console.error('Error processing card payment:', error);
      setError(error.message);
      showToast(error.message || 'Failed to process payment', { type: 'error' });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context value
  const value = useMemo(() => ({
    bankingInfo,
    bankingHistory,
    loading: loading || bankingInfoLoading || bankingHistoryLoading,
    error: error || bankingInfoError || bankingHistoryError,
    isModalOpen,
    setModalOpen,
    selectedCaixinha,
    selectCaixinha,
    registerBankAccount,
    generateValidationPix,
    validateBankAccount,
    getTransactionDetails,
    transferFunds,
    cancelTransaction,
    processCardPayment,
    refetchBankingInfo,
    refetchBankingHistory,
    clearError
  }), [
    bankingInfo,
    bankingHistory,
    loading,
    bankingInfoLoading,
    bankingHistoryLoading,
    error,
    bankingInfoError,
    bankingHistoryError,
    isModalOpen,
    selectedCaixinha,
    selectCaixinha,
    registerBankAccount,
    generateValidationPix,
    validateBankAccount,
    getTransactionDetails,
    transferFunds,
    cancelTransaction,
    processCardPayment,
    refetchBankingInfo,
    refetchBankingHistory,
    clearError
  ]);

  return (
    <BankingContext.Provider value={value}>
      {children}
    </BankingContext.Provider>
  );
};

export const useBanking = () => {
  const context = useContext(BankingContext);
  if (context === undefined) {
    throw new Error('useBanking must be used within BankingContext');
  }
  return context;
};