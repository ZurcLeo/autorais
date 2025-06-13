import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Divider
} from '@mui/material';
import { CreditCard, QrCode } from 'lucide-react';
import CardPayment from '../Common/CardPayment';
import PixPayment from '../Common/PixPayment';

/**
 * Example component showing how to use MercadoPago V2 payment methods
 * This demonstrates both PIX and Card payment integration
 */
const PaymentExample = () => {
  const [showCardPayment, setShowCardPayment] = useState(false);
  const [showPixPayment, setShowPixPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState(null);

  // Example payment data
  const paymentAmount = 50.00;
  const paymentDescription = "Exemplo de Pagamento - ElosCloud";

  const handleCardPaymentSuccess = (result) => {
    console.log('Card payment successful:', result);
    setPaymentResult({
      type: 'card',
      success: true,
      data: result
    });
    setShowCardPayment(false);
    setError(null);
  };

  const handleCardPaymentError = (err) => {
    console.error('Card payment failed:', err);
    setError(`Erro no pagamento com cartão: ${err.message}`);
    setPaymentResult({
      type: 'card',
      success: false,
      error: err.message
    });
  };

  const handlePixPaymentSuccess = () => {
    console.log('PIX payment successful');
    setPaymentResult({
      type: 'pix',
      success: true,
      data: { message: 'PIX payment completed' }
    });
    setShowPixPayment(false);
    setError(null);
  };

  const resetExample = () => {
    setPaymentResult(null);
    setError(null);
    setShowCardPayment(false);
    setShowPixPayment(false);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Exemplo de Integração MercadoPago V2
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Este exemplo demonstra como usar os componentes de pagamento com MercadoPago SDK V2,
        incluindo tokenização automática de cartões e geração de device ID.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detalhes do Pagamento
          </Typography>
          <Typography variant="body1">
            <strong>Valor:</strong> R$ {paymentAmount.toFixed(2)}
          </Typography>
          <Typography variant="body1">
            <strong>Descrição:</strong> {paymentDescription}
          </Typography>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {paymentResult && (
        <Alert 
          severity={paymentResult.success ? "success" : "error"} 
          sx={{ mb: 3 }}
        >
          <Typography variant="h6" gutterBottom>
            Resultado do Pagamento {paymentResult.type.toUpperCase()}
          </Typography>
          {paymentResult.success ? (
            <Typography>
              ✅ Pagamento realizado com sucesso!
              {paymentResult.data?.id && (
                <><br />ID da Transação: {paymentResult.data.id}</>
              )}
              {paymentResult.data?.status && (
                <><br />Status: {paymentResult.data.status}</>
              )}
            </Typography>
          ) : (
            <Typography>
              ❌ Falha no pagamento: {paymentResult.error}
            </Typography>
          )}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<CreditCard />}
          onClick={() => setShowCardPayment(true)}
          disabled={showCardPayment || showPixPayment}
          fullWidth
        >
          Pagar com Cartão
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<QrCode />}
          onClick={() => setShowPixPayment(true)}
          disabled={showCardPayment || showPixPayment}
          fullWidth
        >
          Pagar com PIX
        </Button>
      </Box>

      {paymentResult && (
        <Button
          variant="text"
          onClick={resetExample}
          fullWidth
        >
          Fazer Novo Pagamento
        </Button>
      )}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          🔧 Recursos Implementados
        </Typography>
        <Typography variant="body2" component="div">
          <strong>Cartão de Crédito:</strong>
          <ul>
            <li>✅ Tokenização segura com MercadoPago SDK V2</li>
            <li>✅ Device ID automático para prevenção de fraudes</li>
            <li>✅ Validação de dados do cartão</li>
            <li>✅ Detecção automática da bandeira</li>
            <li>✅ Suporte a parcelas e emissores</li>
            <li>✅ Interface step-by-step</li>
          </ul>
          
          <strong>PIX:</strong>
          <ul>
            <li>✅ Geração de QR Code</li>
            <li>✅ Monitoramento automático de status</li>
            <li>✅ Countdown de expiração</li>
            <li>✅ Validação de conta bancária</li>
          </ul>
          
          <strong>Segurança:</strong>
          <ul>
            <li>✅ Dados do cartão nunca tocam o backend</li>
            <li>✅ Conformidade PCI através do MercadoPago</li>
            <li>✅ Headers de segurança automáticos</li>
            <li>✅ Prevenção de fraudes integrada</li>
          </ul>
        </Typography>
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="body2" color="info.contrastText">
          <strong>💡 Para Desenvolvedores:</strong><br />
          Este exemplo pode ser usado como base para implementar pagamentos em qualquer parte da aplicação.
          Os componentes são reutilizáveis e seguem as melhores práticas do MercadoPago SDK V2.
        </Typography>
      </Box>

      {/* Payment Components */}
      {showCardPayment && (
        <CardPayment
          amount={paymentAmount}
          description={paymentDescription}
          onPaymentComplete={handleCardPaymentSuccess}
          onError={handleCardPaymentError}
          open={showCardPayment}
          onClose={() => setShowCardPayment(false)}
        />
      )}

      {showPixPayment && (
        <PixPayment
          amount={paymentAmount}
          description={paymentDescription}
          onPaymentComplete={handlePixPaymentSuccess}
          paymentId="example-account-id"
          caixinhaId="example-caixinha-id"
        />
      )}
    </Box>
  );
};

export default PaymentExample;