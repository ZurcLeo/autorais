import React, { useState } from 'react';
import { serviceLocator } from '../../../core/services/BaseService';
import { toast } from 'react-toastify';
import InterestForm from './InterestForm';
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

const InterestList = ({ interests, categories, onDataUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [editingInterestId, setEditingInterestId] = useState(null);
  const [editingInterest, setEditingInterest] = useState(null);
  const interestsService = serviceLocator('interestsService')

  const startEditInterest = (interest) => {
    setEditingInterestId(interest.id);
    setEditingInterest({ ...interest, active: interest.active !== false });
  };

  const cancelEditInterest = () => {
    setEditingInterestId(null);
    setEditingInterest(null);
  };

  const saveEditInterest = async (interestId, interestData) => {
    setLoading(true);
    try {
      await interestsService.updateInterest(interestId, interestData);
      toast.success('Interesse atualizado com sucesso!');
      cancelEditInterest();
      onDataUpdated();
    } catch (error) {
      console.error('Erro ao atualizar interesse:', error);
      toast.error('Erro ao atualizar interesse. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterestActive = async (interestId, currentActive) => {
    setLoading(true);
    try {
      await interestsService.updateInterest(interestId, { active: !currentActive });
      toast.success(`Interesse ${!currentActive ? 'ativado' : 'desativado'} com sucesso!`);
      onDataUpdated();
    } catch (error) {
      console.error('Erro ao atualizar status do interesse:', error);
      toast.error('Erro ao atualizar status do interesse. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <h4>Interesses Existentes</h4>
      {loading && <CircularProgress />}
      {interests.length === 0 ? (
        <p>Nenhum interesse encontrado.</p>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="interest table">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {interests.map(interest => (
                <TableRow
                  key={interest.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  {editingInterestId === interest.id ? (
                    <TableCell colSpan={5}>
                      <InterestForm
                        initialValues={editingInterest}
                        categories={categories}
                        onSubmit={(data) => saveEditInterest(interest.id, data)}
                        onCancel={cancelEditInterest}
                      />
                    </TableCell>
                  ) : (
                    <>
                      <TableCell component="th" scope="row">
                        {interest.label}
                      </TableCell>
                      <TableCell>{interest.categoryName}</TableCell>
                      <TableCell>{interest.description || '-'}</TableCell>
                      <TableCell>
                        <Switch
                          checked={interest.active !== false}
                          onChange={() => toggleInterestActive(interest.id, interest.active !== false)}
                          inputProps={{ 'aria-label': 'toggle interest active' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton onClick={() => startEditInterest(interest)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={interest.active !== false ? 'Desativar' : 'Ativar'}>
                          <IconButton
                            color={interest.active !== false ? 'error' : 'success'}
                            onClick={() => toggleInterestActive(interest.id, interest.active !== false)}
                          >
                            <DeleteIcon /> {/* Consider a different icon like VisibilityOffIcon/VisibilityIcon */}
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

export default InterestList;