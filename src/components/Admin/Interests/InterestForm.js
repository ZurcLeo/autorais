import React, { useState, useEffect } from 'react';
import { serviceLocator } from '../../../core/services/BaseService';
import { toast } from 'react-toastify';
import {
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
} from '@mui/material';

const InterestForm = ({ initialValues, categories, onSubmit, onCancel }) => {
  const [interest, setInterest] = useState(initialValues || { label: '', description: '', categoryId: '', active: true });
  const [loading, setLoading] = useState(false);
  const interestsService = serviceLocator('interestsService')

  useEffect(() => {
    setInterest(initialValues || { label: '', description: '', categoryId: '', active: true });
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInterest(prevInterest => ({
      ...prevInterest,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!interest.label || !interest.categoryId) {
      toast.warning('Nome e categoria são obrigatórios');
      return;
    }
    setLoading(true);
    try {
      if (initialValues?.id) {
        await interestsService.updateInterest(initialValues.id, interest);
        toast.success('Interesse atualizado com sucesso!');
      } else {
        await interestsService.createInterest(interest);
        toast.success('Interesse criado com sucesso!');
      }
      onSubmit(interest);
      onCancel();
    } catch (error) {
      console.error('Erro ao salvar interesse:', error);
      toast.error('Erro ao salvar interesse. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Nome"
            name="label"
            value={interest.label}
            onChange={handleChange}
            placeholder="Nome do interesse"
            required
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel id="interestCategoryLabel">Categoria</InputLabel>
            <Select
              labelId="interestCategoryLabel"
              id="interestCategory"
              name="categoryId"
              value={interest.categoryId}
              label="Categoria"
              onChange={handleChange}
            >
              <MenuItem value="">Selecione uma categoria</MenuItem>
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Descrição"
            name="description"
            value={interest.description}
            onChange={handleChange}
            placeholder="Descrição (opcional)"
          />
        </Grid>
        {initialValues?.id && (
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  name="active"
                  checked={interest.active}
                  onChange={handleChange}
                />
              }
              label="Status"
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : initialValues?.id ? 'Salvar' : 'Adicionar'}
            </Button>
            <Button type="button" onClick={onCancel} variant="outlined" disabled={loading}>
              Cancelar
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InterestForm;