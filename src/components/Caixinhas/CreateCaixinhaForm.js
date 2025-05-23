import React, { useState } from 'react';
import {
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Typography,
  Select,
  MenuItem,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Alert,
  Chip,
  Button,
  Stack,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Info as InfoIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarTodayIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Shuffle as ShuffleIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  WarningAmber as WarningAmberIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Close as CloseIcon
} from '@mui/icons-material';
// import { useToast } from '../../providers/ToastProvider';
import { useCaixinha } from '../../providers/CaixinhaProvider';
import { useTranslation } from 'react-i18next';

const CreateCaixinhaForm = ({ onClose, onCreateSuccess }) => {
  const { t } = useTranslation();
  // const { showToast } = useToast();
  const { createCaixinha } = useCaixinha();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contribuicaoMensal: 0,
    diaVencimento: 5,
    duracaoMeses: 12,
    distribuicaoTipo: 'sorteio',
    permiteEmprestimos: false,
    valorMulta: 0,
    valorJuros: 0
  });

  const steps = ['basicInfo', 'configuration', 'review'];

  const handleNext = async () => {
    setError(null);
    
    if (activeStep === steps.length - 1) {
      // This is the final step, create the caixinha
      try {
        setLoading(true);
        await createCaixinha(formData);
        
        if (onCreateSuccess) {
          onCreateSuccess();
        }
        
        onClose();
      } catch (err) {
        console.error('Erro ao criar caixinha:', err);
        
        // Log detalhado para depuração
        if (err.validationErrors) {
          console.error('Erros de validação por campo:', err.validationErrors);
        }
        
        const errorMessage = err.validationErrors 
          ? Object.entries(err.validationErrors)
              .map(([field, message]) => `${field}: ${message}`)
              .join('\n')
          : err.message || t('errorCreating');
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return formData.name && formData.contribuicaoMensal && formData.diaVencimento;
      case 1:
        if (formData.permiteEmprestimos === true) {
          return formData.duracaoMeses && formData.distribuicaoTipo && 
                formData.valorMulta && formData.valorJuros;
        }
        return formData.duracaoMeses && formData.distribuicaoTipo;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const renderBasicInfoStep = () => (
    <Card sx={{ mt: 2, p: 0, borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('basicInformation')}
        </Typography>
        
        <Stack spacing={3} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label={t('fields.name')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            variant="outlined"
          />
          
          <TextField
            fullWidth
            label={t('fields.description')}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
            variant="outlined"
          />
          
          <TextField
            fullWidth
            label={t('fields.monthlyContribution')}
            value={formData.contribuicaoMensal}
            onChange={(e) => setFormData({ ...formData, contribuicaoMensal: e.target.value })}
            required
            type="number"
            variant="outlined"
            InputProps={{
              startAdornment: <InputAdornment position="start">{t('currency')}</InputAdornment>,
            }}
          />
          
          <FormControl fullWidth required variant="outlined">
            <FormLabel sx={{ mb: 1 }}>{t('fields.paymentDay')}</FormLabel>
            <Select
              value={formData.diaVencimento}
              onChange={(e) => setFormData({ ...formData, diaVencimento: e.target.value })}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <MenuItem key={day} value={day}>
                  {day}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              {t('fields.paymentDayInfo')}
            </Typography>
          </FormControl>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderConfigurationStep = () => (
    <Card sx={{ mt: 2, p: 0, borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary">
          {t('configurationSettings')}
        </Typography>
        
        <Stack spacing={3} sx={{ mt: 3 }}>
          <FormControl component="fieldset">
            <FormLabel sx={{ mb: 1 }}>{t('fields.duration')}</FormLabel>
            <RadioGroup
              value={formData.duracaoMeses}
              onChange={(e) => setFormData({ ...formData, duracaoMeses: e.target.value })}
            >
              <Stack direction="row" spacing={2}>
                <FormControlLabel value="12" control={<Radio color="primary" />} label={t('fields.12Months')} />
                <FormControlLabel value="24" control={<Radio color="primary" />} label={t('fields.24Months')} />
              </Stack>
            </RadioGroup>
          </FormControl>
          
          <Divider />
          
          <FormControl component="fieldset">
            <FormLabel sx={{ mb: 1 }}>{t('fields.distributionType')}</FormLabel>
            <RadioGroup
              value={formData.distribuicaoTipo}
              onChange={(e) => setFormData({ ...formData, distribuicaoTipo: e.target.value })}
            >
              <Stack direction="row" spacing={2}>
                <FormControlLabel 
                  value="sorteio" 
                  control={<Radio color="primary" />} 
                  label={
                    <Box display="flex" alignItems="center">
                      <ShuffleIcon color="secondary" sx={{ mr: 1 }} />
                      <span>{t('fields.lottery')}</span>
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="ordem" 
                  control={<Radio color="primary" />} 
                  label={
                    <Box display="flex" alignItems="center">
                      <HourglassEmptyIcon color="warning" sx={{ mr: 1 }} />
                      <span>{t('fields.definedOrder')}</span>
                    </Box>
                  } 
                />
              </Stack>
            </RadioGroup>
          </FormControl>
          
          <Divider />
          
          <FormControl component="fieldset">
            <FormLabel sx={{ mb: 1 }}>{t('fields.allowLoans')}</FormLabel>
            <RadioGroup
              value={formData.permiteEmprestimos ? "true" : "false"}
              onChange={(e) => setFormData({ ...formData, permiteEmprestimos: e.target.value === "true" })}
            >
              <Stack direction="row" spacing={2}>
                <FormControlLabel 
                  value="true" 
                  control={<Radio color="primary" />} 
                  label={
                    <Box display="flex" alignItems="center">
                      <ThumbUpIcon color="success" sx={{ mr: 1 }} />
                      <span>{t('yes')}</span>
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="false" 
                  control={<Radio color="primary" />} 
                  label={
                    <Box display="flex" alignItems="center">
                      <ThumbDownIcon color="error" sx={{ mr: 1 }} />
                      <span>{t('no')}</span>
                    </Box>
                  } 
                />
              </Stack>
            </RadioGroup>
          </FormControl>

          {formData.permiteEmprestimos === true && (
            <Stack spacing={3} sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="primary">
                {t('loanSettings')}
              </Typography>
              
              <TextField
                fullWidth
                label={t('fields.fineAmount')}
                value={formData.valorMulta}
                onChange={(e) => setFormData({ ...formData, valorMulta: e.target.value })}
                required
                type="number"
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">{t('currency')}</InputAdornment>,
                }}
              />
              
              <TextField
                fullWidth
                label={t('fields.interestRate')}
                value={formData.valorJuros}
                onChange={(e) => setFormData({ ...formData, valorJuros: e.target.value })}
                required
                type="number"
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">{t('percentage')}</InputAdornment>,
                }}
              />
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  const renderReviewStep = () => (
    <Card sx={{ mt: 2, p: 0, borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
          <CheckCircleIcon color="success" sx={{ mr: 2 }} />
          <Typography variant="h6" color="primary">
            {t('reviewConfirmation')}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <List disablePadding>
          <ListItem sx={{ py: 1.5, px: 0 }}>
            <ListItemIcon>
              <Avatar sx={{ bgcolor: 'primary.light' }}>
                <PersonIcon />
              </Avatar>
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="subtitle2" color="text.primary">
                  {t('fields.name')}
                </Typography>
              } 
              secondary={formData.name} 
            />
          </ListItem>
          
          <Divider variant="inset" component="li" />
          
          <ListItem sx={{ py: 1.5, px: 0 }}>
            <ListItemIcon>
              <Avatar sx={{ bgcolor: 'grey.200' }}>
                <InfoIcon />
              </Avatar>
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="subtitle2" color="text.primary">
                  {t('fields.description')}
                </Typography>
              } 
              secondary={formData.description || t('noDescription')} 
            />
          </ListItem>
          
          <Divider variant="inset" component="li" />
          
          <ListItem sx={{ py: 1.5, px: 0 }}>
            <ListItemIcon>
              <Avatar sx={{ bgcolor: 'success.light' }}>
                <AttachMoneyIcon />
              </Avatar>
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="subtitle2" color="text.primary">
                  {t('fields.monthlyContribution')}
                </Typography>
              } 
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={`${t('currency')} ${formData.contribuicaoMensal}`} 
                    color="success" 
                    size="small" 
                    variant="outlined" 
                  />
                </Box>
              }
              secondaryTypographyProps={{ 
                component: "div"
              }}
            />
          </ListItem>
          
          <Divider variant="inset" component="li" />
          
          <ListItem sx={{ py: 1.5, px: 0 }}>
            <ListItemIcon>
              <Avatar sx={{ bgcolor: 'grey.200' }}>
                <CalendarTodayIcon />
              </Avatar>
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="subtitle2" color="text.primary">
                  {t('fields.paymentDay')}
                </Typography>
              } 
              secondary={`${t('day')} ${formData.diaVencimento}`} 
            />
          </ListItem>
          
          <Divider variant="inset" component="li" />
          
          <ListItem sx={{ py: 1.5, px: 0 }}>
            <ListItemIcon>
              <Avatar sx={{ bgcolor: 'warning.light' }}>
                <HourglassEmptyIcon />
              </Avatar>
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="subtitle2" color="text.primary">
                  {t('fields.duration')}
                </Typography>
              }
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={`${formData.duracaoMeses} ${t('months')}`} 
                    color="warning" 
                    size="small" 
                    variant="outlined" 
                  />
                </Box>
              }
              secondaryTypographyProps={{ 
                component: "div"
              }}
            />
          </ListItem>
          
          <Divider variant="inset" component="li" />
          
          <ListItem sx={{ py: 1.5, px: 0 }}>
            <ListItemIcon>
              <Avatar sx={{ bgcolor: 'secondary.light' }}>
                <ShuffleIcon />
              </Avatar>
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="subtitle2" color="text.primary">
                  {t('fields.distributionType')}
                </Typography>
              }
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    icon={formData.distribuicaoTipo === 'sorteio' ? <ShuffleIcon fontSize="small" /> : <HourglassEmptyIcon fontSize="small" />}
                    label={t(formData.distribuicaoTipo)} 
                    color="secondary" 
                    size="small" 
                    variant="outlined" 
                  />
                </Box>
              }
              secondaryTypographyProps={{ 
                component: "div"
              }}
            />
          </ListItem>
          
          <Divider variant="inset" component="li" />
          
          <ListItem sx={{ py: 1.5, px: 0 }}>
            <ListItemIcon>
              <Avatar sx={{ bgcolor: formData.permiteEmprestimos === true ? 'primary.light' : 'error.light' }}>
                {formData.permiteEmprestimos === true ? <ThumbUpIcon /> : <ThumbDownIcon />}
              </Avatar>
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="subtitle2" color="text.primary">
                  {t('fields.allowLoans')}
                </Typography>
              }
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={formData.permiteEmprestimos === true ? t('yes') : t('no')} 
                    color={formData.permiteEmprestimos === true ? 'primary' : 'error'} 
                    size="small" 
                    variant="outlined" 
                  />
                </Box>
              }
              secondaryTypographyProps={{ 
                component: "div"
              }}
            />
          </ListItem>
          
          {formData.permiteEmprestimos === true && (
            <>
              <Divider variant="inset" component="li" />
              
              <ListItem sx={{ py: 1.5, px: 0 }}>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'error.light' }}>
                    <WarningAmberIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography variant="subtitle2" color="text.primary">
                      {t('fields.fineAmount')}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={`${t('currency')} ${formData.valorMulta}`} 
                        color="error" 
                        size="small" 
                        variant="outlined" 
                      />
                    </Box>
                  }
                  secondaryTypographyProps={{ 
                    component: "div"
                  }}
                />
              </ListItem>
              
              <Divider variant="inset" component="li" />
              
              <ListItem sx={{ py: 1.5, px: 0 }}>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'success.light' }}>
                    <TrendingUpIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography variant="subtitle2" color="text.primary">
                      {t('fields.interestRate')}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={`${formData.valorJuros}${t('percentage')}`} 
                        color="success" 
                        size="small" 
                        variant="outlined" 
                      />
                    </Box>
                  }
                  secondaryTypographyProps={{ 
                    component: "div"
                  }}
                />
              </ListItem>
            </>
          )}
        </List>
        
        <Divider sx={{ mt: 3, mb: 2 }} />
        
        <Box sx={{ bgcolor: 'info.light', p: 2, borderRadius: 1 }}>
          <Typography variant="body2" color="info.dark">
            {t('reviewMessage')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return renderConfigurationStep();
      case 2:
        return renderReviewStep();
      default:
        return null;
    }
  };

  return (
    <>
      <DialogContent sx={{ px: 3, pb: 3 }}>
        <Stepper 
          activeStep={activeStep} 
          sx={{ 
            mt: 2, 
            mb: 4,
            py: 2,
            '& .MuiStepLabel-root': {
              color: 'primary.main'
            }
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{t(label)}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              borderRadius: 2,
              boxShadow: 2
            }}
          >
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
          startIcon={<CloseIcon />}
          sx={{ borderRadius: 2 }}
        >
          {t('cancel')}
        </Button>
        
        <Box sx={{ flex: 1 }} />
        
        {activeStep > 0 && (
          <Button 
            onClick={handleBack} 
            disabled={loading}
            variant="outlined"
            startIcon={<NavigateBeforeIcon />}
            sx={{ borderRadius: 2, mr: 1 }}
          >
            {t('back')}
          </Button>
        )}
        
        <Button
          onClick={handleNext}
          variant="contained"
          color="primary"
          disabled={!isStepValid() || loading}
          endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <NavigateNextIcon />}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {activeStep === steps.length - 1 ? t('create') : t('next')}
        </Button>
      </DialogActions>
    </>
  );
};

export default CreateCaixinhaForm;