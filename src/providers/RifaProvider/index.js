import React, { createContext, useContext, useReducer, useState, useCallback } from 'react';
import { serviceLocator } from '../../core/services/BaseService';
import { useToast } from '../ToastProvider';
import {rifaReducer} from '../../reducers/rifas/rifaReducer'
import { initialRifaState } from '../../core/constants/initialState';

// Contexto inicial
const RifaContext = createContext();

// Provider component
export const RifaProvider = ({ children }) => {
  const [state, dispatch] = useReducer(rifaReducer, initialRifaState);
  const { showToast } = useToast();
  
  // Obter serviço de API
  const apiService = serviceLocator.get('apiService');
  const authService = serviceLocator.get('auth')

  // Buscar todas as rifas de uma caixinha
  const getRifasByCaixinha = useCallback(async (caixinhaId) => {
    dispatch({ type: 'FETCH_START' });
    
    try {
      const response = await apiService.get(`/api/rifas/${caixinhaId}/all`);
      dispatch({ type: 'FETCH_SUCCESS', payload: response.data.data });
      return response.data.data;
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
      showToast(error.message, { type: 'error' });
      throw error;
    }
  }, [apiService, showToast]);

  // Buscar uma rifa específica
  const getRifaById = useCallback(async (caixinhaId, rifaId) => {
    dispatch({ type: 'FETCH_START' });
    
    try {
      const response = await apiService.get(`/api/rifas/${caixinhaId}/${rifaId}`);
      dispatch({ type: 'FETCH_SINGLE_SUCCESS', payload: response.data.data });
      return response.data.data;
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
      showToast(error.message, { type: 'error' });
      throw error;
    }
  }, [apiService, showToast]);

  // Criar uma nova rifa
  const createRifa = useCallback(async (caixinhaId, rifaData) => {
    dispatch({ type: 'FETCH_START' });
    
    try {
      const response = await apiService.post(`/api/rifas/${caixinhaId}`, rifaData);
      dispatch({ type: 'CREATE_RIFA_SUCCESS', payload: response.data.data });
      showToast('Rifa criada com sucesso!', { type: 'success' });
      return response.data.data;
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
      showToast(error.message, { type: 'error' });
      throw error;
    }
  }, [apiService, showToast]);

  // Atualizar uma rifa
  const updateRifa = useCallback(async (caixinhaId, rifaId, rifaData) => {
    dispatch({ type: 'FETCH_START' });
    
    try {
      const response = await apiService.put(`/api/rifas/${caixinhaId}/update/${rifaId}`, rifaData);
      dispatch({ type: 'UPDATE_RIFA_SUCCESS', payload: response.data.data });
      showToast('Rifa atualizada com sucesso!', { type: 'success' });
      return response.data.data;
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
      showToast(error.message, { type: 'error' });
      throw error;
    }
  }, [apiService, showToast]);

  // Cancelar uma rifa
  const cancelRifa = useCallback(async (caixinhaId, rifaId, motivo) => {
    dispatch({ type: 'FETCH_START' });
    
    try {
      const response = await apiService.post(`/api/rifas/${caixinhaId}/cancel/${rifaId}`, { motivo });
      dispatch({ type: 'UPDATE_RIFA_SUCCESS', payload: response.data.data });
      showToast('Rifa cancelada com sucesso!', { type: 'success' });
      return response.data.data;
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
      showToast(error.message, { type: 'error' });
      throw error;
    }
  }, [apiService, showToast]);

  // Comprar um bilhete
  const buyTicket = useCallback(async (caixinhaId, rifaId, numeroBilhete) => {
  
    dispatch({ type: 'FETCH_START' });
    
    try {

      const membroId = authService.getCurrentUser().uid;
      const response = await apiService.post(`/api/rifas/${caixinhaId}/bilhetes/${rifaId}`, { membroId, numeroBilhete });
      
      // Atualizar a rifa com o novo bilhete
      const updatedRifa = await getRifaById(caixinhaId, rifaId);
      
      showToast('Bilhete comprado com sucesso!', { type: 'success' });
      return response.data.data;
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
      showToast(error.message, { type: 'error' });
      throw error;
    }
  }, [apiService, showToast, getRifaById]);

  // Realizar sorteio
  const performDraw = useCallback(async (caixinhaId, rifaId, metodo, referencia) => {
    dispatch({ type: 'FETCH_START' });
    
    try {
      const response = await apiService.post(`/api/rifas/${caixinhaId}/sorteio/${rifaId}`, { metodo, referencia });
      dispatch({ type: 'UPDATE_RIFA_SUCCESS', payload: response.data.data });
      showToast('Sorteio realizado com sucesso!', { type: 'success' });
      return response.data.data;
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
      showToast(error.message, { type: 'error' });
      throw error;
    }
  }, [apiService, showToast]);

  // Verificar autenticidade
  const verifyAuthenticity = useCallback(async (caixinhaId, rifaId) => {
    dispatch({ type: 'FETCH_START' });
    
    try {
      const response = await apiService.get(`/api/rifas/${caixinhaId}/autenticidade/${rifaId}`);
      showToast('Verificação de autenticidade concluída!', { type: 'success' });
      return response.data.data;
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
      showToast(error.message, { type: 'error' });
      throw error;
    }
  }, [apiService, showToast]);

  const value = {
    ...state,
    getRifasByCaixinha,
    getRifaById,
    createRifa,
    updateRifa,
    cancelRifa,
    buyTicket,
    performDraw,
    verifyAuthenticity
  };

  return <RifaContext.Provider value={value}>{children}</RifaContext.Provider>;
};

// Hook personalizado para usar o contexto
export const useRifa = () => {
  const context = useContext(RifaContext);
  
  if (!context) {
    throw new Error('useRifa deve ser usado dentro de um RifaProvider');
  }
  
  return context;
};