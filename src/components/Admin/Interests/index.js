import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { CircularProgress, Box, Button } from '@mui/material';
import CategoryList from './CategoryList';
import CategoryForm from './CategoryForm';
import InterestList from './InterestList';
import InterestForm from './InterestForm';
import InterestStats from './InterestStats';
import MigrationTools from './MigrationTools.js';
import AdminTabs from './AdminTabs.js';
import { useInterests } from '../../../providers/InterestsProvider/index.js';
import { serviceLocator } from '../../../core/services/BaseService';

const AdminInterestsPanel = () => {
  // Obter dados diretamente da store (como é feito no InterestsSection)
  const serviceInterests = serviceLocator.get('store').getState()?.interests;
  
  // E também usar o hook para ações
  const { 
    loadUserInterests, 
    updateUserInterests,
    refreshAvailableInterests,
    fetchSuggestedInterests,
    fetchTrendingInterests
  } = useInterests();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('categories');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingInterest, setIsCreatingInterest] = useState(false);
  const interestsService = serviceLocator.get('interests');

  // Usar os dados da store que sabemos que funcionam
  const availableInterests = serviceInterests?.availableInterests || [];

  const loadData = async (tab = activeTab) => {
    setLoading(true);
    try {
      // Forçar refresh dos interesses disponíveis
      await refreshAvailableInterests();
      
      if (tab === 'stats') {
        loadStats();
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

// No AdminInterestsPanel.js - método loadStats
const loadStats = async () => {
  try {
    setLoading(true);
    // Tentar buscar via API oficial
    const interestsService = serviceLocator.get('interests');
    if (interestsService && interestsService.getInterestStats) {
      const response = await interestsService.getInterestStats();
      console.log('Estatísticas recebidas da API:', response);
      setStats(response?.data || null);
    } else {
      // Se não houver método, calcular estatísticas manualmente
      console.log('Calculando estatísticas manualmente...');
      
      if (!Array.isArray(availableInterests)) {
        console.error('availableInterests não é um array:', availableInterests);
        setStats(null);
        return;
      }
      
      // Buscar usuários para calcular estatísticas
      const userService = serviceLocator.get('user');
      let users = [];
      if (userService && userService.getAllUsers) {
        const usersResponse = await userService.getAllUsers();
        users = usersResponse?.data || [];
      }
      
      const totalUsers = users.length;
      
      // Calcular estatísticas
      const interestDetails = [];
      availableInterests.forEach(category => {
        if (category.interests && Array.isArray(category.interests)) {
          category.interests.forEach(interest => {
            // Contar quantos usuários têm este interesse
            const count = users.filter(user => 
              user.interesses && 
              user.interesses[category.id] && 
              user.interesses[category.id].includes(interest.id)
            ).length;
            
            interestDetails.push({
              id: interest.id,
              label: interest.label,
              categoryId: category.id,
              count: count
            });
          });
        }
      });
      
      // Formato que o InterestStats espera
      const calculatedStats = {
        totalUsers,
        interestDetails
      };
      
      console.log('Estatísticas calculadas:', calculatedStats);
      setStats(calculatedStats);
    }
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
    toast.error('Erro ao carregar estatísticas. Tente novamente.');
    setStats(null);
  } finally {
    setLoading(false);
  }
};

  // Função para calcular estatísticas a partir dos interesses disponíveis
  const calculateStatsFromAvailableInterests = (interests) => {
    // Implementação básica para gerar estatísticas
    const stats = {
      totalCategories: interests.length,
      totalInterests: interests.reduce((sum, category) => 
        sum + (category.interests?.length || 0), 0),
      interestsByCategory: interests.map(category => ({
        categoryId: category.id,
        categoryName: category.name,
        count: category.interests?.length || 0
      }))
    };
    return stats;
  };

  useEffect(() => {
    loadData();
    console.log('verificando interesses:', availableInterests);
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'stats' && !stats) {
      loadStats();
    }
    setIsCreatingCategory(false);
    setIsCreatingInterest(false);
  };

  const handleCategoryCreated = async () => {
    setIsCreatingCategory(false);
    await loadData('categories');
  };

  const handleInterestCreated = async () => {
    setIsCreatingInterest(false);
    await loadData('interests');
  };

  const findCategoryById = (categoryId) => {
    return availableInterests.find(category => category.id === categoryId);
  };

  // Garantir que availableInterests existe e é um array antes de chamar reduce
  const allInterests = Array.isArray(availableInterests) 
    ? availableInterests.reduce((acc, category) => {
        if (category.interests && Array.isArray(category.interests)) {
          return acc.concat(category.interests.map(interest => ({ 
            ...interest, 
            categoryName: category.name 
          })));
        }
        return acc;
      }, []) 
    : [];

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      padding: 2,
    }}>
      <h2>Gerenciamento de Interesses</h2>

      <AdminTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {loading && <CircularProgress />}

      {activeTab === 'categories' && (
        <Box sx={{ mt: 2 }}>
          <h3>Categorias de Interesses</h3>
          {!isCreatingCategory && (
            <Button onClick={() => setIsCreatingCategory(true)} variant="contained" color="primary">
              Adicionar Nova Categoria
            </Button>
          )}
          {isCreatingCategory && (
            <CategoryForm onCategoryCreated={handleCategoryCreated} onCancel={() => setIsCreatingCategory(false)} />
          )}
          {Array.isArray(availableInterests) && availableInterests.length > 0 && 
            <CategoryList categories={availableInterests} onDataUpdated={() => loadData('categories')} />
          }
        </Box>
      )}

      {activeTab === 'interests' && (
        <Box sx={{ mt: 2 }}>
          <h3>Interesses</h3>
          {!isCreatingInterest && (
            <Button onClick={() => setIsCreatingInterest(true)} variant="contained" color="primary">
              Adicionar Novo Interesse
            </Button>
          )}
          {isCreatingInterest && (
            <InterestForm
              categories={availableInterests || []}
              onInterestCreated={handleInterestCreated}
              onCancel={() => setIsCreatingInterest(false)}
            />
          )}
          {allInterests.length > 0 && (
            <InterestList
              interests={allInterests}
              categories={availableInterests || []}
              onDataUpdated={() => loadData('interests')}
            />
          )}
        </Box>
      )}

      {activeTab === 'stats' && (
        <Box sx={{ mt: 2 }}>
          <InterestStats stats={stats} onRefresh={loadStats} findCategoryById={findCategoryById} />
        </Box>
      )}

      {activeTab === 'migration' && (
        <Box sx={{ mt: 2 }}>
          <MigrationTools onDataUpdated={loadData} />
        </Box>
      )}
    </Box>
  );
};

export default AdminInterestsPanel;