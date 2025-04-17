import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  IconButton,
  Paper,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import {
  AccountBalance,
  Person,
  Pix,
  Help,
  Check,
  Close,
  ArrowBack,
  ArrowForward,
  InfoOutlined
} from '@mui/icons-material';
import { useBanking } from '../../providers/BankingProvider';
import { useTranslation } from 'react-i18next';

// Tipos de conta bancária no Brasil
const ACCOUNT_TYPES = [
  { value: 'CHECKING', label: 'Conta Corrente' },
  { value: 'SAVINGS', label: 'Conta Poupança' },
  { value: 'SALARY', label: 'Conta Salário' },
  { value: 'PAYMENT', label: 'Conta de Pagamento' },
  { value: 'DIGITAL', label: 'Conta Digital' }
];

// Tipos de chave PIX
const PIX_KEY_TYPES = [
  { value: 'CPF', label: 'CPF' },
  { value: 'CNPJ', label: 'CNPJ' },
  { value: 'EMAIL', label: 'E-mail' },
  { value: 'PHONE', label: 'Telefone' },
  { value: 'RANDOM', label: 'Chave Aleatória' }
];

const ValidationIcon = ({ isValid }) => (
  <Fade in={true}>
    {isValid ? (
      <Check color="success" fontSize="small" />
    ) : (
      <Close color="error" fontSize="small" />
    )}
  </Fade>
);

const StepContent = ({ step, formData, handleInputChange, handleBankSelect, banks, errors }) => {
  const { t } = useTranslation();

  switch (step) {
    case 0:
      return (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            {t('banking.bankSelectionTitle')}
          </Typography>
          <Autocomplete
            options={banks}
            getOptionLabel={(option) => option?.fullName || ''}
            isOptionEqualToValue={(option, value) => option.code === value.code}
            onChange={handleBankSelect}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('banking.selectBank')}
                margin="normal"
                required
                error={!!errors.bankName}
                helperText={errors.bankName}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <AccountBalance color="action" sx={{ mr: 1 }} />
                }}
              />
            )}
          />
        </Box>
      );

    case 1:
      return (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            {t('banking.accountDetailsTitle')}
          </Typography>
          <TextField
            label={t('banking.agency')}
            name="agency"
            value={formData.agency}
            onChange={handleInputChange}
            fullWidth
            required
            margin="normal"
            error={!!errors.agency}
            helperText={errors.agency}
            InputProps={{
              endAdornment: formData.agency && <ValidationIcon isValid={!errors.agency} />
            }}
          />
          <TextField
            label={t('banking.accountNumber')}
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleInputChange}
            fullWidth
            required
            margin="normal"
            error={!!errors.accountNumber}
            helperText={errors.accountNumber}
            InputProps={{
              endAdornment: formData.accountNumber && <ValidationIcon isValid={!errors.accountNumber} />
            }}
          />
          <FormControl fullWidth margin="normal" error={!!errors.accountType}>
            <InputLabel>{t('banking.accountType')}</InputLabel>
            <Select
              name="accountType"
              value={formData.accountType}
              onChange={handleInputChange}
              required
            >
              {ACCOUNT_TYPES.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {t(`banking.${type.value.toLowerCase()}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      );

    case 2:
      return (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            {t('banking.holderDetailsTitle')}
          </Typography>
          <TextField
            label={t('banking.accountHolder')}
            name="accountHolder"
            value={formData.accountHolder}
            onChange={handleInputChange}
            fullWidth
            required
            margin="normal"
            error={!!errors.accountHolder}
            helperText={errors.accountHolder}
            InputProps={{
              startAdornment: <Person color="action" sx={{ mr: 1 }} />,
              endAdornment: formData.accountHolder && <ValidationIcon isValid={!errors.accountHolder} />
            }}
          />
        </Box>
      );

    case 3:
      return (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            {t('banking.pixDetailsTitle')}
            <Tooltip title={t('banking.pixInfoTooltip')}>
              <IconButton size="small">
                <InfoOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>{t('banking.pixKeyType')}</InputLabel>
            <Select
              name="pixKeyType"
              value={formData.pixKeyType}
              onChange={handleInputChange}
            >
              {PIX_KEY_TYPES.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {t(`banking.${type.value.toLowerCase()}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {formData.pixKeyType && (
            <TextField
              label={t('banking.pixKey')}
              name="pixKey"
              value={formData.pixKey}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              error={!!errors.pixKey}
              helperText={errors.pixKey}
              InputProps={{
                startAdornment: <Pix color="action" sx={{ mr: 1 }} />,
                endAdornment: formData.pixKey && <ValidationIcon isValid={!errors.pixKey} />
              }}
            />
          )}
        </Box>
      );

    default:
      return null;
  }
};

