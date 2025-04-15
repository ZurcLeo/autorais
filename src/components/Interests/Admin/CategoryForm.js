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
  CircularProgress,
} from '@mui/material';

const CategoryForm = ({ initialValues, onSubmit, onCancel }) => {
  const [category, setCategory] = useState(initialValues || { name: '', description: '', active: true });
  const [loading, setLoading] = useState(false);
  const interestsService = serviceLocator('interestsService')
  
  useEffect(() => {
    setCategory(initialValues || { name: '', description: '', active: true });
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategory(prevCategory => ({
      ...prevCategory,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category.name) {
      toast.warning('Nome da categoria é obrigatório');
      return;
    }
    setLoading(true);
    try {
      if (initialValues?.id) {
        await interestsService.updateCategory(initialValues.id, category);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await interestsService.createCategory(category);
        toast.success('Categoria criada com sucesso!');
      }
      onSubmit(category);
      onCancel();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error('Erro ao salvar categoria. Tente novamente.');
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
            name="name"
            value={category.name}
            onChange={handleChange}
            placeholder="Nome da categoria"
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Descrição"
            name="description"
            value={category.description}
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
                  checked={category.active}
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

export default CategoryForm;