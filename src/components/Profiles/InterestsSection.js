import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  IconButton, 
  Dialog, 
  DialogContent, 
  DialogActions, 
  Button, 
  FormGroup, 
  FormControlLabel, 
  Checkbox, 
  Tooltip,
  CircularProgress
} from '@mui/material';
import { Interests as InterestsIcon, Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/_AuthContext';
import { useInterests } from '../../context/InterestsContext';
import { useTranslation } from 'react-i18next';

const InterestsSection = ({ 
  openDialog, 
  setOpenDialog, 
  shouldReloadInterests, 
  setShouldReloadInterests 
}) => {
  // Hooks e Context
  const {currentUser} = useAuth();
  const { interestsLists, updateInterests } = useInterests();
  const { setCurrentUser, updateUser } = useUser();
  const { t } = useTranslation();

  // Estado local
  const [tempInterests, setTempInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função auxiliar para mapear tipos de interesse
  const getInterestsListType = (field) => {
    switch(field) {
      case 'interessesPessoais':
        return 'pessoais';
      case 'interessesNegocios':
        return 'negocios';
      default:
        return field;
    }
  };

  // Efeito para controle de carregamento inicial
  useEffect(() => {
    const checkData = () => {
      console.log('currentUser:', currentUser);
      console.log('interestsLists:', interestsLists);
      // Verifica se temos as informações necessárias
      if (!currentUser) {
        console.log('Aguardando dados do usuário...');
        return false;
      }

      if (!interestsLists || !Object.keys(interestsLists).length) {
        console.log('Aguardando lista de interesses...');
        return false;
      }

      // Verifica se as listas de interesses têm conteúdo
      if (!Array.isArray(interestsLists.pessoais) || !Array.isArray(interestsLists.negocios)) {
        console.log('Estrutura de interesses incompleta...');
        return false;
      }

      return true;
    };

    const dataReady = checkData();
    setLoading(!dataReady);
  }, [currentUser, interestsLists]);

  // Handlers
  const handleOpenDialog = (field) => {
    if (!currentUser) {
      toast.error(t('errors.userNotFound'));
      return;
    }
    
    setOpenDialog(field);
    const currentInterests = Array.isArray(currentUser[field]) 
      ? currentUser[field] 
      : [];
    setTempInterests(currentInterests);
  };

  const handleCloseDialog = () => {
    setOpenDialog(null);
    setTempInterests([]);
    setShouldReloadInterests(true);
  };

  const handleInterestsChange = (label) => {
    const updatedInterests = tempInterests.includes(label)
      ? tempInterests.filter((interest) => interest !== label)
      : [...tempInterests, label];
    setTempInterests(updatedInterests);
  };

  const handleSave = async () => {
    if (!currentUser?.uid) {
      toast.error(t('errors.userNotFound'));
      return;
    }

    try {
      setLoading(true); // Adicionar indicador de loading

      const updatedUserData = {
        ...currentUser,
        [openDialog]: tempInterests
      };

      // Atualizar no backend
      await updateUser(currentUser.uid, updatedUserData);
      
      // Atualizar estado local
      setCurrentUser(updatedUserData);

      // Atualizar interesses globais
      if (openDialog === 'interessesPessoais') {
        await updateInterests('pessoais', tempInterests);
      } else if (openDialog === 'interessesNegocios') {
        await updateInterests('negocios', tempInterests);
      }

      // Mostrar feedback de sucesso
      toast.success(t('interests.success'));
      
      // Forçar atualização dos dados
      setShouldReloadInterests(true);
      
      // Fechar o modal
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar interesses:', error);
      toast.error(t('interests.error'));
    } finally {
      setLoading(false);
    }
  };


  const getInterestsList = (field) => {
    const type = field === 'interessesPessoais' ? 'pessoais' : 'negocios';
    return Array.isArray(interestsLists?.[type]) ? interestsLists[type] : [];
  };  

  // Função de renderização dos interesses com tratamento de erros
  const renderInterests = (label, field) => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" py={3}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="textSecondary" ml={2}>
            {t('common.loading')}
          </Typography>
        </Box>
      );
    }

    const interests = currentUser[field] || [];
    const availableInterests = getInterestsList(field);

    return (
      <Box mb={3}>
        <Box display="flex" alignItems="center" mb={1}>
          <InterestsIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" color="primary">{label}</Typography>
          <Tooltip title={t('interests.addRemove')}>
            <IconButton 
              size="small" 
              onClick={() => handleOpenDialog(field)} 
              sx={{ ml: 'auto' }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {interests.length > 0 ? (
            interests.map((interest) => {
              const translatedInterest = availableInterests.find(i => i.value === interest);
              return (
                <Chip
                  key={interest}
                  label={translatedInterest ? translatedInterest.label : interest}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              );
            })
          ) : (
            <Typography variant="body2" color="textSecondary">
              {t('interests.noInterests')}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  // Renderização do componente
  return (
    <Box>
      {renderInterests(t('interests.personal'), 'interessesPessoais')}
      {renderInterests(t('interests.business'), 'interessesNegocios')}
      
      {/* Diálogo de edição de interesses */}
      <Dialog 
        open={!!openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Typography variant="h6" mb={2}>
            {openDialog === 'interessesPessoais' 
              ? t('interests.personal') 
              : t('interests.business')}
          </Typography>
          <FormGroup>
            {openDialog && interestsLists[getInterestsListType(openDialog)]?.map((interest) => (
              <FormControlLabel
                key={interest.value}
                control={
                  <Checkbox
                    checked={Array.isArray(tempInterests) && tempInterests.includes(interest.value)}
                    onChange={() => handleInterestsChange(interest.value)}
                  />
                }
                label={interest.label}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} color="primary">
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InterestsSection;