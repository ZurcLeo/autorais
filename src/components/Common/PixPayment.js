import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Divider,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { CheckCircle, Copy, Clock, QrCode, User } from 'lucide-react';
import { useBanking } from '../../providers/BankingProvider';

const PixPayment = ({ 
  amount,
  description,
  onPaymentComplete,
  paymentId,
  caixinhaId 
}) => {
  const { generateValidationPix, validateBankAccount, getTransactionDetails } = useBanking();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [userInfo, setUserInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    identificationType: 'CPF',
    identificationNumber: ''
  });
  const intervalRef = useRef(null);
  const statusIntervalRef = useRef(null);

  const steps = ['Dados Pessoais', 'Pagamento PIX', 'Confirmação'];

  // Countdown timer
  useEffect(() => {
    if (paymentData?.expiresAt) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const expiresAt = new Date(paymentData.expiresAt).getTime();
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          clearInterval(intervalRef.current);
          setError('Pagamento expirado. Tente novamente.');
          setPaymentData(null);
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [paymentData]);

  // Monitor payment status
  useEffect(() => {
    if (paymentData?.id) {
      statusIntervalRef.current = setInterval(async () => {
        try {
          // Use banking service to check payment status
          const transactionDetails = await getTransactionDetails(paymentData.id);
          
          if (transactionDetails && 
              (transactionDetails.status === 'CONCLUIDO' || 
               transactionDetails.status === 'SUCCEEDED' ||
               transactionDetails.status === 'completed' ||
               transactionDetails.status === 'approved')) {
            clearInterval(statusIntervalRef.current);
            
            // Advance to confirmation step
            setActiveStep(2);
            
            // Validate the account now that payment is confirmed
            try {
              await validateBankAccount({
                accountId: paymentId,
                transactionId: paymentData.id,
                caixinhaId: caixinhaId
              });
              
              setSuccess(true);
              setPaymentData(null);
              
              setTimeout(() => {
                onPaymentComplete?.();
                setOpen(false);
              }, 2000);
            } catch (validationError) {
              console.error('Error validating account:', validationError);
              setError('Pagamento confirmado, mas erro na validação da conta');
            }
          }
        } catch (err) {
          console.error('Error checking payment status:', err);
          // Continue monitoring even if there's an error
        }
      }, 3000); // Check every 3 seconds
    }

    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
    };
  }, [paymentData, onPaymentComplete, getTransactionDetails, validateBankAccount, paymentId, caixinhaId]);

  const validateUserInfo = () => {
    const { email, firstName, lastName, identificationNumber } = userInfo;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email inválido');
      return false;
    }
    
    if (!firstName || firstName.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres');
      return false;
    }
    
    if (!lastName || lastName.trim().length < 2) {
      setError('Sobrenome deve ter pelo menos 2 caracteres');
      return false;
    }
    
    if (!identificationNumber || identificationNumber.replace(/\D/g, '').length < 11) {
      setError('CPF/CNPJ inválido');
      return false;
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (activeStep === 0) {
      if (!validateUserInfo()) {
        return;
      }
    }
    setActiveStep(prev => prev + 1);
    setError(null);
  };

  const handleBackStep = () => {
    setActiveStep(prev => prev - 1);
    setError(null);
  };

  const handleUserInfoChange = (field, value) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDocument = (value, type) => {
    const numbers = value.replace(/\D/g, '');
    if (type === 'CPF') {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const handleStartPayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting PIX micropayment for validation:', {
        amount,
        description,
        paymentId,
        caixinhaId,
        userInfo
      });
      
      // Prepare payment data with user information
      const paymentData = {
        amount: amount,
        description: description,
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        identificationType: userInfo.identificationType,
        identificationNumber: userInfo.identificationNumber.replace(/\D/g, '')
      };
      
      // Call the banking service to generate PIX for validation
      const response = await generateValidationPix(paymentId, paymentData);
      
      console.log('🔍 Response from generateValidationPix:', {
        hasPixData: !!response?.pixData,
        responseKeys: Object.keys(response || {})
      });
      
      // Check if we have a valid response with payment data
      if (!response) {
        console.error('❌ No response from backend');
        throw new Error('Backend não retornou resposta');
      }
      
      // Extract PIX data according to backend structure
      const pixData = response.pixData;
      
      console.log('🔍 PIX Data structure:', {
        hasPixData: !!pixData,
        pixDataKeys: pixData ? Object.keys(pixData) : null
      });
      
      if (!pixData) {
        console.error('❌ Backend response missing pixData:', response);
        throw new Error('Backend não retornou dados PIX válidos');
      }
      
      // Extract payment_id from pixData (backend returns it here)
      const responsePaymentId = pixData.payment_id;
      
      if (!responsePaymentId) {
        console.error('❌ Backend response missing payment_id:', pixData);
        throw new Error('Backend não retornou payment_id válido');
      }
      
      if (!pixData.qr_code) {
        console.error('❌ Backend response missing qr_code:', pixData);
        throw new Error('Backend não retornou QR Code válido');
      }
      
      console.log('🔍 PIX Data extracted:', {
        responsePaymentId,
        hasQrCode: !!pixData.qr_code,
        hasQrCodeBase64: !!pixData.qr_code_base64,
        expiresAt: pixData.expires_at,
        amount: pixData.amount
      });
      
      setPaymentData({
        id: responsePaymentId,
        qrCode: pixData.qr_code,
        qrCodeBase64: pixData.qr_code_base64,
        pixKey: pixData.pix_key,
        expiresAt: pixData.expires_at,
        amount: pixData.amount || amount,
        ticketUrl: pixData.ticket_url
      });
      
      // Advance to payment step
      setActiveStep(1);
      
      // Start countdown
      const expirationDate = pixData.expires_at;
      console.log('🔍 Expiration date from backend:', expirationDate);
      console.log('🔍 Type of expiration date:', typeof expirationDate);
      
      let expiresAt;
      if (expirationDate) {
        // Try to parse the date properly
        const parsedDate = new Date(expirationDate);
        expiresAt = parsedDate.getTime();
        
        console.log('🔍 Original expiration value:', expirationDate);
        console.log('🔍 Parsed as Date object:', parsedDate);
        console.log('🔍 Parsed expiration timestamp:', expiresAt);
        console.log('🔍 Current timestamp:', Date.now());
        console.log('🔍 Is valid date?', !isNaN(parsedDate.getTime()));
        
        // Check if parsed date is reasonable (not too far in future)
        const timeLeftMs = expiresAt - Date.now();
        const timeLeftSeconds = Math.floor(timeLeftMs / 1000);
        console.log('🔍 Time difference (milliseconds):', timeLeftMs);
        console.log('🔍 Time difference (seconds):', timeLeftSeconds);
        
        // If time is unreasonable, use fallback
        if (isNaN(expiresAt) || timeLeftSeconds < 0 || timeLeftSeconds > 86400) {
          console.warn('⚠️ Invalid expiration time, using fallback');
          expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
        }
      } else {
        // Fallback: 15 minutes from now
        expiresAt = Date.now() + 15 * 60 * 1000;
        console.log('🔍 Using fallback expiration (15 min):', expiresAt);
      }
      
      const finalTimeLeftSeconds = Math.floor((expiresAt - Date.now()) / 1000);
      console.log('🔍 Final time left (seconds):', finalTimeLeftSeconds);
      setTimeLeft(Math.max(0, finalTimeLeftSeconds)); // Ensure non-negative
      
    } catch (err) {
      console.error('Payment creation error:', err);
      setError(err.message || 'Erro ao criar pagamento PIX');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPixCode = () => {
    if (paymentData?.qrCode) {
      navigator.clipboard.writeText(paymentData.qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '00:00';
    
    // Limit to reasonable time (max 24 hours = 86400 seconds)
    if (seconds > 86400) {
      console.warn('⚠️ PIX expiration time seems too long:', seconds, 'seconds');
      seconds = 900; // Fallback to 15 minutes
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    // If more than 1 hour, show H:MM:SS format
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Otherwise show MM:SS format
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCode size={24} />
          <Typography variant="h6" component="div">
            Validação de Conta Bancária
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {success ? (
            <Box sx={{ textAlign: 'center' }}>
              <CheckCircle size={64} color="green" style={{ marginBottom: 16 }} />
              <Typography variant="h6" color="success.main" gutterBottom>
                Pagamento confirmado!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sua conta bancária foi validada com sucesso.
              </Typography>
            </Box>
          ) : activeStep === 0 ? (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <User size={24} />
                Informações Pessoais
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Para validar sua conta bancária, precisamos de algumas informações básicas.
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => handleUserInfoChange('email', e.target.value)}
                  required
                />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Nome"
                    value={userInfo.firstName}
                    onChange={(e) => handleUserInfoChange('firstName', e.target.value)}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Sobrenome"
                    value={userInfo.lastName}
                    onChange={(e) => handleUserInfoChange('lastName', e.target.value)}
                    required
                  />
                </Box>
                
                <FormControl fullWidth>
                  <InputLabel>Tipo de Documento</InputLabel>
                  <Select
                    value={userInfo.identificationType}
                    label="Tipo de Documento"
                    onChange={(e) => handleUserInfoChange('identificationType', e.target.value)}
                  >
                    <MenuItem value="CPF">CPF</MenuItem>
                    <MenuItem value="CNPJ">CNPJ</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label={userInfo.identificationType === 'CPF' ? 'CPF' : 'CNPJ'}
                  value={formatDocument(userInfo.identificationNumber, userInfo.identificationType)}
                  onChange={(e) => handleUserInfoChange('identificationNumber', e.target.value.replace(/\D/g, ''))}
                  inputProps={{
                    maxLength: userInfo.identificationType === 'CPF' ? 14 : 18
                  }}
                  required
                />
              </Box>
            </Box>
          ) : activeStep === 1 && paymentData ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Escaneie o QR Code PIX
              </Typography>
              
              {timeLeft && (
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    icon={<Clock size={16} />}
                    label={`Expira em: ${formatTime(timeLeft)}`}
                    color={timeLeft < 300 ? 'error' : 'default'}
                    variant="outlined"
                  />
                </Box>
              )}
              
              {/* QR Code Display */}
              {paymentData.qrCodeBase64 ? (
                <Box sx={{ mb: 3 }}>
                  <img 
                    src={`data:image/png;base64,${paymentData.qrCodeBase64}`}
                    alt="QR Code PIX"
                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                  />
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    width: 200, 
                    height: 200, 
                    border: '2px dashed #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3
                  }}
                >
                  <QrCode size={48} color="#ccc" />
                </Box>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Valor: R$ {paymentData.amount?.toFixed(2)}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" gutterBottom>
                Ou copie o código PIX:
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    flex: 1, 
                    p: 1, 
                    border: '1px solid #ddd', 
                    borderRadius: 1, 
                    fontSize: '0.75rem',
                    wordBreak: 'break-all',
                    maxHeight: '60px',
                    overflowY: 'auto'
                  }}
                >
                  {paymentData.qrCode}
                </Box>
                <IconButton onClick={handleCopyPixCode} color="primary">
                  <Copy size={20} />
                </IconButton>
              </Box>

              {copied && (
                <Typography variant="caption" color="success.main">
                  Código copiado!
                </Typography>
              )}

              <Alert severity="info" sx={{ mt: 2 }}>
                Após realizar o pagamento, aguarde alguns segundos para confirmação automática.
              </Alert>
            </Box>
          ) : activeStep === 2 ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" gutterBottom>
                Aguardando confirmação do pagamento...
              </Typography>
              <CircularProgress sx={{ mt: 2 }} />
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" gutterBottom>
                {description}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Para validar sua conta bancária, será necessário realizar um micropagamento PIX de R$ {amount?.toFixed(2)}.
                Este processo confirma que a conta está ativa e pertence a você.
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Button
                variant="contained"
                onClick={handleStartPayment}
                disabled={loading}
                size="large"
                sx={{ minWidth: 200 }}
                startIcon={<QrCode />}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Gerando PIX...
                  </>
                ) : (
                  'Gerar PIX de Validação'
                )}
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        {error && (
          <Alert severity="error" sx={{ flexGrow: 1, mr: 2 }}>
            {error}
          </Alert>
        )}
        
        {activeStep > 0 && activeStep < 2 && !success && !paymentData && (
          <Button onClick={handleBackStep} color="inherit">
            Voltar
          </Button>
        )}
        
        {activeStep === 0 ? (
          <Button 
            onClick={handleNextStep} 
            variant="contained"
            disabled={!userInfo.email || !userInfo.firstName || !userInfo.lastName || !userInfo.identificationNumber}
          >
            Continuar
          </Button>
        ) : (
          <Button onClick={handleClose} color="inherit">
            {success ? 'Fechar' : 'Cancelar'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PixPayment;