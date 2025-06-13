import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { CreditCard, Lock, CheckCircle, User } from 'lucide-react';
import { useBanking } from '../../providers/BankingProvider';
import { 
  initializeMercadoPago, 
  createCardToken, 
  getIdentificationTypes,
  validateCardData 
} from '../../utils/mercadoPagoUtils';

const CardPayment = ({
  amount,
  description,
  onPaymentComplete,
  onError,
  open = true,
  onClose
}) => {
  const { processCardPayment } = useBanking();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [mpInstance, setMpInstance] = useState(null);
  const [identificationTypes, setIdentificationTypes] = useState([]);

  const [cardData, setCardData] = useState({
    cardNumber: '',
    expirationMonth: '',
    expirationYear: '',
    securityCode: '',
    cardholderName: '',
    identificationType: 'CPF',
    identificationNumber: '',
    email: ''
  });

  const [tokenData, setTokenData] = useState(null);

  const steps = ['Dados do Cartão', 'Confirmação', 'Processamento'];

  // Initialize MercadoPago SDK
  useEffect(() => {
    const initializeMP = async () => {
      try {
        const mp = await initializeMercadoPago();
        if (mp) {
          setMpInstance(mp);
          
          // Get identification types
          const types = await getIdentificationTypes();
          setIdentificationTypes(types);
        } else {
          setError('Erro ao carregar SDK do MercadoPago');
        }
      } catch (err) {
        console.error('Error initializing MercadoPago:', err);
        setError('Erro ao inicializar pagamento');
      }
    };

    if (open) {
      initializeMP();
    }
  }, [open]);

  const handleCardDataChange = (field, value) => {
    let formattedValue = value;

    // Format card number
    if (field === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    
    // Format expiration fields
    if (field === 'expirationMonth' || field === 'expirationYear') {
      formattedValue = value.replace(/\D/g, '');
    }
    
    // Format security code
    if (field === 'securityCode') {
      formattedValue = value.replace(/\D/g, '');
    }
    
    // Format identification number
    if (field === 'identificationNumber') {
      const numbers = value.replace(/\D/g, '');
      if (cardData.identificationType === 'CPF') {
        formattedValue = numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      } else {
        formattedValue = numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      }
    }

    setCardData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const validateForm = () => {
    const errors = [];

    // Validate card number (basic)
    const cleanCardNumber = cardData.cardNumber.replace(/\s/g, '');
    if (!cleanCardNumber || cleanCardNumber.length < 13) {
      errors.push('Número do cartão inválido');
    }

    // Validate expiration
    if (!cardData.expirationMonth || !cardData.expirationYear) {
      errors.push('Data de expiração inválida');
    }

    // Validate security code
    if (!cardData.securityCode || cardData.securityCode.length < 3) {
      errors.push('Código de segurança inválido');
    }

    // Validate cardholder name
    if (!cardData.cardholderName || cardData.cardholderName.trim().length < 3) {
      errors.push('Nome do portador inválido');
    }

    // Validate email
    if (!cardData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cardData.email)) {
      errors.push('Email inválido');
    }

    // Validate identification
    const cleanId = cardData.identificationNumber.replace(/\D/g, '');
    if (!cleanId || cleanId.length < 11) {
      errors.push('Documento inválido');
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }

    return true;
  };

  const handleTokenizeCard = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare card data for tokenization
      const tokenizationData = {
        cardNumber: cardData.cardNumber.replace(/\s/g, ''),
        expirationMonth: cardData.expirationMonth.padStart(2, '0'),
        expirationYear: cardData.expirationYear,
        securityCode: cardData.securityCode,
        cardholderName: cardData.cardholderName.toUpperCase(),
        identificationType: cardData.identificationType,
        identificationNumber: cardData.identificationNumber.replace(/\D/g, '')
      };

      console.log('🔒 Starting card tokenization...');
      
      // Create card token with MercadoPago SDK V2
      const token = await createCardToken(tokenizationData);
      
      console.log('✅ Card tokenized successfully:', {
        tokenId: token.id,
        hasDeviceId: !!token.device_id
      });

      setTokenData(token);
      setActiveStep(1);

    } catch (err) {
      console.error('❌ Card tokenization error:', err);
      setError(err.message || 'Erro ao processar cartão');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!tokenData) {
      setError('Token do cartão não encontrado');
      return;
    }

    setLoading(true);
    setError(null);
    setActiveStep(2);

    try {
      // Prepare payment data with token
      const paymentData = {
        token: tokenData.id,
        device_id: tokenData.device_id, // Automatically included by SDK V2
        amount: amount,
        description: description,
        payer: {
          email: cardData.email,
          identification: {
            type: cardData.identificationType,
            number: cardData.identificationNumber.replace(/\D/g, '')
          }
        },
        // Additional data for fraud prevention
        metadata: {
          payment_method: 'credit_card',
          sdk_version: 'v2',
          tokenization_method: 'mercadopago_sdk'
        }
      };

      console.log('💳 Processing card payment with token:', {
        tokenId: tokenData.id,
        hasDeviceId: !!tokenData.device_id,
        amount: amount
      });

      // Process payment through banking service
      const result = await processCardPayment(paymentData);
      
      console.log('✅ Payment processed successfully:', result);

      setSuccess(true);
      
      setTimeout(() => {
        onPaymentComplete?.(result);
        handleClose();
      }, 2000);

    } catch (err) {
      console.error('❌ Payment processing error:', err);
      setError(err.message || 'Erro ao processar pagamento');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCardData({
      cardNumber: '',
      expirationMonth: '',
      expirationYear: '',
      securityCode: '',
      cardholderName: '',
      identificationType: 'CPF',
      identificationNumber: '',
      email: ''
    });
    setTokenData(null);
    setActiveStep(0);
    setError(null);
    setSuccess(false);
    onClose?.();
  };

  const handleBackStep = () => {
    setActiveStep(prev => prev - 1);
    setError(null);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreditCard size={24} />
          <Typography variant="h6" component="div">
            Pagamento com Cartão
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
                Pagamento aprovado!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Seu pagamento foi processado com sucesso.
              </Typography>
            </Box>
          ) : activeStep === 0 ? (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CreditCard size={24} />
                Dados do Cartão
              </Typography>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Lock size={16} />
                  Seus dados são protegidos pelo MercadoPago
                </Box>
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Número do Cartão"
                    value={cardData.cardNumber}
                    onChange={(e) => handleCardDataChange('cardNumber', e.target.value)}
                    inputProps={{ maxLength: 19 }}
                    placeholder="0000 0000 0000 0000"
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome no Cartão"
                    value={cardData.cardholderName}
                    onChange={(e) => handleCardDataChange('cardholderName', e.target.value)}
                    placeholder="NOME COMO ESTÁ NO CARTÃO"
                    required
                  />
                </Grid>

                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Mês"
                    value={cardData.expirationMonth}
                    onChange={(e) => handleCardDataChange('expirationMonth', e.target.value)}
                    inputProps={{ maxLength: 2 }}
                    placeholder="MM"
                    required
                  />
                </Grid>

                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Ano"
                    value={cardData.expirationYear}
                    onChange={(e) => handleCardDataChange('expirationYear', e.target.value)}
                    inputProps={{ maxLength: 4 }}
                    placeholder="AAAA"
                    required
                  />
                </Grid>

                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="CVV"
                    value={cardData.securityCode}
                    onChange={(e) => handleCardDataChange('securityCode', e.target.value)}
                    inputProps={{ maxLength: 4 }}
                    placeholder="123"
                    type="password"
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <User size={20} />
                    Dados do Portador
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={cardData.email}
                    onChange={(e) => handleCardDataChange('email', e.target.value)}
                    required
                  />
                </Grid>

                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Documento</InputLabel>
                    <Select
                      value={cardData.identificationType}
                      label="Tipo de Documento"
                      onChange={(e) => handleCardDataChange('identificationType', e.target.value)}
                    >
                      <MenuItem value="CPF">CPF</MenuItem>
                      <MenuItem value="CNPJ">CNPJ</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={cardData.identificationType}
                    value={cardData.identificationNumber}
                    onChange={(e) => handleCardDataChange('identificationNumber', e.target.value)}
                    inputProps={{
                      maxLength: cardData.identificationType === 'CPF' ? 14 : 18
                    }}
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          ) : activeStep === 1 ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Confirmar Pagamento
              </Typography>

              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Resumo do Pagamento
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {description}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    R$ {amount?.toFixed(2)}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Cartão:</strong> **** **** **** {cardData.cardNumber.slice(-4)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Portador:</strong> {cardData.cardholderName}
                  </Typography>
                </CardContent>
              </Card>

              <Alert severity="success" sx={{ mb: 2 }}>
                Cartão tokenizado com segurança pelo MercadoPago
              </Alert>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={64} sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Processando pagamento...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aguarde enquanto processamos seu pagamento com segurança.
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        {activeStep > 0 && activeStep < 2 && !success && (
          <Button onClick={handleBackStep} color="inherit">
            Voltar
          </Button>
        )}

        {activeStep === 0 ? (
          <Button
            onClick={handleTokenizeCard}
            variant="contained"
            disabled={loading || !mpInstance}
            startIcon={loading ? <CircularProgress size={20} /> : <Lock />}
          >
            {loading ? 'Processando...' : 'Continuar'}
          </Button>
        ) : activeStep === 1 ? (
          <Button
            onClick={handleConfirmPayment}
            variant="contained"
            disabled={loading}
            color="primary"
          >
            Confirmar Pagamento
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

export default CardPayment;