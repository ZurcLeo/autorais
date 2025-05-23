import React, { useState } from 'react';
import { toast } from 'react-toastify';
import CategoryForm from './CategoryForm';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Switch,
  Tooltip,
  Box,
  CircularProgress,
  Typography,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LabelImportantIcon from '@mui/icons-material/LabelImportant';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import { useInterests } from '../../../providers/InterestsProvider';

const CategoryList = ({ categories, onDataUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const interestsService = useInterests();

  const startEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setEditingCategory({
      name: category.name,
      description: category.description || '',
      active: !!category.active, // Ensure boolean value
    });
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditingCategory(null);
  };

  const saveEditCategory = async (categoryId, categoryData) => {
    setLoading(true);
    try {
      await interestsService.updateCategory(categoryId, categoryData);
      toast.success('Categoria atualizada com sucesso!');
      cancelEditCategory();
      onDataUpdated();
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast.error('Erro ao atualizar categoria. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryActive = async (categoryId, currentActive) => {
    setLoading(true);
    try {
      await interestsService.updateCategory(categoryId, { active: !currentActive });
      toast.success(`Categoria ${!currentActive ? 'ativada' : 'desativada'} com sucesso!`);
      onDataUpdated();
    } catch (error) {
      console.error('Erro ao atualizar status da categoria:', error);
      toast.error('Erro ao atualizar status da categoria. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Gerenciar Categorias Existentes
      </Typography>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      {categories.length === 0 ? (
        <Typography color="textSecondary">Nenhuma categoria cadastrada ainda.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="tabela de categorias">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography fontWeight="bold">Nome</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight="bold">Descrição</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography fontWeight="bold">Interesses</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography fontWeight="bold">Status</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">Ações</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow
                  key={category.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  {editingCategoryId === category.id ? (
                    <TableCell colSpan={5} sx={{ py: 2 }}>
                      <CategoryForm
                        initialValues={editingCategory}
                        onSubmit={(data) => saveEditCategory(category.id, data)}
                        onCancel={cancelEditCategory}
                        submitText="Salvar"
                        cancelText="Cancelar"
                      />
                    </TableCell>
                  ) : (
                    <>
                      <TableCell component="th" scope="row">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <LabelImportantIcon color="primary" size="small" />
                          <Typography>{category.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography color="textSecondary">
                          {category.description || <Typography variant="italic" color="textSecondary">Sem descrição</Typography>}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5}>
                          <PlaylistAddCheckIcon color="action" size="small" />
                          <Typography color="textSecondary">{category.interests ? category.interests.length : 0}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={category.active ? 'Desativar' : 'Ativar'}>
                          <Switch
                            checked={!!category.active} // Ensure boolean comparison
                            onChange={() => toggleCategoryActive(category.id, !!category.active)}
                            inputProps={{ 'aria-label': 'alterar status da categoria' }}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                          <Tooltip title="Editar">
                            <IconButton onClick={() => startEditCategory(category)}>
                              <EditIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={category.active ? 'Desativar' : 'Ativar'}>
                            <IconButton
                              color={category.active ? 'warning' : 'success'}
                              onClick={() => toggleCategoryActive(category.id, !!category.active)}
                            >
                              {category.active ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default CategoryList;