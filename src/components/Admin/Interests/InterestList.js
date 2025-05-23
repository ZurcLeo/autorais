import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useInterests } from '../../../providers/InterestsProvider';
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
  Typography,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import LabelImportantIcon from '@mui/icons-material/LabelImportant';

const InterestList = ({ interests, categories, onDataUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [editingInterestId, setEditingInterestId] = useState(null);
  const [editingInterest, setEditingInterest] = useState(null);
  const interestsService = useInterests();

  const startEditInterest = (interest) => {
    setEditingInterestId(interest.id);
    setEditingInterest({ ...interest, active: !!interest.active }); // Ensure boolean value
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
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Gerenciar Interesses Existentes
      </Typography>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      {interests.length === 0 ? (
        <Typography color="textSecondary">Nenhum interesse cadastrado ainda.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="tabela de interesses">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography fontWeight="bold">Nome</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight="bold">Categoria</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight="bold">Descrição</Typography>
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
              {interests.map((interest) => (
                <TableRow
                  key={interest.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  {editingInterestId === interest.id ? (
                    <TableCell colSpan={5} sx={{ py: 2 }}>
                      <InterestForm
                        initialValues={editingInterest}
                        categories={categories}
                        onSubmit={(data) => saveEditInterest(interest.id, data)}
                        onCancel={cancelEditInterest}
                        submitText="Salvar"
                        cancelText="Cancelar"
                      />
                    </TableCell>
                  ) : (
                    <>
                      <TableCell component="th" scope="row">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <LabelImportantIcon color="primary" size="small" />
                          <Typography>{interest.label}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography color="textSecondary">{interest.categoryName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography color="textSecondary">
                          {interest.description || <Typography variant="italic" color="textSecondary">Sem descrição</Typography>}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={interest.active ? 'Desativar' : 'Ativar'}>
                          <Switch
                            checked={!!interest.active} // Ensure boolean comparison
                            onChange={() => toggleInterestActive(interest.id, !!interest.active)}
                            inputProps={{ 'aria-label': 'alterar status do interesse' }}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                          <Tooltip title="Editar">
                            <IconButton onClick={() => startEditInterest(interest)}>
                              <EditIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={interest.active ? 'Desativar' : 'Ativar'}>
                            <IconButton
                              color={interest.active ? 'warning' : 'success'}
                              onClick={() => toggleInterestActive(interest.id, !!interest.active)}
                            >
                              {interest.active ? <VisibilityOffIcon /> : <VisibilityIcon />}
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

export default InterestList;