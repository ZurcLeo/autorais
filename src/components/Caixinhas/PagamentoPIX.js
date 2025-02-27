// src/components/Pagamento/PagamentoPIX.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import QRCode from 'qrcode.react';
import { usePayment } from '../../contexts/PaymentContext';

const PagamentoPIX = ({ valor, caixinhaId }) => {
  const { gerarCobrancaPix, verificarPagamento } = usePayment();
  const [cobranca, setCobranca] = useState(null);
  const [status, setStatus] = useState('pendente');
  
  useEffect(() => {
    const iniciarPagamento = async () => {
      try {
        const dadosCobranca = await gerarCobrancaPix(valor, caixinhaId);
        setCobranca(dadosCobranca);
        
        // Inicia verificação de pagamento
        const interval = setInterval(async () => {
          const statusPagamento = await verificarPagamento(dadosCobranca.txid);
          if (statusPagamento === 'CONCLUIDO') {
            setStatus('concluido');
            clearInterval(interval);
          }
        }, 5000);
        
        return () => clearInterval(interval);
      } catch (error) {
        console.error('Erro ao gerar cobrança:', error);
      }
    };
    
    iniciarPagamento();
  }, []);

  return (
    <Box sx={{ textAlign: 'center', p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Pagamento via PIX
      </Typography>
      
      {cobranca ? (
        <>
          <QRCode value={cobranca.pixCopiaECola} size={256} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Valor: R$ {valor}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigator.clipboard.writeText(cobranca.pixCopiaECola)}
            sx={{ mt: 2 }}
          >
            Copiar código PIX
          </Button>
        </>
      ) : (
        <CircularProgress />
      )}
      
      {status === 'concluido' && (
        <Typography color="success.main" sx={{ mt: 2 }}>
          Pagamento confirmado!
        </Typography>
      )}
    </Box>
  );
};

export default PagamentoPIX;