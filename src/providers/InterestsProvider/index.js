// src/providers/InterestsProvider/index.js
import React, { createContext, useState, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { serviceLocator, serviceEventHub } from '../../core/services/BaseService';
import { initialInterestsState } from '../../core/constants/initialState.js';
import { interestsReducer } from '../../reducers/interests/interestsReducer.js';
import { INTERESTS_ACTIONS } from '../../core/constants/actions.js';
import { toast } from 'react-toastify';

const InterestsContext = createContext(null);
const MODULE_NAME = 'interests';

/**
 * Provedor de interesses para o frontend
 * Gerencia o estado global dos interesses do usuário e disponíveis
 */
export const InterestsProvider = ({ children }) => {
  console.log('InterestsProvider: Iniciando renderização');
  
  // Always define hooks at the top level, outside of any conditional blocks
  const [state, dispatch] = useReducer(interestsReducer, initialInterestsState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Get necessary services
  let interestsService;
  let serviceStore;
  try {
    interestsService = serviceLocator.get('interests');
    serviceStore = serviceLocator.get('store').getState()?.auth;

  } catch (err) {
    console.error('Error accessing services:', err);
    setError(err);
  }

  const { currentUser } = serviceStore || {};
  
  // Listener para os eventos do serviço
  useEffect(() => {
    if (!interestsService) return;

    const unsubscribeFetchCategoriesSuccess = serviceEventHub.on(
      MODULE_NAME,
      'FETCH_CATEGORIES_SUCCESS',
      (categories) => {
        dispatch({ 
          type: INTERESTS_ACTIONS.FETCH_CATEGORIES_SUCCESS, 
          payload: categories
        });
      }
    );

    const unsubscribeFetchCategoriesFailure = serviceEventHub.on(
      MODULE_NAME,
      'FETCH_CATEGORIES_FAILURE',
      (error) => {
        dispatch({ 
          type: INTERESTS_ACTIONS.FETCH_CATEGORIES_FAILURE, 
          payload: error.error || error 
        });
        
        toast.error('Erro ao carregar categorias de interesses.');
      }
    );

    // Eventos para interesses do usuário
    const unsubscribeFetchUserInterestsStart = serviceEventHub.on(
      MODULE_NAME,
      'FETCH_USER_INTERESTS_START',
      () => {
        dispatch({ type: INTERESTS_ACTIONS.FETCH_USER_INTERESTS_START });
      }
    );

    const unsubscribeFetchUserInterestsSuccess = serviceEventHub.on(
      MODULE_NAME,
      'FETCH_USER_INTERESTS_SUCCESS',
      (interests) => {
        dispatch({ 
          type: INTERESTS_ACTIONS.FETCH_USER_INTERESTS_SUCCESS, 
          payload: interests 
        });
      }
    );

    const unsubscribeFetchUserInterestsFailure = serviceEventHub.on(
      MODULE_NAME,
      'FETCH_USER_INTERESTS_FAILURE',
      (error) => {
        dispatch({ 
          type: INTERESTS_ACTIONS.FETCH_USER_INTERESTS_FAILURE, 
          payload: error.error || error 
        });
      }
    );

    // Eventos para atualização de interesses
    const unsubscribeUpdateInterestsStart = serviceEventHub.on(
      MODULE_NAME,
      'UPDATE_START',
      () => {
        dispatch({ type: INTERESTS_ACTIONS.UPDATE_INTERESTS_START });
      }
    );

    const unsubscribeUpdateInterestsSuccess = serviceEventHub.on(
      MODULE_NAME,
      INTERESTS_ACTIONS.UPDATE_INTERESTS_SUCCESS,
      (interests) => {
        dispatch({ 
          type: INTERESTS_ACTIONS.UPDATE_INTERESTS_SUCCESS, 
          payload: interests 
        });
        
        toast.success('Seus interesses foram atualizados com sucesso!');
      }
    );

    const unsubscribeUpdateInterestsFailure = serviceEventHub.on(
      MODULE_NAME,
      INTERESTS_ACTIONS.UPDATE_INTERESTS_FAILURE,
      (error) => {
        dispatch({ 
          type: INTERESTS_ACTIONS.UPDATE_INTERESTS_FAILURE, 
          payload: error.error || error 
        });
        
        toast.error('Erro ao atualizar seus interesses. Tente novamente.');
      }
    );

    return () => {
      unsubscribeFetchCategoriesSuccess();
      unsubscribeFetchCategoriesFailure();
      unsubscribeFetchUserInterestsStart();
      unsubscribeFetchUserInterestsSuccess();
      unsubscribeFetchUserInterestsFailure();
      unsubscribeUpdateInterestsStart();
      unsubscribeUpdateInterestsSuccess();
      unsubscribeUpdateInterestsFailure();
    };
  }, []);

  // Efeito para carregar interesses do usuário quando o usuário muda
  useEffect(() => {
    if (currentUser?.uid && interestsService) {
      loadUserInterests();
    }
  }, [currentUser?.uid]);

  // Carregar interesses do usuário atual
  const loadUserInterests = useCallback(async () => {
    if (!interestsService || !currentUser?.uid) {
      return;
    }
    
    try {
      await interestsService.fetchUserInterests(currentUser.uid);
      // O evento de sucesso será capturado pelo listener
    } catch (error) {
      console.error('Erro ao carregar interesses do usuário:', error);
      toast.error('Erro ao carregar seus interesses. Tente novamente.');
    }
  }, [currentUser?.uid, interestsService]);

  // Atualizar interesses do usuário
  const updateUserInterests = useCallback(async (selectedInterestIds) => {
    if (!interestsService || !currentUser?.uid) {
      return;
    }
    
    try {
      await interestsService.updateUserInterests(currentUser.uid, selectedInterestIds);
      // O evento de sucesso será capturado pelo listener
    } catch (error) {
      console.error('Erro ao atualizar interesses do usuário:', error);
      // O erro será tratado pelo listener
    }
  }, [currentUser?.uid, interestsService]);

  // Forçar atualização de interesses disponíveis
  const refreshAvailableInterests = useCallback(async () => {
    if (!interestsService) return;

    try {
      await interestsService.fetchAvailableInterests();
      // O evento de sucesso será capturado pelo listener
    } catch (error) {
      console.error('Erro ao buscar interesses disponíveis:', error);
      // O erro será tratado pelo listener
    }
  }, [interestsService]);

  // Buscar interesses sugeridos
  const fetchSuggestedInterests = useCallback(async (limit = 10) => {
    if (!interestsService) return [];

    try {
      return await interestsService.getSuggestedInterests(limit);
    } catch (error) {
      console.error('Erro ao buscar interesses sugeridos:', error);
      toast.error('Erro ao carregar sugestões de interesses.');
      return [];
    }
  }, [interestsService]);

  // Buscar interesses em tendência
  const fetchTrendingInterests = useCallback(async (limit = 10) => {
    if (!interestsService) return [];

    try {
      return await interestsService.getTrendingInterests(limit);
    } catch (error) {
      console.error('Erro ao buscar interesses em tendência:', error);
      toast.error('Erro ao carregar interesses em alta.');
      return [];
    }
  }, [interestsService]);

  // Atualizar interesses selecionados localmente (sem persistir)
  const updateSelectedInterests = useCallback((interestIds) => {
    dispatch({
      type: INTERESTS_ACTIONS.UPDATE_SELECTED_INTERESTS,
      payload: interestIds
    });
  }, []);

  // Memoizar o valor do contexto para evitar renderizações desnecessárias
  const value = useMemo(() => ({
    // Estado
    userInterests: state.userInterests,
    availableInterests: state.availableInterests,
    selectedInterests: state.selectedInterests,
    loading: {
      userInterests: state.loading.userInterests,
      availableInterests: state.loading.availableInterests,
      updateInterests: state.loading.updateInterests
    },
    errors: state.errors,
    lastUpdated: state.lastUpdated,
    
    // Flags de conveniência para uso em componentes
    userInLoading: state.loading.userInterests,
    categoriesInLoading: state.loading.availableInterests,
    updating: state.loading.updateInterests,

    // Ações
    loadUserInterests,
    updateUserInterests,
    refreshAvailableInterests,
    fetchSuggestedInterests,
    fetchTrendingInterests,
    updateSelectedInterests,
    
    // Acesso direto ao dispatch (uso avançado)
    dispatch
  }), [
    state.userInterests,
    state.availableInterests,
    state.selectedInterests,
    state.loading,
    state.errors,
    state.lastUpdated,
    loadUserInterests,
    updateUserInterests,
    refreshAvailableInterests,
    fetchSuggestedInterests,
    fetchTrendingInterests,
    updateSelectedInterests
  ]);

  console.log('InterestsProvider: Pronto para renderizar');

  // If we had an error initializing the services, show an error UI
  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#ffeeee' }}>
        <h3>Erro no InterestsProvider</h3>
        <pre>{error.toString()}</pre>
      </div>
    );
  }

  return (
    <InterestsContext.Provider value={value}>
      {children}
    </InterestsContext.Provider>
  );
};

/**
 * Hook para usar o contexto de interesses
 */
export const useInterests = () => {
  const context = useContext(InterestsContext);

  if (!context) {
    throw new Error('useInterests deve ser usado dentro de um InterestsProvider');
  }

  return context;
};

/**
 * Função auxiliar para converter interesses da API para formato de seleção
 * @param {Array} apiInterests - Interesses do usuário no formato da API
 * @returns {Array} - Array de IDs de interesses selecionados
 */
export const mapApiInterestsToSelectedFormat = (apiInterests) => {
  if (!apiInterests || !Array.isArray(apiInterests)) {
    return [];
  }
  
  const selectedIds = [];
  
  // Para cada categoria
  apiInterests.forEach(category => {
    // Para cada interesse na categoria
    if (category.interests && Array.isArray(category.interests)) {
      category.interests.forEach(interest => {
        if (interest.id) {
          selectedIds.push(interest.id);
        }
      });
    }
  });
  
  return selectedIds;
};

/**
 * Função auxiliar para agrupar interesses por categoria
 * @param {Array} interestIds - IDs de interesses selecionados
 * @param {Array} availableInterests - Categorias com interesses disponíveis
 * @returns {Array} - Interesses agrupados por categoria
 */
export const groupInterestsByCategory = (interestIds, availableInterests) => {
  if (!interestIds || !availableInterests) {
    return [];
  }
  
  return availableInterests.map(category => {
    const selectedInterests = category.interests.filter(
      interest => interestIds.includes(interest.id)
    );
    
    return {
      ...category,
      interests: selectedInterests
    };
  }).filter(category => category.interests.length > 0);
};