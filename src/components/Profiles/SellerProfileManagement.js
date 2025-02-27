import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import { Help as HelpIcon, AccountBalance as BankIcon, CreditCard as CardIcon } from '@mui/icons-material';
import { useAuth } from '../../context/_AuthContext';
import { validateDocument } from '../../utils/validation';
import { useTranslation } from 'react-i18next';
// import { sellerService } from '../../services/sellerService';
import { formatDocument, formatPhone } from '../../utils/formatters';
import AddressForm from '../Common/AddressForm';
import { useToast } from '../../providers/ToastProvider';

const steps = ['basicInfo', 'documentVerification', 'businessDetails', 'paymentInfo'];

const SellerProfileManagement = ({ onProfileUpdate }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showPromiseToast, showToast } = useToast();
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    },
    documentType: 'cpf',
    documentNumber: '',
    businessName: '',
    tradingName: '',
    description: '',
    bankInfo: {
      bankName: '',
      accountType: 'checking',
      accountNumber: '',
      agency: '',
      holderName: '',
      holderDocument: ''
    }
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (addressData) => {
    setFormData(prev => ({
      ...prev,
      address: addressData
    }));
  };

  const handleNext = async () => {
    setError('');
    setLoading(true);
    
    try {
      if (activeStep === 1) {
        const isValid = await validateDocument(
          formData.documentType, 
          formData.documentNumber
        );
          
        if (!isValid) {
          throw new Error(t('seller.errors.invalidDocument'));
        }
      }
      
      if (activeStep === steps.length - 1) {
        await saveProfile();
      } else {
        setActiveStep(prev => prev + 1);
      }
    } catch (err) {
      setError(err.message);
      showToast(err.message, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const saveProfile = async () => {
    try {
      const response = await showPromiseToast(
        // sellerService.registerSeller({
        //   ...formData,
        //   userId: currentUser.uid
        // }),
        // {
        //   loading: t('seller.loading.registration'),
        //   success: t('seller.success.registration'),
        //   error: t('seller.errors.registrationFailed')
        // }
      );

      if (response.data.status === 'pending') {
        showToast(t('seller.info.documentPending'), { type: 'info' });
      }

      onProfileUpdate(true);
    } catch (error) {
      const message = error.response?.data?.message || t('seller.errors.registrationFailed');
      setError(message);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box className="space-y-4">
            <TextField
              fullWidth
              label={t('seller.fields.name')}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              helperText={t('seller.help.name')}
            />
            <TextField
              fullWidth
              label={t('seller.fields.phone')}
              value={formatPhone(formData.phone)}
              onChange={(e) => handleChange('phone', e.target.value)}
              required
              helperText={t('seller.help.phone')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={t('seller.tooltips.phone')}>
                      <IconButton edge="end">
                        <HelpIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
            <AddressForm
              value={formData.address}
              onChange={handleAddressChange}
            />
          </Box>
        );

      case 1:
        return (
          <Box className="space-y-4">
            <FormControlLabel
              control={
                <Switch
                  checked={formData.documentType === 'cnpj'}
                  onChange={(e) => handleChange('documentType', e.target.checked ? 'cnpj' : 'cpf')}
                />
              }
              label={t('seller.fields.useCNPJ')}
            />
            <TextField
              fullWidth
              label={t(`seller.fields.${formData.documentType}`)}
              value={formatDocument(formData.documentNumber, formData.documentType)}
              onChange={(e) => handleChange('documentNumber', e.target.value)}
              required
              error={!!error}
              helperText={error || t('seller.help.document')}
            />
          </Box>
        );

      case 2:
        return (
          <Box className="space-y-4">
            <TextField
              fullWidth
              label={t('seller.fields.businessName')}
              value={formData.businessName}
              onChange={(e) => handleChange('businessName', e.target.value)}
              required
              helperText={t('seller.help.businessName')}
            />
            <TextField
              fullWidth
              label={t('seller.fields.tradingName')}
              value={formData.tradingName}
              onChange={(e) => handleChange('tradingName', e.target.value)}
              required
              helperText={t('seller.help.tradingName')}
            />
            <TextField
              fullWidth
              label={t('seller.fields.description')}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              multiline
              rows={4}
              required
              helperText={t('seller.help.description')}
            />
          </Box>
        );

      case 3:
        return (
          <Box className="space-y-4">
            <Typography variant="subtitle1" className="mb-4">
              {t('seller.bankInfo.title')}
            </Typography>
            <TextField
              fullWidth
              label={t('seller.bankInfo.bankName')}
              value={formData.bankInfo.bankName}
              onChange={(e) => handleChange('bankInfo', { ...formData.bankInfo, bankName: e.target.value })}
              required
            />
            <Box className="grid grid-cols-2 gap-4">
              <TextField
                fullWidth
                label={t('seller.bankInfo.agency')}
                value={formData.bankInfo.agency}
                onChange={(e) => handleChange('bankInfo', { ...formData.bankInfo, agency: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label={t('seller.bankInfo.accountNumber')}
                value={formData.bankInfo.accountNumber}
                onChange={(e) => handleChange('bankInfo', { ...formData.bankInfo, accountNumber: e.target.value })}
                required
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box className="max-w-4xl mx-auto">
      <Paper className="p-6">
        <Typography variant="h5" className="mb-6">
          {t('seller.title')}
        </Typography>

        <Stepper activeStep={activeStep} className="mb-8">
          {steps.map((step) => (
            <Step key={step}>
              <StepLabel>{t(`seller.steps.${step}`)}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length ? (
          <Box className="text-center">
            <Typography variant="h6" className="mb-4">
              {t('seller.success.title')}
            </Typography>
            <Typography color="textSecondary">
              {t('seller.success.message')}
            </Typography>
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" className="mb-4" onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            
            {getStepContent(activeStep)}
            
            <Box className="flex justify-between mt-8">
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {t('common.back')}
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                endIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {activeStep === steps.length - 1 
                  ? t('common.finish')
                  : t('common.next')}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default SellerProfileManagement;