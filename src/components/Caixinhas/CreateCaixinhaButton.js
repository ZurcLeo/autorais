import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Box,
  Select,
  MenuItem,
  Tooltip,
  Typography,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Info as InfoIcon } from '@mui/icons-material';
import { useCaixinha } from '../../providers/CaixinhaProvider';
import { showToast } from '../../../src/utils/toastUtils';
import { useTranslation } from 'react-i18next';

const steps = ['basicInfo', 'settings', 'review'];

const CreateCaixinhaButton = () => {
  const { t } = useTranslation();
  const { createCaixinha } = useCaixinha();
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contribuicaoMensal: '',
    diaVencimento: 1,
    duracaoMeses: '12',
    distribuicaoTipo: 'sorteio',
    permiteEmprestimos: 'sim',
    valorMulta: '', // Novo campo
    valorJuros: '', // Novo campo
  });
  const [error, setError] = useState('');

  const handleOpen = () => {
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setActiveStep(0);
    setFormData({
      name: '',
      description: '',
      contribuicaoMensal: '',
      diaVencimento: 1,
      duracaoMeses: '12',
      distribuicaoTipo: 'sorteio',
      permiteEmprestimos: 'sim',
      valorMulta: '',
      valorJuros: '',
    });
    setError('');
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return formData.name && formData.contribuicaoMensal && formData.diaVencimento;
      case 1:
        if (formData.permiteEmprestimos === 'sim') {
          return formData.valorMulta && formData.valorJuros;
        }
        return true;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      await createCaixinha({
        ...formData,
        contribuicaoMensal: Number(formData.contribuicaoMensal),
        duracaoMeses: Number(formData.duracaoMeses),
        diaVencimento: Number(formData.diaVencimento),
        permiteEmprestimos: formData.permiteEmprestimos === 'sim',
        valorMulta: formData.valorMulta ? Number(formData.valorMulta) : null,
        valorJuros: formData.valorJuros ? Number(formData.valorJuros) : null,
      });
      showToast(t('successMessage'), { type: 'success' });
      handleClose();
    } catch (err) {
      const errorMessage = err.message || t('errorMessage');
      setError(errorMessage);
      showToast(errorMessage, { type: 'error' });
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              fullWidth
              label={t('fields.name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('fields.description')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label={t('fields.monthlyContribution')}
              value={formData.contribuicaoMensal}
              onChange={(e) => setFormData({ ...formData, contribuicaoMensal: e.target.value })}
              margin="normal"
              required
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">{t('currency')}</InputAdornment>,
              }}
            />
            <FormControl fullWidth margin="normal" required>
              <FormLabel>{t('fields.paymentDay')}</FormLabel>
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
              <Typography variant="caption" color="textSecondary">
                {t('fields.paymentDayInfo')}
              </Typography>
            </FormControl>
          </>
        );
      case 1:
        return (
          <>
            <FormControl component="fieldset" margin="normal">
              <FormLabel>{t('fields.duration')}</FormLabel>
              <RadioGroup
                value={formData.duracaoMeses}
                onChange={(e) => setFormData({ ...formData, duracaoMeses: e.target.value })}
              >
                <FormControlLabel value="12" control={<Radio />} label={t('fields.12Months')} />
                <FormControlLabel value="24" control={<Radio />} label={t('fields.24Months')} />
              </RadioGroup>
            </FormControl>
            <FormControl component="fieldset" margin="normal">
              <FormLabel>{t('fields.distributionType')}</FormLabel>
              <RadioGroup
                value={formData.distribuicaoTipo}
                onChange={(e) => setFormData({ ...formData, distribuicaoTipo: e.target.value })}
              >
                <FormControlLabel value="sorteio" control={<Radio />} label={t('fields.lottery')} />
                <FormControlLabel value="ordem" control={<Radio />} label={t('fields.definedOrder')} />
              </RadioGroup>
            </FormControl>
            <FormControl component="fieldset" margin="normal">
              <FormLabel>{t('fields.allowLoans')}</FormLabel>
              <RadioGroup
                value={formData.permiteEmprestimos}
                onChange={(e) => setFormData({ ...formData, permiteEmprestimos: e.target.value })}
              >
                <FormControlLabel value="sim" control={<Radio />} label={t('yes')} />
                <FormControlLabel value="nao" control={<Radio />} label={t('no')} />
              </RadioGroup>
            </FormControl>

            {formData.permiteEmprestimos === 'sim' && (
              <>
                <TextField
                  fullWidth
                  label={t('fields.fineAmount')}
                  value={formData.valorMulta}
                  onChange={(e) => setFormData({ ...formData, valorMulta: e.target.value })}
                  margin="normal"
                  required
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">{t('currency')}</InputAdornment>,
                  }}
                />
                <TextField
                  fullWidth
                  label={t('fields.interestRate')}
                  value={formData.valorJuros}
                  onChange={(e) => setFormData({ ...formData, valorJuros: e.target.value })}
                  margin="normal"
                  required
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">{t('percentage')}</InputAdornment>,
                  }}
                />
              </>
            )}
          </>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info">
              {t('reviewMessage')}
              <ul>
                <li>{t('fields.name')}: {formData.name}</li>
                <li>{t('fields.monthlyContribution')}: {t('currency')} {formData.contribuicaoMensal}</li>
                <li>{t('fields.paymentDay')}: {formData.diaVencimento}</li>
                <li>{t('fields.duration')}: {formData.duracaoMeses} {t('months')}</li>
                <li>{t('fields.distributionType')}: {t(formData.distribuicaoTipo)}</li>
                <li>{t('fields.allowLoans')}: {formData.permiteEmprestimos === 'sim' ? t('yes') : t('no')}</li>
                {formData.permiteEmprestimos === 'sim' && (
                  <>
                    <li>{t('fields.fineAmount')}: {t('currency')} {formData.valorMulta}</li>
                    <li>{t('fields.interestRate')}: {formData.valorJuros}{t('percentage')}</li>
                  </>
                )}
              </ul>
            </Alert>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleOpen}
      >
        {t('newCaixinha')}
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('dialogTitle')}</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mt: 2, mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{t(label)}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {renderStepContent(activeStep)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('cancel')}</Button>
          {activeStep > 0 && (
            <Button onClick={handleBack}>
              {t('back')}
            </Button>
          )}
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={!isStepValid()}
          >
            {activeStep === steps.length - 1 ? t('create') : t('next')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateCaixinhaButton;