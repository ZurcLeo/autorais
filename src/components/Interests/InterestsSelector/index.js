// src/components/InterestsSelector/index.js
import React, { useEffect, useState } from 'react';
import { useInterests } from '../../../providers/InterestsProvider';
import { useInterestsActions } from '../../../hooks/interests/useInterestsActions';
import { useAuth } from '../../../providers/AuthProvider';
import SearchIcon from '../../assets/icons/search.svg';
import { Button, CircularProgress, Container } from '@mui/material';
/**
 * Componente para seleção de interesses do usuário
 */
const InterestsSelector = () => {
  const { currentUser } = useAuth();
  const { 
    availableInterests, 
    loading, 
    loadUserInterests,
    updating
  } = useInterests();
  
  const { 
    toggleInterest, 
    isInterestSelected, 
    selectAllInCategory, 
    clearAllInCategory 
  } = useInterestsActions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Carregar interesses do usuário ao montar o componente
  useEffect(() => {
    if (currentUser?.uid) {
      loadUserInterests();
    }
  }, [currentUser?.uid, loadUserInterests]);
  
  // Expandir todas as categorias inicialmente
  useEffect(() => {
    if (availableInterests?.length > 0) {
      const initialExpandedState = {};
      availableInterests.forEach(category => {
        initialExpandedState[category.id] = true;
      });
      setExpandedCategories(initialExpandedState);
    }
  }, [availableInterests]);
  
  // Alternar expansão da categoria
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  // Filtra interesses com base na pesquisa
  const getFilteredInterests = () => {
    if (!availableInterests) return [];
    if (!searchTerm.trim()) return availableInterests;
    
    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    return availableInterests
      .map(category => {
        // Filtrar interesses da categoria
        const filteredInterests = category.interests.filter(interest => 
          interest.label.toLowerCase().includes(normalizedSearch)
        );
        
        // Retornar categoria apenas se tiver interesses após filtro
        if (filteredInterests.length > 0) {
          return {
            ...category,
            interests: filteredInterests
          };
        }
        return null;
      })
      .filter(Boolean); // Remover categorias sem interesses
  };
  
  // Verificar se todos os interesses de uma categoria estão selecionados
  const areAllSelected = (categoryId, interests) => {
    if (!interests || interests.length === 0) return false;
    return interests.every(interest => isInterestSelected(interest.id));
  };
  
  // Verificar se alguns interesses da categoria estão selecionados
  const areSomeSelected = (categoryId, interests) => {
    if (!interests || interests.length === 0) return false;
    return interests.some(interest => isInterestSelected(interest.id)) && 
           !interests.every(interest => isInterestSelected(interest.id));
  };
  
  const filteredInterests = getFilteredInterests();
  
  // Renderizar mensagem de carregamento se necessário
  if (loading.categories || loading.user) {
    return (
      <Container className="interests-selector-loading">
        <CircularProgress />
        <p>Carregando interesses...</p>
      </Container>
    );
  }
  
  // Renderizar mensagem se não houver interesses
  if (!availableInterests || availableInterests.length === 0) {
    return (
      <Container className="interests-selector-empty">
        <p>Nenhuma categoria de interesse disponível.</p>
      </Container>
    );
  }

  return (
    <Container className="interests-selector-container">
      <Container className="interests-search">
        <Container className="search-input-container">
          <img src={SearchIcon} alt="Pesquisar" className="search-icon" />
          <input
            type="text"
            placeholder="Pesquisar interesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <Button 
              className="clear-search-btn" 
              onClick={() => setSearchTerm('')}
            >
              ×
            </Button>
          )}
        </Container>
      </Container>
      
      {updating && (
        <Container className="interests-updating-indicator">
          <LoadingSpinner size="small" />
          <span>Atualizando...</span>
        </Container>
      )}
      
      <Container className="interests-categories">
        {filteredInterests.length === 0 ? (
          <Container className="no-interests-found">
            <p>Nenhum interesse encontrado com o termo "{searchTerm}"</p>
          </Container>
        ) : (
          filteredInterests.map(category => (
            <Container key={category.id} className="interest-category">
              <Container 
                className="category-header" 
                onClick={() => toggleCategory(category.id)}
              >
                <Container className="category-title-container">
                  <h3 className="category-title">{category.name}</h3>
                  <span className="interest-count">
                    {category.interests.length} opções
                  </span>
                </Container>
                
                <Container className="category-actions">
                  {/* Checkbox para selecionar todos */}
                  <Container className="category-checkbox-container">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={areAllSelected(category.id, category.interests)}
                      onChange={() => {
                        if (areAllSelected(category.id, category.interests)) {
                          clearAllInCategory(category.id, availableInterests);
                        } else {
                          selectAllInCategory(category.id, availableInterests);
                        }
                      }}
                      className={areSomeSelected(category.id, category.interests) ? "indeterminate-checkbox" : ""}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <label 
                      htmlFor={`category-${category.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {areAllSelected(category.id, category.interests) 
                        ? "Desmarcar todos" 
                        : "Selecionar todos"}
                    </label>
                  </Container>
                  
                  <Button className="toggle-expand-btn">
                    {expandedCategories[category.id] ? "▼" : "►"}
                  </Button>
                </Container>
              </Container>
              
              {expandedCategories[category.id] && (
                <Container className="category-interests">
                  {category.interests.map(interest => (
                    <Container key={interest.id} className="interest-item">
                      <input
                        type="checkbox"
                        id={`interest-${interest.id}`}
                        checked={isInterestSelected(interest.id)}
                        onChange={() => toggleInterest(interest.id)}
                      />
                      <label htmlFor={`interest-${interest.id}`}>
                        {interest.label}
                      </label>
                      {interest.description && (
                        <span className="interest-description">
                          {interest.description}
                        </span>
                      )}
                    </Container>
                  ))}
                </Container>
              )}
            </Container>
          ))
        )}
      </Container>
      
      <Container className="interests-selector-info">
        <p>
          Selecione interesses para personalizar sua experiência e
          receber conteúdo mais relevante para você.
        </p>
      </Container>
    </Container>
  );
};

export default InterestsSelector;