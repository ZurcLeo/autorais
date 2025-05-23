import React, { useState, useCallback, useMemo } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  useMediaQuery,
  LinearProgress,
  Tooltip,
  Zoom,
  Fade
} from '@mui/material';
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

// Componente de passo do modal
const StepContent = ({ step, currentStep, children }) => {
  if (step !== currentStep) return null;
  
  return (
    <motion.div
      key={`step-${step}`}
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

const InterestModal = ({ open, handleClose }) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  
  const [interestEmail, setInterestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const [validEmail, setValidEmail] = useState(false);
  const [touched, setTouched] = useState(false);

  const steps = useMemo(() => ['modal_step1', 'modal_step2', 'modal_step3', 'modal_step4'], []);
  
  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step, steps.length]);

  // Função para confirmar o fechamento quando há dados digitados
  const confirmClose = useCallback(() => {
    // Pedir confirmação apenas se o usuário já preencheu algo
    if (step > 0 || interestEmail) {
      if (window.confirm(t('login.confirm_close'))) {
        handleClose();
      }
    } else {
      handleClose();
    }
  }, [step, interestEmail, handleClose, t]);

  // Manipulador de cliques no backdrop
  const handleBackdropClick = useCallback((e) => {
    e.stopPropagation();
    confirmClose();
  }, [confirmClose]);

  const handleStepChange = useCallback((newStep) => {
    if (newStep >= 0 && newStep < steps.length) {
      setStep(newStep);
    }
  }, [steps.length]);

  const handlePrevStep = useCallback(() => {
    handleStepChange(step - 1);
  }, [step, handleStepChange]);

  const handleNextStep = useCallback(() => {
    handleStepChange(step + 1);
  }, [step, handleStepChange]);

  const validateEmail = useCallback((email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }, []);

  const handleEmailChange = useCallback((e) => {
    const email = e.target.value;
    setInterestEmail(email);
    setValidEmail(validateEmail(email));
    if (touched) {
      setError(!validateEmail(email) ? t('login.error_invalid_email') : '');
    }
  }, [validateEmail, touched, t]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    setError(!validateEmail(interestEmail) ? t('login.error_invalid_email') : '');
  }, [interestEmail, validateEmail, t]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(interestEmail)) {
      setError(t('login.error_invalid_email'));
      return;
    }
    
    setLoading(true);
    try {
      // Simulação de envio com delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      // await handleInterestSubmit(interestEmail);
      handleClose();
    } catch (error) {
      setError(t('login.error_submit'));
    } finally {
      setLoading(false);
    }
  }, [interestEmail, validateEmail, t, handleClose]);

  const buttonProps = useMemo(() => {
    const isLastStep = step === steps.length - 1;
    
    return {
      next: {
        text: isLastStep ? t('common.submit') : t('common.next'),
        icon: isLastStep ? <CheckCircleIcon /> : <ArrowForwardIcon />,
        action: isLastStep ? handleSubmit : handleNextStep,
        disabled: isLastStep ? (loading || !validEmail) : (step === steps.length - 1)
      },
      prev: {
        text: t('common.previous'),
        icon: <ArrowBackIcon />,
        action: handlePrevStep,
        disabled: step === 0
      }
    };
  }, [step, steps.length, t, handlePrevStep, handleNextStep, handleSubmit, loading, validEmail]);

  return (
    <Modal 
      open={open} 
      onClose={handleBackdropClick}
      closeAfterTransition
      aria-labelledby="interest-modal-title"
      aria-describedby="interest-modal-description"
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '90%' : 400,
            maxHeight: '90vh',
            overflow: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: isMobile ? 2 : 4,
          }}
        >
          {/* Botão de fechar no canto superior direito */}
          <Box sx={{ 
            position: 'absolute',
            top: 8,
            right: 8,
          }}>
            <IconButton 
              aria-label="close" 
              onClick={confirmClose}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom
            id="interest-modal-title"
            sx={{ 
              fontWeight: 600,
              mb: 2,
              color: 'primary.main'
            }}
          >
            {t('login.modal_title')}
          </Typography>
          
          {/* Barra de progresso linear */}
          <Box sx={{ mb: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                mb: 1,
                bgcolor: 'grey.300',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4
                }
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block', 
                textAlign: 'right',
                color: 'text.secondary'
              }}
            >
              {Math.round(progress)}% {t('common.completed')}
            </Typography>
          </Box>
          
          {/* Stepper para navegação entre passos */}
          <Stepper 
            activeStep={step}
            alternativeLabel={!isMobile}
            orientation={isMobile ? "vertical" : "horizontal"}
            sx={{ mb: 3 }}
          >
            {steps.map((label, index) => (
              <Step key={index}>
                <Tooltip title={t(`login.${label}_tooltip`)} arrow>
                  <StepLabel 
                    onClick={() => handleStepChange(index)}
                    sx={{ cursor: 'pointer' }}
                  >
                    {!isMobile && t(`login.${label}`)}
                  </StepLabel>
                </Tooltip>
              </Step>
            ))}
          </Stepper>
          
          {/* Conteúdo animado dos passos */}
          <Box 
            sx={{ 
              overflow: "hidden", 
              minHeight: isMobile ? "120px" : "150px",
              mb: 3
            }}
          >
            <AnimatePresence mode="wait">
              {step === 0 && (
                <StepContent step={0} currentStep={step} key="step-content-0">
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        {t('login.modal_step1')}
                      </Typography>
                      <Typography variant="body1">
                        {t('login.modal_step1_text')}
                      </Typography>
                    </CardContent>
                  </Card>
                </StepContent>
              )}
              {step === 1 && (
                <StepContent step={1} currentStep={step} key="step-content-1">
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        {t('login.modal_step2')}
                      </Typography>
                      <Typography variant="body1">
                        {t('login.modal_step2_text')}
                      </Typography>
                    </CardContent>
                  </Card>
                </StepContent>
              )}
              {step === 2 && (
                <StepContent step={2} currentStep={step} key="step-content-2">
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        {t('login.modal_step3')}
                      </Typography>
                      <Typography variant="body1">
                        {t('login.modal_step3_text')}
                      </Typography>
                    </CardContent>
                  </Card>
                </StepContent>
              )}
              {step === 3 && (
                <StepContent step={3} currentStep={step} key="step-content-3">
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        {t('login.modal_step4')}
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {t('login.modal_step4_text')}
                      </Typography>
                      
                      <form onSubmit={handleSubmit}>
                        <TextField
                          label={t('login.interest_email_label')}
                          variant="outlined"
                          fullWidth
                          margin="normal"
                          value={interestEmail}
                          onChange={handleEmailChange}
                          onBlur={handleBlur}
                          required
                          autoComplete="email"
                          error={!!error}
                          helperText={error}
                          InputProps={{
                            endAdornment: touched && (
                              validEmail ? 
                                <Zoom in={validEmail}>
                                  <CheckCircleIcon color="success" />
                                </Zoom> : 
                                error ? 
                                  <Zoom in={!!error}>
                                    <ErrorIcon color="error" />
                                  </Zoom> : null
                            )
                          }}
                        />
                      </form>
                      
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mt: 2, 
                          bgcolor: 'info.lighter', 
                          p: 1, 
                          borderRadius: 1 
                        }}
                      >
                        <InfoIcon color="info" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="info.main">
                          {t('login.email_info_text')}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </StepContent>
              )}
            </AnimatePresence>
          </Box>
          
          {/* Botões de navegação */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 2,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1 : 0
          }}>
            <Box>
              {/* Botão de cancelar adicionado */}
              <Button
                variant="outlined"
                color="secondary"
                onClick={confirmClose}
                disabled={loading}
                sx={{
                  mr: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
              >
                {t('common.cancel')}
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                onClick={buttonProps.prev.action}
                disabled={buttonProps.prev.disabled || loading}
                startIcon={buttonProps.prev.icon}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(-3px)'
                  }
                }}
              >
                {buttonProps.prev.text}
              </Button>
            </Box>
            
            <Box sx={{ position: 'relative' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={buttonProps.next.action}
                disabled={buttonProps.next.disabled || loading}
                endIcon={buttonProps.next.icon}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover:not(:disabled)': {
                    transform: 'translateX(3px)'
                  }
                }}
              >
                {buttonProps.next.text}
              </Button>
              {loading && (
                <CircularProgress
                  size={24}
                  sx={{
                    color: 'primary.main',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              )}
            </Box>
          </Box>
          
          {/* Footer com textos legais */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 3, textAlign: 'center', fontSize: '0.75rem' }}
          >
            {t('login.privacy_agreement')} 
            <Button 
              href="#terms" 
              color="primary" 
              size="small" 
              sx={{ 
                minWidth: 'auto', 
                p: '0 4px', 
                fontWeight: 'bold',
                fontSize: '0.75rem'
              }}
            >
              {t('common.terms_and_conditions')}
            </Button> 
            {t('login.and')} 
            <Button 
              href="#privacy" 
              color="primary" 
              size="small" 
              sx={{ 
                minWidth: 'auto', 
                p: '0 4px', 
                fontWeight: 'bold',
                fontSize: '0.75rem'
              }}
            >
              {t('common.privacy_policy')}
            </Button>.
          </Typography>
        </Box>
      </Fade>
    </Modal>
  );
};

export default InterestModal;