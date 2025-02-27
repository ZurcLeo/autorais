import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import { Timer, Copy, CheckCircle } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';

const PixPayment = ({ 
  amount,
  description,
  onPaymentComplete,
  paymentId 
}) => {
  const {
    paymentData,
    loading,
    error,
    timeLeft,
    startPixPayment,
    monitorPaymentStatus,
    countdown,
  } = usePayment();

  const [copied, setCopied] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (!paymentData) {
        const initiatePayment = async () => {
            try {
              console.log('Initiating payment with:', {
                amount,
                description,
                paymentId
              });
              
              await startPixPayment({ 
                valor: amount,
                descricao: description,
                caixinhaId: paymentId,
                email: 'email@example.com',
                identificationType: 'CPF',
                identificationNumber: '102.319.987-02'
              });
            } catch (err) {
              console.error('Erro ao iniciar o pagamento:', err);
            }
          };
  
      initiatePayment();
    }
}, [amount, description, paymentId]);

// Add debugging for paymentData updates
useEffect(() => {
    if (paymentData) {
        console.log('Payment data received:', paymentData);
    }
}, [paymentData]);

  useEffect(() => {
    if (paymentData?.id) {
      const cleanupStatus = monitorPaymentStatus(
        paymentData.id,
        () => {
          console.log('Pagamento concluído com sucesso.');
          onPaymentComplete(); // Notifica o componente pai
        },
        () => {
          console.log('Pagamento foi cancelado.');
        }
      );
  
      // Cleanup para encerrar monitoramento quando o componente desmontar
      return cleanupStatus;
    }
  }, [paymentData, monitorPaymentStatus, onPaymentComplete]);
  

  useEffect(() => {
    if (paymentData?.expiresAt) {
      const cleanupCountdown = countdown(paymentData.expiresAt, () => {
        console.error('Pagamento expirado.');
      });
      return cleanupCountdown;
    }
  }, [paymentData, countdown]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(paymentData.qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar o código PIX:', err);
    }
  };

  const formatTimeLeft = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <Box className="flex items-center justify-center p-8">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error || 'Ocorreu um erro'}
        </Alert>
      </Snackbar>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <Typography variant="h5">PIX Payment</Typography>
          <Typography variant="h4" className="font-bold">
            R$ {amount.toFixed(2)}
          </Typography>
        </div>

        {paymentData ? (
    <>
        {paymentData.qrCodeBase64 ? (
            <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                <img 
                    src={`data:image/jpeg;base64,${paymentData.qrCodeBase64}`}
                    alt="PIX QR Code"
                    className="w-24 h-24"
                    onError={(e) => {
                        console.error('Error loading QR code image');
                        e.target.style.display = 'none';
                    }}
                />
            </div>
        ) : (
            <div className="text-center text-red-500">
                QR Code não disponível
            </div>
        )}

        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Typography variant="subtitle2">PIX Code</Typography>
                {paymentData.qrCode && (
                    <Button
                        startIcon={copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        onClick={handleCopyCode}
                        size="small"
                    >
                        {copied ? 'Copiado!' : 'Copiar Código'}
                    </Button>
                )}
            </div>
            
            {paymentData.qrCode && (
                <div className="p-2 bg-gray-50 rounded text-sm font-mono break-all">
                    {paymentData.qrCode}
                </div>
            )}
        </div>
    </>
) : null}

      </CardContent>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Código PIX copiado!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Card>
  );
};

export default PixPayment;
