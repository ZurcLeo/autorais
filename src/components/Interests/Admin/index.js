import React, { useEffect, useState } from 'react';
import { serviceLocator } from '../../../core/services/BaseService.js';
import { toast } from 'react-toastify';
import { CircularProgress, Box, Button } from '@mui/material';

import CategoryList from './CategoryList';
import CategoryForm from './CategoryForm';
import InterestList from './InterestList';
import InterestForm from './InterestForm';
import InterestStats from './InterestStats';
import MigrationTools from './MigrationTools';
import AdminTabs from './AdminTabs.js';

const AdminInterestsPanel = () => {
  const interestsService = serviceLocator('interestsService')

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('categories');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingInterest, setIsCreatingInterest] = useState(false);

  const loadData = async (tab = activeTab) => {
    setLoading(true);
    try {
      const interestsData = await interestsService.fetchAvailableInterests();
      setCategories(interestsData.data || []);
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

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await interestsService.getInterestStats();
      console.log('Interesses recebidos pelo servidor:', statsData);
      setStats(statsData?.data || []);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
    return categories?.find(category => category.id === categoryId);
  };

  const allInterests = categories?.reduce((acc, category) => {
    if (category.interests && Array.isArray(category.interests)) {
      return acc.concat(category.interests.map(interest => ({ ...interest, categoryName: category.name })));
    }
    return acc;
  }, []);

  return (
    <Box sx={{ p: 3 }}>
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
          {categories && <CategoryList categories={categories} onDataUpdated={() => loadData('categories')} />}
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
              categories={categories}
              onInterestCreated={handleInterestCreated}
              onCancel={() => setIsCreatingInterest(false)}
            />
          )}
          {allInterests && categories && (
            <InterestList
              interests={allInterests}
              categories={categories}
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