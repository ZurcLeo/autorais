// src/context/PaymentContext.js
import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { serviceLocator } from '../core/services/BaseService';
import { useAuth } from '../providers/AuthProvider';

const PaymentContext = createContext();

// Intervalo de polling para verificar status do pagamento (ms)
const STATUS_CHECK_INTERVAL = 5000;

// Tempo máximo de espera pelo pagamento (30 minutos)
const PAYMENT_TIMEOUT_MS = 30 * 60 * 1000;

export const PaymentProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [cobranca, setCobranca] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Retorna a instância do apiService via serviceLocator.
   */
  const _api = useCallback(() => {
    return serviceLocator.get('apiService');
  }, []);

  /**
   * Cria uma cobrança PIX Asaas para contribuição na caixinha.
   * Endpoint: POST /api/payments/asaas/pix
   * Retorna os dados da cobrança (pixCopiaECola, encodedImage, txid, expiresAt, paymentId, status).
   */
  const gerarCobrancaPix = useCallback(async (valor, caixinhaId, description) => {
    if (!currentUser) throw new Error('Usuário não autenticado');
    if (!caixinhaId || !valor || valor <= 0) {
      throw new Error('caixinhaId e valor são obrigatórios');
    }

    setLoading(true);
    setError(null);

    try {
      const api = _api();
      const response = await api.post('/api/payments/asaas/pix', {
        caixinhaId,
        amount: Number(valor),
        description: description || 'Contribuição ElosCloud'
      });

      const data = response?.data?.data || response?.data;

      setCobranca(data);
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Erro ao gerar cobrança PIX';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [currentUser, _api]);

  /**
   * Verifica o status de um pagamento Asaas pelo paymentId.
   * Endpoint: GET /api/payments/asaas/status/:paymentId
   * O status retornado pelo Asaas é: PENDING | RECEIVED | CONFIRMED | OVERDUE | REFUNDED | RECEIVED_IN_CASH | REFUND_REQUESTED | CHARGEBACK_REQUESTED
   * 'CONCLUIDO' é normalizado a partir de RECEIVED | CONFIRMED.
   */
  const verificarPagamento = useCallback(async (paymentId) => {
    if (!paymentId) throw new Error('paymentId é obrigatório');

    try {
      const api = _api();
      const response = await api.get(`/api/payments/asaas/status/${paymentId}`);
      const data = response?.data?.data || response?.data;
      const status = data?.status;

      // Normaliza status Asaas → status usado pelo PagamentoPIX.js
      if (status === 'RECEIVED' || status === 'CONFIRMED') {
        return 'CONCLUIDO';
      }
      if (status === 'OVERDUE' || status === 'REFUNDED') {
        return 'EXPIRADO';
      }
      return status || 'PENDENTE';
    } catch (err) {
      // Não lança — o polling deve continuar mesmo em falhas transitórias
      console.warn('[PaymentContext] Falha ao verificar status do pagamento:', err?.message);
      return 'PENDENTE';
    }
  }, [_api]);

  /**
   * Consulta o saldo virtual do membro autenticado em uma caixinha.
   * Endpoint: GET /api/payments/asaas/balance/:caixinhaId
   */
  const consultarSaldo = useCallback(async (caixinhaId) => {
    if (!currentUser) throw new Error('Usuário não autenticado');
    if (!caixinhaId) throw new Error('caixinhaId é obrigatório');

    try {
      const api = _api();
      const response = await api.get(`/api/payments/asaas/balance/${caixinhaId}`);
      const data = response?.data?.data || response?.data;
      return data?.balance ?? 0;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Erro ao consultar saldo';
      throw new Error(msg);
    }
  }, [currentUser, _api]);

  /**
   * Solicita um saque (fica pendente de aprovação do admin).
   * Endpoint: POST /api/payments/asaas/withdrawal/request
   */
  const solicitarSaque = useCallback(async ({ caixinhaId, amount, pixKey, pixKeyType }) => {
    if (!currentUser) throw new Error('Usuário não autenticado');
    if (!caixinhaId || !amount || !pixKey) {
      throw new Error('caixinhaId, amount e pixKey são obrigatórios');
    }

    setLoading(true);
    setError(null);

    try {
      const api = _api();
      const response = await api.post('/api/payments/asaas/withdrawal/request', {
        caixinhaId,
        amount: Number(amount),
        pixKey,
        pixKeyType
      });
      const data = response?.data?.data || response?.data;
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Erro ao solicitar saque';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [currentUser, _api]);

  /**
   * Admin aprova saque pendente.
   * Endpoint: POST /api/payments/asaas/withdrawal/approve
   */
  const aprovarSaque = useCallback(async ({ caixinhaId, withdrawalId }) => {
    if (!currentUser) throw new Error('Usuário não autenticado');
    if (!caixinhaId || !withdrawalId) {
      throw new Error('caixinhaId e withdrawalId são obrigatórios');
    }

    setLoading(true);
    setError(null);

    try {
      const api = _api();
      const response = await api.post('/api/payments/asaas/withdrawal/approve', {
        caixinhaId,
        withdrawalId
      });
      const data = response?.data?.data || response?.data;
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Erro ao aprovar saque';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [currentUser, _api]);

  /**
   * Limpa o estado da cobrança atual (ex: ao cancelar ou após conclusão).
   */
  const limparCobranca = useCallback(() => {
    setCobranca(null);
    setError(null);
  }, []);

  const value = useMemo(() => ({
    // Estado
    cobranca,
    loading,
    error,
    // Constantes úteis para o componente
    STATUS_CHECK_INTERVAL,
    PAYMENT_TIMEOUT_MS,
    // Ações
    gerarCobrancaPix,
    verificarPagamento,
    consultarSaldo,
    solicitarSaque,
    aprovarSaque,
    limparCobranca
  }), [
    cobranca,
    loading,
    error,
    gerarCobrancaPix,
    verificarPagamento,
    consultarSaldo,
    solicitarSaque,
    aprovarSaque,
    limparCobranca
  ]);

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment deve ser usado dentro de um PaymentProvider');
  }
  return context;
};

export default PaymentContext;