const BankAccountModal = ({ caixinhaId }) => {
  const { isModalOpen, setModalOpen, registerBankAccount } = useBanking();
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    bankCode: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    agency: '',
    accountType: '',
    pixKeyType: '',
    pixKey: ''
  });
  const [errors, setErrors] = useState({});

  // Busca lista de bancos da Brasil API
  useEffect(() => {
    if (isModalOpen && banks.length === 0) { // Garante que os bancos são buscados uma vez
      const fetchBanks = async () => {
        setLoading(true);
        try {
          const response = await fetch('https://brasilapi.com.br/api/banks/v1');
          const data = await response.json();
  
          const sortedBanks = data
            .filter(bank => bank.code) // Apenas bancos com código
            .sort((a, b) => parseInt(a.code) - parseInt(b.code)); // Ordena pelo código
  
          setBanks(sortedBanks.map(bank => ({
            code: bank.code,
            name: bank.name,
            fullName: `${bank.code} - ${bank.name}`,
          })));
        } catch (err) {
          setError(t('banking.errors.fetchBanksFailed'));
        } finally {
          setLoading(false);
        }
      };
  
      fetchBanks();
    }
  }, [isModalOpen, banks.length, t]);
  
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0:
        if (!formData.bankCode || !formData.bankName) {
          newErrors.bankName = t('banking.errors.bankRequired');
        }
        break;
      case 1:
        if (!formData.agency) newErrors.agency = t('banking.errors.agencyRequired');
        if (!formData.accountNumber) newErrors.accountNumber = t('banking.errors.accountRequired');
        if (!formData.accountType) newErrors.accountType = t('banking.errors.accountTypeRequired');
        break;
      case 2:
        if (!formData.accountHolder) {
          newErrors.accountHolder = t('banking.errors.holderRequired');
        }
        break;
      case 3:
        if (formData.pixKeyType && !formData.pixKey) {
          newErrors.pixKey = t('banking.errors.pixKeyRequired');
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim() 
    }));
  };

  const handleBankSelect = (event, newValue) => {
    if (newValue && newValue.code && newValue.name) {
      setFormData((prev) => ({
        ...prev,
        bankCode: String(newValue.code),
        bankName: String(newValue.name),
      }));
    } else {
      // Reseta os valores caso nenhum banco seja selecionado
      setFormData((prev) => ({
        ...prev,
        bankCode: '',
        bankName: '',
      }));
    }
  };

  const formatPixKey = (key, type) => {
    switch (type) {
      case 'CPF':
        return key.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      case 'CNPJ':
        return key.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      case 'PHONE':
        return key.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      default:
        return key;
    }
  };

  const handleSubmit = async () => {
    if (loading) return; // Impede múltiplas chamadas
    if (!validateStep(activeStep)) return;
  
    setLoading(true); // Define o estado de carregamento
    try {
      const formattedData = {
        ...formData,
        pixKey: formData.pixKey ? formatPixKey(formData.pixKey, formData.pixKeyType) : '',
      };
  
      await registerBankAccount(caixinhaId, formattedData); // Chama o registro
      setModalOpen(false); // Fecha o modal após sucesso
    } catch (err) {
      setError(t('banking.errors.registerAccountFailed')); // Mostra erro
    } finally {
      setLoading(false); // Sempre redefine o estado de carregamento
    }
  };  
  
  const steps = [
    t('banking.bank'),
    t('banking.account'),
    t('banking.holder'),
    t('banking.pix')
  ];

  return (
    <Dialog
      open={isModalOpen}
      onClose={() => setModalOpen(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '50vh'
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div">
          {t('banking.registerAccount')}
        </Typography>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <Paper elevation={0} sx={{ p: 2 }}>
            <StepContent
              step={activeStep}
              formData={formData}
              handleInputChange={handleInputChange}
              handleBankSelect={handleBankSelect}
              banks={banks}
              errors={errors}
            />
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
  <Button
    onClick={() => setModalOpen(false)}
    startIcon={<Close />}
    disabled={loading} // Desativa botão enquanto carrega
  >
    {t('common.cancel')}
  </Button>
  <Box sx={{ flex: '1 1 auto' }} />
  <Button
    onClick={handleBack}
    startIcon={<ArrowBack />}
    disabled={loading || activeStep === 0} // Controla desativação
    sx={{ mr: 1 }}
  >
    {t('common.back')}
  </Button>
  {activeStep === steps.length - 1 ? (
    <Button
      variant="contained"
      onClick={handleSubmit}
      disabled={loading} // Desativa botão enquanto carrega
      endIcon={<Check />}
    >
      {t('common.finish')}
    </Button>
  ) : (
    <Button
      variant="contained"
      onClick={handleNext}
      disabled={loading} // Controla requisições consecutivas
      endIcon={<ArrowForward />}
    >
      {t('common.next')}
    </Button>
  )}
</DialogActions>

    </Dialog>
  );
};

export default BankAccountModal;