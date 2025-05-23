import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Box,
  Grid,
  Alert,
  InputAdornment
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRifa } from '../../providers/RifaProvider';

const CreateRifaForm = ({ open, onClose, caixinhaId }) => {
  const { t } = useTranslation();
  const { createRifa, loading, error } = useRifa();
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    valorBilhete: '',
    quantidadeBilhetes: '',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: '',
    premio: '',
    sorteioData: '',
    sorteioMetodo: 'RANDOM_ORG',
    sorteioReferencia: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      await createRifa(caixinhaId, formData);
      onClose();
    } catch (err) {
      console.error('Erro ao criar rifa:', err);
    }
  };

  const isFormValid = () => {
    return (
      formData.nome &&
      formData.descricao &&
      formData.valorBilhete &&
      formData.quantidadeBilhetes &&
      formData.dataFim &&
      formData.premio &&
      formData.sorteioData &&
      formData.sorteioMetodo
    );
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          {t('rifas.createRifa')}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label={t('rifas.name')}
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label={t('rifas.description')}
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('rifas.ticketPrice')}
              name="valorBilhete"
              type="number"
              value={formData.valorBilhete}
              onChange={handleInputChange}
              fullWidth
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('rifas.ticketQuantity')}
              name="quantidadeBilhetes"
              type="number"
              value={formData.quantidadeBilhetes}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('rifas.endDate')}
              name="dataFim"
              type="date"
              value={formData.dataFim}
              onChange={handleInputChange}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: today,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('rifas.drawDate')}
              name="sorteioData"
              type="date"
              value={formData.sorteioData}
              onChange={handleInputChange}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: formData.dataFim || today,
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label={t('rifas.prize')}
              name="premio"
              value={formData.premio}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>{t('rifas.drawMethod')}</InputLabel>
              <Select
                name="sorteioMetodo"
                value={formData.sorteioMetodo}
                onChange={handleInputChange}
                label={t('rifas.drawMethod')}
              >
                <MenuItem value="RANDOM_ORG">{t('rifas.drawMethod.random')}</MenuItem>
                <MenuItem value="LOTERIA">{t('rifas.drawMethod.lottery')}</MenuItem>
                <MenuItem value="NIST">{t('rifas.drawMethod.nist')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {formData.sorteioMetodo === 'LOTERIA' && (
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('rifas.referenceNumber')}
                name="sorteioReferencia"
                value={formData.sorteioReferencia}
                onChange={handleInputChange}
                fullWidth
                helperText={t('rifas.referenceHelp')}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSubmit}
          disabled={!isFormValid() || loading}
        >
          {loading ? t('common.saving') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateRifaForm;