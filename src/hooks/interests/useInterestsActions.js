// src/hooks/interests/useInterestsActions.js
import { useCallback } from 'react';
import { useInterests } from '../../providers/InterestsProvider';
import { useAuth } from '../../providers/AuthProvider';
import { interestsService } from '../../services';
import * as actions from '../../core/constants/actions';
import { showPromiseToast } from '../../utils/toast';

/**
 * Hook que fornece ações relacionadas a interesses
 * Simplifica a manipulação de interesses em componentes
 */
export const useInterestsActions = () => {
  const { selectedInterests, dispatch } = useInterests();
  const { currentUser } = useAuth();

  /**
   * Atualiza os interesses selecionados localmente
   * @param {Array} newSelectedInterests - Nova lista de IDs de interesses selecionados
   */
  const updateSelectedInterests = useCallback((newSelectedInterests) => {
    dispatch({
      type: actions.INTERESTS_ACTIONS.UPDATE_SELECTED_INTERESTS,
      payload: newSelectedInterests
    });
  }, [dispatch]);

  /**
   * Alterna um interesse entre selecionado e não selecionado
   * Atualiza localmente e persiste no backend
   * @param {string} interestId - ID do interesse a ser alternado
   * @returns {Promise} - Promessa da operação
   */
  const toggleInterest = useCallback((interestId) => {
    if (!currentUser?.uid) {
      return Promise.reject(new Error('Usuário não autenticado'));
    }
    
    // Criar uma nova lista com ou sem o interesse
    const newSelectedInterests = selectedInterests.includes(interestId)
      ? selectedInterests.filter(id => id !== interestId)
      : [...selectedInterests, interestId];
    
    // Atualizar estado local primeiro para feedback imediato
    updateSelectedInterests(newSelectedInterests);
    
    // Mostrar toast de carregamento e persistir no backend
    return showPromiseToast(
      interestsService.updateUserInterests(currentUser.uid, newSelectedInterests),
      {
        pending: 'Atualizando seus interesses...',
        success: 'Interesses atualizados com sucesso!',
        error: 'Erro ao atualizar interesses'
      }
    ).catch(error => {
      console.error('Erro ao atualizar interesses:', error);
      
      // Reverter mudança local em caso de erro
      updateSelectedInterests(selectedInterests);
      
      // Propagar erro
      throw error;
    });
  }, [currentUser?.uid, selectedInterests, updateSelectedInterests]);

  /**
   * Verifica se um interesse está selecionado
   * @param {string} interestId - ID do interesse a verificar
   * @returns {boolean} - True se estiver selecionado
   */
  const isInterestSelected = useCallback((interestId) => {
    return selectedInterests.includes(interestId);
  }, [selectedInterests]);

  /**
   * Seleciona todos os interesses de uma categoria
   * @param {string} categoryId - ID da categoria
   * @param {Array} availableInterests - Lista de interesses disponíveis
   */
  const selectAllInCategory = useCallback((categoryId, availableInterests) => {
    if (!availableInterests) return;
    
    // Encontrar a categoria
    const category = availableInterests.find(cat => cat.id === categoryId);
    if (!category || !category.interests) return;
    
    // Obter todos os IDs de interesses da categoria
    const categoryInterestIds = category.interests.map(interest => interest.id);
    
    // Adicionar novos interesses mantendo os existentes de outras categorias
    const newSelectedInterests = [
      ...selectedInterests.filter(id => !categoryInterestIds.includes(id)),
      ...categoryInterestIds
    ];
    
    // Atualizar no backend
    if (currentUser?.uid) {
      showPromiseToast(
        interestsService.updateUserInterests(currentUser.uid, newSelectedInterests),
        {
          pending: 'Atualizando seus interesses...',
          success: 'Interesses atualizados com sucesso!',
          error: 'Erro ao atualizar interesses'
        }
      ).then(() => {
        updateSelectedInterests(newSelectedInterests);
      }).catch(error => {
        console.error('Erro ao selecionar todos os interesses da categoria:', error);
      });
    }
  }, [currentUser?.uid, selectedInterests, updateSelectedInterests]);

  /**
   * Remove todos os interesses de uma categoria
   * @param {string} categoryId - ID da categoria
   * @param {Array} availableInterests - Lista de interesses disponíveis
   */
  const clearAllInCategory = useCallback((categoryId, availableInterests) => {
    if (!availableInterests) return;
    
    // Encontrar a categoria
    const category = availableInterests.find(cat => cat.id === categoryId);
    if (!category || !category.interests) return;
    
    // Obter todos os IDs de interesses da categoria
    const categoryInterestIds = category.interests.map(interest => interest.id);
    
    // Manter apenas interesses de outras categorias
    const newSelectedInterests = selectedInterests.filter(
      id => !categoryInterestIds.includes(id)
    );
    
    // Atualizar no backend
    if (currentUser?.uid) {
      showPromiseToast(
        interestsService.updateUserInterests(currentUser.uid, newSelectedInterests),
        {
          pending: 'Atualizando seus interesses...',
          success: 'Interesses atualizados com sucesso!',
          error: 'Erro ao atualizar interesses'
        }
      ).then(() => {
        updateSelectedInterests(newSelectedInterests);
      }).catch(error => {
        console.error('Erro ao remover todos os interesses da categoria:', error);
      });
    }
  }, [currentUser?.uid, selectedInterests, updateSelectedInterests]);

  return {
    updateSelectedInterests,
    toggleInterest,
    isInterestSelected,
    selectAllInCategory,
    clearAllInCategory
  };
};