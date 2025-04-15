import React, { useState } from 'react';
import { serviceLocator } from '../../../core/services/BaseService';
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'; // Consider using a more appropriate icon for activate/deactivate

const CategoryList = ({ categories, onDataUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const interestsService = serviceLocator('interestsService')

  const startEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setEditingCategory({
      name: category.name,
      description: category.description || '',
      active: category.active !== false
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
    <Box sx={{ mt: 2 }}>
      <h4>Categorias Existentes</h4>
      {loading && <CircularProgress />}
      {categories.length === 0 ? (
        <p>Nenhuma categoria encontrada.</p>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="category table">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Interesses</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map(category => (
                <TableRow
                  key={category.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  {editingCategoryId === category.id ? (
                    <TableCell colSpan={5}>
                      <CategoryForm
                        initialValues={editingCategory}
                        onSubmit={(data) => saveEditCategory(category.id, data)}
                        onCancel={cancelEditCategory}
                      />
                    </TableCell>
                  ) : (
                    <>
                      <TableCell component="th" scope="row">
                        {category.name}
                      </TableCell>
                      <TableCell>{category.description || '-'}</TableCell>
                      <TableCell>{category.interests ? category.interests.length : 0}</TableCell>
                      <TableCell>
                        <Switch
                          checked={category.active !== false}
                          onChange={() => toggleCategoryActive(category.id, category.active !== false)}
                          inputProps={{ 'aria-label': 'toggle category active' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton onClick={() => startEditCategory(category)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        {/* Consider a different icon for activate/deactivate */}
                        <Tooltip title={category.active !== false ? 'Desativar' : 'Ativar'}>
                          <IconButton
                            color={category.active !== false ? 'error' : 'success'}
                            onClick={() => toggleCategoryActive(category.id, category.active !== false)}
                          >
                            <DeleteIcon /> {/* Or a different icon like VisibilityOffIcon/VisibilityIcon */}
                          </IconButton>
                        </Tooltip>
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