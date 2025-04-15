// src/components/Interests/CompactInterestsDisplay.js
import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Button, 
  IconButton, 
  Tooltip, 
  Dialog, 
  DialogTitle, 
  DialogContent,
  DialogActions,
  Collapse, 
  Divider 
} from '@mui/material';
import { 
  Edit as EditIcon, 
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { serviceLocator } from '../../core/services/BaseService';
import InterestsSection from './InterestsSection';

/**
 * Componente compacto para exibir os interesses do usuário no perfil
 * Mostra um resumo dos interesses como chips e permite edição
 */
const CompactInterestsDisplay = ({ 
  isOwnProfile = false,
  onSave = null,
  maxVisible = 5,
  openDialog,
  setOpenDialog
}) => {
  const { t } = useTranslation();
  const serviceStore = serviceLocator.get('store').getState()?.auth;
  const serviceInterests = serviceLocator.get('store').getState()?.interests;
  const { currentUser } = serviceStore;
  
  // Get user interest IDs from either new or legacy format
  const userInterestIds = useMemo(() => {
    // First try to get from the new format (array of IDs)
    if (currentUser?.interestIds && Array.isArray(currentUser.interestIds)) {
      return currentUser.interestIds;
    }
    
    // Fall back to legacy format (map of categories to arrays of interest IDs)
    if (currentUser?.interesses && typeof currentUser.interesses === 'object') {
      // Flatten the map of arrays into a single array of IDs
      return Object.values(currentUser.interesses)
        .filter(Array.isArray)
        .flat();
    }
    
    // Default to empty array if neither format is available
    return [];
  }, [currentUser]);

  const { availableInterests } = serviceInterests;
  
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Preparar os interesses do usuário para exibição
  const userInterests = useMemo(() => {
    if (!availableInterests || !currentUser || !userInterestIds.length) return [];
    
    // Mapear os IDs de interesses do usuário para os objetos completos
    const interestsWithCategories = [];
    
    availableInterests.forEach(category => {
      if (!category.interests) return;
      
      const categoryInterests = category.interests.filter(
        interest => userInterestIds.includes(interest.id)
      );
      
      if (categoryInterests.length > 0) {
        interestsWithCategories.push({
          categoryName: category.name,
          categoryId: category.id,
          interests: categoryInterests
        });
      }
    });
    
    return interestsWithCategories;
  }, [availableInterests, currentUser, userInterestIds]);
  
  // Lista plana de todos os interesses para exibição em chips
  const flattenedInterests = useMemo(() => {
    const flattened = [];
    
    userInterests.forEach(category => {
      category.interests.forEach(interest => {
        flattened.push({
          id: interest.id,
          label: interest.label,
          categoryName: category.categoryName
        });
      });
    });
    
    return flattened;
  }, [userInterests]);
  
  // Determinar quais interesses mostrar (limitado quando não expandido)
  const visibleInterests = useMemo(() => {
    if (expanded) return flattenedInterests;
    return flattenedInterests.slice(0, maxVisible);
  }, [flattenedInterests, expanded, maxVisible]);
  
  const handleExpandToggle = () => {
    setExpanded(!expanded);
  };
  
  const handleOpenEditModal = () => {
    setModalOpen(true);
  };
  
  const handleCloseEditModal = () => {
    setModalOpen(false);
  };
  
  // Renderizar mensagem se não houver interesses
  if (!flattenedInterests.length) {
    return (
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="div">
            {t('interests.title')}
          </Typography>
          
          {isOwnProfile && (
            <Tooltip title={t('interests.add')}>
              <IconButton onClick={handleOpenEditModal} size="small">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          {isOwnProfile ? t('interests.noInterestsYet') : t('interests.userHasNoInterests')}
        </Typography>
        
        {isOwnProfile && (
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleOpenEditModal}
            sx={{ mt: 1 }}
          >
            {t('interests.addInterests')}
          </Button>
        )}
        
        <Dialog
          open={modalOpen}
          onClose={handleCloseEditModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{t('interests.editInterests')}</DialogTitle>
          <DialogContent dividers>
            <InterestsSection />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditModal}>{t('common.close')}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
  
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="div">
            {t('interests.title')}
          </Typography>
        </Box>
        
        {isOwnProfile && (
          <Tooltip title={t('interests.edit')}>
            <IconButton onClick={handleOpenEditModal} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        {visibleInterests.map(interest => (
          <Tooltip key={interest.id} title={interest.categoryName}>
            <Chip 
              label={interest.label} 
              size="small"
              variant="outlined"
              sx={{ 
                borderRadius: '16px',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  transform: 'translateY(-2px)'
                }
              }}
            />
          </Tooltip>
        ))}
      </Box>
      
      {flattenedInterests.length > maxVisible && (
        <Button
          onClick={handleExpandToggle}
          size="small"
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ mt: 1 }}
        >
          {expanded 
            ? t('common.showLess') 
            : t('interests.showAllInterests', { count: flattenedInterests.length - maxVisible })}
        </Button>
      )}
      
      <Divider sx={{ mt: 2 }} />
      
      {/* Modal para editar interesses */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseEditModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('interests.editInterests')}</DialogTitle>
        <DialogContent dividers>
          <InterestsSection />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompactInterestsDisplay;