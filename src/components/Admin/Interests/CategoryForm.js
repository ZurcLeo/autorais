import React, { useState, useEffect, useCallback } from 'react';
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
  Typography,
  Divider,
  Paper,
  Tooltip,
  IconButton,
  Fade,
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Esquema de validação
const validationSchema = Yup.object({
  name: Yup.string()
    .required('Nome é obrigatório')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  description: Yup.string()
    .max(200, 'Descrição deve ter no máximo 200 caracteres'),
});

const CategoryForm = ({ initialValues, onSubmit, onCancel }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const interestsService = serviceLocator.get('interests');

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      active: true,
      ...initialValues
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (initialValues?.id) {
          await interestsService.updateCategory(initialValues.id, values);
          toast.success('Categoria atualizada com sucesso!');
        } else {
          await interestsService.createCategory(values);
          toast.success('Categoria criada com sucesso!');
        }
        
        setShowSuccess(true);
        setTimeout(() => {
          onSubmit({ ...values });
          onCancel();
        }, 1000);
      } catch (error) {
        console.error('Erro ao salvar categoria:', error);
        toast.error(error.message || 'Erro ao salvar categoria. Tente novamente.');
      } finally {
        setLoading(false);
      }
    },
  });

  // Reset form when initialValues change
  useEffect(() => {
    formik.resetForm({
      values: {
        name: '',
        description: '',
        active: true,
        ...initialValues
      }
    });
  }, [initialValues]);

  const handleCancel = useCallback(() => {
    if (formik.dirty) {
      if (window.confirm('Tem certeza que deseja cancelar? As alterações não serão salvas.')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  }, [formik.dirty, onCancel]);

  if (showSuccess) {
    return (
      <Fade in={showSuccess}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            textAlign: 'center',
            height: '100%'
          }}
        >
          <CheckCircleIcon
            sx={{
              fontSize: 60,
              color: theme.palette.success.main,
              mb: 2
            }}
          />
          <Typography variant="h6" gutterBottom>
            {initialValues?.id ? 'Categoria atualizada!' : 'Categoria criada!'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecionando...
          </Typography>
        </Box>
      </Fade>
    );
  }

  return (
    <Paper
      component="form"
      onSubmit={formik.handleSubmit}
      sx={{
        mt: 2,
        p: 3,
        borderRadius: 2,
        boxShadow: theme.shadows[2],
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2
        }}
      >
        <Typography variant="h6" component="h2">
          {initialValues?.id ? 'Editar Categoria' : 'Nova Categoria'}
        </Typography>
        <Tooltip title="Informações">
          <IconButton>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Nome da categoria"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            placeholder="Ex: Esportes, Tecnologia..."
            variant="outlined"
            InputProps={{
              endAdornment: formik.values.name && !formik.errors.name ? (
                <CheckCircleIcon color="success" fontSize="small" />
              ) : null
            }}
            autoFocus
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={6}
            label="Descrição"
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
            placeholder="Descreva esta categoria (opcional)"
            variant="outlined"
            inputProps={{
              maxLength: 200
            }}
            FormHelperTextProps={{
              sx: { textAlign: 'right' }
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}
          >
            {formik.values.description.length}/200 caracteres
          </Typography>
        </Grid>
        
        {initialValues?.id && (
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  name="active"
                  checked={formik.values.active}
                  onChange={formik.handleChange}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography>Status</Typography>
                  <Tooltip title="Categorias inativas não serão exibidas para os usuários">
                    <InfoIcon fontSize="small" sx={{ ml: 1, color: 'action.active' }} />
                  </Tooltip>
                </Box>
              }
              sx={{ userSelect: 'none' }}
            />
          </Grid>
        )}
        
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-end',
              pt: 2,
              borderTop: `1px solid ${theme.palette.divider}`
            }}
          >
            <Button
              type="button"
              onClick={handleCancel}
              variant="outlined"
              disabled={loading}
              startIcon={<CancelIcon />}
              sx={{ minWidth: 120 }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !formik.dirty}
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : initialValues?.id ? (
                  <SaveIcon />
                ) : (
                  <AddIcon />
                )
              }
              sx={{ minWidth: 140 }}
            >
              {loading ? (
                'Salvando...'
              ) : initialValues?.id ? (
                'Salvar Alterações'
              ) : (
                'Criar Categoria'
              )}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CategoryForm;