// providers/features/BankingProvider/index.js
import React, { useState, useCallback, useMemo } from 'react';
import bankingService from '../../services/bankingService';
import { showToast, showPromiseToast } from '../../utils/toastUtils';
import { useCachedResource } from '../../utils/cache/cacheManager';
import { validateDocument } from '../../utils/validation';

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

  // Register bank account
  const registerBankAccount = useCallback(async (caixinhaId, accountData) => {
    if (!caixinhaId || !accountData) {
      showToast('Invalid account data', { type: 'error' });
      return;
    }

    // Validate account data
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

    return showPromiseToast(
      new Promise(async (resolve, reject) => {
        try {
          setLoading(true);

          const response = await bankingService.registerBankAccount(caixinhaId, accountData);

          // Invalidate caches
          invalidateBankingInfo();
          await refetchBankingInfo();

          resolve(response);
        } catch (error) {
          console.error('Error registering bank account:', error);
          setError(error.message);
          reject(error);
        } finally {
          setLoading(false);
        }
      }),
      {
        loading: 'Registering bank account...',
        success: 'Bank account registered successfully!',
        error: (error) => `Failed to register bank account: ${error.message}`
      }
    );
  }, [invalidateBankingInfo, refetchBankingInfo]);

  // Validate bank account
  const validateBankAccount = useCallback(async (transactionData) => {
    if (!transactionData || !transactionData.caixinhaId) {
      showToast('Invalid transaction data', { type: 'error' });
      return;
    }

    return showPromiseToast(
      new Promise(async (resolve, reject) => {
        try {
          setLoading(true);

          const response = await bankingService.validateBankAccount(transactionData);

          // Invalidate and refetch both info and history
          invalidateBankingInfo();
          invalidateBankingHistory();

          await Promise.all([
            refetchBankingInfo(),
            refetchBankingHistory()
          ]);

          resolve(response);
        } catch (error) {
          console.error('Error validating bank account:', error);
          setError(error.message);
          reject(error);
        } finally {
          setLoading(false);
        }
      }),
      {
        loading: 'Validating bank account...',
        success: 'Bank account validated successfully!',
        error: (error) => `Failed to validate bank account: ${error.message}`
      }
    );
  }, [
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

    return showPromiseToast(
      new Promise(async (resolve, reject) => {
        try {
          setLoading(true);
          const details = await bankingService.getTransactionDetails(transactionId);
          resolve(details);
        } catch (error) {
          console.error('Error fetching transaction details:', error);
          setError(error.message);
          reject(error);
        } finally {
          setLoading(false);
        }
      }),
      {
        loading: 'Loading transaction details...',
        success: 'Transaction details loaded',
        error: (error) => `Failed to load transaction details: ${error.message}`
      }
    );
  }, []);

  // Transfer funds
  const transferFunds = useCallback(async (transferData) => {
    if (!transferData || !transferData.caixinhaId || !transferData.amount) {
      showToast('Invalid transfer data', { type: 'error' });
      return;
    }

    return showPromiseToast(
      new Promise(async (resolve, reject) => {
        try {
          setLoading(true);

          const response = await bankingService.transferFunds(transferData);

          // Invalidate and refetch both info and history
          invalidateBankingInfo();
          invalidateBankingHistory();

          await Promise.all([
            refetchBankingInfo(),
            refetchBankingHistory()
          ]);

          resolve(response);
        } catch (error) {
          console.error('Error transferring funds:', error);
          setError(error.message);
          reject(error);
        } finally {
          setLoading(false);
        }
      }),
      {
        loading: 'Processing transfer...',
        success: 'Funds transferred successfully!',
        error: (error) => `Failed to transfer funds: ${error.message}`
      }
    );
  }, [
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

    return showPromiseToast(
      new Promise(async (resolve, reject) => {
        try {
          setLoading(true);

          const response = await bankingService.cancelTransaction(transactionId);

          // Invalidate and refetch both info and history
          invalidateBankingInfo();
          invalidateBankingHistory();

          await Promise.all([
            refetchBankingInfo(),
            refetchBankingHistory()
          ]);

          resolve(response);
        } catch (error) {
          console.error('Error canceling transaction:', error);
          setError(error.message);
          reject(error);
        } finally {
          setLoading(false);
        }
      }),
      {
        loading: 'Canceling transaction...',
        success: 'Transaction canceled successfully!',
        error: (error) => `Failed to cancel transaction: ${error.message}`
      }
    );
  }, [
    invalidateBankingInfo,
    invalidateBankingHistory,
    refetchBankingInfo,
    refetchBankingHistory
  ]);

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
    validateBankAccount,
    getTransactionDetails,
    transferFunds,
    cancelTransaction,
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
    validateBankAccount,
    getTransactionDetails,
    transferFunds,
    cancelTransaction,
    refetchBankingInfo,
    refetchBankingHistory,
    clearError
  ]);

  return (
    <BankingProvider.Provider value={value}>
      {children}
    </BankingProvider.Provider>
  );
};