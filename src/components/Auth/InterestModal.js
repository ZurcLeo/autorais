//frontend/src/components/Auth/InterestModal.js
import React, { useState } from 'react';
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
} from '@mui/material';
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const steps = ['modal_step1', 'modal_step2', 'modal_step3', 'modal_step4'];

const InterestModal = ({ open, handleClose }) => {
  const { t } = useTranslation();
  const [interestEmail, setInterestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);

  const handleStepChange = (newStep) => {
    setStep(newStep);
  };

  const handlePrevStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(interestEmail)) {
      setError(t('login.error_invalid_email'));
      return;
    }
    setLoading(true);
    try {
      // await handleInterestSubmit(interestEmail);
    } catch (error) {
      setError(t('login.error_submit'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          background: 'linear-gradient(135deg, #f6f6f6 0%, #e0e0e0 100%)',
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom>
          {t('login.modal_title')}
        </Typography>
        <Stepper activeStep={step}>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel onClick={() => handleStepChange(index)}>
                {t(`login.${label}`)}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        <br />
        <Box sx={{ overflow: "hidden", minHeight: "150px" }}>
  <AnimatePresence mode="wait">
    <motion.div
      key={step}
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent>
          <Typography variant="h5">{t(`login.${steps[step]}`)}</Typography>
          <Typography variant="body1">{t(`login.${steps[step]}_text`)}</Typography>
        </CardContent>
      </Card>
    </motion.div>
  </AnimatePresence>
</Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePrevStep}
            disabled={step === 0}
            startIcon={<ArrowBackIcon />}
          >
            {t('common.previous')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNextStep}
            disabled={step === steps.length - 1}
            endIcon={<ArrowForwardIcon />}
          >
            {t('common.next')}
          </Button>
        </Box>
        {step === steps.length - 1 && (
          <form onSubmit={handleSubmit}>
            <TextField
              label={t('login.interest_email_label')}
              variant="outlined"
              fullWidth
              margin="normal"
              value={interestEmail}
              onChange={(e) => setInterestEmail(e.target.value)}
              required
              autoComplete="email"
              error={!!error}
              helperText={error}
            />
            <Box sx={{ position: 'relative', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
              >
                {t('login.interest_button')}
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
          </form>
        )}
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ mt: 2, textAlign: 'center' }}
        >
          {t('login.privacy_agreement')} <a href="#">{t('common.terms_and_conditions')}</a> {t('login.and')} <a href="#">{t('common.privacy_policy')}</a>.
        </Typography>
      </Box>
    </Modal>
  );
};

export default InterestModal;