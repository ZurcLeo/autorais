// src/components/Pagamento/PagamentoPIX.js
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress, Button, Alert } from '@mui/material';
import QRCode from 'qrcode.react';
import { usePayment } from '../../context/PaymentContext';

const PagamentoPIX = ({ valor, caixinhaId, onPagamentoConfirmado }) => {
  const {
    gerarCobrancaPix,
    verificarPagamento,
    STATUS_CHECK_INTERVAL,
    PAYMENT_TIMEOUT_MS
  } = usePayment();

  const [cobranca, setCobranca] = useState(null);
  const [status, setStatus] = useState('pendente'); // pendente | concluido | expirado | erro
  const [erroMsg, setErroMsg] = useState(null);

  // Guarda referência do interval e timeout para limpeza correta
  const pollingRef = useRef(null);
  const timeoutRef = useRef(null);

  const pararPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    if (!valor || !caixinhaId) return;

    let isMounted = true;

    const iniciarPagamento = async () => {
      try {
        const dadosCobranca = await gerarCobrancaPix(valor, caixinhaId);
        if (!isMounted) return;

        setCobranca(dadosCobranca);

        // O paymentId é o identificador Asaas usado para polling de status
        const paymentId = dadosCobranca.paymentId;

        // Timeout global: expira após PAYMENT_TIMEOUT_MS
        timeoutRef.current = setTimeout(() => {
          if (!isMounted) return;
          pararPolling();
          setStatus('expirado');
        }, PAYMENT_TIMEOUT_MS);

        // Polling de status a cada STATUS_CHECK_INTERVAL
        pollingRef.current = setInterval(async () => {
          if (!isMounted) return;
          const statusPagamento = await verificarPagamento(paymentId);

          if (statusPagamento === 'CONCLUIDO') {
            pararPolling();
            setStatus('concluido');
            onPagamentoConfirmado?.();
          } else if (statusPagamento === 'EXPIRADO') {
            pararPolling();
            setStatus('expirado');
          }
        }, STATUS_CHECK_INTERVAL);

      } catch (error) {
        if (!isMounted) return;
        console.error('[PagamentoPIX] Erro ao gerar cobrança:', error);
        setErroMsg(error.message || 'Erro ao gerar cobrança PIX');
        setStatus('erro');
      }
    };

    iniciarPagamento();

    return () => {
      isMounted = false;
      pararPolling();
    };
  }, [valor, caixinhaId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box sx={{ textAlign: 'center', p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Pagamento via PIX
      </Typography>

      {status === 'erro' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {erroMsg || 'Falha ao gerar cobrança PIX. Tente novamente.'}
        </Alert>
      )}

      {status === 'expirado' && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          O tempo para pagamento expirou. Gere uma nova cobrança.
        </Alert>
      )}

      {status === 'concluido' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Pagamento confirmado!
        </Alert>
      )}

      {status === 'pendente' && !cobranca && (
        <CircularProgress />
      )}

      {status === 'pendente' && cobranca && (
        <>
          <QRCode value={cobranca.pixCopiaECola} size={256} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Valor: R$ {Number(valor).toFixed(2)}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigator.clipboard.writeText(cobranca.pixCopiaECola)}
            sx={{ mt: 2 }}
          >
            Copiar código PIX
          </Button>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
            Aguardando confirmação do pagamento...
          </Typography>
        </>
      )}
    </Box>
  );
};

export default PagamentoPIX;