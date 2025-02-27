import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/_AuthContext';
import { useCaixinha } from '../../context/CaixinhaContext';
import CaixinhaOverview from './CaixinhaOverview';
import CaixinhaList from './CaixinhaList';
import CaixinhaStats from './CaixinhaStats';
import CreateCaixinhaButton from './CreateCaixinhaButton';
import { showToast } from '../../utils/toastUtils';
import { useTranslation } from 'react-i18next';

const CaixinhaPage = () => {
  const { currentUser } = useAuth();
  const { caixinhas = [], loading, error } = useCaixinha();
  const [selectedCaixinha, setSelectedCaixinha] = useState(null);
  const { t } = useTranslation();

  // Handle errors from the context
  useEffect(() => {
    if (error) {
      showToast(t('errors.generic', { error: error.message }), { type: 'error' });
    }
  }, [error, t]);

  // Show a loader while data is being fetched
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Header Section */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1">
              {t('myCaixinhas')}
            </Typography>
            <CreateCaixinhaButton />
          </Box>
        </Grid>

        {/* Stats Overview */}
        <Grid item xs={12}>
          <CaixinhaStats caixinhas={caixinhas} />
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={4}>
          <CaixinhaList 
            caixinhas={caixinhas}
            selectedId={selectedCaixinha?.id}
            onSelect={setSelectedCaixinha}
          />
        </Grid>
        
        <Grid item xs={12} md={8}>
          {selectedCaixinha ? (
            <CaixinhaOverview caixinha={selectedCaixinha} />
          ) : (
            <Typography variant="body1" color="textSecondary" align="center">
              {t('selectCaixinha')}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default CaixinhaPage;
