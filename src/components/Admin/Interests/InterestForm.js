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
  Paper,
  Typography,
  Divider,
  Tooltip,
  IconButton,
  Fade,
  FormHelperText
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTheme } from '@mui/material/styles';

// Esquema de validação
const validationSchema = Yup.object({
  label: Yup.string()
    .required('Nome é obrigatório')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  categoryId: Yup.string()
    .required('Categoria é obrigatória'),
  description: Yup.string()
    .max(200, 'Descrição deve ter no máximo 200 caracteres'),
});

const InterestForm = ({ initialValues, categories, onSubmit, onCancel }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const interestsService = serviceLocator.get('interests');

  const formik = useFormik({
    initialValues: {
      label: '',
      description: '',
      categoryId: '',
      active: true,
      ...initialValues
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (initialValues?.id) {
          await interestsService.updateInterest(initialValues.id, values);
          toast.success('Interesse atualizado com sucesso!');
        } else {
          await interestsService.createInterest(values);
          toast.success('Interesse criado com sucesso!');
        }
        
        setShowSuccess(true);
        setTimeout(() => {
          onSubmit(values);
          onCancel();
        }, 1000);
      } catch (error) {
        console.error('Erro ao salvar interesse:', error);
        toast.error(error.message || 'Erro ao salvar interesse. Tente novamente.');
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    formik.resetForm({
      values: {
        label: '',
        description: '',
        categoryId: '',
        active: true,
        ...initialValues
      }
    });
  }, [initialValues]);

  const handleCancel = () => {
    if (formik.dirty) {
      if (window.confirm('Tem certeza que deseja cancelar? As alterações não serão salvas.')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

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
            {initialValues?.id ? 'Interesse atualizado!' : 'Interesse criado!'}
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
          {initialValues?.id ? 'Editar Interesse' : 'Novo Interesse'}
        </Typography>
        <Tooltip title="Informações sobre interesses">
          <IconButton size="small">
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Nome do interesse"
            name="label"
            value={formik.values.label}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.label && Boolean(formik.errors.label)}
            helperText={formik.touched.label && formik.errors.label}
            placeholder="Ex: Futebol, Programação, Literatura..."
            variant="outlined"
            InputProps={{
              endAdornment: formik.values.label && !formik.errors.label ? (
                <CheckCircleIcon color="success" fontSize="small" />
              ) : null
            }}
            autoFocus
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControl fullWidth error={formik.touched.categoryId && Boolean(formik.errors.categoryId)}>
            <InputLabel id="interestCategoryLabel">Categoria *</InputLabel>
            <Select
              labelId="interestCategoryLabel"
              id="interestCategory"
              name="categoryId"
              value={formik.values.categoryId}
              label="Categoria *"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <MenuItem value="" disabled>
                Selecione uma categoria
              </MenuItem>
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.categoryId && formik.errors.categoryId && (
              <FormHelperText>{formik.errors.categoryId}</FormHelperText>
            )}
          </FormControl>
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
            placeholder="Descreva este interesse (opcional)"
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
                  <Tooltip title="Interesses inativos não serão exibidos para os usuários">
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
              disabled={loading || !formik.dirty || !formik.isValid}
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
                'Criar Interesse'
              )}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default InterestForm;